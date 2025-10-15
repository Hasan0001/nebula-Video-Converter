# 🌌 Nebula Encode - Professional Video Optimization Suite

A beautiful, professional Windows desktop application for video encoding and optimization with a stunning glassmorphism UI.

![Nebula Encode](https://img.shields.io/badge/version-1.0.0-brightgreen)
![Platform](https://img.shields.io/badge/platform-Windows-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **Professional Glassmorphism UI** - Modern, sleek interface with stunning visual effects
- **Batch Processing** - Process multiple videos in queue
- **Real-time Progress Tracking** - See encoding progress with hyperspace animation
- **Multiple Codecs** - Support for H.265 (HEVC), H.264 (AVC), AV1, and WebM (VP9)
- **GPU Acceleration** - Hardware acceleration support for faster encoding
- **Flexible Settings** - Control resolution, bitrate, preset, and more
- **Drag & Drop** - Easy file management
- **Standalone Windows App** - No Python or other dependencies needed!

## 🚀 Quick Start

### For Users (Running the App)

1. **Download** the installer: `NebulaEncode-Setup-1.0.0.exe`
2. **Run** the installer
3. **Launch** Nebula Encode from your desktop or start menu
4. **Drag and drop** your videos
5. **Configure** your encoding settings
6. **Click** "START BATCH" and watch the magic happen!

## 🛠️ For Developers (Building from Source)

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Windows 10/11** (for building Windows apps)

### Installation Steps

1. **Clone or download** this repository

2. **Open PowerShell** in the project directory

3. **Install dependencies**:
   ```powershell
   npm install
   ```
   This will automatically download FFmpeg binaries (takes 2-3 minutes)

### Running in Development Mode

```powershell
npm start
```

This launches the app in development mode where you can test all features.

### Building the Windows Installer (.exe)

To create a distributable Windows installer:

```powershell
npm run build
```

**What happens:**
- Electron packages your app with all dependencies
- FFmpeg binaries are bundled automatically
- A Windows installer is created in the `dist` folder
- The output file will be: `dist/NebulaEncode-Setup-1.0.0.exe`

**Build time:** ~2-5 minutes depending on your system

### Building without Installer (Portable)

If you want a portable version without an installer:

```powershell
npm run build:dir
```

This creates a folder in `dist/win-unpacked` that you can copy to any Windows PC.

## 📁 Project Structure

```
nebula-encode/
├── main.js              # Electron main process (backend)
├── preload.js           # Bridge between frontend and backend
├── ui.html              # Frontend UI (your beautiful design!)
├── package.json         # Project configuration
├── download-ffmpeg.js   # FFmpeg setup helper
├── icon.ico             # App icon (add your own!)
└── dist/                # Built installers appear here
```

## 🎨 Customization

### Changing the App Icon

1. Create or download a `.ico` file (256x256 or larger)
2. Replace `icon.ico` in the root directory
3. Rebuild the app with `npm run build`

### Modifying the UI

All UI code is in `ui.html`. The design uses:
- **Tailwind CSS** (via CDN)
- **Custom CSS variables** for colors and effects
- **Canvas animations** for the hyperspace effect

### Adjusting Video Settings

Edit `main.js` to modify:
- Default codec settings
- FFmpeg parameters
- GPU acceleration options
- Output formats

## 🎯 Supported Video Formats

**Input:** Almost any video format (MP4, MOV, AVI, MKV, WebM, FLV, etc.)

**Output:** MP4 (with your chosen codec)

## ⚙️ System Requirements

### Minimum:
- Windows 10 (64-bit)
- 4 GB RAM
- 500 MB free disk space
- Any modern CPU

### Recommended:
- Windows 10/11 (64-bit)
- 8 GB RAM or more
- GPU with hardware encoding support (NVIDIA/AMD)
- SSD storage

## 🐛 Troubleshooting

### "FFmpeg not found" error
- Run `npm install` again to download FFmpeg
- Check that `node_modules/@ffmpeg-installer` exists

### App won't build
- Make sure Node.js v18+ is installed: `node --version`
- Delete `node_modules` folder and run `npm install` again
- Disable antivirus temporarily (it may block electron-builder)

### Videos won't process
- Make sure the video file isn't corrupted
- Try a different codec (H.264 is most compatible)
- Check that you selected an output directory

### Slow encoding
- Enable GPU Acceleration in the settings
- Choose "Ultrafast" or "Superfast" preset
- Lower the resolution or bitrate

## 📦 Distribution

### Sharing with Friends

1. Build the installer: `npm run build`
2. Share the file: `dist/NebulaEncode-Setup-1.0.0.exe`
3. Your friends just need to run the installer - no other software needed!

**File size:** ~100-150 MB (includes FFmpeg)

### Creating a Portable Version

1. Run: `npm run build:dir`
2. Zip the folder: `dist/win-unpacked`
3. Share the zip file
4. Users extract and run `Nebula Encode.exe`

## 🔒 Security & Privacy

- **No internet required** - Works completely offline
- **No data collection** - All processing happens locally
- **No telemetry** - Your videos never leave your computer

## 📄 License

MIT License - Feel free to modify and distribute!

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 💡 Tips

- **Batch Processing:** Add multiple videos before clicking "START BATCH" for efficient encoding
- **Output Location:** Click on the destination path to choose where to save your encoded videos
- **Presets:** Use "Fast" or "Medium" for best quality/speed balance
- **GPU Acceleration:** Significantly faster on systems with modern GPUs

## 🌟 Credits

- **UI Design:** Beautiful glassmorphism design with Tailwind CSS
- **Video Processing:** FFmpeg (the industry-standard video tool)
- **Framework:** Electron (makes desktop apps with web technologies)

## 📞 Support

For issues or questions, create an issue in the repository.

---

**Enjoy encoding with Nebula Encode! 🚀✨**
