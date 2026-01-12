import { contextBridge, ipcRenderer } from 'electron';

// Secure bridge between main and renderer processes
contextBridge.exposeInMainWorld('electronAPI', {
    // Platform info
    platform: process.platform,
    isElectron: true,

    // Navigation handlers (called from main process menu)
    onNavigate: (callback: (path: string) => void) => {
        ipcRenderer.on('navigate', (_, path) => callback(path));
    },

    // Settings handler
    onOpenSettings: (callback: () => void) => {
        ipcRenderer.on('open-settings', () => callback());
    },

    // Quick capture handler
    onQuickCapture: (callback: () => void) => {
        ipcRenderer.on('quick-capture', () => callback());
    },

    // Notifications (native system notifications)
    showNotification: (title: string, body: string) => {
        new Notification(title, { body });
    },

    // App info
    getVersion: () => ipcRenderer.invoke('get-version'),

    // Window controls
    minimize: () => ipcRenderer.invoke('window-minimize'),
    maximize: () => ipcRenderer.invoke('window-maximize'),
    close: () => ipcRenderer.invoke('window-close'),
});

// Type declarations for the renderer
declare global {
    interface Window {
        electronAPI: {
            platform: string;
            isElectron: boolean;
            onNavigate: (callback: (path: string) => void) => void;
            onOpenSettings: (callback: () => void) => void;
            onQuickCapture: (callback: () => void) => void;
            showNotification: (title: string, body: string) => void;
            getVersion: () => Promise<string>;
            minimize: () => Promise<void>;
            maximize: () => Promise<void>;
            close: () => Promise<void>;
        };
    }
}
