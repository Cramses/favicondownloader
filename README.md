# favicon-dl

A minimalistic Chrome extension for downloading website favicons with developer-friendly features.

## Features

- 🎨 **Dark, minimalistic UI** - GitHub-inspired design for developers
- 📦 **Multiple format downloads** - Choose from 16×16, 32×32, original, or SVG
- 📋 **Copy favicon URL** - Quick clipboard copy
- 🔍 **Metadata display** - View format, dimensions, and file size
- 🔗 **Open in new tab** - Direct favicon viewing
- 🔒 **Privacy-friendly** - Only accesses the current tab (no browsing history)
- 🚀 **Auto-detection** - Finds all favicon variants in page HTML

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/favicondownloader.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in top-right corner)

4. Click **Load unpacked**

5. Select the `favicondownloader` folder

6. The extension icon will appear in your toolbar!

## Usage

1. Navigate to any website
2. Click the extension icon
3. Select desired download formats (checkboxes)
4. Click **Download Selected** to download
5. Or use **Copy URL** / **Open in New Tab** buttons

## Permissions

This extension requires minimal permissions:

- `activeTab` - Access favicon from current tab only
- `downloads` - Save favicons to your computer
- `scripting` - Detect favicons from page HTML
- `host_permissions` - Fetch favicon files

**Note:** This extension does NOT track your browsing history or access data from other tabs.

## Development

### Project Structure

```
favicondownloader/
├── manifest.json      # Extension configuration
├── popup.html         # Extension popup UI
├── popup.js          # Main logic
├── content.js        # Favicon detection script
├── styles.css        # Dark theme styling
└── README.md         # This file
```

### Tech Stack

- Vanilla JavaScript (no frameworks)
- Chrome Extensions Manifest V3
- Custom CSS (GitHub-inspired dark theme)

## Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests

## Roadmap

- [ ] Actual image resizing with Canvas API
- [ ] Base64 data URL generation
- [ ] HTML snippet generator
- [ ] Detect all favicon variants (apple-touch-icon, etc.)
- [ ] Bulk download all favicons
- [ ] Favicon history tracker
- [ ] Format conversion (PNG → ICO, etc.)

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

Created with ❤️ for developers who need quick favicon access

---

**Note:** This extension is not affiliated with or endorsed by Google Chrome.
# favicondownloader
