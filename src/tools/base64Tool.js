/**
 * DevToyNative - Base64 Encoder/Decoder Tool
 * Features: Encode/Decode, URL-safe mode, Live preview
 */

import toast from '../utils/toast.js';
import { history, preferences } from '../utils/storage.js';

/**
 * Base64 Encoder/Decoder Tool
 */
export class Base64Tool {
  constructor(container) {
    this.container = container;
    this.mode = 'encode';
    this.urlSafe = preferences.get('base64UrlSafe') || false;
    this.render();
    this.attachEvents();
  }
  
  /**
   * Render the Base64 tool UI
   */
  render() {
    this.container.innerHTML = `
      <div class="panel-header">
        <div class="tabs" id="modeTabs">
          <button class="tab active" data-mode="encode">Encode</button>
          <button class="tab" data-mode="decode">Decode</button>
        </div>
        <div class="panel-actions">
          <div class="toggle-group">
            <span class="toggle-label">URL Safe</span>
            <div class="toggle ${this.urlSafe ? 'active' : ''}" id="urlSafeToggle"></div>
          </div>
          <button class="btn btn-secondary" id="base64Swap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m17 3 4 4-4 4"/>
              <path d="m7 21-4-4 4-4"/>
              <path d="M21 7H3M3 17h18"/>
            </svg>
            Swap
          </button>
          <button class="btn btn-secondary" id="base64Clear">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            Clear
          </button>
        </div>
      </div>
      
      <div class="split-view">
        <div class="code-editor">
          <div class="code-editor-header">
            <span class="code-editor-title" id="inputTitle">Plain Text</span>
            <div class="code-editor-actions">
              <span class="char-count" id="inputCount">0 chars</span>
              <button class="code-editor-btn" id="inputPaste">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                </svg>
                Paste
              </button>
            </div>
          </div>
          <div class="code-content">
            <textarea 
              class="input-field" 
              id="base64Input" 
              placeholder="Enter text to encode..."
              spellcheck="false"
            ></textarea>
          </div>
        </div>
        
        <div class="code-editor">
          <div class="code-editor-header">
            <span class="code-editor-title" id="outputTitle">Base64</span>
            <div class="code-editor-actions">
              <span class="char-count" id="outputCount">0 chars</span>
              <button class="code-editor-btn" id="outputCopy">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
                Copy
              </button>
            </div>
          </div>
          <div class="code-content">
            <textarea 
              class="input-field output-field" 
              id="base64Output" 
              placeholder="Output will appear here..."
              readonly
            ></textarea>
          </div>
        </div>
      </div>
      
      <!-- Info Cards -->
      <div class="info-cards" style="margin-top: 24px;">
        <div class="info-card">
          <div class="info-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </div>
          <div class="info-card-content">
            <h4>What is Base64?</h4>
            <p>Base64 is a binary-to-text encoding scheme that represents binary data in ASCII format. It's commonly used for encoding binary data in URLs, emails, and data URIs.</p>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="info-card-content">
            <h4>URL-Safe Mode</h4>
            <p>URL-safe Base64 replaces + with - and / with _, making the output safe for use in URLs and filenames. Padding (=) is also removed.</p>
          </div>
        </div>
      </div>
      
      <style>
        .output-field {
          background: var(--bg-secondary) !important;
        }
        
        .char-count {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }
        
        .info-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }
        
        .info-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
        }
        
        .info-card-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          color: var(--accent-cyan);
        }
        
        .info-card-icon svg {
          width: 20px;
          height: 20px;
        }
        
        .info-card-content h4 {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--text-primary);
        }
        
        .info-card-content p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
      </style>
    `;
  }
  
