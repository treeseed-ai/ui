# TreeSeed Cordis UI

## Task 3C contract

Owner issue: https://github.com/treeseed-ai/ui/issues/80. Follow the approved Platform Task 3C service/provider/UI plan through exact public archives. Preserve independent repository ownership, strict TypeScript classes, native Cordis lifecycle, historical formats and all seven SDK operations. Expected-generation/idempotency, resource/credential/TLS retention and explicit unsafe restart/migration gates are mandatory. All issues remain open until release.

Every visual component must be mobile-first from 320 CSS pixels to widescreen monitors; test 320/375/768/1024/1440/1920/2560 widths, long content, keyboard/touch and 200% text resizing. Keep authored controls at least 44×44 CSS pixels, required actions visible, logical/fluid dimensions and no page overflow (labeled local semantic-table overflow is permitted). UI owns components/styles/renderers; consumers retain domain behavior and Identity retains Keycloak authority.

Public exports: `./contracts` (renderer-neutral models/actions/tokens), `./react` (pure React TSX class components), `./browser` (native Cordis root + React DOM mount/hydration), `./server` (escaped React SSR) and `./terminal` (plain/non-TTY presentation). No Astro implementation or domain/auth initialization ships in reusable components. Astro is a consumer of the React archive with one qualified island per page; server/browser scopes are separate and bootstrap data contains no functions, service instances or tokens. Host adapters create authorized actions locally. Keycloak stays Identity-owned; UI receives safe principal projections, never server credentials.

Initial components: text, status, table, form, navigation, feedback. Component/provider identities are extensible, not a closed enum. Same-contract alternatives, real default roots, actual browser/SSR/terminal programs, Astro hydration, all responsive widths and awaited disposal qualify substitution. Native mobile/Electron applications remain future platform qualification; mobile web is required now.

`UiServerRenderer.styles()` returns the exact UI-owned stylesheet path, digest and bytes for the consuming host to serve. Rendered pages reference that immutable same-origin stylesheet; no unsafe-inline CSP relaxation is required. Browser mounts hold native provider leases through React root cleanup. Hydration starts with matching markup and enables actions only after local bootstrap validation.

Renderer implementations are native selected services (`ui.renderer.server`, `ui.renderer.browser`, `ui.renderer.terminal`) behind public class facades. A typed `ui.presentation` collection projects explicitly selected component/theme bindings through the SDK locator, without caching provider instances or starting a second dependency graph. `identity()` on server/terminal facades reports the selected renderer ID and generation. Browser roots retain the selected renderer lease and component/theme leases until awaited cleanup. Renderer alternatives use the same contract suite; no caller chooses a concrete implementation.

Presentation generation hashes the selected component/theme projection independently of target-specific renderer services. SSR and browser hydration compare this shared presentation generation and asset generation; each native root still records its own full generation. Hydration transports only validated model/action/generation data. A host never treats the different server/browser renderer roots as the same runtime generation.

Astro hosts use `./island` to prepare a native presentation scope before invoking the pinned React integration's server/client renderer. The host directly imports the UI island marker; its renderer adapter passes a prepared React class to the upstream integration, while Astro serializes only the original validated bootstrap. Preparation happens separately per server render and browser island. The upstream integration owns the React root; the adapter owns and awaits the prepared scope's disposal after SSR or the upstream `astro:unmount` callback. No provider instances or server principal objects cross hydration. UI supplies the bound class and all visual markup; adapter code only coordinates lifecycle. Client admission verifies presentation, asset and action identities before the upstream hydration call. This respects Astro's requirement that hydrated components be directly imported ([Astro directives](https://docs.astro.build/en/reference/directives-reference/)).

The pinned Astro React server renderer strips resource links from island markup. Astro hosts therefore serve the exact UI stylesheet in the page head; the UI island omits its own link on both SSR and initial hydration. The UI-owned surface enables actions only after the expected same-origin head stylesheet has loaded. Standalone roots retain their own stylesheet link and cleanup ownership. A missing stylesheet leaves the island non-interactive.

Consumers run `UiSourcePolicy.check(root)` from `./source-policy` in their owner check script. The semantic TypeScript gate permits domain view-model/action classes and UI component imports, but rejects consumer JSX intrinsic markup, DOM construction/HTML sinks, CSS imports, inline HTML strings, direct React DOM renderer imports and Astro component implementations. UI owns rendering and styling. Non-UI owners retain explicit document-envelope/HTTP adapters with no presentation markup: those adapters serve UI-produced assets and escaped renderer output. Negative fixtures exercise aliases, text/style mutations, templates and sinks; matching a token or an import alone is not evidence of UI reuse.

`RenderedPage.contribution` is the validated `UiContribution` identity: contribution/component IDs, selected native provider ID, the SHA-256 of its actual model-schema projection, and the exact theme stylesheet digest. Hydration includes that identity alongside the view, presentation generation, accepted asset generation and admitted action IDs. Server/browser render preparation recomputes the model-schema/provider/style binding; a copied generation cannot authorize a different component/schema/theme. Schema projections come from the same class-owned schema used by `validate`, never a second hand-maintained declaration.

### SDK candidate and development-only source checking

UI consumes the exact SDK 0.0.0-cordis.7 archive from its reviewed native composition stack.
The package records source commit and archive SHA-256; installation uses a refreshed frozen
lock and no lifecycle scripts. TypeScript is an optional peer for the development-only
`/source-policy` export. UI rendering and installed runtime closures do not require the
compiler; owners using that development export install the pinned TypeScript dev dependency.

