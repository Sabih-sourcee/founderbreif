import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { COLORS, FONTS, RADIUS, SHADOW } from "../constants/theme";
import MarkdownView from "../components/MarkdownView";
import { ActionSheet, Card, Ionicons, ScreenFrame, Tap, TopBar, Txt } from "../components/kit";
import { exportDocument, shareAsText } from "../services/exporter";
import { DOCUMENT_OUTPUT_TYPES, ExportDocFormat, ProjectBrief } from "../types";

const FORMATS: Array<{ id: ExportDocFormat; label: string }> = [
  { id: "Word", label: "Word" },
  { id: "PDF", label: "PDF" },
  { id: "TXT", label: "TXT" },
];

interface Props {
  brief: ProjectBrief;
  defaultFormat: ExportDocFormat;
  onExported: (format: ExportDocFormat) => void;
  onReadAloud: () => void;
  onDelete: () => void;
  onBack: () => void;
  onNotice: (message: string) => void;
}

export default function ResultScreen({
  brief,
  defaultFormat,
  onExported,
  onReadAloud,
  onDelete,
  onBack,
  onNotice,
}: Props) {
  const [active, setActive] = useState<ExportDocFormat>(defaultFormat);
  const [busy, setBusy] = useState<ExportDocFormat | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const typeInfo = DOCUMENT_OUTPUT_TYPES.find((d) => d.id === brief.documentType);
  const barTitle = `Your ${typeInfo?.barLabel ?? "Document"}`;

  const doExport = async (format: ExportDocFormat) => {
    if (busy) return;
    setActive(format);
    setBusy(format);
    try {
      await exportDocument(brief, format);
      onExported(format);
    } catch (e) {
      onNotice(e instanceof Error ? e.message : "Couldn't export this document.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScreenFrame>
      <TopBar
        title={barTitle}
        left="back"
        onLeft={onBack}
        rightIcon="ellipsis-horizontal"
        onRight={() => setMenuOpen(true)}
      />

      <Card style={styles.docCard}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
          <MarkdownView markdown={brief.documentMarkdown} />
        </ScrollView>
      </Card>

      <View style={styles.exportRow}>
        {FORMATS.map((f) => {
          const isActive = f.id === active;
          return (
            <Tap
              key={f.id}
              onPress={() => doExport(f.id)}
              scaleTo={0.95}
              accessibilityLabel={`Export as ${f.label}`}
              accessibilityState={{ selected: isActive }}
              style={[
                styles.exportPill,
                SHADOW,
                { backgroundColor: isActive ? COLORS.accent : COLORS.white },
              ]}
            >
              <Ionicons
                name={busy === f.id ? "hourglass-outline" : "document-text-outline"}
                size={20}
                color={COLORS.ink}
              />
              <Txt style={{ fontFamily: FONTS.bold, fontSize: 15, marginLeft: 8 }}>{f.label}</Txt>
            </Tap>
          );
        })}
      </View>

      <ActionSheet
        visible={menuOpen}
        title={brief.title}
        onClose={() => setMenuOpen(false)}
        options={[
          { label: "Read aloud", icon: "volume-high-outline", onPress: onReadAloud },
          {
            label: "Share as text",
            icon: "share-outline",
            onPress: () => {
              shareAsText(brief).catch(() => onNotice("Couldn't share this document."));
            },
          },
          { label: "Delete", icon: "trash-outline", onPress: onDelete },
        ]}
      />
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  docCard: { flex: 1, marginTop: 16, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 14 },
  exportRow: { flexDirection: "row", gap: 10, paddingTop: 14, paddingBottom: 6 },
  exportPill: {
    flex: 1,
    height: 54,
    borderRadius: RADIUS.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
