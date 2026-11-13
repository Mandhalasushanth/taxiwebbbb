import { useState, useEffect, type FormEvent } from "react";
import { routePaths } from "@core/config";
import { useAppStore } from "@store/index";
import {
  gstFieldRules,
  collectGstErrors,
  GST_STEP_ERROR,
} from "@modules/gst/validation/gstFieldRules";
import { gstProfileService } from "@modules/gst/services/gstProfileService";
import { generateGstReference } from "@modules/gst/utils/gstFormat";
import {
  useServiceDraft,
  readServiceDraft,
  DRAFT_NAMESPACES,
} from "@shared/saveDraft";
import { useReviewEdit } from "@shared/edit";
import { gstUploadedFiles } from "@modules/gst/services/gstUploadedFiles";
import { useGSTReviewEditNavigation } from "@modules/gst/shared/useGSTSectionFocus";

export type ComplianceRequestOption =
  | "Reconciliation Support"
  | "Notice Response";

/** Typed fields of the compliance request */
export interface ComplianceFields {
  gstin: string;
  financialYear: string;
  requestType: ComplianceRequestOption | "";
  gstr2bRef: string;
  notes: string;
  noticeNumber: string;
  issueDate: string;
  dueDate: string;
  additionalInfo: string;
}

export interface ComplianceDraft {
  fields: ComplianceFields;
  filesMeta: {
    purchaseFileName?: string;
    salesFileName?: string;
    noticeFileName?: string;
  };
  isReviewing?: boolean;
}

export type ComplianceErrors = Record<string, string | undefined>;

const SERVICE_ID = "gst-compliance";
const SERVICE_TITLE = "GST Compliance";

const buildInitialFields = (): ComplianceFields => ({
  gstin: gstProfileService.get().gstin,
  financialYear: "",
  requestType: "",
  gstr2bRef: "",
  notes: "",
  noticeNumber: "",
  issueDate: "",
  dueDate: "",
  additionalInfo: "",
});

const validateCompliance = (
  fields: ComplianceFields,
  files: {
    purchaseFile: File | null;
    salesFile: File | null;
    noticeFile: File | null;
  },
): Record<string, string> => {
  const isRecon = fields.requestType === "Reconciliation Support";
  const isNotice = fields.requestType === "Notice Response";
  return collectGstErrors({
    gstin: gstFieldRules.gstin(fields.gstin),
    financialYear: fields.financialYear
      ? undefined
      : "Financial Year is required",
    requestType: fields.requestType ? undefined : "Request Type is required",
    purchaseFile:
      isRecon && !files.purchaseFile
        ? "Purchase Register file is required"
        : undefined,
    salesFile:
      isRecon && !files.salesFile
        ? "Sales Register file is required"
        : undefined,
    gstr2bRef: isRecon
      ? gstFieldRules.optional(gstFieldRules.arn("GSTR-2B reference"))(
          fields.gstr2bRef,
        )
      : undefined,
    noticeNumber: isNotice
      ? gstFieldRules.noticeNumber(fields.noticeNumber)
      : undefined,
    issueDate: isNotice
      ? gstFieldRules.pastDate("Notice issue date")(fields.issueDate)
      : undefined,
    dueDate: isNotice
      ? gstFieldRules.validDate("Reply due date")(fields.dueDate) ||
        (fields.issueDate &&
        fields.dueDate &&
        new Date(fields.dueDate) < new Date(fields.issueDate)
          ? "Reply due date cannot be before notice issue date"
          : undefined)
      : undefined,
    noticeFile:
      isNotice && !files.noticeFile
        ? "Notice copy upload is required"
        : undefined,
  });
};

