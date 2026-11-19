// Extracts component props (name, type, default, required, JSDoc) from the
// library source with the TypeScript compiler API.
// Output: apps/docs/src/generated/api.json — used by the docs site and llms-full.txt.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(resolve(root, "packages/kestro-ui/package.json"));
const ts = require("typescript");

const entry = resolve(root, "packages/kestro-ui/src/index.ts");
const program = ts.createProgram([entry], {
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  skipLibCheck: true,
});
const checker = program.getTypeChecker();
const moduleSymbol = checker.getSymbolAtLocation(program.getSourceFile(entry));

const isLib = (decl) => decl.getSourceFile().fileName.includes("node_modules");

function findFunctionNode(decl) {
  if (!decl) return undefined;
  if (ts.isFunctionDeclaration(decl)) return decl;
  if (ts.isVariableDeclaration(decl) && decl.initializer) {
    let init = decl.initializer;
    // React.forwardRef(function X(...){}) / React.memo(function X(...){})
    while (init && ts.isCallExpression(init)) init = init.arguments[0];
    if (init && (ts.isFunctionExpression(init) || ts.isArrowFunction(init))) return init;
  }
  return undefined;
}

function defaultsOf(fn) {
  const out = {};
  const p = fn?.parameters?.[0];
  if (p && ts.isObjectBindingPattern(p.name)) {
    for (const el of p.name.elements) {
      if (el.initializer) out[(el.propertyName ?? el.name).getText()] = el.initializer.getText();
    }
  }
  return out;
}

function cleanType(t) {
  return t
    .replace(/React\.ReactNode/g, "ReactNode")
    .replace(/import\("[^"]+"\)\./g, "")
    .replace(/\s+/g, " ")
    .replace(/ \| undefined$/, "");
}

const api = {};
for (const exp of checker.getExportsOfModule(moduleSymbol)) {
  const name = exp.getName();
  if (!/^[A-Z]/.test(name)) continue;
  const sym = exp.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exp) : exp;
  const decl = sym.valueDeclaration ?? sym.declarations?.[0];
  if (!decl || !(sym.flags & (ts.SymbolFlags.Function | ts.SymbolFlags.Variable))) continue;
  const type = checker.getTypeOfSymbolAtLocation(sym, decl);
  const sig = type.getCallSignatures()[0];
  if (!sig) continue;
  const fn = findFunctionNode(decl);
  const defaults = defaultsOf(fn);
  const param = sig.getParameters()[0];
  const props = [];
  let extendsNative = false;
  if (param) {
    const propsType = checker.getTypeOfSymbolAtLocation(param, decl);
    for (const p of propsType.getProperties()) {
      const pd = p.valueDeclaration ?? p.declarations?.[0];
      if (!pd) continue;
      if (isLib(pd)) {
        extendsNative = true;
        continue;
      }
      const pt = checker.getTypeOfSymbolAtLocation(p, pd);
      const fmt = (x) => checker.typeToString(x, undefined, ts.TypeFormatFlags.NoTruncation);
      // Expand aliased literal unions (e.g. RiskLevel → "low" | "medium" | "high")
      const nonNull = pt.isUnion() ? pt.types.filter((x) => !(x.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null))) : [pt];
      const literalUnion = nonNull.length > 1 && nonNull.every((x) => x.isLiteral() || x.flags & ts.TypeFlags.BooleanLiteral);
      let t = cleanType(literalUnion ? nonNull.map(fmt).join(" | ") : fmt(pt));
      if (t.length > 140) t = t.slice(0, 137) + "…";
      props.push({
        name: p.getName(),
        type: t,
        required: !(p.flags & ts.SymbolFlags.Optional),
        default: defaults[p.getName()],
        description: ts.displayPartsToString(p.getDocumentationComment(checker)).trim() || undefined,
      });
    }
  }
  // JSDoc on the component itself (function declarations and forwardRef'd functions)
  let description = ts.displayPartsToString(sym.getDocumentationComment(checker)).trim();
  if (!description && fn) {
    const jsdoc = ts.getJSDocCommentsAndTags(fn.parent?.parent ?? fn);
    description = jsdoc.map((d) => (typeof d.comment === "string" ? d.comment : "")).join(" ").trim();
  }
  api[name] = { description: description || undefined, extendsNative, props };
}

const out = resolve(root, "apps/docs/src/generated/api.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(api, null, 2));
console.log(`✓ API extracted for ${Object.keys(api).length} components → ${out.replace(root, ".")}`);
