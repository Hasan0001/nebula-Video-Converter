# 🚀 QUICK START GUIDE

## For You (Development)

1. **Install Dependencies** (First time only):
   ```powershell
   npm install
   ```

2. **Run the App**:
   ```powershell
   npm start
   ```

3. **Build Windows Installer** (to share with friends):
   ```powershell
   npm run build
   ```
   - Find the installer in: `dist\NebulaEncode-Setup-1.0.0.exe`

---

## For Your Friends (Just Use It!)

1. **Get the installer**: `NebulaEncode-Setup-1.0.0.exe`
2. **Run it** and install
3. **Open Nebula Encode**
4. **Drag & drop videos**
5. **Click "START BATCH"**
6. **Done!** ✨

---

## What You Can Do

### Add Videos
- Drag & drop videos into the circular drop zone
- OR click the drop zone to browse files
- Add as many as you want!

### Configure Settings
- **Codec**: Choose H.265 for better compression, H.264 for compatibility
- **Preset**: Faster = quicker but bigger files, Slower = better compression
- **Resolution**: Drag slider to change output resolution
- **Bitrate**: Higher = better quality but larger files
- **GPU Acceleration**: Enable for much faster encoding (if you have a good GPU)
- **Alpha Channel**: Keep transparency in videos (if supported)

### Choose Output Location
- **Click** on the destination path at the bottom
- Select where you want your encoded videos saved
- Files will be named: `originalname_optimized.mp4`

### Process Videos
1. Click **"START BATCH"**
2. Watch the cool hyperspace animation
3. See real-time progress for each video
4. All files processed automatically!

### Remove Videos
- Click the **×** button on any video in the queue
- Or click **"CLEAR ALL"** to remove everything

---

## Tips for Best Results

🎯 **For Smaller Files**: Use H.265 codec, lower bitrate
🚀 **For Speed**: Enable GPU acceleration, use Ultrafast preset  
🎨 **For Quality**: Use H.264 or H.265, higher bitrate, Slow preset
💾 **For Compatibility**: Use H.264 codec (works everywhere)

---

## Troubleshooting

**App won't start?**
- Make sure you ran `npm install` first
- Check that Node.js is installed: `node --version`

**Videos won't process?**
- Make sure you selected an output directory
- Check that the video file isn't corrupted
- Try H.264 codec (most compatible)

**Slow processing?**
- Enable GPU Acceleration
- Use "Ultrafast" or "Superfast" preset
- Lower the resolution

---

## Building for Distribution

When you want to share with friends:

```powershell
npm run build
```

Then share: `dist\NebulaEncode-Setup-1.0.0.exe` (~100-150 MB)

**Your friends don't need:**
- ❌ Node.js
- ❌ Python
- ❌ FFmpeg
- ❌ Anything else!

**They just need:**
- ✅ Windows 10/11
- ✅ The installer you give them
- ✅ That's it!

---

## File Locations After Install

When your friends install the app:
- **Program**: `C:\Users\[Username]\AppData\Local\Programs\nebula-encode`
- **Shortcut**: Desktop and Start Menu
- **Videos**: Wherever they choose (output directory)

---

Made with ❤️ | Enjoy encoding! 🌌
