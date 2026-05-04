import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "dist/**",
      "*.config.js",
      "*.config.mjs",
      "_archived-code/**",
      "**/_reference/**",
      "tools/**",
    ],
  },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "react-hooks": reactHooks,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      "no-console": "off",
      // Import pattern enforcement
      "@typescript-eslint/no-restricted-imports": [
        "warn",
        {
          "paths": [
            {
              "name": "@react-three/fiber",
              "message": "Use StandardCanvas from '@/three' instead of raw Canvas from @react-three/fiber"
            },
            {
              "name": "@react-three/drei",
              "message": "Prefer using standardized hooks from '@/lib/threejs' when available"
            }
          ],
          "patterns": [
            {
              "group": ["../../*", "../../../*", "../../../../*"],
              "message": "Use @/ aliases instead of relative imports. See docs/IMPORT_PATTERNS.md"
            },
            {
              "group": ["@/components/ui/*"],
              "message": "Use barrel exports: import { Button } from '@/ui' instead of '@/components/ui/button'"
            },
            {
              "group": ["@/components/primitives/*"],
              "message": "Use barrel exports: import { GlassCard } from '@/primitives' instead of '@/components/primitives/GlassCard'"
            },
            {
              "group": ["@/components/three/*"],
              "message": "Use barrel exports: import { StandardCanvas } from '@/three' instead of '@/components/three/StandardCanvas'"
            }
          ]
        }
      ],
    },
  },
];

