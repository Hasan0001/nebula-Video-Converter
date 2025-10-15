const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Get FFmpeg paths - handle both development and production
let ffmpegPath, ffprobePath;
try {
    ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
    ffprobePath = require('@ffprobe-installer/ffprobe').path;
    console.log('✅ FFmpeg found at:', ffmpegPath);
} catch (error) {
    console.error('❌ Error loading FFmpeg:', error.message);
    // Fallback: try to find ffmpeg in the app resources
    const resourcesPath = process.resourcesPath || path.join(__dirname, '..', '..');
    ffmpegPath = path.join(resourcesPath, 'app', 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');
    ffprobePath = path.join(resourcesPath, 'app', 'node_modules', '@ffprobe-installer', 'win32-x64', 'ffprobe.exe');
    console.log('🔄 Using fallback FFmpeg path:', ffmpegPath);
}

let mainWindow;
let currentFFmpegProcess = null; // Track current FFmpeg process for cancellation

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        frame: true,
        backgroundColor: '#1a1a1d',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'icon.ico')
    });

    mainWindow.loadFile('ui.html');

    // DevTools disabled for production
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// IPC Handlers

// Get video metadata using ffprobe
ipcMain.handle('get-video-info', async (event, filePath) => {
    return new Promise((resolve, reject) => {
        const ffprobe = spawn(ffprobePath, [
            '-v', 'error',
            '-show_entries', 'stream=width,height,codec_name,bit_rate,duration',
            '-show_entries', 'format=duration,bit_rate,size',
            '-of', 'json',
            filePath
        ]);

        let output = '';
        let errorOutput = '';

        ffprobe.stdout.on('data', (data) => {
            output += data.toString();
        });

        ffprobe.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        ffprobe.on('close', (code) => {
            if (code === 0) {
                try {
                    const info = JSON.parse(output);
                    resolve(info);
                } catch (error) {
                    reject(new Error('Failed to parse video info'));
                }
            } else {
                reject(new Error(errorOutput || 'FFprobe failed'));
            }
        });
    });
});

