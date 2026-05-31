import { Pressable, Text, View } from "react-native";

type ActionButtonProps = {
  description?: string;
  disabled?: boolean;
  label: string;
  onPress?: () => void;
  tone?: "danger" | "ghost" | "primary" | "secondary";
};

type SectionCardProps = {
  children: React.ReactNode;
};

type StatCardProps = {
  label: string;
  value: string;
};

type FilterChipProps = {
  active?: boolean;
  label: string;
  onPress?: () => void;
};

const toneStyles = {
  primary: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
    textColor: "white",
    descriptionColor: "#c7d2fe",
  },
  secondary: {
    backgroundColor: "#eef2ff",
    borderColor: "#c7d2fe",
    textColor: "#3730a3",
    descriptionColor: "#6366f1",
  },
  ghost: {
    backgroundColor: "white",
    borderColor: "#e2e8f0",
    textColor: "#334155",
    descriptionColor: "#64748b",
  },
  danger: {
    backgroundColor: "#fff1f2",
    borderColor: "#fecdd3",
    textColor: "#be123c",
    descriptionColor: "#e11d48",
  },
} as const;

export function SectionCard({ children }: SectionCardProps) {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderColor: "#e2e8f0",
        borderRadius: 20,
        borderWidth: 1,
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        gap: 12,
        padding: 18,
      }}
    >
      {children}
    </View>
  );
}

export function ActionButton({
  description,
  disabled,
  label,
  onPress,
  tone = "primary",
}: ActionButtonProps) {
  const palette = toneStyles[tone];

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: disabled ? "#cbd5e1" : palette.backgroundColor,
        borderColor: disabled ? "#cbd5e1" : palette.borderColor,
        borderRadius: 16,
        borderWidth: 1,
        gap: description ? 4 : 0,
        opacity: pressed ? 0.82 : 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
      })}
    >
      <Text
        style={{
          color: disabled ? "#475569" : palette.textColor,
          fontSize: 15,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
      {description ? (
        <Text
          style={{
            color: disabled ? "#64748b" : palette.descriptionColor,
            fontSize: 12,
            lineHeight: 18,
          }}
        >
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <View
      style={{
        backgroundColor: "#eef2ff",
        borderRadius: 18,
        flex: 1,
        gap: 6,
        minWidth: 120,
        padding: 14,
      }}
    >
      <Text style={{ color: "#6366f1", fontSize: 12, fontWeight: "700" }}>
        {label}
      </Text>
      <Text
        style={{
          color: "#0f172a",
          fontSize: 24,
          fontVariant: ["tabular-nums"],
          fontWeight: "800",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export function FilterChip({ active, label, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: active ? "#4f46e5" : "white",
        borderColor: active ? "#4f46e5" : "#cbd5e1",
        borderRadius: 999,
        borderWidth: 1,
        opacity: pressed ? 0.85 : 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
      })}
    >
      <Text
        style={{
          color: active ? "white" : "#334155",
          fontSize: 13,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function EmptyState(props: { description: string; title: string }) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: "#f8fafc",
        borderColor: "#e2e8f0",
        borderRadius: 18,
        borderWidth: 1,
        gap: 8,
        padding: 24,
      }}
    >
      <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "700" }}>
        {props.title}
      </Text>
      <Text
        style={{
          color: "#64748b",
          fontSize: 14,
          lineHeight: 20,
          textAlign: "center",
        }}
      >
        {props.description}
      </Text>
    </View>
  );
}
