import React from "react";
import { TdsIcons } from "@modules/itr/utils/tdsRefund.constants";

/** Estimated-refund banner and progress sidebar shown beside the TDS Refund steps */
export interface TdsRefundPrelimBannerProps {
  assessmentYear?: string;
  refundAmount: string;
}

export const TdsRefundPrelimBanner: React.FC<TdsRefundPrelimBannerProps> = ({
  assessmentYear = "AY 2026-27",
  refundAmount,
}) => (
  <section className="tds-prelim-card">
    <div className="tds-prelim-left">
      <div className="tds-prelim-tag-row">
        <span className="tds-prelim-tag">PRELIMINARY ESTIMATED REFUND</span>
        <span className="tds-prelim-ay">{assessmentYear}</span>
      </div>
      <div className="tds-prelim-amount" data-testid="prelim-refund-amount">
        {refundAmount}
      </div>
    </div>
  </section>
);

const PROGRESSION_CHECKLIST = [
  "Pre-filled from ITD Portal",
  "Bank verified for direct credit",
  "Next: Upload Form 16 / AIS / Bank Stmt",
];

export const TdsRefundProgressionSidebar: React.FC = () => (
  <aside
    className="tds-step1-sidebar"
    aria-label="Claim progression and verification"
  >
    <div className="tds-progression-card">
      <span className="tds-progression-badge">Stage 1 Completed</span>
      <h3 className="tds-progression-title">Claim Progression</h3>
      <p className="tds-progression-desc">
        Review profile details, income information and bank account before
        proceeding.
      </p>
      <div className="tds-progression-checklist">
        {PROGRESSION_CHECKLIST.map((item) => (
          <div key={item} className="tds-progression-item">
            <TdsIcons.Checkmark />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <div className="tds-progression-security">
        <div className="tds-prog-sec-row">
          <TdsIcons.Shield />
          <span>256-bit Bank Grade Security</span>
        </div>
        <div className="tds-prog-sec-row">
          <TdsIcons.Zap />
          <span>Instant CA validation upon filing</span>
        </div>
      </div>
    </div>
    <div className="tds-sidebar-card tds-sidebar-trust-card">
      <div className="tds-trust-icon-box">
        <TdsIcons.Shield />
      </div>
      <div>
        <h4 className="tds-trust-title">Expert CA Verification</h4>
        <p className="tds-trust-desc">
          Your refund claim and bank details are cross-verified by a Senior
          Chartered Accountant before submission to ITD.
        </p>
      </div>
    </div>
  </aside>
);
