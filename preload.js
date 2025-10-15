const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Get video information
    getVideoInfo: (filePath) => ipcRenderer.invoke('get-video-info', filePath),
    
    // Process video
    processVideo: (options) => ipcRenderer.invoke('process-video', options),
    
    // Listen for progress updates
    onVideoProgress: (callback) => {
        ipcRenderer.on('video-progress', (event, data) => callback(data));
    },
    
    // Select output directory
    selectOutputDirectory: () => ipcRenderer.invoke('select-output-directory'),
    
    // Select video files
    selectVideoFiles: () => ipcRenderer.invoke('select-video-files'),
    
    // Check FFmpeg availability
    checkFFmpeg: () => ipcRenderer.invoke('check-ffmpeg'),
    
    // Check if file exists
    checkFileExists: (filePath) => ipcRenderer.invoke('check-file-exists'),
    
    // Cancel current processing
    cancelProcessing: () => ipcRenderer.invoke('cancel-processing'),
    
    // Get file path from file object
    getFilePath: (file) => file?.path || null
});

// Expose process environment for fallback paths
contextBridge.exposeInMainWorld('processEnv', {
    USERNAME: process.env.USERNAME || 'User',
    USERPROFILE: process.env.USERPROFILE || 'C:\\Users\\User'
});
