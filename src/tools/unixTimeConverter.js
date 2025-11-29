/**
 * DevToyNative - Unix Time Converter Tool
 * Features: Bidirectional conversion, multiple formats, timezone support
 */

import toast from '../utils/toast.js';
import { history } from '../utils/storage.js';

/**
 * Unix Time Converter Tool
 */
export class UnixTimeConverter {
  constructor(container) {
    this.container = container;
    this.render();
    this.attachEvents();
    this.setCurrentTime();
  }
  
  /**
   * Render the converter UI
   */
  render() {
    this.container.innerHTML = `
      <div class="panel-header">
        <div class="panel-actions">
          <button class="btn btn-primary" id="timestampNow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            Now
          </button>
          <button class="btn btn-secondary" id="timestampClear">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            Clear
          </button>
        </div>
        <div class="toggle-group">
          <span class="toggle-label">Live Update</span>
          <div class="toggle active" id="liveToggle"></div>
        </div>
      </div>
      
      <div class="converter-grid">
        <!-- Unix Timestamp Input -->
        <div class="converter-card">
          <div class="converter-card-header">
            <span class="converter-card-title">Unix Timestamp</span>
            <div class="format-selector">
              <button class="format-btn active" data-unit="s">Seconds</button>
              <button class="format-btn" data-unit="ms">Milliseconds</button>
              <button class="format-btn" data-unit="ns">Nanoseconds</button>
            </div>
          </div>
          <input 
            type="text" 
            class="input-field timestamp-input" 
            id="unixInput" 
            placeholder="Enter Unix timestamp..."
            autocomplete="off"
          />
          <div class="input-actions">
            <button class="code-editor-btn" id="copyUnix">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              Copy
            </button>
          </div>
        </div>
        
        <!-- Human Readable Input -->
        <div class="converter-card">
          <div class="converter-card-header">
            <span class="converter-card-title">Human Readable</span>
            <select class="timezone-select" id="timezoneSelect">
              <option value="local">Local Time</option>
              <option value="utc">UTC</option>
            </select>
          </div>
          <input 
            type="datetime-local" 
            class="input-field datetime-input" 
            id="datetimeInput"
            step="1"
          />
          <div class="input-actions">
            <button class="code-editor-btn" id="copyDatetime">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              Copy
            </button>
          </div>
        </div>
      </div>
      
      <!-- Output Cards -->
      <div class="timestamp-cards" id="outputCards">
        <!-- Cards will be rendered here -->
      </div>
      
      <!-- Common Timestamps -->
      <div class="common-timestamps" style="margin-top: 24px;">
        <h3 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 12px;">Quick Reference</h3>
        <div class="reference-grid">
          <div class="timestamp-card clickable" data-timestamp="0">
            <div class="timestamp-card-label">Unix Epoch</div>
            <div class="timestamp-card-value">0</div>
            <div class="timestamp-card-date">Jan 1, 1970 00:00:00</div>
          </div>
          <div class="timestamp-card clickable" data-timestamp="2147483647">
            <div class="timestamp-card-label">Y2K38 Problem</div>
            <div class="timestamp-card-value">2147483647</div>
            <div class="timestamp-card-date">Jan 19, 2038 03:14:07</div>
          </div>
          <div class="timestamp-card clickable" data-timestamp="1000000000">
            <div class="timestamp-card-label">1 Billion</div>
            <div class="timestamp-card-value">1000000000</div>
            <div class="timestamp-card-date">Sep 9, 2001</div>
          </div>
        </div>
      </div>
      
      <style>
        .converter-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        
        @media (max-width: 768px) {
          .converter-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .converter-card {
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 20px;
        }
        
        .converter-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .converter-card-title {
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .format-selector {
          display: flex;
          gap: 4px;
        }
        
        .format-btn {
          padding: 6px 12px;
          background: var(--bg-tertiary);
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text-tertiary);
          font-size: 0.75rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .format-btn:hover {
          background: var(--bg-glass-hover);
          color: var(--text-primary);
        }
        
        .format-btn.active {
          background: var(--accent-cyan);
          color: white;
        }
        
        .timezone-select {
          padding: 6px 12px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.8rem;
          cursor: pointer;
        }
        
        .timestamp-input,
        .datetime-input {
          font-family: var(--font-mono);
          font-size: 1.25rem !important;
          text-align: center;
          letter-spacing: 0.5px;
        }
        
        .input-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 12px;
        }
        
        .reference-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }
        
        .timestamp-card.clickable {
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .timestamp-card.clickable:hover {
          transform: translateY(-2px);
          border-color: var(--accent-cyan);
        }
        
        .timestamp-card-date {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-top: 4px;
        }
        
        .live-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--accent-green);
        }
        
        .live-indicator::before {
          content: '';
          width: 8px;
          height: 8px;
          background: var(--accent-green);
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }
      </style>
    `;
  }
  
