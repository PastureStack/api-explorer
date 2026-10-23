# Compatibility Contract

API Explorer preserves schema discovery, resource links, collection and action forms, pagination, filtering, authentication handling, HTML embedding, and template data expected by compatible APIs.

Visible product naming and package ownership use PastureStack. Historical API resource names, schema fields, enum values, response links, and compatibility CSS hooks remain unchanged where supplied by or coupled to the remote API.

Version `1.1.20` preserves the static archive layout, including `ui.min.js`,
`ui.min.css`, fonts, licenses and `version.json`, consumed by Server below
`/api-ui/`. Server pins its own reviewed component version; changing that pin
requires a coordinated embedded-server test.

The release keeps the reviewed Bootstrap 5.3.8 CSS and Bootstrap Icons 1.13.1 as
static, attributed assets. It does not load Bootstrap JavaScript. A small
PastureStack-owned compatibility layer implements only the modal and filter
dropdown behavior used by this explorer. Native `title` text provides field
help; executable tooltip, popover, button, and generic Bootstrap data APIs are
not part of the artifact.

Handlebars 4.7.10 precompiles tracked template and partial strings during the
build. The browser receives the runtime only; API input never enters a template
compiler. Official CVE regressions, precompiled partials, escaped API text and
both locales are checked without changing remote field or error values.

Before release, validate read-only and mutating resources, actions, pagination, filters, authentication failures, HTML embedding, escaping, cross-origin behavior, and `en-US`/`zh-TW` selection against an isolated compatible server.