// Process video with FFmpeg
ipcMain.handle('process-video', async (event, options) => {
    const {
        inputPath,
        outputPath,
        codec,
        preset,
        resolution,
        bitrate,
        preserveAlpha,
        useGPU
    } = options;

    return new Promise((resolve, reject) => {
        // Validate input path
        console.log('\n🎬 VIDEO PROCESSING STARTED');
        console.log('📁 Input:', inputPath);
        console.log('📁 Output:', outputPath);
        console.log('🎥 Codec:', codec);
        console.log('⚙️ Preset:', preset);
        console.log('💾 Bitrate:', bitrate + 'k');
        console.log('📐 Resolution:', resolution);
        console.log('🎨 Alpha Channel:', preserveAlpha ? '✅ ENABLED' : '❌ DISABLED');
        console.log('🎮 GPU Acceleration:', useGPU ? '✅ ENABLED' : '❌ DISABLED');
        console.log('');
        
        if (!inputPath || inputPath === '') {
            const error = 'No input file path provided';
            console.error('❌', error);
            reject(new Error(error));
            return;
        }
        
        if (!fs.existsSync(inputPath)) {
            const error = `Input file not found: ${inputPath}`;
            console.error('❌', error);
            reject(new Error(error));
            return;
        }
        
        console.log('✅ Input file exists');
        
        // Validate output directory
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            try {
                fs.mkdirSync(outputDir, { recursive: true });
            } catch (err) {
                reject(new Error(`Cannot create output directory: ${outputDir}`));
                return;
            }
        }

        const args = [
            '-i', inputPath
        ];

        // Optimized encoding with special handling for WebM/VP9
        const isVP9 = codec === 'WebM (VP9)';
        const isAV1 = codec === 'AV1';
        
        if (useGPU && !isVP9 && !isAV1) {
            // GPU acceleration for H.264/H.265
            const gpuCodec = getGPUCodec(codec);
            if (gpuCodec) {
                console.log('🎮 Using GPU codec:', gpuCodec);
                args.push('-c:v', gpuCodec);
                
                if (gpuCodec.includes('nvenc')) {
                    args.push('-preset', 'fast');
                    args.push('-b:v', `${bitrate}k`);
                } else if (gpuCodec.includes('amf')) {
                    args.push('-quality', 'speed');
                    args.push('-b:v', `${bitrate}k`);
                } else if (gpuCodec.includes('qsv')) {
                    args.push('-preset', 'fast');
                    args.push('-b:v', `${bitrate}k`);
                }
            } else {
                // GPU not available
                console.log('💻 GPU not available, using CPU');
                args.push('-c:v', getCodecName(codec));
                args.push('-preset', 'ultrafast');
                args.push('-b:v', `${bitrate}k`);
            }
        } else {
            // CPU encoding with optimizations for VP9/AV1
            console.log('💻 Using CPU codec:', getCodecName(codec));
            args.push('-c:v', getCodecName(codec));
            
            if (isVP9) {
                // FormatFactory-style VP9 optimization - FAST!
                console.log('⚡ VP9 FAST MODE (FormatFactory-style optimization)');
                
                // Key settings that make VP9 fast like FormatFactory:
                args.push('-quality', 'realtime'); // Realtime quality mode
                args.push('-speed', '8'); // Maximum speed (0-8, where 8 is fastest)
                args.push('-cpu-used', '5'); // Balanced speed (FormatFactory uses 4-6)
                args.push('-deadline', 'realtime'); // Realtime deadline
                args.push('-row-mt', '1'); // Row-based multithreading
                args.push('-tile-columns', '2'); // Tile-based encoding for parallelization
                args.push('-threads', '0'); // Auto-detect optimal thread count
                args.push('-frame-parallel', '1'); // Frame-level parallelism
                args.push('-static-thresh', '0'); // Disable static threshold
                args.push('-max-intra-rate', '300'); // Allow more I-frames
                args.push('-lag-in-frames', '0'); // No look-ahead (faster)
                args.push('-error-resilient', '1'); // Error resilience
                args.push('-auto-alt-ref', '0'); // Disable alt-ref frames (slower)
                args.push('-b:v', `${bitrate}k`);
                args.push('-crf', '31'); // Quality level (lower=better, 31=fast)
            } else if (isAV1) {
                // OPTIMIZED AV1 settings
                args.push('-cpu-used', '8'); // Fastest
                args.push('-row-mt', '1');
                args.push('-threads', '0');
                args.push('-b:v', `${bitrate}k`);
            } else {
                // H.264/H.265 CPU encoding
                args.push('-preset', 'ultrafast');
                args.push('-b:v', `${bitrate}k`);
            }
        }

        // Add resolution scaling and alpha channel handling
        if (resolution && resolution !== 'original') {
            // Check if we need alpha channel support
            if (preserveAlpha && codec === 'WebM (VP9)') {
                // WebM with alpha: scale + pixel format with alpha
                args.push('-vf', `scale=${resolution},format=yuva420p`);
                console.log('✅ Alpha channel enabled for WebM');
            } else if (preserveAlpha && codec === 'H.265 (HEVC)') {
                // HEVC with alpha (uses yuv420p10le for 10-bit with better quality)
                args.push('-vf', `scale=${resolution}`);
                args.push('-pix_fmt', 'yuv420p10le');
                console.log('✅ 10-bit encoding enabled for HEVC');
            } else {
                // Standard scaling without alpha
                args.push('-vf', `scale=${resolution}`);
            }
        } else {
            // No scaling, but check for alpha
            if (preserveAlpha && codec === 'WebM (VP9)') {
                args.push('-pix_fmt', 'yuva420p');
                console.log('✅ Alpha channel enabled for WebM');
            } else if (preserveAlpha && codec === 'H.265 (HEVC)') {
                args.push('-pix_fmt', 'yuv420p10le');
                console.log('✅ 10-bit encoding enabled for HEVC');
            }
        }

        // Audio handling - use correct audio codec for each container
        if (isVP9) {
            // WebM requires Opus or Vorbis audio
            args.push('-c:a', 'libopus'); // Opus is best for WebM
            args.push('-b:a', '128k');
        } else {
            // MP4 containers use AAC
            args.push('-c:a', 'aac');
            args.push('-b:a', '128k');
        }

        // Overwrite output
        args.push('-y');

        // Output file
        args.push(outputPath);

        console.log('=== FFmpeg Command ===');
        console.log('FFmpeg Path:', ffmpegPath);
        console.log('Arguments:', args.join(' '));
        console.log('====================');

        const ffmpeg = spawn(ffmpegPath, args);
        currentFFmpegProcess = ffmpeg; // Track for cancellation

        let duration = 0;
        let currentTime = 0;
        let errorOutput = '';
        let wasCancelled = false;

        ffmpeg.stdout.on('data', (data) => {
            console.log('FFmpeg stdout:', data.toString());
        });

        ffmpeg.stderr.on('data', (data) => {
            const output = data.toString();
            errorOutput += output; // Collect all output
            
            // Always log FFmpeg output for debugging
            console.log('FFmpeg:', output.trim());
            
            // Log errors for debugging
            if (output.includes('Error') || output.includes('Invalid') || output.includes('failed')) {
                console.error('FFmpeg error:', output);
            }

            // Extract duration
            const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.\d{2}/);
            if (durationMatch) {
                const hours = parseInt(durationMatch[1]);
                const minutes = parseInt(durationMatch[2]);
                const seconds = parseInt(durationMatch[3]);
                duration = hours * 3600 + minutes * 60 + seconds;
                console.log('📹 Video duration:', duration, 'seconds');
            }

            // Extract current time
            const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})\.\d{2}/);
            if (timeMatch && duration > 0) {
                const hours = parseInt(timeMatch[1]);
                const minutes = parseInt(timeMatch[2]);
                const seconds = parseInt(timeMatch[3]);
                currentTime = hours * 3600 + minutes * 60 + seconds;

                const progress = Math.min(Math.round((currentTime / duration) * 100), 100);
                
                console.log(`⏱️ Progress: ${progress}% (${currentTime}/${duration}s)`);
                
                // Send progress update to renderer
                event.sender.send('video-progress', {
                    inputPath,
                    progress
                });
            }
        });

        ffmpeg.on('close', (code) => {
            currentFFmpegProcess = null; // Clear tracking
            console.log(`FFmpeg process exited with code: ${code}`);
            
            if (wasCancelled) {
                console.log('🛑 Processing was cancelled');
                reject(new Error('Processing cancelled by user'));
            } else if (code === 0) {
                console.log('✅ Video processing successful:', outputPath);
                resolve({ success: true, outputPath });
            } else {
                // Extract the most relevant error from FFmpeg output
                let errorMsg = `FFmpeg failed (exit code ${code})`;
                
                // Try to find specific error messages
                if (errorOutput.includes('No NVENC capable devices found')) {
                    errorMsg = 'GPU encoding not available. Please disable GPU ACCELERATION and try again.';
                } else if (errorOutput.includes('Unknown encoder')) {
                    errorMsg = 'GPU encoder not supported. Please disable GPU ACCELERATION and try again.';
                } else if (errorOutput.includes('not found') || errorOutput.includes('does not exist')) {
                    errorMsg = 'Input file not found or invalid.';
                } else {
                    // Show last line of error output
                    const lines = errorOutput.split('\n').filter(l => l.trim());
                    const lastError = lines.slice(-3).join(' | ');
                    if (lastError) errorMsg += ': ' + lastError;
                }
                
                console.error('❌ Video processing failed:', errorMsg);
                console.error('Full FFmpeg output:', errorOutput);
                reject(new Error(errorMsg));
            }
        });

        ffmpeg.on('error', (error) => {
            currentFFmpegProcess = null;
            console.error('❌ FFmpeg spawn error:', error);
            reject(error);
        });
        
        // Add cancel listener
        event.sender.once('cancel-processing', () => {
            if (ffmpeg && !ffmpeg.killed) {
                console.log('🛑 Cancelling FFmpeg process...');
                wasCancelled = true;
                ffmpeg.kill('SIGTERM'); // Graceful termination
                setTimeout(() => {
                    if (!ffmpeg.killed) ffmpeg.kill('SIGKILL'); // Force kill if needed
                }, 2000);
            }
        });
    });
});

