import * as React from "react";
import { cn } from "../lib/cn";
import { CodeBlock } from "./code-block";
import { InlineCitation, type Source } from "./sources";
import { useSmoothText, type SmoothTextOptions } from "../lib/smooth";
import { ImagePreview } from "./media";

/**
 * Zero-dependency, streaming-friendly Markdown renderer for LLM output.
 * Supports: headings, paragraphs, bold/italic/strike, inline code, fenced code
 * (incl. unterminated fences while streaming), links, autolinks, images, lists
 * (nested, ordered, task lists), blockquotes, tables, hr, and [n] citations.
 * Never uses dangerouslySetInnerHTML.
 */

type Block =
  | { type: "p"; text: string }
  | { type: "h"; level: number; text: string }
  | { type: "code"; lang: string; code: string; closed: boolean }
  | { type: "quote"; blocks: Block[] }
  | { type: "list"; ordered: boolean; start: number; items: ListItem[] }
  | { type: "hr" }
  | { type: "table"; header: string[]; align: ("left" | "center" | "right" | null)[]; rows: string[][] };

type ListItem = { text: string; checked: boolean | null; children: Block[] };

const FENCE = /^(\s*)(`{3,}|~{3,})\s*([^\s`]*)/;
const HEADING = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const HR = /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/;
const QUOTE = /^\s{0,3}>\s?/;
const LIST = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
const TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

const indentOf = (s: string) => s.match(/^\s*/)![0].replace(/\t/g, "    ").length;
const isBlank = (s: string) => s.trim() === "";

function splitRow(row: string) {
  let r = row.trim();
  if (r.startsWith("|")) r = r.slice(1);
  if (r.endsWith("|") && !r.endsWith("\\|")) r = r.slice(0, -1);
  return r.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
}

function startsBlock(line: string, next?: string) {
  return (
    FENCE.test(line) ||
    HEADING.test(line) ||
    HR.test(line) ||
    QUOTE.test(line) ||
    LIST.test(line) ||
    (line.includes("|") && next !== undefined && TABLE_SEP.test(next))
  );
}

function dedent(lines: string[]) {
  const min = Math.min(...lines.filter((l) => !isBlank(l)).map(indentOf), Infinity);
  return lines.map((l) => l.replace(/\t/g, "    ").slice(Number.isFinite(min) ? min : 0));
}

export function parseMarkdown(src: string): Block[] {
  return parseLines(src.replace(/\r\n?/g, "\n").split("\n"));
}

