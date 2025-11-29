/**
 * DevToyNative - Smart Paste Detection Engine
 * Auto-detects content format and routes to appropriate tool
 */

// Format detection patterns
const DETECTION_PATTERNS = {
  jwt: {
    // JWT format: header.payload.signature (each part is base64url encoded)
    pattern: /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/,
    validate: (content) => {
      const parts = content.trim().split('.');
      if (parts.length !== 3) return false;
      
      try {
        // Try to decode header and payload
        const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        
        // Check for typical JWT claims
        return header.typ === 'JWT' || header.alg || payload.iat || payload.exp || payload.sub;
      } catch {
        return false;
      }
    },
    confidence: 0.95,
    tool: 'jwt'
  },
  
  json: {
    pattern: /^[\s]*[\[{]/,
    validate: (content) => {
      try {
        JSON.parse(content.trim());
        return true;
      } catch {
        return false;
      }
    },
    confidence: 0.9,
    tool: 'json'
  },
  
  base64: {
    // Standard base64 or URL-safe base64
    pattern: /^[A-Za-z0-9+/=_-]{20,}$/,
    validate: (content) => {
      const trimmed = content.trim();
      
      // Skip if it looks like JWT (has dots)
      if (trimmed.includes('.')) return false;
      
      // Check if it's valid base64
      try {
        const decoded = atob(trimmed.replace(/-/g, '+').replace(/_/g, '/'));
        // Check if decoded content is mostly printable
        const printableRatio = decoded.split('').filter(c => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127).length / decoded.length;
        return printableRatio > 0.7 || decoded.length < 50;
      } catch {
        return false;
      }
    },
    confidence: 0.7,
    tool: 'base64'
  },
  
  unixTimestamp: {
    // Unix timestamp (seconds or milliseconds)
    pattern: /^\d{10,13}$/,
    validate: (content) => {
      const num = parseInt(content.trim(), 10);
      const now = Date.now();
      
      // Check if it's a reasonable timestamp (within 50 years from now)
      if (content.length === 10) {
        // Seconds
        return num > 0 && num < (now / 1000) + 1577836800; // ~50 years
      } else if (content.length === 13) {
        // Milliseconds
        return num > 0 && num < now + 1577836800000;
      }
      return false;
    },
    confidence: 0.85,
    tool: 'timestamp'
  },
  
  regex: {
    // Regex pattern (starts with / and ends with /flags)
    pattern: /^\/.*\/[gimsuy]*$/,
    validate: (content) => {
      try {
        const match = content.trim().match(/^\/(.*)\/([gimsuy]*)$/);
        if (match) {
          new RegExp(match[1], match[2]);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    confidence: 0.9,
    tool: 'regex'
  }
};

// Detection order (more specific patterns first)
const DETECTION_ORDER = ['jwt', 'json', 'unixTimestamp', 'regex', 'base64'];

/**
 * Detect the format of pasted content
 * @param {string} content - The pasted content
 * @returns {Object|null} - Detection result with format, tool, and confidence
 */
export function detectFormat(content) {
  if (!content || typeof content !== 'string') {
    return null;
  }
  
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return null;
  }
  
  const results = [];
  
  for (const formatKey of DETECTION_ORDER) {
    const detection = DETECTION_PATTERNS[formatKey];
    
    // Quick pattern check
    if (detection.pattern.test(trimmed)) {
      // Validate more thoroughly
      if (detection.validate(trimmed)) {
        results.push({
          format: formatKey,
          tool: detection.tool,
          confidence: detection.confidence
        });
      }
    }
  }
  
  // Return highest confidence match
  if (results.length > 0) {
    results.sort((a, b) => b.confidence - a.confidence);
    return results[0];
  }
  
  return null;
}

/**
 * Get format display name
 * @param {string} format - The format key
 * @returns {string} - Human-readable format name
 */
export function getFormatDisplayName(format) {
  const names = {
    jwt: 'JWT Token',
    json: 'JSON',
    base64: 'Base64',
    unixTimestamp: 'Unix Timestamp',
    regex: 'Regular Expression'
  };
  return names[format] || format;
}

/**
 * Get tool display name
 * @param {string} tool - The tool key
 * @returns {string} - Human-readable tool name
 */
export function getToolDisplayName(tool) {
  const names = {
    jwt: 'JWT Decoder',
    json: 'JSON Formatter',
    base64: 'Base64 Encoder/Decoder',
    timestamp: 'Unix Time Converter',
    regex: 'Regex Tester'
  };
  return names[tool] || tool;
}

/**
 * SmartPaste class for handling paste events and auto-detection
 */
export class SmartPaste {
  constructor(options = {}) {
    this.onDetect = options.onDetect || (() => {});
    this.onError = options.onError || (() => {});
    this.enabled = true;
    
    // Bind global paste handler
    this.handleGlobalPaste = this.handleGlobalPaste.bind(this);
  }
  
  /**
   * Enable global paste detection
   */
  enable() {
    this.enabled = true;
    document.addEventListener('paste', this.handleGlobalPaste);
  }
  
  /**
   * Disable global paste detection
   */
  disable() {
    this.enabled = false;
    document.removeEventListener('paste', this.handleGlobalPaste);
  }
  
  /**
   * Handle global paste event
   * @param {ClipboardEvent} event 
   */
  handleGlobalPaste(event) {
    if (!this.enabled) return;
    
    // Don't intercept if user is typing in an input/textarea
    const target = event.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      // Only intercept if it's the smart paste input
      if (!target.classList.contains('paste-input') && !target.id?.includes('smart')) {
        return;
      }
    }
    
    const content = event.clipboardData?.getData('text');
    if (content) {
      this.processContent(content);
    }
  }
  
  /**
   * Process pasted content
   * @param {string} content - The pasted content
   */
  processContent(content) {
    try {
      const detection = detectFormat(content);
      
      if (detection) {
        this.onDetect({
          content,
          ...detection,
          displayName: getFormatDisplayName(detection.format),
          toolName: getToolDisplayName(detection.tool)
        });
      } else {
        // No format detected - could default to JSON formatter or show message
        this.onDetect({
          content,
          format: 'unknown',
          tool: 'json',
          confidence: 0,
          displayName: 'Unknown Format',
          toolName: 'JSON Formatter'
        });
      }
    } catch (error) {
      this.onError(error);
    }
  }
  
  /**
   * Manually detect format without processing
   * @param {string} content - Content to analyze
   * @returns {Object|null} - Detection result
   */
  analyze(content) {
    return detectFormat(content);
  }
}

export default SmartPaste;
