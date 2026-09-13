import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from '@babel/parser';

/** Enumerate production TypeScript source, excluding generated files and test fixtures. */
function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : path.endsWith('.ts') ? [path] : [];
  });
}
let count = 0;
const missing = [];
for (const file of sourceFiles('src')) {
  const source = readFileSync(file, 'utf8');
  const tree = parse(source, { sourceType: 'module', plugins: ['typescript'] });
  /** Check named declarations, methods and function variables; inline callback intent is documented by its owner. */
  function visit(node, parent) {
    if (!node || typeof node !== 'object') return;
    let name = '', start = node.start;
    if (node.type === 'FunctionDeclaration') {
      name = node.id?.name ?? '';
      if (parent?.type === 'ExportNamedDeclaration') start = parent.start;
    } else if (node.type === 'ClassMethod') name = node.key?.name ?? '';
    else if (node.type === 'VariableDeclarator' && ['ArrowFunctionExpression', 'FunctionExpression'].includes(node.init?.type)) {
      name = node.id?.name ?? ''; start = parent.start;
    }
    if (name) {
      count++;
      const prefix = source.slice(0, start).trimEnd();
      const comment = prefix.match(/\/\*\*([^]*?)\*\/$/)?.[1]?.split('/**').at(-1)?.trim();
      if (!comment || comment.split(/\s+/).length < 5) missing.push(`${file}:${node.loc.start.line} ${name}`);
    }
    for (const [key, value] of Object.entries(node)) {
      if (['loc', 'comments', 'leadingComments', 'trailingComments', 'innerComments', 'tokens'].includes(key)) continue;
      if (Array.isArray(value)) value.forEach(child => visit(child, node));
      else if (value && typeof value === 'object') visit(value, node);
    }
  }
  visit(tree, null);
}
if (missing.length) { console.error(`Missing descriptive function comments:\n${missing.join('\n')}`); process.exitCode = 1; }
else console.log(`Descriptive comments verified for ${count} named production functions and methods.`);
