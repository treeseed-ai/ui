# TreeSeed Cordis UI

## Task 3C contract

Owner issue: https://github.com/treeseed-ai/ui/issues/80. Follow the approved Platform Task 3C service/provider/UI plan through exact public archives. Preserve independent repository ownership, strict TypeScript classes, native Cordis lifecycle, historical formats and all seven SDK operations. Expected-generation/idempotency, resource/credential/TLS retention and explicit unsafe restart/migration gates are mandatory. All issues remain open until release.

Every visual component must be mobile-first from 320 CSS pixels to widescreen monitors; test 320/375/768/1024/1440/1920/2560 widths, long content, keyboard/touch and 200% text resizing. Keep authored controls at least 44×44 CSS pixels, required actions visible, logical/fluid dimensions and no page overflow (labeled local semantic-table overflow is permitted). UI owns components/styles/renderers; consumers retain domain behavior and Identity retains Keycloak authority.

Public exports: `./contracts` (renderer-neutral models/actions/tokens), `./react` (pure React TSX class components), `./browser` (native Cordis root + React DOM mount/hydration), `./server` (escaped React SSR) and `./terminal` (plain/non-TTY presentation). No Astro implementation or domain/auth initialization ships in reusable components. Astro is a consumer of the React archive with one qualified island per page; server/browser scopes are separate and bootstrap data contains no functions, service instances or tokens. Host adapters create authorized actions locally. Keycloak stays Identity-owned; UI receives safe principal projections, never server credentials.

Initial components: text, status, table, form, navigation, feedback. Component/provider identities are extensible, not a closed enum. Same-contract alternatives, real default roots, actual browser/SSR/terminal programs, Astro hydration, all responsive widths and awaited disposal qualify substitution. Native mobile/Electron applications remain future platform qualification; mobile web is required now.
