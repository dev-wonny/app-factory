import type {
  ApplicationStatus,
  CatCard,
  MatchPost,
  PostCategory,
  PostStatus,
  Region,
  UserProfile,
} from "@/domain/types";
import type { PhoneVisibilityState } from "@/types/contracts";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { normalizePhone } from "@/features/auth/api/shared";
import {
  type RegionCode,
  regionOptions,
  type SignupFormValues,
} from "@/features/auth/types";

const STORAGE_KEY = "cat-meetup-demo-state-v1";

type DemoUser = UserProfile & {
  password: string;
  regionCode: RegionCode;
};

type DemoApplication = {
  id: string;
  applicantMessage: string;
  applicantUserId: string;
  createdAt: string;
  phoneVisibilityState: PhoneVisibilityState;
  postId: string;
  status: ApplicationStatus;
};

type DemoState = {
  applications: DemoApplication[];
  catCards: CatCard[];
  currentUserId: string | null;
  posts: MatchPost[];
  users: DemoUser[];
};

type DemoAccount = {
  hint: string;
  label: string;
  password: string;
  phone: string;
  userId: string;
};

type DemoAppliedPost = {
  hostName: string;
  hostPhone?: string;
  matchingLabel: "매칭" | "대기" | "실패";
  meetAt: string;
  myStatus: ApplicationStatus;
  phoneVisibilityState: PhoneVisibilityState;
  postId: string;
  postStatus: PostStatus;
  postTitle: string;
  region: Region;
};

type DemoMatchOffer = {
  hostName: string;
  hostPhone?: string;
  hostPhoneVisible: boolean;
  meetAt: string;
  needAccept: boolean;
  postId: string;
  postRegion: Region;
  postTitle: string;
  status: ApplicationStatus;
};

type DemoHostPost = MatchPost & {
  applicantCount: number;
  matchedCount: number;
  waitingCount: number;
};

type DemoApplicantSummary = {
  applicant: DemoUser;
  applicationId: string;
  cats: CatCard[];
  message: string;
  phoneVisible: boolean;
  status: ApplicationStatus;
};

type CreateCatCardInput = {
  age: number;
  description: string;
  gender: CatCard["gender"];
  name: string;
  neutered: boolean;
  temperament: CatCard["temperament"];
};

type CreatePostInput = {
  category: PostCategory;
  content: string;
  meetAt: string;
  region: Region;
  title: string;
};

