'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';

interface RulesEditorProps {}

const RULE_TEMPLATES = [
  {
    name: 'Lighthouse Performance',
    description: 'Performance score must be 80+',
    json: {
      id: 'lighthouse_performance',
      name: 'Lighthouse Performance',
      rules: [
        {
          id: 'lcp',
          metric: 'LCP',
          operator: '<',
          threshold: 2.5,
          severity: 'critical',
        },
        {
          id: 'cls',
          metric: 'CLS',
          operator: '<',
          threshold: 0.1,
          severity: 'critical',
        },
      ],
    },
  },
  {
    name: 'Accessibility (WCAG 2.1 AA)',
    description: 'Basic accessibility compliance',
    json: {
      id: 'wcag_2_1_aa',
      name: 'WCAG 2.1 Level AA',
      rules: [
        {
          id: 'color_contrast',
          metric: 'Color Contrast Ratio',
          operator: '>=',
          threshold: 4.5,
          severity: 'warning',
        },
        {
          id: 'alt_text',
          metric: 'Images with Alt Text',
          operator: '>=',
          threshold: 100,
          severity: 'critical',
        },
      ],
    },
  },
  {
    name: 'SEO Basics',
    description: 'Search engine optimization fundamentals',
    json: {
      id: 'seo_basics',
      name: 'SEO Basics',
      rules: [
        {
          id: 'meta_description',
          metric: 'Meta Description Present',
          operator: '==',
          threshold: 1,
          severity: 'warning',
        },
        {
          id: 'mobile_friendly',
          metric: 'Mobile Friendly',
          operator: '==',
          threshold: 1,
          severity: 'critical',
        },
      ],
    },
  },
];

export default function RulesEditor({}: RulesEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(RULE_TEMPLATES[0]);
  const [rulesJson, setRulesJson] = useState(JSON.stringify(selectedTemplate.json, null, 2));
  const [errors, setErrors] = useState<string[]>([]);

  const handleTemplateSelect = (template: typeof RULE_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setRulesJson(JSON.stringify(template.json, null, 2));
    setErrors([]);
  };

  const handleJsonChange = (value: string | undefined) => {
    if (value) {
      setRulesJson(value);
      try {
        JSON.parse(value);
        setErrors([]);
      } catch (err) {
        setErrors([(err as Error).message]);
      }
    }
  };

  const handleSave = () => {
    try {
      JSON.parse(rulesJson);
      // In production: POST to save rules
      alert('Rules saved! (mock)');
    } catch (err) {
      setErrors([(err as Error).message]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Library */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Rule Templates</h2>
        <div className="grid grid-cols-1 gap-3">
          {RULE_TEMPLATES.map(template => (
            <button
              key={template.name}
              onClick={() => handleTemplateSelect(template)}
              className={`text-left p-4 rounded-lg border transition-colors ${
                selectedTemplate.name === template.name
                  ? 'bg-blue-900/30 border-blue-600 text-blue-300'
                  : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="font-bold">{template.name}</div>
              <div className="text-sm text-slate-400">{template.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Visual Rule Builder (Left) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Visual Rule Builder</h3>
          <div className="space-y-4">
            {selectedTemplate.json.rules.map((rule: any, idx: number) => (
              <div key={idx} className="bg-slate-800/50 rounded p-4 border border-slate-700">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1">
                    <label className="block text-sm text-slate-400">Metric</label>
                    <input
                      type="text"
                      value={rule.metric}
                      disabled
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-50"
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-sm text-slate-400">Operator</label>
                    <select
                      value={rule.operator}
                      disabled
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-50"
                    >
                      <option>==</option>
                      <option>!=</option>
                      <option>&lt;</option>
                      <option>&gt;</option>
                      <option>&lt;=</option>
                      <option>&gt;=</option>
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-sm text-slate-400">Threshold</label>
                    <input
                      type="number"
                      value={rule.threshold}
                      disabled
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Severity</label>
                  <select
                    value={rule.severity}
                    disabled
                    className={`w-full rounded px-2 py-1 ${
                      rule.severity === 'critical'
                        ? 'bg-red-900/30 text-red-300 border border-red-700'
                        : 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
                    }`}
                  >
                    <option>info</option>
                    <option>warning</option>
                    <option>critical</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded text-blue-300 text-sm">
            💡 Visual editor is read-only preview. Edit JSON on the right to modify rules.
          </div>
        </div>

        {/* JSON Editor (Right) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Rules JSON</h3>
          <div className="mb-4 h-80 border border-slate-700 rounded overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={rulesJson}
              onChange={handleJsonChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
              }}
            />
          </div>

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded text-red-300 text-sm">
              {errors.map((error, idx) => (
                <div key={idx}>❌ {error}</div>
              ))}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full primary"
          >
            💾 Save Rules
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Live Preview</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded">
            <span className="text-2xl">📋</span>
            <div className="flex-1">
              <div className="font-semibold text-slate-50">
                {(selectedTemplate.json as any).name || 'Unnamed Rule'}
              </div>
              <div className="text-sm text-slate-400">
                {(selectedTemplate.json as any).rules.length} conditions defined
              </div>
            </div>
            <span className="text-green-400 font-bold">✓ Valid</span>
          </div>
        </div>
      </div>
    </div>
  );
}
