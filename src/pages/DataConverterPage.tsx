import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  convertTextToJson,
  jsonToCsv,
  jsonToYaml,
  jsonToXml,
  textToBase64,
  base64ToText,
  xmlToJson,
  yamlToJson,
  type TextToJsonOptions
} from '../utils/dataConversionEngine';
import { formatBytes, triggerFileDownload } from '../utils/fileValidation';
import {
  Braces,
  FileText,
  Copy,
  Check,
  Download,
  Upload,
  ShieldCheck,
  FileJson
} from 'lucide-react';
import { ThemedSelect } from '../components/ThemedSelect';

export type DataToolMode =
  | 'text-to-json'
  | 'csv-to-json'
  | 'json-to-csv'
  | 'yaml-to-json'
  | 'xml-to-json'
  | 'json-to-yaml'
  | 'json-to-xml'
  | 'base64-converter';

interface SamplePreset {
  label: string;
  content: string;
  mode: 'auto' | 'key-value' | 'csv' | 'lines' | 'beautify';
}

const SAMPLE_PRESETS: SamplePreset[] = [
  {
    label: 'Key-Value Config',
    mode: 'key-value',
    content: `appName: ZENDR Studio
version: 2.4.0
port: 8080
debugMode: true
maxUploadSizeMb: 100
database.host: localhost
database.timeoutMs: 5000
features: [pdf_editor, image_tools, vectorizer]
status: active`
  },
  {
    label: 'CSV Data Table',
    mode: 'csv',
    content: `id,product,category,price,inStock,rating
101,Ultra HD Monitor,Electronics,349.99,true,4.8
102,Wireless Keyboard,Accessories,79.50,true,4.6
103,Ergonomic Chair,Furniture,289.00,false,4.9
104,Noise-Cancelling Headphones,Audio,199.95,true,4.7`
  },
  {
    label: 'Line Item List',
    mode: 'lines',
    content: `Apples
Bananas
Blueberries
Fresh Orange Juice
Whole Milk 1L
Organic Eggs`
  },
  {
    label: 'Server Log Entries',
    mode: 'lines',
    content: `[2026-10-11 12:00:01] INFO Server initialized on port 8080
[2026-10-11 12:00:05] INFO Connected to local database cluster
[2026-10-11 12:01:14] SUCCESS PDF Vectorization completed for document_01.pdf
[2026-10-11 12:02:40] WARN Memory cache usage reached 68%`
  }
];

