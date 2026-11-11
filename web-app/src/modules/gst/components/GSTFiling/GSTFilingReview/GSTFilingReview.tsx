import React, { useState } from "react";
import { GSTFilingStepper } from "@modules/gst/shared/GSTFilingStepper/GSTFilingStepper";
import type { FilingPeriodData } from "../GSTFilingPeriod/GSTFilingPeriod";
import {
  GSTReviewFilingDetailsCard,
  GSTReviewDocumentsCard,
} from "./GSTReviewFilingDetails";
import { GSTReviewTaxComputationCard } from "./GSTReviewComputation";
import { GSTRequestChangesModal } from "./GSTRequestChangesModal";
import {
  getResolvedReviewDetails,
  getReconciledTaxComputation,
} from "@modules/gst/utils/gstReviewData";
import {
  DEFAULT_DOCUMENT_ITEMS,
  calculateDocumentSummary,
  type UploadedFileInfo,
} from "@modules/gst/utils/gstDocumentsData";
import { StepActionBar } from "@shared/components";
import { setReviewEditNavigationActive } from "@shared/edit";
import "./GSTFilingReview.css";

export interface GSTFilingReviewProps {
  selectedMonth?: string;
  baseFee?: number;
  filingData?: Partial<FilingPeriodData>;
  uploadedFiles?: Record<string, UploadedFileInfo>;
  notApplicableDocs?: Record<string, boolean>;
  onBack: () => void;
  onRequestChange?: () => void;
  onStepClick?: (step: number) => void;
  onApprove: () => void;
  onSaveDraft?: () => void;
  onEditFilingDetails?: () => void;
  onEditTaxComputation?: () => void;
  onEditDocuments?: () => void;
}

export const GSTFilingReview: React.FC<GSTFilingReviewProps> = ({
  selectedMonth,
  filingData,
  uploadedFiles,
  notApplicableDocs,
  onBack,
  onRequestChange,
  onStepClick,
  onApprove,
  onSaveDraft,
  onEditFilingDetails,
  onEditTaxComputation,
  onEditDocuments,
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);

  const isNilReturn =
    filingData?.filingType === "nil" || filingData?.returnType === "nil";

  const navigateToEdit = (step: number, customHandler?: () => void) => {
    try {
      if (isNilReturn && step > 1) {
        return;
      }
      setReviewEditNavigationActive(true);
      const action =
        customHandler ?? (onStepClick ? () => onStepClick(step) : null);
      if (!action) {
        throw new Error(`No navigation target defined for step ${step}`);
      }
      action();
    } catch {
      onBack();
    } finally {
      setTimeout(() => {
        setReviewEditNavigationActive(false);
      }, 150);
    }
  };

  const handleEditFilingDetails = () => navigateToEdit(1, onEditFilingDetails);
  const handleEditTaxComputation = () =>
    navigateToEdit(1, onEditTaxComputation);
  const handleEditDocuments = () => {
    navigateToEdit(2, onEditDocuments);
  };

  const effectiveUploadedFiles = uploadedFiles ?? {};
  const effectiveNotApplicableDocs = notApplicableDocs ?? {};

  const missingDocs = DEFAULT_DOCUMENT_ITEMS.filter(
    (doc) =>
      doc.isRequired &&
      !effectiveUploadedFiles[doc.id] &&
      !effectiveNotApplicableDocs[doc.id],
  );
  const hasMissingDocs =
    !isNilReturn &&
    (missingDocs.length > 0 ||
      Object.keys(effectiveUploadedFiles).length === 0);

  const handleSubmit = () => {
    if (hasMissingDocs) {
      requestAnimationFrame(() => {
        const el =
          document.querySelector(".gst-review-docs-missing-container") ||
          document.querySelector(".gst-review-card:last-child");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    onApprove();
  };

  const docSummaryResult = calculateDocumentSummary(
    DEFAULT_DOCUMENT_ITEMS,
    effectiveUploadedFiles,
    effectiveNotApplicableDocs,
  );

  const details = getResolvedReviewDetails(
    {
      ...filingData,
      selectedMonth: selectedMonth || filingData?.selectedMonth,
    },
    docSummaryResult.totalVerified ||
      Object.keys(effectiveUploadedFiles).length,
  );

  const taxFigures = getReconciledTaxComputation(filingData);

  return (
    <div className="gst-review-page" data-testid="gst-filing-review-page">
      {/* Main Page Header */}
      <header className="gst-review-header">
        <h1 className="gst-review-title">Review and Summary</h1>
        <p className="gst-review-subtitle">
          {isNilReturn
            ? "Review your Nil return filing details before submission."
            : hasMissingDocs
              ? "Please submit all required documents before final submission."
              : "Review your filing details, uploaded documents, and computed tax figures before submission."}
        </p>
      </header>

      {/* Stepper */}
      <div className="gst-review-top-bar">
        <div className="gst-review-stepper-wrap">
          <GSTFilingStepper
            currentStep={3}
            onStepClick={onStepClick}
            isNilReturn={isNilReturn}
          />
        </div>
      </div>

      {/* Ready for Review Banner matching Image 1 & Image 2 */}
      <div className="gst-review-banner">
        <div className="gst-review-banner__icon-box">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="gst-review-banner__check"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="gst-review-banner__content">
          <h2 className="gst-review-banner__title">Ready for Review</h2>
          <p className="gst-review-banner__subtitle">
            {isNilReturn
              ? "Finsolz has prepared your Nil Return filing for submission"
              : "Finsolz CA has prepared return computation based on your verified business records"}
          </p>
        </div>
      </div>

      {/* Review Cards in Stack */}
      <div className="gst-review-main-content">
        {/* Section 1: Filing Details matching Image 1 & Image 2 */}
        <GSTReviewFilingDetailsCard
          details={details}
          hasMissingDocs={hasMissingDocs}
          missingDocsCount={missingDocs.length || 12}
          onEdit={handleEditFilingDetails}
        />

        {/* Section 2: Tax Computation (Omitted for Nil Return, matching Image 1; Blue note for CA, or calculated for Estimated, matching Image 2 & 3) */}
        {!isNilReturn && (
          <GSTReviewTaxComputationCard
            turnover={taxFigures.turnover}
            purchases={taxFigures.purchases}
            outputGst={taxFigures.outputGst}
            eligibleItc={taxFigures.eligibleItc}
            netLiability={taxFigures.netLiability}
            calculationMethod={filingData?.calculationMethod}
            onEdit={handleEditTaxComputation}
          />
        )}

        {/* Section 3: Documents (Green 'No Documents Required' for Nil Return; Red alert with 'Reupload Here >' when missing; List when attached) */}
        <GSTReviewDocumentsCard
          isNil={isNilReturn}
          verifiedCount={
            docSummaryResult.totalVerified ||
            Object.keys(effectiveUploadedFiles).length
          }
          hasMissingDocs={hasMissingDocs}
          missingCount={missingDocs.length || 12}
          uploadedFiles={effectiveUploadedFiles}
          onEdit={handleEditDocuments}
          onSubmitDocuments={handleEditDocuments}
        />
      </div>

      {/* Step Navigation Bar */}
      <StepActionBar
        showBack={false}
        isReview={true}
        onNext={handleSubmit}
        onSaveDraft={onSaveDraft}
        nextLabel="Proceed to Submit →"
      />

      {/* Confirmation Modal */}
      <GSTRequestChangesModal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          if (onRequestChange) {
            onRequestChange();
          }
        }}
      />
    </div>
  );
};

export default GSTFilingReview;
