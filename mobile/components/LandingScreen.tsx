import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { COLORS } from "../constants/theme";

interface Props {
  bottomInset?: number;
  onGetStarted: () => void;
  onSignIn: () => void;
  onSelectTemplate: (text: string) => void;
}

const TEMPLATES = [
  {
    title: "On-Demand Delivery App",
    concept:
      "A local laundry/groceries delivery platform in a major metropolis with active rider tracking and secure digital payment gateways.",
  },
  {
    title: "B2B SaaS Inventory Tracker",
    concept:
      "A cloud-based dashboard for retail businesses to monitor stock levels across multi-site warehouses with auto-replenishment rules.",
  },
  {
    title: "Interactive AI Classroom Helper",
    concept:
      "An educational mobile companion app utilizing generative large language models to tailor homework problem sets based on user grade levels.",
  },
];

export default function LandingScreen({ bottomInset = 0, onGetStarted, onSignIn, onSelectTemplate }: Props) {
  return (
    <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 100 + bottomInset }]}>
      <View style={styles.hero}>
        <Text style={styles.badge}>✦ FounderBrief Technical Architect</Text>
        <Text style={styles.heroTitle}>Walk into your developer meeting with zero ambiguity</Text>
        <Text style={styles.heroSub}>
          We translate rough startup sketches into clean, developer-approved spec outlines, realistic
          estimation guidelines, and vetting checklists in minutes.
        </Text>
      </View>

      <View style={styles.metricsRow}>
        {[
          ["500+", "Briefs Crafted"],
          ["150+", "Agencies Aligned"],
          ["98.4%", "Dev Clarity Score"],
        ].map(([val, label]) => (
          <View key={label} style={styles.metricCard}>
            <Text style={styles.metricVal}>{val}</Text>
            <Text style={styles.metricLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>How FounderBrief Aligns Your Project</Text>
      <View style={styles.pillar}>
        <Text style={styles.pillarTitle}>Modular Features Map</Text>
        <Text style={styles.pillarText}>Scope isolated technical MVP tasks cleanly to avoid cost overruns.</Text>
      </View>
      <View style={styles.pillar}>
        <Text style={styles.pillarTitle}>Investor-Ready Stories</Text>
        <Text style={styles.pillarText}>Draft concise user personas to present goals and milestones clearly.</Text>
      </View>
      <View style={styles.pillar}>
        <Text style={styles.pillarTitle}>Agency Vetting Qs</Text>
        <Text style={styles.pillarText}>Challenging technical tests to vet development team capabilities.</Text>
      </View>

      <Text style={styles.sectionLabel}>Select a Starting Template to Configure</Text>
      {TEMPLATES.map((tpl) => (
        <Pressable key={tpl.title} style={styles.template} onPress={() => onSelectTemplate(tpl.concept)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.templateTitle}>{tpl.title}</Text>
            <Text style={styles.templateConcept} numberOfLines={2}>"{tpl.concept}"</Text>
          </View>
          <Text style={styles.playBtn}>▶</Text>
        </Pressable>
      ))}

      <Pressable style={styles.primaryBtn} onPress={onGetStarted}>
        <Text style={styles.primaryBtnText}>Draft Custom Idea Spec →</Text>
      </Pressable>
      <Pressable style={styles.secondaryBtn} onPress={onSignIn}>
        <Text style={styles.secondaryBtnText}>My Saved Briefs Profile</Text>
      </Pressable>
      <Text style={styles.footnote}>
        Designed for non-technical startup founders. Powered by Google Gemini.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  hero: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 16,
  },
  badge: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  metricsRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    alignItems: "center",
  },
  metricVal: { fontSize: 18, fontWeight: "900", color: COLORS.text },
  metricLabel: { fontSize: 8, fontWeight: "700", color: COLORS.textMuted, textAlign: "center", marginTop: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
  },
  pillar: {
    backgroundColor: COLORS.surfaceWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 8,
  },
  pillarTitle: { fontSize: 12, fontWeight: "800", color: COLORS.text, marginBottom: 4 },
  pillarText: { fontSize: 11, color: COLORS.textMuted, lineHeight: 16 },
  template: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  templateTitle: { fontSize: 11, fontWeight: "800", color: COLORS.accent },
  templateConcept: { fontSize: 11, color: COLORS.textMuted, fontStyle: "italic", marginTop: 2 },
  playBtn: {
    width: 28,
    height: 28,
    backgroundColor: COLORS.surfaceWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlign: "center",
    lineHeight: 26,
    fontSize: 10,
  },
  primaryBtn: {
    backgroundColor: COLORS.text,
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  primaryBtnText: { color: COLORS.bg, fontWeight: "800", fontSize: 14 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  secondaryBtnText: { color: COLORS.text, fontWeight: "600", fontSize: 14 },
  footnote: { textAlign: "center", fontSize: 11, color: COLORS.textDim, marginTop: 14 },
});