export const useGSTComplianceState = () => {
  const pushToast = useAppStore((state) => state.pushToast);

  const [savedDraft] = useState(() =>
    readServiceDraft<ComplianceDraft | ComplianceFields>(
      SERVICE_ID,
      DRAFT_NAMESPACES.gst,
    ),
  );
  const [initialFields] = useState(buildInitialFields);

  const [fields, setFields] = useState<ComplianceFields>(() => {
    if (!savedDraft?.formData) return initialFields;
    if ("fields" in savedDraft.formData) {
      return { ...initialFields, ...savedDraft.formData.fields };
    }
    return { ...initialFields, ...savedDraft.formData };
  });

  const [purchaseFile, setPurchaseFile] = useState<File | null>(
    () => gstUploadedFiles.get("compliance_purchase") || null,
  );
  const [salesFile, setSalesFile] = useState<File | null>(
    () => gstUploadedFiles.get("compliance_sales") || null,
  );
  const [noticeFile, setNoticeFile] = useState<File | null>(
    () => gstUploadedFiles.get("compliance_notice") || null,
  );

  const [previewDoc, setPreviewDoc] = useState<{
    file: File;
    title: string;
  } | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Restore review step if user left while reviewing
  const [isReviewing, setIsReviewing] = useState<boolean>(() => {
    if (savedDraft?.formData && "isReviewing" in savedDraft.formData) {
      return Boolean(savedDraft.formData.isReviewing);
    }
    return savedDraft?.currentStep === 2;
  });

  const [errors, setErrors] = useState<ComplianceErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState("");

  // Re-hydrate any files loading asynchronously from IndexedDB
  useEffect(() => {
    let isMounted = true;
    const hydrateFiles = async () => {
      if (!purchaseFile) {
        const file = await gstUploadedFiles.getAsync("compliance_purchase");
        if (file && isMounted) setPurchaseFile(file);
      }
      if (!salesFile) {
        const file = await gstUploadedFiles.getAsync("compliance_sales");
        if (file && isMounted) setSalesFile(file);
      }
      if (!noticeFile) {
        const file = await gstUploadedFiles.getAsync("compliance_notice");
        if (file && isMounted) setNoticeFile(file);
      }
    };
    hydrateFiles();
    return () => {
      isMounted = false;
    };
  }, []);

  const hasEnteredData = Boolean(
    isReviewing ||
    purchaseFile ||
    salesFile ||
    noticeFile ||
    fields.financialYear?.trim() ||
    fields.requestType?.trim() ||
    fields.gstr2bRef?.trim() ||
    fields.notes?.trim() ||
    fields.noticeNumber?.trim() ||
    fields.issueDate?.trim() ||
    fields.dueDate?.trim() ||
    fields.additionalInfo?.trim(),
  );

  const clearComplianceFiles = () => {
    gstUploadedFiles.remove("compliance_purchase");
    gstUploadedFiles.remove("compliance_sales");
    gstUploadedFiles.remove("compliance_notice");
  };

  const reviewEdit = useReviewEdit(() => setIsReviewing(true));

  const draft = useServiceDraft<ComplianceDraft>({
    storageNamespace: DRAFT_NAMESPACES.gst,
    serviceId: SERVICE_ID,
    serviceTitle: SERVICE_TITLE,
    totalSteps: 2,
    currentStep: isReviewing ? 2 : 1,
    stepLabel: isReviewing
      ? "Review & Submit"
      : fields.requestType || "Business & Filing Details",
    resumeRoute: routePaths.gst.compliance,
    exitRoute: routePaths.gst.root,
    formData: {
      fields,
      filesMeta: {
        purchaseFileName: purchaseFile?.name,
        salesFileName: salesFile?.name,
        noticeFileName: noticeFile?.name,
      },
      isReviewing,
    },
    hasEnteredData,
    isComplete: isSubmitted,
    isEditMode: reviewEdit.isEditMode,
    onDiscard: () => {
      clearComplianceFiles();
      setFields(initialFields);
      setPurchaseFile(null);
      setSalesFile(null);
      setNoticeFile(null);
      setIsReviewing(false);
      reviewEdit.cancelEdit();
    },
  });

  /** Updates one field and clears its error */
  const setField = <K extends keyof ComplianceFields>(
    field: K,
    value: ComplianceFields[K],
  ) => {
    setFields((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      if (field === 'gstin') {
        const liveErr = gstFieldRules.gstin(value as string, undefined, true);
        if (liveErr) {
          next.gstin = liveErr;
        } else {
          delete next.gstin;
        }
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const setFileWithClear =
    (
      key: "compliance_purchase" | "compliance_sales" | "compliance_notice",
      setter: (file: File | null) => void,
      field: string,
    ) =>
    (file: File | null) => {
      if (file) {
        gstUploadedFiles.set(key, file);
      } else {
        gstUploadedFiles.remove(key);
      }
      setter(file);
      setErrors((prev) =>
        prev[field] ? { ...prev, [field]: undefined } : prev,
      );
    };

  const validateField = (field: keyof ComplianceFields) => {
    let err: string | undefined;
    if (field === "noticeNumber" && fields.requestType === "Notice Response") {
      err = gstFieldRules.noticeNumber(fields.noticeNumber);
    } else if (field === "gstin") {
      err = gstFieldRules.gstin(fields.gstin);
    } else if (
      field === "gstr2bRef" &&
      fields.requestType === "Reconciliation Support"
    ) {
      err = gstFieldRules.optional(gstFieldRules.arn("GSTR-2B reference"))(
        fields.gstr2bRef,
      );
    } else if (
      field === "issueDate" &&
      fields.requestType === "Notice Response"
    ) {
      err = gstFieldRules.pastDate("Notice issue date")(fields.issueDate);
      if (
        !err &&
        fields.issueDate &&
        fields.dueDate &&
        new Date(fields.dueDate) < new Date(fields.issueDate)
      ) {
        setErrors((prev) => ({
          ...prev,
          dueDate: "Reply due date cannot be before notice issue date",
        }));
      } else if (
        fields.issueDate &&
        fields.dueDate &&
        new Date(fields.dueDate) >= new Date(fields.issueDate)
      ) {
        setErrors((prev) =>
          prev.dueDate === "Reply due date cannot be before notice issue date"
            ? { ...prev, dueDate: undefined }
            : prev,
        );
      }
    } else if (
      field === "dueDate" &&
      fields.requestType === "Notice Response"
    ) {
      err = gstFieldRules.validDate("Reply due date")(fields.dueDate);
      if (
        !err &&
        fields.issueDate &&
        fields.dueDate &&
        new Date(fields.dueDate) < new Date(fields.issueDate)
      ) {
        err = "Reply due date cannot be before notice issue date";
      }
    }
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const handleProceedToReview = (e?: FormEvent): boolean => {
    e?.preventDefault();
    const newErrors = validateCompliance(fields, {
      purchaseFile,
      salesFile,
      noticeFile,
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      if (reviewEdit.isEditMode) {
        reviewEdit.finishEdit();
      } else {
        setIsReviewing(true);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }
    requestAnimationFrame(() => {
      const firstErrorEl = document.querySelector(
        ".gst-compliance-error-text, .supporting-doc-item__error, .field-error",
      );
      firstErrorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return false;
  };

  const { editSection, startSectionEdit } = useGSTReviewEditNavigation();

  const handleEdit = (section: string | null = null) => {
    startSectionEdit(section, () => {
      reviewEdit.startEdit(() => {
        setIsReviewing(false);
      });
    });
  };

  const handleSubmitReview = () => {
    setIsConfirmModalOpen(true);
  };

  const handleSubmit = (e?: FormEvent) => {
    return handleProceedToReview(e);
  };

  const handleConfirmSubmit = () => {
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setApplicationId(generateGstReference("GSTC"));
      setIsSubmitted(true);
      clearComplianceFiles();
      draft.clearDraft();
      window.scrollTo({ top: 0, behavior: "smooth" });
      pushToast(
        `GST Compliance request (${fields.requestType}) submitted successfully!`,
        "success",
      );
    }, 600);
  };

  const handleReset = () => {
    clearComplianceFiles();
    setFields(initialFields);
    setPurchaseFile(null);
    setSalesFile(null);
    setNoticeFile(null);
    setErrors({});
    setIsReviewing(false);
    setIsSubmitted(false);
    reviewEdit.cancelEdit();
  };

  return {
    fields,
    setField,
    validateField,
    purchaseFile,
    setPurchaseFile: setFileWithClear(
      "compliance_purchase",
      setPurchaseFile,
      "purchaseFile",
    ),
    salesFile,
    setSalesFile: setFileWithClear(
      "compliance_sales",
      setSalesFile,
      "salesFile",
    ),
    noticeFile,
    setNoticeFile: setFileWithClear(
      "compliance_notice",
      setNoticeFile,
      "noticeFile",
    ),
    previewDoc,
    setPreviewDoc,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    isReviewing,
    isEditMode: reviewEdit.isEditMode,
    handleBackFromEdit: reviewEdit.finishEdit,
    editSection,
    errors,
    hasErrors,
    stepError: hasErrors ? GST_STEP_ERROR : null,
    isSubmitting,
    isSubmitted,
    applicationId,
    handleSubmit,
    handleProceedToReview,
    handleEdit,
    handleSubmitReview,
    handleConfirmSubmit,
    handleReset,
    setErrors,
    isDraftModalOpen: draft.isDraftModalOpen,
    isReviewPrompt: draft.isReviewPrompt,
    isSaving: draft.isSaving,
    openDraftModal: draft.openDraftModal,
    handleSaveAndExit: draft.handleSaveAndExit,
    handleDiscardAndExit: draft.handleDiscardAndExit,
    handleKeepEditing: draft.handleKeepEditing,
  };
};
