const AUTH_EMAIL_DOMAIN = "catmeetup.app";

export function normalizePhone(phone: string) {
  return phone.replace(/[^0-9]/g, "");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function buildAuthEmailFromPhone(phone: string) {
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    throw new Error("핸드폰번호를 입력해주세요.");
  }

  return `${normalizedPhone}@${AUTH_EMAIL_DOMAIN}`;
}

const authErrorMatchers: Array<{
  isMatch: (message: string) => boolean;
  friendlyMessage: string;
}> = [
  {
    isMatch: (message) =>
      message.includes("email not confirmed") ||
      message.includes("email_not_confirmed"),
    friendlyMessage:
      "현재 로그인 방식은 이메일 확인 없이 바로 세션이 발급되어야 해요. Supabase Auth 설정에서 Confirm email을 꺼주세요.",
  },
  {
    isMatch: (message) =>
      message.includes("confirm email") ||
      message.includes("email confirmation"),
    friendlyMessage:
      "현재 회원가입 방식은 이메일 확인을 지원하지 않아요. Supabase Auth 설정에서 Confirm email을 꺼주세요.",
  },
  {
    isMatch: (message) =>
      message.includes("invalid login") ||
      message.includes("invalid login credentials"),
    friendlyMessage: "핸드폰번호 또는 비밀번호가 올바르지 않습니다.",
  },
  {
    isMatch: (message) =>
      message.includes("over_email_send_rate_limit") ||
      message.includes("email rate limit exceeded"),
    friendlyMessage:
      "이메일 발송 요청이 너무 많아요. 잠시 후 다시 시도해주세요.",
  },
  {
    isMatch: (message) => message.includes("user already registered"),
    friendlyMessage: "이미 가입된 핸드폰번호입니다.",
  },
  {
    isMatch: (message) => message.includes("password should be at least"),
    friendlyMessage: "비밀번호는 영문과 숫자를 포함해 8자 이상이어야 합니다.",
  },
  {
    isMatch: (message) =>
      message.includes("email address") && message.includes("invalid"),
    friendlyMessage:
      "로그인 ID 생성에 실패했습니다. 핸드폰번호를 다시 확인해주세요.",
  },
  {
    isMatch: (message) =>
      message.includes("invalid api key") ||
      message.includes("invalid jwt") ||
      message.includes("forbidden"),
    friendlyMessage:
      "Supabase 연결 설정이 올바르지 않습니다. EXPO_PUBLIC_SUPABASE_URL과 EXPO_PUBLIC_SUPABASE_ANON_KEY를 다시 확인해주세요.",
  },
  {
    isMatch: (message) =>
      message.includes("duplicate key") && message.includes("phone"),
    friendlyMessage: "이미 가입된 핸드폰번호입니다.",
  },
  {
    isMatch: (message) =>
      message.includes("duplicate key") && message.includes("email"),
    friendlyMessage: "이미 사용 중인 이메일입니다.",
  },
  {
    isMatch: (message) =>
      message.includes("duplicate key") &&
      (message.includes("kakao") || message.includes("kakao_id")),
    friendlyMessage: "이미 사용 중인 카카오톡 아이디입니다.",
  },
];

export function toFriendlyAuthError(message: string) {
  const normalizedMessage = message.trim().toLowerCase();
  const matchedError = authErrorMatchers.find((matcher) =>
    matcher.isMatch(normalizedMessage),
  );

  if (matchedError) {
    return matchedError.friendlyMessage;
  }

  return message;
}