// Cancel current processing
ipcMain.handle('cancel-processing', async () => {
    if (currentFFmpegProcess && !currentFFmpegProcess.killed) {
        console.log('🛑 Killing current FFmpeg process');
        currentFFmpegProcess.kill('SIGKILL');
        currentFFmpegProcess = null;
        return { cancelled: true };
    }
    return { cancelled: false };
});

// Select output directory
ipcMain.handle('select-output-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});

// Select video files
ipcMain.handle('select-video-files', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'm4v', 'wmv', 'mpg', 'mpeg'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths;
    }
    return [];
});

// Helper function to map codec names
function getCodecName(codec) {
    const codecMap = {
        'H.265 (HEVC)': 'libx265',
        'H.264 (AVC)': 'libx264',
        'AV1': 'libaom-av1',
        'WebM (VP9)': 'libvpx-vp9'
    };
    return codecMap[codec] || 'libx264';
}

// Get GPU-accelerated codec if available
function getGPUCodec(codec) {
    const gpuCodecMap = {
        'H.265 (HEVC)': 'hevc_nvenc', // Try NVIDIA first
        'H.264 (AVC)': 'h264_nvenc',
        'AV1': null, // AV1 hardware encoding not widely available yet
        'WebM (VP9)': null // VP9 hardware encoding limited
    };
    return gpuCodecMap[codec];
}

// Map preset names for GPU encoding (NVIDIA NVENC)
function mapPresetToGPU(preset) {
    // Use older preset names for better compatibility
    const presetMap = {
        'Ultrafast': 'fast',
        'Superfast': 'fast',
        'Fast': 'medium',
        'Medium': 'medium',
        'Slow': 'slow'
    };
    return presetMap[preset] || 'medium';
}

// Map preset names for AMD AMF
function mapPresetToAMF(preset) {
    const presetMap = {
        'Ultrafast': 'speed',
        'Superfast': 'speed',
        'Fast': 'balanced',
        'Medium': 'balanced',
        'Slow': 'quality'
    };
    return presetMap[preset] || 'balanced';
}

// Check if FFmpeg is available
ipcMain.handle('check-ffmpeg', async () => {
    return {
        ffmpegPath,
        ffprobePath,
        available: fs.existsSync(ffmpegPath) && fs.existsSync(ffprobePath)
    };
});

// Check if a file exists
ipcMain.handle('check-file-exists', async (event, filePath) => {
    console.log('📁 Checking file existence:', filePath);
    try {
        const exists = fs.existsSync(filePath);
        console.log(exists ? '✅ File exists' : '❌ File NOT found');
        return exists;
    } catch (error) {
        console.error('❌ Error checking file:', error.message);
        return false;
    }
});
