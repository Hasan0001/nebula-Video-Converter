// Helper script to ensure FFmpeg is installed
const fs = require('fs');
const path = require('path');

console.log('Checking FFmpeg installation...');

try {
    const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
    const ffprobePath = require('@ffprobe-installer/ffprobe').path;
    
    if (fs.existsSync(ffmpegPath)) {
        console.log('✓ FFmpeg found at:', ffmpegPath);
    } else {
        console.log('✗ FFmpeg not found at:', ffmpegPath);
    }
    
    if (fs.existsSync(ffprobePath)) {
        console.log('✓ FFprobe found at:', ffprobePath);
    } else {
        console.log('✗ FFprobe not found at:', ffprobePath);
    }
    
    console.log('FFmpeg setup complete!');
} catch (error) {
    console.error('Error checking FFmpeg:', error.message);
    process.exit(1);
}
