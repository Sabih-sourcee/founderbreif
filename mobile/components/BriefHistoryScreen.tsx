import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { ProjectBrief } from "../types";
import { COLORS } from "../constants/theme";

interface Props {
  bottomInset?: number;
  briefs: ProjectBrief[];
  onSelectBrief: (brief: ProjectBrief) => void;
  onDeleteBrief: (id: string) => void;
  onNewBrief: () => void;
}

export default function BriefHistoryScreen({ bottomInset = 0, briefs, onSelectBrief, onDeleteBrief, onNewBrief }: Props) {
  const [filter, setFilter] = useState<"All" | "Low" | "Medium" | "High">("All");

  const filtered = briefs.filter((b) => filter === "All" || b.complexity === filter);

  return (
    <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 100 + bottomInset }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Brief Archive</Text>
          <Text style={styles.sub}>Historically compiled technical startup briefs.</Text>
        </View>
        <Pressable style={styles.newBtn} onPress={onNewBrief}>
          <Text style={styles.newBtnText}>+ Draft New</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {(["All", "Low", "Medium", "High"] as const).map((lvl) => (
          <Pressable
            key={lvl}
            style={[styles.filterChip, filter === lvl && styles.filterActive]}
            onPress={() => setFilter(lvl)}
          >
            <Text style={[styles.filterText, filter === lvl && styles.filterTextActive]}>{lvl} Complexity</Text>
          </Pressable>
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No archived specifications found</Text>
          <Text style={styles.emptySub}>Compile your first startup vision to forge a durable brief!</Text>
          <Pressable onPress={onNewBrief}>
            <Text style={styles.emptyLink}>Start Onboarding Questionnaire</Text>
          </Pressable>
        </View>
      ) : (
        filtered.map((b) => (
          <View key={b.id} style={styles.item}>
            <Pressable onPress={() => onSelectBrief(b)} style={{ flex: 1 }}>
              <View style={styles.tags}>
                <Text style={styles.tag}>{b.answers?.platform || "Both"}</Text>
                <Text style={[styles.tag, styles.complexityTag]}>{b.complexity}</Text>
                <Text style={styles.date}>{new Date(b.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.itemTitle}>{b.title}</Text>
              <Text style={styles.itemDesc} numberOfLines={2}>{b.description}</Text>
            </Pressable>
            <View style={styles.actions}>
              <Pressable style={styles.openBtn} onPress={() => onSelectBrief(b)}>
                <Text style={styles.openBtnText}>Open Spec</Text>
              </Pressable>
              <Pressable
                style={styles.delBtn}
                onPress={() =>
                  Alert.alert("Delete brief?", "This cannot be undone.", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => onDeleteBrief(b.id) },
                  ])
                }
              >
                <Text>🗑</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "900", color: COLORS.text },
  sub: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  newBtn: { backgroundColor: COLORS.accent, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  newBtnText: { color: COLORS.bg, fontWeight: "800", fontSize: 11 },
  filters: { marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginRight: 8,
  },
  filterActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  filterText: { fontSize: 11, fontWeight: "700", color: COLORS.textMuted },
  filterTextActive: { color: COLORS.bg },
  empty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 6 },
  emptySub: { fontSize: 12, color: COLORS.textMuted, textAlign: "center", marginBottom: 12 },
  emptyLink: { fontSize: 12, fontWeight: "800", color: COLORS.accent, textDecorationLine: "underline" },
  item: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  tag: { fontSize: 9, fontWeight: "800", backgroundColor: COLORS.border, color: COLORS.textMuted, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: "hidden" },
  complexityTag: { backgroundColor: "#FFEDD5", color: COLORS.accent },
  date: { fontSize: 10, color: COLORS.textDim, alignSelf: "center" },
  itemTitle: { fontSize: 16, fontWeight: "900", color: COLORS.text, marginBottom: 4 },
  itemDesc: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
  actions: { flexDirection: "row", gap: 8, marginTop: 12, justifyContent: "flex-end" },
  openBtn: { backgroundColor: COLORS.text, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  openBtnText: { color: COLORS.bg, fontWeight: "800", fontSize: 11 },
  delBtn: { width: 40, height: 40, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, alignItems: "center", justifyContent: "center" },
});
