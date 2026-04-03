/*
 * SaaS Theme - Sidebar Overrides
 * Enhances frappe sidebar with SaaS-style user menu and interactions
 */

$(document).ready(function () {
	if (!frappe.boot.setup_complete) return;

	// Wait for sidebar to be ready
	frappe.after_ajax(function () {
		saas_theme.sidebar.init();
	});
});

frappe.provide("saas_theme.sidebar");

saas_theme.sidebar = {
	init() {
		this.setup_user_menu();
		this.enhance_sidebar_items();
	},

	setup_user_menu() {
		const $sidebar = $(".body-sidebar");
		const $user_btn = $sidebar.find(".dropdown-navbar-user .sidebar-user-button");

		// Remove default onclick and add our custom menu
		$user_btn.removeAttr("onclick");
		$user_btn.off("click");

		// Create popover menu
		$user_btn.on("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.toggle_user_menu();
		});

		// Close menu on outside click
		$(document).on("click.saas_user_menu", (e) => {
			if (
				!$(e.target).closest(".saas-user-menu").length &&
				!$(e.target).closest(".dropdown-navbar-user").length
			) {
				this.close_user_menu();
			}
		});
	},

	toggle_user_menu() {
		let $menu = $(".saas-user-menu");
		if ($menu.length) {
			$menu.remove();
			return;
		}
		this.show_user_menu();
	},

	close_user_menu() {
		$(".saas-user-menu").remove();
	},

	show_user_menu() {
		const user_fullname = frappe.session.user_fullname;
		const user_email = frappe.session.user_email;
		const user_avatar = frappe.avatar(frappe.session.user, "avatar-large");
		const version = frappe.boot.versions?.frappe
			? `v${frappe.boot.versions.frappe}`
			: "";

		const menu_items = this.get_user_menu_items();
		let items_html = "";

		menu_items.forEach((item) => {
			if (item.divider) {
				items_html += '<div class="saas-user-menu-divider"></div>';
			} else if (item.highlight) {
				items_html += `
					<a class="saas-user-menu-item highlight"
						${item.href ? `href="${item.href}"` : ""}
						data-action="${item.action || ""}">
						<span class="saas-menu-dot"></span>
						<span>${item.label}</span>
					</a>`;
			} else {
				items_html += `
					<a class="saas-user-menu-item"
						${item.href ? `href="${item.href}"` : ""}
						data-action="${item.action || ""}">
						${item.icon ? `<span class="saas-menu-icon">${frappe.utils.icon(item.icon, "sm")}</span>` : ""}
						${item.star ? '<span class="saas-menu-star">&#9734;</span>' : ""}
						<span>${item.label}</span>
					</a>`;
			}
		});

		const $menu = $(`
			<div class="saas-user-menu">
				<div class="saas-user-menu-header">
					<div class="saas-user-menu-avatar">${user_avatar}</div>
					<div class="saas-user-menu-info">
						<div class="saas-user-menu-name">${user_fullname}</div>
						<div class="saas-user-menu-email">${user_email}</div>
					</div>
				</div>
				<div class="saas-user-menu-divider"></div>
				<div class="saas-user-menu-items">
					${items_html}
				</div>
				${version ? `<div class="saas-user-menu-footer">${version} &middot; Terms &amp; Conditions</div>` : ""}
			</div>
		`);

		// Position the menu above the user profile
		const $sidebar = $(".body-sidebar");
		$sidebar.append($menu);

		// Handle menu item clicks
		$menu.find(".saas-user-menu-item").on("click", function (e) {
			const action = $(this).data("action");
			if (action) {
				e.preventDefault();
				saas_theme.sidebar.handle_menu_action(action);
				saas_theme.sidebar.close_user_menu();
			}
		});
	},

	get_user_menu_items() {
		return [
			{
				label: __("Integrations"),
				icon: "folder",
				href: "/app/installed-applications",
				action: "",
			},
			{
				label: __("History"),
				icon: "clock",
				href: "/app/activity-log",
				action: "",
			},
			{
				label: __("Upgrade to Pro"),
				star: true,
				action: "upgrade",
			},
			{
				highlight: true,
				label: __("Update App"),
				action: "update",
			},
			{ divider: true },
			{
				label: __("Logout"),
				icon: "logout",
				action: "logout",
			},
		];
	},

	handle_menu_action(action) {
		switch (action) {
			case "logout":
				frappe.app.logout();
				break;
			case "upgrade":
				frappe.msgprint(__("Upgrade to Pro is not available yet."));
				break;
			case "update":
				frappe.msgprint(__("App is up to date."));
				break;
		}
	},

	enhance_sidebar_items() {
		// Add notification dot to Activity item if it exists
		setTimeout(() => {
			const $activity_item = $(
				'.sidebar-item-container[item-name="Activity"] .sidebar-item-icon, ' +
				'.sidebar-item-container[title="Activity"] .sidebar-item-icon'
			);
			if (
				$activity_item.length &&
				!$activity_item.find(".st-notification-dot").length
			) {
				$activity_item
					.css("position", "relative")
					.append('<span class="st-notification-dot"></span>');
			}
		}, 1000);
	},
};
