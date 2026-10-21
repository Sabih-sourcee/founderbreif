import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { COLORS, FONTS } from "../constants/theme";
import {
  ActionSheet,
  Button,
  Card,
  CircleButton,
  FilterChip,
  Ionicons,
  ListRow,
  MaterialCommunityIcons,
  RowLeading,
  ScreenFrame,
  ScreenTitle,
  SearchBar,
  Tap,
  TYPE,
  Txt,
} from "../components/kit";
import { ProjectBrief } from "../types";
import { formatClock, shortDate } from "../utils/text";

type Filter = "All" | "Documents" | "Audio";
const FILTERS: Filter[] = ["All", "Documents", "Audio"];

interface Props {
  briefs: ProjectBrief[];
  onOpen: (brief: ProjectBrief) => void;
  onReadAloud: (brief: ProjectBrief) => void;
  onDelete: (brief: ProjectBrief) => void;
  onRecord: () => void;
}

export default function LibraryScreen({ briefs, onOpen, onReadAloud, onDelete, onRecord }: Props) {
  const [filter, setFilter] = useState<Filter>("All");
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<ProjectBrief | null>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...briefs]
      .filter((b) => {
        const isAudio = b.direction === "doc-to-voice";
        if (filter === "Documents" && isAudio) return false;
        if (filter === "Audio" && !isAudio) return false;
        if (!q) return true;
        return b.title.toLowerCase().includes(q) || b.documentType.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [briefs, filter, query]);

  const confirmDelete = (b: ProjectBrief) =>
    Alert.alert("Delete from Library?", `"${b.title}" will be removed from this device.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(b) },
    ]);

  const sheetOptions = target
    ? [
        {
          label: target.direction === "doc-to-voice" ? "Play again" : "Open",
          icon: (target.direction === "doc-to-voice" ? "play-outline" : "open-outline") as
            | "play-outline"
            | "open-outline",
          onPress: () => onOpen(target),
        },
        ...(target.direction === "voice-to-doc"
          ? [
              {
                label: "Read aloud",
                icon: "volume-high-outline" as const,
                onPress: () => onReadAloud(target),
              },
            ]
          : []),
        { label: "Delete", icon: "trash-outline" as const, onPress: () => confirmDelete(target) },
      ]
    : [];

  return (
    <ScreenFrame>
      <ScreenTitle
        title="Library"
        right={
          <CircleButton
            onPress={() => {
              if (searching) setQuery("");
              setSearching((s) => !s);
            }}
            accessibilityLabel={searching ? "Close search" : "Search library"}
          >
            <Ionicons name={searching ? "close" : "search"} size={22} color={COLORS.ink} />
          </CircleButton>
        }
      />

      {searching ? (
        <View style={{ marginTop: 12 }}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search your library" autoFocus />
        </View>
      ) : null}

      <View style={styles.chips}>
        {FILTERS.map((f) => (
          <FilterChip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {items.length === 0 ? (
          <Card style={{ alignItems: "center", paddingVertical: 32, marginTop: 8 }}>
            <RowLeading tone="accent" size={64}>
              <MaterialCommunityIcons name="folder-text-outline" size={32} color={COLORS.ink} />
            </RowLeading>
            <Txt style={[TYPE.title, { marginTop: 16, textAlign: "center" }]}>
              {briefs.length === 0 ? "Nothing saved yet" : "No matches"}
            </Txt>
            <Txt style={[TYPE.body, { color: COLORS.inkMuted, textAlign: "center", marginTop: 6 }]}>
              {briefs.length === 0
                ? "Documents you create and audio you save will show up here."
                : "Try a different filter or search."}
            </Txt>
            {briefs.length === 0 ? (
              <Button label="Record your first idea" onPress={onRecord} style={{ marginTop: 20, alignSelf: "stretch" }} />
            ) : null}
          </Card>
        ) : (
          items.map((b) => {
            const isAudio = b.direction === "doc-to-voice";
            const date = shortDate(b.createdAt);
            const subtitle = isAudio
              ? [date, "Audio", b.durationSec ? formatClock(b.durationSec) : ""].filter(Boolean).join("  ·  ")
              : [date, b.documentType].filter(Boolean).join("  ·  ");
            return (
              <ListRow
                key={b.id}
                leading={
                  <RowLeading tone={isAudio ? "accent" : "teal"}>
                    {isAudio ? (
                      <MaterialCommunityIcons name="waveform" size={26} color={COLORS.ink} />
                    ) : (
                      <Ionicons name="document-text-outline" size={23} color={COLORS.ink} />
                    )}
                  </RowLeading>
                }
                title={b.title}
                subtitle={subtitle}
                onPress={() => onOpen(b)}
                trailing={
                  <Tap
                    onPress={() => setTarget(b)}
                    accessibilityLabel={`Options for ${b.title}`}
                    hitSlop={12}
                    style={styles.more}
                  >
                    <Ionicons name="ellipsis-vertical" size={22} color={COLORS.ink} />
                  </Tap>
                }
              />
            );
          })
        )}
      </ScrollView>

      <ActionSheet
        visible={target !== null}
        title={target?.title}
        options={sheetOptions}
        onClose={() => setTarget(null)}
      />
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", gap: 10, marginTop: 16, marginBottom: 18, paddingHorizontal: 2 },
  more: { width: 34, height: 40, alignItems: "center", justifyContent: "center" },
});
