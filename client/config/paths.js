'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath');

const ensureSafeWebpackPath = (targetPath, aliasName) => {
  if (!targetPath.includes('!')) {
    return targetPath;
  }

  const aliasDir = path.join(os.tmpdir(), 'any-shop-webpack-paths');
  const aliasPath = path.join(aliasDir, aliasName);

  fs.mkdirSync(aliasDir, { recursive: true });
  try {
    fs.rmSync(aliasPath, { recursive: true, force: true });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
  fs.symlinkSync(targetPath, aliasPath, 'dir');

  return aliasPath;
};
const realAppDirectory = fs.realpathSync(process.cwd());
const appDirectory = ensureSafeWebpackPath(realAppDirectory, 'client');
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
const publicUrlOrPath = getPublicUrlOrPath(
  process.env.NODE_ENV === 'development',
  require(resolveApp('package.json')).homepage,
  process.env.PUBLIC_URL
);

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

// config after eject: we're in ./config/
const appBuildPath = ensureSafeWebpackPath(
  path.resolve(realAppDirectory, '../public'),
  'public'
);

module.exports = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuild: appBuildPath,
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveModule(resolveApp, 'src/index'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveModule(resolveApp, 'src/setupTests'),
  proxySetup: resolveApp('src/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
  publicUrlOrPath,
};



module.exports.moduleFileExtensions = moduleFileExtensions;
