import frappe
from frappe.model.document import Document


class ERPResponsiveSettings(Document):
    def on_update(self):
        # Boot data is cached; invalidate it so new sessions receive the saved option.
        frappe.clear_cache()
        frappe.publish_realtime(
            "erp_responsive_settings_changed",
            {"enabled": bool(self.enable_responsive_layout)},
            after_commit=True,
        )
