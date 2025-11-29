/**
 * DevToyNative - Storage Utilities
 * LocalStorage/IndexedDB wrapper for user preferences
 */

const STORAGE_PREFIX = 'devtoy_';

/**
 * Storage wrapper for user preferences
 */
export const storage = {
  /**
   * Get a value from storage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} - Stored value or default
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  },
  
  /**
   * Set a value in storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   */
  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  },
  
  /**
   * Remove a value from storage
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },
  
  /**
   * Clear all DevToy storage
   */
  clear() {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Storage error:', error);
    }
  }
};

/**
 * User preferences management
 */
export const preferences = {
  defaults: {
    theme: 'dark',
    lastTool: 'json',
    sidebarCollapsed: false,
    jsonIndent: 2,
    regexFlags: 'g',
    timestampFormat: 'local',
    base64UrlSafe: false
  },
  
  /**
   * Get all preferences
   * @returns {Object} - User preferences
   */
  getAll() {
    return {
      ...this.defaults,
      ...storage.get('preferences', {})
    };
  },
  
  /**
   * Get a single preference
   * @param {string} key - Preference key
   * @returns {*} - Preference value
   */
  get(key) {
    const prefs = this.getAll();
    return prefs[key];
  },
  
  /**
   * Set a preference
   * @param {string} key - Preference key
   * @param {*} value - Preference value
   */
  set(key, value) {
    const prefs = this.getAll();
    prefs[key] = value;
    storage.set('preferences', prefs);
  },
  
  /**
   * Reset all preferences to defaults
   */
  reset() {
    storage.set('preferences', this.defaults);
  }
};

/**
 * History management for tools
 */
export const history = {
  maxItems: 50,
  
  /**
   * Get history for a tool
   * @param {string} tool - Tool identifier
   * @returns {Array} - History items
   */
  get(tool) {
    return storage.get(`history_${tool}`, []);
  },
  
  /**
   * Add item to history
   * @param {string} tool - Tool identifier
   * @param {Object} item - History item
   */
  add(tool, item) {
    const items = this.get(tool);
    
    // Remove duplicates
    const filtered = items.filter(i => i.input !== item.input);
    
    // Add new item at the beginning
    filtered.unshift({
      ...item,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (filtered.length > this.maxItems) {
      filtered.length = this.maxItems;
    }
    
    storage.set(`history_${tool}`, filtered);
  },
  
  /**
   * Clear history for a tool
   * @param {string} tool - Tool identifier
   */
  clear(tool) {
    storage.remove(`history_${tool}`);
  },
  
  /**
   * Clear all history
   */
  clearAll() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX + 'history_'))
      .forEach(key => localStorage.removeItem(key));
  }
};

export default { storage, preferences, history };
