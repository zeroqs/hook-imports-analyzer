import "./style.css";
import * as acorn from "acorn";
import tsPlugin from "acorn-typescript";

const hookUrl =
  "https://raw.githubusercontent.com/siberiacancode/reactuse/main/src/hooks";

const button = document.querySelector("button");
const deps = document.querySelector(".deps");

button.addEventListener("click", onClick);

async function fetchHookContent() {
  const hookName = document.querySelector("input").value;

  try {
    const response = await fetch(`${hookUrl}/${hookName}/${hookName}.ts`);

    return response.text();
  } catch (error) {
    console.error(error);
  }
}

function extractHookDependency(ast) {
  const hookImportNodes = ast.body.filter(
    (node) =>
      node.type === "ImportDeclaration" && node.source.value.includes("use")
  );

  const hookDependencies = hookImportNodes.flatMap((node) =>
    node.specifiers
      .filter((specifier) => specifier.type === "ImportSpecifier")
      .map((specifier) => specifier.imported.name)
  );

  return hookDependencies;
}

async function onClick() {
  const hookContent = await fetchHookContent();
  const ast = parseAst(hookContent);

  insertHookContent(hookContent);
  const hookDependencies = extractHookDependency(ast);
  insertHookDeps(hookDependencies);
}

function parseAst(hookContent) {
  const ast = acorn.Parser.extend(tsPlugin()).parse(hookContent, {
    sourceType: "module",
    ecmaVersion: "latest",
  });

  return ast;
}

function insertHookContent(hookContent) {
  const textArea = document.querySelector("#hook");

  textArea.value = "";
  textArea.value = hookContent;
}

function insertHookDeps(hookDependencies) {
  deps.innerHTML = "";

  for (const hookName of hookDependencies) {
    let span = document.createElement("span");

    span.append(hookName);
    span.classList.add("hook-deps");

    deps.appendChild(span);
  }
}