  /**
   * Attach event listeners
   */
  attachEvents() {
    const input = this.container.querySelector('#base64Input');
    const modeTabs = this.container.querySelectorAll('.tab');
    const urlSafeToggle = this.container.querySelector('#urlSafeToggle');
    const swapBtn = this.container.querySelector('#base64Swap');
    const clearBtn = this.container.querySelector('#base64Clear');
    const pasteBtn = this.container.querySelector('#inputPaste');
    const copyBtn = this.container.querySelector('#outputCopy');
    
    // Input change with debounce
    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => this.process(), 100);
    });
    
    // Mode tabs
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        modeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.mode = tab.dataset.mode;
        this.updateLabels();
        this.process();
      });
    });
    
    // URL-safe toggle
    urlSafeToggle.addEventListener('click', () => {
      urlSafeToggle.classList.toggle('active');
      this.urlSafe = urlSafeToggle.classList.contains('active');
      preferences.set('base64UrlSafe', this.urlSafe);
      this.process();
    });
    
    // Swap button
    swapBtn.addEventListener('click', () => this.swap());
    
    // Clear button
    clearBtn.addEventListener('click', () => this.clear());
    
    // Paste button
    pasteBtn.addEventListener('click', () => this.pasteFromClipboard());
    
    // Copy button
    copyBtn.addEventListener('click', () => this.copyOutput());
  }
  
  /**
   * Update input/output labels based on mode
   */
  updateLabels() {
    const inputTitle = this.container.querySelector('#inputTitle');
    const outputTitle = this.container.querySelector('#outputTitle');
    const input = this.container.querySelector('#base64Input');
    
    if (this.mode === 'encode') {
      inputTitle.textContent = 'Plain Text';
      outputTitle.textContent = 'Base64';
      input.placeholder = 'Enter text to encode...';
    } else {
      inputTitle.textContent = 'Base64';
      outputTitle.textContent = 'Plain Text';
      input.placeholder = 'Enter Base64 to decode...';
    }
  }
  
  /**
   * Process input (encode or decode)
   */
  process() {
    const input = this.container.querySelector('#base64Input');
    const output = this.container.querySelector('#base64Output');
    const inputCount = this.container.querySelector('#inputCount');
    const outputCount = this.container.querySelector('#outputCount');
    
    const value = input.value;
    inputCount.textContent = `${value.length} chars`;
    
    if (!value) {
      output.value = '';
      outputCount.textContent = '0 chars';
      return;
    }
    
    try {
      let result;
      
      if (this.mode === 'encode') {
        result = this.encode(value);
      } else {
        result = this.decode(value);
      }
      
      output.value = result;
      outputCount.textContent = `${result.length} chars`;
      output.style.color = '';
      
      // Save to history
      history.add('base64', { input: value.substring(0, 50) });
      
    } catch (error) {
      output.value = `Error: ${error.message}`;
      output.style.color = 'var(--accent-red)';
      outputCount.textContent = 'Error';
    }
  }
  
  /**
   * Encode string to Base64
   */
  encode(str) {
    try {
      // Handle Unicode characters
      const encoded = btoa(unescape(encodeURIComponent(str)));
      
      if (this.urlSafe) {
        return encoded
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
      }
      
      return encoded;
    } catch (error) {
      throw new Error('Failed to encode: ' + error.message);
    }
  }
  
  /**
   * Decode Base64 to string
   */
  decode(str) {
    try {
      let base64 = str.trim();
      
      if (this.urlSafe) {
        // Convert URL-safe Base64 back to standard
        base64 = base64
          .replace(/-/g, '+')
          .replace(/_/g, '/');
        
        // Add padding if needed
        const padding = base64.length % 4;
        if (padding) {
          base64 += '='.repeat(4 - padding);
        }
      }
      
      // Handle Unicode characters
      return decodeURIComponent(escape(atob(base64)));
    } catch (error) {
      throw new Error('Invalid Base64 input');
    }
  }
  
  /**
   * Swap input and output
   */
  swap() {
    const input = this.container.querySelector('#base64Input');
    const output = this.container.querySelector('#base64Output');
    
    const outputValue = output.value;
    if (!outputValue || outputValue.startsWith('Error:')) {
      toast.error('Nothing to swap');
      return;
    }
    
    // Toggle mode
    this.mode = this.mode === 'encode' ? 'decode' : 'encode';
    
    // Update tabs
    const modeTabs = this.container.querySelectorAll('.tab');
    modeTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === this.mode);
    });
    
    // Swap values
    input.value = outputValue;
    this.updateLabels();
    this.process();
  }
  
  /**
   * Clear inputs
   */
  clear() {
    const input = this.container.querySelector('#base64Input');
    const output = this.container.querySelector('#base64Output');
    const inputCount = this.container.querySelector('#inputCount');
    const outputCount = this.container.querySelector('#outputCount');
    
    input.value = '';
    output.value = '';
    inputCount.textContent = '0 chars';
    outputCount.textContent = '0 chars';
  }
  
  /**
   * Paste from clipboard
   */
  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      const input = this.container.querySelector('#base64Input');
      input.value = text;
      this.process();
    } catch {
      toast.error('Failed to read clipboard');
    }
  }
  
  /**
   * Copy output to clipboard
   */
  async copyOutput() {
    const output = this.container.querySelector('#base64Output');
    
    if (!output.value || output.value.startsWith('Error:')) {
      toast.error('Nothing to copy');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(output.value);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  }
  
  /**
   * Set input content (for smart paste)
   */
  setInput(content) {
    const input = this.container.querySelector('#base64Input');
    
    // Try to detect if content is Base64
    const isBase64 = /^[A-Za-z0-9+/=_-]+$/.test(content.trim()) && content.length > 20;
    
    if (isBase64 && this.mode === 'encode') {
      // Switch to decode mode
      this.mode = 'decode';
      const modeTabs = this.container.querySelectorAll('.tab');
      modeTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === this.mode);
      });
      this.updateLabels();
    }
    
    input.value = content;
    this.process();
  }
  
  /**
   * Cleanup
   */
  destroy() {
    this.container.innerHTML = '';
  }
}

export default Base64Tool;
