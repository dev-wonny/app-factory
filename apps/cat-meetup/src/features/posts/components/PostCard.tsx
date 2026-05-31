import { Pressable, Text, View } from "react-native";

type PostCardVariant = "list" | "applied" | "match";

type PostCardProps = {
  variant: PostCardVariant;
  title: string;
  category?: string;
  status?: string;
  region?: string;
  meetAt?: string;
  myStatus?: string;
  matchingLabel?: string;
  hostPhoneVisible?: boolean;
  needAccept?: boolean;
  onPress?: () => void;
};

function getVariantMeta(props: PostCardProps) {
  if (props.variant === "applied") {
    return {
      line1: `나의 상태: ${props.myStatus ?? "-"}`,
      line2: `매칭 박스: ${props.matchingLabel ?? "-"}`,
    };
  }

  if (props.variant === "match") {
    return {
      line1: `상대 번호 노출: ${props.hostPhoneVisible ? "가능" : "불가"}`,
      line2: `수락 필요: ${props.needAccept ? "예" : "아니오"}`,
    };
  }

  return {
    line1: [props.category, props.region].filter(Boolean).join(" · "),
    line2: [props.status, props.meetAt].filter(Boolean).join(" · "),
  };
}

function getAccentColor(variant: PostCardVariant) {
  if (variant === "match") {
    return "#0891b2";
  }

  if (variant === "applied") {
    return "#7c3aed";
  }

  return "#4f46e5";
}

function getBadgeLabel(props: PostCardProps) {
  if (props.variant === "list") {
    return props.category ?? "매칭";
  }

  if (props.variant === "applied") {
    return props.matchingLabel ?? "신청";
  }

  return props.needAccept ? "수락 필요" : "연락 가능";
}

function getPrimaryActionLabel(variant: PostCardVariant) {
  if (variant === "list") {
    return "상세 보기";
  }

  if (variant === "applied") {
    return "신청 상태 확인";
  }

  return "매칭 정보 확인";
}

function getSecondaryActionLabel(variant: PostCardVariant) {
  if (variant === "list") {
    return "탭해서 열기";
  }

  if (variant === "applied") {
    return "진행 상황 확인";
  }

  return "연락 여부 확인";
}

export function PostCard(props: PostCardProps) {
  const { line1, line2 } = getVariantMeta(props);
  const accentColor = getAccentColor(props.variant);
  const badgeLabel = getBadgeLabel(props);
  const primaryActionLabel = getPrimaryActionLabel(props.variant);
  const secondaryActionLabel = getSecondaryActionLabel(props.variant);

  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => ({
        backgroundColor: "white",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        borderRadius: 18,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
        gap: 10,
        opacity: pressed ? 0.9 : 1,
        padding: 16,
      })}
    >
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            backgroundColor: `${accentColor}15`,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 6,
          }}
        >
          <Text style={{ color: accentColor, fontSize: 12, fontWeight: "700" }}>
            {badgeLabel}
          </Text>
        </View>
        {props.status || props.myStatus ? (
          <Text style={{ color: "#64748b", fontSize: 12, fontWeight: "700" }}>
            {props.status ?? props.myStatus}
          </Text>
        ) : null}
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "800" }}>
          {props.title}
        </Text>
        {line1 ? (
          <Text style={{ color: "#334155", lineHeight: 20 }}>{line1}</Text>
        ) : null}
        {line2 ? (
          <Text style={{ color: "#64748b", lineHeight: 20 }}>{line2}</Text>
        ) : null}
      </View>

      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: accentColor, fontSize: 13, fontWeight: "700" }}>
          {primaryActionLabel}
        </Text>
        <Text style={{ color: "#94a3b8", fontSize: 12 }}>
          {secondaryActionLabel}
        </Text>
      </View>
    </Pressable>
  );
}
