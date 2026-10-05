import type { ComponentCatalogEntry } from './component-kind.ts';
import { display } from './component-kind.ts';

export const themeAndChartsComponents: ComponentCatalogEntry[] = [
  display('capability-unavailable', 'CapabilityUnavailable', 'Surface', 'astro', 'Truthful degraded state for unsupported capabilities.', 'medium', { title: 'Advanced monitoring unavailable' }, [{ name: 'reason', type: 'string', defaultValue: 'Unavailable', description: 'Truthful unavailability reason.' }], undefined, '@treeseed/ui/components/astro/surface/CapabilityUnavailable.astro'),
  display('local-companion-link', 'LocalCompanionLink', 'Surface', 'astro', 'Capability-aware handoff to a configured loopback companion.', 'inline', { href: 'http://127.0.0.1:4173' }, [{ name: 'href', type: 'string | undefined', defaultValue: undefined, description: 'Configured loopback companion URL.' }], undefined, '@treeseed/ui/components/astro/surface/LocalCompanionLink.astro'),
  display('card', 'Card', 'Surface', 'astro', 'Reusable content or link card.', 'medium', { tone: 'default', interactive: true }, [
      { name: 'href', type: 'string', defaultValue: undefined, description: 'Turns card into a link.' },
      { name: 'tone', type: 'Tone', defaultValue: 'default', description: 'Semantic color tone.' },
    ], undefined, '@treeseed/ui/components/astro/surface/Card.astro'),
  display('resource-card', 'ResourceCard', 'Surface', 'astro', 'Compact resource summary card.', 'medium', { title: 'Question record', status: 'recorded' }, [
      { name: 'title', type: 'string', defaultValue: 'Question record', description: 'Resource title.' },
      { name: 'status', type: 'string', defaultValue: 'recorded', description: 'Optional status badge.' },
    ], undefined, '@treeseed/ui/components/astro/surface/ResourceCard.astro'),
  display('semantic-collection-surface', 'SemanticCollectionSurface', 'Semantic surfaces', 'astro', 'Shell-free collection adapter that binds rich web cards to the shared renderer-neutral view and resource registry.', 'large', { viewId: 'projects', regionId: 'projects', items: 2 }, [
      { name: 'viewId', type: 'string', defaultValue: 'projects', description: 'Shared registry view identity.' },
      { name: 'regionId', type: 'string', defaultValue: 'projects', description: 'Collection region within the shared view.' },
      { name: 'items', type: 'SemanticCollectionItem[]', defaultValue: 2, description: 'Renderer-ready items supplied by the host application.' },
      { name: 'presentation', type: 'string', defaultValue: undefined, description: 'Optional rich renderer presentation identity.' },
    ], undefined, '@treeseed/ui/components/astro/semantic/SemanticCollectionSurface.astro'),
  display('semantic-region-surface', 'SemanticRegionSurface', 'Semantic surfaces', 'astro', 'Shell-free host for any registered semantic region and an optional rich renderer presentation.', 'large', { viewId: 'agent-builder', regionId: 'identity', presentation: 'agent-identity-form' }, [
      { name: 'viewId', type: 'string', defaultValue: 'agent-builder', description: 'Shared registry view identity.' },
      { name: 'regionId', type: 'string', defaultValue: 'identity', description: 'Region within the registered view.' },
      { name: 'presentation', type: 'string', defaultValue: 'agent-identity-form', description: 'Optional rich renderer presentation identity.' },
    ], undefined, '@treeseed/ui/components/astro/semantic/SemanticRegionSurface.astro'),
  display('empty-state', 'EmptyState', 'Surface', 'astro', 'Quiet empty state with optional actions.', 'medium', { title: 'No pending approvals', actions: 1 }, [
      { name: 'title', type: 'string', defaultValue: 'No pending approvals', description: 'Primary empty-state text.' },
      { name: 'actions', type: 'ButtonAction[]', defaultValue: 1, description: 'Optional action buttons.' },
    ], undefined, '@treeseed/ui/components/astro/surface/EmptyState.astro'),
  display('inline-confirmation', 'InlineConfirmation', 'Surface', 'astro', 'Expandable confirmation surface for consequential inline actions.', 'medium', { label: 'Remove member', tone: 'danger' }, [
      { name: 'label', type: 'string', defaultValue: 'Remove member', description: 'Confirmation disclosure label.' },
      { name: 'tone', type: "'default' | 'danger'", defaultValue: 'danger', description: 'Semantic confirmation tone.' },
    ], undefined, '@treeseed/ui/components/astro/surface/InlineConfirmation.astro'),
  display('monitoring-chart', 'MonitoringChart', 'Charts', 'react', 'Realtime monitoring line chart with synthetic polling.', 'large', { title: 'Cluster Health', pollIntervalMs: 2000, maxPoints: 180 }, [
      { name: 'pollIntervalMs', type: '1000 | 2000 | 5000 | 10000 | null', defaultValue: 2000, description: 'Polling cadence.' },
      { name: 'maxPoints', type: 'number', defaultValue: 180, description: 'Series buffer size.' },
      { name: 'snapshotEndpoint', type: 'string', defaultValue: '/api/monitoring/snapshot', description: 'Snapshot endpoint.' },
    ], { pollCount: 0, sampleCount: 0 }),
  display('panel', 'Panel', 'Surface', 'astro', 'Section panel with header, actions, and body.', 'medium', { title: 'Panel preview', tone: 'default' }, [
      { name: 'title', type: 'string', defaultValue: 'Panel preview', description: 'Panel heading.' },
      { name: 'tone', type: 'Tone', defaultValue: 'default', description: 'Semantic color tone.' },
    ], undefined, '@treeseed/ui/components/astro/surface/Panel.astro'),
  display('project-activity-chart', 'ProjectActivityChart', 'Charts', 'react', 'Realtime project activity area chart with synthetic polling.', 'large', { title: 'Project Activity', pollIntervalMs: 2000, maxEvents: 720 }, [
      { name: 'pollIntervalMs', type: '1000 | 2000 | 5000 | 10000 | null', defaultValue: 2000, description: 'Polling cadence.' },
      { name: 'maxEvents', type: 'number', defaultValue: 720, description: 'Event buffer size.' },
      { name: 'eventsEndpoint', type: 'string', defaultValue: '/api/project-activity/events', description: 'Events endpoint.' },
    ], { pollCount: 0, retainedEvents: 0 }),
  display('theme-preview-swatch', 'ThemePreviewSwatch', 'Theme', 'astro', 'Color scheme preview swatch.', 'inline', { swatches: 4 }, [
      { name: 'swatches', type: 'string[]', defaultValue: 4, description: 'Preview colors.' },
    ], undefined, '@treeseed/ui/components/astro/theme/ThemePreviewSwatch.astro'),
  display('theme-script', 'ThemeScript', 'Theme', 'astro', 'Document theme bootstrap script and optional generated theme CSS.', 'inline', { defaultScheme: 'fern', defaultMode: 'system', includeCss: false }, [
      { name: 'defaultScheme', type: 'ThemePreference["scheme"]', defaultValue: 'fern', description: 'Initial color scheme.' },
      { name: 'defaultMode', type: 'ThemePreference["mode"]', defaultValue: 'system', description: 'Initial theme mode.' },
      { name: 'includeCss', type: 'boolean', defaultValue: false, description: 'Whether to emit generated theme CSS.' },
    ], undefined, '@treeseed/ui/components/astro/theme/ThemeScript.astro'),
];
