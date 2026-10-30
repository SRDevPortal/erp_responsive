# Agent Console mobile review — 30 October 2026

Scope: /app/vobiz-agent-console. All implementation changes are in ERP Responsive.
The local page is provided by Vobiz System Call. Its source and calling handlers
were not modified.

## Findings and corrections

1. **Queue — corrected.** Details was the last column and required a long swipe.
   The existing action cell now follows the CRM Lead ID (or Patient ID), including
   after paging, sorting, searching and changing queue source. Fixed-width headers
   previously exceeded the responsive table's width, overlapping Name/Phone and
   hiding cell values. Explicit column widths now keep data readable inside the
   horizontal scroller. A swipe hint explains how to reach remaining columns.
2. **Workdesk — corrected.** The mobile dialog previously extended beyond the
   viewport. Phone/tablet dialogs now scroll internally while keeping close and
   footer actions reachable. Phone users select among all six native sections
   through a labelled menu. Field summaries use two columns; actions wrap clearly.
   The existing native handlers still open each section.
3. **Filters and queue controls — corrected and checked.** Search is full width,
   controls have touch-friendly heights, and the filter editor fits in a scrollable
   mobile sheet. Empty results display inside the viewport. Added accessible names
   for search, sort, queue source, row selection and pagination.
4. **Responsive setting — checked.** Its existing event restores original column
   order, removes generated controls/labels and disables console styles. Enabling
   it reapplies the layout, including when a Details window is already open.
5. **Encounter List — blocked by existing configuration.** The site reports
   “Patient Encounter Queue is disabled.” Its disabled/error state was inspected;
   no populated encounter-list workflow is claimed.

## Browser verification

Chromium emulation: 320, 360, 390, 425, 768 and 1440px wide, plus a 320×480
short viewport. All six widths had document width equal to viewport width.
Details appears in the third column, after selection and ID, at each width.
No JavaScript page errors were observed in the final runs.

Checked Details open/close, all six sections (CRM Lead, Encounters, Patient
Clinical History, Reports, Vobiz Summary, WhatsApp), horizontal keyboard scrolling,
filter add/apply/clear, search with no matches, 10-row pagination and Next,
sorting, selection, Patient queue, and disable/re-enable with a dialog open.

Reports, encounters and clinical history on the inspected lead had empty states.
WhatsApp had existing messages. Audio recordings were empty. Calls, messages,
record creation and clinical saves were not executed. Agent heartbeat and read
receipts were intercepted in the audit browser. Microphone/audio calling,
physical devices, other browser engines and full accessibility compliance are
outside this verification.

The final filter test waits for Frappe's popover initialization before adding a
filter; an earlier automated attempt raced that initialization. Screenshots and
results are stored locally outside Git at:
~/task_backups/erp-console-review-20261030/report.html

JavaScript syntax and Git whitespace checks passed. No clinical, calling,
permission or submission code changed.

## WhatsApp refinement — 30 October 2026

The active WhatsApp workdesk now uses the available mobile/tablet dialog height.
Its message history scrolls independently, with the native composer held above
the footer. Message bubbles wrap text and media within the viewport. A preview
is suppressed only when its complete text duplicates a displayed message;
unique summaries and unavailable-chat states are retained. The phone section
selector already identifies WhatsApp, so the redundant card heading is hidden.

Visual viewport height/offset update the chat dialog when the available screen
area changes. Short viewports use compact spacing, and wide landscape screens
put the composer controls on one line. Attachment/emoji menus open upward inside
the viewport with scrollable contents and 44px controls. All native controls and
send handlers remain in place.

Verified Chromium viewports: 320×640, 390×844, 425×900, 768×900, 320×480,
667×375 and 1440×900. No document overflow or JavaScript errors. A browser-only
30-message layout fixture verified long-thread scrolling and unbroken-text
wrapping without storing messages. Emoji insertion, clearing the draft,
attachment menu, photo dialog, approved template image preview, switching to
CRM Lead, and responsive disable/re-enable passed. No calls, uploads or messages
were sent. Physical on-screen keyboards were not tested; short-viewport resizing
was tested instead.

Accepted screenshots and browser metrics:
~/task_backups/erp-console-whatsapp-20261030/
