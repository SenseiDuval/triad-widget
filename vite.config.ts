import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for building a single-file widget bundle.
// The library entry points at src/triad-widget.tsx and outputs
// a self-executing IIFE named triad-widget.js. We avoid marking
// any dependencies as external so React and ReactDOM are bundled
// directly into the final file.
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/triad-widget.tsx',
      name: 'TriadWidget',
      fileName: () => 'triad-widget.js',
      formats: ['iife']
    },
    rollupOptions: {
      // No externals – bundle everything into one file.
      external: []
    }
  }
});
