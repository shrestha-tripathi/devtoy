/**
 * DevToyNative - JSON Formatter Tool
 * Features: Beautify, Minify, Tree View, Validation
 */

import toast from '../utils/toast.js';
import { history } from '../utils/storage.js';

/**
 * JSON Formatter Tool
 */
export class JsonFormatter {
  constructor(container) {
    this.container = container;
    this.currentJson = null;
    this.indent = 2;
    this.render();
    this.attachEvents();
  }
  
  /**
   * Render the JSON formatter UI
   */
  render() {
    this.container.innerHTML = `
      <div class="panel-header">
        <div class="panel-actions">
          <button class="btn btn-secondary" id="jsonBeautify">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m5 3 4 4-4 4"/>
              <path d="M11 19h10"/>
            </svg>
            Beautify
          </button>
          <button class="btn btn-secondary" id="jsonMinify">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 6H3M15 12H3M17 18H3"/>
            </svg>
            Minify
          </button>
          <button class="btn btn-secondary" id="jsonCopy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
            Copy
          </button>
          <button class="btn btn-secondary" id="jsonClear">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            Clear
          </button>
        </div>
        <div class="toggle-group">
          <span class="toggle-label">Tree View</span>
          <div class="toggle" id="jsonTreeToggle"></div>
        </div>
      </div>
      
      <div class="split-view">
        <div class="code-editor">
          <div class="code-editor-header">
            <span class="code-editor-title">Input</span>
            <div class="code-editor-actions">
              <button class="code-editor-btn" id="jsonPaste">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                </svg>
                Paste
              </button>
              <button class="code-editor-btn" id="jsonSample">
                Sample
              </button>
            </div>
          </div>
          <div class="code-content">
            <textarea 
              class="input-field" 
              id="jsonInput" 
              placeholder='Paste your JSON here...\n\nExample:\n{\n  "name": "DevToy",\n  "version": "1.0.0"\n}'
              spellcheck="false"
            ></textarea>
          </div>
        </div>
        
        <div class="code-editor">
          <div class="code-editor-header">
            <span class="code-editor-title">Output</span>
            <div class="code-editor-actions" id="jsonOutputActions">
              <span class="status-badge" id="jsonStatus" style="display: none;"></span>
            </div>
          </div>
          <div class="code-content" id="jsonOutput">
            <pre class="json-tree" id="jsonTree"></pre>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Attach event listeners
   */
  attachEvents() {
    const input = this.container.querySelector('#jsonInput');
    const beautifyBtn = this.container.querySelector('#jsonBeautify');
    const minifyBtn = this.container.querySelector('#jsonMinify');
    const copyBtn = this.container.querySelector('#jsonCopy');
    const clearBtn = this.container.querySelector('#jsonClear');
    const pasteBtn = this.container.querySelector('#jsonPaste');
    const sampleBtn = this.container.querySelector('#jsonSample');
    const treeToggle = this.container.querySelector('#jsonTreeToggle');
    
    // Input change with debounce
    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => this.processInput(), 300);
    });
    
    // Button actions
    beautifyBtn.addEventListener('click', () => this.beautify());
    minifyBtn.addEventListener('click', () => this.minify());
    copyBtn.addEventListener('click', () => this.copyOutput());
    clearBtn.addEventListener('click', () => this.clear());
    pasteBtn.addEventListener('click', () => this.pasteFromClipboard());
    sampleBtn.addEventListener('click', () => this.loadSample());
    
    // Tree view toggle
    treeToggle.addEventListener('click', () => {
      treeToggle.classList.toggle('active');
      this.processInput();
    });
  }
  
  /**
   * Process JSON input
   */
  processInput() {
    const input = this.container.querySelector('#jsonInput');
    const output = this.container.querySelector('#jsonTree');
    const status = this.container.querySelector('#jsonStatus');
    const treeToggle = this.container.querySelector('#jsonTreeToggle');
    
    const content = input.value.trim();
    
    if (!content) {
      output.innerHTML = '<span style="color: var(--text-tertiary)">Output will appear here...</span>';
      status.style.display = 'none';
      this.currentJson = null;
      return;
    }
    
    try {
      const parsed = JSON.parse(content);
      this.currentJson = parsed;
      
      // Show success status
      status.style.display = 'inline-flex';
      status.className = 'status-badge valid';
      status.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <path d="M22 4 12 14.01l-3-3"/>
        </svg>
        Valid JSON
      `;
      
      // Render output
      if (treeToggle.classList.contains('active')) {
        output.innerHTML = this.renderTree(parsed);
        this.attachTreeEvents();
      } else {
        output.innerHTML = `<pre>${this.syntaxHighlight(JSON.stringify(parsed, null, this.indent))}</pre>`;
      }
      
      // Save to history
      history.add('json', { input: content.substring(0, 200) });
      
    } catch (error) {
      this.currentJson = null;
      
      // Show error status
      status.style.display = 'inline-flex';
      status.className = 'status-badge invalid';
      status.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="m15 9-6 6M9 9l6 6"/>
        </svg>
        Invalid JSON
      `;
      
      // Try to show error location
      const errorMatch = error.message.match(/position (\d+)/);
      if (errorMatch) {
        const position = parseInt(errorMatch[1]);
        const lines = content.substring(0, position).split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length;
        output.innerHTML = `<span style="color: var(--accent-red)">Error at line ${line}, column ${column}:\n${error.message}</span>`;
      } else {
        output.innerHTML = `<span style="color: var(--accent-red)">${error.message}</span>`;
      }
    }
  }
  
  /**
   * Syntax highlight JSON string
   */
  syntaxHighlight(json) {
    // Escape HTML
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
  }
  
  /**
   * Render collapsible tree view
   */
  renderTree(obj, depth = 0) {
    const indent = '  '.repeat(depth);
    let html = '';
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return '<span class="bracket">[]</span>';
      }
      html += '<span class="bracket">[</span>\n';
      obj.forEach((item, index) => {
        html += `${indent}  ${this.renderTree(item, depth + 1)}`;
        if (index < obj.length - 1) html += ',';
        html += '\n';
      });
      html += `${indent}<span class="bracket">]</span>`;
    } else if (obj !== null && typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        return '<span class="bracket">{}</span>';
      }
      
      const id = `tree-${depth}-${Math.random().toString(36).substr(2, 9)}`;
      html += `<span class="collapsible" data-target="${id}"><span class="bracket">{</span></span>\n`;
      html += `<div class="json-content" id="${id}">`;
      keys.forEach((key, index) => {
        html += `${indent}  <span class="key">"${this.escapeHtml(key)}"</span>: ${this.renderTree(obj[key], depth + 1)}`;
        if (index < keys.length - 1) html += ',';
        html += '\n';
      });
      html += `</div>${indent}<span class="bracket">}</span>`;
    } else if (typeof obj === 'string') {
      html += `<span class="string">"${this.escapeHtml(obj)}"</span>`;
    } else if (typeof obj === 'number') {
      html += `<span class="number">${obj}</span>`;
    } else if (typeof obj === 'boolean') {
      html += `<span class="boolean">${obj}</span>`;
    } else if (obj === null) {
      html += '<span class="null">null</span>';
    }
    
    return html;
  }
  
  /**
   * Attach tree collapse/expand events
   */
  attachTreeEvents() {
    const collapsibles = this.container.querySelectorAll('.collapsible');
    collapsibles.forEach(el => {
      el.addEventListener('click', () => {
        el.classList.toggle('collapsed');
      });
    });
  }
  
  /**
   * Escape HTML characters
   */
  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  
  /**
   * Beautify JSON
   */
  beautify() {
    const input = this.container.querySelector('#jsonInput');
    if (this.currentJson !== null) {
      input.value = JSON.stringify(this.currentJson, null, this.indent);
      toast.success('JSON beautified');
    } else {
      toast.error('Please enter valid JSON first');
    }
  }
  
  /**
   * Minify JSON
   */
  minify() {
    const input = this.container.querySelector('#jsonInput');
    if (this.currentJson !== null) {
      input.value = JSON.stringify(this.currentJson);
      toast.success('JSON minified');
    } else {
      toast.error('Please enter valid JSON first');
    }
  }
  
  /**
   * Copy output to clipboard
   */
  async copyOutput() {
    if (this.currentJson !== null) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(this.currentJson, null, this.indent));
        toast.success('Copied to clipboard');
      } catch {
        toast.error('Failed to copy');
      }
    } else {
      toast.error('Nothing to copy');
    }
  }
  
  /**
   * Clear input and output
   */
  clear() {
    const input = this.container.querySelector('#jsonInput');
    const output = this.container.querySelector('#jsonTree');
    const status = this.container.querySelector('#jsonStatus');
    
    input.value = '';
    output.innerHTML = '<span style="color: var(--text-tertiary)">Output will appear here...</span>';
    status.style.display = 'none';
    this.currentJson = null;
  }
  
  /**
   * Paste from clipboard
   */
  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      const input = this.container.querySelector('#jsonInput');
      input.value = text;
      this.processInput();
    } catch {
      toast.error('Failed to read clipboard');
    }
  }
  
  /**
   * Load sample JSON
   */
  loadSample() {
    const sample = {
      "application": "DevToyNative",
      "version": "1.0.0",
      "features": [
        "JSON Formatter",
        "JWT Decoder",
        "Regex Tester",
        "Unix Time Converter",
        "Base64 Encoder/Decoder"
      ],
      "config": {
        "offline": true,
        "privacy": "100%",
        "performance": "WASM-powered"
      },
      "statistics": {
        "tools": 5,
        "dependencies": 0,
        "serverCalls": 0
      }
    };
    
    const input = this.container.querySelector('#jsonInput');
    input.value = JSON.stringify(sample, null, 2);
    this.processInput();
  }
  
  /**
   * Set input content (for smart paste)
   */
  setInput(content) {
    const input = this.container.querySelector('#jsonInput');
    input.value = content;
    this.processInput();
  }
  
  /**
   * Cleanup
   */
  destroy() {
    this.container.innerHTML = '';
  }
}

export default JsonFormatter;
