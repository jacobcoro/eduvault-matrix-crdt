const path = require('path');
module.exports = {
  webpack: (config, { webpack }) => {
    config.resolve.alias.react = path.resolve('./node_modules/react');

    return config;
  },
};
