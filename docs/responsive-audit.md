# Responsive audit — 29 October 2026

App: ERP Responsive. Local site: site1.local. Browser: headless Chromium.
All implementation changes are in erp_responsive.

## Scope and outcome

112 viewport checks across 41 screens: 35 list/form/workspace/custom-page
screens at 320px and 390px, 18 principal screens at 768px and 1440px, plus
six unsaved Vobiz forms at 320px. The settings screen was tested separately.
Final viewport runs reported no page-wide overflow or JavaScript page errors.
This does not assert that every installed DocType or every role was exercised.

1. Patient and CRM Lead lists/forms: passed phone layout, collapsed filters,
   keyboard horizontal scrolling, row selection, tab navigation, timeline wrapping.
2. Patient Encounter: passed list/form layout and tab navigation. Long action
   menu was corrected and verified to stay within the 320px viewport.
3. Sales Invoice: passed list/form layout, tab navigation, action menu, and
   horizontal scrolling to the last child-table column. Footer buttons wrap
   between controls without splitting short labels.
4. Vobiz AI: inspected settings, call logs, error logs, voice profiles, account
   mappings, routing groups/routes, and webhook events. Empty tables and six
   unsaved create forms were also inspected.
5. Vobiz Click To Call/System Call: inspected settings, user/incoming mappings,
   attendance logs, blocked numbers, shared Agent Console, browser softphone UI,
   and Analytics. Console encounter tab and queue-table scrolling passed.
6. Home, Healthcare, Frappe CRM, Vobiz AI, Vobiz Click To Call workspaces:
   inspected mobile cards, links, and navigation; Healthcare chart recaptured
   after loading finished.
7. ERP Responsive Settings: disabling and enabling via the Save button updated
   another connected Desk tab and persisted across reloads. Restored enabled.
   Three backend tests passed: saved values in boot, first-use default enabled,
   and Guest denied write access.

## Changes

- Shared styling now covers standard DocType lists/forms and workspaces.
- Responsive Vobiz console and analytics layout adjustments are explicitly scoped.
- Mobile filters expand/collapse, leaving record rows visible initially.
- Lists, tabs, and child tables scroll within their containers.
- Touch controls, long text, status badges, timeline actions, and menu wrapping improved.
- Null route during startup is handled safely.
- Disabled mode removes generated controls and restores underlying app styling.
- Hidden fields/columns remain hidden; queries and permissions are unchanged.

## Limits

Desktop Chromium emulation was used, not physical iOS/Android hardware.
Read-only navigation and selection were exercised; no test calls, messages,
clinical submissions, checkout actions, payments, or invoice saves were made.
Some existing form scripts mark documents dirty on load; those changes were
not saved. Empty-list row interactions cannot be verified without test records.
This is not a complete accessibility or business-workflow certification.
Standard layouts apply to other doctypes, but they have not all been audited.

## Evidence

Screenshots and detailed metrics (including private local record context) are
kept outside the Git repository at:
 /home/mit/task_backups/erp-responsive-audit-20261029/

Examples: settings.png, Patient-Encounter-menu.png, invoice-child-table.png,
console-table.png, healthcare-stable.png. Numbered captures and metrics are in
accepted-320, accepted-390, accepted-768, accepted-1440, and extra-320.

## Inner component follow-up

After feedback on Draft Invoice and Encounter Details, child tables now use
labelled mobile row cards rather than compressed spreadsheet columns. They reuse
Frappe's real permitted fields and native row editor. Read-only rows offer View row.
Editors fit inside the phone viewport; desktop resizing restores native grid layout.
Healthcare request and note panels now have aligned full-width buttons and compact
empty states. Shared sticky headers, tabs, and field spacing apply to standard forms.

Inspected every visible tab in Patient, CRM Lead, Patient Encounter, Sales Invoice,
Vobiz Settings, Vobiz User Mapping, Vobiz Incoming Mapping, Vobiz AI Settings,
and Vobiz Call Log at phone widths. Opened service/medication dialogs and populated
Sales Invoice/Vobiz child-row editors. Added a test row only in an unsaved local
encounter copy; savedocs requests were blocked in the test browser. Tested item
lookup, row editor closure, desktop/mobile resize, and the settings toggle.

Private screenshots: inner-components under the audit evidence directory.

## Vobiz AI focused follow-up

The Vobiz AI workspace and nine module DocTypes were checked separately:
Call Log, Error Log, AI Settings, Voice Agent Profile, Voice Agent Route,
Account Mapping, Patient Routing Group, Followup Routing Group, Webhook Event.
There were 90 layout checks: workspace, eight lists, nine forms at
320, 390, 425, 768, and 1440px. All passed page-width checks without JavaScript
page errors. Forms without records were inspected as unsaved create forms.

Phone workspace shortcuts now have full-width bordered tap targets, aligned
counts and arrows, and reduced nested padding. Longer Vobiz forms have a sticky,
accessible section selector; all 38 available section links were exercised.
Prompts use normal text weight, help text can wrap, and code blocks scroll within
bounded containers with keyboard access. These additions are scoped to Vobiz AI
and controlled by the existing ERP Responsive Settings switch.

