import { useEffect, type MouseEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { routePaths } from "@core/config";
import "./QuickServices.css";

export interface QuickServiceItem {
  id: string;
  label: string;
  description: string;
  to: string;
  iconImg: string;
  themeClass: string;
}

export const QUICK_SERVICE_LIST: QuickServiceItem[] = [
  // First row — 4 cards
  {
    id: "incorporation",
    label: "Incorporation",
    description: "Company registration",
    to: routePaths.incorporation.root,
    iconImg: "/assets/images/services/service-incorporation-card.png",
    themeClass: "quick-service-card--incorporation",
  },
  {
    id: "gst",
    label: "GST",
    description: "Registration, filing & compliance",
    to: routePaths.gst.root,
    iconImg: "/assets/images/services/service-gst-card.png",
    themeClass: "quick-service-card--gst",
  },
  {
    id: "itr",
    label: "ITR",
    description: "Income tax return filing",
    to: routePaths.itr.root,
    iconImg: "/assets/images/services/service-itr-card.png",
    themeClass: "quick-service-card--itr",
  },
  {
    id: "projects",
    label: "Projects",
    description: "Project Management",
    to: "#quick-services",
    iconImg: "/assets/images/services/service-projects-card.png",
    themeClass: "quick-service-card--projects",
  },
  // Second row — 3 cards
  {
    id: "loans",
    label: "Loan",
    description: "Personal,Home & Business loans",
    to: routePaths.loans,
    iconImg: "/assets/images/services/service-loan-card.png",
    themeClass: "quick-service-card--loans",
  },
  {
    id: "insurance",
    label: "Insurance",
    description: "Coverage for your future",
    to: routePaths.insurance,
    iconImg: "/assets/images/services/service-insurance-card.png",
    themeClass: "quick-service-card--insurance",
  },
  {
    id: "business",
    label: "Business",
    description: "Business Solutions & Support",
    to: routePaths.business.root,
    iconImg: "/assets/images/services/service-business-card.png",
    themeClass: "quick-service-card--business",
  },
];

export interface QuickServicesProps {
  services?: QuickServiceItem[];
}

export const QuickServices = ({
  services = QUICK_SERVICE_LIST,
}: QuickServicesProps) => {
  const navigate = useNavigate();
  const { hash } = useLocation();

  const scrollToServices = () =>
    document
      .getElementById(routePaths.dashboardServicesAnchor)
      ?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (hash === `#${routePaths.dashboardServicesAnchor}`) scrollToServices();
  }, [hash]);

  const handleServiceClick = (e: MouseEvent, targetUrl: string) => {
    e.preventDefault();
    if (targetUrl.startsWith("#")) {
      scrollToServices();
      return;
    }
    navigate(targetUrl);
  };

  const renderCard = (service: QuickServiceItem) => (
    <a
      className={`quick-service-card ${service.themeClass}`}
      key={service.id}
      href={service.to}
      onClick={(e) => handleServiceClick(e, service.to)}
      aria-label={`${service.label} - ${service.description}`}
    >
      <div className="quick-service-card__content">
        <div className="quick-service-card__text-block">
          <h3 className="quick-service-card__title">{service.label}</h3>
          <p className="quick-service-card__desc">{service.description}</p>
        </div>
        <div className="quick-service-card__arrow-btn" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="quick-service-card__arrow-svg"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>

      <div className="quick-service-card__image-wrap">
        <img
          src={service.iconImg}
          alt={`${service.label} illustration`}
          className="quick-service-card__image"
          loading="eager"
        />
      </div>
    </a>
  );

  return (
    <section className="quick-services" id={routePaths.dashboardServicesAnchor}>
      <div className="quick-services__header">
        <div className="quick-services__header-left">
          <h2 className="quick-services__title">Our Services</h2>
          <p className="quick-services__subtitle">
            Everything you need to manage and grow your business, at one place.
          </p>
        </div>
      </div>

      <div className="quick-services__grid">{services.map(renderCard)}</div>
    </section>
  );
};

export default QuickServices;
