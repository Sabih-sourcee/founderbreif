import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { ProjectBrief, UserProfile } from "../types";
import { COLORS } from "../constants/theme";
import { loginUser } from "../services/api";

interface Props {
  bottomInset?: number;
  profile: UserProfile;
  savedBriefsCount: number;
  briefs: ProjectBrief[];
  onAuthChanged: (profile: UserProfile) => void;
}

export default function ProfileScreen({
  bottomInset = 0,
  profile: initialProfile,
  savedBriefsCount,
  briefs,
  onAuthChanged,
}: Props) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempCompany, setTempCompany] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  React.useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const counts = {
    Low: briefs.filter((b) => b.complexity === "Low").length,
    Medium: briefs.filter((b) => b.complexity === "Medium").length,
    High: briefs.filter((b) => b.complexity === "High").length,
  };
  const total = briefs.length || 1;

  const save = () => {
    const updated = {
      ...profile,
      name: tempName.trim() || profile.name,
      companyName: tempCompany.trim() || profile.companyName,
    };
    setProfile(updated);
    onAuthChanged(updated);
    setEditing(false);
  };

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword) {
      Alert.alert("Login", "Enter email and password.");
      return;
    }
    setLoginLoading(true);
    try {
      const session = await loginUser(loginEmail.trim(), loginPassword);
      const updated: UserProfile = {
        name: session.name,
        email: session.email,
        isLoggedIn: true,
        isAdmin: session.isAdmin,
        authToken: session.token,
        companyName: profile.companyName,
      };
      setProfile(updated);
      onAuthChanged(updated);
      setLoginPassword("");
      Alert.alert("Welcome", session.isAdmin ? "Admin access — unlimited brief generations." : "Logged in successfully.");
    } catch (err: unknown) {
      Alert.alert("Login failed", err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    const guest: UserProfile = {
      name: "Founder Guest",
      email: "founder@founderbrief.app",
      companyName: profile.companyName,
      isLoggedIn: false,
      isAdmin: false,
      authToken: undefined,
    };
    setProfile(guest);
    onAuthChanged(guest);
  };

  return (
    <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 100 + bottomInset }]}>
      <Text style={styles.title}>Founder Profile</Text>
      <Text style={styles.sub}>Sign in for unlimited brief generations (admin accounts).</Text>

      {profile.isAdmin && (
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>✦ ADMIN — Unlimited generations</Text>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
        </View>
        {editing ? (
          <View style={{ flex: 1 }}>
            <TextInput style={styles.input} value={tempName} onChangeText={setTempName} placeholder="Founder Name" />
            <TextInput style={styles.input} value={tempCompany} onChangeText={setTempCompany} placeholder="Company" />
            <View style={styles.editRow}>
              <Pressable style={styles.saveBtn} onPress={save}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
              <Pressable style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.email}>{profile.email}</Text>
            {profile.companyName ? <Text style={styles.company}>{profile.companyName}</Text> : null}
            <Pressable
              onPress={() => {
                setTempName(profile.name);
                setTempCompany(profile.companyName || "");
                setEditing(true);
              }}
            >
              <Text style={styles.editLink}>Edit Profile Details</Text>
            </Pressable>
          </View>
        )}
      </View>

      {!profile.isAdmin && (
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Admin Login</Text>
          <TextInput
            style={styles.input}
            value={loginEmail}
            onChangeText={setLoginEmail}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            value={loginPassword}
            onChangeText={setLoginPassword}
            placeholder="Password"
            secureTextEntry
          />
          <Pressable style={styles.loginBtn} onPress={handleLogin} disabled={loginLoading}>
            <Text style={styles.loginBtnText}>{loginLoading ? "Signing in…" : "Sign In"}</Text>
          </Pressable>
        </View>
      )}

      {profile.isLoggedIn && (
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      )}

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { flex: 1 }]}>
          <Text style={styles.statLabel}>Archived Specs</Text>
          <Text style={styles.statVal}>{savedBriefsCount}</Text>
        </View>
        <View style={[styles.statCard, { flex: 1 }]}>
          <Text style={styles.statLabel}>Access</Text>
          <Text style={styles.statSmall}>{profile.isAdmin ? "Unlimited" : "1 free"}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Project Scope Metrics</Text>
        {(["Low", "Medium", "High"] as const).map((lvl) => {
          const pct = Math.round((counts[lvl] / total) * 100);
          return (
            <View key={lvl} style={{ marginBottom: 12 }}>
              <View style={styles.barHeader}>
                <Text style={styles.barLabel}>
                  {lvl} ({counts[lvl]})
                </Text>
                <Text style={styles.barLabel}>{briefs.length ? pct : 0}%</Text>
              </View>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${briefs.length ? pct : 0}%`,
                      backgroundColor: lvl === "Low" ? COLORS.green : lvl === "High" ? COLORS.red : COLORS.accent,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  title: { fontSize: 22, fontWeight: "900", color: COLORS.text },
  sub: { fontSize: 12, color: COLORS.textMuted, marginTop: 4, marginBottom: 16 },
  adminBadge: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#86EFAC",
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  adminBadgeText: { fontSize: 12, fontWeight: "800", color: "#166534", textAlign: "center" },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    gap: 14,
  },
  loginCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  loginTitle: { fontSize: 14, fontWeight: "900", color: COLORS.text, marginBottom: 12 },
  loginBtn: {
    backgroundColor: COLORS.text,
    borderRadius: 10,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  loginBtnText: { color: COLORS.bg, fontWeight: "800", fontSize: 13 },
  logoutBtn: { alignItems: "center", marginBottom: 16 },
  logoutText: { fontSize: 12, fontWeight: "700", color: COLORS.textMuted },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.text,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: COLORS.bg, fontSize: 22, fontWeight: "900" },
  name: { fontSize: 16, fontWeight: "900", color: COLORS.text },
  email: { fontSize: 12, color: COLORS.textDim, marginTop: 2 },
  company: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.accent,
    backgroundColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 8,
    overflow: "hidden",
  },
  editLink: { fontSize: 12, fontWeight: "800", color: COLORS.accent, marginTop: 10 },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  editRow: { flexDirection: "row", gap: 8 },
  saveBtn: { backgroundColor: COLORS.text, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  saveBtnText: { color: COLORS.bg, fontWeight: "800", fontSize: 12 },
  cancelBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  cancelText: { fontSize: 12, fontWeight: "600", color: COLORS.textMuted },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  statLabel: { fontSize: 10, fontWeight: "800", color: COLORS.textMuted, textTransform: "uppercase" },
  statVal: { fontSize: 24, fontWeight: "900", color: COLORS.text, marginTop: 4 },
  statSmall: { fontSize: 14, fontWeight: "900", color: COLORS.text, marginTop: 6 },
  sectionTitle: { fontSize: 12, fontWeight: "900", color: COLORS.text, marginBottom: 14, textTransform: "uppercase" },
  barHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  barLabel: { fontSize: 11, fontWeight: "600", color: COLORS.textMuted },
  barBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: "hidden" },
  barFill: { height: "100%" },
});
