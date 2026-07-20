# Compatibility Contract

API Explorer preserves schema discovery, resource links, collection and action forms, pagination, filtering, authentication handling, HTML embedding, and template data expected by compatible APIs.

Visible product naming and package ownership use PastureStack. Historical API resource names, schema fields, enum values, response links, and compatibility CSS hooks remain unchanged where supplied by or coupled to the remote API.

The Server packaging contract consumes the `1.1.15` static archive and exposes its `ui.min.js` and `ui.min.css` files below `/api-ui/`. Archive layout or entry-file changes require a coordinated embedded-server test.

The release keeps the reviewed Bootstrap 3.4.1 CSS and font layout contract as
static, attributed assets. It does not load Bootstrap JavaScript. A small
PastureStack-owned compatibility layer implements only the modal and filter
dropdown behavior used by this explorer. Native `title` text provides field
help; executable tooltip, popover, button, and generic Bootstrap data APIs are
not part of the artifact.

Before release, validate read-only and mutating resources, actions, pagination, filters, authentication failures, HTML embedding, escaping, cross-origin behavior, and `en-US`/`zh-TW` selection against an isolated compatible server.
