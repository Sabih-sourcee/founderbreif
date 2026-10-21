import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { COLORS, FONTS, RADIUS } from "../constants/theme";
import { Button, Input, Sheet, Tap, TYPE, Txt } from "./kit";

interface Props {
  visible: boolean;
  title: string;
  subtitle?: string;
  initialName: string;
  initialEmail: string;
  saveLabel?: string;
  onSave: (name: string, email: string) => void;
  /** When provided, a quiet "Not now" link is shown (first-run prompt). */
  onSkip?: () => void;
  onClose: () => void;
}

/** Name + email form used for first-run setup and "edit profile". */
export default function ProfileSheet({
  visible,
  title,
  subtitle,
  initialName,
  initialEmail,
  saveLabel = "Save",
  onSave,
  onSkip,
  onClose,
}: Props) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setEmail(initialEmail);
    }
  }, [visible, initialName, initialEmail]);

  const field = {
    height: 54,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
    justifyContent: "center" as const,
    marginBottom: 12,
  };

  return (
    <Sheet visible={visible} onClose={onSkip ?? onClose}>
      <Txt style={TYPE.title}>{title}</Txt>
      {subtitle ? (
        <Txt style={[TYPE.sub, { color: COLORS.inkMuted, marginTop: 4, marginBottom: 14 }]}>
          {subtitle}
        </Txt>
      ) : (
        <View style={{ height: 14 }} />
      )}
      <View style={field}>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
        />
      </View>
      <View style={field}>
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="Email (optional)"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="done"
        />
      </View>
      <Button
        label={saveLabel}
        disabled={name.trim().length === 0}
        onPress={() => onSave(name.trim(), email.trim())}
        style={{ marginTop: 4 }}
      />
      {onSkip ? (
        <Tap onPress={onSkip} style={{ alignItems: "center", paddingVertical: 14 }}>
          <Txt style={{ fontFamily: FONTS.medium, fontSize: 14, color: COLORS.inkMuted }}>Not now</Txt>
        </Tap>
      ) : null}
    </Sheet>
  );
}