function parseLines(lines: string[]): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) {
      i++;
      continue;
    }

    const fence = FENCE.exec(line);
    if (fence) {
      const marker = fence[2];
      const body: string[] = [];
      i++;
      let closed = false;
      while (i < lines.length) {
        if (lines[i].trim().startsWith(marker[0].repeat(marker.length)) && lines[i].trim().replace(/[`~]/g, "") === "") {
          closed = true;
          i++;
          break;
        }
        body.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", lang: fence[3] ?? "", code: dedent(body).join("\n"), closed });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({ type: "h", level: heading[1].length, text: heading[2] });
      i++;
      continue;
    }

    if (HR.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    if (QUOTE.test(line)) {
      const body: string[] = [];
      while (i < lines.length && !isBlank(lines[i]) && (QUOTE.test(lines[i]) || !startsBlock(lines[i]))) {
        body.push(lines[i].replace(QUOTE, ""));
        i++;
      }
      blocks.push({ type: "quote", blocks: parseLines(body) });
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1])) {
      const header = splitRow(line);
      const align = splitRow(lines[i + 1]).map((c) =>
        c.startsWith(":") && c.endsWith(":") ? "center" : c.endsWith(":") ? "right" : c.startsWith(":") ? "left" : null,
      );
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && !isBlank(lines[i]) && lines[i].includes("|")) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push({ type: "table", header, align, rows });
      continue;
    }

    const list = LIST.exec(line);
    if (list) {
      const [block, next] = parseList(lines, i);
      blocks.push(block);
      i = next;
      continue;
    }

    // Paragraph
    const body: string[] = [line.trim()];
    i++;
    while (i < lines.length && !isBlank(lines[i]) && !startsBlock(lines[i], lines[i + 1])) {
      body.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: "p", text: body.join("\n") });
  }
  return blocks;
}

function parseList(lines: string[], start: number): [Block, number] {
  const first = LIST.exec(lines[start])!;
  const baseIndent = indentOf(first[1]);
  const ordered = /\d/.test(first[2]);
  const items: ListItem[] = [];
  let i = start;

  while (i < lines.length) {
    const m = LIST.exec(lines[i]);
    if (!m || indentOf(m[1]) !== baseIndent || /\d/.test(m[2]) !== ordered) break;
    const contentIndent = baseIndent + m[2].length + 1;
    let text = m[3];
    let checked: boolean | null = null;
    const task = /^\[([ xX])\]\s+(.*)$/.exec(text);
    if (task) {
      checked = task[1] !== " ";
      text = task[2];
    }
    i++;
    const child: string[] = [];
    while (i < lines.length) {
      const l = lines[i];
      if (isBlank(l)) {
        let j = i + 1;
        while (j < lines.length && isBlank(lines[j])) j++;
        if (j < lines.length && indentOf(lines[j]) > baseIndent) {
          child.push("");
          i++;
          continue;
        }
        break;
      }
      if (indentOf(l) > baseIndent) {
        child.push(l);
        i++;
      } else if (!child.length && !startsBlock(l, lines[i + 1])) {
        text += "\n" + l.trim(); // lazy continuation
        i++;
      } else break;
    }
    // A child paragraph that directly continues the item text
    const children = child.length ? parseLines(dedent(child)) : [];
    if (children[0]?.type === "p" && child[0] && !isBlank(child[0]) && indentOf(child[0]) >= contentIndent && !LIST.test(child[0])) {
      text += "\n" + (children.shift() as { text: string }).text;
    }
    items.push({ text, checked, children });

    // Allow blank lines between items of the same list
    let j = i;
    while (j < lines.length && isBlank(lines[j])) j++;
    const nm = j < lines.length ? LIST.exec(lines[j]) : null;
    if (nm && indentOf(nm[1]) === baseIndent && /\d/.test(nm[2]) === ordered) i = j;
  }
  return [{ type: "list", ordered, start: ordered ? parseInt(first[2], 10) : 1, items }, i];
}

/* -------------------------------------------------------------------------- */
/*                                   Inline                                   */
/* -------------------------------------------------------------------------- */

const INLINE = new RegExp(
  [
    String.raw`(?<code>(\x60+)(?<codeText>[\s\S]*?[^\x60])\2(?!\x60))`,
    String.raw`(?<img>!\[(?<imgAlt>[^\]]*)\]\((?<imgSrc>[^)\s]+)(?:\s+"[^"]*")?\))`,
    String.raw`(?<link>\[(?<linkText>[^\]]+)\]\((?<linkHref>[^)\s]+)(?:\s+"[^"]*")?\))`,
    String.raw`(?<cite>\[(?<citeN>\d{1,3})\])`,
    String.raw`(?<bold>\*\*(?<boldText>[^\s*](?:[\s\S]*?[^\s])?)\*\*|__(?<boldText2>[^\s_](?:[\s\S]*?[^\s])?)__)`,
    String.raw`(?<strike>~~(?<strikeText>[\s\S]+?)~~)`,
    String.raw`(?<em>\*(?<emText>[^\s*](?:[^*]*?[^\s*])?)\*|(?<![\w])_(?<emText2>[^\s_](?:[^_]*?[^\s_])?)_(?![\w]))`,
    String.raw`(?<url>https?:\/\/[^\s<>()\[\]]+[^\s<>()\[\].,;:!?'"])`,
    String.raw`(?<br>\n)`,
  ].join("|"),
  "g",
);

function safeHref(href: string) {
  const h = href.trim();
  if (/^(https?:|mailto:|\/|#|\.)/i.test(h)) return h;
  return undefined;
}

interface InlineCtx {
  sources?: Source[];
}

function renderInline(text: string, ctx: InlineCtx, keyPrefix = "i"): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let k = 0;
  const re = new RegExp(INLINE.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const g = m.groups!;
    const key = `${keyPrefix}-${k++}`;
    if (g.code) {
      out.push(
        <code key={key} className="rounded-md border border-kui-border bg-kui-surface-2 px-1.5 py-0.5 font-mono text-[0.85em] text-kui-fg">
          {g.codeText.replace(/^ (.*) $/, "$1")}
        </code>,
      );
    } else if (g.img) {
      const src = safeHref(g.imgSrc);
      out.push(
        src ? (
          <span key={key} className="my-2 block">
            <ImagePreview image={{ src, alt: g.imgAlt }} />
          </span>
        ) : (
          g.imgAlt
        ),
      );
    } else if (g.link) {
      const href = safeHref(g.linkHref);
      out.push(
        href ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-kui-accent underline decoration-kui-accent/30 underline-offset-[3px] transition-colors hover:decoration-kui-accent"
          >
            {renderInline(g.linkText, ctx, key)}
          </a>
        ) : (
          g.linkText
        ),
      );
    } else if (g.cite) {
      const n = parseInt(g.citeN, 10);
      const source = ctx.sources?.[n - 1];
      out.push(source ? <InlineCitation key={key} index={n} source={source} /> : m[0]);
    } else if (g.bold) {
      out.push(
        <strong key={key} className="font-semibold text-kui-fg">
          {renderInline(g.boldText ?? g.boldText2, ctx, key)}
        </strong>,
      );
    } else if (g.strike) {
      out.push(
        <del key={key} className="text-kui-fg-subtle">
          {renderInline(g.strikeText, ctx, key)}
        </del>,
      );
    } else if (g.em) {
      out.push(<em key={key}>{renderInline(g.emText ?? g.emText2, ctx, key)}</em>);
    } else if (g.url) {
      out.push(
        <a
          key={key}
          href={g.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-kui-accent underline decoration-kui-accent/30 underline-offset-[3px] hover:decoration-kui-accent"
        >
          {g.url}
        </a>,
      );
    } else if (g.br) {
      out.push(<br key={key} />);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/* -------------------------------------------------------------------------- */
/*                                   Render                                   */
/* -------------------------------------------------------------------------- */

export const StreamingCaret = ({ className }: { className?: string }) => (
  <span
    aria-hidden
    className={cn(
      "ml-0.5 inline-block h-[1.05em] w-[3px] translate-y-[3px] animate-kui-blink rounded-full bg-kui-accent",
      className,
    )}
  />
);

export interface MarkdownProps {
  children: string;
  /** Show a blinking caret at the end of the content. */
  streaming?: boolean;
  /** Sources used to resolve `[1]`-style inline citations. */
  sources?: Source[];
  /** Override code block rendering (e.g. plug in Shiki). */
  renderCode?: (code: string, language: string, streaming: boolean) => React.ReactNode;
  className?: string;
}

const headingCls: Record<number, string> = {
  1: "mt-7 mb-3 text-[1.45em] font-semibold tracking-tight",
  2: "mt-6 mb-2.5 text-[1.25em] font-semibold tracking-tight",
  3: "mt-5 mb-2 text-[1.08em] font-semibold",
  4: "mt-4 mb-2 font-semibold",
  5: "mt-4 mb-1.5 font-semibold text-kui-fg-muted",
  6: "mt-4 mb-1.5 font-medium text-kui-fg-muted",
};

function renderBlocks(
  blocks: Block[],
  ctx: InlineCtx & Pick<MarkdownProps, "renderCode">,
  caret: React.ReactNode,
  keyPrefix = "b",
): React.ReactNode[] {
  return blocks.map((block, idx) => {
    const key = `${keyPrefix}${idx}`;
    const c = idx === blocks.length - 1 ? caret : null;
    switch (block.type) {
      case "p":
        return (
          <p key={key} className="my-3 leading-7 first:mt-0 last:mb-0">
            {renderInline(block.text, ctx, key)}
            {c}
          </p>
        );
      case "h": {
        const Tag = `h${block.level}` as "h1";
        return (
          <Tag key={key} className={cn("text-kui-fg first:mt-0", headingCls[block.level])}>
            {renderInline(block.text, ctx, key)}
            {c}
          </Tag>
        );
      }
      case "hr":
        return <hr key={key} className="my-6 border-0 border-t border-kui-border" />;
      case "code": {
        const streamingCode = !!c && !block.closed;
        return (
          <div key={key} className="my-4 first:mt-0 last:mb-0">
            {ctx.renderCode ? (
              ctx.renderCode(block.code, block.lang, streamingCode)
            ) : (
              <CodeBlock code={block.code} language={block.lang} streaming={streamingCode} />
            )}
          </div>
        );
      }
      case "quote":
        return (
          <blockquote key={key} className="my-4 border-l-2 border-kui-accent/50 pl-4 text-kui-fg-muted first:mt-0 last:mb-0">
            {renderBlocks(block.blocks, ctx, c, key)}
          </blockquote>
        );
      case "list": {
        const Tag = block.ordered ? "ol" : "ul";
        const isTask = block.items.some((it) => it.checked !== null);
        return (
          <Tag
            key={key}
            start={block.ordered && block.start !== 1 ? block.start : undefined}
            className={cn(
              "my-3 space-y-1.5 first:mt-0 last:mb-0 [&_ol]:my-1.5 [&_ul]:my-1.5",
              isTask ? "list-none pl-1" : block.ordered ? "list-decimal pl-6" : "list-disc pl-5",
              "marker:text-kui-fg-subtle",
            )}
          >
            {block.items.map((item, j) => {
              const ic = j === block.items.length - 1 ? c : null;
              const hasChildren = item.children.length > 0;
              return (
                <li key={j} className="pl-1 leading-7">
                  {item.checked !== null ? (
                    <span
                      aria-hidden
                      className={cn(
                        "mr-2 inline-flex size-4 translate-y-[3px] items-center justify-center rounded border text-[10px]",
                        item.checked
                          ? "border-kui-accent bg-kui-accent text-kui-accent-fg"
                          : "border-kui-border-strong",
                      )}
                    >
                      {item.checked ? "✓" : ""}
                    </span>
                  ) : null}
                  <span className={cn(item.checked && "text-kui-fg-subtle line-through")}>
                    {renderInline(item.text, ctx, `${key}-${j}`)}
                  </span>
                  {!hasChildren && ic}
                  {hasChildren ? renderBlocks(item.children, ctx, ic, `${key}-${j}-`) : null}
                </li>
              );
            })}
          </Tag>
        );
      }
      case "table":
        return (
          <div key={key} className="kui-scrollbar my-4 overflow-x-auto rounded-kui-sm border border-kui-border first:mt-0 last:mb-0">
            <table className="w-full border-collapse text-[0.92em]">
              <thead className="bg-kui-surface-2">
                <tr>
                  {block.header.map((h, j) => (
                    <th
                      key={j}
                      style={{ textAlign: block.align[j] ?? "left" }}
                      className="border-b border-kui-border px-3 py-2 font-semibold whitespace-nowrap text-kui-fg"
                    >
                      {renderInline(h, ctx, `${key}-h${j}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r} className="border-b border-kui-border last:border-0 even:bg-kui-surface-2/40">
                    {block.header.map((_, j) => (
                      <td key={j} style={{ textAlign: block.align[j] ?? "left" }} className="px-3 py-2 align-top">
                        {renderInline(row[j] ?? "", ctx, `${key}-${r}-${j}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {c}
          </div>
        );
    }
  });
}

export const Markdown = React.memo(function Markdown({
  children,
  streaming = false,
  sources,
  renderCode,
  className,
}: MarkdownProps) {
  const blocks = React.useMemo(() => parseMarkdown(children ?? ""), [children]);
  const caret = streaming ? <StreamingCaret /> : null;
  return (
    <div className={cn("text-[15px] text-kui-fg [overflow-wrap:anywhere]", className)}>
      {blocks.length ? renderBlocks(blocks, { sources, renderCode }, caret) : caret}
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*                             StreamingMarkdown                              */
/* -------------------------------------------------------------------------- */

export interface StreamingMarkdownProps extends Omit<MarkdownProps, "streaming"> {
  /** True while tokens are still arriving. */
  streaming?: boolean;
  /** Smooth out bursty chunks with a frame-paced reveal. Default true. */
  smooth?: boolean | SmoothTextOptions;
}

/** Markdown + smooth token reveal + caret. Use this for live LLM output. */
export function StreamingMarkdown({ children, streaming = false, smooth = true, ...props }: StreamingMarkdownProps) {
  const opts = typeof smooth === "object" ? smooth : { disabled: !smooth };
  const { text, isAnimating } = useSmoothText(children ?? "", streaming, opts);
  return (
    <Markdown streaming={streaming || isAnimating} {...props}>
      {text}
    </Markdown>
  );
}
