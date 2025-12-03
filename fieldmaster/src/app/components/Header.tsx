// FMST-42
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";

/*
  Navigation items: simple array of label/href pairs used for desktop and mobile nav.
  Keep this small and serializable (no functions) so it is easy to test and reuse.
*/
const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Flächen", href: "/area" },
  { name: "Werkzeuge", href: "/tools" },
  { name: "Aufgaben", href: "/task" },
  { name: "Team", href: "/team" },
  { name: "Einstellungen", href: "/settings" },
];

/*
  Header component overview (high-level):
  - Implements a two-layer header UX:
      1) topHeader: the full-width header fixed at the top of the page (default).
      2) floatingHeader: a compact, centered header that "floats" with radius/shadow when the page is scrolled.
  - We switch visibility using two boolean states: topHidden and floatingVisible.
  - Timers sequence the animations: hide topHeader first, then show floatingHeader after a short delay,
    and the reverse when scrolling back to top. This avoids both headers capturing pointer events
    at the same time and provides a smooth transition.
  - pointer-events are toggled via classes so only the visible header receives clicks.
  - Accessibility considerations:
      * aria-hidden on the headers to signal which header is visually hidden.
      * aria-current on mobile nav links for the active page.
  - Path normalization is used to compare routes reliably ("/area" === "/area/").
*/
export default function Header() {
  const pathname = usePathname();
  // Normalize pathname so that trailing slashes do not break active-link detection.
  const normalizedPath = pathname ? pathname.replace(/\/+$/, "") || "/" : "/";
  const [open, setOpen] = useState(false);

  // Visual state management for the two-layer header system.
  const [topHidden, setTopHidden] = useState(false); // when true, full top header is hidden (moved up)
  const [floatingVisible, setFloatingVisible] = useState(false); // when true, floating header is shown

  // We store timer IDs so we can clear them reliably on cleanup or subsequent scroll events.
  const timers = useRef<number[]>([]);

  useEffect(() => {
    // Helper to clear pending timers and reset the array.
    const clearTimers = () => {
      timers.current.forEach((id) => clearTimeout(id));
      timers.current = [];
    };

    // Scroll handler: decides whether to show floating header or the full top header.
    const onScroll = () => {
      const isScrolled = window.scrollY > 0;

      if (isScrolled) {
        // User scrolled down: hide the full top header first, then show the floating header.
        // Sequence prevents both layers from being interactive at the same time.
        setTopHidden(true);
        clearTimers();
        timers.current.push(
          window.setTimeout(() => {
            setFloatingVisible(true);
          }, 200) // slight delay for perceived motion
        );
      } else {
        // User is at top: hide floating header, then bring back the full top header.
        setFloatingVisible(false);
        clearTimers();
        timers.current.push(
          window.setTimeout(() => {
            setTopHidden(false);
          }, 220) // small delay so topHeader animates back in after floating hides
        );
      }
    };

    onScroll(); // run once to set initial state on mount
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      // Cleanup event listener and any pending timers on unmount.
      window.removeEventListener("scroll", onScroll);
      clearTimers();
    };
  }, []);

  // Inline style for the floating header when visible.
  // Kept separate for clarity and to avoid repeating the same style object in JSX.
  const floatingStyle: React.CSSProperties = {
    width: "min(1100px, calc(100% - 2rem))",
    left: "50%",
    top: "1rem",
    transform: "translateX(-50%)",
    backgroundColor: "#242424",
    boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
    borderRadius: "0.5rem",
  };

  /*
    HeaderInner: the shared inner structure used by both header layers.
    This keeps markup consistent so only the container/outer style changes when switching.
    Structure:
      - Left: Logo (link to home)
      - Center: Desktop navigation (absolute centered)
      - Right: User controls (sign in/up or user avatar) and mobile menu button
  */
  const HeaderInner = (
    <>
      <div className="flex justify-between items-center px-6 h-full">
        {/* Logo: always links to "/" */}
        <Link href="/" className="mt-3 shrink-0">
          <Image src="/images/Logo.png" alt="FieldMaster Logo" width={150} height={40} />
        </Link>

        {/* Desktop navigation (visible on large screens).
            - Uses absolute centering so it remains centered regardless of logo / right-area width.
            - Each nav item receives an "active" style when the current path starts with the item's href.
            - The underline animation is implemented by adjusting width from 0 to full.
        */}
        <SignedIn>
          <nav className="hidden top-1/2 left-1/2 absolute gap-6 mt-1 px-4 max-w-[900px] -translate-x-1/2 -translate-y-1/2 show-desktop-1140">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative inline-flex flex-col items-center text-lg font-bold whitespace-nowrap px-3 transition`}
                >
                  {/* Label: color changes if active */}
                  <span className={`text-white transition ${active ? "text-secondary-500" : ""}`}>
                    {item.name}
                  </span>

                  {/* Decorative underline: expands on active or hover */}
                  <span
                    className={`block mt-1 bg-secondary-500 transition-all duration-200 ${
                      active ? "w-full h-1" : "w-0 h-1 group-hover:w-full"
                    }`}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </nav>
        </SignedIn>

        {/* Right side: authentication actions and mobile menu button.
            - SignedOut: show sign-in and sign-up buttons.
            - SignedIn: show the user button and mobile burger toggle.
            - The mobile menu button toggles the `open` state.
        */}
        <div className="flex flex-1 justify-end items-center gap-4 mr-2">
          <SignedOut>
            <SignInButton>
              <button className="text-white hover:text-secondary-500 transition cursor-pointer">
                Anmelden
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="bg-secondary-500 hover:bg-secondary-900 px-4 py-2 rounded-full font-medium text-white text-sm transition cursor-pointer">
                Registrieren
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          {/* Mobile menu button:
              - Visible only on small screens (lg:hidden).
              - Uses external SVG files from /public/icons for the burger/close icons.
              - Toggling `open` controls the mobile dropdown further below.
          */}
          <SignedIn>
            <button
              className="hover:bg-[#242424] p-2 rounded-lg text-white transition cursor-pointer hide-above-1140"
              onClick={() => setOpen(!open)}
              aria-label="Menü"
            >
              {open ? (
                <Image
                  src="/icons/close.svg"
                  alt="Schließen"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              ) : (
                <Image
                  src="/icons/menu-burger.svg"
                  alt="Menü"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              )}
            </button>
          </SignedIn>
        </div>
      </div>

      {/* Mobile navigation dropdown (only when signed in and `open` is true).
          - Uses the same navItems array.
          - Normalizes each item href to compare against the normalizedPath.
          - Closes the menu on link click to improve UX.
          - Applies visible/focus/active styles for accessibility.
      */}
      <SignedIn>
        {open && (
          <div className="top-[72px] left-1/2 absolute flex flex-col gap-2 bg-[#242424] shadow-[0_8px_16px_rgba(0,0,0,0.35)] p-2 rounded-lg w-[min(1100px,calc(100%-2rem))] -translate-x-1/2 hide-above-1140">
            {navItems.map((item) => {
              // Normalize link href for consistent comparisons (remove trailing slashes).
              const itemPath = item.href.replace(/\/+$/, "") || "/";
              const active =
                normalizedPath === itemPath || normalizedPath.startsWith(itemPath + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)} // close mobile menu when a link is chosen
                  aria-current={active ? "page" : undefined}
                  className={`group block text-base font-bold py-3 px-4 rounded-md transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 ${
                    active
                      ? "text-secondary-500 bg-[#1e1e1e]"
                      : "text-white hover:bg-[#2a2a2a] hover:text-secondary-500 focus:bg-[#2a2a2a] focus:text-secondary-500 active:bg-[#111111]"
                  }`}
                >
                  <span className="relative flex items-center">
                    {/* Side indicator that becomes visible on active / hover / focus */}
                    <span
                      className={`w-1 h-6 mr-3 rounded-full bg-transparent transition-colors duration-150 ${
                        active ? "bg-secondary-500" : "group-hover:bg-secondary-500 group-focus:bg-secondary-500"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.name}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </SignedIn>
    </>
  );

  /*
    Render two header elements:
    - The topHeader is full-width, fixed to top (z-40). It is the default header shown at page top.
    - The floatingHeader is centered, elevated and rounded (z-50). It appears when scrolling.
    - We toggle `pointer-events` through class names (pointer-events-none / pointer-events-auto)
      to ensure only the visible header accepts click events; this prevents click-target offsets.
    - aria-hidden is kept in sync with visual state so assistive tech ignores the hidden header.
  */
  return (
    <>
      <header
        aria-hidden={topHidden}
        className={
          "fixed z-40 w-full h-20 left-0 top-0 transition duration-300 ease-in-out " +
          (topHidden
            ? "-translate-y-full opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100 pointer-events-auto")
        }
      >
        <div className="bg-transparent h-full">
          <div className="bg-transparent h-full">{HeaderInner}</div>
        </div>
      </header>

      <header
        aria-hidden={!floatingVisible}
        className={
          "fixed z-50 h-20 transition-all duration-350 ease-in-out " +
          (floatingVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")
        }
        style={
          floatingVisible
            ? floatingStyle
            : {
                // When not visible position slightly above viewport to create a 'slide-in' effect
                width: "min(1100px, calc(100% - 2rem))",
                left: "50%",
                top: "-6rem",
                transform: "translateX(-50%)",
                backgroundColor: "#242424",
                boxShadow: "0 10px 30px rgba(0,0,0,0.0)",
                borderRadius: "0.5rem",
              }
        }
      >
        {HeaderInner}
      </header>
    </>
  );
}
