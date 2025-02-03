import "./style.css";
import * as acorn from "acorn";
import tsPlugin from "acorn-typescript";

const hookUrl =
  "https://raw.githubusercontent.com/siberiacancode/reactuse/main/src/hooks";

const button = document.querySelector("button");
const hookDeps = document.querySelector(".hooks-deps");
const utilsDeps = document.querySelector(".utils-deps");

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

function extractUtilsDependency(ast) {
  const utilsImportNodes = ast.body.filter(
    (node) =>
      node.type === "ImportDeclaration" && node.source.value.includes("@/utils")
  );

  const utilsDependencies = utilsImportNodes.flatMap((node) =>
    node.specifiers
      .filter((specifier) => specifier.type === "ImportSpecifier")
      .map((specifier) => specifier.imported.name)
  );

  return utilsDependencies;
}

async function onClick() {
  const hookContent = await fetchHookContent();
  const ast = parseAst(hookContent);

  insertHookContent(hookContent);
  const hookDependencies = extractHookDependency(ast);
  insertDeps(hookDependencies, hookDeps);
  const utilsDependencies = extractUtilsDependency(ast);
  insertDeps(utilsDependencies, utilsDeps);
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

function insertDeps(hookDependencies, nodeToInsert) {
  nodeToInsert.innerHTML = "";

  for (const hookName of hookDependencies) {
    let span = document.createElement("span");

    span.append(hookName);
    span.classList.add("hook-deps");

    nodeToInsert.appendChild(span);
  }
}
