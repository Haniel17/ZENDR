/**
 * High-performance, pure client-side Data & Text Conversion Engine for ZENDR Studio.
 * Supports Text to JSON (Key-Value, CSV, Line array, Auto-detect), JSON to CSV,
 * YAML to JSON, XML to JSON, and Base64 encode/decode.
 */

export interface TextToJsonOptions {
  mode: 'auto' | 'key-value' | 'csv' | 'lines' | 'beautify';
  indentSpaces?: number; // 2, 4, or 0 (minified)
  parseTypes?: boolean; // convert "123" to number, "true" to boolean
  skipEmptyLines?: boolean;
  trimWhitespace?: boolean;
  delimiter?: string; // for CSV or custom splits (',' | '\t' | ';' | '|' | ':' | '=')
  firstRowHeaders?: boolean;
}

export interface ParseResult {
  success: boolean;
  jsonString: string;
  parsedData?: any;
  error?: string;
  stats?: {
    itemCount: number;
    byteSize: number;
    lines: number;
  };
}

/**
 * Coerces string values to primitive numbers, booleans, or null when applicable
 */
function coerceValue(val: string, parseTypes: boolean): any {
  if (!parseTypes) return val;
  const trimmed = val.trim();
  if (trimmed === '') return '';
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;
  if (trimmed.toLowerCase() === 'null') return null;
  if (trimmed.toLowerCase() === 'undefined') return undefined;

  // Strict numeric check
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const num = Number(trimmed);
    if (!isNaN(num) && isFinite(num)) return num;
  }

  // Attempt JSON literal parsing (e.g., inline JSON arrays or objects)
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // Return as plain string if invalid JSON
    }
  }

  return val;
}

/**
 * Parses CSV/TSV text into an array of objects or array of arrays
 */
export function csvToJson(
  csvText: string,
  delimiter = ',',
  firstRowHeaders = true,
  parseTypes = true
): any[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  // Parse a CSV row accounting for quoted fields
  const parseRow = (rowText: string): string[] => {
    const cells: string[] = [];
    let inQuotes = false;
    let currentCell = '';
    for (let i = 0; i < rowText.length; i++) {
      const char = rowText[i];
      if (char === '"') {
        if (inQuotes && rowText[i + 1] === '"') {
          currentCell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        cells.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());
    return cells;
  };

  const parsedRows = lines.map(parseRow);
  if (parsedRows.length === 0) return [];

  if (firstRowHeaders && parsedRows.length > 1) {
    const headers = parsedRows[0].map((h, i) => h || `column_${i + 1}`);
    const dataRows = parsedRows.slice(1);

    return dataRows.map((row) => {
      const obj: Record<string, any> = {};
      headers.forEach((header, index) => {
        const val = row[index] !== undefined ? row[index] : '';
        obj[header] = coerceValue(val, parseTypes);
      });
      return obj;
    });
  }

  // Return raw matrix if no headers
  return parsedRows.map((row) => row.map((c) => coerceValue(c, parseTypes)));
}

/**
 * Converts Key-Value plain text ("key: value" or "key = value") into a JSON object
 */
export function keyValueToJson(
  text: string,
  parseTypes = true,
  skipEmpty = true
): Record<string, any> {
  const lines = text.split(/\r?\n/);
  const result: Record<string, any> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed && skipEmpty) continue;
    if (trimmed.startsWith('#') || trimmed.startsWith('//')) continue;

    let separatorIndex = -1;
    let sepLength = 1;

    if (trimmed.includes('->')) {
      separatorIndex = trimmed.indexOf('->');
      sepLength = 2;
    } else if (trimmed.includes('=')) {
      separatorIndex = trimmed.indexOf('=');
    } else if (trimmed.includes(':')) {
      separatorIndex = trimmed.indexOf(':');
    }

    if (separatorIndex !== -1) {
      const rawKey = trimmed.substring(0, separatorIndex).trim().replace(/^['"]|['"]$/g, '');
      const rawVal = trimmed.substring(separatorIndex + sepLength).trim().replace(/^['"]|['"]$/g, '');

      if (rawKey) {
        if (rawKey.includes('.')) {
          const parts = rawKey.split('.');
          let curr = result;
          for (let p = 0; p < parts.length - 1; p++) {
            const part = parts[p];
            if (!curr[part] || typeof curr[part] !== 'object') {
              curr[part] = {};
            }
            curr = curr[part];
          }
          curr[parts[parts.length - 1]] = coerceValue(rawVal, parseTypes);
        } else {
          result[rawKey] = coerceValue(rawVal, parseTypes);
        }
      }
    } else if (trimmed) {
      result[trimmed] = true;
    }
  }

  return result;
}

/**
 * Converts array of lines to JSON string array
 */
export function linesToJson(
  text: string,
  parseTypes = false,
  skipEmpty = true,
  trim = true
): any[] {
  const rawLines = text.split(/\r?\n/);
  const items: any[] = [];

  for (const line of rawLines) {
    const val = trim ? line.trim() : line;
    if (!val && skipEmpty) continue;
    items.push(coerceValue(val, parseTypes));
  }

  return items;
}

/**
 * Basic pure client-side YAML parser for standard key-value and list structures
 */
export function yamlToJson(yamlText: string): any {
  const lines = yamlText.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith('#'));
  const root: Record<string, any> = {};
  let currentListKey: string | null = null;
  const listItems: any[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      const val = trimmed.substring(2).trim();
      listItems.push(coerceValue(val, true));
      if (currentListKey) {
        root[currentListKey] = [...listItems];
      }
    } else if (trimmed.includes(':')) {
      const colonIdx = trimmed.indexOf(':');
      const key = trimmed.substring(0, colonIdx).trim();
      const val = trimmed.substring(colonIdx + 1).trim();

      if (val === '') {
        currentListKey = key;
        listItems.length = 0;
        root[key] = [];
      } else {
        currentListKey = null;
        root[key] = coerceValue(val, true);
      }
    }
  }

  return Object.keys(root).length > 0 ? root : { parsed: yamlText };
}

/**
 * XML to JSON converter using the browser's DOMParser
 */
export function xmlToJson(xmlText: string): any {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
  const parserError = xmlDoc.querySelector('parsererror');

  if (parserError) {
    throw new Error(`XML Parse Error: ${parserError.textContent?.substring(0, 100)}`);
  }

  function domNodeToJson(node: Element): any {
    const obj: Record<string, any> = {};

    if (node.attributes && node.attributes.length > 0) {
      obj['@attributes'] = {};
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        obj['@attributes'][attr.name] = attr.value;
      }
    }

    if (node.children.length === 0) {
      const text = node.textContent?.trim() || '';
      return coerceValue(text, true);
    }

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const childName = child.nodeName;
      const childData = domNodeToJson(child);

      if (obj[childName] === undefined) {
        obj[childName] = childData;
      } else {
        if (!Array.isArray(obj[childName])) {
          obj[childName] = [obj[childName]];
        }
        obj[childName].push(childData);
      }
    }

    return obj;
  }

  return { [xmlDoc.documentElement.nodeName]: domNodeToJson(xmlDoc.documentElement) };
}

