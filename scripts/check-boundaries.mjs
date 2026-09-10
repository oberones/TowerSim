import { parse } from '@babel/parser';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const domain = resolve('src/simulation');
const forbidden = new Set(['window', 'document', 'navigator', 'location', 'localStorage', 'sessionStorage', 'indexedDB', 'fetch', 'XMLHttpRequest', 'WebSocket', 'Worker', 'Date', 'performance', 'setTimeout', 'setInterval', 'requestAnimationFrame', 'cancelAnimationFrame', 'crypto', 'globalThis', 'global', 'process', 'require', 'eval', 'Function']);
export function checkSource(source, filename) {
  const errors = [];
  const report = message => errors.push(`${filename}: ${message}`);
  const checkImport = node => {
    if (!node || node.type !== 'StringLiteral') { report('computed module imports are forbidden'); return; }
    const name = node.value;
    const target = resolve(dirname(filename), name);
    if (!name.startsWith('.') || relative(domain, target).startsWith('..') || /[?!]/.test(name)) report(`forbidden domain import: ${name}`);
  };
  let ast;
  try { ast = parse(source, { sourceType: 'module', plugins: ['typescript'] }); }
  catch (error) { return [`${filename}: ${error.message}`]; }
  function walk(node, parent) {
    if (!node || typeof node !== 'object') return;
    if (['ImportDeclaration', 'ExportAllDeclaration', 'ExportNamedDeclaration'].includes(node.type) && node.source) checkImport(node.source);
    if (node.type === 'ImportExpression') checkImport(node.source);
    if (node.type === 'TSImportType') checkImport(node.argument);
    if (node.type === 'TSExternalModuleReference') checkImport(node.expression);
    if (node.type === 'MetaProperty') report('platform import metadata is forbidden');
    // Intentionally conservative: these reserved names cannot be rebound in domain code.
    // An occupant's literal location field is domain data; a bare/global location remains forbidden.
    const locationField = node.name === 'location' && (
      (['MemberExpression', 'OptionalMemberExpression'].includes(parent?.type) && parent.property === node && !parent.computed) ||
      (['ObjectProperty', 'TSPropertySignature'].includes(parent?.type) && parent.key === node && !parent.computed && !parent.shorthand)
    );
    if (node.type === 'Identifier' && forbidden.has(node.name) && !locationField) report(`forbidden platform identifier: ${node.name}`);
    if ((node.type === 'MemberExpression' || node.type === 'OptionalMemberExpression') && node.object?.name === 'Math') {
      if (node.computed || node.property?.name === 'random') report('computed Math access / direct randomness is forbidden');
    }
    if (node.type === 'Identifier' && node.name === 'Math' && !(parent?.type === 'MemberExpression' && parent.object === node && !parent.computed && parent.property?.name !== 'random')) report('aliasing Math is forbidden');
    for (const [key, value] of Object.entries(node)) {
      if (['loc', 'start', 'end', 'comments', 'tokens'].includes(key)) continue;
      if (Array.isArray(value)) value.forEach(child => walk(child, node)); else if (value && typeof value === 'object') walk(value, node);
    }
  }
  walk(ast.program);
  return errors;
}
export function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? filesIn(resolve(directory, entry.name)) : [resolve(directory, entry.name)]);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = filesIn(domain).filter(file => /\.[cm]?[jt]sx?$/.test(file)).flatMap(file => checkSource(readFileSync(file, 'utf8'), file));
  const fixtures = JSON.parse(readFileSync('tests/fixtures/boundaries/cases.json', 'utf8'));
  for (const fixture of fixtures) {
    const rejected = checkSource(fixture.source, resolve(domain, 'fixture.ts')).length > 0;
    if (rejected !== fixture.reject) errors.push(`Boundary self-test failed: ${fixture.name}`);
  }
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log(`Domain boundaries and ${fixtures.length} regression fixtures passed.`);
}
