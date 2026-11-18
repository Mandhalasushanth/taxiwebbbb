// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AccountDeletionScheduledModal } from "../../src/modules/authentication/components/AccountDeletionScheduledModal/AccountDeletionScheduledModal";
import { Login } from "../../src/modules/authentication/pages/Login/Login";
import { MemoryRouter } from "react-router-dom";

describe("AccountDeletionScheduledModal Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <AccountDeletionScheduledModal
        isOpen={false}
        scheduledDate="2027-01-17"
        onDismiss={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders scheduled deletion popup matching user prompt and screenshot 5", () => {
    const onDismissMock = vi.fn();
    render(
      <AccountDeletionScheduledModal
        isOpen={true}
        scheduledDate="2027-01-17"
        onDismiss={onDismissMock}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Account Deletion Scheduled" })
    ).toBeDefined();

    expect(
      screen.getByText(/Account deletion requested successfully/i)
    ).toBeDefined();
    expect(screen.getByTestId("deletion-scheduled-date").textContent).toBe(
      "2027-01-17"
    );
    expect(
      screen.getByText(
        /Your mobile number is blocked from logging in during this period/i
      )
    ).toBeDefined();

    // Close button
    const closeBtn = screen.getByTestId("deletion-scheduled-close-btn");
    expect(closeBtn).toBeDefined();

    // OK button
    const okBtn = screen.getByTestId("deletion-scheduled-ok-btn");
    expect(okBtn).toBeDefined();
    fireEvent.click(okBtn);
    expect(onDismissMock).toHaveBeenCalledTimes(1);
  });
});

describe("Login Page - Account Deletion Scheduled Flow", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it("does not show deletion scheduled popup during regular visit", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.queryByTestId("deletion-scheduled-modal-card")).toBeNull();
  });

  it("displays deletion scheduled popup automatically when sessionStorage has scheduled date, and clears on OK", () => {
    sessionStorage.setItem(
      "taxedge_account_deletion_scheduled",
      JSON.stringify({
        scheduledDate: "2027-01-17",
        reason: "No longer need this service",
      })
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Modal appears automatically
    expect(screen.getByTestId("deletion-scheduled-modal-card")).toBeDefined();
    expect(screen.getByTestId("deletion-scheduled-date").textContent).toBe(
      "2027-01-17"
    );

    // Click OK
    const okBtn = screen.getByTestId("deletion-scheduled-ok-btn");
    fireEvent.click(okBtn);

    // Modal closes and sessionStorage is cleared
    expect(screen.queryByTestId("deletion-scheduled-modal-card")).toBeNull();
    expect(
      sessionStorage.getItem("taxedge_account_deletion_scheduled")
    ).toBeNull();
  });
});
