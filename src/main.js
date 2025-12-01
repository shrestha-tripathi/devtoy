/**
 * DevToyNative - Main Application Entry
 * Offline Developer Utilities PWA
 * 
 * "Your data never leaves your device"
 */

// Import utilities
import { SmartPaste, getToolDisplayName } from './utils/smartPaste.js';
import { preferences } from './utils/storage.js';
import toast from './utils/toast.js';

// Import tools
import JsonFormatter from './tools/jsonFormatter.js';
import JwtDecoder from './tools/jwtDecoder.js';
import RegexTester from './tools/regexTester.js';
import UnixTimeConverter from './tools/unixTimeConverter.js';
import Base64Tool from './tools/base64Tool.js';

/**
 * DevToyNative Application
 */
class DevToyApp {
  constructor() {
    // Tool instances
    this.tools = {};
    this.currentTool = null;
    this.currentToolInstance = null;
    
    // Tool definitions
    this.toolDefinitions = {
      json: { name: 'JSON Formatter', class: JsonFormatter, shortcut: '1' },
      jwt: { name: 'JWT Decoder', class: JwtDecoder, shortcut: '2' },
      regex: { name: 'Regex Tester', class: RegexTester, shortcut: '3' },
      timestamp: { name: 'Unix Time Converter', class: UnixTimeConverter, shortcut: '4' },
      base64: { name: 'Base64 Encoder/Decoder', class: Base64Tool, shortcut: '5' }
    };
    
    // Initialize
    this.init();
  }
  
  /**
   * Initialize application
   */
  init() {
    // Setup theme
    this.setupTheme();
    
    // Setup sidebar
    this.setupSidebar();
    
    // Setup smart paste
    this.setupSmartPaste();
    
    // Setup command palette
    this.setupCommandPalette();
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    // Load last used tool
    const lastTool = preferences.get('lastTool') || 'json';
    this.switchTool(lastTool);
    
    // TODO: Re-enable PWA features in the future
    // Register service worker for PWA
    // this.registerServiceWorker();
    
    console.log('🛠️ DevToyNative initialized - Your data never leaves your device!');
  }
  
