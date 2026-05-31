import { ScrollView, Text, View } from "react-native";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";

const BRAND_LIGHT = "#eef2ff";

export default function LoginScreen() {
  return (
    <ScrollView
      contentContainerStyle={{
        backgroundColor: "#f8fafc",
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
      }}
    >
      <View style={{ alignItems: "center", gap: 8, marginBottom: 40 }}>
        <View
          style={{
            alignItems: "center",
            backgroundColor: BRAND_LIGHT,
            borderRadius: 36,
            height: 72,
            justifyContent: "center",
            marginBottom: 8,
            width: 72,
          }}
        >
          <Text style={{ fontSize: 36 }}>🐱</Text>
        </View>
        <Text style={{ color: "#0f172a", fontSize: 28, fontWeight: "800" }}>
          냥냥모임
        </Text>
        <Text style={{ color: "#64748b", fontSize: 15, textAlign: "center" }}>
          구글 로그인으로 시작하고, 첫 로그인 후 전화번호를 포함한 기본 프로필을
          완성해주세요.
        </Text>
      </View>

      <View
        style={{
          backgroundColor: "white",
          borderColor: "#e2e8f0",
          borderRadius: 16,
          borderWidth: 1,
          gap: 20,
          padding: 20,
        }}
      >
        <GoogleAuthButton helperText="프로필이 아직 없으면 다음 단계에서 전화번호, 지역, 자기소개를 입력하게 됩니다." />

        <View
          style={{
            backgroundColor: "#f8fafc",
            borderColor: "#e2e8f0",
            borderRadius: 12,
            borderWidth: 1,
            gap: 8,
            padding: 14,
          }}
        >
          <Text style={{ color: "#334155", fontSize: 14, fontWeight: "700" }}>
            현재 로그인 정책
          </Text>
          <Text style={{ color: "#475569", lineHeight: 20 }}>
            - 로그인은 구글 계정으로만 지원해요.
          </Text>
          <Text style={{ color: "#475569", lineHeight: 20 }}>
            - 프로필 완성 전에는 게시물 목록과 작성 화면에 들어갈 수 없어요.
          </Text>
          <Text style={{ color: "#475569", lineHeight: 20 }}>
            - 연락을 위해 전화번호는 온보딩 단계에서 필수로 받아요.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
