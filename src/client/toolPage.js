/**
 * Entry for per-tool landing pages. Mounts ONE existing tool module into its
 * panel (no logic rewritten) and wires the shared chrome (theme, sidebar).
 */
import { preferences } from '../utils/storage.js';
import { registerWebMcpTools } from '../lib/webmcp.js';
import JsonFormatter from '../tools/jsonFormatter.js';
import JwtDecoder from '../tools/jwtDecoder.js';
import RegexTester from '../tools/regexTester.js';
import UnixTimeConverter from '../tools/unixTimeConverter.js';
import Base64Tool from '../tools/base64Tool.js';

const classes = {
  json: JsonFormatter,
  jwt: JwtDecoder,
  regex: RegexTester,
  timestamp: UnixTimeConverter,
  base64: Base64Tool,
};

function setupTheme() {
  const theme = preferences.get('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    preferences.set('theme', next);
  });
}

function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  if (preferences.get('sidebarCollapsed')) sidebar.classList.add('collapsed');
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    preferences.set('sidebarCollapsed', sidebar.classList.contains('collapsed'));
  });
  document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
  });
  // Tool pages have no palette; the header button just returns to the all-in-one app.
  document.getElementById('cmdPaletteBtn')?.addEventListener('click', () => {
    window.location.href = '/';
  });
}

function mountTool() {
  const root = document.querySelector('[data-tool-page]');
  if (!root) return;
  const key = root.getAttribute('data-tool-page');
  const Cls = classes[key];
  const panel = document.getElementById(`${key}Panel`);
  if (!Cls || !panel) return;
  const instance = new Cls(panel);
  const preset = new URLSearchParams(location.search).get('input') ?? root.getAttribute('data-preset');
  if (preset && instance.setInput) instance.setInput(preset);
  window.devToyTool = { key, instance };
}

function init() {
  setupTheme();
  setupSidebar();
  mountTool();
  registerWebMcpTools();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
