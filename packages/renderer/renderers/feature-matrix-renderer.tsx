'use client';

import type { RendererProps } from '@dds/types';

interface Column {
  name: string;
  label: string;
  highlight?: boolean;
}

interface Row {
  feature: string;
  values: Record<string, string | boolean>;
}

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <span className="text-emerald-400">&#10003;</span>
    ) : (
      <span className="text-neutral-600">—</span>
    );
  }
  return <span>{value}</span>;
}

export function FeatureMatrixRenderer({ section }: RendererProps) {
  const { subject, content } = section;
  const columns = ((content as Record<string, unknown>)?.columns ?? []) as Column[];
  const rows = ((content as Record<string, unknown>)?.rows ?? []) as Row[];
  const highlights = content?.highlights ?? [];
  const items = content?.items ?? [];

  return (
    <div className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        {subject?.title && (
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-white">
            {subject.title}
          </h2>
        )}
        {subject?.subtitle && (
          <p className="mb-12 text-center text-neutral-400">{subject.subtitle}</p>
        )}

        {/* Table layout when columns + rows are provided */}
        {columns.length > 0 && rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60">
                  <th className="px-6 py-4 text-left font-medium text-neutral-400">Feature</th>
                  {columns.map((col) => (
                    <th
                      key={col.name}
                      className={`px-6 py-4 text-center font-semibold ${
                        col.highlight ? 'text-indigo-400' : 'text-neutral-300'
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? 'bg-neutral-900/30' : 'bg-neutral-900/10'}
                  >
                    <td className="px-6 py-3 font-medium text-neutral-200">{row.feature}</td>
                    {columns.map((col) => (
                      <td key={col.name} className="px-6 py-3 text-center text-neutral-300">
                        <CellValue value={row.values[col.name]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Fallback: highlights as feature rows */}
        {columns.length === 0 && highlights.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-neutral-800">
            {highlights.map((h, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 px-6 py-4 ${
                  i % 2 === 0 ? 'bg-neutral-900/40' : 'bg-neutral-900/20'
                }`}
              >
                <span className="mt-0.5 text-indigo-400">&#10003;</span>
                <div>
                  {h.subtitle && <span className="font-semibold text-neutral-200">{h.subtitle}</span>}
                  {h.description && <span className="ml-2 text-sm text-neutral-400">{h.description}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fallback: plain items list */}
        {columns.length === 0 && highlights.length === 0 && items.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-neutral-800">
            {items.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-6 py-3 text-sm ${
                  i % 2 === 0 ? 'bg-neutral-900/40' : 'bg-neutral-900/20'
                }`}
              >
                <span className="text-indigo-400">&#10003;</span>
                <span className="text-neutral-300">{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
