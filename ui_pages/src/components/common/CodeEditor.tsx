import React, { useState, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: 'dark' | 'light';
  readOnly?: boolean;
  minHeight?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language = 'javascript',
  theme = 'dark',
  readOnly = false,
  minHeight = '320px'
}) => {
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Configure loader options if needed
    loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
  }, []);

  return (
    <div 
      id="code-editor-container"
      className="relative w-full rounded-lg border border-slate-700/60 dark:border-slate-800 bg-slate-950 font-mono text-sm overflow-hidden shadow-inner"
      style={{ minHeight }}
    >
      {!loadError ? (
        <Editor
          height={minHeight}
          language={language}
          value={code}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onChange={(val) => onChange(val || '')}
          onMount={() => setIsEditorReady(true)}
          loading={
            <div className="flex h-full w-full items-center justify-center bg-slate-950 text-slate-400 text-xs gap-2 py-12">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
              <span>Initializing Monaco IDE...</span>
            </div>
          }
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            fontFamily: "'JetBrains Mono', monospace",
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            padding: { top: 12, bottom: 12 }
          }}
        />
      ) : (
        /* Fallback robust editor */
        <div className="p-3 text-slate-200">
          <textarea
            id="code-editor-fallback"
            value={code}
            onChange={(e) => onChange(e.target.value)}
            readOnly={readOnly}
            className="w-full h-72 bg-transparent text-emerald-400 font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
};
