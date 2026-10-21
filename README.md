# 🧘 SerenityReader

Your peaceful reading companion. A Chrome extension that removes ads and provides a beautiful, customizable reader view with one click.

## Features

✨ **One-Click Reader View** - Transform any webpage into a clean, distraction-free reading experience
🚫 **Ad Removal** - Automatically detect and remove advertisements from pages
🎨 **Customizable** - Adjust font size, font family, line height, content width, and color themes
🌓 **Multiple Themes** - Light, Dark, and Sepia modes
💾 **Settings Sync** - Your preferences sync across Chrome browsers

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top-right corner)
3. Click "Load unpacked"
4. Select the `chrome-reader-extension` folder
5. The extension icon will appear in your toolbar

## Usage

### Quick Start
1. Navigate to any webpage
2. Click the SerenityReader extension icon
3. Choose an option:
   - **Enable Reader View** - Activate clean reading mode
   - **Remove Ads** - Strip ads from the current page
   - **Settings** - Customize your reading experience

### Keyboard Shortcuts
- Click "Exit Reader" button or click the extension icon again to disable reader view

### Customization
Click "Settings" in the popup to customize:
- **Font Size** (12-28px)
- **Font Family** (6 professional fonts)
- **Line Height** (1.2-2.0)
- **Content Width** (500-1000px)
- **Color Theme** (Light, Dark, Sepia)

All settings are saved automatically and sync across your Chrome browsers.

## How It Works

### Reader View
- Intelligently extracts main content using semantic HTML selectors
- Removes navigation, ads, and other distractions
- Applies clean typography and spacing
- Maintains images, code blocks, and formatting

### Ad Removal
- Detects common ad patterns and selectors
- Removes iframe-based ads (Google AdSense, DoubleClick, etc.)
- Identifies sponsored content
- Cleans up empty ad containers

## Development

### File Structure
```
chrome-reader-extension/
├── manifest.json           # Extension configuration
├── popup.html             # Extension popup UI
├── options.html           # Settings page
├── css/
│   └── reader.css         # Reader view styles
├── js/
│   ├── popup.js           # Popup functionality
│   ├── options.js         # Settings management
│   └── content.js         # Content script
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Key Technologies
- Manifest V3 (latest Chrome extension standard)
- Chrome Storage API for settings sync
- Chrome Scripting API for content injection
- Pure vanilla JavaScript (no dependencies)

## Permissions

The extension requires:
- `activeTab` - Access to the current tab when clicked
- `storage` - Save and sync your settings
- `scripting` - Inject reader view and ad removal scripts

## Browser Compatibility

- Chrome 88+
- Edge 88+
- Any Chromium-based browser supporting Manifest V3

## Tips

- Reader view works best on article pages, blog posts, and news sites
- For heavily ad-laden sites, use "Remove Ads" first, then enable Reader View
- Customize settings once - they'll apply to all future reader view sessions
- Dark mode is easier on the eyes for night reading
- Sepia mode reduces eye strain during extended reading sessions

## Troubleshooting

**Reader view looks broken:**
- Some sites use non-standard HTML structures
- Try adjusting content width in settings
- Ad removal may help clean up the content first

**Ads not removed:**
- The extension targets common ad patterns
- Some native advertising may not be detected
- Try refreshing the page after removal

**Settings not saving:**
- Ensure Chrome sync is enabled
- Check that the extension has storage permissions

## Privacy

- All processing happens locally in your browser
- No data is sent to external servers
- Settings are stored in Chrome's sync storage (if sync is enabled)
- No tracking or analytics

## License

MIT License - Free to use and modify

## Contributing

Found a bug or want to add a feature? Feel free to modify the code to suit your needs!

## Future Enhancements

Potential features to add:
- Export articles to PDF or Markdown
- Reading time estimation
- Text-to-speech integration
- Custom CSS injection
- Whitelist/blacklist for auto-activation
- Keyboard shortcuts
- More granular ad filters
- Save reading position
