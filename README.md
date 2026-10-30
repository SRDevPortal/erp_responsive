# ERP Responsive

Independent responsive Frappe Desk layouts. No business rules, field permissions,
list queries, checkout behavior, or telephony actions are changed.

## Settings

Open /app/erp-responsive-settings (search: ERP Responsive Settings).
System Managers can save Enable Responsive Layout to enable or disable the
app-wide enhancements. Enabled by default. Saved changes update connected Desk
tabs via realtime; reload disconnected tabs to obtain the new setting.

Disabling restores the underlying apps' layouts, not a non-responsive desktop
layout: Frappe and other installed apps may already have their own mobile CSS.

## Coverage

All standard DocType List and Form routes and all Workspaces use the shared
mobile layout. Standard lists scroll horizontally below 992px; filters can be
expanded on mobile. Calendar, Kanban, and reports do not use the list slider.
On phones, standard child tables use labelled row cards with full-width row editors;
tabs remain scrollable. Desktop child tables retain their original spreadsheet layout.
Mobile and tablet page headers stay pinned directly below the navigation bar
during scrolling; desktop header behavior remains native.
Larger buttons, wrapped actions,
and single-column fields improve phone layouts.

Vobiz Agent Console and Analytics receive scoped layout fixes too. Vobiz System
Call extends the Agent Console; its existing calling behavior is unchanged.
No outbound calls are made by this app.
Console Details appears directly after the record ID; readable queue columns
scroll internally. Phone/tablet workdesks fit the viewport, phone sections use a
selector, and mobile filters open in a contained sheet. These enhancements follow
the same responsive setting and restore the native column order when disabled.

Vobiz AI, WhatsApp, Vobiz Click To Call, Frappe CRM, Healthcare and Home
have mobile shortcut cards. Long workspace link groups can expand/collapse on
phones; desktop links stay visible. Standard forms without native tabs gain a
section selector when they have at least three named visible sections.
The selector uses existing permitted sections and never changes document values.

WhatsApp inbox/thread/contact/template layouts, call analytics controls,
patient history/progress filters, chart containment, and the leaderboard have
scoped mobile refinements. The separate /crm Vue portal retains its own layout.
A reversible Frappe Charts rendering guard discards stale detached SVG references
before native redraws, preventing the observed rapid-resize error; chart data and
calculations are unchanged. The guard is inactive when the setting is disabled.

## Installation

    bench --site <site> install-app erp_responsive
    bench --site <site> migrate
    bench build --app erp_responsive
    bench --site <site> clear-cache

After upgrading, migrate to create ERP Responsive Settings, then hard-refresh
existing Desk tabs. No dependency on sriaas_clinic is required.

## Verification

Backend tests: erp_responsive.tests.test_settings.
See docs/responsive-audit.md and docs/agent-console-mobile-audit.md for local browser coverage and limitations.
