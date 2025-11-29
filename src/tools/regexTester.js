/**
 * DevToyNative - Regex Tester Tool
 * Features: Pattern testing, match highlighting, group extraction
 * 
 * Note: This tool includes architecture for WASM-based regex engine.
 * For MVP, we use native JS RegExp with PCRE-like behavior simulation.
 * The WASM wrapper is designed to integrate with rust-based regex engines.
 */

import toast from '../utils/toast.js';
import { history, preferences } from '../utils/storage.js';

/**
 * WASM Regex Engine Wrapper
 * This class provides an abstraction layer for regex operations.
 * It's designed to be swapped with a WASM-based engine when available.
 */
class RegexEngine {
  constructor() {
    this.wasmLoaded = false;
    this.wasmEngine = null;
    
    // Try to load WASM engine
    this.initWasm();
  }
  
  async initWasm() {
    try {
      // In production, this would load a Rust regex crate compiled to WASM
      // For example: @aspect-build/aspect-regex-wasm or similar
      // const wasm = await import('../../wasm/regex_engine.wasm');
      // this.wasmEngine = await wasm.default();
      // this.wasmLoaded = true;
      
      // For now, we'll use a flag to indicate WASM is "available"
      // The architecture supports hot-swapping to WASM when available
      this.wasmLoaded = false;
    } catch (error) {
      console.log('WASM regex engine not available, using native JS');
      this.wasmLoaded = false;
    }
  }
  
  /**
   * Execute regex and return matches
   * @param {string} pattern - Regex pattern
   * @param {string} flags - Regex flags
   * @param {string} text - Text to search
   * @returns {Object} - Match results
   */
  execute(pattern, flags, text) {
    if (this.wasmLoaded && this.wasmEngine) {
      return this.executeWasm(pattern, flags, text);
    }
    return this.executeNative(pattern, flags, text);
  }
  
