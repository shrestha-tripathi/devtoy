/**
 * WebMCP progressive enhancement (https://github.com/webmachinelearning/webmcp).
 * If `navigator.modelContext` exists, register pure-function tools that call the
 * EXISTING tool-module logic (via prototypes — no UI needed). Absent → no-op.
 * Never throws.
 */
import JwtDecoder from '../tools/jwtDecoder.js';
import Base64Tool from '../tools/base64Tool.js';
import UnixTimeConverter from '../tools/unixTimeConverter.js';
import { RegexEngine } from '../tools/regexTester.js';

const text = (t) => ({ content: [{ type: 'text', text: t }] });
const str = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v));

const jwt = JwtDecoder.prototype;
const b64 = Base64Tool.prototype;
const unix = UnixTimeConverter.prototype;
let regexEngine = null;

export const tools = [
  {
    name: 'format_json',
    description: 'Validate JSON and return it beautified (default 2-space indent) or minified.',
    inputSchema: {
      type: 'object',
      properties: {
        json: { type: 'string', description: 'JSON text' },
        indent: { type: 'integer', minimum: 0, maximum: 8, default: 2 },
        minify: { type: 'boolean', default: false },
      },
      required: ['json'],
    },
    // Same JSON.parse / JSON.stringify(parsed, null, indent) path as JsonFormatter.beautify/minify.
    execute: async ({ json, indent = 2, minify = false }) => {
      const parsed = JSON.parse(str(json));
      return text(minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, Number(indent) || 2));
    },
  },
  {
    name: 'decode_jwt',
    description: 'Decode a JWT header and payload and report expiry. Does NOT verify the signature.',
    inputSchema: {
      type: 'object',
      properties: { token: { type: 'string', description: 'The JWT (header.payload.signature)' } },
      required: ['token'],
    },
    execute: async ({ token }) => {
      const decoded = jwt.decodeJwt.call({ base64UrlDecode: jwt.base64UrlDecode }, str(token).trim());
      const now = Math.floor(Date.now() / 1000);
      const exp = decoded.payload?.exp;
      const expiry = typeof exp !== 'number'
        ? 'no exp claim'
        : exp < now
          ? `expired ${jwt.formatDuration(now - exp)} ago (${new Date(exp * 1000).toISOString()})`
          : `expires in ${jwt.formatDuration(exp - now)} (${new Date(exp * 1000).toISOString()})`;
      return text(JSON.stringify({ header: decoded.header, payload: decoded.payload, expiry, signatureVerified: false }, null, 2));
    },
  },
  {
    name: 'base64_encode',
    description: 'Encode UTF-8 text to Base64 (optionally URL-safe Base64URL without padding).',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' }, urlSafe: { type: 'boolean', default: false } },
      required: ['text'],
    },
    execute: async ({ text: t, urlSafe = false }) => text(b64.encode.call({ urlSafe: !!urlSafe }, str(t))),
  },
  {
    name: 'base64_decode',
    description: 'Decode Base64 (or URL-safe Base64URL) to UTF-8 text.',
    inputSchema: {
      type: 'object',
      properties: { base64: { type: 'string' }, urlSafe: { type: 'boolean', default: false } },
      required: ['base64'],
    },
    execute: async ({ base64, urlSafe = false }) => text(b64.decode.call({ urlSafe: !!urlSafe }, str(base64))),
  },
  {
    name: 'test_regex',
    description: 'Run a JavaScript regular expression against text and return matches with index and groups.',
    inputSchema: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: 'Pattern without slashes' },
        flags: { type: 'string', default: 'g', description: 'e.g. g, i, m, s, u' },
        text: { type: 'string' },
      },
      required: ['pattern', 'text'],
    },
    execute: async ({ pattern, flags = 'g', text: t }) => {
      regexEngine ??= new RegexEngine();
      const r = regexEngine.execute(str(pattern), str(flags), str(t));
      return text(JSON.stringify({ totalMatches: r.totalMatches, matches: r.matches.slice(0, 200) }, null, 2));
    },
  },
  {
    name: 'convert_unix_time',
    description: 'Convert a Unix timestamp to ISO/UTC/relative time, or an ISO date string to Unix seconds and milliseconds.',
    inputSchema: {
      type: 'object',
      properties: {
        value: { type: 'string', description: 'Unix timestamp (number) or a date string like 2026-01-01T00:00:00Z' },
        unit: { type: 'string', enum: ['s', 'ms', 'auto'], default: 'auto' },
        timeZone: { type: 'string', description: 'Optional IANA zone for a local rendering, e.g. Asia/Kolkata' },
      },
      required: ['value'],
    },
    execute: async ({ value, unit = 'auto', timeZone }) => {
      const v = str(value).trim();
      let date;
      if (/^-?\d+(\.\d+)?$/.test(v)) {
        const n = Number(v);
        const ms = unit === 'ms' || (unit === 'auto' && Math.abs(n) >= 1e11);
        date = new Date(ms ? n : n * 1000);
      } else {
        date = new Date(v);
      }
      if (isNaN(date.getTime())) throw new Error('Invalid timestamp or date');
      const out = {
        unixSeconds: Math.floor(date.getTime() / 1000),
        unixMilliseconds: date.getTime(),
        iso: date.toISOString(),
        utc: date.toUTCString(),
        relative: unix.getRelativeTime(date),
      };
      if (timeZone) out[timeZone] = date.toLocaleString('en-US', { timeZone: str(timeZone), timeZoneName: 'short' });
      return text(JSON.stringify(out, null, 2));
    },
  },
];

function safe(tool) {
  return {
    ...tool,
    execute: async (args) => {
      try {
        return await tool.execute(args ?? {});
      } catch (e) {
        return text(`Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    },
  };
}

export function registerWebMcpTools() {
  try {
    const mc = typeof navigator !== 'undefined' ? navigator.modelContext : undefined;
    if (!mc) return;
    const wrapped = tools.map(safe);
    if (typeof mc.registerTool === 'function') {
      for (const t of wrapped) {
        try { mc.registerTool(t); } catch { /* ignore */ }
      }
    } else if (typeof mc.provideContext === 'function') {
      mc.provideContext({ tools: wrapped });
    }
  } catch {
    /* never throw */
  }
}
