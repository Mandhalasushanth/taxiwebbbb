// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { DeleteAccountModal } from "../../src/modules/profile/components/DeleteAccountModal/DeleteAccountModal";

describe("DeleteAccountModal Component", () => {
  afterEach(() => {
    cleanup();
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

  it("renders all elements matching user screenshot when open", () => {
    render(
      <DeleteAccountModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    // Title & Close button
    expect(screen.getByRole("heading", { name: "Delete Account" })).toBeDefined();
    expect(screen.getByTestId("delete-account-close-btn")).toBeDefined();

    // Permanent Action Warning Box
    expect(screen.getByText("Permanent Action")).toBeDefined();
    expect(
      screen.getByText(
        "Deleting your Finsolz account is irreversible. You will lose access to your application tracking and profile records."
      )
    ).toBeDefined();

    // 3 Bullet items
    expect(
      screen.getByText("All profile data, PAN, and KYC details will be unlinked.")
    ).toBeDefined();
    expect(
      screen.getByText(
        "Your active mobile authentication session will be revoked."
      )
    ).toBeDefined();
    expect(
      screen.getByText(
        "Government filings already processed with authorities remain legally archived."
      )
    ).toBeDefined();

    // Checkbox
    expect(
      screen.getByText(
        "I understand this will permanently delete my Finsolz account."
      )
    ).toBeDefined();

    // Action buttons
    const cancelBtn = screen.getByTestId("delete-account-cancel-btn");
    const confirmBtn = screen.getByTestId("delete-account-confirm-btn") as HTMLButtonElement;

    expect(cancelBtn).toBeDefined();
    expect(confirmBtn).toBeDefined();
    expect(confirmBtn.disabled).toBe(true);
  });

  it("enables Delete Account button only when checkbox is checked", () => {
    const onConfirmMock = vi.fn();
    render(
      <DeleteAccountModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirmMock}
      />
    );

    const confirmBtn = screen.getByTestId("delete-account-confirm-btn") as HTMLButtonElement;
    const checkbox = screen.getByTestId("delete-account-understand-checkbox") as HTMLInputElement;

    expect(confirmBtn.disabled).toBe(true);
    fireEvent.click(confirmBtn);
    expect(onConfirmMock).not.toHaveBeenCalled();

    // Check the box
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect(confirmBtn.disabled).toBe(false);

    // Click confirm
    fireEvent.click(confirmBtn);
    expect(onConfirmMock).toHaveBeenCalledTimes(1);

    // Uncheck the box disables it again
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
    expect(confirmBtn.disabled).toBe(true);
  });

  it("calls onClose when close icon or cancel button is clicked", () => {
    const onCloseMock = vi.fn();
    render(
      <DeleteAccountModal
        isOpen={true}
        onClose={onCloseMock}
        onConfirm={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTestId("delete-account-close-btn"));
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("delete-account-cancel-btn"));
    expect(onCloseMock).toHaveBeenCalledTimes(2);
  });

  it("calls onClose when Escape key is pressed", () => {
    const onCloseMock = vi.fn();
    render(
      <DeleteAccountModal
        isOpen={true}
        onClose={onCloseMock}
        onConfirm={vi.fn()}
      />
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
