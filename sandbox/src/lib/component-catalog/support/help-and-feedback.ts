import type { ComponentCatalogEntry } from './component-kind.ts';
import { display } from './component-kind.ts';

export const helpAndFeedbackComponents: ComponentCatalogEntry[] = [
  display('discussion-trigger', 'DiscussionTrigger', 'Discussion', 'astro', 'Shell action that opens the shared non-modal Discussion panel.', 'inline', { targetId: 'catalog-discussion' }, [
      { name: 'targetId', type: 'string', defaultValue: 'catalog-discussion', description: 'Discussion panel id to open.' },
      { name: 'title', type: 'string', defaultValue: 'Open Discussions', description: 'Accessible action title.' },
    ], undefined, '@treeseed/ui/components/astro/discussion/DiscussionTrigger.astro'),
  display('discussion-body', 'DiscussionBody', 'Discussion', 'astro', 'Internal renderer-neutral discussion composition shared by the panel and full-page workspace.', 'large', { id: 'catalog-discussion-body', teamId: 'team-demo' }, [
      { name: 'id', type: 'string', defaultValue: 'catalog-discussion-body', description: 'Stable editor and region identity.' },
      { name: 'context', type: 'DiscussionContext', defaultValue: { teamId: 'team-demo' }, description: 'Authorized discussion context.' },
    ], undefined, '@treeseed/ui/components/astro/discussion/DiscussionBody.astro'),
  display('discussion-panel', 'DiscussionPanel', 'Discussion', 'astro', 'Durable TreeDX-backed agent conversation panel with assignment traces and a Markdown composer.', 'large', { id: 'catalog-discussion', teamId: 'team-demo', projectId: 'project-demo' }, [
      { name: 'id', type: 'string', defaultValue: 'catalog-discussion', description: 'Unique panel and trigger target id.' },
      { name: 'context', type: 'DiscussionContext', defaultValue: { teamId: 'team-demo', projectId: 'project-demo' }, description: 'Authorized team, project, endpoint, identity, and agent context.' },
    ], undefined, '@treeseed/ui/components/astro/discussion/DiscussionPanel.astro'),
  display('discussion-workspace', 'DiscussionWorkspace', 'Discussion', 'astro', 'Full-page durable team conversation workspace backed by the same discussion contract as the persistent shell panel.', 'full-page', { id: 'catalog-discussion-workspace', teamId: 'team-demo', projectId: 'project-demo' }, [
      { name: 'context', type: 'DiscussionContext', defaultValue: { teamId: 'team-demo', projectId: 'project-demo' }, description: 'Authorized team and project discussion context.' },
      { name: 'title', type: 'string', defaultValue: 'Chat', description: 'Workspace heading.' },
    ], undefined, '@treeseed/ui/components/astro/discussion/DiscussionWorkspace.astro'),
  display('team-chat-workspace', 'TeamChatWorkspace', 'Discussion', 'astro', 'Complete shared Chat surface with project context selection, semantic history region, and durable discussion workspace.', 'full-page', { teamId: 'team-demo', projects: 2 }, [
      { name: 'context', type: 'DiscussionContext', defaultValue: { teamId: 'team-demo' }, description: 'Authorized team discussion context.' },
      { name: 'projects', type: 'ProjectOption[]', defaultValue: 2, description: 'Available project contexts.' },
    ], undefined, '@treeseed/ui/components/astro/discussion/TeamChatWorkspace.astro'),
  display('core-workspace-navigation', 'CoreWorkspaceNavigation', 'Navigation', 'astro', 'Canonical Team, Chat, Inbox, and Discover root navigation.', 'large', { current: 'team' }, [
      { name: 'current', type: 'WorkspaceId', defaultValue: 'team', description: 'Current root workspace.' },
      { name: 'teamHref', type: 'string', defaultValue: '/app/teams/team-demo', description: 'Active-team viewer route.' },
    ], undefined, '@treeseed/ui/components/astro/navigation/CoreWorkspaceNavigation.astro'),
  display('team-viewer', 'TeamViewer', 'Team', 'astro', 'Shared operational and public team viewer composed from profile, project, resource, signal, activity, and action regions.', 'full-page', { name: 'TreeSeed', handle: 'treeseed', projects: 2 }, [
      { name: 'name', type: 'string', defaultValue: 'TreeSeed', description: 'Team display name.' },
      { name: 'projects', type: 'ViewerItem[]', defaultValue: [], description: 'Visible team projects.' },
      { name: 'publicView', type: 'boolean', defaultValue: false, description: 'Applies public profile semantics.' },
    ], undefined, '@treeseed/ui/components/astro/team/TeamViewer.astro'),
  display('feedback-trigger', 'FeedbackTrigger', 'Feedback', 'astro', 'Shell feedback trigger bound to the shared non-modal panel.', 'inline', { targetId: 'catalog-feedback' }, [
      { name: 'targetId', type: 'string', defaultValue: 'catalog-feedback', description: 'Dialog id to open.' },
      { name: 'label', type: 'string', defaultValue: 'Feedback', description: 'Visible button text.' },
    ], undefined, '@treeseed/ui/components/astro/feedback/FeedbackTrigger.astro'),
  display('feedback-panel', 'FeedbackPanel', 'Feedback', 'astro', 'Responsive non-modal feedback form that docks beside desktop content and becomes a bottom sheet on smaller screens.', 'medium', { typeOptions: 5, screenshot: 'optional' }, [
      { name: 'context', type: 'FeedbackContext', defaultValue: { shell: 'public' }, description: 'Policy-safe page context.' },
      { name: 'id', type: 'string', defaultValue: 'catalog-feedback', description: 'Dialog id.' },
    ], undefined, '@treeseed/ui/components/astro/feedback/FeedbackPanel.astro'),
  display('feedback-context-summary', 'FeedbackContextSummary', 'Feedback', 'astro', 'Immutable identity, scope, page, and environment summary attached to a report.', 'small', { scope: 'active team' }, [
      { name: 'context', type: 'FeedbackContext', defaultValue: { canonicalPath: '/app' }, description: 'Policy-safe route and account context.' },
    ], undefined, '@treeseed/ui/components/astro/feedback/FeedbackContextSummary.astro'),
  display('feedback-collection', 'FeedbackCollection', 'Feedback', 'astro', 'Responsive administrator collection rendered as a table or mobile cards.', 'large', { items: 2 }, [
      { name: 'items', type: 'FeedbackCollectionItem[]', defaultValue: [], description: 'Authorized feedback summaries.' },
      { name: 'timeZone', type: 'string', defaultValue: 'UTC', description: 'Authenticated administrator IANA time zone.' },
    ], undefined, '@treeseed/ui/components/astro/feedback/management/FeedbackCollection.astro'),
  display('feedback-filter-toolbar', 'FeedbackFilterToolbar', 'Feedback', 'astro', 'Bounded collection filters for status, type, team, and screenshot state.', 'large', { teams: 2 }, [
      { name: 'values', type: 'Record<string, string>', defaultValue: {}, description: 'Current URL filter values.' },
      { name: 'teams', type: 'FeedbackTeamOption[]', defaultValue: [], description: 'Authorized team filter choices.' },
    ], undefined, '@treeseed/ui/components/astro/feedback/management/FeedbackFilterToolbar.astro'),
  display('feedback-resolution-form', 'FeedbackResolutionForm', 'Feedback', 'astro', 'Optimistic status transition and administrator note form.', 'small', { status: 'triaged', version: 1 }, [
      { name: 'status', type: 'FeedbackStatus', defaultValue: 'triaged', description: 'Current feedback status.' },
      { name: 'version', type: 'number', defaultValue: 1, description: 'Optimistic record version.' },
    ], undefined, '@treeseed/ui/components/astro/feedback/management/FeedbackResolutionForm.astro'),
  display('feedback-status-badge', 'FeedbackStatusBadge', 'Feedback', 'astro', 'Semantic badge for the four-state feedback workflow.', 'inline', { status: 'new' }, [
      { name: 'status', type: 'FeedbackStatus', defaultValue: 'new', description: 'Current workflow status.' },
    ], undefined, '@treeseed/ui/components/astro/feedback/management/FeedbackStatusBadge.astro'),
  display('feedback-status-timeline', 'FeedbackStatusTimeline', 'Feedback', 'astro', 'Chronological status and resolution-note history.', 'medium', { events: 2 }, [
      { name: 'events', type: 'FeedbackStatusEvent[]', defaultValue: [], description: 'Authorized immutable history.' },
      { name: 'timeZone', type: 'string', defaultValue: 'UTC', description: 'Authenticated administrator IANA time zone.' },
    ], undefined, '@treeseed/ui/components/astro/feedback/management/FeedbackStatusTimeline.astro'),
  display('private-attachment-viewer', 'PrivateAttachmentViewer', 'Feedback', 'astro', 'No-store private redacted screenshot viewer with retention metadata.', 'large', { digest: 'sha256' }, [
      { name: 'src', type: 'string', defaultValue: '/v1/admin/feedback/example/attachments/example', description: 'Authorized API-proxied attachment URL.' },
      { name: 'digest', type: 'string', defaultValue: 'sha256', description: 'Verified attachment digest.' },
    ], undefined, '@treeseed/ui/components/astro/feedback/management/PrivateAttachmentViewer.astro'),
  display('non-modal-side-sheet', 'NonModalSideSheet', 'Overlays', 'astro', 'Responsive non-modal surface that supports docked desktop and top-layer compact-screen presentation.', 'medium', { placement: 'docked-or-bottom' }, [
      { name: 'id', type: 'string', defaultValue: 'catalog-side-sheet', description: 'Unique surface id.' },
      { name: 'labelledBy', type: 'string', defaultValue: 'catalog-side-sheet-title', description: 'Accessible title id.' },
    ], undefined, '@treeseed/ui/components/astro/overlays/NonModalSideSheet.astro'),
  display('image-lightbox', 'ImageLightbox', 'Overlays', 'astro', 'Accessible expanded image review surface with bounded viewport scrolling and focus restoration.', 'large', { image: 'full-page-preview' }, [
      { name: 'id', type: 'string', defaultValue: 'catalog-image-lightbox', description: 'Unique dialog id.' },
      { name: 'title', type: 'string', defaultValue: 'Expanded image preview', description: 'Accessible preview title.' },
    ], undefined, '@treeseed/ui/components/astro/overlays/ImageLightbox.astro'),
  display('feedback-redaction-boundary', 'FeedbackRedactionBoundary', 'Feedback', 'astro', 'Marks sensitive DOM regions for feedback screenshot masking.', 'inline', { reason: 'secret' }, [
      { name: 'reason', type: 'string', defaultValue: 'secret', description: 'Redaction reason marker.' },
    ], undefined, '@treeseed/ui/components/astro/feedback/FeedbackRedactionBoundary.astro'),
  display('toast-region', 'ToastRegion', 'Feedback', 'astro', 'Global queued notification region for enhanced form outcomes and operation progress.', 'small', { placement: 'bottom-right', maximumVisible: 4 }, [
      { name: 'placement', type: "'bottom-right'", defaultValue: 'bottom-right', description: 'Responsive fixed placement above mobile navigation.' },
      { name: 'maximumVisible', type: 'number', defaultValue: 4, description: 'Maximum visible notifications before queueing.' },
    ], undefined, '@treeseed/ui/components/astro/feedback/ToastRegion.astro'),
  display('help-trigger', 'HelpTrigger', 'Help', 'astro', 'Standard contextual-help icon that opens the shell-owned dialog.', 'inline', { targetId: 'catalog-help' }, [
      { name: 'targetId', type: 'string', defaultValue: 'catalog-help', description: 'Dialog id to open.' },
      { name: 'knowledgePageId', type: 'string', defaultValue: 'questions', description: 'Published knowledge page to load when opened.' },
    ], undefined, '@treeseed/ui/components/astro/help/HelpTrigger.astro'),
  display('help-dialog', 'HelpDialog', 'Help', 'astro', 'Policy-filtered book knowledge with lazy search and related navigation.', 'large', { knowledgePages: 2, layout: 'reference-desk' }, [
      { name: 'context', type: 'HelpContext', defaultValue: { shell: 'product' }, description: 'Policy-safe help context.' },
      { name: 'id', type: 'string', defaultValue: 'catalog-help', description: 'Dialog id.' },
    ], undefined, '@treeseed/ui/components/astro/help/HelpDialog.astro'),
  display('help-article', 'HelpArticle', 'Help', 'astro', 'Sanitized knowledge article pane used by the shared help dialog.', 'medium', { page: 'questions' }, [
      { name: 'page', type: 'KnowledgeHelpPage', defaultValue: { id: 'questions' }, description: 'Authorized rendered knowledge page.' },
    ], undefined, '@treeseed/ui/components/astro/help/HelpArticle.astro'),
  display('help-knowledge-navigation', 'HelpKnowledgeNavigation', 'Help', 'astro', 'Related knowledge navigation for the shared help dialog.', 'small', { pages: 2 }, [
      { name: 'pages', type: 'KnowledgeHelpLink[]', defaultValue: [], description: 'Authorized related knowledge pages only.' },
    ], undefined, '@treeseed/ui/components/astro/help/HelpKnowledgeNavigation.astro'),
  display('help-search', 'HelpSearch', 'Help', 'astro', 'Lazy policy-scoped help search inside the shared dialog.', 'small', { scope: 'team' }, [
      { name: 'placeholder', type: 'string', defaultValue: 'Search help', description: 'Search prompt.' },
    ], undefined, '@treeseed/ui/components/astro/help/HelpSearch.astro'),
];
