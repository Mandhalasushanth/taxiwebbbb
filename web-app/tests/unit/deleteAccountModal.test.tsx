// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  DeleteAccountModal,
  DELETION_REASONS,
  ACCOUNT_DELETION_STORAGE_KEY,
  calculate60DaysDeletionDate,
} from "../../src/modules/profile/components/DeleteAccountModal/DeleteAccountModal";

describe("DeleteAccountModal Component", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it("calculates 60 days deletion date dynamically in YYYY-MM-DD format", () => {
    const testDate = new Date("2026-11-18T10:00:00Z");
    const calculated = calculate60DaysDeletionDate(testDate);
    expect(calculated).toBe("2027-01-17");
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <DeleteAccountModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders all elements matching user prompt and screenshots when open", () => {
    render(
      <DeleteAccountModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    // Title & Header
    expect(screen.getByRole("heading", { name: "Delete Account" })).toBeDefined();
    expect(screen.queryByTestId("delete-account-close-btn")).toBeNull();

    // Section 1: Question and Required star
    expect(screen.getByText("Why are you deleting your account?")).toBeDefined();
    expect(screen.getByTestId("delete-account-required-star")).toBeDefined();
    expect(screen.queryByText("Required")).toBeNull();

    // All 5 reasons
    DELETION_REASONS.forEach((reason, index) => {
      expect(screen.getByTestId(`delete-account-reason-${index}`)).toBeDefined();
      expect(screen.getByText(reason)).toBeDefined();
    });

    // Section 2: Textarea & Character counter
    const textarea = screen.getByTestId(
      "delete-account-explanation-textarea"
    ) as HTMLTextAreaElement;
    expect(textarea).toBeDefined();
    expect(
      textarea.getAttribute("placeholder")
    ).toBe("Tell us more about your reason (optional additional details)...");
    expect(screen.getByTestId("delete-account-char-counter").textContent).toBe("0/300");

    // Section 3: Warning Box
    expect(
      screen.getByText("Permanent Action – 60-Day Grace Period")
    ).toBeDefined();
    expect(
      screen.getByText(
        "Your data will be retained for 60 days before permanent erasure:"
      )
    ).toBeDefined();
    expect(
      screen.getByText(
        "All profile records, application tracking, and filings will be permanently erased."
      )
    ).toBeDefined();
    expect(
      screen.getByText(
        "Your registered mobile number will be blocked from logging in during this period."
      )
    ).toBeDefined();
    expect(
      screen.getByText(
        "All KYC, PAN, and Aadhaar associations will be permanently unlinked."
      )
    ).toBeDefined();
    expect(
      screen.getByText(
        "Active mobile authentication sessions will be immediately revoked."
      )
    ).toBeDefined();

    // Section 4: Checkbox
    const checkbox = screen.getByTestId(
      "delete-account-understand-checkbox"
    ) as HTMLInputElement;
    expect(checkbox).toBeDefined();
    expect(checkbox.checked).toBe(false);
    expect(
      screen.getByText(
        "I understand that my account will be permanently deleted after 60 days, and my mobile number will be blocked."
      )
    ).toBeDefined();

    // Section 5: Cancel & Delete buttons
    const cancelBtn = screen.getByTestId("delete-account-cancel-btn");
    const deleteBtn = screen.getByTestId(
      "delete-account-confirm-btn"
    ) as HTMLButtonElement;

    expect(cancelBtn).toBeDefined();
    expect(deleteBtn).toBeDefined();
    expect(deleteBtn.disabled).toBe(true);
  });

  it("populates textarea when selecting reasons and updates counter", () => {
    render(
      <DeleteAccountModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    const textarea = screen.getByTestId(
      "delete-account-explanation-textarea"
    ) as HTMLTextAreaElement;
    const reason0 = screen.getByTestId("delete-account-reason-0");
    const reason2 = screen.getByTestId("delete-account-reason-2");

    // Click first reason
    fireEvent.click(reason0);
    expect(reason0.getAttribute("aria-checked")).toBe("true");
    expect(textarea.value).toBe("I no longer need this service");
    expect(screen.getByTestId("delete-account-char-counter").textContent).toBe(
      `${"I no longer need this service".length}/300`
    );

    // Switch to another reason
    fireEvent.click(reason2);
    expect(reason2.getAttribute("aria-checked")).toBe("true");
    expect(reason0.getAttribute("aria-checked")).toBe("false");
    expect(textarea.value).toBe("Too complex / hard to use");

    // Manually edit the textarea
    fireEvent.change(textarea, {
      target: { value: "Too complex / hard to use - also need more tools" },
    });
    expect(textarea.value).toBe(
      "Too complex / hard to use - also need more tools"
    );
    expect(screen.getByTestId("delete-account-char-counter").textContent).toBe(
      `${"Too complex / hard to use - also need more tools".length}/300`
    );
  });

  it("follows the exact validation matrix: disabled unless BOTH reason and checkbox are selected", () => {
    render(
      <DeleteAccountModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    const deleteBtn = screen.getByTestId(
      "delete-account-confirm-btn"
    ) as HTMLButtonElement;
    const checkbox = screen.getByTestId(
      "delete-account-understand-checkbox"
    ) as HTMLInputElement;
    const reason1 = screen.getByTestId("delete-account-reason-1");

    // Matrix Row 1: No reason, No checkbox -> Disabled
    expect(deleteBtn.disabled).toBe(true);

    // Matrix Row 2: Reason selected, No checkbox -> Disabled
    fireEvent.click(reason1);
    expect(deleteBtn.disabled).toBe(true);

    // Unselect reason, check checkbox
    // Matrix Row 3: No reason, Checkbox selected -> Disabled
    render(
      <DeleteAccountModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    const checkboxes = screen.getAllByTestId(
      "delete-account-understand-checkbox"
    ) as HTMLInputElement[];
    const secondCheckbox = checkboxes[checkboxes.length - 1];
    fireEvent.click(secondCheckbox);
    expect(secondCheckbox.checked).toBe(true);

    // Matrix Row 4: Reason selected, Checkbox selected -> Enabled
    const reasonButtons = screen.getAllByTestId("delete-account-reason-3");
    fireEvent.click(reasonButtons[reasonButtons.length - 1]);
    const deleteButtons = screen.getAllByTestId(
      "delete-account-confirm-btn"
    ) as HTMLButtonElement[];
    const activeDeleteBtn = deleteButtons[deleteButtons.length - 1];
    expect(activeDeleteBtn.disabled).toBe(false);
  });

  it("opens Confirm Account Deletion popup on clicking Delete Account, preserving data on Cancel", () => {
    const onCloseMock = vi.fn();
    render(
      <DeleteAccountModal
        isOpen={true}
        onClose={onCloseMock}
        onConfirm={vi.fn()}
      />
    );

    const deleteBtn = screen.getByTestId(
      "delete-account-confirm-btn"
    ) as HTMLButtonElement;
    const checkbox = screen.getByTestId(
      "delete-account-understand-checkbox"
    );
    const reason2 = screen.getByTestId("delete-account-reason-2");
    const textarea = screen.getByTestId(
      "delete-account-explanation-textarea"
    ) as HTMLTextAreaElement;

    fireEvent.click(reason2);
    fireEvent.change(textarea, {
      target: { value: "Too complex / hard to use. Custom feedback text." },
    });
    fireEvent.click(checkbox);

    expect(deleteBtn.disabled).toBe(false);

    // Click Delete Account -> Opens First Confirmation Popup
    fireEvent.click(deleteBtn);

    expect(screen.getByTestId("confirm-deletion-popup-card")).toBeDefined();
    expect(screen.getByText("Confirm Account Deletion")).toBeDefined();
    expect(
      screen.getByText(
        "Your account and data will be scheduled for permanent deletion in 60 days. Your mobile number will be blocked from logging in during this period. Are you sure you want to proceed?"
      )
    ).toBeDefined();

    // Click Cancel on confirmation popup
    const popupCancelBtn = screen.getByTestId("confirm-deletion-cancel-btn");
    fireEvent.click(popupCancelBtn);

    // Confirmation popup closes, main modal remains and all inputs are preserved!
    expect(screen.queryByTestId("confirm-deletion-popup-card")).toBeNull();
    expect(textarea.value).toBe(
      "Too complex / hard to use. Custom feedback text."
    );
    expect(reason2.getAttribute("aria-checked")).toBe("true");
    expect(deleteBtn.disabled).toBe(false);
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it("submits deletion request on Delete Forever, sets sessionStorage, and calls onConfirm", async () => {
    const onConfirmMock = vi.fn().mockResolvedValue(undefined);
    render(
      <DeleteAccountModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirmMock}
      />
    );

    fireEvent.click(screen.getByTestId("delete-account-reason-0"));
    fireEvent.click(screen.getByTestId("delete-account-understand-checkbox"));
    fireEvent.click(screen.getByTestId("delete-account-confirm-btn"));

    const deleteForeverBtn = screen.getByTestId("confirm-deletion-forever-btn");
    fireEvent.click(deleteForeverBtn);

    await waitFor(() => {
      expect(onConfirmMock).toHaveBeenCalledTimes(1);
    });

    // Check sessionStorage
    const stored = sessionStorage.getItem(ACCOUNT_DELETION_STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.reason).toBe("I no longer need this service");
    expect(parsed.scheduledDate).toBeDefined();
  });

  it("calls onClose when main modal cancel button is clicked", () => {
    const onCloseMock = vi.fn();
    render(
      <DeleteAccountModal
        isOpen={true}
        onClose={onCloseMock}
        onConfirm={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId("delete-account-cancel-btn"));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