/**
 * Master Text-to-JSON Converter Function
 */
export function convertTextToJson(
  inputText: string,
  options: Partial<TextToJsonOptions> = {}
): ParseResult {
  const opts: TextToJsonOptions = {
    mode: options.mode || 'auto',
    indentSpaces: options.indentSpaces !== undefined ? options.indentSpaces : 2,
    parseTypes: options.parseTypes !== undefined ? options.parseTypes : true,
    skipEmptyLines: options.skipEmptyLines !== undefined ? options.skipEmptyLines : true,
    trimWhitespace: options.trimWhitespace !== undefined ? options.trimWhitespace : true,
    delimiter: options.delimiter || ',',
    firstRowHeaders: options.firstRowHeaders !== undefined ? options.firstRowHeaders : true
  };

  const text = opts.trimWhitespace ? inputText.trim() : inputText;
  if (!text) {
    return {
      success: true,
      jsonString: '{\n}',
      parsedData: {},
      stats: { itemCount: 0, byteSize: 2, lines: 1 }
    };
  }

  try {
    let resultData: any;

    if (opts.mode === 'beautify') {
      resultData = JSON.parse(text);
    } else if (opts.mode === 'key-value') {
      resultData = keyValueToJson(text, opts.parseTypes, opts.skipEmptyLines);
    } else if (opts.mode === 'csv') {
      resultData = csvToJson(text, opts.delimiter, opts.firstRowHeaders, opts.parseTypes);
    } else if (opts.mode === 'lines') {
      resultData = linesToJson(text, opts.parseTypes, opts.skipEmptyLines, opts.trimWhitespace);
    } else {
      // Auto-detect mode
      if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
        try {
          resultData = JSON.parse(text);
        } catch {
          // Continue to next check
        }
      }

      if (!resultData && text.includes('\t')) {
        resultData = csvToJson(text, '\t', true, opts.parseTypes);
      } else if (!resultData && text.includes(',') && text.split('\n')[0].includes(',')) {
        resultData = csvToJson(text, ',', true, opts.parseTypes);
      } else if (!resultData && (text.includes(':') || text.includes('='))) {
        resultData = keyValueToJson(text, opts.parseTypes, opts.skipEmptyLines);
      } else if (!resultData) {
        resultData = linesToJson(text, opts.parseTypes, opts.skipEmptyLines, opts.trimWhitespace);
      }
    }

    const indent = opts.indentSpaces === 0 ? undefined : ' '.repeat(opts.indentSpaces || 2);
    const jsonString = JSON.stringify(resultData, null, indent);

    const itemCount = Array.isArray(resultData)
      ? resultData.length
      : typeof resultData === 'object' && resultData !== null
      ? Object.keys(resultData).length
      : 1;

    return {
      success: true,
      jsonString,
      parsedData: resultData,
      stats: {
        itemCount,
        byteSize: new Blob([jsonString]).size,
        lines: jsonString.split('\n').length
      }
    };
  } catch (err: any) {
    return {
      success: false,
      jsonString: '',
      error: err.message || 'Unable to parse text to JSON. Check your syntax or format mode.'
    };
  }
}

