import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { COLORS, FONTS, RADIUS } from "../constants/theme";
import ProfileSheet from "../components/ProfileSheet";
import {
  ActionTile,
  CircleButton,
  Ionicons,
  ListRow,
  MaterialCommunityIcons,
  RowLeading,
  ScreenFrame,
  Sheet,
  Tap,
  TYPE,
  Txt,
} from "../components/kit";
import { TabId } from "../types";
import { firstName } from "../utils/text";

export interface AppNotification {
  id: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

interface Props {
  name: string;
  notifications: AppNotification[];
  /** Show the one-time name prompt. */
  needsProfile: boolean;
  onSaveProfile: (name: string, email: string) => void;
  onSkipProfile: () => void;
  onNavigate: (tab: TabId) => void;
}

const HOW_IT_WORKS = [
  { icon: "mic" as const, title: "Record your idea", text: "Speak or type it. Pick a language and a document." },
  { icon: "chatbubbles" as const, title: "Answer 7 questions", text: "Quick calibration so the document is specific to you." },
  { icon: "download" as const, title: "Export or listen", text: "Save as Word, PDF or TXT, or have it read aloud." },
];

export default function HomeScreen({
  name,
  notifications,
  needsProfile,
  onSaveProfile,
  onSkipProfile,
  onNavigate,
}: Props) {
  const [bellOpen, setBellOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const who = firstName(name) || "there";

  return (
    <ScreenFrame>
      <View style={styles.topRow}>
        <CircleButton onPress={() => setHelpOpen(true)} accessibilityLabel="Help">
          <Ionicons name="help" size={24} color={COLORS.ink} />
        </CircleButton>
        <CircleButton
          onPress={() => setBellOpen(true)}
          dot={notifications.length > 0}
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={23} color={COLORS.ink} />
        </CircleButton>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Txt style={[TYPE.greeting, styles.greeting]}>
          {`Hi ${who},\nReady to build\nsomething?`}
        </Txt>

        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <ActionTile label="Record" tinted onPress={() => onNavigate("Record")}>
              <Ionicons name="mic-outline" size={46} color={COLORS.ink} />
            </ActionTile>
            <ActionTile label="Read Aloud" onPress={() => onNavigate("ReadAloud")}>
              <Ionicons name="volume-high-outline" size={46} color={COLORS.ink} />
            </ActionTile>
          </View>
          <View style={styles.gridRow}>
            <ActionTile label="Library" onPress={() => onNavigate("Library")}>
              <MaterialCommunityIcons name="folder-text-outline" size={46} color={COLORS.ink} />
            </ActionTile>
            <ActionTile label="Profile" tinted onPress={() => onNavigate("Profile")}>
              <Ionicons name="person-outline" size={46} color={COLORS.ink} />
            </ActionTile>
          </View>
        </View>
      </ScrollView>

      <Sheet visible={bellOpen} onClose={() => setBellOpen(false)}>
        <Txt style={[TYPE.title, { marginBottom: 12 }]}>Notifications</Txt>
        {notifications.length === 0 ? (
          <Txt style={[TYPE.body, { color: COLORS.inkMuted, paddingVertical: 8 }]}>
            You're all caught up.
          </Txt>
        ) : (
          notifications.map((n) => (
            <ListRow
              key={n.id}
              leading={
                <RowLeading tone="accent">
                  <Ionicons name="notifications" size={20} color={COLORS.ink} />
                </RowLeading>
              }
              title={n.title}
              subtitle={n.subtitle}
              onPress={() => {
                setBellOpen(false);
                n.onPress();
              }}
            />
          ))
        )}
      </Sheet>

      <Sheet visible={helpOpen} onClose={() => setHelpOpen(false)}>
        <Txt style={[TYPE.title, { marginBottom: 14 }]}>How FounderBrief works</Txt>
        {HOW_IT_WORKS.map((step, i) => (
          <View key={step.title} style={styles.helpRow}>
            <RowLeading tone="accent" size={42}>
              <Ionicons name={step.icon} size={20} color={COLORS.ink} />
            </RowLeading>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Txt style={{ fontFamily: FONTS.bold, fontSize: 15 }}>{`${i + 1}. ${step.title}`}</Txt>
              <Txt style={[TYPE.sub, { color: COLORS.inkMuted, marginTop: 2 }]}>{step.text}</Txt>
            </View>
          </View>
        ))}
        <Tap
          onPress={() => {
            setHelpOpen(false);
            onNavigate("Profile");
          }}
          style={styles.helpLink}
        >
          <Txt style={{ fontFamily: FONTS.bold, fontSize: 14 }}>More help in Profile</Txt>
          <Ionicons name="chevron-forward" size={18} color={COLORS.ink} />
        </Tap>
      </Sheet>

      <ProfileSheet
        visible={needsProfile}
        title="Welcome to FounderBrief"
        subtitle="What should we call you? This personalises your Home screen and Profile."
        initialName=""
        initialEmail=""
        saveLabel="Continue"
        onSave={onSaveProfile}
        onSkip={onSkipProfile}
        onClose={onSkipProfile}
      />
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  content: { paddingTop: 34, paddingBottom: 16 },
  greeting: { paddingHorizontal: 4, marginBottom: 34 },
  grid: { gap: 16 },
  gridRow: { flexDirection: "row", gap: 16 },
  helpRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  helpLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.bg,
    marginTop: 4,
    gap: 4,
  },
});
