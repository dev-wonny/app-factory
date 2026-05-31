import type { Session, User } from "@supabase/supabase-js";
import type { OnboardingFormValues } from "./types";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  assertUserProfileAvailable,
  createUserProfile,
  getUserProfileByAuthUserId,
  type UserProfileRecord,
} from "@/features/auth/api/create-user-profile";
import { supabase } from "@/lib/supabase";

type AuthContextValue = {
  authUser: User | null;
  completeOnboarding: (
    input: OnboardingFormValues,
  ) => Promise<UserProfileRecord>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboardingComplete: boolean;
  profile: UserProfileRecord | null;
  refreshProfile: () => Promise<void>;
  session: Session | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getUserDisplayName(user: User | null) {
  if (!user) {
    return "";
  }

  const metadata = user.user_metadata ?? {};

  return (
    metadata.name ??
    metadata.full_name ??
    metadata.user_name ??
    user.email?.split("@")[0] ??
    ""
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfileRecord | null>(null);

  const loadProfile = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);

    if (!nextSession?.user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const nextProfile = await getUserProfileByAuthUserId(nextSession.user.id);
    setProfile(nextProfile);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        await loadProfile(currentSession);
      } catch {
        if (isMounted) {
          setProfile(null);
          setSession(null);
          setIsLoading(false);
        }
      }
    };

    void hydrate();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setIsLoading(true);
      void loadProfile(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const authUser = session?.user ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      authUser,
      completeOnboarding: async (input) => {
        if (!authUser) {
          throw new Error(
            "로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.",
          );
        }

        const email = authUser.email?.trim().toLowerCase();
        if (!email) {
          throw new Error("구글 계정 이메일을 확인할 수 없습니다.");
        }

        await assertUserProfileAvailable({
          email,
          kakaoId: input.kakaoId,
          phone: input.phone,
        });

        const createdProfile = await createUserProfile({
          ...input,
          authUserId: authUser.id,
          email,
          name: input.name.trim() || getUserDisplayName(authUser),
        });

        setProfile(createdProfile);
        return createdProfile;
      },
      isAuthenticated: !!session,
      isLoading,
      isOnboardingComplete: !!profile,
      profile,
      refreshProfile: async () => {
        if (!authUser) {
          setProfile(null);
          return;
        }

        const nextProfile = await getUserProfileByAuthUserId(authUser.id);
        setProfile(nextProfile);
      },
      session,
      signOut: async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
          throw error;
        }

        setProfile(null);
        setSession(null);
      },
    }),
    [authUser, isLoading, profile, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("AuthProvider가 필요합니다.");
  }

  return context;
}

export function getInitialOnboardingValues(
  user: User | null,
): OnboardingFormValues {
  return {
    bio: "",
    birthDate: "",
    gender: "남",
    kakaoId: "",
    name: getUserDisplayName(user),
    phone: "",
    regionCode: "seoul-guro",
  };
}
