'use strict';

const fs = require('fs');
const path = require('path');

const normalModuleFactoryPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'webpack',
  'lib',
  'NormalModuleFactory.js'
);

if (!fs.existsSync(normalModuleFactoryPath)) {
  console.log('webpack not found, skipping bang-path patch');
  process.exit(0);
}

let source = fs.readFileSync(normalModuleFactoryPath, 'utf8');

if (source.includes('const splitLoadersAndResource = request =>')) {
  console.log('webpack bang-path patch already applied');
  process.exit(0);
}

const helper = `const splitLoadersAndResource = request =>
\trequest
\t\t.replace(/\\/!/g, "/\\\\!")
\t\t.split(/(?<!\\\\)!/g)
\t\t.map(part => part.replace(/\\\\!/g, "!"));

`;

const anchor = 'const dependencyCache = new WeakMap();';
if (!source.includes(anchor)) {
  throw new Error('Unable to patch webpack: dependencyCache anchor not found');
}

source = source.replace(anchor, helper + anchor);

const splitSnippet = `let elements = requestWithoutMatchResource
\t\t\t\t.replace(/^-?!+/, "")
\t\t\t\t.replace(/!!+/g, "!")
\t\t\t\t.split("!");`;

const replacement = `let elements = splitLoadersAndResource(
\t\t\t\trequestWithoutMatchResource
\t\t\t\t\t.replace(/^-?!+/, "")
\t\t\t\t\t.replace(/!!+/g, "!")
\t\t\t);`;

if (!source.includes(splitSnippet)) {
  throw new Error('Unable to patch webpack: split snippet not found');
}

source = source.replace(splitSnippet, replacement);
fs.writeFileSync(normalModuleFactoryPath, source);

console.log('Applied webpack bang-path patch');
