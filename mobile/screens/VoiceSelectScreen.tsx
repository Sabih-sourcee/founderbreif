import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { COLORS, FONTS, RADIUS } from "../constants/theme";
import { previewVoice, stopSpeech } from "../hooks/useTtsPlayer";
import {
  ActionSheet,
  Button,
  Ionicons,
  ListRow,
  MaterialCommunityIcons,
  RowLeading,
  ScreenFrame,
  SearchBar,
  Tap,
  TopBar,
  Txt,
  TYPE,
} from "../components/kit";
import { SPOKEN_LANGUAGES, SpokenLanguage, VOICES, VoiceProfile } from "../types";

interface Props {
  isPro: boolean;
  initialLanguage: SpokenLanguage;
  selectedId?: string;
  recentIds: string[];
  onConfirm: (voice: VoiceProfile) => void;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function VoiceSelectScreen({
  isPro,
  initialLanguage,
  selectedId,
  recentIds,
  onConfirm,
  onClose,
  onUpgrade,
}: Props) {
  const [language, setLanguage] = useState<SpokenLanguage>(initialLanguage);
  const [query, setQuery] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [selected, setSelected] = useState<string | undefined>(selectedId);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      stopSpeech();
      if (previewTimer.current) clearTimeout(previewTimer.current);
    },
    []
  );

  const q = query.trim().toLowerCase();
  const matches = (v: VoiceProfile) =>
    v.language === language &&
    (!q ||
      v.name.toLowerCase().includes(q) ||
      v.region.toLowerCase().includes(q) ||
      v.gender.toLowerCase().includes(q));

  const filtered = useMemo(() => VOICES.filter(matches), [language, q]);
  const recents = useMemo(
    () =>
      recentIds
        .map((id) => filtered.find((v) => v.id === id))
        .filter((v): v is VoiceProfile => !!v),
    [recentIds, filtered]
  );
  const others = filtered.filter((v) => !recents.some((r) => r.id === v.id));

  const chosen = VOICES.find((v) => v.id === selected);
  const locked = (v: VoiceProfile) => v.isPremium && !isPro;

  const preview = (v: VoiceProfile) => {
    if (previewing === v.id) {
      stopSpeech();
      setPreviewing(null);
      return;
    }
    setPreviewing(v.id);
    previewVoice(v);
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => setPreviewing(null), 6000);
  };

  const renderRow = (v: VoiceProfile) => {
    const isLocked = locked(v);
    return (
      <ListRow
        key={v.id}
        dimmed={isLocked}
        selected={selected === v.id && !isLocked}
        leading={
          <RowLeading size={50}>
            <Ionicons
              name={v.gender === "Female" ? "woman-outline" : "man-outline"}
              size={28}
              color={COLORS.ink}
            />
          </RowLeading>
        }
        title={v.name}
        subtitle={`${v.region}  ·  ${v.gender}`}
        onPress={() => (isLocked ? onUpgrade() : setSelected(v.id))}
        accessibilityLabel={isLocked ? `${v.name}, premium voice, locked` : v.name}
        trailing={
          isLocked ? (
            <MaterialCommunityIcons name="crown" size={24} color={COLORS.ink} style={{ marginHorizontal: 8 }} />
          ) : (
            <Tap
              onPress={() => preview(v)}
              accessibilityLabel={previewing === v.id ? `Stop preview of ${v.name}` : `Preview ${v.name}`}
              style={styles.playBtn}
            >
              <Ionicons
                name={previewing === v.id ? "stop" : "play"}
                size={18}
                color={COLORS.white}
                style={previewing === v.id ? undefined : { marginLeft: 2 }}
              />
            </Tap>
          )
        }
      />
    );
  };

  return (
    <ScreenFrame>
      <TopBar title="Select Voice" left="close" onLeft={onClose} />

      <View style={{ marginTop: 16, marginBottom: 18 }}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search voices"
          right={
            <Tap
              onPress={() => setLangOpen(true)}
              accessibilityLabel={`Language: ${language}`}
              style={styles.langChip}
            >
              <Txt style={{ fontFamily: FONTS.semibold, fontSize: 14 }}>{language}</Txt>
              <Ionicons name="chevron-down" size={16} color={COLORS.ink} style={{ marginLeft: 4 }} />
            </Tap>
          }
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {recents.length > 0 ? (
          <>
            <Txt style={styles.section}>Recently Used</Txt>
            {recents.map(renderRow)}
          </>
        ) : null}

        {others.length > 0 ? (
          <>
            <Txt style={styles.section}>All Voices</Txt>
            {others.map(renderRow)}
          </>
        ) : null}

        {filtered.length === 0 ? (
          <Txt style={[TYPE.body, { color: COLORS.inkMuted, textAlign: "center", marginTop: 30 }]}>
            No voices match your search.
          </Txt>
        ) : null}
      </ScrollView>

      <View style={{ paddingTop: 10, paddingBottom: 6 }}>
        <Button
          label="OK"
          disabled={!chosen}
          onPress={() => chosen && onConfirm(chosen)}
        />
      </View>

      <ActionSheet
        visible={langOpen}
        title="Language"
        onClose={() => setLangOpen(false)}
        options={SPOKEN_LANGUAGES.map((l) => ({
          label: l.label,
          icon: "language-outline" as const,
          selected: l.id === language,
          onPress: () => setLanguage(l.id),
        }))}
      />
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  section: {
    fontFamily: FONTS.semibold,
    fontSize: 15,
    color: COLORS.inkMuted,
    marginBottom: 12,
    marginLeft: 6,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  langChip: {
    height: 38,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
});
