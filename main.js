const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            devTools: false // Blocks right-click "Inspect" menu in many versions
        },
        title: "Proctored Exam Environment"
    });

    mainWindow.loadFile('index.html');

    // Force fullscreen and maximize
    mainWindow.maximize();
    mainWindow.setFullScreen(true);
    mainWindow.setAlwaysOnTop(true, "screen-saver");

    // Block native right-click via renderer interception
    mainWindow.webContents.on('context-menu', (e) => {
        e.preventDefault();
    });

    // Detect fullscreen exit (typical proctoring signal)
    mainWindow.on('leave-full-screen', () => {
        mainWindow.webContents.executeJavaScript('alert("ALERT: Fullscreen exit detected! This incident has been logged.")');
    });

    // Detect tab switching / window blur
    mainWindow.on('blur', () => {
        console.log("Tab switching / Window blur detected");
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    // Register global shortcuts to block inspector/source
    try {
        globalShortcut.register('F12', () => { });
        globalShortcut.register('Control+Shift+I', () => { });
        globalShortcut.register('Control+Shift+J', () => { });
        globalShortcut.register('Control+U', () => { });

        // DISABLE TAB SWITCHING (Alt+Tab)
        globalShortcut.register('Alt+Tab', () => { 
            console.log("Alt+Tab BLOCKED by Test App");
        });
        globalShortcut.register('Alt+Shift+Tab', () => {
            console.log("Alt+Shift+Tab BLOCKED by Test App");
        });
    } catch (e) {
        console.log("Failed to register global shortcuts");
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
