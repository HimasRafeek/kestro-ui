import * as React from "react";

/**
 * A deliberately tiny syntax highlighter (~no deps) that handles the languages
 * agents emit most: JS/TS/JSX, JSON, Python, Bash, Go, Rust, SQL, CSS, HTML-ish.
 * It's lexical only — good enough for chat, swap in Shiki via `renderCode` if you need more.
 */

const KEYWORDS = new Set(
  (
    "abstract as async await break case catch class const continue def default defer del delete do elif else enum export extends false final finally fn for from func function go if impl implements import in instanceof interface is lambda let match mod mut new nil none None not null of or and package pass private protected pub public raise readonly return self Self static struct super switch this throw true True False try type typeof undefined use var void while with yield " +
    "select from where insert into update set values delete create table drop alter join left right inner outer on group by order limit having as and or not null primary key " +
    "SELECT FROM WHERE INSERT INTO UPDATE SET VALUES DELETE CREATE TABLE DROP ALTER JOIN LEFT RIGHT INNER OUTER ON GROUP BY ORDER LIMIT HAVING AS AND OR NOT NULL PRIMARY KEY " +
    "echo export cd npm npx pnpm yarn git sudo fi then esac done"
  ).split(" "),
);

const HASH_COMMENT_LANGS = new Set([
  "python", "py", "bash", "sh", "shell", "zsh", "yaml", "yml", "toml", "ruby", "rb", "r", "dockerfile", "makefile", "ini", "conf",
]);

type TokenType = "comment" | "string" | "number" | "keyword" | "function" | "property" | "punct" | "plain";

const tokenClass: Record<TokenType, string | undefined> = {
  comment: "text-[var(--kui-code-comment)] italic",
  string: "text-[var(--kui-code-string)]",
  number: "text-[var(--kui-code-number)]",
  keyword: "text-[var(--kui-code-keyword)]",
  function: "text-[var(--kui-code-function)]",
  property: "text-[var(--kui-code-property)]",
  punct: "text-kui-fg-subtle",
  plain: undefined,
};

function buildRegex(lang: string) {
  const l = lang.toLowerCase();
  const hash = HASH_COMMENT_LANGS.has(l);
  const sql = l === "sql";
  const json = l === "json" || l === "jsonc";
  const comment = hash
    ? String.raw`#[^\n]*`
    : sql
      ? String.raw`--[^\n]*|\/\*[\s\S]*?(?:\*\/|$)`
      : json
        ? String.raw`\/\/[^\n]*`
        : String.raw`\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|<!--[\s\S]*?(?:-->|$)`;
  return new RegExp(
    [
      `(?<comment>${comment})`,
      // JSON keys / object properties: "key":
      String.raw`(?<property>"(?:[^"\\\n]|\\.)*"(?=\s*:))`,
      String.raw`(?<string>"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?|\x60(?:[^\x60\\]|\\.)*\x60?)`,
      String.raw`(?<number>\b(?:0x[\da-fA-F]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b)`,
      String.raw`(?<word>[A-Za-z_$][\w$]*)`,
      String.raw`(?<punct>[{}()[\];,.<>/=+\-*&|!?:%^~@])`,
    ].join("|"),
    "g",
  );
}

export function highlight(code: string, lang = ""): React.ReactNode[] {
  if (!lang || ["text", "txt", "plain", "plaintext", "md", "markdown"].includes(lang.toLowerCase())) {
    return [code];
  }
  const re = buildRegex(lang);
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (m[0].length === 0) {
      re.lastIndex++;
      continue;
    }
    if (m.index > last) out.push(code.slice(last, m.index));
    const g = m.groups ?? {};
    let type: TokenType = "plain";
    if (g.comment) type = "comment";
    else if (g.property) type = "property";
    else if (g.string) type = "string";
    else if (g.number) type = "number";
    else if (g.word) {
      if (KEYWORDS.has(g.word)) type = "keyword";
      else if (code[re.lastIndex] === "(") type = "function";
      else if (/^[A-Z]/.test(g.word)) type = "function";
    } else if (g.punct) type = "punct";
    const cls = tokenClass[type];
    out.push(
      cls ? (
        <span key={key++} className={cls}>
          {m[0]}
        </span>
      ) : (
        m[0]
      ),
    );
    last = re.lastIndex;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}
