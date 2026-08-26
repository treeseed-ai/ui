import type { ComponentCatalogEntry } from '../support/component-kind.ts';
import { display } from '../support/component-kind.ts';

export const authAndSensitiveDataComponents: ComponentCatalogEntry[] = [
  display('oauth-consent', 'OAuthConsent', 'Auth', 'astro', 'Validated OAuth client, redirect, and scope review surface.', 'medium', { clientName: 'TreeSeed Admin', scopes: ['treeseed:read'] }, [], undefined, '@treeseed/ui/components/astro/auth/OAuthConsent.astro'),
  display('device-approval', 'DeviceApproval', 'Auth', 'astro', 'Authenticated CLI device-code approval state.', 'medium', { userCode: 'ABCD-EFGH', approved: false }, [], undefined, '@treeseed/ui/components/astro/auth/DeviceApproval.astro'),
  display('confirmation-result', 'ConfirmationResult', 'Auth', 'astro', 'One-use email confirmation result state.', 'medium', { status: 'confirmed', message: 'Email confirmed.' }, [], undefined, '@treeseed/ui/components/astro/auth/ConfirmationResult.astro'),
  display('session-state', 'SessionState', 'Auth', 'astro', 'Accessible browser session status.', 'inline', { state: 'authenticated' }, [], undefined, '@treeseed/ui/components/astro/auth/SessionState.astro'),
  display('auth-card', 'AuthCard', 'Auth', 'astro', 'Reusable AuthCard component copied into the TreeSeed UI library.', 'medium', { source: 'Auth' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/auth/AuthCard.astro'),
  display('auth-divider', 'AuthDivider', 'Auth', 'astro', 'Reusable AuthDivider component copied into the TreeSeed UI library.', 'medium', { source: 'Auth' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/auth/AuthDivider.astro'),
  display('auth-shell', 'AuthShell', 'Auth', 'astro', 'Reusable AuthShell component copied into the TreeSeed UI library.', 'full-page', { source: 'Auth' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/auth/AuthShell.astro'),
  display('provider-button-list', 'ProviderButtonList', 'Auth', 'astro', 'Reusable ProviderButtonList component copied into the TreeSeed UI library.', 'medium', { source: 'Auth' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/auth/ProviderButtonList.astro'),
  display('account-deletion-panel', 'AccountDeletionPanel', 'Account', 'astro', 'Account deletion confirmation and consequence summary panel.', 'large', { source: 'Account' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Account deletion policy and confirmation props.' },
    ], undefined, '@treeseed/ui/components/astro/account/AccountDeletionPanel.astro'),
  display('account-identity-settings', 'AccountIdentitySettings', 'Account', 'astro', 'Account identity and profile settings panel.', 'large', { source: 'Account' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Account identity settings props.' },
    ], undefined, '@treeseed/ui/components/astro/account/AccountIdentitySettings.astro'),
  display('account-time-zone-settings', 'AccountTimeZoneSettings', 'Account', 'astro', 'Account time-zone selection used by application timestamp displays.', 'large', { source: 'Account' }, [
      { name: 'timeZone', type: 'string', defaultValue: 'UTC', description: 'Selected IANA time-zone identifier.' },
    ], undefined, '@treeseed/ui/components/astro/account/AccountTimeZoneSettings.astro'),
  display('realtime-experience-settings', 'RealtimeExperienceSettings', 'Account', 'astro', 'Account-synced live-update and polling-cadence settings.', 'large', { enabled: true, intervalSeconds: 5 }, [
      { name: 'enabled', type: 'boolean', defaultValue: true, description: 'Whether authenticated operational surfaces update in the background.' },
      { name: 'intervalSeconds', type: '2 | 5 | 15 | 30', defaultValue: 5, description: 'Base cadence used by active monitoring resources.' },
    ], undefined, '@treeseed/ui/components/astro/account/RealtimeExperienceSettings.astro'),
  display('notification-preference-panel', 'NotificationPreferencePanel', 'Account', 'astro', 'Account notification preference controls and state.', 'large', { source: 'Account' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Notification preference props.' },
    ], undefined, '@treeseed/ui/components/astro/account/NotificationPreferencePanel.astro'),
  display('personal-theme-manager', 'PersonalThemeManager', 'Account', 'astro', 'Personal color-scheme and appearance management panel.', 'large', { source: 'Account' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Personal theme configuration props.' },
    ], undefined, '@treeseed/ui/components/astro/account/PersonalThemeManager.astro'),
  display('session-manager', 'SessionManager', 'Account', 'astro', 'Active account session inventory and revocation controls.', 'large', { source: 'Account' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Session inventory and action props.' },
    ], undefined, '@treeseed/ui/components/astro/account/SessionManager.astro'),
  display('registration-form', 'RegistrationForm', 'Auth', 'astro', 'Account registration form and validation surface.', 'medium', { source: 'Auth' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Registration form configuration props.' },
    ], undefined, '@treeseed/ui/components/astro/auth/RegistrationForm.astro'),
  display('username-claim-form', 'UsernameClaimForm', 'Auth', 'astro', 'Username claim form and availability feedback surface.', 'medium', { source: 'Auth' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Username claim configuration props.' },
    ], undefined, '@treeseed/ui/components/astro/auth/UsernameClaimForm.astro'),
  display('accessible-dialog', 'AccessibleDialog', 'Overlays', 'astro', 'Accessible modal dialog shell with labelled content and actions.', 'medium', { source: 'Overlays' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Dialog identity, label, state, and action props.' },
    ], undefined, '@treeseed/ui/components/astro/overlays/AccessibleDialog.astro'),
];
