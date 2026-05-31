import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  type StyleProp,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { signInWithGoogle } from "@/features/auth/api/google-oauth";

const GOOGLE_BLUE = "#2563eb";

export function GoogleAuthButton(props: {
  disabled?: boolean;
  helperText?: string;
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading || props.disabled) {
      return;
    }

    setLoading(true);

    try {
      await signInWithGoogle();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "구글 로그인에 실패했습니다. 다시 시도해주세요.";

      Alert.alert("구글 로그인 실패", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={props.style}>
      <Pressable
        disabled={loading || props.disabled}
        onPress={() => void handlePress()}
        style={({ pressed }) => ({
          alignItems: "center",
          backgroundColor: "white",
          borderColor: "#dbe3f0",
          borderRadius: 12,
          borderWidth: 1,
          flexDirection: "row",
          gap: 12,
          justifyContent: "center",
          opacity: pressed || loading || props.disabled ? 0.75 : 1,
          paddingHorizontal: 16,
          paddingVertical: 14,
        })}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#eff6ff",
            borderRadius: 999,
            height: 28,
            justifyContent: "center",
            width: 28,
          }}
        >
          {loading ? (
            <ActivityIndicator color={GOOGLE_BLUE} size="small" />
          ) : (
            <Text
              style={{
                color: GOOGLE_BLUE,
                fontSize: 16,
                fontWeight: "800",
              }}
            >
              G
            </Text>
          )}
        </View>
        <Text
          style={{
            color: "#0f172a",
            fontSize: 16,
            fontWeight: "700",
          }}
        >
          {loading
            ? "구글 로그인 연결 중..."
            : (props.label ?? "구글로 계속하기")}
        </Text>
      </Pressable>
      {props.helperText ? (
        <Text
          style={{
            color: "#64748b",
            fontSize: 13,
            lineHeight: 18,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {props.helperText}
        </Text>
      ) : null}
    </View>
  );
}
