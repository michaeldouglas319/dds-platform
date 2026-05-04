/**
 * Product library - defines all available products for configuration
 */

import type { ProductDefinition } from '../types';

export const products: ProductDefinition[] = [
  {
    id: 'building',
    name: 'Office Building',
    description: 'Modern office building with customizable materials and multiple parts',
    modelPath: '/assets/models/building.glb',
    category: 'architecture',
    defaultScale: 2.5,
    materials: {
      walls: {
        defaultColor: '#4CAF50',
        metalness: 0.1,
        roughness: 0.8,
      },
      windows: {
        defaultColor: '#89CFF0',
        metalness: 0.8,
        roughness: 0.1,
      },
      roof: {
        defaultColor: '#555555',
        metalness: 0.6,
        roughness: 0.4,
      },
    },
    parts: [
      {
        name: 'walls',
        label: 'Walls',
        visible: true,
        meshNames: ['Building_Walls', 'Walls'],
      },
      {
        name: 'windows',
        label: 'Windows',
        visible: true,
        meshNames: ['Building_Windows', 'Windows'],
      },
      {
        name: 'roof',
        label: 'Roof',
        visible: true,
        meshNames: ['Building_Roof', 'Roof'],
      },
    ],
    featured: true,
    tags: ['architecture', 'building', 'commercial'],
  },
  {
    id: 'uav',
    name: 'UAV Drone',
    description: 'Engineering UAV with customizable body and propeller colors',
    modelPath: '/assets/models/uav/Meshy_AI_Make_a_engineering_ap_1230052632_generate.glb',
    category: 'vehicles',
    defaultScale: 2.0,
    materials: {
      body: {
        defaultColor: '#333333',
        metalness: 0.9,
        roughness: 0.3,
      },
      propellers: {
        defaultColor: '#FF6B6B',
        metalness: 0.7,
        roughness: 0.4,
      },
      camera: {
        defaultColor: '#222222',
        metalness: 0.95,
        roughness: 0.2,
      },
    },
    parts: [
      {
        name: 'body',
        label: 'Body',
        visible: true,
        meshNames: ['Body', 'Frame', 'Structure'],
      },
      {
        name: 'propellers',
        label: 'Propellers',
        visible: true,
        meshNames: ['Propeller', 'Blade', 'Rotor'],
      },
      {
        name: 'camera',
        label: 'Camera',
        visible: true,
        meshNames: ['Camera', 'Lens'],
      },
    ],
    featured: true,
    tags: ['drone', 'vehicle', 'engineering'],
  },
];

/**
 * Get a product by ID
 */
export function getProductById(id: string): ProductDefinition | undefined {
  return products.find((p) => p.id === id);
}

/**
 * Get products by category
 */
export function getProductsByCategory(category: string): ProductDefinition[] {
  return products.filter((p) => p.category === category);
}

/**
 * Get all featured products
 */
export function getFeaturedProducts(): ProductDefinition[] {
  return products.filter((p) => p.featured);
}

/**
 * Get unique product categories
 */
export function getProductCategories(): string[] {
  const categories = new Set(
    products
      .map((p) => p.category)
      .filter((category): category is string => category !== undefined && category !== null)
  );
  return Array.from(categories);
}
