import type { OnboardingFormValues, SignupFormValues } from "../types";

import { supabase } from "@/lib/supabase";
import { normalizeEmail, normalizePhone, toFriendlyAuthError } from "./shared";

type CreateUserProfileInput = Pick<
  SignupFormValues | OnboardingFormValues,
  "name" | "phone" | "kakaoId" | "gender" | "birthDate" | "regionCode" | "bio"
> & {
  authUserId: string;
  email: string;
};

export type UserProfileRecord = {
  auth_user_id: string;
  bio: string | null;
  birth_date: string | null;
  email: string | null;
  gender: "남" | "여" | "기타" | null;
  id: string;
  kakao_id: string | null;
  name: string;
  phone: string;
  region_code: string | null;
};

async function ensureUniqueValue(params: {
  column: "phone" | "email" | "kakao_id";
  message: string;
  value: string;
}) {
  if (!params.value) return;

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq(params.column, params.value)
    .is("deleted_at", null)
    .limit(1);

  if (error) {
    throw new Error(toFriendlyAuthError(error.message));
  }

  if (data && data.length > 0) {
    throw new Error(params.message);
  }
}

export async function assertUserProfileAvailable(
  input: Pick<SignupFormValues, "phone" | "email" | "kakaoId">,
) {
  const normalizedPhone = normalizePhone(input.phone);
  const normalizedEmail = normalizeEmail(input.email);

  await ensureUniqueValue({
    column: "phone",
    value: normalizedPhone,
    message: "이미 가입된 핸드폰번호입니다.",
  });

  await ensureUniqueValue({
    column: "email",
    value: normalizedEmail,
    message: "이미 사용 중인 이메일입니다.",
  });

  await ensureUniqueValue({
    column: "kakao_id",
    value: input.kakaoId.trim(),
    message: "이미 사용 중인 카카오톡 아이디입니다.",
  });
}

export async function createUserProfile(input: CreateUserProfileInput) {
  const { data, error } = await supabase
    .from("users")
    .insert({
      auth_user_id: input.authUserId,
      name: input.name.trim(),
      phone: normalizePhone(input.phone),
      kakao_id: input.kakaoId.trim() || null,
      email: normalizeEmail(input.email),
      gender: input.gender,
      birth_date: input.birthDate,
      region_code: input.regionCode,
      bio: input.bio.trim(),
    })
    .select(
      "id, auth_user_id, name, phone, kakao_id, email, gender, birth_date, region_code, bio",
    )
    .single();

  if (error) {
    throw new Error(toFriendlyAuthError(error.message));
  }

  return data;
}

export async function getUserProfileByAuthUserId(authUserId: string) {
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, auth_user_id, name, phone, kakao_id, email, gender, birth_date, region_code, bio",
    )
    .eq("auth_user_id", authUserId)
    .is("deleted_at", null)
    .maybeSingle<UserProfileRecord>();

  if (error) {
    throw new Error(toFriendlyAuthError(error.message));
  }

  return data ?? null;
}
