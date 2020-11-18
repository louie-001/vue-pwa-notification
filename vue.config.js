module.exports = {
    publicPath: './',
    pwa: {
        name: 'notification',
        themeColor: '#1976D2',
        msTileColor: '#FFFFFF',
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
            swSrc: 'src/sw.js'
        }
    }
}
