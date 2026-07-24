import type { ComponentCatalogEntry } from './component-kind.ts';
import { display } from './component-kind.ts';

export const appControlsComponents: ComponentCatalogEntry[] = [
  display('app-markdown-field', 'AppMarkdownField', 'App Controls', 'astro', 'Application Markdown field variant used by authenticated work surfaces.', 'large', { label: 'Project note', rows: 8 }, [
      { name: 'label', type: 'string', defaultValue: 'Project note', description: 'Field label.' },
      { name: 'rows', type: 'number', defaultValue: 8, description: 'Editor height hint.' },
    ], undefined, '@treeseed/ui/components/astro/app/controls/MarkdownField.astro'),
  display('content-field-help', 'ContentFieldHelp', 'App Controls', 'astro', 'Reusable ContentFieldHelp component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/controls/ContentFieldHelp.astro'),
  display('delete-confirmation-modal', 'DeleteConfirmationModal', 'App Controls', 'astro', 'Reusable DeleteConfirmationModal component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/controls/DeleteConfirmationModal.astro'),
  display('host-credential-permission-note', 'HostCredentialPermissionNote', 'App Controls', 'astro', 'Reusable HostCredentialPermissionNote component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/controls/HostCredentialPermissionNote.astro'),
  display('launch-requirement-summary', 'LaunchRequirementSummary', 'App Controls', 'astro', 'Reusable LaunchRequirementSummary component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/controls/LaunchRequirementSummary.astro'),
  display('plain-table', 'PlainTable', 'App Controls', 'astro', 'Reusable PlainTable component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/controls/PlainTable.astro'),
  display('project-control-nav', 'ProjectControlNav', 'App Controls', 'astro', 'Reusable ProjectControlNav component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/controls/ProjectControlNav.astro'),
  display('related-content-creator', 'RelatedContentCreator', 'App Controls', 'astro', 'Reusable RelatedContentCreator component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/controls/RelatedContentCreator.astro'),
  display('template-host-requirement-picker', 'TemplateHostRequirementPicker', 'App Controls', 'astro', 'Reusable TemplateHostRequirementPicker component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/controls/TemplateHostRequirementPicker.astro'),
  display('template-resource-requirement-picker', 'TemplateResourceRequirementPicker', 'App Controls', 'astro', 'Reusable TemplateResourceRequirementPicker component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/controls/TemplateResourceRequirementPicker.astro'),
  display('template-secret-requirement-panel', 'TemplateSecretRequirementPanel', 'App Controls', 'astro', 'Reusable TemplateSecretRequirementPanel component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/controls/TemplateSecretRequirementPanel.astro'),
  display('work-content-nav', 'WorkContentNav', 'App Controls', 'astro', 'Reusable WorkContentNav component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/controls/WorkContentNav.astro'),
];
