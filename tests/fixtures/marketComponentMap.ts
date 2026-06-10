export type MarketComponentMapEntry = {
  uiPath: string;
  sourcePath: string;
  category: string;
  parityMode: 'rendered-visual';
  allowedSourceDifferences: string[];
  sandboxRoute?: string;
};

export const marketComponentMap = [
  {
    "uiPath": "src/astro/auth/AuthCard.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/auth/AuthCard.astro",
    "category": "Auth",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/auth-card"
  },
  {
    "uiPath": "src/astro/auth/AuthDivider.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/auth/AuthDivider.astro",
    "category": "Auth",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/auth-divider"
  },
  {
    "uiPath": "src/astro/auth/AuthShell.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/auth/AuthShell.astro",
    "category": "Auth",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/auth-shell"
  },
  {
    "uiPath": "src/astro/auth/ProviderButtonList.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/auth/ProviderButtonList.astro",
    "category": "Auth",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/provider-button-list"
  },
  {
    "uiPath": "src/astro/app/controls/ContentFieldHelp.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/controls/ContentFieldHelp.astro",
    "category": "App Controls",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/content-field-help"
  },
  {
    "uiPath": "src/astro/app/controls/DeleteConfirmationModal.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/controls/DeleteConfirmationModal.astro",
    "category": "App Controls",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/delete-confirmation-modal"
  },
  {
    "uiPath": "src/astro/app/controls/HostCredentialPermissionNote.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/controls/HostCredentialPermissionNote.astro",
    "category": "App Controls",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/host-credential-permission-note"
  },
  {
    "uiPath": "src/astro/app/controls/LaunchRequirementSummary.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/controls/LaunchRequirementSummary.astro",
    "category": "App Controls",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/launch-requirement-summary"
  },
  {
    "uiPath": "src/astro/app/controls/MarkdownField.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/controls/MarkdownField.astro",
    "category": "App Controls",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ]
  },
  {
    "uiPath": "src/astro/app/controls/PlainTable.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/controls/PlainTable.astro",
    "category": "App Controls",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/plain-table"
  },
  {
    "uiPath": "src/astro/app/controls/ProjectControlNav.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/controls/ProjectControlNav.astro",
    "category": "App Controls",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/project-control-nav"
  },
  {
    "uiPath": "src/astro/app/controls/RelatedContentCreator.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/controls/RelatedContentCreator.astro",
    "category": "App Controls",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/related-content-creator"
  },
  {
    "uiPath": "src/astro/app/controls/TemplateHostRequirementPicker.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/controls/TemplateHostRequirementPicker.astro",
    "category": "App Controls",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/template-host-requirement-picker"
  },
  {
    "uiPath": "src/astro/app/controls/TemplateResourceRequirementPicker.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/controls/TemplateResourceRequirementPicker.astro",
    "category": "App Controls",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/template-resource-requirement-picker"
  },
  {
    "uiPath": "src/astro/app/controls/TemplateSecretRequirementPanel.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/controls/TemplateSecretRequirementPanel.astro",
    "category": "App Controls",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/template-secret-requirement-panel"
  },
  {
    "uiPath": "src/astro/app/controls/WorkContentNav.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/controls/WorkContentNav.astro",
    "category": "App Controls",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/work-content-nav"
  },
  {
    "uiPath": "src/astro/app/operations/CapacityDiagnosticsPanel.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/operations/CapacityDiagnosticsPanel.astro",
    "category": "Operations",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/capacity-diagnostics-panel"
  },
  {
    "uiPath": "src/astro/app/operations/DeploymentTimeline.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/operations/DeploymentTimeline.astro",
    "category": "Operations",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/deployment-timeline"
  },
  {
    "uiPath": "src/astro/app/operations/GovernanceDecisionPanel.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/operations/GovernanceDecisionPanel.astro",
    "category": "Operations",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/governance-decision-panel"
  },
  {
    "uiPath": "src/astro/app/operations/GovernancePolicySummary.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/operations/GovernancePolicySummary.astro",
    "category": "Operations",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/governance-policy-summary"
  },
  {
    "uiPath": "src/astro/app/operations/KnowledgeArtifactCard.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/operations/KnowledgeArtifactCard.astro",
    "category": "Operations",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/knowledge-artifact-card"
  },
  {
    "uiPath": "src/astro/app/operations/OperationalTimeline.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/operations/OperationalTimeline.astro",
    "category": "Operations",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/operational-timeline"
  },
  {
    "uiPath": "src/astro/app/operations/RepositoryContextPanel.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/operations/RepositoryContextPanel.astro",
    "category": "Operations",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/repository-context-panel"
  },
  {
    "uiPath": "src/astro/app/operations/SeedOperationsPanel.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/operations/SeedOperationsPanel.astro",
    "category": "Operations",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/seed-operations-panel"
  },
  {
    "uiPath": "src/astro/app/operations/WorkerQueuePanel.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/operations/WorkerQueuePanel.astro",
    "category": "Operations",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/worker-queue-panel"
  },
  {
    "uiPath": "src/astro/app/sensitive/SensitiveDataUnlock.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/sensitive/SensitiveDataUnlock.astro",
    "category": "Sensitive Data",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/sensitive-data-unlock"
  },
  {
    "uiPath": "src/astro/market/ProductCard.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/market/MarketProductCard.astro",
    "category": "Market",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/product-card"
  },
  {
    "uiPath": "src/astro/layouts/AppLayout.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/layouts/TreeseedAppLayout.astro",
    "category": "Layouts",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/app-layout"
  },
  {
    "uiPath": "src/astro/layouts/PublicLayout.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/layouts/TreeseedPublicLayout.astro",
    "category": "Layouts",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/public-layout"
  },
  {
    "uiPath": "src/lib/app/deployment-action-status.ts",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/controls/deployment-action-status.ts",
    "category": "Support",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ]
  },
  {
    "uiPath": "src/lib/app/platform-operation-status.ts",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/controls/platform-operation-status.ts",
    "category": "Support",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ]
  },
  {
    "uiPath": "src/lib/app/related-content-creator.ts",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/controls/related-content-creator.ts",
    "category": "Support",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ]
  },
  {
    "uiPath": "src/lib/app/markdown-field.ts",
    "sourcePath": "/home/adrian/Projects/treeseed/market/src/components/app/controls/markdown-field.ts",
    "category": "Support",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ]
  },
  {
    "uiPath": "src/astro/data/ActionList.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/data/ActionList.astro",
    "category": "Data",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/action-list"
  },
  {
    "uiPath": "src/astro/data/Badge.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/data/Badge.astro",
    "category": "Data",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/badge"
  },
  {
    "uiPath": "src/astro/data/DataTable.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/data/DataTable.astro",
    "category": "Data",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/data-table"
  },
  {
    "uiPath": "src/astro/data/KeyValueList.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/data/KeyValueList.astro",
    "category": "Data",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/key-value-list"
  },
  {
    "uiPath": "src/astro/data/MetricCard.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/data/MetricCard.astro",
    "category": "Data",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/metric-card"
  },
  {
    "uiPath": "src/astro/data/MetricGrid.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/data/MetricGrid.astro",
    "category": "Data",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/metric-grid"
  },
  {
    "uiPath": "src/astro/data/StatusPill.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/data/StatusPill.astro",
    "category": "Data",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/status-pill"
  },
  {
    "uiPath": "src/astro/forms/Button.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/forms/Button.astro",
    "category": "Forms",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/forms/button"
  },
  {
    "uiPath": "src/astro/forms/Field.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/forms/Field.astro",
    "category": "Forms",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/forms/field"
  },
  {
    "uiPath": "src/astro/forms/FormActions.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/forms/FormActions.astro",
    "category": "Forms",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/forms/form-actions"
  },
  {
    "uiPath": "src/astro/forms/PasswordMeter.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/forms/PasswordMeter.astro",
    "category": "Forms",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/forms/password-meter"
  },
  {
    "uiPath": "src/astro/forms/RadioGroup.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/forms/RadioGroup.astro",
    "category": "Forms",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/forms/radio-group"
  },
  {
    "uiPath": "src/astro/forms/Select.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/forms/Select.astro",
    "category": "Forms",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/forms/select"
  },
  {
    "uiPath": "src/astro/forms/TextInput.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/forms/TextInput.astro",
    "category": "Forms",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/forms/text-input"
  },
  {
    "uiPath": "src/astro/forms/Textarea.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/forms/Textarea.astro",
    "category": "Forms",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/forms/textarea"
  },
  {
    "uiPath": "src/astro/forms/ContactForm.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/forms/ContactForm.astro",
    "category": "Forms",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/contact-form"
  },
  {
    "uiPath": "src/astro/forms/FooterSubscribeForm.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/forms/FooterSubscribeForm.astro",
    "category": "Forms",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/footer-subscribe-form"
  },
  {
    "uiPath": "src/astro/layout/PageHeader.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/layout/PageHeader.astro",
    "category": "Layout",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/page-header"
  },
  {
    "uiPath": "src/astro/shell/AppShell.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/AppShell.astro",
    "category": "Shell",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/app-shell"
  },
  {
    "uiPath": "src/astro/shell/BottomNav.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/BottomNav.astro",
    "category": "Shell",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/bottom-nav"
  },
  {
    "uiPath": "src/astro/shell/ProjectHeader.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/ProjectHeader.astro",
    "category": "Shell",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/project-header"
  },
  {
    "uiPath": "src/astro/shell/PublicFooter.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/PublicFooter.astro",
    "category": "Shell",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/public-footer"
  },
  {
    "uiPath": "src/astro/shell/PublicShell.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/PublicShell.astro",
    "category": "Shell",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/public-shell"
  },
  {
    "uiPath": "src/astro/shell/RailNav.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/RailNav.astro",
    "category": "Shell",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/rail-nav"
  },
  {
    "uiPath": "src/astro/shell/ShellIconLink.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/ShellIconLink.astro",
    "category": "Shell",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/shell-icon-link"
  },
  {
    "uiPath": "src/astro/shell/TopBar.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/TopBar.astro",
    "category": "Shell",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/top-bar"
  },
  {
    "uiPath": "src/astro/surface/Card.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/surface/Card.astro",
    "category": "Surface",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/card"
  },
  {
    "uiPath": "src/astro/surface/EmptyState.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/surface/EmptyState.astro",
    "category": "Surface",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/empty-state"
  },
  {
    "uiPath": "src/astro/surface/Panel.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/surface/Panel.astro",
    "category": "Surface",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/panel"
  },
  {
    "uiPath": "src/astro/theme/ThemeMenu.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/theme/ThemeMenu.astro",
    "category": "Theme",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/forms/theme-menu"
  },
  {
    "uiPath": "src/astro/theme/ThemePreviewSwatch.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/theme/ThemePreviewSwatch.astro",
    "category": "Theme",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/theme-preview-swatch"
  },
  {
    "uiPath": "src/astro/theme/ThemeScript.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/theme/ThemeScript.astro",
    "category": "Theme",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ]
  },
  {
    "uiPath": "src/astro/theme/ThemeSelector.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/theme/ThemeSelector.astro",
    "category": "Theme",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/forms/theme-selector"
  },
  {
    "uiPath": "src/astro/core/DevWatchReload.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/DevWatchReload.astro",
    "category": "Core",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/dev-watch-reload"
  },
  {
    "uiPath": "src/astro/core/SiteTitle.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/SiteTitle.astro",
    "category": "Core",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/site-title"
  },
  {
    "uiPath": "src/astro/content/ContentStatusLegend.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/content/ContentStatusLegend.astro",
    "category": "Content",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/content-status-legend"
  },
  {
    "uiPath": "src/astro/content/StatusBadge.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/content/StatusBadge.astro",
    "category": "Content",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/status-badge"
  },
  {
    "uiPath": "src/astro/docs/BookFontControls.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/docs/BookFontControls.astro",
    "category": "Docs",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/book-font-controls"
  },
  {
    "uiPath": "src/astro/docs/DesktopSidebarToggle.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/docs/DesktopSidebarToggle.astro",
    "category": "Docs",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/desktop-sidebar-toggle"
  },
  {
    "uiPath": "src/astro/docs/DownloadBook.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/docs/DownloadBook.astro",
    "category": "Docs",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/download-book"
  },
  {
    "uiPath": "src/astro/docs/Footer.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/docs/Footer.astro",
    "category": "Docs",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/footer"
  },
  {
    "uiPath": "src/astro/docs/Header.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/docs/Header.astro",
    "category": "Docs",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/header"
  },
  {
    "uiPath": "src/astro/docs/PageFrame.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/docs/PageFrame.astro",
    "category": "Docs",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/page-frame"
  },
  {
    "uiPath": "src/astro/docs/PageSidebar.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/docs/PageSidebar.astro",
    "category": "Docs",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/page-sidebar"
  },
  {
    "uiPath": "src/astro/docs/PageTitle.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/docs/PageTitle.astro",
    "category": "Docs",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/page-title"
  },
  {
    "uiPath": "src/astro/docs/Sidebar.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/docs/Sidebar.astro",
    "category": "Docs",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/sidebar"
  },
  {
    "uiPath": "src/astro/docs/ThemeSelect.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/docs/ThemeSelect.astro",
    "category": "Docs",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/theme-select"
  },
  {
    "uiPath": "src/astro/site/BookList.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/site/BookList.astro",
    "category": "Site",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/book-list"
  },
  {
    "uiPath": "src/astro/site/CTASection.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/site/CTASection.astro",
    "category": "Site",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/ctasection"
  },
  {
    "uiPath": "src/astro/site/ChronicleList.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/site/ChronicleList.astro",
    "category": "Site",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/chronicle-list"
  },
  {
    "uiPath": "src/astro/site/Hero.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/site/Hero.astro",
    "category": "Site",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/hero"
  },
  {
    "uiPath": "src/astro/site/NotesList.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/site/NotesList.astro",
    "category": "Site",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/notes-list"
  },
  {
    "uiPath": "src/astro/site/PathCard.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/site/PathCard.astro",
    "category": "Site",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/path-card"
  },
  {
    "uiPath": "src/astro/site/ProfileList.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/site/ProfileList.astro",
    "category": "Site",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/profile-list"
  },
  {
    "uiPath": "src/astro/site/PublishedContentBody.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/site/PublishedContentBody.astro",
    "category": "Site",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/published-content-body"
  },
  {
    "uiPath": "src/astro/site/RouteNotFound.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/site/RouteNotFound.astro",
    "category": "Site",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/route-not-found"
  },
  {
    "uiPath": "src/astro/site/SectionIntro.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/site/SectionIntro.astro",
    "category": "Site",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/section-intro"
  },
  {
    "uiPath": "src/astro/site/StageBanner.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/site/StageBanner.astro",
    "category": "Site",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/stage-banner"
  },
  {
    "uiPath": "src/astro/site/TrustCallout.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/components/site/TrustCallout.astro",
    "category": "Site",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/trust-callout"
  },
  {
    "uiPath": "src/astro/layouts/AuthoredEntryLayout.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/layouts/AuthoredEntryLayout.astro",
    "category": "Layouts",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/authored-entry-layout"
  },
  {
    "uiPath": "src/astro/layouts/BookLayout.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/layouts/BookLayout.astro",
    "category": "Layouts",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/book-layout"
  },
  {
    "uiPath": "src/astro/layouts/BridgeLayout.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/layouts/BridgeLayout.astro",
    "category": "Layouts",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/bridge-layout"
  },
  {
    "uiPath": "src/astro/layouts/ContentLayout.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/layouts/ContentLayout.astro",
    "category": "Layouts",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/content-layout"
  },
  {
    "uiPath": "src/astro/layouts/MainLayout.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/layouts/MainLayout.astro",
    "category": "Layouts",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/main-layout"
  },
  {
    "uiPath": "src/astro/layouts/NoteLayout.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/layouts/NoteLayout.astro",
    "category": "Layouts",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/note-layout"
  },
  {
    "uiPath": "src/astro/layouts/ProfileLayout.astro",
    "sourcePath": "/home/adrian/Projects/treeseed/market/packages/core/src/layouts/ProfileLayout.astro",
    "category": "Layouts",
    "parityMode": "rendered-visual",
    "allowedSourceDifferences": [
      "import-paths",
      "package-safe-types",
      "structural-props",
      "route-base-props",
      "generic-component-names"
    ],
    "sandboxRoute": "/displays/profile-layout"
  }
] as const satisfies readonly MarketComponentMapEntry[];

export const libraryNativeComponents = [
  'src/react/editors/RichMarkdownEditor.tsx',
  'src/react/charts/MonitoringChart.tsx',
  'src/react/charts/ProjectActivityChart.tsx',
  'src/react/pie-allocation/DynamicPieAllocationInput.tsx',
  'src/react/form-controls/CheckboxField.tsx',
  'src/react/form-controls/SelectField.tsx',
  'src/react/form-controls/TextField.tsx',
] as const;
