# PastureStack API Explorer

API Explorer is an embeddable browser interface for services that implement the preserved API schema and HTML discovery contract.

PastureStack is an independent community effort to preserve, audit, and modernize the Rancher 1.6 ecosystem. It is not affiliated with or endorsed by Rancher Labs or SUSE.

**Upstream:** [`rancher/api-ui`](https://github.com/rancher/api-ui). This GitHub fork preserves upstream history, authorship, dates, tags, licenses, and dependency notices. The migration baseline is consolidated immediately after the preserved upstream boundary; later maintenance remains visible as ordinary reviewable commits.

## Project status

This maintained compatibility release is based on the latest reviewed upstream `master`, including current Node and dependency maintenance. Package metadata, visible branding, and repository links use PastureStack naming. Existing API schema fields and discovery behavior remain compatible.

The current public release is [`v1.1.20`](https://github.com/PastureStack/api-explorer/releases/tag/v1.1.20).
Version `1.1.21` is the responsive request-form candidate on this branch.
Inputs follow the available column width, narrow dialogs stack values below
their labels, and long forms scroll inside the dialog while actions remain
reachable. Password fields preserve their exact values and remain masked.

The explorer is supported as a Server-embedded compatibility interface. Use the
[Server installation documentation](https://github.com/PastureStack/server#readme)
for the released Server and its exact component pins. Source changes do not
replace an existing immutable release.

## Build locally

Requires Node.js 24.22.3 LTS and npm 12.0.2.

```sh
npm ci --no-audit --no-fund
npm run ci
```

The tracked npm lockfile is the executable dependency contract. The CI command runs security and product tests and compares two complete builds byte for byte. The build emits a deterministic `dist/1.1.21.tar.gz`: file order, modes, ownership, timestamps, and the gzip header are normalized from the source commit. Source maps are excluded from the embedded release artifact. The security release gate retains the tested archive, SBOM, scans and SHA256SUMS for publication without rebuilding.

Handlebars 4.7.10 supplies the official fixes for CVE-2026-106444,
CVE-2026-106445 and CVE-2026-106446. Templates and partials are compiled from
tracked source during the build; only the runtime and precompiled templates
are shipped to the browser. See the [upstream security release](https://github.com/handlebars-lang/handlebars.js/releases/tag/v4.7.10).

Bootstrap JavaScript is not shipped. The artifact uses reviewed, attributed
Bootstrap 5.3.8 CSS and Bootstrap Icons 1.13.1, plus a small first-party modal
and dropdown compatibility layer. See
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for provenance and terms.

Set `window.pasturestackLocale` to `en-US` or `zh-TW` before loading the bundle, or use the built-in language selector. API resources, field names, enum values, identifiers, and remote errors are not translated. See [COMPATIBILITY.md](COMPATIBILITY.md), [SECURITY.md](SECURITY.md), and [ORIGIN.md](ORIGIN.md).

## License and attribution

The inherited project remains licensed under [Apache License 2.0](LICENSE.txt). Copyright and attribution for inherited work and bundled dependencies remain with their respective authors and contributors. PastureStack contributors claim authorship only for their own changes.