export const DataConverterPage: React.FC = () => {
  const { toolId } = useParams<{ toolId?: string }>();

  const [activeTool, setActiveTool] = useState<DataToolMode>(() => (toolId as DataToolMode) || 'text-to-json');
  const [inputText, setInputText] = useState<string>(SAMPLE_PRESETS[0].content);
  const [outputText, setOutputText] = useState<string>('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Conversion Options
  const [parseMode, setParseMode] = useState<TextToJsonOptions['mode']>('key-value');
  const [indentSpaces, setIndentSpaces] = useState<number>(2);
  const [parseTypes, setParseTypes] = useState<boolean>(true);
  const [skipEmptyLines, setSkipEmptyLines] = useState<boolean>(true);
  const [delimiter, setDelimiter] = useState<string>(',');
  const [firstRowHeaders, setFirstRowHeaders] = useState<boolean>(true);
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');

  // Synchronize route toolId with state
  useEffect(() => {
    if (!toolId || toolId === activeTool) return;
    if (toolId === 'csv-to-json') {
      setActiveTool('csv-to-json');
      setParseMode('csv');
      setInputText(SAMPLE_PRESETS[1].content);
    } else if (toolId === 'json-to-csv') {
      setActiveTool('json-to-csv');
      setInputText(
        JSON.stringify(
          [
            { id: 1, name: 'Alex', role: 'Architect', active: true },
            { id: 2, name: 'Taylor', role: 'Designer', active: true },
            { id: 3, name: 'Jordan', role: 'Engineer', active: false }
          ],
          null,
          2
        )
      );
    } else if (toolId === 'yaml-to-json') {
      setActiveTool('yaml-to-json');
      setInputText(`server:\n  host: 0.0.0.0\n  port: 8080\nworkers: 4\ntags:\n  - web\n  - api`);
    } else if (toolId === 'xml-to-json') {
      setActiveTool('xml-to-json');
      setInputText(
        `<catalog><item id="1"><name>Widget</name><price>19.99</price></item><item id="2"><name>Gadget</name><price>29.99</price></item></catalog>`
      );
    } else if (toolId === 'json-to-yaml') {
      setActiveTool('json-to-yaml');
      setInputText(`{\n  "version": "1.0",\n  "services": {\n    "web": { "port": 80 },\n    "db": { "port": 5432 }\n  }\n}`);
    } else if (toolId === 'json-to-xml') {
      setActiveTool('json-to-xml');
      setInputText(`{\n  "catalog": {\n    "item": [\n      { "id": 1, "name": "Widget", "price": 19.99 },\n      { "id": 2, "name": "Gadget", "price": 29.99 }\n    ]\n  }\n}`);
    } else if (toolId === 'base64-converter') {
      setActiveTool('base64-converter');
      setInputText('Hello ZENDR Studio! 100% In-Browser Privacy.');
    } else {
      setActiveTool('text-to-json');
    }
  }, [toolId]);

  // Execute conversion asynchronously so buttons and inputs remain ultra-responsive
  useEffect(() => {
    const timer = setTimeout(() => {
      setParseError(null);
      if (!inputText.trim()) {
        setOutputText('');
        return;
      }

      try {
        if (activeTool === 'text-to-json' || activeTool === 'csv-to-json') {
          const res = convertTextToJson(inputText, {
            mode: activeTool === 'csv-to-json' ? 'csv' : parseMode,
            indentSpaces,
            parseTypes,
            skipEmptyLines,
            delimiter,
            firstRowHeaders
          });

          if (res.success) {
            setOutputText(res.jsonString);
            setParseError(null);
          } else {
            setParseError(res.error || 'Conversion failed.');
          }
        } else if (activeTool === 'json-to-csv') {
          const parsed = JSON.parse(inputText);
          const csv = jsonToCsv(parsed);
          setOutputText(csv);
          setParseError(null);
        } else if (activeTool === 'yaml-to-json') {
          const parsed = yamlToJson(inputText);
          setOutputText(JSON.stringify(parsed, null, indentSpaces || 2));
          setParseError(null);
        } else if (activeTool === 'xml-to-json') {
          const parsed = xmlToJson(inputText);
          setOutputText(JSON.stringify(parsed, null, indentSpaces || 2));
          setParseError(null);
        } else if (activeTool === 'json-to-yaml') {
          const parsed = JSON.parse(inputText);
          setOutputText(jsonToYaml(parsed));
          setParseError(null);
        } else if (activeTool === 'json-to-xml') {
          const parsed = JSON.parse(inputText);
          setOutputText(jsonToXml(parsed));
          setParseError(null);
        } else if (activeTool === 'base64-converter') {
          if (base64Mode === 'encode') {
            setOutputText(textToBase64(inputText));
          } else {
            setOutputText(base64ToText(inputText));
          }
          setParseError(null);
        }
      } catch (err: any) {
        setParseError(err.message || 'Syntax parse error');
      }
    }, 16);

    return () => clearTimeout(timer);
  }, [
    inputText,
    activeTool,
    parseMode,
    indentSpaces,
    parseTypes,
    skipEmptyLines,
    delimiter,
    firstRowHeaders,
    base64Mode
  ]);

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    if (!outputText) return;
    let ext = 'json';
    let mime = 'application/json';

    if (activeTool === 'json-to-csv') {
      ext = 'csv';
      mime = 'text/csv';
    } else if (activeTool === 'json-to-yaml') {
      ext = 'yaml';
      mime = 'text/yaml';
    } else if (activeTool === 'json-to-xml') {
      ext = 'xml';
      mime = 'application/xml';
    } else if (activeTool === 'base64-converter') {
      ext = base64Mode === 'encode' ? 'b64.txt' : 'txt';
      mime = 'text/plain';
    }

    const blob = new Blob([outputText], { type: mime });
    triggerFileDownload(blob, `converted_${Date.now()}.${ext}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      setInputText(text);

      // Auto-switch mode based on extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'csv' || ext === 'tsv') {
        setActiveTool('csv-to-json');
        setParseMode('csv');
        if (ext === 'tsv') setDelimiter('\t');
      } else if (ext === 'json') {
        setParseMode('beautify');
      } else if (ext === 'yaml' || ext === 'yml') {
        setActiveTool('yaml-to-json');
      } else if (ext === 'xml') {
        setActiveTool('xml-to-json');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#040406] text-white min-h-[calc(100vh-4rem)]">
      {/* Top Header & Navigation */}
      <div className="border-b border-white/[0.08] bg-[#07070a]/90 backdrop-blur-xl px-4 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/10 flex-shrink-0">
                <Braces className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 flex-wrap">
                  <span>Universal Data &amp; Code Converter</span>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    8 Formats • Client-Side
                  </span>
                </h1>
                <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                  Real-time bi-directional transformations: JSON, CSV spreadsheets, YAML DevOps configs, XML schemas, raw text parsing &amp; Base64 encoding.
                </p>
              </div>
            </div>

            {/* In-Browser Privacy Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white/50 self-start md:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>100% In-Browser Privacy</span>
            </div>
          </div>

          {/* Quick Tool Switcher Pills */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-full scrollbar-none text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
            <button
              onClick={() => {
                setActiveTool('text-to-json');
                setParseMode('key-value');
              }}
              className={`px-3.5 py-1.5 rounded-full font-medium active:scale-[0.95] transition-all duration-200 whitespace-nowrap cursor-pointer select-none flex items-center gap-1.5 ${
                activeTool === 'text-to-json'
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black font-semibold shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span>Text ➔ JSON</span>
            </button>
            <button
              onClick={() => {
                setActiveTool('csv-to-json');
                setParseMode('csv');
              }}
              className={`px-3.5 py-1.5 rounded-full font-medium active:scale-[0.95] transition-all duration-200 whitespace-nowrap cursor-pointer select-none flex items-center gap-1.5 ${
                activeTool === 'csv-to-json'
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black font-semibold shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span>CSV ➔ JSON</span>
            </button>
            <button
              onClick={() => setActiveTool('json-to-csv')}
              className={`px-3.5 py-1.5 rounded-full font-medium active:scale-[0.95] transition-all duration-200 whitespace-nowrap cursor-pointer select-none flex items-center gap-1.5 ${
                activeTool === 'json-to-csv'
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black font-semibold shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span>JSON ➔ CSV</span>
            </button>
            <button
              onClick={() => setActiveTool('yaml-to-json')}
              className={`px-3.5 py-1.5 rounded-full font-medium active:scale-[0.95] transition-all duration-200 whitespace-nowrap cursor-pointer select-none flex items-center gap-1.5 ${
                activeTool === 'yaml-to-json'
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black font-semibold shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span>YAML ➔ JSON</span>
            </button>
            <button
              onClick={() => setActiveTool('json-to-yaml')}
              className={`px-3.5 py-1.5 rounded-full font-medium active:scale-[0.95] transition-all duration-200 whitespace-nowrap cursor-pointer select-none flex items-center gap-1.5 ${
                activeTool === 'json-to-yaml'
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black font-semibold shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span>JSON ➔ YAML</span>
            </button>
            <button
              onClick={() => setActiveTool('xml-to-json')}
              className={`px-3.5 py-1.5 rounded-full font-medium active:scale-[0.95] transition-all duration-200 whitespace-nowrap cursor-pointer select-none flex items-center gap-1.5 ${
                activeTool === 'xml-to-json'
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black font-semibold shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span>XML ➔ JSON</span>
            </button>
            <button
              onClick={() => setActiveTool('json-to-xml')}
              className={`px-3.5 py-1.5 rounded-full font-medium active:scale-[0.95] transition-all duration-200 whitespace-nowrap cursor-pointer select-none flex items-center gap-1.5 ${
                activeTool === 'json-to-xml'
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black font-semibold shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span>JSON ➔ XML</span>
            </button>
            <button
              onClick={() => setActiveTool('base64-converter')}
              className={`px-3.5 py-1.5 rounded-full font-medium active:scale-[0.95] transition-all duration-200 whitespace-nowrap cursor-pointer select-none flex items-center gap-1.5 ${
                activeTool === 'base64-converter'
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black font-semibold shadow-[0_2px_10px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span>Base64</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Pane Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-5">
        {/* Multi-Format Capabilities Matrix Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-white">JSON ⇄ CSV</div>
              <div className="text-[10px] text-white/40 font-mono">Tables &amp; Sheets</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-white">JSON ⇄ YAML</div>
              <div className="text-[10px] text-white/40 font-mono">DevOps &amp; Docker</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-white">JSON ⇄ XML</div>
              <div className="text-[10px] text-white/40 font-mono">Schemas &amp; SOAP</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-white">Text ➔ JSON</div>
              <div className="text-[10px] text-white/40 font-mono">Smart Log Parser</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5 col-span-2 sm:col-span-1">
            <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-white">Base64 ⇄ UTF-8</div>
              <div className="text-[10px] text-white/40 font-mono">Binary Encoding</div>
            </div>
          </div>
        </div>

        {/* Settings Bar */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl flex items-center justify-between flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Mode selection for Text to JSON */}
            {(activeTool === 'text-to-json' || activeTool === 'csv-to-json') && (
              <div className="flex items-center gap-1.5">
                <span className="text-white/40">Parse Strategy:</span>
                <ThemedSelect
                  value={parseMode}
                  onChange={(val) => setParseMode(val as any)}
                  options={[
                    { value: 'auto', label: 'Auto-Detect' },
                    { value: 'key-value', label: 'Key-Value Pairs (key: val)' },
                    { value: 'csv', label: 'Delimited Table / CSV' },
                    { value: 'lines', label: 'Line-by-Line Array' },
                    { value: 'beautify', label: 'JSON Prettify / Validate' }
                  ]}
                />
              </div>
            )}

            {/* Delimiter Selection */}
            {(parseMode === 'csv' || activeTool === 'csv-to-json') && (
              <div className="flex items-center gap-1.5">
                <span className="text-white/40">Delimiter:</span>
                <ThemedSelect
                  value={delimiter}
                  onChange={(val) => setDelimiter(val)}
                  options={[
                    { value: ',', label: 'Comma (,)' },
                    { value: '\t', label: 'Tab (\\t)' },
                    { value: ';', label: 'Semicolon (;)' },
                    { value: '|', label: 'Pipe (|)' }
                  ]}
                />
              </div>
            )}

            {/* Indent Spaces */}
            {(activeTool.includes('json') || activeTool === 'text-to-json') && (
              <div className="flex items-center gap-1.5">
                <span className="text-white/40">Indent:</span>
                <ThemedSelect
                  value={indentSpaces}
                  onChange={(val) => setIndentSpaces(Number(val))}
                  options={[
                    { value: 2, label: '2 Spaces' },
                    { value: 4, label: '4 Spaces' },
                    { value: 0, label: 'Minified (0 Spaces)' }
                  ]}
                />
              </div>
            )}

            {/* Type coercion toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-white/70 hover:text-white">
              <input
                type="checkbox"
                checked={parseTypes}
                onChange={(e) => setParseTypes(e.target.checked)}
                className="rounded border-white/20 text-amber-400 focus:ring-0"
              />
              <span>Infer Types</span>
            </label>

            {/* Skip empty lines */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-white/70 hover:text-white">
              <input
                type="checkbox"
                checked={skipEmptyLines}
                onChange={(e) => setSkipEmptyLines(e.target.checked)}
                className="rounded border-white/20 text-amber-400 focus:ring-0"
              />
              <span>Skip Empty</span>
            </label>

            {/* First row headers */}
            {(parseMode === 'csv' || activeTool === 'csv-to-json') && (
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-white/70 hover:text-white">
                <input
                  type="checkbox"
                  checked={firstRowHeaders}
                  onChange={(e) => setFirstRowHeaders(e.target.checked)}
                  className="rounded border-white/20 text-amber-400 focus:ring-0"
                />
                <span>Headers in Row 1</span>
              </label>
            )}

            {/* Base64 Encode vs Decode */}
            {activeTool === 'base64-converter' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setBase64Mode('encode')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-transform duration-75 active:scale-95 select-none ${
                    base64Mode === 'encode' ? 'bg-amber-400 text-black font-semibold shadow-sm' : 'bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  Encode
                </button>
                <button
                  onClick={() => setBase64Mode('decode')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-transform duration-75 active:scale-95 select-none ${
                    base64Mode === 'decode' ? 'bg-amber-400 text-black font-semibold shadow-sm' : 'bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  Decode
                </button>
              </div>
            )}
          </div>

          {/* Preset Samples Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-white/40 hidden sm:inline text-xs">Load Sample:</span>
            <div className="flex items-center gap-1">
              {SAMPLE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setInputText(p.content);
                    setParseMode(p.mode);
                    setActiveTool('text-to-json');
                  }}
                  className="px-2 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-white/70 hover:text-amber-400 transition-all duration-75 active:scale-95 select-none cursor-pointer"
                >
                  {p.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Two Editors Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[460px]">
          {/* Left Editor: Input Text */}
          <div className="flex flex-col rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl overflow-hidden shadow-xl">
            {/* Input Header */}
            <div className="px-4 py-3 border-b border-white/[0.08] bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Input Content
                </span>
                <span className="text-[10px] font-mono text-white/40">
                  ({inputText.length} chars • {inputText.split('\n').length} lines)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-white/60 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept=".txt,.csv,.tsv,.json,.yaml,.yml,.xml,.log,.env"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                <button
                  onClick={() => setInputText('')}
                  className="text-xs text-white/40 hover:text-rose-400 transition-colors ml-2 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Input Textarea */}
            <div className="flex-1 relative p-4 flex flex-col">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste your plain text, key-value pairs, CSV data, or upload a file..."
                className="w-full flex-1 min-h-[380px] bg-transparent text-white/90 font-mono text-xs leading-relaxed resize-none focus:outline-none custom-scrollbar"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Right Editor: Output JSON / Result */}
          <div className="flex flex-col rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl overflow-hidden shadow-xl">
            {/* Output Header */}
            <div className="px-4 py-3 border-b border-white/[0.08] bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Converted Result
                </span>

                {parseError ? (
                  <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    Syntax Error
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Valid • {formatBytes(new Blob([outputText]).size)}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!outputText}
                  className="btn-secondary text-xs px-4 py-1.5 rounded-full"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  disabled={!outputText}
                  className="btn-primary text-xs px-4 py-1.5 rounded-full"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Output Display / Error banner */}
            <div className="flex-1 relative p-4 flex flex-col bg-black/30">
              {parseError ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono leading-relaxed">
                  <p className="font-bold text-rose-400 mb-1">Conversion Notice:</p>
                  <p>{parseError}</p>
                </div>
              ) : (
                <textarea
                  readOnly
                  value={outputText}
                  placeholder="Formatted conversion output will appear here automatically..."
                  className="w-full flex-1 min-h-[380px] bg-transparent text-emerald-300/90 font-mono text-xs leading-relaxed resize-none focus:outline-none custom-scrollbar"
                  spellCheck={false}
                />
              )}
            </div>
          </div>
        </div>

        {/* Feature Highlights & Privacy Card */}
        <div className="p-4 rounded-2xl bg-white/[0.015] border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-white/80">100% Client-Side Private:</strong> Your files and raw data never leave your browser or get sent to any server.
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Key-Value</span>
            <span>•</span>
            <span>CSV Table</span>
            <span>•</span>
            <span>YAML</span>
            <span>•</span>
            <span>XML</span>
            <span>•</span>
            <span>Base64</span>
          </div>
        </div>
      </div>
    </div>
  );
};