  /**
   * Execute using native JS RegExp
   */
  executeNative(pattern, flags, text) {
    const startTime = performance.now();
    const results = {
      matches: [],
      groups: [],
      totalMatches: 0,
      executionTime: 0,
      engine: 'JavaScript RegExp'
    };
    
    try {
      const regex = new RegExp(pattern, flags);
      
      if (flags.includes('g')) {
        let match;
        while ((match = regex.exec(text)) !== null) {
          results.matches.push({
            match: match[0],
            index: match.index,
            length: match[0].length,
            groups: match.slice(1)
          });
          results.totalMatches++;
          
          // Prevent infinite loops with zero-width matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        const match = regex.exec(text);
        if (match) {
          results.matches.push({
            match: match[0],
            index: match.index,
            length: match[0].length,
            groups: match.slice(1)
          });
          results.totalMatches = 1;
        }
      }
      
      // Extract named groups if present
      if (results.matches.length > 0 && results.matches[0].groups) {
        const namedGroups = pattern.match(/\?<([^>]+)>/g);
        if (namedGroups) {
          results.namedGroups = namedGroups.map(g => g.slice(2, -1));
        }
      }
      
    } catch (error) {
      throw error;
    }
    
    results.executionTime = (performance.now() - startTime).toFixed(2);
    return results;
  }
  
  /**
   * Execute using WASM engine (placeholder)
   */
  executeWasm(pattern, flags, text) {
    // This would call the WASM module when available
    // return this.wasmEngine.execute(pattern, flags, text);
    return this.executeNative(pattern, flags, text);
  }
  
  /**
   * Validate regex pattern
   */
  validate(pattern, flags) {
    try {
      new RegExp(pattern, flags);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

/**
 * Regex Tester Tool
 */
export class RegexTester {
  constructor(container) {
    this.container = container;
    this.engine = new RegexEngine();
    this.currentPattern = '';
    this.currentFlags = preferences.get('regexFlags') || 'g';
    this.render();
    this.attachEvents();
  }
  
  /**
   * Render the regex tester UI
   */
  render() {
    const flags = this.currentFlags;
    
    this.container.innerHTML = `
      <div class="panel-header">
        <div class="panel-actions">
          <div class="regex-flags">
            <label class="flag-toggle ${flags.includes('g') ? 'active' : ''}" title="Global">
              <input type="checkbox" value="g" ${flags.includes('g') ? 'checked' : ''}>
              <span>g</span>
            </label>
            <label class="flag-toggle ${flags.includes('i') ? 'active' : ''}" title="Case Insensitive">
              <input type="checkbox" value="i" ${flags.includes('i') ? 'checked' : ''}>
              <span>i</span>
            </label>
            <label class="flag-toggle ${flags.includes('m') ? 'active' : ''}" title="Multiline">
              <input type="checkbox" value="m" ${flags.includes('m') ? 'checked' : ''}>
              <span>m</span>
            </label>
            <label class="flag-toggle ${flags.includes('s') ? 'active' : ''}" title="Dot All">
              <input type="checkbox" value="s" ${flags.includes('s') ? 'checked' : ''}>
              <span>s</span>
            </label>
            <label class="flag-toggle ${flags.includes('u') ? 'active' : ''}" title="Unicode">
              <input type="checkbox" value="u" ${flags.includes('u') ? 'checked' : ''}>
              <span>u</span>
            </label>
          </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span class="engine-badge" id="engineBadge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span id="engineName">JS RegExp</span>
          </span>
          <button class="btn btn-secondary" id="regexClear">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            Clear
          </button>
        </div>
      </div>
      
      <div class="input-group">
        <label class="input-label">Regular Expression</label>
        <div class="regex-input-wrapper">
          <span class="regex-delimiter">/</span>
          <input 
            type="text" 
            class="input-field regex-pattern-input" 
            id="regexPattern" 
            placeholder="Enter your regex pattern..."
            spellcheck="false"
            autocomplete="off"
          />
          <span class="regex-delimiter">/<span id="flagsDisplay">${flags}</span></span>
        </div>
        <div id="patternError" class="pattern-error" style="display: none;"></div>
      </div>
      
      <div class="input-group">
        <label class="input-label">Test String</label>
        <textarea 
          class="input-field" 
          id="regexText" 
          placeholder="Enter text to test against the regex pattern..."
          rows="6"
          spellcheck="false"
        ></textarea>
      </div>
      
      <div class="regex-results" id="regexResults">
        <div class="results-placeholder" style="text-align: center; padding: 30px; color: var(--text-tertiary);">
          <p>Enter a pattern and test string to see matches</p>
        </div>
      </div>
      
      <div class="regex-reference" style="margin-top: 24px;">
        <details>
          <summary style="cursor: pointer; color: var(--text-secondary); font-size: 0.875rem;">
            Quick Reference
          </summary>
          <div class="reference-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-top: 16px;">
            <div class="reference-card">
              <h4>Character Classes</h4>
              <code>.</code> Any character<br>
              <code>\\d</code> Digit [0-9]<br>
              <code>\\w</code> Word [A-Za-z0-9_]<br>
              <code>\\s</code> Whitespace
            </div>
            <div class="reference-card">
              <h4>Anchors</h4>
              <code>^</code> Start of string<br>
              <code>$</code> End of string<br>
              <code>\\b</code> Word boundary
            </div>
            <div class="reference-card">
              <h4>Quantifiers</h4>
              <code>*</code> 0 or more<br>
              <code>+</code> 1 or more<br>
              <code>?</code> 0 or 1<br>
              <code>{n,m}</code> n to m times
            </div>
            <div class="reference-card">
              <h4>Groups</h4>
              <code>(abc)</code> Capture group<br>
              <code>(?:abc)</code> Non-capture<br>
              <code>(?&lt;name&gt;)</code> Named group<br>
              <code>|</code> Alternation
            </div>
          </div>
        </details>
      </div>
      
      <style>
        .regex-input-wrapper {
          display: flex;
          align-items: center;
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        
        .regex-delimiter {
          padding: 12px;
          color: var(--accent-cyan);
          font-family: var(--font-mono);
          font-size: 1.1rem;
          background: var(--bg-secondary);
        }
        
        .regex-pattern-input {
          border: none !important;
          border-radius: 0 !important;
          flex: 1;
        }
        
        .regex-pattern-input:focus {
          box-shadow: none !important;
        }
        
        .regex-flags {
          display: flex;
          gap: 4px;
        }
        
        .flag-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--text-tertiary);
        }
        
        .flag-toggle input {
          display: none;
        }
        
        .flag-toggle:hover {
          background: var(--bg-glass-hover);
          color: var(--text-primary);
        }
        
        .flag-toggle.active {
          background: var(--accent-cyan);
          color: white;
        }
        
        .engine-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }
        
        .pattern-error {
          margin-top: 8px;
          padding: 8px 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-sm);
          color: var(--accent-red);
          font-size: 0.8rem;
        }
        
        .regex-results {
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        
        .results-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }
        
        .results-body {
          padding: 16px;
        }
        
        .highlighted-text {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          line-height: 1.8;
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .match-highlight {
          background: rgba(6, 182, 212, 0.3);
          border-bottom: 2px solid var(--accent-cyan);
          padding: 2px 0;
        }
        
        .match-list {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }
        
        .match-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 8px 0;
        }
        
        .match-index {
          min-width: 50px;
          padding: 4px 8px;
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          color: var(--text-tertiary);
          text-align: center;
        }
        
        .match-content {
          flex: 1;
        }
        
        .match-value {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          color: var(--accent-cyan);
        }
        
        .match-groups {
          margin-top: 4px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        
        .reference-card {
          padding: 16px;
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.8;
        }
        
        .reference-card h4 {
          margin-bottom: 8px;
          color: var(--text-primary);
          font-size: 0.875rem;
        }
        
        .reference-card code {
          background: var(--bg-tertiary);
          padding: 2px 6px;
          border-radius: 3px;
          font-family: var(--font-mono);
          color: var(--accent-purple);
        }
      </style>
    `;
  }
  
  /**
   * Attach event listeners
   */
  attachEvents() {
    const patternInput = this.container.querySelector('#regexPattern');
    const textInput = this.container.querySelector('#regexText');
    const clearBtn = this.container.querySelector('#regexClear');
    const flagToggles = this.container.querySelectorAll('.flag-toggle');
    
    // Input change with debounce
    let debounceTimer;
    const handleInput = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => this.processRegex(), 150);
    };
    
    patternInput.addEventListener('input', handleInput);
    textInput.addEventListener('input', handleInput);
    
    // Flag toggles
    flagToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        const checkbox = toggle.querySelector('input');
        checkbox.checked = !checkbox.checked;
        this.updateFlags();
        this.processRegex();
      });
    });
    
    // Clear button
    clearBtn.addEventListener('click', () => this.clear());
    
    // Update engine badge
    this.updateEngineBadge();
  }
  
  /**
   * Update flags from checkboxes
   */
  updateFlags() {
    const checkboxes = this.container.querySelectorAll('.flag-toggle input:checked');
    const flagsDisplay = this.container.querySelector('#flagsDisplay');
    
    this.currentFlags = Array.from(checkboxes).map(cb => cb.value).join('');
    flagsDisplay.textContent = this.currentFlags || '';
    
    // Save preference
    preferences.set('regexFlags', this.currentFlags);
  }
  
  /**
   * Update engine badge
   */
  updateEngineBadge() {
    const badge = this.container.querySelector('#engineName');
    if (this.engine.wasmLoaded) {
      badge.textContent = 'WASM Engine';
      badge.parentElement.style.color = 'var(--accent-green)';
    } else {
      badge.textContent = 'JS RegExp';
    }
  }
  
  /**
   * Process regex and show results
   */
  processRegex() {
    const pattern = this.container.querySelector('#regexPattern').value;
    const text = this.container.querySelector('#regexText').value;
    const results = this.container.querySelector('#regexResults');
    const errorDiv = this.container.querySelector('#patternError');
    
    // Clear error
    errorDiv.style.display = 'none';
    
    if (!pattern || !text) {
      results.innerHTML = `
        <div class="results-placeholder" style="text-align: center; padding: 30px; color: var(--text-tertiary);">
          <p>Enter a pattern and test string to see matches</p>
        </div>
      `;
      return;
    }
    
    // Validate pattern
    const validation = this.engine.validate(pattern, this.currentFlags);
    if (!validation.valid) {
      errorDiv.textContent = validation.error;
      errorDiv.style.display = 'block';
      results.innerHTML = `
        <div class="results-placeholder" style="text-align: center; padding: 30px; color: var(--accent-red);">
          <p>Invalid regex pattern</p>
        </div>
      `;
      return;
    }
    
    try {
      const result = this.engine.execute(pattern, this.currentFlags, text);
      this.renderResults(result, text);
      
      // Save to history
      if (result.totalMatches > 0) {
        history.add('regex', { input: pattern });
      }
      
    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.style.display = 'block';
    }
  }
  
  /**
   * Render match results
   */
  renderResults(result, text) {
    const results = this.container.querySelector('#regexResults');
    
    if (result.totalMatches === 0) {
      results.innerHTML = `
        <div class="results-header">
          <span style="color: var(--text-secondary);">No matches found</span>
          <span style="color: var(--text-tertiary); font-size: 0.8rem;">${result.executionTime}ms</span>
        </div>
        <div class="results-body">
          <div class="highlighted-text">${this.escapeHtml(text)}</div>
        </div>
      `;
      return;
    }
    
    // Build highlighted text
    const highlightedText = this.buildHighlightedText(text, result.matches);
    
    // Build match list
    const matchList = result.matches.map((match, idx) => `
      <div class="match-item">
        <span class="match-index">Match ${idx + 1}</span>
        <div class="match-content">
          <div class="match-value">"${this.escapeHtml(match.match)}"</div>
          <div class="match-groups">
            Index: ${match.index}, Length: ${match.length}
            ${match.groups.length > 0 ? `<br>Groups: ${match.groups.map((g, i) => `$${i + 1}="${g || ''}"`).join(', ')}` : ''}
          </div>
        </div>
      </div>
    `).join('');
    
    results.innerHTML = `
      <div class="results-header">
        <span style="color: var(--accent-cyan); font-weight: 500;">
          ${result.totalMatches} match${result.totalMatches > 1 ? 'es' : ''} found
        </span>
        <span style="color: var(--text-tertiary); font-size: 0.8rem;">${result.executionTime}ms</span>
      </div>
      <div class="results-body">
        <div class="highlighted-text">${highlightedText}</div>
        <div class="match-list">
          ${matchList}
        </div>
      </div>
    `;
  }
  
  /**
   * Build highlighted text with matches
   */
  buildHighlightedText(text, matches) {
    if (matches.length === 0) {
      return this.escapeHtml(text);
    }
    
    // Sort matches by index
    const sorted = [...matches].sort((a, b) => a.index - b.index);
    
    let result = '';
    let lastIndex = 0;
    
    for (const match of sorted) {
      // Add text before match
      result += this.escapeHtml(text.substring(lastIndex, match.index));
      // Add highlighted match
      result += `<span class="match-highlight">${this.escapeHtml(match.match)}</span>`;
      lastIndex = match.index + match.length;
    }
    
    // Add remaining text
    result += this.escapeHtml(text.substring(lastIndex));
    
    return result;
  }
  
  /**
   * Escape HTML characters
   */
  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>');
  }
  
  /**
   * Clear inputs
   */
  clear() {
    const patternInput = this.container.querySelector('#regexPattern');
    const textInput = this.container.querySelector('#regexText');
    
    patternInput.value = '';
    textInput.value = '';
    this.processRegex();
  }
  
  /**
   * Set input content (for smart paste)
   */
  setInput(content) {
    // If it looks like a regex pattern, put it in pattern field
    if (content.startsWith('/') && content.match(/\/[gimsuy]*$/)) {
      const match = content.match(/^\/(.*)\/([gimsuy]*)$/);
      if (match) {
        const patternInput = this.container.querySelector('#regexPattern');
        patternInput.value = match[1];
        
        // Update flags
        if (match[2]) {
          this.currentFlags = match[2];
          const flagsDisplay = this.container.querySelector('#flagsDisplay');
          flagsDisplay.textContent = this.currentFlags;
          
          // Update toggle buttons
          const toggles = this.container.querySelectorAll('.flag-toggle');
          toggles.forEach(toggle => {
            const checkbox = toggle.querySelector('input');
            const isActive = this.currentFlags.includes(checkbox.value);
            toggle.classList.toggle('active', isActive);
            checkbox.checked = isActive;
          });
        }
      }
    } else {
      // Otherwise put it in text field
      const textInput = this.container.querySelector('#regexText');
      textInput.value = content;
    }
    
    this.processRegex();
  }
  
  /**
   * Cleanup
   */
  destroy() {
    this.container.innerHTML = '';
  }
}

export default RegexTester;
