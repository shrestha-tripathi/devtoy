/** Per-tool landing page content. Keys match main.js toolDefinitions. */
export type ToolKey = "json" | "jwt" | "regex" | "timestamp" | "base64";

export interface Faq { q: string; a: string }
export interface ToolPage {
  slug: string;
  tool: ToolKey;
  navLabel: string;
  title: string;
  h1: string;
  metaDescription: string;
  intro: string;
  steps: string[];
  tips?: string[];
  faqs: Faq[];
  related: string[];
  /** Optional preset passed to the tool's setInput() on load. */
  preset?: string;
}

export const toolPages: ToolPage[] = [
  {
    slug: "json-formatter",
    tool: "json",
    navLabel: "JSON Formatter",
    title: "JSON Formatter & Beautifier (Offline)",
    h1: "JSON Formatter and Beautifier",
    metaDescription:
      "Format, beautify, minify and validate JSON in your browser. Collapsible tree view, syntax highlighting and clear error messages. Nothing is uploaded.",
    intro:
      "Paste raw or minified JSON and get it pretty-printed instantly with syntax highlighting and a collapsible tree view. Parsing uses your browser's native JSON.parse, so invalid input is flagged with the parser's own error message and the JSON you paste is never sent to a server.",
    steps: [
      "Paste or type JSON into the input box (or click Sample to load an example).",
      "The output updates as you type: a valid document is highlighted and shown as a tree.",
      "Click Beautify to re-indent the input, or Minify to strip all whitespace.",
      "Use Copy to put the formatted result on your clipboard.",
    ],
    tips: [
      "JSON does not allow trailing commas, single quotes or comments — these are the most common parse errors.",
      "Keys must be double-quoted strings; numbers cannot have leading zeros.",
    ],
    faqs: [
      { q: "Is my JSON uploaded anywhere?", a: "No. Formatting and validation run entirely in your browser with JavaScript's built-in JSON parser. There is no backend that receives your data." },
      { q: "Can it handle large JSON files?", a: "It handles documents of several megabytes comfortably on a modern machine; the practical limit is your browser's memory, since everything is processed locally." },
      { q: "Does it support JSON5 or comments?", a: "No. It validates strict JSON (RFC 8259), so comments, trailing commas and unquoted keys are reported as errors." },
      { q: "What is the difference between beautify and minify?", a: "Beautify adds indentation and line breaks for readability. Minify removes all insignificant whitespace to make the payload as small as possible." },
    ],
    related: ["jwt-decoder", "base64-encode-decode"],
  },
  {
    slug: "jwt-decoder",
    tool: "jwt",
    navLabel: "JWT Decoder",
    title: "JWT Decoder — Inspect Header, Payload & Expiry",
    h1: "JWT Decoder",
    metaDescription:
      "Decode JSON Web Tokens locally: view the header, payload claims, issued-at and expiry times. Your token never leaves the browser.",
    intro:
      "Paste a JSON Web Token to see its decoded header and payload side by side, with standard claims such as exp, iat and nbf translated into readable dates and an expiry status. Decoding happens locally, which matters because a JWT is often a live credential you should not paste into a remote service.",
    steps: [
      "Paste the full token (three Base64URL segments separated by dots).",
      "Read the decoded header (algorithm, type) and the payload claims.",
      "Check the expiry status and the human-readable exp / iat / nbf timestamps.",
      "Copy the header or payload JSON if you need it elsewhere.",
    ],
    tips: [
      "Decoding is not verification: this tool does not check the signature, so never trust a token's claims just because it decodes.",
      "exp, iat and nbf are Unix timestamps in seconds.",
    ],
    faqs: [
      { q: "Does this verify the JWT signature?", a: "No. It only decodes the header and payload, which are plain Base64URL-encoded JSON. Signature verification needs the secret or public key and should happen on your server." },
      { q: "Is it safe to paste a production token?", a: "The token is decoded in your browser and is not transmitted by this tool. Still, treat tokens as secrets and prefer expired or test tokens when possible." },
      { q: "Why does my token fail to decode?", a: "A JWT must have exactly three dot-separated parts and the first two must be valid Base64URL JSON. Encrypted tokens (JWE, five parts) cannot be decoded without the key." },
      { q: "What do exp, iat and nbf mean?", a: "exp is the expiry time, iat is when the token was issued and nbf is the time before which it must not be accepted. All are seconds since the Unix epoch." },
    ],
    related: ["base64-encode-decode", "unix-timestamp-converter"],
  },
  {
    slug: "base64-encode-decode",
    tool: "base64",
    navLabel: "Base64 Encode / Decode",
    title: "Base64 Encode & Decode Online (UTF-8, URL-safe)",
    h1: "Base64 Encoder and Decoder",
    metaDescription:
      "Encode text to Base64 or decode Base64 to text in your browser. UTF-8 safe with an optional URL-safe (Base64URL) mode. No uploads.",
    intro:
      "Convert text to Base64 and back instantly. Input is treated as UTF-8, so emoji and non-Latin scripts round-trip correctly, and a URL-safe mode swaps + and / for - and _ and drops the = padding, which is the variant used in JWTs and many URL parameters.",
    steps: [
      "Choose Encode or Decode.",
      "Paste your text (or Base64 string) into the input.",
      "Toggle URL-safe if you are working with Base64URL data.",
      "Use Swap to feed the output back in as input, or Copy to grab the result.",
    ],
    tips: [
      "Base64 is an encoding, not encryption — anyone can decode it.",
      "Encoded output is about 33% larger than the input (4 characters per 3 bytes).",
    ],
    faqs: [
      { q: "Is Base64 encryption?", a: "No. Base64 is a reversible encoding for representing bytes as text. It provides no confidentiality." },
      { q: "What is URL-safe Base64?", a: "Base64URL replaces + with - and / with _ and usually omits = padding, so the result can be placed in URLs and filenames without escaping." },
      { q: "Does it support Unicode?", a: "Yes. Text is encoded as UTF-8 before Base64 encoding, and decoded output is interpreted as UTF-8." },
      { q: "Why do I get 'Invalid Base64 input'?", a: "The string contains characters outside the Base64 alphabet, has wrong padding, or decodes to bytes that are not valid UTF-8 text (for example binary file data)." },
    ],
    related: ["jwt-decoder", "json-formatter"],
  },
  {
    slug: "regex-tester",
    tool: "regex",
    navLabel: "Regex Tester",
    title: "Regex Tester — Test JavaScript Regular Expressions",
    h1: "Regex Tester",
    metaDescription:
      "Test JavaScript regular expressions live with match highlighting, capture groups and flags (g, i, m, s, u). Runs locally in your browser.",
    intro:
      "Write a regular expression and see every match highlighted in your test text as you type, along with capture groups, named groups and match positions. Patterns run on your browser's native JavaScript RegExp engine, so results match what your JS or TypeScript code will do.",
    steps: [
      "Enter a pattern (without surrounding slashes).",
      "Toggle the flags you need, such as g (global), i (ignore case) or m (multiline).",
      "Paste the text to test against; matches are highlighted live.",
      "Inspect the match list for groups and positions.",
    ],
    tips: [
      "Without the g flag only the first match is returned.",
      "Use (?<name>...) for named groups; they appear by name in the results.",
    ],
    faqs: [
      { q: "Which regex flavour does it use?", a: "The JavaScript (ECMAScript) RegExp engine built into your browser. Syntax like lookbehind and named groups work in modern browsers; PCRE-only features such as possessive quantifiers do not." },
      { q: "Is my test text sent to a server?", a: "No. Matching runs locally in the page." },
      { q: "Why does my pattern only match once?", a: "Enable the g (global) flag to find all matches rather than stopping after the first." },
      { q: "What does the s flag do?", a: "The s (dotAll) flag makes . match newline characters as well." },
    ],
    related: ["json-formatter", "base64-encode-decode"],
  },
  {
    slug: "unix-timestamp-converter",
    tool: "timestamp",
    navLabel: "Unix Timestamp Converter",
    title: "Unix Timestamp Converter — Epoch to Date & Back",
    h1: "Unix Timestamp Converter",
    metaDescription:
      "Convert Unix epoch timestamps (seconds or milliseconds) to human-readable dates in local time or UTC, and dates back to epoch. Works offline.",
    intro:
      "Convert an epoch timestamp to a readable date, or pick a date and get the epoch value. Seconds and milliseconds are both supported, results can be shown in your local timezone or UTC, and a live clock shows the current Unix time.",
    steps: [
      "Paste a Unix timestamp, or click Now to use the current time.",
      "Pick seconds or milliseconds to match your value.",
      "Read the ISO 8601, UTC, local and relative representations.",
      "Or edit the date/time field to convert a date back to epoch.",
    ],
    tips: [
      "A 10-digit value is usually seconds; 13 digits is usually milliseconds.",
      "Unix time ignores leap seconds and is always based on UTC.",
    ],
    faqs: [
      { q: "What is a Unix timestamp?", a: "The number of seconds elapsed since 1970-01-01 00:00:00 UTC (the Unix epoch), not counting leap seconds." },
      { q: "Seconds or milliseconds?", a: "Most Unix tools and JWTs use seconds; JavaScript's Date.now() and many APIs use milliseconds. Choose the unit that matches your value." },
      { q: "Does the timestamp depend on my timezone?", a: "No. The epoch value is the same everywhere; only its human-readable rendering changes with timezone." },
      { q: "What is the year 2038 problem?", a: "Systems storing Unix time as a signed 32-bit integer overflow on 2038-01-19 03:14:07 UTC. JavaScript uses 64-bit floats, so this tool is not affected." },
    ],
    related: ["jwt-decoder", "json-formatter"],
  },
];

export const bySlug = (s: string) => toolPages.find((p) => p.slug === s);
