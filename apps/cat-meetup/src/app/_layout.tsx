import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { AuthProvider, useAuth } from "@/features/auth/auth-provider";

function getAuthRedirectTarget(input: {
  firstSegment?: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginRoute: boolean;
  isOnboardingComplete: boolean;
  isOnboardingRoute: boolean;
  navigationReady: boolean;
}) {
  if (!input.navigationReady || input.isLoading) {
    return null;
  }

  if (!input.isAuthenticated) {
    return input.isLoginRoute ? null : "/(auth)/login";
  }

  if (!input.isOnboardingComplete) {
    return input.isOnboardingRoute ? null : "/(auth)/signup";
  }

  if (input.firstSegment === "(auth)" || input.firstSegment == null) {
    return "/(posts)/list";
  }

  return null;
}

function AuthGate() {
  const navigationState = useRootNavigationState();
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, isOnboardingComplete } = useAuth();

  const firstSegment = segments[0];
  const secondSegment = segments[1];
  const isAuthRoute = firstSegment === "(auth)";
  const isOnboardingRoute = isAuthRoute && secondSegment === "signup";
  const isLoginRoute = isAuthRoute && secondSegment === "login";

  useEffect(() => {
    const redirectTarget = getAuthRedirectTarget({
      firstSegment,
      isAuthenticated,
      isLoading,
      isLoginRoute,
      isOnboardingComplete,
      isOnboardingRoute,
      navigationReady: !!navigationState?.key,
    });

    if (redirectTarget) {
      router.replace(redirectTarget);
    }
  }, [
    firstSegment,
    isAuthenticated,
    isLoading,
    isLoginRoute,
    isOnboardingComplete,
    isOnboardingRoute,
    navigationState?.key,
    router,
  ]);

  if (!navigationState?.key || isLoading) {
    return (
      <View
        style={{
          alignItems: "center",
          backgroundColor: "#f8fafc",
          flex: 1,
          gap: 12,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="#6366f1" size="small" />
        <Text style={{ color: "#64748b" }}>
          로그인 상태를 확인하는 중이에요.
        </Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isOnboardingComplete) {
    return null;
  }

  return null;
}

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <StatusBar style="dark" />
        <AuthGate />
        <Stack
          screenOptions={{
            headerTitleStyle: { fontWeight: "700" },
            contentStyle: { backgroundColor: "#f8fafc" },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="index" options={{ title: "냥냥모임 데모" }} />
          <Stack.Screen
            name="(auth)/login"
            options={{ headerShown: false, title: "로그인" }}
          />
          <Stack.Screen
            name="(auth)/signup"
            options={{ title: "프로필 완성" }}
          />
          <Stack.Screen
            name="(cat)/register"
            options={{ title: "고양이 카드 등록" }}
          />
          <Stack.Screen
            name="(posts)/list"
            options={{ title: "매칭 게시물 둘러보기" }}
          />
          <Stack.Screen
            name="(posts)/[id]"
            options={{ title: "게시물 상세" }}
          />
          <Stack.Screen
            name="(posts)/applied"
            options={{ title: "내 신청 현황" }}
          />
          <Stack.Screen
            name="(host)/create"
            options={{ title: "게시물 작성" }}
          />
          <Stack.Screen
            name="(host)/manage/[id]"
            options={{ title: "신청자 관리" }}
          />
          <Stack.Screen
            name="(applicant)/matches"
            options={{ title: "매칭 제안" }}
          />
          <Stack.Screen name="+not-found" options={{ title: "페이지 없음" }} />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
