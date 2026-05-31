import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  getInitialOnboardingValues,
  useAuth,
} from "@/features/auth/auth-provider";
import { RegionPicker } from "@/features/auth/components/region-picker";
import {
  emptyOnboardingFieldErrors,
  genderOptions,
  type OnboardingFormValues,
} from "@/features/auth/types";
import { validateOnboardingForm } from "@/features/auth/validators/onboarding";

const BRAND_COLOR = "#6366f1";
const BRAND_LIGHT = "#eef2ff";

function getSubmitButtonBackgroundColor(input: {
  pressed: boolean;
  submitting: boolean;
}) {
  if (input.submitting) {
    return "#c7d2fe";
  }

  if (input.pressed) {
    return "#4f46e5";
  }

  return BRAND_COLOR;
}

function LabeledInput(props: {
  autoComplete?: "birthdate-full" | "email" | "name" | "tel" | "username";
  editable?: boolean;
  error?: string;
  inputMode?: "email" | "numeric" | "tel" | "text";
  keyboardType?:
    | "default"
    | "email-address"
    | "number-pad"
    | "phone-pad"
    | "twitter";
  label: string;
  maxLength?: number;
  multiline?: boolean;
  onChangeText?: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: "#334155", fontSize: 14, fontWeight: "600" }}>
        {props.label}
      </Text>
      <TextInput
        autoCapitalize="none"
        autoComplete={props.autoComplete}
        editable={props.editable}
        inputMode={props.inputMode}
        keyboardType={props.keyboardType}
        maxLength={props.maxLength}
        multiline={props.multiline}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#94a3b8"
        style={{
          backgroundColor: props.editable === false ? "#f1f5f9" : "#f8fafc",
          borderColor: props.error ? "#ef4444" : "#e2e8f0",
          borderRadius: 12,
          borderWidth: 1,
          color: "#0f172a",
          fontSize: 16,
          minHeight: props.multiline ? 120 : undefined,
          opacity: props.editable === false ? 0.7 : 1,
          padding: 14,
          textAlignVertical: props.multiline ? "top" : "auto",
        }}
        value={props.value}
      />
      {props.error ? (
        <Text style={{ color: "#ef4444", fontSize: 13 }}>{props.error}</Text>
      ) : null}
    </View>
  );
}

function formatBirthDateInput(value: string) {
  const digits = value.replace(/[^0-9]/g, "").slice(0, 8);

  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function SelectChip(props: {
  isSelected: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => ({
        backgroundColor: props.isSelected ? BRAND_COLOR : "#eef2ff",
        borderColor: props.isSelected ? BRAND_COLOR : "#cbd5e1",
        borderRadius: 999,
        borderWidth: 1,
        opacity: pressed ? 0.8 : 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
      })}
    >
      <Text
        style={{
          color: props.isSelected ? "white" : "#334155",
          fontWeight: "600",
        }}
      >
        {props.label}
      </Text>
    </Pressable>
  );
}

