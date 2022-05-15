module.exports = {
  webpack: (config, { webpack }) => {
    config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /.spec./ }));

    config.node = {
      fs: 'empty',
    };
    // config.module.rules.push({
    //   test: /\.svg$/,
    //   use: ['@svgr/webpack'], // if need later
    // });

    return config;
  },
};