/**
 * Converts JSON array or object to standard CSV format
 */
export function jsonToCsv(jsonData: any): string {
  let list: any[] = [];
  if (Array.isArray(jsonData)) {
    list = jsonData;
  } else if (typeof jsonData === 'object' && jsonData !== null) {
    list = [jsonData];
  } else {
    throw new Error('Input must be a JSON array of objects or an object to convert to CSV.');
  }

  if (list.length === 0) return '';

  const headersSet = new Set<string>();
  list.forEach((item) => {
    if (typeof item === 'object' && item !== null) {
      Object.keys(item).forEach((k) => headersSet.add(k));
    }
  });
  const headers = Array.from(headersSet);
  if (headers.length === 0) return '';

  const escapeCsv = (val: any): string => {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvLines: string[] = [];
  csvLines.push(headers.map(escapeCsv).join(','));

  for (const item of list) {
    const row = headers.map((h) => escapeCsv(item[h]));
    csvLines.push(row.join(','));
  }

  return csvLines.join('\n');
}

/**
 * Converts JSON to YAML string
 */
export function jsonToYaml(jsonData: any, indent = 0): string {
  const pad = ' '.repeat(indent);
  if (jsonData === null || jsonData === undefined) return `${pad}null`;
  if (typeof jsonData === 'boolean' || typeof jsonData === 'number') return `${pad}${jsonData}`;
  if (typeof jsonData === 'string') {
    if (jsonData.includes('\n') || jsonData.includes(':') || jsonData.includes('#')) {
      return `${pad}"${jsonData.replace(/"/g, '\\"')}"`;
    }
    return `${pad}${jsonData}`;
  }

  if (Array.isArray(jsonData)) {
    if (jsonData.length === 0) return `${pad}[]`;
    return jsonData
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const inner = jsonToYaml(item, indent + 2).trimStart();
          return `${pad}- ${inner}`;
        }
        return `${pad}- ${jsonToYaml(item, 0)}`;
      })
      .join('\n');
  }

  if (typeof jsonData === 'object') {
    const entries = Object.entries(jsonData);
    if (entries.length === 0) return `${pad}{}`;
    return entries
      .map(([k, v]) => {
        if (typeof v === 'object' && v !== null) {
          return `${pad}${k}:\n${jsonToYaml(v, indent + 2)}`;
        }
        return `${pad}${k}: ${jsonToYaml(v, 0).trim()}`;
      })
      .join('\n');
  }

  return `${pad}${String(jsonData)}`;
}

/**
 * Converts JSON to XML string
 */
export function jsonToXml(jsonData: any, rootTag = 'root'): string {
  function toXmlNodes(obj: any): string {
    if (obj === null || obj === undefined) return '';
    if (typeof obj !== 'object') {
      return String(obj).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => `<item>${toXmlNodes(item)}</item>`).join('');
    }

    let xml = '';
    for (const [key, val] of Object.entries(obj)) {
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '_') || 'node';
      xml += `<${sanitizedKey}>${toXmlNodes(val)}</${sanitizedKey}>`;
    }
    return xml;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>${toXmlNodes(jsonData)}</${rootTag}>`;
}

/**
 * Base64 encode and decode helper
 */
export function textToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary);
}

export function base64ToText(base64: string): string {
  const binary = atob(base64.trim());
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
