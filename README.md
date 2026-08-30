# PastureStack API Explorer

API Explorer is an embeddable browser interface for services that implement the preserved API schema and HTML discovery contract.

PastureStack is an independent community effort to preserve, audit, and modernize the Rancher 1.6 ecosystem. It is not affiliated with or endorsed by Rancher Labs or SUSE.

**Upstream:** [`rancher/api-ui`](https://github.com/rancher/api-ui). This GitHub fork preserves upstream history, authorship, dates, tags, licenses, and dependency notices. The migration baseline is consolidated immediately after the preserved upstream boundary; later maintenance remains visible as ordinary reviewable commits.

## Project status

This maintained compatibility release is based on the latest reviewed upstream `master`, including current Node and dependency maintenance. Package metadata, visible branding, and repository links use PastureStack naming. Existing API schema fields and discovery behavior remain compatible.

The Server currently consumes the immutable `v1.1.17` release artifact. Version `1.1.18` is the reviewed dependency-refresh candidate and does not become the Server default until the coordinated embedded-server test passes. This repository does not publish a standalone CDN or npm package, and the explorer is supported only as a Server-embedded compatibility interface.

## Build locally

Requires Node.js 24.20.0 LTS and npm 12.0.2.

```sh
npm ci --no-audit --no-fund
npm run test:security
npm run ci
npm run build
```

The tracked npm lockfile is the executable dependency contract. The build emits a deterministic `dist/1.1.18.tar.gz`: file order, modes, ownership, timestamps, and the gzip header are normalized from the source commit. Source maps are excluded from the embedded release artifact.

Bootstrap JavaScript is not shipped. The artifact uses reviewed, attributed
Bootstrap 5.3.8 CSS and Bootstrap Icons 1.13.1, plus a small first-party modal
and dropdown compatibility layer. See
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for provenance and terms.

Set `window.pasturestackLocale` to `en-US` or `zh-TW` before loading the bundle, or use the built-in language selector. API resources, field names, enum values, identifiers, and remote errors are not translated. See [COMPATIBILITY.md](COMPATIBILITY.md), [SECURITY.md](SECURITY.md), and [ORIGIN.md](ORIGIN.md).

## License and attribution

The inherited project remains licensed under [Apache License 2.0](LICENSE.txt). Copyright and attribution for inherited work and bundled dependencies remain with their respective authors and contributors. PastureStack contributors claim authorship only for their own changes.
