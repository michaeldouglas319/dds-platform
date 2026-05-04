'use client';

/**
 * Component Detail Panel
 *
 * Shows detailed information about a selected component.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, Copy } from 'lucide-react';
import type { ComponentMetadata } from '@/lib/registry/types';

interface ComponentDetailProps {
  component: ComponentMetadata;
}

export function ComponentDetail({ component }: ComponentDetailProps) {
  const [copiedExport, setCopiedExport] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExport(text);
    setTimeout(() => setCopiedExport(null), 2000);
  };

  const generateImportStatement = (): string => {
    // Infer the import path from the file path
    const pathParts = component.path.split('/');
    let importPath = '@/components';

    // Determine category subdirectory
    if (pathParts[0] === 'components') {
      if (pathParts[1] === 'ui') {
        importPath += '/ui';
      } else if (pathParts[1] === 'PitchDeck') {
        importPath += '/PitchDeck';
      } else if (pathParts[1] === 'sections') {
        importPath += '/sections';
      } else if (pathParts[1] === 'layouts') {
        importPath += '/layouts';
      } else if (pathParts[1] === 'layout') {
        importPath += '/layout';
      } else if (pathParts[1] === 'resume') {
        importPath += '/resume';
      }
    }

    const exports = component.exports.map(e => e.name).join(', ');
    return `import { ${exports} } from '${importPath}'`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle>{component.name}</CardTitle>
              <CardDescription className="font-mono text-xs">{component.id}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className="capitalize">{component.category}</Badge>
              {component.layer && <Badge variant="outline">Layer {component.layer}</Badge>}
              {component.subcategory && (
                <Badge variant="outline" className="capitalize">
                  {component.subcategory}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Description */}
        {component.description && (
          <div className="space-y-2">
            <h3 className="font-medium">Description</h3>
            <p className="text-sm text-muted-foreground">{component.description}</p>
          </div>
        )}

        {/* File Path */}
        <div className="space-y-2">
          <h3 className="font-medium">Location</h3>
          <code className="block bg-muted p-2 rounded text-xs font-mono break-all">
            {component.path}
          </code>
        </div>

        {/* Exports */}
        {component.exports.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Exports</h3>
            <div className="space-y-2">
              {component.exports.map(exp => (
                <div key={exp.name} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                  <div>
                    <code className="font-mono">{exp.name}</code>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {exp.isComponent && <span>Component</span>}
                      {exp.isHook && <span>Hook</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Import Statement */}
        <div className="space-y-2">
          <h3 className="font-medium">Import</h3>
          <div className="relative bg-muted p-3 rounded font-mono text-xs overflow-x-auto">
            <code>{generateImportStatement()}</code>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(generateImportStatement())}
            >
              {copiedExport === generateImportStatement() ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Dependencies */}
        {component.dependencies && component.dependencies.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Dependencies</h3>
            <div className="flex flex-wrap gap-2">
              {component.dependencies.map(dep => (
                <Badge key={dep.name} variant="secondary" className="text-xs">
                  {dep.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {component.tags && component.tags.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {component.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-2 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Total Exports</div>
              <div className="text-muted-foreground">{component.exports.length}</div>
            </div>
            {component.dependencies && (
              <div>
                <div className="font-medium">Dependencies</div>
                <div className="text-muted-foreground">{component.dependencies.length}</div>
              </div>
            )}
            {component.deprecated && (
              <div className="col-span-2">
                <Badge variant="destructive">Deprecated</Badge>
                {component.deprecationMessage && (
                  <p className="text-xs text-muted-foreground mt-2">{component.deprecationMessage}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
