const path = require('path');
module.exports = {
  webpack: (config, { webpack }) => {
    config.resolve.alias.react = path.resolve('./node_modules/react');
    config.resolve.alias.yjs = path.resolve('./node_modules/yjs');
    return config;
  },
};