  /**
   * Setup theme (dark/light mode)
   */
  setupTheme() {
    const theme = preferences.get('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    
    const themeToggle = document.getElementById('themeToggle');
    themeToggle?.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      preferences.set('theme', newTheme);
    });
  }
  
  /**
   * Setup sidebar navigation
   */
  setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navItems = document.querySelectorAll('.nav-item');
    
    // Sidebar collapse toggle
    sidebarToggle?.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      preferences.set('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
    
    // Restore sidebar state
    if (preferences.get('sidebarCollapsed')) {
      sidebar.classList.add('collapsed');
    }
    
    // Mobile menu toggle
    mobileMenuBtn?.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      this.toggleSidebarOverlay(sidebar.classList.contains('mobile-open'));
    });
    
    // Navigation items
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const tool = item.dataset.tool;
        if (tool) {
          this.switchTool(tool);
          
          // Close mobile menu
          sidebar.classList.remove('mobile-open');
          this.toggleSidebarOverlay(false);
        }
      });
    });
  }
  
  /**
   * Toggle sidebar overlay for mobile
   */
  toggleSidebarOverlay(show) {
    let overlay = document.querySelector('.sidebar-overlay');
    
    if (show) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay active';
        overlay.addEventListener('click', () => {
          document.getElementById('sidebar').classList.remove('mobile-open');
          this.toggleSidebarOverlay(false);
        });
        document.body.appendChild(overlay);
      } else {
        overlay.classList.add('active');
      }
    } else if (overlay) {
      overlay.classList.remove('active');
    }
  }
  
  /**
   * Setup smart paste detection
   */
  setupSmartPaste() {
    const smartPasteInput = document.getElementById('smartPasteInput');
    
    this.smartPaste = new SmartPaste({
      onDetect: (result) => {
        console.log('Smart paste detected:', result);
        
        // Switch to detected tool
        if (result.tool && result.confidence > 0.5) {
          this.switchTool(result.tool, result.content);
          toast.info(`Detected: ${result.displayName}`);
        } else {
          // Default to JSON formatter
          this.switchTool('json', result.content);
        }
      },
      onError: (error) => {
        console.error('Smart paste error:', error);
        toast.error('Failed to process pasted content');
      }
    });
    
    // Handle paste in smart paste zone
    smartPasteInput?.addEventListener('input', () => {
      const content = smartPasteInput.value.trim();
      if (content) {
        this.smartPaste.processContent(content);
      }
    });
  }
  
  /**
   * Setup command palette (Ctrl+K)
   */
  setupCommandPalette() {
    const overlay = document.getElementById('cmdPaletteOverlay');
    const palette = document.getElementById('commandPalette');
    const input = document.getElementById('paletteInput');
    const list = document.getElementById('paletteList');
    const openBtn = document.getElementById('cmdPaletteBtn');
    
    // Populate palette with tools
    this.updatePaletteList('');
    
    // Open palette
    const openPalette = () => {
      overlay.classList.add('active');
      input.value = '';
      input.focus();
      this.updatePaletteList('');
    };
    
    // Close palette
    const closePalette = () => {
      overlay.classList.remove('active');
    };
    
    // Open button
    openBtn?.addEventListener('click', openPalette);
    
    // Close on overlay click
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closePalette();
      }
    });
    
    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closePalette();
      }
    });
    
    // Ctrl+K / Cmd+K to open
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (overlay.classList.contains('active')) {
          closePalette();
        } else {
          openPalette();
        }
      }
    });
    
    // Search/filter
    input?.addEventListener('input', () => {
      this.updatePaletteList(input.value);
    });
    
    // Keyboard navigation
    let selectedIndex = 0;
    input?.addEventListener('keydown', (e) => {
      const items = list.querySelectorAll('.palette-item');
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        this.updatePaletteSelection(items, selectedIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        this.updatePaletteSelection(items, selectedIndex);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = items[selectedIndex];
        if (selected) {
          const tool = selected.dataset.tool;
          if (tool) {
            this.switchTool(tool);
            closePalette();
          }
        }
      }
    });
  }
  
  /**
   * Update palette list based on search
   */
  updatePaletteList(query) {
    const list = document.getElementById('paletteList');
    const lowercaseQuery = query.toLowerCase();
    
    const icons = {
      json: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>`,
      jwt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
      regex: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
      timestamp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
      base64: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>`
    };
    
    const filteredTools = Object.entries(this.toolDefinitions)
      .filter(([key, tool]) => {
        return key.includes(lowercaseQuery) || 
               tool.name.toLowerCase().includes(lowercaseQuery);
      });
    
    list.innerHTML = filteredTools.map(([key, tool], index) => `
      <li class="palette-item ${index === 0 ? 'selected' : ''}" data-tool="${key}">
        ${icons[key]}
        <span>${tool.name}</span>
        <kbd>${tool.shortcut}</kbd>
      </li>
    `).join('');
    
    // Add click handlers
    list.querySelectorAll('.palette-item').forEach(item => {
      item.addEventListener('click', () => {
        const tool = item.dataset.tool;
        if (tool) {
          this.switchTool(tool);
          document.getElementById('cmdPaletteOverlay').classList.remove('active');
        }
      });
    });
  }
  
  /**
   * Update palette selection
   */
  updatePaletteSelection(items, index) {
    items.forEach((item, i) => {
      item.classList.toggle('selected', i === index);
    });
  }
  
  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Number keys for tool switching
      if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.metaKey) {
        const toolIndex = parseInt(e.key) - 1;
        const tools = Object.keys(this.toolDefinitions);
        if (tools[toolIndex]) {
          this.switchTool(tools[toolIndex]);
        }
      }
    });
  }
  
  /**
   * Switch to a different tool
   */
  switchTool(toolKey, initialContent = null) {
    const definition = this.toolDefinitions[toolKey];
    if (!definition) {
      console.error('Unknown tool:', toolKey);
      return;
    }
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.tool === toolKey);
    });
    
    // Update title
    document.getElementById('toolTitle').textContent = definition.name;
    
    // Hide smart paste zone
    const smartPasteZone = document.getElementById('smartPasteZone');
    if (smartPasteZone) {
      smartPasteZone.style.display = 'none';
    }
    
    // Destroy previous tool instance
    if (this.currentToolInstance) {
      this.currentToolInstance.destroy();
    }
    
    // Get or create tool container
    const containerId = `${toolKey}Panel`;
    let container = document.getElementById(containerId);
    
    // Hide all panels
    document.querySelectorAll('.tool-panel').forEach(panel => {
      panel.style.display = 'none';
    });
    
    // Show selected panel
    if (container) {
      container.style.display = 'block';
    }
    
    // Create tool instance
    this.currentToolInstance = new definition.class(container);
    this.currentTool = toolKey;
    
    // Set initial content if provided
    if (initialContent && this.currentToolInstance.setInput) {
      this.currentToolInstance.setInput(initialContent);
    }
    
    // Save last used tool
    preferences.set('lastTool', toolKey);
  }
  
  /**
   * Register service worker for PWA with update handling
   */
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    try {
      // Determine base path for service worker
      const basePath = import.meta.env.BASE_URL || '/';
      const swPath = `${basePath}sw.js`;
      
      const registration = await navigator.serviceWorker.register(swPath, {
        updateViaCache: 'none' // Don't cache the service worker itself
      });
      
      console.log('[App] Service Worker registered:', registration.scope);

      // Check for updates immediately
      registration.update();

      // Check for updates every 5 minutes
      setInterval(() => {
        registration.update();
      }, 5 * 60 * 1000);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('[App] New service worker found, installing...');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            console.log('[App] New version available!');
            this.showUpdateNotification(registration);
          }
        });
      });

      // Handle controller change (when new SW takes over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[App] New service worker activated, reloading...');
        window.location.reload();
      });

    } catch (error) {
      console.log('[App] Service Worker registration failed:', error);
    }
  }

  /**
   * Show update notification to user
   */
  showUpdateNotification(registration) {
    // Create update banner
    const banner = document.createElement('div');
    banner.className = 'update-banner';
    banner.innerHTML = `
      <div class="update-banner-content">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
          <path d="M16 21h5v-5"/>
        </svg>
        <span>A new version is available!</span>
        <button class="update-btn" id="updateBtn">Update Now</button>
        <button class="dismiss-btn" id="dismissBtn">×</button>
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .update-banner {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        animation: slideUp 0.3s ease;
      }
      @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      .update-banner-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: linear-gradient(135deg, #06b6d4, #a855f7);
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(6, 182, 212, 0.3);
        color: white;
        font-size: 14px;
      }
      .update-banner-content svg {
        width: 20px;
        height: 20px;
      }
      .update-btn {
        padding: 6px 16px;
        background: white;
        color: #0f172a;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
      }
      .update-btn:hover {
        transform: scale(1.05);
      }
      .dismiss-btn {
        background: transparent;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        opacity: 0.7;
        padding: 0 4px;
      }
      .dismiss-btn:hover {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(banner);

    // Handle update button
    document.getElementById('updateBtn').addEventListener('click', () => {
      if (registration.waiting) {
        // Tell the waiting SW to skip waiting and activate
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      banner.remove();
    });

    // Handle dismiss button
    document.getElementById('dismissBtn').addEventListener('click', () => {
      banner.remove();
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.devToy = new DevToyApp();
});

export default DevToyApp;
