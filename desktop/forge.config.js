module.exports = {
    packagerConfig: {
        name: 'MoneyLoop',
        executableName: 'moneyloop',
        icon: './assets/icon',
        appBundleId: 'com.moneyloop.desktop',
        appCategoryType: 'public.app-category.finance',
        osxSign: {},
        osxNotarize: {
            appleId: process.env.APPLE_ID,
            appleIdPassword: process.env.APPLE_PASSWORD,
            teamId: process.env.APPLE_TEAM_ID,
        },
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
