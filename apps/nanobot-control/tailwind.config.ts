import type { Config } from 'tailwindcss';
import sharedConfig from '@dds/tailwind-config';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [sharedConfig],
};

export default config;