export default function SignupScreen() {
  const router = useRouter();
  const {
    authUser,
    completeOnboarding,
    isLoading,
    isOnboardingComplete,
    signOut,
  } = useAuth();
  const [form, setForm] = useState<OnboardingFormValues>(() =>
    getInitialOnboardingValues(authUser),
  );
  const [errors, setErrors] = useState(emptyOnboardingFieldErrors);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm((prev) => ({
      ...getInitialOnboardingValues(authUser),
      birthDate: prev.birthDate,
      bio: prev.bio,
      gender: prev.gender,
      kakaoId: prev.kakaoId,
      phone: prev.phone,
      regionCode: prev.regionCode,
    }));
  }, [authUser]);

  useEffect(() => {
    if (!isLoading && isOnboardingComplete) {
      router.replace("/(posts)/list");
    }
  }, [isLoading, isOnboardingComplete, router]);

  const email = authUser?.email ?? "";

  const updateField = <Key extends keyof OnboardingFormValues>(
    field: Key,
    value: OnboardingFormValues[Key],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const helperMessage = useMemo(() => {
    if (!email) {
      return "구글 계정 이메일을 읽지 못하고 있어요. 다시 로그인해주세요.";
    }

    return "로그인은 끝났어요. 이제 전화번호와 기본 프로필을 입력하면 서비스를 사용할 수 있어요.";
  }, [email]);

  const handleSubmit = async () => {
    const normalizedForm = {
      ...form,
      birthDate: formatBirthDateInput(form.birthDate),
    };

    setForm(normalizedForm);

    const validation = validateOnboardingForm(normalizedForm);
    setErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    setSubmitting(true);

    try {
      await completeOnboarding(normalizedForm);

      Alert.alert("프로필 완성", "이제 게시물을 둘러보고 신청할 수 있어요.", [
        {
          onPress: () => router.replace("/(posts)/list"),
          text: "확인",
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "프로필 저장에 실패했습니다. 다시 시도해주세요.";

      Alert.alert("프로필 저장 실패", message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          alignItems: "center",
          backgroundColor: "#f8fafc",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={BRAND_COLOR} size="small" />
        <Text style={{ color: "#64748b", marginTop: 12 }}>
          프로필 상태를 확인하는 중이에요.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ backgroundColor: "#f8fafc", flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ gap: 18, padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center", gap: 8, marginBottom: 10 }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: BRAND_LIGHT,
              borderRadius: 36,
              height: 72,
              justifyContent: "center",
              width: 72,
            }}
          >
            <Text style={{ fontSize: 36 }}>📋</Text>
          </View>
          <Text style={{ color: "#0f172a", fontSize: 28, fontWeight: "800" }}>
            기본 프로필 완성
          </Text>
          <Text style={{ color: "#64748b", fontSize: 15, textAlign: "center" }}>
            {helperMessage}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#eef2ff",
            borderRadius: 14,
            gap: 6,
            padding: 16,
          }}
        >
          <Text style={{ color: "#3730a3", fontSize: 14, fontWeight: "700" }}>
            구글 계정
          </Text>
          <Text style={{ color: "#4338ca", lineHeight: 20 }}>
            {email || "-"}
          </Text>
          <Text style={{ color: "#6366f1", fontSize: 13, lineHeight: 18 }}>
            로그인 수단은 구글 계정으로 유지되고, 전화번호는 연락/매칭을 위한
            필수 프로필 정보로 저장됩니다.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "white",
            borderColor: "#e2e8f0",
            borderRadius: 16,
            borderWidth: 1,
            gap: 16,
            padding: 20,
          }}
        >
          <LabeledInput
            autoComplete="name"
            error={errors.name}
            label="이름"
            onChangeText={(value) => updateField("name", value)}
            placeholder="홍길동"
            value={form.name}
          />

          <LabeledInput
            autoComplete="email"
            editable={false}
            label="구글 계정 이메일"
            placeholder="google account email"
            value={email}
          />

          <LabeledInput
            autoComplete="tel"
            error={errors.phone}
            inputMode="tel"
            keyboardType="phone-pad"
            label="핸드폰번호(필수)"
            onChangeText={(value) => updateField("phone", value)}
            placeholder="01012345678"
            value={form.phone}
          />

          <LabeledInput
            autoComplete="username"
            error={errors.kakaoId}
            label="카카오톡 아이디(선택)"
            onChangeText={(value) => updateField("kakaoId", value)}
            placeholder="catlover123"
            value={form.kakaoId}
          />

          <View style={{ gap: 8 }}>
            <Text style={{ color: "#334155", fontSize: 14, fontWeight: "600" }}>
              성별
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {genderOptions.map((option) => (
                <SelectChip
                  isSelected={form.gender === option}
                  key={option}
                  label={option}
                  onPress={() => updateField("gender", option)}
                />
              ))}
            </View>
          </View>

          <LabeledInput
            autoComplete="birthdate-full"
            error={errors.birthDate}
            inputMode="numeric"
            keyboardType="number-pad"
            label="생년월일"
            maxLength={10}
            onChangeText={(value) =>
              updateField("birthDate", formatBirthDateInput(value))
            }
            placeholder="19980321"
            value={form.birthDate}
          />

          <RegionPicker
            error={errors.regionCode}
            onChange={(value) => updateField("regionCode", value)}
            value={form.regionCode}
          />

          <LabeledInput
            error={errors.bio}
            label="본인 설명 / 자기소개"
            multiline
            onChangeText={(value) => updateField("bio", value)}
            placeholder="돌봄 경험, 고양이와 지내는 방식, 매칭 때 중요하게 보는 점을 적어주세요."
            value={form.bio}
          />

          <Pressable
            disabled={submitting}
            onPress={() => void handleSubmit()}
            style={({ pressed }) => ({
              alignItems: "center",
              backgroundColor: getSubmitButtonBackgroundColor({
                pressed,
                submitting,
              }),
              borderRadius: 12,
              flexDirection: "row",
              gap: 8,
              justifyContent: "center",
              marginTop: 4,
              padding: 16,
            })}
          >
            {submitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : null}
            <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
              {submitting ? "프로필 저장 중..." : "프로필 완성하기"}
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => void signOut()}
          style={({ pressed }) => ({
            alignItems: "center",
            opacity: pressed ? 0.6 : 1,
            paddingVertical: 8,
          })}
        >
          <Text
            style={{
              color: "#94a3b8",
              fontSize: 14,
              textDecorationLine: "underline",
            }}
          >
            다른 구글 계정으로 다시 시작
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