### Installable UI provider metadata

The package build emits `cordisPackage` format 4 through SDK `PackageDefinition`, directly
from all eleven exported native class declarations, Config schemas and replacement policies.
Each descriptor binds its named class export and package entry. Default components, theme
and renderers declare restart policy; metadata alone does not qualify a live swap or bypass
host plan/apply admission. UI's portable presentation scope is separate from CLI/API host
authority and never carries sessions, cookies, tokens or a Keycloak adapter.

The same build writes the immutable default stylesheet into `dist/assets` and inventories
its exact SHA-256. Runtime rendering still supplies this class-owned stylesheet through the
public style contract. Browser assets remain closed over the accepted composition; a new
package does not execute in an existing browser simply because it was downloaded. Hosts
must bind the exact asset/contribution generation before admitting actions.

`bun run check` recomputes the metadata projection from source and rejects drift before a
build can rewrite it. The owner regression runs that command in an isolated source copy with
a changed class export, preserving the working checkout while proving stale metadata fails.

### Current SDK adoption

This candidate adopts SDK .9 through the
vendored archive from source `85a7b6036c9a390a5c56b9db419fc5b6f8f8cd77`, SHA-256
`80337c6ad9cb4f493fa06ed9a22e3863ae41610cc1027817bd54c1eece3954d3`.

All default UI composition roots derive their bundled artifact label from
`UiPackageIdentity.artifact`, retaining one current owner version across server, terminal,
browser and Astro roots. Release consumers bind their accepted exact archive identity through
`artifactIdentity`. A build check rejects package-version/default-label drift.

### Reusable composite views

`StackComponentPlugin` supplies the mobile-first `stack` view with `{title?,children}`.
Children are ordinary typed views, including other composites; a component provider can expose
`children(model)` for the shared render tree. Server and terminal renderers resolve every node
through native selected providers, validate every model, retain leases through rendering and
release them together. Views contain no markup, CSS, component constructors or callbacks.
Duplicate view IDs, excessive depth/count, missing components and invalid child models fail
before output. Contribution identities include every selected child/schema/style identity.
The layout uses the shared one-column mobile grid, expanding only at wider breakpoints.
This first composite slice qualifies server/terminal output; browser/Astro composite hydration
follows as a dependent candidate and remains required before consumer adoption.

The isolated drift regression runs two real compiler checks, each bounded at 30 seconds;
its outer test budget is 65 seconds so a slower CI host can complete both checks.

Composite views now use the same lease-retained tree in browser and Astro rendering. Standalone
`UiBrowserApplication.hydrate(target, bootstrap, host, configuration?)` validates the complete
initial view, child contributions, presentation/style/asset generations and admitted action IDs
inside the actual renderer scope before creating its React root. Passing `hydrate=true` without
an accepted bootstrap is refused. Astro retains its one-island host-owned React root and
observes awaited tree/scope disposal. The real browser matrix includes nested layout content;
a packed-archive Astro fixture hydrates a composed form without a second React root.

### Complete reusable document boundary

`UiServerRenderer.document({title,view,script,assetGeneration,actionIds,language?})` renders the
complete mobile-first HTML document: charset, viewport, escaped title, one UI root, inert
validated bootstrap and one same-origin digest-addressed module with SHA-256 integrity.
`script` is `{path,sha256}`; its path must contain that exact digest. Domain owners supply
models, action IDs and accepted asset identity; they do not generate markup or bootstrap tags.
`UiBrowserApplication.hydrateDocument(host, configuration?)` reads and validates this fixed UI
boundary before mounting. Host adapters retain authentication, requests, routing and navigation.

Forms may include `actionData`, a bounded string map of public action context (for example an
anti-CSRF nonce). These fields are validated model data, never credentials or bearer tokens.
Visible field IDs cannot override them; the action adapter receives both context and submitted
fields. Reusable components still contain no domain endpoints or identity implementation.

The consumer presentation gate distinguishes DOM document writes from ordinary native stream
or class writes. Direct and aliased document writes remain prohibited, including computed
`document['write']` calls; CLI stdout/stderr and non-DOM typed writers remain valid consumer
transport behavior. This is checked against both refusal and permitted-stream examples.

The current owner candidate adopts SDK `.10`, source
`32aea4a7be9ccde3a06dd8552020ab1042cc694d`, archive SHA-256
`a94dfd38f1d4bae09b211f1517cddb620bb5bbbb3a6afa46cfa9c8e857242393`.
This keeps API/Identity/UI assembly on one exact SDK version while retaining the same public
presentation contracts and real browser/Astro qualification.

### Updating data inside an accepted presentation

`UiMount.view()` returns a validated clone of the current model. `UiMount.update(view)`
validates and prepares a complete tree in the same accepted provider/asset generation, commits
the React update and releases superseded native leases. The component provider returns its stable class through `type()` (class data rather than a
leased callable property). Stable component/view IDs preserve
focus and uncontrolled form input. Invalid or concurrent updates cannot replace the current
view. Updates do not select providers, activate new assets or create a new React root.
Disposal closes action admission and awaits accepted action/update completion before unmount
and provider cleanup; domain transports remain responsible for their cancellation policy.
