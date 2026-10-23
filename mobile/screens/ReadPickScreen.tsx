import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { COLORS } from "../constants/theme";
import {
  Button,
  Card,
  Input,
  Ionicons,
  ListRow,
  RowLeading,
  ScreenFrame,
  SegmentedToggle,
  TopBar,
  TYPE,
  Txt,
} from "../components/kit";
import { TourAnchor } from "../components/Tour";
import { ProjectBrief } from "../types";
import { estimateReadSeconds, formatClock, shortDate, stripMarkdown } from "../utils/text";

type Source = "paste" | "library";

interface Props {
  briefs: ProjectBrief[];
  onChoose: (title: string, text: string, sourceBrief?: ProjectBrief) => void;
  onBack: () => void;
}

export default function ReadPickScreen({ briefs, onChoose, onBack }: Props) {
  const [source, setSource] = useState<Source>("paste");
  const [text, setText] = useState("");

  const docs = useMemo(
    () =>
      briefs
        .filter((b) => b.direction === "voice-to-doc" && b.documentMarkdown.trim())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [briefs]
  );

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <ScreenFrame>
      <TopBar title="Read Aloud" left="back" onLeft={onBack} />

      <TourAnchor id="read.source">
        <View style={{ marginTop: 16 }}>
          <SegmentedToggle<Source>
            options={[
              { id: "paste", label: "Paste text" },
              { id: "library", label: "From Library" },
            ]}
            value={source}
            onChange={setSource}
          />
        </View>
      </TourAnchor>

      {source === "paste" ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
        >
          <Card style={styles.pasteCard}>
            <Input
              value={text}
              onChangeText={setText}
              placeholder="Paste or type the text you want read aloud…"
              multiline
              textAlignVertical="top"
              style={{ flex: 1, fontSize: 16, lineHeight: 23 }}
            />
            <Txt style={[TYPE.sub, { color: COLORS.inkMuted, marginTop: 10 }]}>
              {words === 0
                ? "No text yet"
                : `${words} words  ·  about ${formatClock(estimateReadSeconds(text))}`}
            </Txt>
          </Card>
          <View style={{ paddingTop: 12, paddingBottom: 6 }}>
            <Button
              label="Choose Voice"
              disabled={words === 0}
              onPress={() => onChoose("Pasted text", text.trim())}
            />
          </View>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView
          style={{ flex: 1, marginTop: 18 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 12 }}
        >
          {docs.length === 0 ? (
            <Card style={{ alignItems: "center", paddingVertical: 30 }}>
              <Txt style={[TYPE.title, { textAlign: "center" }]}>No documents yet</Txt>
              <Txt style={[TYPE.body, { color: COLORS.inkMuted, textAlign: "center", marginTop: 6 }]}>
                Create a document from the Record tab and it will appear here.
              </Txt>
            </Card>
          ) : (
            docs.map((b) => (
              <ListRow
                key={b.id}
                leading={
                  <RowLeading>
                    <Ionicons name="document-text-outline" size={23} color={COLORS.ink} />
                  </RowLeading>
                }
                title={b.title}
                subtitle={[shortDate(b.createdAt), b.documentType].join("  ·  ")}
                onPress={() => onChoose(b.title, stripMarkdown(b.documentMarkdown), b)}
                trailing={<Ionicons name="chevron-forward" size={20} color={COLORS.ink} />}
              />
            ))
          )}
        </ScrollView>
      )}
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  pasteCard: { flex: 1, marginTop: 18, padding: 20 },
});
