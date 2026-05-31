import {
  emptyOnboardingFieldErrors,
  type OnboardingFieldErrors,
  type OnboardingFormValues,
} from "../types";

const birthDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function normalizeBirthDate(value: string) {
  const digits = value.replace(/[^0-9]/g, "").slice(0, 8);

  if (digits.length !== 8) {
    return value.trim();
  }

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function isValidBirthDate(value: string) {
  if (!birthDatePattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(`${value}T00:00:00`);

  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}

export function validateOnboardingForm(values: OnboardingFormValues) {
  const errors: OnboardingFieldErrors = { ...emptyOnboardingFieldErrors };
  let isValid = true;

  const phoneDigits = values.phone.replace(/[^0-9]/g, "");
  const normalizedBirthDate = normalizeBirthDate(values.birthDate);

  if (!values.name.trim()) {
    errors.name = "이름을 입력해주세요.";
    isValid = false;
  }

  if (!phoneDigits) {
    errors.phone = "핸드폰번호를 입력해주세요.";
    isValid = false;
  } else if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    errors.phone = "올바른 핸드폰번호를 입력해주세요.";
    isValid = false;
  }

  if (!isValidBirthDate(normalizedBirthDate)) {
    errors.birthDate = "생년월일 8자리를 입력해주세요.";
    isValid = false;
  }

  if (!values.bio.trim()) {
    errors.bio = "자기소개를 입력해주세요.";
    isValid = false;
  } else if (values.bio.trim().length < 10) {
    errors.bio = "자기소개를 10자 이상 입력해주세요.";
    isValid = false;
  }

  return { errors, isValid };
}
