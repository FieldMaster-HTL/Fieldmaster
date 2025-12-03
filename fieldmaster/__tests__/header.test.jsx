// FMST-42
/**
 * Header component tests
 *
 * English documentation:
 * - These tests verify core Header behaviors:
 *   1) Rendering of logo and navigation for a signed-in user.
 *   2) Mobile menu toggle: opening the mobile dropdown and verifying the active link (aria-current).
 *   3) Scroll-driven header transitions: when the page is scrolled the floating header appears,
 *      and when scrolled back to top the top header returns. Timers are advanced to allow delayed
 *      transitions to complete.
 *
 * Notes:
 * - next/navigation, next/link, next/image and @clerk/nextjs are mocked to keep tests fast and isolated.
 * - Jest fake timers are used to advance time for the component's setTimeout sequences.
 */

import React from "react";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import Header from "../src/app/components/Header";

// Mock next/navigation usePathname
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));
const { usePathname } = require("next/navigation");

// Mock next/image to a simple img element
jest.mock("next/image", () => (props) => {
  // eslint-disable-next-line jsx-a11y/alt-text
  return React.createElement("img", { ...props });
});

// Mock next/link to render a plain anchor so hrefs are visible to tests
jest.mock("next/link", () => {
  return ({ href, children, ...rest }) =>
    React.createElement("a", { href, ...rest }, children);
});

// Mock Clerk components used in Header
jest.mock("@clerk/nextjs", () => ({
  SignedIn: ({ children }) => children, // Render children to test signed-in UI
  SignedOut: () => null, // Hide signed-out UI for these tests
  SignInButton: ({ children }) => React.createElement("div", null, children),
  SignUpButton: ({ children }) => React.createElement("div", null, children),
  // Do not spread props onto a DOM element to avoid unknown-prop warnings
  UserButton: () => React.createElement("div", { "data-testid": "user-button" }, null),
}));

describe("Header component", () => {
  beforeEach(() => {
    // default pathname used by tests unless overridden in a specific test
    usePathname.mockReturnValue("/area");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders logo, desktop navigation and toggles mobile menu showing active link", () => {
    // Render component (initial scroll at top)
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    const { container } = render(React.createElement(Header));

    // Logo image is present (there are two headers -> two logos; pick the first)
    const logos = screen.getAllByAltText("FieldMaster Logo");
    expect(logos.length).toBeGreaterThan(0);

    // Desktop nav contains an item (e.g. "Flächen") - scope to the top header to avoid duplicates
    const topHeader = container.querySelectorAll("header")[0];
    const nav = topHeader.querySelector("nav");
    const navWithin = within(nav);
    const desktopNavItem = navWithin.getByText("Flächen");
    expect(desktopNavItem).toBeTruthy();

    // Mobile menu button: restrict query to the top header to avoid duplicate matches
    const menuButton = within(topHeader).getByLabelText("Menü");
    expect(menuButton).toBeTruthy();

    // Click to open mobile menu
    act(() => {
      fireEvent.click(menuButton);
    });

    // The mobile dropdown marks the active link with aria-current="page"
    const activeAnchors = document.querySelectorAll('a[aria-current="page"]');
    expect(activeAnchors.length).toBeGreaterThan(0);
    const activeTexts = Array.from(activeAnchors).map((a) => a.textContent?.trim());
    expect(activeTexts).toContain("Flächen");
  });

  test("transitions between topHeader and floatingHeader on scroll with timers", () => {
    jest.useFakeTimers();

    // Start at top
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    usePathname.mockReturnValue("/"); // irrelevant for this test
    const { container } = render(React.createElement(Header));

    // Initially both headers are rendered; top header should not be hidden (aria-hidden="false")
    const topHeader = container.querySelectorAll("header")[0];
    const floatingHeader = container.querySelectorAll("header")[1];
    expect(topHeader).toBeTruthy();
    expect(floatingHeader).toBeTruthy();
    expect(topHeader.getAttribute("aria-hidden")).toBe("false");

    // Simulate scroll down (wrap in act to avoid async state warnings)
    act(() => {
      window.scrollY = 120;
      fireEvent(window, new Event("scroll"));
    });

    // topHidden set immediately; floatingVisible after 200ms
    expect(topHeader.getAttribute("aria-hidden")).toBe("true");

    // Advance timers to allow floating header to become visible
    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(floatingHeader.getAttribute("aria-hidden")).toBe("false");

    // Now scroll back to top
    act(() => {
      window.scrollY = 0;
      fireEvent(window, new Event("scroll"));
    });

    // floating header hides immediately
    expect(floatingHeader.getAttribute("aria-hidden")).toBe("true");

    // After delay the top header should come back
    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(topHeader.getAttribute("aria-hidden")).toBe("false");

    act(() => {
      jest.useRealTimers();
    });
  });
});