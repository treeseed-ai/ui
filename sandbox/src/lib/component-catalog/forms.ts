import type { ComponentCatalogEntry } from './component-kind.ts';
import { form, display } from './component-kind.ts';

export const formsComponents: ComponentCatalogEntry[] = [
  form('button', 'Button', 'Actions', 'astro', 'Command and link button variants.', 'inline', {
      variant: 'primary',
      size: 'md',
      type: 'submit',
      disabled: false,
    }, [
      { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", defaultValue: 'primary', description: 'Visual button treatment.' },
      { name: 'size', type: "'sm' | 'md'", defaultValue: 'md', description: 'Button size.' },
      { name: 'disabled', type: 'boolean', defaultValue: false, description: 'Disables the button.' },
    ]),
  form('checkbox-field', 'CheckboxField', 'Fields', 'react', 'Theme-aware React checkbox form control.', 'small', {
      id: 'react-enabled',
      name: 'react_enabled',
      label: 'Enable realtime monitoring',
      checked: true,
    }, [
      { name: 'checked', type: 'boolean', defaultValue: true, description: 'Controlled checked state.' },
      { name: 'defaultChecked', type: 'boolean', defaultValue: undefined, description: 'Initial uncontrolled checked state.' },
      { name: 'onChange', type: '(checked: boolean) => void', defaultValue: undefined, description: 'Change callback.' },
    ], { react_enabled: true, submitted: null }),
  form('dynamic-pie-allocation', 'DynamicPieAllocationInput', 'Allocation', 'react', 'Interactive pie allocation form value editor.', 'large', {
      name: 'capacity_allocation',
      precision: 1,
      minSlicePercentage: 0,
      allowNumericEditing: true,
      allowDragEditing: true,
    }, [
      { name: 'precision', type: '0 | 1 | 2', defaultValue: 1, description: 'Decimal precision for slice values.' },
      { name: 'minSlicePercentage', type: 'number', defaultValue: 0, description: 'Minimum allowed slice percentage.' },
      { name: 'allowNumericEditing', type: 'boolean', defaultValue: true, description: 'Allows number input editing.' },
      { name: 'allowDragEditing', type: 'boolean', defaultValue: true, description: 'Allows drag handles.' },
    ], { allocation: [], validity: { valid: true, total: 100 }, submitted: null }),
  form('field', 'Field', 'Fields', 'astro', 'Label, help, error, and control wrapper.', 'medium', {
      label: 'Project name',
      help: 'Short labels work best in navigation.',
      error: '',
    }, [
      { name: 'label', type: 'string', defaultValue: 'Project name', description: 'Field label.' },
      { name: 'help', type: 'string', defaultValue: 'Short labels work best in navigation.', description: 'Help text below the control.' },
      { name: 'error', type: 'string', defaultValue: '', description: 'Validation error text.' },
    ]),
  form('form-actions', 'FormActions', 'Actions', 'astro', 'Action alignment for forms.', 'medium', {
      align: 'between',
    }, [
      { name: 'align', type: "'start' | 'end' | 'between'", defaultValue: 'between', description: 'Horizontal action alignment.' },
    ]),
  form('markdown-field', 'MarkdownField', 'Editors', 'astro', 'CodeMirror-enhanced Markdown field with preview mode.', 'large', {
      label: 'Decision body',
      name: 'decision_body',
      rows: 8,
      required: true,
    }, [
      { name: 'rows', type: 'number', defaultValue: 8, description: 'Textarea/editor height hint.' },
      { name: 'required', type: 'boolean', defaultValue: true, description: 'Requires content before submit.' },
      { name: 'placeholder', type: 'string', defaultValue: '', description: 'Editor placeholder.' },
    ], { markdown: '', preview: 'rendered from /api/markdown/preview', submitted: null }),
  form('password-meter', 'PasswordMeter', 'Validation', 'astro', 'Password strength indicator bound to a password input.', 'medium', {
      minLength: 12,
      label: 'Password strength',
    }, [
      { name: 'minLength', type: 'number', defaultValue: 12, description: 'Length rule threshold.' },
      { name: 'label', type: 'string', defaultValue: 'Password strength', description: 'Meter label.' },
    ], { password: 'redacted in submissions', strength: 0, submitted: null }),
  form('radio-group', 'RadioGroup', 'Choices', 'astro', 'Radio group with labels and option help.', 'medium', {
      name: 'strategy',
      legend: 'Release strategy',
      value: 'guarded',
      required: true,
    }, [
      { name: 'value', type: 'string', defaultValue: 'guarded', description: 'Selected radio value.' },
      { name: 'required', type: 'boolean', defaultValue: true, description: 'Requires one choice.' },
    ]),
  form('rich-markdown-editor', 'RichMarkdownEditor', 'Editors', 'react', 'Rich MDXEditor-based Markdown and MDX editing surface.', 'large', {
      label: 'Rich markdown',
      name: 'rich_markdown',
      required: true,
    }, [
      { name: 'initialMarkdown', type: 'string', defaultValue: '# Build a resilient launch loop', description: 'Initial editor document.' },
      { name: 'required', type: 'boolean', defaultValue: true, description: 'Requires content before submit.' },
    ], { markdown: '', submitted: null }),
  form('select-field', 'SelectField', 'Choices', 'react', 'Theme-aware React select form control.', 'small', {
      id: 'react-environment',
      name: 'react_environment',
      label: 'Environment',
      value: 'production',
      options: 3,
    }, [
      { name: 'value', type: 'string', defaultValue: 'production', description: 'Controlled selected option.' },
      { name: 'defaultValue', type: 'string', defaultValue: undefined, description: 'Initial uncontrolled selected option.' },
      { name: 'options', type: 'SelectOption[]', defaultValue: 3, description: 'Selectable options.' },
      { name: 'onChange', type: '(value: string) => void', defaultValue: undefined, description: 'Change callback.' },
    ], { react_environment: 'production', submitted: null }),
  form('select', 'Select', 'Choices', 'astro', 'Theme-aware native select control.', 'small', {
      name: 'environment',
      value: 'production',
      required: true,
    }, [
      { name: 'value', type: 'string', defaultValue: 'production', description: 'Selected option.' },
      { name: 'required', type: 'boolean', defaultValue: true, description: 'Requires a selected option.' },
    ]),
  form('text-field', 'TextField', 'Fields', 'react', 'Theme-aware React text and textarea form control.', 'small', {
      id: 'react-project',
      name: 'react_project',
      label: 'Project',
      value: 'Monitoring Console',
      multiline: false,
    }, [
      { name: 'value', type: 'string', defaultValue: 'Monitoring Console', description: 'Controlled field value.' },
      { name: 'defaultValue', type: 'string', defaultValue: undefined, description: 'Initial uncontrolled field value.' },
      { name: 'multiline', type: 'boolean', defaultValue: false, description: 'Renders a textarea instead of an input.' },
      { name: 'onChange', type: '(value: string) => void', defaultValue: undefined, description: 'Change callback.' },
    ], { react_project: 'Monitoring Console', submitted: null }),
  form('text-input', 'TextInput', 'Fields', 'astro', 'Theme-aware single-line input control.', 'small', {
      name: 'project',
      type: 'text',
      value: 'Monitoring Console',
      required: true,
    }, [
      { name: 'type', type: 'text | email | url | password | search | number | tel', defaultValue: 'text', description: 'Native input type.' },
      { name: 'value', type: 'string', defaultValue: 'Monitoring Console', description: 'Input value.' },
      { name: 'required', type: 'boolean', defaultValue: true, description: 'Requires a value.' },
    ]),
  form('textarea', 'Textarea', 'Fields', 'astro', 'Theme-aware multiline text input.', 'medium', {
      name: 'notes',
      rows: 5,
      value: 'Watch queue depth and deployment drift.',
    }, [
      { name: 'rows', type: 'number', defaultValue: 5, description: 'Visible row count.' },
      { name: 'value', type: 'string', defaultValue: 'Watch queue depth and deployment drift.', description: 'Textarea value.' },
    ]),
  form('theme-menu', 'ThemeMenu', 'Theme', 'astro', 'Popup appearance selector menu.', 'small', {
      selectedScheme: 'fern',
      selectedMode: 'system',
    }, [
      { name: 'selectedScheme', type: 'string', defaultValue: 'fern', description: 'Initial color scheme.' },
      { name: 'selectedMode', type: "'system' | 'light' | 'dark'", defaultValue: 'system', description: 'Initial theme mode.' },
    ], { scheme: 'fern', mode: 'system', submitted: null }, '@treeseed/ui/components/astro/theme/ThemeMenu.astro'),
  form('theme-selector', 'ThemeSelector', 'Theme', 'astro', 'Color scheme and mode selector.', 'medium', {
      selectedScheme: 'fern',
      selectedMode: 'system',
      compact: false,
    }, [
      { name: 'selectedScheme', type: 'string', defaultValue: 'fern', description: 'Initial color scheme.' },
      { name: 'selectedMode', type: "'system' | 'light' | 'dark'", defaultValue: 'system', description: 'Initial mode.' },
      { name: 'compact', type: 'boolean', defaultValue: false, description: 'Compact layout mode.' },
    ], { scheme: 'fern', mode: 'system', submitted: null }, '@treeseed/ui/components/astro/theme/ThemeSelector.astro'),
  display('contact-form', 'ContactForm', 'Forms', 'astro', 'Reusable ContactForm component copied into the TreeSeed UI library.', 'medium', { source: 'Forms' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/forms/ContactForm.astro'),
  display('footer-subscribe-form', 'FooterSubscribeForm', 'Forms', 'astro', 'Reusable FooterSubscribeForm component copied into the TreeSeed UI library.', 'medium', { source: 'Forms' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/forms/FooterSubscribeForm.astro'),
];