  /**
   * Attach event listeners
   */
  attachEvents() {
    const unixInput = this.container.querySelector('#unixInput');
    const datetimeInput = this.container.querySelector('#datetimeInput');
    const nowBtn = this.container.querySelector('#timestampNow');
    const clearBtn = this.container.querySelector('#timestampClear');
    const liveToggle = this.container.querySelector('#liveToggle');
    const formatBtns = this.container.querySelectorAll('.format-btn');
    const copyUnixBtn = this.container.querySelector('#copyUnix');
    const copyDatetimeBtn = this.container.querySelector('#copyDatetime');
    const timezoneSelect = this.container.querySelector('#timezoneSelect');
    const clickableCards = this.container.querySelectorAll('.timestamp-card.clickable');
    
    // Unix input change
    unixInput.addEventListener('input', () => this.convertFromUnix());
    
    // Datetime input change
    datetimeInput.addEventListener('input', () => this.convertFromDatetime());
    
    // Now button
    nowBtn.addEventListener('click', () => this.setCurrentTime());
    
    // Clear button
    clearBtn.addEventListener('click', () => this.clear());
    
    // Live toggle
    liveToggle.addEventListener('click', () => {
      liveToggle.classList.toggle('active');
      if (liveToggle.classList.contains('active')) {
        this.startLiveUpdate();
      } else {
        this.stopLiveUpdate();
      }
    });
    
    // Format buttons
    formatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        formatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.convertFromUnix();
      });
    });
    
    // Timezone select
    timezoneSelect.addEventListener('change', () => this.convertFromUnix());
    
    // Copy buttons
    copyUnixBtn.addEventListener('click', () => this.copyValue('unix'));
    copyDatetimeBtn.addEventListener('click', () => this.copyValue('datetime'));
    
    // Clickable reference cards
    clickableCards.forEach(card => {
      card.addEventListener('click', () => {
        const timestamp = card.dataset.timestamp;
        unixInput.value = timestamp;
        this.convertFromUnix();
      });
    });
    
    // Start live update if enabled
    if (liveToggle.classList.contains('active')) {
      this.startLiveUpdate();
    }
  }
  
  /**
   * Get current unit
   */
  getCurrentUnit() {
    const activeBtn = this.container.querySelector('.format-btn.active');
    return activeBtn ? activeBtn.dataset.unit : 's';
  }
  
  /**
   * Convert Unix timestamp to other formats
   */
  convertFromUnix() {
    const unixInput = this.container.querySelector('#unixInput');
    const datetimeInput = this.container.querySelector('#datetimeInput');
    const outputCards = this.container.querySelector('#outputCards');
    const timezoneSelect = this.container.querySelector('#timezoneSelect');
    
    const value = unixInput.value.trim();
    if (!value) {
      outputCards.innerHTML = '';
      return;
    }
    
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      outputCards.innerHTML = '<div style="color: var(--accent-red);">Invalid timestamp</div>';
      return;
    }
    
    // Convert to milliseconds based on unit
    const unit = this.getCurrentUnit();
    let ms;
    switch (unit) {
      case 'ns':
        ms = Math.floor(num / 1000000);
        break;
      case 'ms':
        ms = num;
        break;
      default:
        ms = num * 1000;
    }
    
    const date = new Date(ms);
    
    if (isNaN(date.getTime())) {
      outputCards.innerHTML = '<div style="color: var(--accent-red);">Invalid timestamp</div>';
      return;
    }
    
    // Update datetime input
    if (timezoneSelect.value === 'utc') {
      datetimeInput.value = date.toISOString().slice(0, 19);
    } else {
      const offset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - offset);
      datetimeInput.value = localDate.toISOString().slice(0, 19);
    }
    
    // Render output cards
    this.renderOutputCards(date);
    
    // Save to history
    history.add('timestamp', { input: value });
  }
  
  /**
   * Convert datetime to Unix timestamp
   */
  convertFromDatetime() {
    const unixInput = this.container.querySelector('#unixInput');
    const datetimeInput = this.container.querySelector('#datetimeInput');
    const timezoneSelect = this.container.querySelector('#timezoneSelect');
    
    const value = datetimeInput.value;
    if (!value) return;
    
    let date;
    if (timezoneSelect.value === 'utc') {
      date = new Date(value + 'Z');
    } else {
      date = new Date(value);
    }
    
    if (isNaN(date.getTime())) return;
    
    const unit = this.getCurrentUnit();
    let timestamp;
    switch (unit) {
      case 'ns':
        timestamp = date.getTime() * 1000000;
        break;
      case 'ms':
        timestamp = date.getTime();
        break;
      default:
        timestamp = Math.floor(date.getTime() / 1000);
    }
    
    unixInput.value = timestamp;
    this.renderOutputCards(date);
  }
  
  /**
   * Render output cards with various formats
   */
  renderOutputCards(date) {
    const outputCards = this.container.querySelector('#outputCards');
    
    const formats = [
      {
        label: 'ISO 8601',
        value: date.toISOString()
      },
      {
        label: 'RFC 2822',
        value: date.toUTCString()
      },
      {
        label: 'Local Date',
        value: date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      },
      {
        label: 'Local Time',
        value: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      },
      {
        label: 'Unix (seconds)',
        value: Math.floor(date.getTime() / 1000).toString()
      },
      {
        label: 'Unix (milliseconds)',
        value: date.getTime().toString()
      },
      {
        label: 'Relative',
        value: this.getRelativeTime(date)
      },
      {
        label: 'Day of Year',
        value: this.getDayOfYear(date).toString()
      }
    ];
    
    outputCards.innerHTML = formats.map(f => `
      <div class="timestamp-card">
        <div class="timestamp-card-label">${f.label}</div>
        <div class="timestamp-card-value">${f.value}</div>
      </div>
    `).join('');
  }
  
  /**
   * Get relative time string
   */
  getRelativeTime(date) {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffSec = Math.abs(Math.floor(diffMs / 1000));
    
    const isPast = diffMs < 0;
    const prefix = isPast ? '' : 'in ';
    const suffix = isPast ? ' ago' : '';
    
    if (diffSec < 60) return `${prefix}${diffSec} seconds${suffix}`;
    if (diffSec < 3600) return `${prefix}${Math.floor(diffSec / 60)} minutes${suffix}`;
    if (diffSec < 86400) return `${prefix}${Math.floor(diffSec / 3600)} hours${suffix}`;
    if (diffSec < 2592000) return `${prefix}${Math.floor(diffSec / 86400)} days${suffix}`;
    if (diffSec < 31536000) return `${prefix}${Math.floor(diffSec / 2592000)} months${suffix}`;
    return `${prefix}${Math.floor(diffSec / 31536000)} years${suffix}`;
  }
  
  /**
   * Get day of year
   */
  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }
  
  /**
   * Set current time
   */
  setCurrentTime() {
    const unixInput = this.container.querySelector('#unixInput');
    const unit = this.getCurrentUnit();
    
    let timestamp;
    switch (unit) {
      case 'ns':
        timestamp = Date.now() * 1000000;
        break;
      case 'ms':
        timestamp = Date.now();
        break;
      default:
        timestamp = Math.floor(Date.now() / 1000);
    }
    
    unixInput.value = timestamp;
    this.convertFromUnix();
  }
  
  /**
   * Start live update
   */
  startLiveUpdate() {
    this.liveInterval = setInterval(() => {
      const unixInput = this.container.querySelector('#unixInput');
      // Only update if the field is focused on "now"
      if (document.activeElement !== unixInput) {
        this.setCurrentTime();
      }
    }, 1000);
  }
  
  /**
   * Stop live update
   */
  stopLiveUpdate() {
    if (this.liveInterval) {
      clearInterval(this.liveInterval);
      this.liveInterval = null;
    }
  }
  
  /**
   * Copy value to clipboard
   */
  async copyValue(type) {
    const value = type === 'unix' 
      ? this.container.querySelector('#unixInput').value
      : this.container.querySelector('#datetimeInput').value;
    
    if (!value) {
      toast.error('Nothing to copy');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  }
  
  /**
   * Clear inputs
   */
  clear() {
    this.container.querySelector('#unixInput').value = '';
    this.container.querySelector('#datetimeInput').value = '';
    this.container.querySelector('#outputCards').innerHTML = '';
  }
  
  /**
   * Set input content (for smart paste)
   */
  setInput(content) {
    const unixInput = this.container.querySelector('#unixInput');
    unixInput.value = content.trim();
    this.convertFromUnix();
  }
  
  /**
   * Cleanup
   */
  destroy() {
    this.stopLiveUpdate();
    this.container.innerHTML = '';
  }
}

export default UnixTimeConverter;
