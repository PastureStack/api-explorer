# Security Policy

## Supported state

Version `1.1.19` updates the build compiler and bundled runtime to Handlebars
4.7.10, including the official fixes for CVE-2026-106444, CVE-2026-106445 and
CVE-2026-106446. Server-embedded support follows the component version pinned
by the coordinated Server release and its integration gate.

## Security boundaries

- The explorer can display and submit credentials, secrets, arbitrary API fields, links, and remote error content.
- HTML templates must escape untrusted API data and must not leak authorization headers.
- Dependency and generated bundle review is required before CDN or package publication.
- Bootstrap JavaScript, generic data APIs, tooltip, popover, and button plug-ins
  are outside the supported runtime boundary and must fail release checks if
  reintroduced.
- Do not commit credentials, captured production responses, private endpoints, or generated bundles containing secrets.

## Reporting

Report suspected vulnerabilities through this repository's private security advisory channel. Do not include credentials or production API data in a public issue.
