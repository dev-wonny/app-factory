import {
  buildAuthEmailFromPhone,
  toFriendlyAuthError,
} from "../src/features/auth/api/shared";

describe("buildAuthEmailFromPhone", () => {
  it("builds an internal auth email from phone digits", () => {
    expect(buildAuthEmailFromPhone("010-1234-5678")).toBe(
      "01012345678@catmeetup.app",
    );
  });
});

describe("toFriendlyAuthError", () => {
  it("maps Supabase email send throttling to a friendly message", () => {
    expect(toFriendlyAuthError("email rate limit exceeded")).toBe(
      "이메일 발송 요청이 너무 많아요. 잠시 후 다시 시도해주세요.",
    );
  });

  it("maps serialized rate limit payloads that include the provider code", () => {
    expect(
      toFriendlyAuthError(
        '{"code":"over_email_send_rate_limit","message":"email rate limit exceeded"}',
      ),
    ).toBe("이메일 발송 요청이 너무 많아요. 잠시 후 다시 시도해주세요.");
  });

  it("maps duplicate auth users back to the phone-number message", () => {
    expect(toFriendlyAuthError("User already registered")).toBe(
      "이미 가입된 핸드폰번호입니다.",
    );
  });

  it("maps unconfirmed email auth errors to the confirm-email guidance", () => {
    expect(toFriendlyAuthError("Email not confirmed")).toBe(
      "현재 로그인 방식은 이메일 확인 없이 바로 세션이 발급되어야 해요. Supabase Auth 설정에서 Confirm email을 꺼주세요.",
    );
  });

  it("maps invalid api key errors to the env guidance", () => {
    expect(toFriendlyAuthError("Invalid API key")).toBe(
      "Supabase 연결 설정이 올바르지 않습니다. EXPO_PUBLIC_SUPABASE_URL과 EXPO_PUBLIC_SUPABASE_ANON_KEY를 다시 확인해주세요.",
    );
  });
});
