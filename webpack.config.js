const path = require('path');

module.exports = {
    entry: './src/main.js',
    mode: 'development',
    output: {
        filename: 'brutal_ice.js',
        path: path.resolve(__dirname, 'dist'),
        assets: path.resolve(__dirname, 'assets'),
    },
};
