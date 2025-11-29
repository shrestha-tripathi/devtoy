/**
 * DevToyNative - JWT Decoder Tool
 * Features: Decode header/payload, verify signature, show expiration
 */

import toast from '../utils/toast.js';
import { history } from '../utils/storage.js';

/**
 * JWT Decoder Tool
 */
export class JwtDecoder {
  constructor(container) {
    this.container = container;
    this.currentToken = null;
    this.render();
    this.attachEvents();
  }
  
  /**
   * Render the JWT decoder UI
   */
  render() {
    this.container.innerHTML = `
      <div class="input-group">
        <label class="input-label">JWT Token</label>
        <textarea 
          class="input-field" 
          id="jwtInput" 
          placeholder="Paste your JWT token here...&#10;&#10;Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          rows="4"
          spellcheck="false"
        ></textarea>
      </div>
      
      <div class="panel-header" style="margin-top: 16px;">
        <div id="jwtStatusContainer"></div>
        <div class="panel-actions">
          <button class="btn btn-secondary" id="jwtCopy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
            Copy Decoded
          </button>
          <button class="btn btn-secondary" id="jwtClear">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            Clear
          </button>
          <button class="btn btn-secondary" id="jwtSample">
            Sample JWT
          </button>
        </div>
      </div>
      
      <div class="jwt-sections" id="jwtSections">
        <div class="jwt-placeholder" style="text-align: center; padding: 40px; color: var(--text-tertiary);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5;">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <p>Paste a JWT token above to decode it</p>
        </div>
      </div>
      
      <div class="input-group" style="margin-top: 24px; display: none;" id="signatureSection">
        <label class="input-label">Secret Key (optional - for signature verification)</label>
        <input 
          type="text" 
          class="input-field" 
          id="jwtSecret" 
          placeholder="Enter secret key to verify signature..."
        />
        <button class="btn btn-primary" style="margin-top: 12px;" id="jwtVerify">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Verify Signature
        </button>
        <div id="signatureResult" style="margin-top: 12px;"></div>
      </div>
    `;
  }
  
