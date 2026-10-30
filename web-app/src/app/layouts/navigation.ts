import { routePaths } from "@core/config";

export interface NavItem {
  label: string;
  to: string;
  icon: string;
  iconImg?: string;
  /** Optional key into the badge map DashboardLayout builds from live data. */
  badgeKey?: "applications" | "notifications";
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      {
        label: "Dashboard",
        to: routePaths.dashboard,
        icon: "⌂",
        iconImg: "/assets/images/sidebar/nav-dashboard.png",
      },
    ],
  },
  {
    title: "Services",
    items: [
      {
        label: "Incorporation",
        to: routePaths.incorporation.root,
        icon: "🏢",
        iconImg: "/assets/images/sidebar/nav-incorporation.png",
      },
      {
        label: "GST",
        to: routePaths.gst.root,
        icon: "%",
        iconImg: "/assets/images/sidebar/nav-gst.png",
      },
      {
        label: "ITR & TDS",
        to: routePaths.itr.root,
        icon: "₹",
        iconImg: "/assets/images/sidebar/nav-itr.png",
      },
      {
        label: "Projects",
        to: "#projects",
        icon: "📋",
        iconImg: "/assets/images/sidebar/nav-projects.png",
      },
      {
        label: "Loans",
        to: routePaths.loans,
        icon: "◈",
        iconImg: "/assets/images/sidebar/nav-loans.png",
      },
      {
        label: "Insurance",
        to: routePaths.insurance,
        icon: "☂",
        iconImg: "/assets/images/sidebar/nav-insurance.png",
      },
      {
        label: "Business",
        to: routePaths.business.root,
        icon: "💼",
        iconImg: "/assets/images/sidebar/nav-business.png",
      },
    ],
  },
  {
    title: "My account",
    items: [
      {
        label: "Applications",
        to: routePaths.applications,
        icon: "☰",
        iconImg: "/assets/images/sidebar/nav-applications.png",
        badgeKey: "applications",
      },
      {
        label: "Document Vault",
        to: routePaths.documents,
        icon: "🗎",
        iconImg: "/assets/images/sidebar/nav-vault.png",
      },
      {
        label: "Payments",
        to: routePaths.payments,
        icon: "⇄",
        iconImg: "/assets/images/sidebar/nav-payments.png",
      },
      {
        label: "Notifications",
        to: routePaths.notifications,
        icon: "🔔",
        iconImg: "/assets/images/sidebar/nav-notifications.png",
        badgeKey: "notifications",
      },
      {
        label: "Support Chat",
        to: routePaths.support,
        icon: "💬",
        iconImg: "/assets/images/sidebar/nav-chat.png",
      },
      {
        label: "Profile",
        to: routePaths.profile,
        icon: "☺",
        iconImg: "/assets/images/sidebar/nav-profile.png",
      },
    ],
  },
];
