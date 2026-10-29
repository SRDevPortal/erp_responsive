// Presentation only: never change field permissions, list queries, or document data.
(() => {
    let enabled = frappe.boot?.erp_responsive_enabled !== false &&
        frappe.boot?.erp_responsive_enabled !== 0;
    let scheduled = false;
    let filterId = 0;
    let groupId = 0;
    let originalChart;
    let responsiveChart;
    const mobileWorkspaces = new Set(["Vobiz AI", "WhatsApp", "Vobiz Click To Call", "Frappe CRM", "Healthcare", "Home"]);
    const phone = window.matchMedia("(max-width: 767px)");
    const headerObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
            if (entry.target.getClientRects().length) {
                document.body.style.setProperty("--erp-form-header-height", entry.target.offsetHeight + "px");
            }
        }
    });
    function enhanceForm() {
        if (!document.body.classList.contains("erp-mobile-form")) return;
        document.querySelectorAll(".page-head").forEach(head => {
            if (!head.dataset.erpObserved) {
                head.dataset.erpObserved = "1";
                headerObserver.observe(head);
            }
        });
        if (!phone.matches) {
            restoreConnections();
            return;
        }
        document.querySelectorAll(".form-links").forEach(section => {
            if (!section.getClientRects().length || section.dataset.erpConnections) return;
            const head = section.querySelector(".section-head");
            const body = section.querySelector(".section-body");
            if (!head || !body) return;
            section.dataset.erpConnections = "1";
            if (getComputedStyle(body).display !== "none") {
                section.dataset.erpAutoCollapsed = "1";
                head.click();
            }
            head.addEventListener("click", event => {
                if (event.isTrusted) delete section.dataset.erpAutoCollapsed;
            }, {once: true});
        });
    }
    const customPages = new Set([
        "vobiz-agent-console", "vobiz-agent-analytics", "wa-chat-hub",
        "wa-chat-hub-settings", "wa-chat-hub-errors", "patient_history",
        "patient-progress", "leaderboard", "dashboard-view", "query-report",
    ]);
    function restoreConnections() {
        document.querySelectorAll("[data-erp-auto-collapsed]").forEach(section => {
            const body = section.querySelector(".section-body");
            if (body && getComputedStyle(body).display === "none") {
                section.querySelector(".section-head")?.click();
            }
            delete section.dataset.erpAutoCollapsed;
            delete section.dataset.erpConnections;
        });
    }
    function enhanceGrids() {
        document.querySelectorAll(".form-grid").forEach(grid => {
            // Reuse the actual permitted cells, never duplicate form controls or values.
            grid.classList.add("erp-mobile-grid");
            grid.querySelectorAll(".grid-static-col[data-fieldname]").forEach(cell => {
                const df = $(cell).data("df");
                if (df) cell.dataset.erpFieldLabel = __(df.label || df.fieldname) + (df.reqd ? " *" : "");
            });
            grid.querySelectorAll(".grid-body .grid-row").forEach(wrapper => {
                const row = $(wrapper).data("grid_row");
                if (!row || !row.doc || row.grid.df?.in_place_edit) return;
                const control = wrapper.querySelector(".btn-open-row");
                if (control && !control.dataset.erpEdit) {
                    control.dataset.erpEdit = "1";
                    const button = document.createElement("button");
                    button.type = "button";
                    button.className = "btn btn-default erp-edit-row";
                    button.textContent = __(row.grid.is_editable() ? "Edit row" : "View row");
                    button.setAttribute("aria-label", __("Open row {0}", [row.doc.idx]));
                    button.addEventListener("click", event => {
                        event.preventDefault();
                        event.stopPropagation();
                        row.toggle_view(true);
                    });
                    control.append(button);
                }
            });
        });
    }
    function enhanceFormNavigation() {
        if (!document.body.classList.contains("erp-mobile-form") || !phone.matches) return;
        document.querySelectorAll(".form-layout").forEach(layout => {
            if (!layout.getClientRects().length) return;
            layout.querySelectorAll('.frappe-control[data-fieldtype="Code"] pre').forEach(code => {
                if (code.dataset.erpScroll) return;
                code.dataset.erpScroll = "1";
                if (!code.hasAttribute("tabindex")) {
                    code.tabIndex = 0;
                    code.dataset.erpTabindex = "1";
                }
                if (!code.hasAttribute("aria-label")) {
                    code.setAttribute("aria-label", __("Scrollable code. Use arrow keys to read more."));
                    code.dataset.erpLabel = "1";
                }
            });
            // Native form tabs already provide section-level navigation.
            const tabs = layout.closest(".page-container")?.querySelector(".form-tabs");
            if (tabs?.getClientRects().length) {
                layout.querySelector(":scope > .erp-section-nav")?.remove();
                return;
            }
            const sections = [...layout.querySelectorAll(".form-section[data-fieldname]")]
                .filter(section => section.getClientRects().length &&
                    section.querySelector(":scope > .section-head")?.textContent.trim());
            if (sections.length < 3) {
                layout.querySelector(":scope > .erp-section-nav")?.remove();
                return;
            }
            let nav = layout.querySelector(":scope > .erp-section-nav");
            if (!nav) {
                nav = document.createElement("label");
                nav.className = "erp-section-nav";
                const label = document.createElement("span");
                label.textContent = __("Go to section");
                const select = document.createElement("select");
                select.className = "form-control";
                select.setAttribute("aria-label", __("Go to section"));
                select.addEventListener("change", () => {
                    const target = [...layout.querySelectorAll(".form-section[data-fieldname]")]
                        .find(section => section.dataset.fieldname === select.value);
                    if (!target || !target.getClientRects().length) return;
                    const head = target.querySelector(":scope > .section-head");
                    const body = target.querySelector(":scope > .section-body");
                    if (head && body && getComputedStyle(body).display === "none") head.click();
                    target.scrollIntoView({block: "start", behavior: "instant"});
                    // Return to the prompt so the same section can be selected again.
                    select.value = "";
                });
                nav.append(label, select);
                layout.prepend(nav);
            }
            const entries = sections.map(section => [
                section.dataset.fieldname,
                section.querySelector(":scope > .section-head").textContent.trim(),
            ]);
            const signature = JSON.stringify(entries);
            if (nav.dataset.signature !== signature) {
                const select = nav.querySelector("select");
                select.replaceChildren(new Option(__("Choose a section"), ""));
                entries.forEach(([value, label]) => select.add(new Option(label, value)));
                nav.dataset.signature = signature;
            }
        });
    }
    function configureCharts() {
        if (!enabled) {
            if (responsiveChart && frappe.Chart === responsiveChart) frappe.Chart = originalChart;
            return;
        }
        if (!frappe.Chart || frappe.Chart === responsiveChart) return;
        originalChart = frappe.Chart;
        responsiveChart = class extends originalChart {
            constructor(...args) {
                super(...args);
                const makeArea = this.makeChartArea;
                if (typeof makeArea !== "function") return;
                this.makeChartArea = function (...areaArgs) {
                    // Frappe Charts replaces SVGs during animation/refresh. A resize
                    // can arrive after that replacement but before its reference updates.
                    // Discard only a detached reference; the native method redraws it.
                    if (enabled && document.body.classList.contains("erp-responsive-desk") &&
                        this.svg && this.svg.parentNode !== this.container) {
                        this.svg = null;
                    }
                    return makeArea.apply(this, areaArgs);
                };
            }
        };
        frappe.Chart = responsiveChart;
    }
    function enhanceWorkspace() {
        if (!document.body.classList.contains("erp-mobile-workspace") || !phone.matches) return;
        document.querySelectorAll(".links-widget-box").forEach(group => {
            if (!group.getClientRects().length || group.dataset.erpGroup) return;
            const head = group.querySelector(".widget-head");
            const content = group.querySelector(".widget-body");
            if (!head || !content || !content.querySelector("a")) return;
            group.dataset.erpGroup = "1";
            group.classList.add("erp-workspace-group");
            if (!content.id) {
                content.id = "erp-link-group-" + (++groupId);
                content.dataset.erpGroupId = "1";
            }
            const title = group.querySelector(".widget-title")?.textContent.trim() || __("Links");
            const button = document.createElement("button");
            button.type = "button";
            button.className = "btn btn-default erp-group-toggle";
            button.textContent = __("Show");
            button.setAttribute("aria-controls", content.id);
            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-label", __("Show {0} links", [title]));
            group.classList.add("erp-group-collapsed");
            button.addEventListener("click", () => {
                const collapsed = group.classList.toggle("erp-group-collapsed");
                button.textContent = __(collapsed ? "Show" : "Hide");
                button.setAttribute("aria-expanded", String(!collapsed));
                button.setAttribute("aria-label", __(collapsed ? "Show {0} links" : "Hide {0} links", [title]));
            });
            head.append(button);
        });
    }
    function enhance() {
        scheduled = false;
        if (!enabled) return;
        configureCharts();
        enhanceForm();
        enhanceFormNavigation();
        enhanceWorkspace();
        enhanceGrids();
        document.querySelectorAll(".page-container .standard-filter-section").forEach(section => {
            if (section.dataset.erpFilters) return;
            section.dataset.erpFilters = "1";
            section.classList.add("erp-mobile-filters");
            if (!section.id) section.id = "erp-filters-" + (++filterId);
            const button = document.createElement("button");
            button.type = "button";
            button.className = "btn btn-default erp-filter-toggle";
            button.textContent = __("Show list filters");
            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-controls", section.id);
            button.addEventListener("click", () => {
                const open = section.classList.toggle("erp-filters-expanded");
                button.setAttribute("aria-expanded", String(open));
                button.textContent = __(open ? "Hide list filters" : "Show list filters");
            });
            section.before(button);
        });
        document.querySelectorAll(".frappe-list .result, .form-grid-container, .vobiz-table-wrap, .wa-errors-table-wrap, .leaderboard .result, .heatmap-container").forEach(el => {
            if (el.dataset.erpScroll) return;
            el.dataset.erpScroll = "1";
            if (el.matches(".frappe-list .result")) {
                const hint = document.createElement("div");
                hint.className = "erp-scroll-hint text-muted";
                hint.textContent = __("Swipe left or right to see more columns");
                el.before(hint);
            }
            if (!el.hasAttribute("tabindex")) {
                el.tabIndex = 0;
                el.dataset.erpTabindex = "1";
            }
            if (!el.hasAttribute("aria-label")) {
                el.setAttribute("aria-label", __(el.matches(".heatmap-container") ? "Scrollable chart. Swipe or use arrow keys to see more." : "Scrollable table. Swipe or use arrow keys to see more columns."));
                el.dataset.erpLabel = "1";
            }
        });
    }
    function schedule() {
        if (scheduled || !enabled) return;
        scheduled = true;
        requestAnimationFrame(enhance);
    }
    function updateScope() {
        const route = frappe.get_route() || [];
        document.body.classList.toggle("erp-mobile-form",
            enabled && route[0] === "Form");
        document.body.classList.toggle("erp-mobile-workspace",
            enabled && route[0] === "Workspaces" && mobileWorkspaces.has(route[1]));
        document.body.classList.toggle("erp-mobile-custom", enabled && customPages.has(route[0]));
        const standard = ["List", "Tree", "Form", "Workspaces"].includes(route[0]);
        document.body.classList.toggle("erp-responsive-desk", enabled && (standard || customPages.has(route[0])));
        document.body.classList.toggle("erp-list-slider",
            enabled && route[0] === "List" && (!route[2] || route[2] === "List"));
        if (!enabled) {
            configureCharts();
            restoreConnections();
            document.querySelectorAll(".erp-group-toggle").forEach(el => el.remove());
            document.querySelectorAll("[data-erp-group]").forEach(el => {
                el.classList.remove("erp-workspace-group", "erp-group-collapsed");
                delete el.dataset.erpGroup;
            });
            document.querySelectorAll("[data-erp-group-id]").forEach(el => {
                el.removeAttribute("id");
                delete el.dataset.erpGroupId;
            });
            document.querySelectorAll(".erp-section-nav").forEach(el => el.remove());
            document.querySelectorAll(".erp-edit-row").forEach(el => el.remove());
            document.querySelectorAll("[data-erp-edit]").forEach(el => delete el.dataset.erpEdit);
            document.querySelectorAll(".erp-mobile-grid").forEach(el => el.classList.remove("erp-mobile-grid"));
            document.querySelectorAll(".erp-filter-toggle, .erp-scroll-hint").forEach(el => el.remove());
            document.querySelectorAll("[data-erp-filters]").forEach(el => {
                el.classList.remove("erp-mobile-filters", "erp-filters-expanded");
                delete el.dataset.erpFilters;
            });
            document.querySelectorAll("[data-erp-scroll]").forEach(el => {
                if (el.dataset.erpTabindex) el.removeAttribute("tabindex");
                if (el.dataset.erpLabel) el.removeAttribute("aria-label");
                delete el.dataset.erpScroll;
                delete el.dataset.erpTabindex;
                delete el.dataset.erpLabel;
            });
        }
        schedule();
    }
    frappe.router.on("change", updateScope);
    phone.addEventListener("change", schedule);
    $(() => {
        updateScope();
        new MutationObserver(schedule).observe(document.body, {childList: true, subtree: true});
        frappe.realtime?.on("erp_responsive_settings_changed", data => {
            enabled = !!data.enabled;
            frappe.boot.erp_responsive_enabled = enabled;
            updateScope();
        });
    });
})();
