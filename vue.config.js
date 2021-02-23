const path = require('path');
module.exports = {
    configureWebpack: {
        entry: {
            app: './src/renderer/main.ts'
        },
        devServer: {
            watchOptions: {
                ignored: ['**/node_modules/**/*', '**/resources/**/*'],
            }
        }
    },
    chainWebpack: config => {
        config.resolve.alias.set('@', path.resolve(__dirname, './src/renderer'));
    },
    pluginOptions: {
        electronBuilder: {
            mainProcessFile: 'src/background/main.ts',
            rendererProcessFile: 'src/renderer/main.ts',
        }
    }
}