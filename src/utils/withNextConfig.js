import path from 'path';

import getBundleAnalyzer from '@next/bundle-analyzer';
import getTranspileModules from 'next-transpile-modules';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

const applyGraphQLCodeGenerationLoaders = (config, options) => {
  config.module.rules.push({
    test: /\.graphql$/,
    exclude: /node_modules/,
    use: [options.defaultLoaders.babel, { loader: 'graphql-let/loader' }]
  });

  config.module.rules.push({
    test: /\.graphqls$/,
    exclude: /node_modules/,
    use: ['graphql-let/schema/loader']
  });

  config.module.rules.push({
    test: /\.ya?ml$/,
    type: 'json',
    use: 'yaml-loader'
  });

  return config;
};

const applySvgrLoader = config => {
  config.module.rules.push({
    test: /\.svg$/,
    use: [
      {
        loader: '@svgr/webpack',
        options: {
          icon: true,
          titleProp: true,
          exportType: 'default'
        }
      }
    ]
  });
};

const applyAliases = config => {
  const externalAliases = [
    '@microsoft/applicationinsights-react-js',
    '@microsoft/applicationinsights-web',
    '@sitecore-jss/sitecore-jss-nextjs',
    'next-query-params',
    'react',
    'react-dom'
  ].reduce((aliases, name) => {
    aliases[name] = path.resolve(__dirname, `node_modules/${name}`);

    return aliases;
  }, {});

  // Aliases used in "ufe-web" repo
  const internalAliases = ['assets', 'basics', 'components', 'lib'].reduce(
    (aliases, name) => {
      aliases[`@${name}`] = path.resolve(
        __dirname,
        `node_modules/@focusbrands/ufe-web/src/${name}`
      );

      return aliases;
    },
    {}
  );

  config.resolve.alias = {
    ...config.resolve.alias,
    ...externalAliases,
    ...internalAliases
  };
};

const withCustomConfig = (nextConfig, isDevelopment) => {
  const customWebpack = nextConfig.webpack;

  nextConfig.webpack = (webpackConfig, options) => {
    // Aliases needed for appropriate work of symlinked packages
    if (isDevelopment) applyAliases(webpackConfig, options);

    // Common loaders
    applyGraphQLCodeGenerationLoaders(webpackConfig, options);
    applySvgrLoader(webpackConfig);

    // TODO: Add comment
    if (customWebpack) {
      return customWebpack(webpackConfig, options);
    }

    return webpackConfig;
  };

  return nextConfig;
};

const withDevelopmentConfig = nextConfig => {
  const customConfig = withCustomConfig(nextConfig, true);
  const withTranspileModules = getTranspileModules(['@focusbrands/ufe-web'], {
    resolveSymlinks: false
  });

  return withTranspileModules(customConfig);
};

const withProductionConfig = nextConfig => {
  const customConfig = withCustomConfig(nextConfig, false);
  const withBundleAnalyzer = getBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true'
  });

  return withBundleAnalyzer(customConfig);
};

export const withNextConfig = nextConfig => phase => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return withDevelopmentConfig(nextConfig);
  }

  return withProductionConfig(nextConfig);
};
