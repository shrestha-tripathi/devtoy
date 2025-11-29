# DevToyNative 🛠️

> **Offline Developer Utilities - Your data never leaves your device.**

A Swiss-Army-Knife developer utility application that runs entirely client-side. Built with Vite, vanilla JavaScript, and designed as a Progressive Web App (PWA) with WebAssembly architecture support.

![DevToyNative](https://img.shields.io/badge/Status-MVP-brightgreen) ![Offline](https://img.shields.io/badge/Offline-100%25-blue) ![Privacy](https://img.shields.io/badge/Privacy-First-purple)

## ✨ Features

### 🔐 Privacy First
- **Zero server calls** - All processing happens in your browser
- **No data transmission** - Your sensitive data never leaves your device
- **Works offline** - Full functionality without internet connection

### 🎯 Smart Paste Detection
Paste any content and DevToyNative automatically detects the format:
- JSON objects/arrays
- JWT tokens
- Base64 encoded strings
- Unix timestamps
- Regular expressions

### 🧰 Included Tools

| Tool | Features |
|------|----------|
| **JSON Formatter** | Beautify, minify, tree view, syntax highlighting, validation |
| **JWT Decoder** | Decode header/payload, verify signatures, show expiration status |
| **Regex Tester** | Live matching, group extraction, WASM-ready architecture |
| **Unix Time Converter** | Bidirectional conversion, multiple formats (s/ms/ns), live updates |
| **Base64 Encoder/Decoder** | Standard & URL-safe encoding, live preview |

### 🎨 Premium UI/UX
- **Glassmorphism design** - Modern frosted glass effects
- **Dark mode** - Deep dark theme with neon accents (cyan/purple)
- **Light mode** - Clean, easy-on-the-eyes alternative
- **Responsive** - Works on desktop, tablet, and mobile
- **Command Palette** - Quick access with `Ctrl+K` / `Cmd+K`

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
cd DevToy

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Open command palette |
| `1` | JSON Formatter |
| `2` | JWT Decoder |
| `3` | Regex Tester |
| `4` | Unix Time Converter |
| `5` | Base64 Encoder/Decoder |
| `Esc` | Close command palette |

## 🏗️ Architecture

```
DevToy/
├── index.html              # Main HTML entry
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration with WASM support
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker for offline support
│   └── icons/              # App icons
└── src/
    ├── main.js             # Application entry point
    ├── styles/
    │   └── main.css        # Glassmorphism styles
    ├── tools/
    │   ├── jsonFormatter.js
    │   ├── jwtDecoder.js
    │   ├── regexTester.js
    │   ├── unixTimeConverter.js
    │   └── base64Tool.js
    └── utils/
        ├── smartPaste.js   # Format auto-detection
        ├── storage.js      # LocalStorage wrapper
        └── toast.js        # Notification system
```

## 🔧 WebAssembly Integration

The architecture is designed to support WASM-based processing engines:

```javascript
// Example: Regex engine abstraction (src/tools/regexTester.js)
class RegexEngine {
  async initWasm() {
    // Load Rust regex crate compiled to WASM
    // const wasm = await import('../../wasm/regex_engine.wasm');
    // this.wasmEngine = await wasm.default();
  }
  
  execute(pattern, flags, text) {
    if (this.wasmLoaded) {
      return this.executeWasm(pattern, flags, text);
    }
    return this.executeNative(pattern, flags, text);
  }
}
```

To add a WASM-based regex engine:
1. Compile a Rust regex crate to WASM using `wasm-pack`
2. Place the `.wasm` file in `src/wasm/`
3. Update the `initWasm()` method to load and initialize

## 📱 PWA Features

- **Installable** - Add to home screen on mobile/desktop
- **Offline first** - Full functionality without internet
- **App shortcuts** - Quick access to specific tools
- **Automatic updates** - Service worker handles cache updates

## 🎨 Customization

### Theme Colors
Edit CSS variables in `src/styles/main.css`:

```css
:root {
  --bg-primary: #0f172a;
  --accent-cyan: #06b6d4;
  --accent-purple: #a855f7;
  /* ... */
}
```

### Adding New Tools

1. Create a new tool class in `src/tools/`:

```javascript
export class MyTool {
  constructor(container) {
    this.container = container;
    this.render();
    this.attachEvents();
  }
  
  render() {
    this.container.innerHTML = `<!-- Your UI -->`;
  }
  
  attachEvents() {
    // Event listeners
  }
  
  setInput(content) {
    // Handle smart paste
  }
  
  destroy() {
    this.container.innerHTML = '';
  }
}
```

2. Register in `src/main.js`:

```javascript
import MyTool from './tools/myTool.js';

this.toolDefinitions = {
  // ...existing tools
  mytool: { name: 'My Tool', class: MyTool, shortcut: '6' }
};
```

3. Add navigation item in `index.html`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this in your projects!

---

**DevToyNative** - Built with ❤️ for developers who value privacy.