Verified shortcut navigation, list filters, horizontal keyboard scrolling,
row selection, action menu bounds, native routing-row editors, editor closure,
and desktop restoration. Disabling/re-enabling the saved setting removed/restored
the additions on another live tab. The switch was restored enabled.

No telephony actions, sync operations, or audited document saves were performed.
New routing rows existed only in unsaved browser documents; save requests were
blocked during those interactions. Browser emulation does not replace testing on
physical devices. Private evidence and the audit scripts are under the audit
evidence directory's vobiz-ai subdirectory, outside the repository.

## WhatsApp, Click To Call, CRM, Healthcare and Home follow-up

Implemented through ERP Responsive only:
- Shared mobile shortcut cards for the five requested workspaces and Vobiz AI.
- Native workspace link groups gain keyboard-accessible Show/Hide controls.
  All 21 groups across WhatsApp, Healthcare and Home were exercised.
- Healthcare statistic labels wrap and cards use two columns; chart controls wrap.
- Non-tabbed standard forms with three or more named sections gain the same
  visible-section navigation used by Vobiz AI. Native tabbed forms retain tabs.
- WhatsApp inbox, thread actions, contact panel, disabled composer and template
  dialog controls fit phones. No send/AI action was invoked; mark_read requests
  were intercepted during thread inspection to preserve unread counts.
- Call analytics uses usable date/filter controls and compact two-column metrics.
- Patient History filters and expanded documents, Patient Progress controls and
  tablet heatmap scrolling, report filters and Leaderboard table scrolling refined.
- Added a reversible chart rendering guard for a reproducible native Frappe Charts
  stale SVG reference error during rapid viewport changes. A real browser rapid
  resize regression now passes for Healthcare and Leaderboard with zero JS errors.

Coverage:
- 218 linked standard routes discovered: 112 forms, 99 lists and seven trees.
  Layout scans used 390 and 320px. Two initial Chat Conversation navigation
  timeouts passed on retry. CRM Territory has zero records; its empty tree was
  inspected separately rather than claimed as a populated-node test.
- Five workspaces tested at 320, 390, 425, 768 and 1440px.
- WhatsApp inbox tested phone/tablet/desktop; loaded thread, contact drawer,
  back navigation and template dialog opened/closed without sending.
- Agent Console, Analytics and Leaderboard checked at 320, 390, 768 and 1440px.
- Populated Patient History and Patient Progress checked at those four widths,
  including expanded encounter details and the corrected tablet heatmap.
- 51 visible tabs checked across 13 representative complex forms; available
  native child-row editors opened/closed. Audited document saves were blocked.
- Three Healthcare reports loaded with date filters set. They had no rows for
  the selected October range, so populated report-row interactions are unverified.
- The separate /crm portal was inspected at 320 and 390px; no code/assets in CRM
  were changed.
- Saved enable/disable and reload tests passed; restored enabled. The final
  chart-constructor restoration check exercised the client notification handler
  directly while realtime was disconnected. Disconnected tabs require reload,
  as described in README; this is not a claim of universal realtime delivery.

Existing limitation:
WA Channel Pipeline Map raises "group.indexOf is not a function" from its native
refresh script (wa_channel_pipeline_map__js:50). Reproduced with ERP Responsive
both enabled and disabled. Left its business script unchanged.

Local environment:
An orphaned development web process developed a BrokenPipeError while writing to
a closed output pipe. Web and realtime processes were restarted with file logging;
web auto-reload was retained. Temporary browser sessions were removed afterwards.

Evidence (private local data; not committed):
workspaces/ under /home/mit/task_backups/erp-responsive-audit-20261029/
contains captures, layout metrics and browser scripts. Desktop Chromium emulation
was used, not physical iOS/Android hardware. No clinical, invoice, routing or
messaging records were saved; only the responsive setting was toggled and restored.

## Header scroll regression follow-up

A reproduced Home header gap appeared after scrolling down, back up, and returning
to the top: navbar bottom stayed at 48px while the header moved to 96px. The shared
mobile CSS had set position: relative, so Frappe's inline scroll offset added a
second navbar-height gap in normal flow.

The enabled Desk header now uses sticky positioning and an explicit navbar offset
at widths up to 991px, with the top transition disabled. Position is also explicit
because query reports set their header position to static inline. The rule covers
all standard Desk scopes and enhanced custom pages; intentionally hidden custom
headers remain hidden. Desktop rules and document actions are unchanged.

Verified scroll-down, scroll-up and return-to-top; tested 320, 425, 768 and 991px
across the primary workspaces, lists, Patient Encounter, Vobiz AI Settings, reports
and Leaderboard. Patient Encounter tabs and the section navigator meet the header
bottom without overlap, dropdowns are unobstructed, and the native desktop -15px
scroll offset / 0.5s transition remain intact at 1440px.

Private browser evidence and the full route regression metrics are stored in
headers/ under /home/mit/task_backups/erp-responsive-audit-20261029/.

Final header sweep: 256 previously covered routes, 1012 measured scroll states, zero header-position or route-load failures after retries. Hidden custom-page headers were preserved.
