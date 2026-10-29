import frappe
from frappe.utils import cint


def boot_session(bootinfo):
    # Loading the Single document honors its default before its first save.
    settings = frappe.get_cached_doc("ERP Responsive Settings")
    bootinfo.erp_responsive_enabled = bool(cint(settings.enable_responsive_layout))
