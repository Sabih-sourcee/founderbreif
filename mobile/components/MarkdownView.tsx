import React from "react";
import { StyleSheet, View } from "react-native";
import { COLORS, FONTS, RADIUS } from "../constants/theme";
import { TYPE, Txt } from "./kit";

function renderInline(text: string, base: object, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((p) => p !== "");
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <Txt key={`${keyPrefix}-${i}`} style={[base, { fontFamily: FONTS.bold }]}>
        {p.slice(2, -2)}
      </Txt>
    ) : (
      <Txt key={`${keyPrefix}-${i}`} style={base}>
        {p.replace(/`([^`]+)`/g, "$1")}
      </Txt>
    )
  );
}

type Block =
  | { kind: "h1" | "h2" | "h3" | "p"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "rule" };

function parse(markdown: string): Block[] {
  const blocks: Block[] = [];
  let quote: string[] = [];
  const flushQuote = () => {
    if (quote.length) {
      blocks.push({ kind: "quote", text: quote.join(" ") });
      quote = [];
    }
  };

  for (const raw of markdown.replace(/\r/g, "").split("\n")) {
    const line = raw.trimEnd();
    const t = line.trim();
    if (t.startsWith(">")) {
      quote.push(t.replace(/^>\s?/, ""));
      continue;
    }
    flushQuote();
    if (!t) continue;
    if (/^[-*_]{3,}$/.test(t)) blocks.push({ kind: "rule" });
    else if (t.startsWith("### ")) blocks.push({ kind: "h3", text: t.slice(4) });
    else if (t.startsWith("## ")) blocks.push({ kind: "h2", text: t.slice(3) });
    else if (t.startsWith("# ")) blocks.push({ kind: "h1", text: t.slice(2) });
    else if (/^[-*+]\s+/.test(t)) blocks.push({ kind: "bullet", text: t.replace(/^[-*+]\s+/, "") });
    else if (/^\|?[\s:-]+\|[\s|:-]*$/.test(t)) continue; // table separator row
    else if (t.startsWith("|")) {
      const cells = t
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      blocks.push({ kind: "p", text: cells.join("  ·  ") });
    } else blocks.push({ kind: "p", text: t });
  }
  flushQuote();
  return blocks;
}

/** Renders a generated document (Markdown) inside the white document card. */
export default function MarkdownView({ markdown }: { markdown: string }) {
  const blocks = parse(markdown);
  return (
    <View>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "h1":
            return (
              <Txt key={i} style={[TYPE.docTitle, styles.h1]}>
                {b.text}
              </Txt>
            );
          case "h2":
            return (
              <Txt key={i} style={[TYPE.docTitle, styles.h2]}>
                {b.text}
              </Txt>
            );
          case "h3":
            return (
              <Txt key={i} style={[TYPE.title, styles.h3]}>
                {b.text}
              </Txt>
            );
          case "bullet":
            return (
              <View key={i} style={styles.bulletRow}>
                <Txt style={[TYPE.body, { width: 18 }]}>•</Txt>
                <Txt style={[TYPE.body, { flex: 1 }]}>{renderInline(b.text, TYPE.body, `b${i}`)}</Txt>
              </View>
            );
          case "quote":
            return (
              <View key={i} style={styles.quote}>
                <Txt style={TYPE.body}>{renderInline(b.text, TYPE.body, `q${i}`)}</Txt>
              </View>
            );
          case "rule":
            return <View key={i} style={styles.rule} />;
          default:
            return (
              <Txt key={i} style={[TYPE.body, styles.p]}>
                {renderInline(b.text, TYPE.body, `p${i}`)}
              </Txt>
            );
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { marginBottom: 12 },
  h2: { fontSize: 20, lineHeight: 26, marginTop: 18, marginBottom: 8 },
  h3: { marginTop: 12, marginBottom: 6 },
  p: { marginBottom: 10 },
  bulletRow: { flexDirection: "row", marginBottom: 6, paddingRight: 4 },
  quote: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.bubble - 6,
    padding: 14,
    marginVertical: 10,
  },
  rule: { height: 1, backgroundColor: COLORS.inkTrack, marginVertical: 14 },
});
