import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

const mobileRedirectTo = makeRedirectUri({
  scheme: "cat-meetup",
  path: "auth/callback",
});

function getWebRedirectTo() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return `${window.location.origin}/`;
}

async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  const code = params.code;
  if (!code) {
    throw new Error("구글 로그인 응답에서 인증 코드를 찾지 못했어요.");
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    throw error;
  }

  return data.session;
}

function toFriendlyGoogleAuthError(message: string) {
  const normalized = message.trim().toLowerCase();

  if (
    normalized.includes("provider is not enabled") ||
    normalized.includes("unsupported provider")
  ) {
    return "Supabase에서 Google 로그인 Provider가 아직 켜져 있지 않아요.";
  }

  if (
    normalized.includes("redirect") &&
    normalized.includes("allow") &&
    normalized.includes("list")
  ) {
    return "Supabase Auth Redirect URL 설정에 현재 앱 주소가 빠져 있어요.";
  }

  return message;
}

export async function signInWithGoogle() {
  const redirectTo =
    Platform.OS === "web" ? getWebRedirectTo() : mobileRedirectTo;

  if (Platform.OS === "web") {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      throw new Error(toFriendlyGoogleAuthError(error.message));
    }

    return;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw new Error(toFriendlyGoogleAuthError(error.message));
  }

  const authUrl = data?.url;

  if (!authUrl) {
    throw new Error("구글 로그인 페이지 주소를 만들지 못했어요.");
  }

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);

  if (result.type === "cancel" || result.type === "dismiss") {
    return;
  }

  if (result.type !== "success" || !result.url) {
    throw new Error("구글 로그인에 실패했습니다. 다시 시도해주세요.");
  }

  await createSessionFromUrl(result.url);
}

export function getGoogleAuthRedirectUri() {
  return mobileRedirectTo;
}
