import react from '@vitejs/plugin-react';
import { defineConfig, type PluginOption } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react() as unknown as PluginOption,
    dts({
      entryRoot: 'src',
      include: ['src'],
      exclude: ['sandbox', 'tests'],
    }) as unknown as PluginOption,
  ],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        react: 'src/react.ts',
        'theme/index': 'src/theme/index.ts',
        'lib/foundation/contracts': 'src/lib/foundation/contracts.ts',
        'lib/charts/index': 'src/lib/charts/index.ts',
        'lib/pie-allocation/math': 'src/lib/pie-allocation/math.ts',
        'react/pie-allocation/DynamicPieAllocationInput': 'src/react/pie-allocation/DynamicPieAllocationInput.tsx',
        'react/charts/MonitoringChart': 'src/react/charts/MonitoringChart.tsx',
        'react/charts/ProjectActivityChart': 'src/react/charts/ProjectActivityChart.tsx',
        'react/editors/RichMarkdownEditor': 'src/react/editors/RichMarkdownEditor.tsx',
        'lib/app/deployment-action-status': 'src/lib/app/deployment-action-status.ts',
        'lib/app/platform-operation-status': 'src/lib/app/platform-operation-status.ts',
        'lib/app/related-content-creator': 'src/lib/app/related-content-creator.ts',
        'lib/app/markdown-field': 'src/lib/app/markdown-field.ts',
        'react/form-controls/CheckboxField': 'src/react/form-controls/CheckboxField.tsx',
        'react/form-controls/SelectField': 'src/react/form-controls/SelectField.tsx',
        'react/form-controls/TextField': 'src/react/form-controls/TextField.tsx',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [/^node:/, 'astro', 'react', 'react-dom', 'react/jsx-runtime', 'recharts', 'yaml', '@mdxeditor/editor'],
      output: {
        preserveModules: false,
      },
    },
  },
});
