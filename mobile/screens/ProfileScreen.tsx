import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { COLORS, FONTS, RADIUS } from "../constants/theme";
import ProfileSheet from "../components/ProfileSheet";
import {
  ActionSheet,
  Avatar,
  Button,
  Card,
  Input,
  Ionicons,
  MenuRow,
  ProgressBar,
  ScreenFrame,
  ScreenTitle,
  SegmentedToggle,
  Sheet,
  Tap,
  TYPE,
  Txt,
} from "../components/kit";
import { ExportDocFormat, SPOKEN_LANGUAGES, UserPreferences, UserProfile } from "../types";

interface Props {
  profile: UserProfile;
  isPro: boolean;
  usage: { used: number; limit: number | null };
  prefs: UserPreferences;
  onPrefsChange: (prefs: UserPreferences) => void;
  onSaveProfile: (name: string, email: string) => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onLogout: () => void;
  onUpgrade: () => void;
  onManageSubscription: () => void;
  onRestore: () => Promise<void>;
  onOpenVoiceSettings: () => void;
  onClearData: () => void;
  /** Dev builds only: toggles a local Pro flag for testing. */
  onToggleSandboxPro?: () => void;
}

type SheetId = "edit" | "signin" | "language" | "export" | "help" | null;

export default function ProfileScreen({
  profile,
  isPro,
  usage,
  prefs,
  onPrefsChange,
  onSaveProfile,
  onSignIn,
  onLogout,
  onUpgrade,
  onManageSubscription,
  onRestore,
  onOpenVoiceSettings,
  onClearData,
  onToggleSandboxPro,
}: Props) {
  const [sheet, setSheet] = useState<SheetId>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const close = () => setSheet(null);
  const hasName = profile.name.trim().length > 0;
  const unlimited = isPro || usage.limit === null;
  const progress = unlimited ? 1 : usage.limit ? usage.used / usage.limit : 0;

  const signIn = async () => {
    if (signingIn) return;
    setSigningIn(true);
    setSignInError("");
    try {
      await onSignIn(email.trim(), password);
      setPassword("");
      close();
    } catch (e) {
      setSignInError(e instanceof Error ? e.message : "Couldn't sign in.");
    } finally {
      setSigningIn(false);
    }
  };

  const restore = async () => {
    setRestoring(true);
    try {
      await onRestore();
    } finally {
      setRestoring(false);
    }
  };

  const confirmLogout = () =>
    Alert.alert("Log out?", "You'll be signed out on this device. Your Library stays on this device.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: onLogout },
    ]);

  const confirmClear = () =>
    Alert.alert(
      "Clear all local data?",
      "This deletes your Library, preferences and profile from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            close();
            onClearData();
          },
        },
      ]
    );

  const field = {
    height: 54,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
    justifyContent: "center" as const,
    marginBottom: 12,
  };

  return (
    <ScreenFrame>
      <ScreenTitle title="Profile" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Tap onPress={() => setSheet("edit")} scaleTo={0.98} style={styles.identity} accessibilityLabel="Edit profile">
          <Avatar name={profile.name} uri={profile.avatarUrl} glyph="person" size={98} />
          <Txt style={styles.name} numberOfLines={1}>
            {hasName ? profile.name : "Add your name"}
          </Txt>
          <Txt style={[TYPE.sub, { color: COLORS.inkMuted, marginTop: 2 }]} numberOfLines={1}>
            {profile.email || "Add your email"}
          </Txt>
        </Tap>

        <Card style={styles.planCard}>
          <Txt style={[TYPE.sub, { color: COLORS.inkMuted }]}>Current Plan</Txt>
          <Txt style={styles.planName}>{isPro ? "Pro Plan" : "Free Plan"}</Txt>
          <ProgressBar progress={progress} height={10} style={{ marginTop: 14 }} />
          <Txt style={[TYPE.sub, { color: COLORS.inkMuted, marginTop: 8 }]}>
            {unlimited
              ? "Unlimited documents and read-alouds"
              : `${usage.used} of ${usage.limit} used this month`}
          </Txt>
          <Button
            label={isPro ? "Manage Subscription" : "Upgrade to Pro"}
            variant="dark"
            onPress={isPro ? onManageSubscription : onUpgrade}
            style={{ marginTop: 18 }}
          />
        </Card>

        <View style={{ marginTop: 20 }}>
          <MenuRow
            icon="globe-outline"
            label="Language Preferences"
            right={prefs.language}
            onPress={() => setSheet("language")}
          />
          <MenuRow icon="volume-high-outline" label="Voice Settings" onPress={onOpenVoiceSettings} />
          <MenuRow
            icon="download-outline"
            label="Export Defaults"
            right={prefs.docFormat}
            onPress={() => setSheet("export")}
          />
          <MenuRow icon="help-circle-outline" label="Help & Support" onPress={() => setSheet("help")} />
          {profile.isLoggedIn ? (
            <MenuRow icon="log-out-outline" label="Log out" onPress={confirmLogout} />
          ) : (
            <MenuRow icon="log-in-outline" label="Sign in" onPress={() => setSheet("signin")} />
          )}
        </View>
      </ScrollView>

      <ProfileSheet
        visible={sheet === "edit"}
        title="Edit profile"
        initialName={profile.name}
        initialEmail={profile.email}
        onSave={(n, e) => {
          onSaveProfile(n, e);
          close();
        }}
        onClose={close}
      />

      <Sheet visible={sheet === "signin"} onClose={close}>
        <Txt style={TYPE.title}>Sign in</Txt>
        <Txt style={[TYPE.sub, { color: COLORS.inkMuted, marginTop: 4, marginBottom: 14 }]}>
          For FounderBrief team accounts.
        </Txt>
        <View style={field}>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>
        <View style={field}>
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            onSubmitEditing={signIn}
          />
        </View>
        {signInError ? (
          <Txt style={[TYPE.sub, { marginBottom: 10, marginLeft: 6 }]}>{signInError}</Txt>
        ) : null}
        <Button
          label="Sign in"
          loading={signingIn}
          disabled={!email.trim() || !password}
          onPress={signIn}
        />
      </Sheet>

      <ActionSheet
        visible={sheet === "language"}
        title="Language Preferences"
        onClose={close}
        options={SPOKEN_LANGUAGES.map((l) => ({
          label: l.label,
          icon: "language-outline" as const,
          selected: prefs.language === l.id,
          onPress: () => onPrefsChange({ ...prefs, language: l.id }),
        }))}
      />

      <Sheet visible={sheet === "export"} onClose={close}>
        <Txt style={TYPE.title}>Export Defaults</Txt>
        <Txt style={[TYPE.sub, { color: COLORS.inkMuted, marginTop: 4, marginBottom: 16 }]}>
          The format highlighted on a finished document.
        </Txt>
        <SegmentedToggle<ExportDocFormat>
          options={[
            { id: "Word", label: "Word" },
            { id: "PDF", label: "PDF" },
            { id: "TXT", label: "TXT" },
          ]}
          value={prefs.docFormat}
          onChange={(docFormat) => onPrefsChange({ ...prefs, docFormat })}
        />
      </Sheet>

      <Sheet visible={sheet === "help"} onClose={close}>
        <Txt style={[TYPE.title, { marginBottom: 12 }]}>Help & Support</Txt>
        <Txt style={[TYPE.body, { color: COLORS.inkMuted, marginBottom: 16 }]}>
          Record or type your idea, answer the calibration questions, then export the document or have
          it read aloud. Free accounts can create 3 documents each month.
        </Txt>
        <View style={{ gap: 12 }}>
          <Button
            label="Restore purchases"
            variant="secondary"
            loading={restoring}
            onPress={restore}
          />
          {__DEV__ && onToggleSandboxPro ? (
            <Button
              label={isPro ? "Dev: turn Pro off" : "Dev: simulate Pro"}
              variant="secondary"
              onPress={() => {
                close();
                onToggleSandboxPro();
              }}
            />
          ) : null}
          <Button label="Clear local data" variant="dark" onPress={confirmClear} />
        </View>
      </Sheet>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  identity: { alignItems: "center", marginTop: 14, marginBottom: 22 },
  name: { fontFamily: FONTS.bold, fontSize: 24, lineHeight: 30, marginTop: 14, maxWidth: "90%" },
  planCard: { padding: 22 },
  planName: { fontFamily: FONTS.bold, fontSize: 26, lineHeight: 32, marginTop: 2 },
});
