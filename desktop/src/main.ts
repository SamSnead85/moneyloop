import { app, BrowserWindow, Menu, shell, nativeTheme, session } from 'electron';
import * as path from 'path';

// Handle Squirrel events for Windows installer
if (require('electron-squirrel-startup')) {
    app.quit();
}

// Keep a reference to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

// Production URL (your deployed web app)
const PRODUCTION_URL = 'https://moneyloop.netlify.app';
const DEV_URL = 'http://localhost:3010';

// Use production URL by default for packaged apps
const isDev = process.env.NODE_ENV === 'development' && !require('electron').app.isPackaged;

function createWindow(): void {
    // Force dark mode to match the app aesthetic
    nativeTheme.themeSource = 'dark';

    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        title: 'MoneyLoop',
        titleBarStyle: 'hiddenInset', // macOS native title bar
        trafficLightPosition: { x: 16, y: 16 },
        backgroundColor: '#050508', // Match new app background
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false, // Disabled to allow Next.js hydration
            webSecurity: !isDev, // Disable in dev for localhost
        },
        show: false, // Don't show until ready
    });

    // Load the app - use DEV_URL if dev server is running, fallback to production
    const url = isDev ? DEV_URL : PRODUCTION_URL;
    console.log('Loading URL:', url, 'isPackaged:', app.isPackaged, 'isDev:', isDev);

    // Handle load failures
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('Failed to load:', validatedURL, errorCode, errorDescription);
        // If dev URL fails, try production
        if (validatedURL === DEV_URL) {
            console.log('Dev server not available, trying production...');
            mainWindow?.loadURL(PRODUCTION_URL);
        }
    });

    // Open DevTools in development for debugging
    if (isDev) {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }

    mainWindow.loadURL(url);

    // Show window once ready
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });

    // Open external links in browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    // Cleanup on close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Create application menu
function createMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
        {
            label: 'MoneyLoop',
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                {
                    label: 'Preferences',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        mainWindow?.webContents.send('open-settings');
                    },
                },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' },
            ],
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' },
            ],
        },
        {
            label: 'Go',
            submenu: [
                {
                    label: 'Dashboard',
                    accelerator: 'CmdOrCtrl+1',
                    click: () => mainWindow?.webContents.send('navigate', '/dashboard'),
                },
                {
                    label: 'Transactions',
                    accelerator: 'CmdOrCtrl+2',
                    click: () => mainWindow?.webContents.send('navigate', '/dashboard/transactions'),
                },
                {
                    label: 'Budgets',
                    accelerator: 'CmdOrCtrl+3',
                    click: () => mainWindow?.webContents.send('navigate', '/dashboard/budgets'),
                },
                {
                    label: 'Goals',
                    accelerator: 'CmdOrCtrl+4',
                    click: () => mainWindow?.webContents.send('navigate', '/dashboard/goals'),
                },
                { type: 'separator' },
                {
                    label: 'Quick Capture',
                    accelerator: 'CmdOrCtrl+.',
                    click: () => mainWindow?.webContents.send('quick-capture'),
                },
            ],
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'close' },
            ],
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'MoneyLoop Help',
                    click: () => shell.openExternal('https://moneyloop.app/help'),
                },
                { type: 'separator' },
                {
                    label: 'Report Issue',
                    click: () => shell.openExternal('mailto:support@moneyloop.app'),
                },
            ],
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// App lifecycle
app.whenReady().then(() => {
    createWindow();
    createMenu();

    // macOS: Re-create window when clicking dock icon
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Security: Prevent new window creation
app.on('web-contents-created', (_, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.origin !== new URL(isDev ? DEV_URL : PRODUCTION_URL).origin) {
            event.preventDefault();
            shell.openExternal(navigationUrl);
        }
    });
});
