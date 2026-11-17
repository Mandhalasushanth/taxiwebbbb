// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  act,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ApplicationTrackerView } from "@modules/applications/components/ApplicationTracker/ApplicationTrackerView";
import { formatApplicationDateTime } from "@modules/applications/data/applicationTrackerData";
import { userStorage } from "@core/storage/userStorage";

describe("ApplicationTrackerView component", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders Overview tab matching mobile screenshot data with Application Details and What happens next card", () => {
    render(
      <MemoryRouter initialEntries={["/applications/track/GST-FIL-2026-31583"]}>
        <Routes>
          <Route
            path="/applications/track/:id"
            element={<ApplicationTrackerView />}
          />
        </Routes>
      </MemoryRouter>,
    );

    // Heading and cards
    expect(screen.getAllByText("Overview").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("Application Details").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("GST Return Details")).toBeNull();
    expect(screen.getByText("Service")).toBeDefined();
    expect(screen.getByText("Submission Date")).toBeDefined();
    expect(screen.getAllByText("Status").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("SUBMITTED").length).toBeGreaterThanOrEqual(1);

    // What happens next card
    expect(screen.getByText("What happens next?")).toBeDefined();
    expect(
      screen.getByText(/Your application has been submitted successfully/i),
    ).toBeDefined();
    expect(screen.getByText(/Have questions\? Chat with CA/i)).toBeDefined();
  });

  it('navigates to Chat with CA when clicking "Have questions? Chat with CA >" on Overview tab', async () => {
    render(
      <MemoryRouter initialEntries={["/applications/track/GST-FIL-2026-31583"]}>
        <Routes>
          <Route
            path="/applications/track/:id"
            element={<ApplicationTrackerView />}
          />
        </Routes>
      </MemoryRouter>,
    );

    const chatLink = screen.getByText(/Have questions\? Chat with CA/i);
    await act(async () => {
      fireEvent.click(chatLink);
    });

    expect(
      screen.getAllByText("Finsolz Support").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/Online · replies in a few minutes/i),
    ).toBeDefined();
  });

  it("renders Status tab with Application Submitted banner, 4-step vertical timeline, and bottom received note", async () => {
    render(
      <MemoryRouter
        initialEntries={["/applications/track/GST-FIL-2026-31583?tab=status"]}
      >
        <Routes>
          <Route
            path="/applications/track/:id"
            element={<ApplicationTrackerView />}
          />
        </Routes>
      </MemoryRouter>,
    );

    // Top card
    expect(
      screen.getAllByText("Application Submitted").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/Application submitted successfully on/i),
    ).toBeDefined();

    // 5 Default Steps matching reference
    expect(screen.getByText("Document Collection")).toBeDefined();
    expect(screen.getByText("Verification")).toBeDefined();
    expect(screen.getByText("Payment")).toBeDefined();
    expect(screen.getAllByText("Completed").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Step 2/5")).toBeNull();

    // Status pill badges
    expect(screen.getByText("In Progress")).toBeDefined();

    // Bottom note
    expect(screen.getByText("Application received")).toBeDefined();
    expect(screen.getByText(/queued for verification/i)).toBeDefined();
  });

  it("renders Documents tab matching mobile screenshot 3 with 4 uploaded documents and View button", () => {
    render(
      <MemoryRouter
        initialEntries={[
          "/applications/track/GST-FIL-2026-31583?tab=documents",
        ]}
      >
        <Routes>
          <Route
            path="/applications/track/:id"
            element={<ApplicationTrackerView />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getAllByText("Uploaded Documents").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Sales Invoices / Register")).toBeDefined();
    expect(screen.getByText("Purchase Invoices / Register")).toBeDefined();
    expect(screen.getByText("Bank Statement / Passbook")).toBeDefined();
    expect(screen.getByText("Other Supporting Documents")).toBeDefined();

    // View buttons
    const viewButtons = screen.getAllByRole("button", { name: /View/i });
    expect(viewButtons.length).toBeGreaterThanOrEqual(4);

    // Bottom note
    expect(
      screen.getByText(
        "These are the documents you uploaded during the application.",
      ),
    ).toBeDefined();
  });

  it("renders document icon for documents and image icon for photographs", () => {
    userStorage.saveUserApplication({
      id: "app-photo-doc-test",
      code: "GST-REG-PHOTO",
      title: "GST Registration",
      meta: "Sagarika Traders · India",
      statusLabel: "Submitted",
      statusTone: "info",
      progress: 25,
      icon: "📄",
      to: "/applications/track/GST-REG-PHOTO",
      documents: [
        { id: "d1", name: "Principal Place Address Proof", status: "uploaded" },
        {
          id: "d2",
          name: "Bank Passbook / Cancelled Cheque",
          status: "uploaded",
        },
        { id: "d3", name: "Passport Size Photograph", status: "uploaded" },
      ],
    });

    render(
      <MemoryRouter
        initialEntries={["/applications/track/GST-REG-PHOTO?tab=documents"]}
      >
        <Routes>
          <Route
            path="/applications/track/:id"
            element={<ApplicationTrackerView />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Principal Place Address Proof")).toBeDefined();
    expect(screen.getByText("Bank Passbook / Cancelled Cheque")).toBeDefined();
    expect(screen.getByText("Passport Size Photograph")).toBeDefined();

    // Photograph renders IMAGE meta, while documents render PDF meta
    expect(
      screen.getAllByText(/IMAGE · 245 KB/i).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/PDF · 245 KB/i).length).toBeGreaterThanOrEqual(
      2,
    );

    // Icons: document icon has title 'Document / PDF', image icon has title 'Image / Photograph'
    expect(
      screen.getAllByTitle("Document / PDF").length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      screen.getAllByTitle("Image / Photograph").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("opens document in a new tab when clicking View without showing a popup modal", async () => {
    const openSpy = vi
      .spyOn(window, "open")
      .mockImplementation(() => ({ focus: vi.fn() }) as any);

    render(
      <MemoryRouter
        initialEntries={[
          "/applications/track/GST-FIL-2026-31583?tab=documents",
        ]}
      >
        <Routes>
          <Route
            path="/applications/track/:id"
            element={<ApplicationTrackerView />}
          />
        </Routes>
      </MemoryRouter>,
    );

    const viewButtons = screen.getAllByRole("button", { name: /^View$/i });
    await act(async () => {
      fireEvent.click(viewButtons[0]);
    });

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("blob:"),
      "_blank",
    );
    expect(screen.queryByText("Close Preview")).toBeNull();
  });

  it('does not show Payments tab and keeps exactly 4 tabs (Overview, Status, Documents, Chat with CA)', () => {
    render(
      <MemoryRouter initialEntries={['/applications/track/GST-FIL-2026-31583']}>
        <Routes>
          <Route
            path="/applications/track/:id"
            element={<ApplicationTrackerView />}
          />
        </Routes>
      </MemoryRouter>,
    );

    // Only 4 navigation tabs
    const tabsNav = screen.getByRole('navigation', { name: 'Tracker Navigation Tabs' })
    const buttons = tabsNav.querySelectorAll('button')
    expect(buttons.length).toBe(4)

    const tabTexts = Array.from(buttons).map((b) => b.textContent?.trim() || '')
    expect(tabTexts.some((t) => t.includes('Overview'))).toBe(true)
    expect(tabTexts.some((t) => t.includes('Status'))).toBe(true)
    expect(tabTexts.some((t) => t.includes('Documents'))).toBe(true)
    expect(tabTexts.some((t) => t.includes('Chat with CA'))).toBe(true)
    expect(tabTexts.some((t) => t.includes('Payments'))).toBe(false)
  });

  it("renders Chat with CA tab using common chat support component matching Support Chat", async () => {
    render(
      <MemoryRouter
        initialEntries={["/applications/track/GST-FIL-2026-31583?tab=chat"]}
      >
        <Routes>
          <Route
            path="/applications/track/:id"
            element={<ApplicationTrackerView />}
          />
        </Routes>
      </MemoryRouter>,
    );

    // Common Chat Support Header and Status
    expect(
      await screen.findByText("Online · replies in a few minutes"),
    ).toBeDefined();
    expect(
      screen.getAllByText("Finsolz Support").length,
    ).toBeGreaterThanOrEqual(1);

    // Common Quick Action Prompts
    expect(await screen.findByText("Track my application")).toBeDefined();
    expect(screen.getByText("Payment issue")).toBeDefined();

    // Encryption & Input controls
    expect(
      screen.getByText(
        "This chat is encrypted and monitored for service quality.",
      ),
    ).toBeDefined();
    expect(screen.getByPlaceholderText("Type your message...")).toBeDefined();

    // Type and send a message via common chat support
    const input = screen.getByPlaceholderText("Type your message...");
    const sendBtn = screen.getByRole("button", { name: /Send message/i });

    await act(async () => {
      fireEvent.change(input, {
        target: { value: "When will the verification be completed?" },
      });
      fireEvent.click(sendBtn);
    });

    expect(
      await screen.findByText("When will the verification be completed?"),
    ).toBeDefined();
  });

  it("formats raw ISO dates cleanly without exposing raw ISO timestamps", () => {
    const raw = "2026-11-13T11:50:45.702Z, 11:36 am";
    const formatted = formatApplicationDateTime(raw);
    expect(formatted).not.toContain("T");
    expect(formatted).not.toContain("Z");
    expect(formatted).toMatch(/13 Nov 2026/);
  });
});
