'use client';

import { useMemo } from 'react';
import { ThreeDViewLayout } from './views/ThreeDViewLayout';
import {
  ConfiguratorScene,
  ProductModel,
  ProductSelector,
  MaterialEditor,
  PartVisibilityControls,
  EmptyState,
} from './components';
import { useConfiguratorState } from './state/useConfiguratorState';
import { useSidebarControls } from './hooks';
import { products, getProductById } from './data/products';
import type { MaterialConfig } from './types';
import {
  PropertyPanel,
  PropertySection,
  PropertyInput,
} from '@/components/editor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Grid3X3,
  Activity,
  RotateCcw,
} from 'lucide-react';

/**
 * Main configurator page
 * Phase 2: Product System with customization controls
 * Phase 3: Advanced features foundation with scalable hooks
 */
export default function ConfiguratorPage() {
  // State management
  const state = useConfiguratorState();

  // Scalable interaction hooks (Phase 3)
  const sidebar = useSidebarControls();
  // Note: useModelInteraction is used within Canvas components, not at page level

  // Get selected product
  const selectedProduct = useMemo(
    () => (state.selectedProductId ? getProductById(state.selectedProductId) : undefined),
    [state.selectedProductId]
  );

  // Build product configuration
  const productConfig = useMemo(() => {
    if (!selectedProduct) return null;

    // Merge custom materials with defaults
    const materials: Record<string, MaterialConfig> = {};
    selectedProduct.parts.forEach((part) => {
      materials[part.name] =
        state.materials[selectedProduct.id]?.[part.name] ||
        selectedProduct.materials[part.name];
    });

    // Merge custom visibility with defaults
    const visibility: Record<string, boolean> = {};
    selectedProduct.parts.forEach((part) => {
      visibility[part.name] =
        state.visibility[selectedProduct.id]?.[part.name] ?? part.visible;
    });

    return {
      productId: selectedProduct.id,
      materials,
      visibility,
    };
  }, [selectedProduct, state.materials, state.visibility]);

  // Memoized viewport content
  const viewportContent = useMemo(() => {
    if (!selectedProduct || !productConfig) {
      return <EmptyState onSelectProduct={() => {}} />;
    }

    return (
      <ConfiguratorScene
        showGrid={state.showGrid}
        backgroundColor="#0a0a0a"
        lightingTheme={state.lightingTheme}
        environment={state.environment as any}
        lightingIntensity={state.lightingIntensity}
        environmentIntensity={state.environmentIntensity}
      >
        <ProductModel
          product={selectedProduct}
          configuration={productConfig}
          modelOffset={0}
          enableRotation={false}
        />
      </ConfiguratorScene>
    );
  }, [
    selectedProduct,
    productConfig,
    state.showGrid,
    state.lightingTheme,
    state.environment,
    state.lightingIntensity,
    state.environmentIntensity,
  ]);

  // Product controls UI
  const controls = (
    <div className="space-y-6">
      {/* Product Selection */}
      <ProductSelector
        products={products}
        selectedProductId={state.selectedProductId}
        onProductSelect={state.setSelectedProduct}
        layout="buttons"
      />

      {/* Material & Visibility Controls (only when product selected) */}
      {selectedProduct && productConfig && (
        <>
          {/* Material Editors */}
          {selectedProduct.parts.map((part) => (
            <MaterialEditor
              key={part.name}
              partName={part.name}
              partLabel={part.label}
              material={productConfig.materials[part.name]}
              onMaterialChange={(partName, material) =>
                state.updateMaterial(selectedProduct.id, partName, material)
              }
              onReset={(partName) =>
                state.updateMaterial(
                  selectedProduct.id,
                  partName,
                  selectedProduct.materials[partName]
                )
              }
            />
          ))}

          {/* Part Visibility */}
          <PartVisibilityControls
            parts={selectedProduct.parts}
            visibility={productConfig.visibility}
            onVisibilityChange={(partName, visible) =>
              state.updateVisibility(selectedProduct.id, partName, visible)
            }
            onToggleAll={(visible) =>
              selectedProduct.parts.forEach((part) =>
                state.updateVisibility(selectedProduct.id, part.name, visible)
              )
            }
          />
        </>
      )}

      {/* Scene Settings */}
      <PropertyPanel title="Scene Settings" onApply={() => {}}>
        <PropertySection title="Display">
          <div className="space-y-2">
            <Button
              variant={state.showGrid ? 'default' : 'outline'}
              size="sm"
              onClick={state.toggleGrid}
              className="w-full justify-start gap-2"
            >
              <Grid3X3 className="w-4 h-4" />
              Grid: {state.showGrid ? 'ON' : 'OFF'}
            </Button>
            <Button
              variant={state.showStats ? 'default' : 'outline'}
              size="sm"
              onClick={state.toggleStats}
              className="w-full justify-start gap-2"
            >
              <Activity className="w-4 h-4" />
              Stats: {state.showStats ? 'ON' : 'OFF'}
            </Button>
          </div>
        </PropertySection>

        <PropertySection title="Lighting Theme">
          <div className="grid grid-cols-2 gap-2">
            {(['studio', 'sunset', 'warehouse', 'minimal'] as const).map((theme) => (
              <Button
                key={theme}
                variant={state.lightingTheme === theme ? 'default' : 'outline'}
                size="sm"
                onClick={() => state.setLightingTheme(theme)}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </Button>
            ))}
          </div>
        </PropertySection>

        <PropertySection title="Environment">
          <div className="grid grid-cols-2 gap-2">
            {(['studio', 'sunset', 'warehouse', 'none'] as const).map((env) => (
              <Button
                key={env}
                variant={state.environment === env ? 'default' : 'outline'}
                size="sm"
                onClick={() => state.setEnvironment(env)}
              >
                {env.charAt(0).toUpperCase() + env.slice(1)}
              </Button>
            ))}
          </div>
        </PropertySection>
      </PropertyPanel>

      {/* Reset */}
      <PropertyPanel title="Actions" onApply={() => {}}>
        <PropertySection title="Configuration">
          <Button
            variant="outline"
            size="sm"
            onClick={() => state.reset()}
            className="w-full justify-start gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All
          </Button>
        </PropertySection>
      </PropertyPanel>
    </div>
  );

  // Footer content
  const footer = (
    <div className="px-6 py-3 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>Product:</span>
        <Badge variant="secondary">
          {selectedProduct ? selectedProduct.name : 'None Selected'}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        {state.showGrid && <Badge variant="outline">Grid</Badge>}
        {state.showStats && <Badge variant="outline">Stats</Badge>}
        <Badge variant="outline">{state.lightingTheme}</Badge>
      </div>
    </div>
  );

  return (
    <ThreeDViewLayout
      viewport={viewportContent}
      controls={controls}
      controlsTitle="Product Configurator"
      controlsSubtitle="Phase 2: Product System"
      title="3D Product Configurator"
      subtitle="Customize products with materials and visibility controls"
      footer={footer}
      defaultViewportSize={70}
      minViewportSize={50}
      enableResize={true}
      onViewportSizeChange={state.setPanelSize}
    />
  );
}