type DemoDataContextValue = {
  appliedPosts: DemoAppliedPost[];
  applyToPost: (input: { message: string; postId: string }) => Promise<void>;
  createCatCard: (input: CreateCatCardInput) => Promise<CatCard>;
  createPost: (input: CreatePostInput) => Promise<MatchPost>;
  currentUser: DemoUser | null;
  currentUserCats: CatCard[];
  demoAccounts: DemoAccount[];
  getApplicationByPostId: (postId: string) => DemoApplication | undefined;
  getApplicantsForPost: (postId: string) => DemoApplicantSummary[];
  getPostById: (postId: string) => MatchPost | undefined;
  hostPosts: DemoHostPost[];
  isHydrated: boolean;
  matchOffers: DemoMatchOffer[];
  posts: MatchPost[];
  quickLogin: (userId: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
  signIn: (input: { password: string; phone: string }) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (input: SignupFormValues) => Promise<DemoUser>;
  chooseApplicant: (input: {
    applicantUserId: string;
    postId: string;
  }) => Promise<void>;
  acceptMatch: (postId: string) => Promise<void>;
};

const regionLabelByCode = Object.fromEntries(
  regionOptions.map((option) => [option.code, option.label]),
) as Record<RegionCode, Region>;

const seedUsers: DemoUser[] = [
  {
    id: "user-host",
    name: "김집사",
    phone: "01011112222",
    kakaoId: "host-cat",
    email: "host@catmeetup.app",
    gender: "여",
    birthDate: "1994-04-18",
    region: "서울시 구로구",
    regionCode: "seoul-guro",
    bio: "퇴근 후에도 꼼꼼하게 돌보는 집사예요. 사료, 화장실, 놀이까지 세세하게 공유드려요.",
    password: "demo1234",
  },
  {
    id: "user-applicant",
    name: "박냥이",
    phone: "01033334444",
    kakaoId: "cat-friend",
    email: "applicant@catmeetup.app",
    gender: "남",
    birthDate: "1997-09-02",
    region: "서울시 관악구",
    regionCode: "seoul-gwanak",
    bio: "임보 경험이 있고 사람 친화적인 고양이와 잘 지내요. 사진 기록도 꼼꼼하게 남깁니다.",
    password: "demo1234",
  },
  {
    id: "user-neighbor",
    name: "최모래",
    phone: "01055556666",
    kakaoId: "sand-master",
    email: "neighbor@catmeetup.app",
    gender: "기타",
    birthDate: "1991-12-07",
    region: "서울시 노원구",
    regionCode: "seoul-nowon",
    bio: "모래 나눔과 동네 돌봄을 자주 도와요. 갑작스러운 일정에도 빠르게 맞출 수 있어요.",
    password: "demo1234",
  },
];

const seedCatCards: CatCard[] = [
  {
    id: "cat-1",
    ownerId: "user-host",
    name: "모찌",
    gender: "암컷",
    age: 3,
    neutered: true,
    temperament: "개냥이",
    description: "사람 손을 좋아하고 낯선 환경에서도 금방 적응하는 편입니다.",
  },
  {
    id: "cat-2",
    ownerId: "user-applicant",
    name: "토토",
    gender: "수컷",
    age: 2,
    neutered: true,
    temperament: "수줍음",
    description:
      "처음엔 경계하지만 익숙해지면 장난감을 물고 오는 애교쟁이예요.",
  },
];

const seedPosts: MatchPost[] = [
  {
    id: "post-1",
    authorId: "user-host",
    title: "출장 하루 동안 저녁 돌봄 부탁드려요",
    category: "돌봄",
    region: "서울시 구로구",
    meetAt: "2026-04-14 19:30",
    content:
      "사료 급여, 물 갈아주기, 화장실 정리, 15분 정도 놀이만 부탁드려요. 모찌는 낯가림이 적고 간식 위치도 따로 적어둘게요.",
    status: "모집",
  },
  {
    id: "post-2",
    authorId: "user-neighbor",
    title: "차분한 친구 고양이 만나볼 분",
    category: "친구찾기",
    region: "서울시 관악구",
    meetAt: "2026-04-16 14:00",
    content:
      "실내에서 천천히 적응 시간을 가지며 친구를 만들어보고 싶어요. 공격성이 없는 아이면 더 좋습니다.",
    status: "매칭중",
  },
  {
    id: "post-3",
    authorId: "user-host",
    title: "미개봉 모래와 장난감 나눔합니다",
    category: "물품나눔",
    region: "서울시 구로구",
    meetAt: "2026-04-18 11:00",
    content:
      "벤토나이트 모래 2봉과 낚싯대 장난감 3개 있습니다. 근처에서 빠르게 받아가실 분이면 좋아요.",
    status: "매칭완료",
  },
];

const seedApplications: DemoApplication[] = [
  {
    id: "application-1",
    postId: "post-1",
    applicantUserId: "user-applicant",
    applicantMessage:
      "퇴근 후 바로 이동 가능하고, 모찌 적응 시간을 존중하면서 돌볼게요.",
    createdAt: "2026-04-12T08:00:00.000Z",
    phoneVisibilityState: "hidden",
    status: "대기중",
  },
  {
    id: "application-2",
    postId: "post-2",
    applicantUserId: "user-applicant",
    applicantMessage:
      "차분한 성격의 토토와 함께 천천히 만나보면 좋겠어요. 사진과 기록도 남길 수 있습니다.",
    createdAt: "2026-04-12T09:00:00.000Z",
    phoneVisibilityState: "host_visible",
    status: "매칭중",
  },
  {
    id: "application-3",
    postId: "post-3",
    applicantUserId: "user-neighbor",
    applicantMessage: "가까워서 바로 수령 가능합니다.",
    createdAt: "2026-04-11T11:00:00.000Z",
    phoneVisibilityState: "mutual_visible",
    status: "매칭완료",
  },
];

function createInitialDemoState(): DemoState {
  return {
    applications: seedApplications,
    catCards: seedCatCards,
    currentUserId: null,
    posts: seedPosts,
    users: seedUsers,
  };
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mapMatchingLabel(status: ApplicationStatus): "매칭" | "대기" | "실패" {
  if (status === "실패") {
    return "실패";
  }

  if (status === "대기중") {
    return "대기";
  }

  return "매칭";
}

const DemoDataContext = createContext<DemoDataContextValue | null>(null);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createInitialDemoState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (!isMounted) {
          return;
        }

        if (saved) {
          const parsed = JSON.parse(saved) as DemoState;
          setState(parsed);
        }
      } catch {
        // Ignore malformed cached demo data and continue with the seeded state.
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isHydrated, state]);

  const currentUser =
    state.users.find((user) => user.id === state.currentUserId) ?? null;
  const currentUserCats = currentUser
    ? state.catCards.filter((cat) => cat.ownerId === currentUser.id)
    : [];

  const demoAccounts: DemoAccount[] = seedUsers.slice(0, 2).map((user) => ({
    userId: user.id,
    label: `${user.name} 데모 계정`,
    phone: user.phone,
    password: user.password,
    hint:
      user.id === "user-host"
        ? "작성자 관점: 게시물 작성과 신청자 선택을 시연하기 좋아요."
        : "신청자 관점: 신청, 매칭 수락, 연락처 공개 흐름을 볼 수 있어요.",
  }));

  const updateState = (updater: (previous: DemoState) => DemoState) => {
    setState((previous) => updater(previous));
  };

  const requireCurrentUser = () => {
    if (!currentUser) {
      throw new Error("로그인 후 이용해주세요.");
    }

    return currentUser;
  };

  const getPostById = (postId: string) =>
    state.posts.find((post) => post.id === postId);

  const getApplicationByPostId = (postId: string) =>
    currentUser
      ? state.applications.find(
          (application) =>
            application.postId === postId &&
            application.applicantUserId === currentUser.id,
        )
      : undefined;

  const appliedPosts: DemoAppliedPost[] = currentUser
    ? (state.applications
        .filter((application) => application.applicantUserId === currentUser.id)
        .map((application) => {
          const post = state.posts.find(
            (item) => item.id === application.postId,
          );
          const host = state.users.find((user) => user.id === post?.authorId);

          if (!(post && host)) {
            return null;
          }

          return {
            hostName: host.name,
            hostPhone:
              application.phoneVisibilityState === "hidden"
                ? undefined
                : host.phone,
            matchingLabel: mapMatchingLabel(application.status),
            meetAt: post.meetAt,
            myStatus: application.status,
            phoneVisibilityState: application.phoneVisibilityState,
            postId: post.id,
            postStatus: post.status,
            postTitle: post.title,
            region: post.region,
          };
        })
        .filter(Boolean) as DemoAppliedPost[])
    : [];

  const matchOffers: DemoMatchOffer[] = currentUser
    ? (state.applications
        .filter(
          (application) =>
            application.applicantUserId === currentUser.id &&
            (application.status === "매칭중" ||
              application.status === "매칭완료"),
        )
        .map((application) => {
          const post = state.posts.find(
            (item) => item.id === application.postId,
          );
          const host = state.users.find((user) => user.id === post?.authorId);

          if (!(post && host)) {
            return null;
          }

          return {
            hostName: host.name,
            hostPhone:
              application.phoneVisibilityState === "hidden"
                ? undefined
                : host.phone,
            hostPhoneVisible: application.phoneVisibilityState !== "hidden",
            meetAt: post.meetAt,
            needAccept: application.status === "매칭중",
            postId: post.id,
            postRegion: post.region,
            postTitle: post.title,
            status: application.status,
          };
        })
        .filter(Boolean) as DemoMatchOffer[])
    : [];

  const hostPosts: DemoHostPost[] = currentUser
    ? state.posts
        .filter((post) => post.authorId === currentUser.id)
        .map((post) => {
          const applications = state.applications.filter(
            (application) => application.postId === post.id,
          );

          return {
            ...post,
            applicantCount: applications.length,
            matchedCount: applications.filter(
              (application) =>
                application.status === "매칭중" ||
                application.status === "매칭완료",
            ).length,
            waitingCount: applications.filter(
              (application) => application.status === "대기중",
            ).length,
          };
        })
    : [];

  const getApplicantsForPost = (postId: string): DemoApplicantSummary[] =>
    state.applications
      .filter((application) => application.postId === postId)
      .map((application) => {
        const applicant = state.users.find(
          (user) => user.id === application.applicantUserId,
        );

        if (!applicant) {
          return null;
        }

        return {
          applicant,
          applicationId: application.id,
          cats: state.catCards.filter((cat) => cat.ownerId === applicant.id),
          message: application.applicantMessage,
          phoneVisible: application.phoneVisibilityState !== "hidden",
          status: application.status,
        };
      })
      .filter(Boolean) as DemoApplicantSummary[];

  const signIn = (input: { password: string; phone: string }) => {
    const phone = normalizePhone(input.phone);
    const matchedUser = state.users.find(
      (user) =>
        normalizePhone(user.phone) === phone &&
        user.password === input.password,
    );

    if (!matchedUser) {
      throw new Error("핸드폰번호 또는 비밀번호가 올바르지 않습니다.");
    }

    updateState((previous) => ({
      ...previous,
      currentUserId: matchedUser.id,
    }));

    return Promise.resolve();
  };

  const quickLogin = (userId: string) => {
    const matchedUser = state.users.find((user) => user.id === userId);

    if (!matchedUser) {
      throw new Error("데모 계정을 찾을 수 없습니다.");
    }

    updateState((previous) => ({
      ...previous,
      currentUserId: matchedUser.id,
    }));

    return Promise.resolve();
  };

  const signOut = () => {
    updateState((previous) => ({
      ...previous,
      currentUserId: null,
    }));

    return Promise.resolve();
  };

  const signUp = (input: SignupFormValues) => {
    const normalizedPhone = normalizePhone(input.phone);

    if (
      state.users.some((user) => normalizePhone(user.phone) === normalizedPhone)
    ) {
      throw new Error("이미 가입된 핸드폰번호입니다.");
    }

    if (
      state.users.some(
        (user) =>
          user.email.trim().toLowerCase() === input.email.trim().toLowerCase(),
      )
    ) {
      throw new Error("이미 사용 중인 이메일입니다.");
    }

    if (
      state.users.some(
        (user) =>
          user.kakaoId.trim().toLowerCase() ===
          input.kakaoId.trim().toLowerCase(),
      )
    ) {
      throw new Error("이미 사용 중인 카카오톡 아이디입니다.");
    }

    const nextUser: DemoUser = {
      id: createId("user"),
      name: input.name.trim(),
      phone: normalizedPhone,
      kakaoId: input.kakaoId.trim(),
      email: input.email.trim(),
      gender: input.gender,
      birthDate: input.birthDate.trim(),
      region: regionLabelByCode[input.regionCode],
      regionCode: input.regionCode,
      bio: input.bio.trim(),
      password: input.password,
    };

    updateState((previous) => ({
      ...previous,
      currentUserId: nextUser.id,
      users: [...previous.users, nextUser],
    }));

    return Promise.resolve(nextUser);
  };

  const resetDemoData = async () => {
    const nextState = createInitialDemoState();
    setState(nextState);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const createCatCard = (input: CreateCatCardInput) => {
    const user = requireCurrentUser();
    const nextCard: CatCard = {
      id: createId("cat"),
      ownerId: user.id,
      ...input,
    };

    updateState((previous) => ({
      ...previous,
      catCards: [nextCard, ...previous.catCards],
    }));

    return Promise.resolve(nextCard);
  };

  const createPost = (input: CreatePostInput) => {
    const user = requireCurrentUser();
    const nextPost: MatchPost = {
      id: createId("post"),
      authorId: user.id,
      category: input.category,
      content: input.content.trim(),
      meetAt: input.meetAt.trim(),
      region: input.region,
      status: "모집",
      title: input.title.trim(),
    };

    updateState((previous) => ({
      ...previous,
      posts: [nextPost, ...previous.posts],
    }));

    return Promise.resolve(nextPost);
  };

  const applyToPost = (input: { message: string; postId: string }) => {
    const user = requireCurrentUser();
    const post = getPostById(input.postId);

    if (!post) {
      throw new Error("게시물을 찾을 수 없습니다.");
    }

    if (post.authorId === user.id) {
      throw new Error("내가 작성한 게시물에는 신청할 수 없습니다.");
    }

    if (
      state.applications.some(
        (application) =>
          application.postId === input.postId &&
          application.applicantUserId === user.id,
      )
    ) {
      throw new Error("이미 신청한 게시물입니다.");
    }

    const nextApplication: DemoApplication = {
      id: createId("application"),
      applicantMessage: input.message.trim(),
      applicantUserId: user.id,
      createdAt: new Date().toISOString(),
      phoneVisibilityState: "hidden",
      postId: input.postId,
      status: "대기중",
    };

    updateState((previous) => ({
      ...previous,
      applications: [nextApplication, ...previous.applications],
    }));

    return Promise.resolve();
  };

  const chooseApplicant = (input: {
    applicantUserId: string;
    postId: string;
  }) => {
    const user = requireCurrentUser();
    const post = getPostById(input.postId);

    if (!post) {
      throw new Error("게시물을 찾을 수 없습니다.");
    }

    if (post.authorId !== user.id) {
      throw new Error("내가 작성한 게시물에서만 신청자를 선택할 수 있습니다.");
    }

    updateState((previous) => ({
      ...previous,
      applications: previous.applications.map((application) => {
        if (application.postId !== input.postId) {
          return application;
        }

        if (application.applicantUserId === input.applicantUserId) {
          return {
            ...application,
            phoneVisibilityState: "host_visible",
            status: "매칭중",
          };
        }

        return {
          ...application,
          phoneVisibilityState: "hidden",
          status: "실패",
        };
      }),
      posts: previous.posts.map((item) =>
        item.id === input.postId
          ? {
              ...item,
              status: "매칭중",
            }
          : item,
      ),
    }));

    return Promise.resolve();
  };

  const acceptMatch = (postId: string) => {
    const user = requireCurrentUser();
    const application = state.applications.find(
      (item) => item.postId === postId && item.applicantUserId === user.id,
    );

    if (!application) {
      throw new Error("수락할 매칭 제안을 찾을 수 없습니다.");
    }

    updateState((previous) => ({
      ...previous,
      applications: previous.applications.map((item) =>
        item.id === application.id
          ? {
              ...item,
              phoneVisibilityState: "mutual_visible",
              status: "매칭완료",
            }
          : item,
      ),
      posts: previous.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              status: "매칭완료",
            }
          : post,
      ),
    }));

    return Promise.resolve();
  };

  return (
    <DemoDataContext.Provider
      value={{
        appliedPosts,
        applyToPost,
        createCatCard,
        createPost,
        currentUser,
        currentUserCats,
        demoAccounts,
        getApplicationByPostId,
        getApplicantsForPost,
        getPostById,
        hostPosts,
        isHydrated,
        matchOffers,
        posts: state.posts,
        quickLogin,
        resetDemoData,
        signIn,
        signOut,
        signUp,
        chooseApplicant,
        acceptMatch,
      }}
    >
      {children}
    </DemoDataContext.Provider>
  );
}

export function useDemoData() {
  const context = useContext(DemoDataContext);

  if (!context) {
    throw new Error("DemoDataProvider가 필요합니다.");
  }

  return context;
}
