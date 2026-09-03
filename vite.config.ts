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
        'site-brand': 'src/site-brand.ts',
        timestamps: 'src/timestamps.ts',
        forms: 'src/forms.ts',
        'forms-client': 'src/forms-client.ts',
        react: 'src/react.ts',
		'ink/index': 'src/ink/index.ts',
        'theme/index': 'src/theme/index.ts',
        'lib/foundation/contracts': 'src/lib/foundation/contracts.ts',
        'lib/charts/index': 'src/lib/charts/index.ts',
        'lib/pie-allocation/math': 'src/lib/pie-allocation/math.ts',
        'lib/forms/submission/index': 'src/lib/forms/submission/index.ts',
        'react/pie-allocation/DynamicPieAllocationInput': 'src/react/pie-allocation/DynamicPieAllocationInput.tsx',
        'react/charts/MonitoringChart': 'src/react/charts/MonitoringChart.tsx',
        'react/charts/ProjectActivityChart': 'src/react/charts/ProjectActivityChart.tsx',
		'react/operations-monitor/index': 'src/react/operations-monitor/index.ts',
		'react/workspace-surfaces/index': 'src/react/workspace-surfaces/index.ts',
		'react/command-center/index': 'src/react/command-center/index.ts',
		'react/agent-atlas/index': 'src/react/agent-atlas/index.ts',
		'react/agent-designer/index': 'src/react/agent-designer/index.ts',
		'react/progressive/index': 'src/react/progressive/index.ts',
		'react/semantic/index': 'src/react/semantic/index.ts',
        'react/editors/RichMarkdownEditor': 'src/react/editors/RichMarkdownEditor.tsx',
        'react/editors/KnowledgeRelationPicker': 'src/react/editors/KnowledgeRelationPicker.tsx',
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
      external: [/^node:/, /^react(?:\/.*)?$/, /^react-dom(?:\/.*)?$/, /^ink(?:\/.*)?$/, 'astro', 'recharts', 'yaml', '@mdxeditor/editor'],
      output: {
        preserveModules: false,
      },
    },
  },
});
