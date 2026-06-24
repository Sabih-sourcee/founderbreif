import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Share } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { ProjectBrief } from "../types";
import { COLORS } from "../constants/theme";
import { markdownToHtml } from "../utils/markdownToHtml";

interface Props {
  brief: ProjectBrief;
  onRestart: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  return items.map((item, i) => (
    <Text key={i} style={styles.listItem}>
      • {item}
    </Text>
  ));
}

export default function BriefResultScreen({ brief, onRestart }: Props) {
  const insets = useSafeAreaInsets();
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleShare = async () => {
    await Share.share({ message: brief.documentMarkdown || brief.tldr });
  };

  const handlePdf = async () => {
    try {
      setPdfLoading(true);
      const html = markdownToHtml(brief.documentMarkdown || `# ${brief.title}\n\n${brief.tldr}`);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Download PDF Brief" });
      }
    } catch {
      Alert.alert("Export failed", "Could not create PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  const complexityColor =
    brief.complexity === "Low" ? COLORS.green : brief.complexity === "High" ? COLORS.red : COLORS.accent;

  return (
    <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 120 + insets.bottom }]}>
      <View style={styles.successIcon}>
        <Text style={{ fontSize: 24 }}>✓</Text>
      </View>
      <Text style={styles.title}>Your project brief is ready!</Text>
      <Text style={styles.sub}>A full founder-ready document — readable, shareable, and exportable as PDF.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Project</Text>
        <Text style={styles.briefTitle}>{brief.title}</Text>
        <Text style={styles.tldrLabel}>TL;DR</Text>
        <Text style={styles.tldr}>{brief.tldr}</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.label}>Complexity</Text>
          <Text style={[styles.metric, { color: complexityColor }]}>{brief.complexity}</Text>
        </View>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.label}>Est. Budget</Text>
          <Text style={styles.metric}>{brief.estimatedBudget}</Text>
        </View>
      </View>

      <View style={styles.designRow}>
        <View style={styles.designChip}>
          <Text style={styles.designChipLabel}>Grid</Text>
          <Text style={styles.designChipVal}>{brief.answers.gridSystem}</Text>
        </View>
        <View style={styles.designChip}>
          <Text style={styles.designChipLabel}>Fonts</Text>
          <Text style={styles.designChipVal} numberOfLines={2}>{brief.answers.fontStyle.split("(")[0].trim()}</Text>
        </View>
        <View style={styles.designChip}>
          <Text style={styles.designChipLabel}>Theme</Text>
          <Text style={styles.designChipVal} numberOfLines={2}>{brief.answers.colorTheme.split("(")[0].trim()}</Text>
        </View>
      </View>

      <Section title="Business Goals">
        <BulletList items={brief.businessGoals} />
      </Section>

      <Section title="User Goals">
        <BulletList items={brief.userGoals} />
      </Section>

      <Section title="Non-Goals">
        <BulletList items={brief.nonGoals} />
      </Section>

      <Section title="User Stories">
        {brief.userStories.map((s, i) => (
          <View key={i} style={styles.storyBox}>
            <Text style={styles.storyText}>"{s}"</Text>
          </View>
        ))}
      </Section>

      <Section title="Functional Requirements">
        {brief.functionalRequirements.map((r, i) => (
          <View key={i} style={styles.reqBox}>
            <Text style={styles.reqName}>
              {r.name} <Text style={styles.reqPriority}>({r.priority})</Text>
            </Text>
            <Text style={styles.reqDetail}>{r.details}</Text>
          </View>
        ))}
      </Section>

      <Section title="User Experience">
        <Text style={styles.subSection}>Entry Point</Text>
        <Text style={styles.bodyText}>{brief.userExperience.entryPoint}</Text>
        <Text style={[styles.subSection, { marginTop: 12 }]}>Core Flow</Text>
        <BulletList items={brief.userExperience.coreSteps} />
        <Text style={[styles.subSection, { marginTop: 12 }]}>UI Highlights</Text>
        <BulletList items={brief.userExperience.uiHighlights} />
      </Section>

      <Section title="Narrative">
        <Text style={styles.narrative}>{brief.narrative}</Text>
      </Section>

      <Section title="Success Metrics">
        <Text style={styles.subSection}>User-centric</Text>
        <BulletList items={brief.successMetrics.userCentric} />
        <Text style={[styles.subSection, { marginTop: 10 }]}>Business</Text>
        <BulletList items={brief.successMetrics.business} />
        <Text style={[styles.subSection, { marginTop: 10 }]}>Technical</Text>
        <BulletList items={brief.successMetrics.technical} />
      </Section>

      <Section title="Technical Considerations">
        <Text style={styles.subSection}>Stack needs</Text>
        <BulletList items={brief.technicalConsiderations.needs} />
        <Text style={[styles.subSection, { marginTop: 10 }]}>Challenges</Text>
        <BulletList items={brief.technicalConsiderations.challenges} />
      </Section>

      <Section title="Milestones">
        <Text style={styles.bodyText}>
          {brief.milestones.estimate} · Team: {brief.milestones.teamSize}
        </Text>
        {brief.milestones.phases.map((p, i) => (
          <View key={i} style={styles.phaseBox}>
            <Text style={styles.phaseName}>{p.name}</Text>
            <Text style={styles.phaseMeta}>{p.duration}</Text>
            <Text style={styles.phaseDel}>{p.deliverables}</Text>
          </View>
        ))}
      </Section>

      <Pressable style={styles.primaryBtn} onPress={handlePdf} disabled={pdfLoading}>
        <Text style={styles.primaryBtnText}>{pdfLoading ? "Creating PDF…" : "Download PDF Brief"}</Text>
      </Pressable>
      <Pressable style={styles.secondaryBtn} onPress={handleShare}>
        <Text style={styles.secondaryBtnText}>Share Brief</Text>
      </Pressable>
      <Pressable onPress={onRestart}>
        <Text style={styles.restart}>Formulate Another Idea Brief</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DCFCE7",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "900", color: COLORS.text, textAlign: "center" },
  sub: { fontSize: 12, color: COLORS.textMuted, textAlign: "center", marginBottom: 20 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  label: { fontSize: 10, fontWeight: "800", color: COLORS.accent, textTransform: "uppercase", marginBottom: 4 },
  briefTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text, marginBottom: 10 },
  tldrLabel: { fontSize: 10, fontWeight: "800", color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 4 },
  tldr: { fontSize: 13, color: COLORS.text, lineHeight: 20 },
  row: { flexDirection: "row", gap: 10, marginBottom: 4 },
  metric: { fontSize: 16, fontWeight: "900", color: COLORS.text, marginTop: 4 },
  designRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  designChip: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  designChipLabel: { fontSize: 9, fontWeight: "800", color: COLORS.textMuted, textTransform: "uppercase" },
  designChipVal: { fontSize: 11, fontWeight: "700", color: COLORS.text, marginTop: 4 },
  sectionTitle: { fontSize: 12, fontWeight: "900", color: COLORS.text, textTransform: "uppercase", marginBottom: 12 },
  listItem: { fontSize: 13, color: COLORS.text, lineHeight: 22, marginBottom: 6 },
  storyBox: { backgroundColor: COLORS.bg, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, padding: 10, marginBottom: 8 },
  storyText: { fontSize: 12, color: COLORS.textMuted, fontStyle: "italic", lineHeight: 18 },
  reqBox: { marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  reqName: { fontSize: 13, fontWeight: "800", color: COLORS.text },
  reqPriority: { fontSize: 11, fontWeight: "600", color: COLORS.accent },
  reqDetail: { fontSize: 12, color: COLORS.textMuted, marginTop: 4, lineHeight: 18 },
  subSection: { fontSize: 11, fontWeight: "800", color: COLORS.accent, textTransform: "uppercase", marginBottom: 6 },
  bodyText: { fontSize: 13, color: COLORS.text, lineHeight: 20 },
  narrative: { fontSize: 13, color: COLORS.text, lineHeight: 22, fontStyle: "italic" },
  phaseBox: { marginBottom: 10, padding: 10, backgroundColor: COLORS.bg, borderRadius: 8 },
  phaseName: { fontSize: 13, fontWeight: "800", color: COLORS.text },
  phaseMeta: { fontSize: 11, color: COLORS.accent, marginTop: 2 },
  phaseDel: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  primaryBtn: { backgroundColor: COLORS.text, borderRadius: 12, height: 48, alignItems: "center", justifyContent: "center", marginTop: 8 },
  primaryBtnText: { color: COLORS.bg, fontWeight: "800", fontSize: 13 },
  secondaryBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, height: 44, alignItems: "center", justifyContent: "center", marginTop: 8 },
  secondaryBtnText: { fontWeight: "700", fontSize: 12, color: COLORS.text },
  restart: { textAlign: "center", color: COLORS.accent, fontWeight: "800", fontSize: 12, marginTop: 16 },
});
