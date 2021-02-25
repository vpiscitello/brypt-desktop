const path = require('path');
module.exports = {
    configureWebpack: {
        devtool: 'source-map',
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
            builderOptions: {
                productName: 'brypt-desktop',
                appId: 'com.brypt.desktop',
                icon: 'resources/icons',
                files: [
                    'node_modules/**/*',
                    'public/**/*', 
                    'resources/**/*', 
                    '*.js'
                ],
                directories: {
                    buildResources: 'resources',
                },
                dmg: {
                    contents: [
                        {
                            x: 130,
                            y: 220,
                            type: 'file'
                        },
                        {
                            x: 410,
                            y: 220,
                            type: 'link',
                            path: '/Applications'
                        }
                    ]
                },
                mac: {
                },
                win: {
                },
                linux: {
                }
            }
        }
    }
}