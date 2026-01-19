module.exports = {
    packagerConfig: {
        asar: true,
        name: 'MoneyLoop',
        executableName: 'moneyloop',
        icon: './assets/icon',
        appBundleId: 'com.moneyloop.desktop',
        appCategoryType: 'public.app-category.finance',
        // Code signing disabled for development builds
        // Enable osxSign and osxNotarize for production releases
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                name: 'MoneyLoop',
                setupIcon: './assets/icon.ico',
            },
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
        {
            name: '@electron-forge/maker-dmg',
            config: {
                name: 'MoneyLoop',
                icon: './assets/icon.icns',
                format: 'ULFO',
            },
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {},
        },
    ],
};
