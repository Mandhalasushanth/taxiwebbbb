import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { routePaths } from "@core/config";
import { buildProfileCompletionPath } from "@core/auth";
import { useAuthStore } from "@store/index";
import { CompleteProfileModal } from "@shared/components";
import { ITR_SERVICES_LIST } from "../../services/itrService";
import type { ItrServiceCard, ItrViewKey } from "../../types/itr.types";
import {
  BarChart3 as BarChartIcon,
  IndianRupee as RupeeIcon,
  Clock as ClockIcon,
  FileText as FileTextIcon,
  ShieldAlert as ShieldAlertIcon,
  type LucideProps as IconProps,
} from "lucide-react";
import "./Itr.css";

const VIEW_ROUTE_MAP: Record<ItrViewKey, string> = {
  overview: routePaths.itr.root,
  "track-my-return": routePaths.itr.root,
  "itr-filing": routePaths.itr.itrFiling,
  "tds-refund": routePaths.itr.tdsRefund,
  "previous-year-itr": routePaths.itr.previousYearItr,
  "revised-itr": routePaths.itr.revisedItr,
  "tax-notice-assistance": routePaths.itr.taxNoticeAssistance,
};

const SERVICE_ICON_MAP: Record<ItrServiceCard["icon"], FC<IconProps>> = {
  bar: BarChartIcon,
  rupee: RupeeIcon,
  clock: ClockIcon,
  document: FileTextIcon,
  warning: ShieldAlertIcon,
};

const SERVICE_ICON_IMAGE_MAP: Partial<Record<ItrViewKey, string>> = {
  "itr-filing": "/assets/icons/itr/itr-filing.png",
  "tds-refund": "/assets/icons/itr/tds-refund.png",
  "previous-year-itr": "/assets/icons/itr/previous-year-itr.png",
  "revised-itr": "/assets/icons/itr/revised-itr.png",
  "tax-notice-assistance": "/assets/icons/itr/tax-notice-assistance.png",
};

export const renderServiceIcon = (iconType: ItrServiceCard["icon"]) => {
  const IconComponent = SERVICE_ICON_MAP[iconType] ?? FileTextIcon;
  return <IconComponent size={22} strokeWidth={2.2} />;
};

export const renderItrServiceCard = (
  service: ItrServiceCard,
  onStart: (viewKey: ItrViewKey) => void,
) => {
  const iconImageSrc = SERVICE_ICON_IMAGE_MAP[service.viewKey];

  return (
    <div key={service.id} className="itr-service-card">
      <div className="itr-service-card__icon-box">
        {iconImageSrc ? (
          <img
            src={iconImageSrc}
            alt={service.title}
            className="itr-service-card__icon-img"
            width={48}
            height={48}
            loading="lazy"
          />
        ) : (
          renderServiceIcon(service.icon)
        )}
      </div>

      <h3 className="itr-service-card__title">{service.title}</h3>
      <p className="itr-service-card__desc">{service.description}</p>

      <hr className="itr-service-card__divider" />

      <div className="itr-service-card__footer">
        <div className="itr-service-card__price-box">
          <span className="itr-service-card__price">{service.pricing}</span>
          <span className="itr-service-card__timeline">
            <ClockIcon size={13} strokeWidth={2.2} /> {service.timeline}
          </span>
        </div>

        <button
          type="button"
          className="itr-service-card__start-btn"
          onClick={() => onStart(service.viewKey)}
        >
          Start →
        </button>
      </div>
    </div>
  );
};

export const renderHeroBanner = () => (
  <section className="itr-hero-banner">
    <h1 className="itr-hero-banner__title">Returns, refunds and notices</h1>
    <p className="itr-hero-banner__subtitle">
      Filed by a CA, not a form wizard. We pull your AIS and TIS, reconcile them
      against your books, and show you the computation before anything is
      submitted.
    </p>
  </section>
);

export const renderServicesGrid = (onStart: (viewKey: ItrViewKey) => void) => (
  <section className="itr-services-grid">
    {ITR_SERVICES_LIST.map((service) => renderItrServiceCard(service, onStart))}
  </section>
);

export const Itr = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState("");

  const handleNavigateView = (viewKey: ItrViewKey) => {
    try {
      const targetRoute = VIEW_ROUTE_MAP[viewKey] ?? routePaths.itr.root;
      const shouldPromptProfile = Boolean(
        !user?.isProfileComplete && targetRoute !== routePaths.itr.root,
      );

      const navigationHandlers: Record<"true" | "false", () => void> = {
        true: () => {
          setSelectedTarget(targetRoute);
          setIsProfileModalOpen(true);
        },
        false: () => navigate(targetRoute),
      };

      navigationHandlers[String(shouldPromptProfile) as "true" | "false"]();
    } catch {
      navigate(routePaths.itr.root);
    }
  };

  const handleConfirmProfile = () => {
    try {
      setIsProfileModalOpen(false);
      navigate(buildProfileCompletionPath(selectedTarget), {
        state: { returnTo: selectedTarget, mobile: user?.mobile },
      });
    } catch {
      setIsProfileModalOpen(false);
    }
  };

  return (
    <div className="itr-hub-page">
      {renderHeroBanner()}
      {renderServicesGrid(handleNavigateView)}
      <CompleteProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onCompleteProfile={handleConfirmProfile}
      />
    </div>
  );
};

export default Itr;