  /**
   * Attach event listeners
   */
  attachEvents() {
    const input = this.container.querySelector('#jwtInput');
    const copyBtn = this.container.querySelector('#jwtCopy');
    const clearBtn = this.container.querySelector('#jwtClear');
    const sampleBtn = this.container.querySelector('#jwtSample');
    const verifyBtn = this.container.querySelector('#jwtVerify');
    
    // Input change with debounce
    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => this.processInput(), 200);
    });
    
    // Button actions
    copyBtn.addEventListener('click', () => this.copyDecoded());
    clearBtn.addEventListener('click', () => this.clear());
    sampleBtn.addEventListener('click', () => this.loadSample());
    verifyBtn.addEventListener('click', () => this.verifySignature());
  }
  
  /**
   * Process JWT input
   */
  processInput() {
    const input = this.container.querySelector('#jwtInput');
    const sections = this.container.querySelector('#jwtSections');
    const statusContainer = this.container.querySelector('#jwtStatusContainer');
    const signatureSection = this.container.querySelector('#signatureSection');
    
    const token = input.value.trim();
    
    if (!token) {
      sections.innerHTML = `
        <div class="jwt-placeholder" style="text-align: center; padding: 40px; color: var(--text-tertiary);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5;">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <p>Paste a JWT token above to decode it</p>
        </div>
      `;
      statusContainer.innerHTML = '';
      signatureSection.style.display = 'none';
      this.currentToken = null;
      return;
    }
    
    try {
      const decoded = this.decodeJwt(token);
      this.currentToken = { token, ...decoded };
      
      // Render status
      const expStatus = this.getExpirationStatus(decoded.payload);
      statusContainer.innerHTML = `
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span class="status-badge valid">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <path d="M22 4 12 14.01l-3-3"/>
            </svg>
            Valid Structure
          </span>
          ${expStatus}
        </div>
      `;
      
      // Render sections
      sections.innerHTML = `
        <div class="jwt-section">
          <div class="jwt-section-header">
            <span class="jwt-section-dot header"></span>
            <span class="jwt-section-title">Header</span>
            <span style="margin-left: auto; color: var(--text-tertiary); font-size: 0.75rem; font-family: var(--font-mono);">
              Algorithm: ${decoded.header.alg || 'N/A'}
            </span>
          </div>
          <div class="code-editor">
            <div class="code-content">
              <pre>${this.syntaxHighlight(JSON.stringify(decoded.header, null, 2))}</pre>
            </div>
          </div>
        </div>
        
        <div class="jwt-section">
          <div class="jwt-section-header">
            <span class="jwt-section-dot payload"></span>
            <span class="jwt-section-title">Payload</span>
            ${decoded.payload.sub ? `<span style="margin-left: auto; color: var(--text-tertiary); font-size: 0.75rem;">Subject: ${decoded.payload.sub}</span>` : ''}
          </div>
          <div class="code-editor">
            <div class="code-content">
              <pre>${this.syntaxHighlight(JSON.stringify(decoded.payload, null, 2))}</pre>
            </div>
          </div>
          ${this.renderClaims(decoded.payload)}
        </div>
        
        <div class="jwt-section">
          <div class="jwt-section-header">
            <span class="jwt-section-dot signature"></span>
            <span class="jwt-section-title">Signature</span>
          </div>
          <div class="code-editor">
            <div class="code-content" style="word-break: break-all; color: var(--text-tertiary); font-size: 0.8rem;">
              ${decoded.signature || 'No signature'}
            </div>
          </div>
        </div>
      `;
      
      signatureSection.style.display = 'block';
      
      // Save to history
      history.add('jwt', { input: token.substring(0, 50) + '...' });
      
    } catch (error) {
      this.currentToken = null;
      statusContainer.innerHTML = `
        <span class="status-badge invalid">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="m15 9-6 6M9 9l6 6"/>
          </svg>
          Invalid JWT
        </span>
      `;
      
      sections.innerHTML = `
        <div style="padding: 20px; color: var(--accent-red);">
          ${error.message}
        </div>
      `;
      signatureSection.style.display = 'none';
    }
  }
  
  /**
   * Decode JWT token
   */
  decodeJwt(token) {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format: Expected 3 parts separated by dots');
    }
    
    try {
      const header = JSON.parse(this.base64UrlDecode(parts[0]));
      const payload = JSON.parse(this.base64UrlDecode(parts[1]));
      const signature = parts[2];
      
      return { header, payload, signature };
    } catch (e) {
      throw new Error('Failed to decode JWT: ' + e.message);
    }
  }
  
  /**
   * Base64URL decode
   */
  base64UrlDecode(str) {
    // Add padding if needed
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }
    
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }
  
  /**
   * Get expiration status badge
   */
  getExpirationStatus(payload) {
    if (!payload.exp) {
      return '<span class="status-badge info" style="background: var(--bg-tertiary); color: var(--text-secondary); border-color: var(--border-color);">No Expiration</span>';
    }
    
    const now = Math.floor(Date.now() / 1000);
    const exp = payload.exp;
    
    if (exp < now) {
      const expiredAgo = this.formatDuration(now - exp);
      return `<span class="status-badge expired">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        Expired ${expiredAgo} ago
      </span>`;
    } else {
      const expiresIn = this.formatDuration(exp - now);
      return `<span class="status-badge valid">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        Expires in ${expiresIn}
      </span>`;
    }
  }
  
  /**
   * Format duration in human readable form
   */
  formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  }
  
  /**
   * Render common JWT claims
   */
  renderClaims(payload) {
    const claims = [];
    
    if (payload.iat) {
      claims.push({
        label: 'Issued At',
        value: new Date(payload.iat * 1000).toLocaleString()
      });
    }
    
    if (payload.exp) {
      claims.push({
        label: 'Expires',
        value: new Date(payload.exp * 1000).toLocaleString()
      });
    }
    
    if (payload.nbf) {
      claims.push({
        label: 'Not Before',
        value: new Date(payload.nbf * 1000).toLocaleString()
      });
    }
    
    if (payload.iss) {
      claims.push({
        label: 'Issuer',
        value: payload.iss
      });
    }
    
    if (payload.aud) {
      claims.push({
        label: 'Audience',
        value: Array.isArray(payload.aud) ? payload.aud.join(', ') : payload.aud
      });
    }
    
    if (claims.length === 0) return '';
    
    return `
      <div class="timestamp-cards" style="margin-top: 16px;">
        ${claims.map(c => `
          <div class="timestamp-card">
            <div class="timestamp-card-label">${c.label}</div>
            <div class="timestamp-card-value">${c.value}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  /**
   * Syntax highlight JSON
   */
  syntaxHighlight(json) {
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
   * Verify JWT signature (basic HMAC verification)
   */
  async verifySignature() {
    const secret = this.container.querySelector('#jwtSecret').value;
    const result = this.container.querySelector('#signatureResult');
    
    if (!this.currentToken) {
      toast.error('No JWT token to verify');
      return;
    }
    
    if (!secret) {
      toast.error('Please enter a secret key');
      return;
    }
    
    try {
      const { token, header } = this.currentToken;
      const [headerB64, payloadB64, signature] = token.split('.');
      
      // Only support HMAC algorithms for now
      if (!header.alg || !header.alg.startsWith('HS')) {
        result.innerHTML = `
          <span class="status-badge" style="background: var(--bg-tertiary); color: var(--text-secondary); border-color: var(--border-color);">
            Only HMAC (HS256/HS384/HS512) verification supported
          </span>
        `;
        return;
      }
      
      const algMap = {
        'HS256': 'SHA-256',
        'HS384': 'SHA-384',
        'HS512': 'SHA-512'
      };
      
      const algorithm = algMap[header.alg];
      if (!algorithm) {
        result.innerHTML = `
          <span class="status-badge invalid">Unsupported algorithm: ${header.alg}</span>
        `;
        return;
      }
      
      // Create signature
      const encoder = new TextEncoder();
      const data = encoder.encode(`${headerB64}.${payloadB64}`);
      const keyData = encoder.encode(secret);
      
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: algorithm },
        false,
        ['sign']
      );
      
      const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
      const expectedSignature = this.base64UrlEncode(new Uint8Array(signatureBuffer));
      
      if (expectedSignature === signature) {
        result.innerHTML = `
          <span class="status-badge valid">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <path d="M22 4 12 14.01l-3-3"/>
            </svg>
            Signature Valid
          </span>
        `;
        toast.success('Signature verification successful');
      } else {
        result.innerHTML = `
          <span class="status-badge invalid">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="m15 9-6 6M9 9l6 6"/>
            </svg>
            Signature Invalid
          </span>
        `;
        toast.error('Signature verification failed');
      }
      
    } catch (error) {
      result.innerHTML = `
        <span class="status-badge invalid">Verification error: ${error.message}</span>
      `;
    }
  }
  
  /**
   * Base64URL encode
   */
  base64UrlEncode(buffer) {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  
  /**
   * Copy decoded JWT
   */
  async copyDecoded() {
    if (!this.currentToken) {
      toast.error('No decoded JWT to copy');
      return;
    }
    
    try {
      const decoded = {
        header: this.currentToken.header,
        payload: this.currentToken.payload
      };
      await navigator.clipboard.writeText(JSON.stringify(decoded, null, 2));
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  }
  
  /**
   * Clear input
   */
  clear() {
    const input = this.container.querySelector('#jwtInput');
    const secret = this.container.querySelector('#jwtSecret');
    
    input.value = '';
    secret.value = '';
    this.currentToken = null;
    this.processInput();
  }
  
  /**
   * Load sample JWT
   */
  loadSample() {
    // This is a sample JWT with HS256 algorithm
    // Secret: "devtoy-secret-key"
    // Payload has exp in the future
    const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    
    // Generate a sample JWT (in real use, this would be signed properly)
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: '1234567890',
      name: 'DevToy User',
      email: 'user@devtoy.app',
      role: 'developer',
      iat: Math.floor(Date.now() / 1000),
      exp: futureExp,
      iss: 'devtoy-native',
      aud: 'devtoy-users'
    };
    
    const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    // Sample signature (not actually valid, just for demo)
    const sampleToken = `${headerB64}.${payloadB64}.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;
    
    const input = this.container.querySelector('#jwtInput');
    input.value = sampleToken;
    this.processInput();
  }
  
  /**
   * Set input content (for smart paste)
   */
  setInput(content) {
    const input = this.container.querySelector('#jwtInput');
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

export default JwtDecoder;
