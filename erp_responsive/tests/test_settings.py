import unittest
import frappe
from erp_responsive.boot import boot_session


class TestResponsiveSettings(unittest.TestCase):
    def setUp(self):
        self.original_user = frappe.session.user
        frappe.set_user("Administrator")

    def tearDown(self):
        frappe.db.rollback()
        frappe.clear_cache()
        frappe.set_user(self.original_user)

    def test_saved_toggle_is_reflected_in_boot(self):
        settings = frappe.get_single("ERP Responsive Settings")
        for enabled in (0, 1):
            settings.enable_responsive_layout = enabled
            settings.save()
            boot = frappe._dict()
            boot_session(boot)
            self.assertEqual(boot.erp_responsive_enabled, bool(enabled))

    def test_unsaved_setting_defaults_to_enabled(self):
        frappe.db.delete("Singles", {"doctype": "ERP Responsive Settings"})
        frappe.clear_cache()
        boot = frappe._dict()
        boot_session(boot)
        self.assertTrue(boot.erp_responsive_enabled)

    def test_guest_cannot_change_settings(self):
        self.assertFalse(frappe.has_permission("ERP Responsive Settings", "write", user="Guest"))
