import type { ComponentCatalogEntry } from './component-kind.ts';
import { display } from './component-kind.ts';

export const helpAndFeedbackComponents: ComponentCatalogEntry[] = [
  display('feedback-button', 'FeedbackButton', 'Feedback', 'astro', 'Shell feedback trigger bound to a shared dialog.', 'inline', { targetId: 'catalog-feedback' }, [
      { name: 'targetId', type: 'string', defaultValue: 'catalog-feedback', description: 'Dialog id to open.' },
      { name: 'label', type: 'string', defaultValue: 'Feedback', description: 'Visible button text.' },
    ], undefined, '@treeseed/ui/components/astro/feedback/FeedbackButton.astro'),
  display('feedback-dialog', 'FeedbackDialog', 'Feedback', 'astro', 'Feedback form with typed context and optional screenshot capture.', 'medium', { typeOptions: 5, screenshot: 'optional' }, [
      { name: 'context', type: 'FeedbackContext', defaultValue: { shell: 'public' }, description: 'Policy-safe page context.' },
      { name: 'id', type: 'string', defaultValue: 'catalog-feedback', description: 'Dialog id.' },
    ], undefined, '@treeseed/ui/components/astro/feedback/FeedbackDialog.astro'),
  display('feedback-redaction-boundary', 'FeedbackRedactionBoundary', 'Feedback', 'astro', 'Marks sensitive DOM regions for feedback screenshot masking.', 'inline', { reason: 'secret' }, [
      { name: 'reason', type: 'string', defaultValue: 'secret', description: 'Redaction reason marker.' },
    ], undefined, '@treeseed/ui/components/astro/feedback/FeedbackRedactionBoundary.astro'),
  display('help-button', 'HelpButton', 'Help', 'astro', 'Shell help trigger bound to the shared contextual drawer.', 'inline', { targetId: 'catalog-help' }, [
      { name: 'targetId', type: 'string', defaultValue: 'catalog-help', description: 'Drawer id to open.' },
      { name: 'label', type: 'string', defaultValue: 'Help', description: 'Visible button text.' },
    ], undefined, '@treeseed/ui/components/astro/help/HelpButton.astro'),
  display('help-drawer', 'HelpDrawer', 'Help', 'astro', 'Contextual help drawer with lazy scoped search and feedback handoff.', 'medium', { topics: 2, actions: 2 }, [
      { name: 'context', type: 'HelpContext', defaultValue: { shell: 'product' }, description: 'Policy-safe help context.' },
      { name: 'id', type: 'string', defaultValue: 'catalog-help', description: 'Drawer id.' },
    ], undefined, '@treeseed/ui/components/astro/help/HelpDrawer.astro'),
  display('help-popover', 'HelpPopover', 'Help', 'astro', 'Compact contextual help summary for shell drawers.', 'small', { topics: 2 }, [
      { name: 'context', type: 'HelpContext', defaultValue: { shell: 'product' }, description: 'Policy-safe help context.' },
    ], undefined, '@treeseed/ui/components/astro/help/HelpPopover.astro'),
  display('contextual-help-panel', 'ContextualHelpPanel', 'Help', 'astro', 'Full help panel with topics, action explanations, and feedback handoff.', 'medium', { topics: 2, actions: 2 }, [
      { name: 'context', type: 'HelpContext', defaultValue: { shell: 'product' }, description: 'Policy-safe help context.' },
      { name: 'feedbackTargetId', type: 'string | undefined', defaultValue: 'catalog-feedback', description: 'Optional feedback dialog id.' },
    ], undefined, '@treeseed/ui/components/astro/help/ContextualHelpPanel.astro'),
  display('help-topic-link', 'HelpTopicLink', 'Help', 'astro', 'Policy-safe link to a contextual help topic.', 'inline', { topicId: 'questions' }, [
      { name: 'topic', type: 'HelpTopicLink', defaultValue: { title: 'Questions' }, description: 'Topic link metadata.' },
    ], undefined, '@treeseed/ui/components/astro/help/HelpTopicLink.astro'),
  display('help-action-list', 'HelpActionList', 'Help', 'astro', 'Resolved action help with unavailable-state reasons and remediation.', 'medium', { actions: 2 }, [
      { name: 'actions', type: 'ResolvedAction[]', defaultValue: 2, description: 'Policy-resolved actions.' },
    ], undefined, '@treeseed/ui/components/astro/help/HelpActionList.astro'),
];
