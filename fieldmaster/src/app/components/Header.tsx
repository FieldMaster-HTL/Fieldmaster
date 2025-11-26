// FMST-42
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";

// Navigationspunkte
const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Flächen", href: "/area" },
  { name: "Werkzeuge", href: "/tools" },
  { name: "Aufgaben", href: "/task" },
  { name: "Team", href: "/team" },
  { name: "Einstellungen", href: "/settings" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="top-4 left-1/2 z-50 fixed rounded-lg h-20"
      style={{
        width: "min(1100px, calc(100% - 2rem))",
        transform: "translateX(-50%)",
        backgroundColor: "#242424",
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
      }}
    >
      <div className="flex justify-between items-center px-6 h-full">
        {/* Logo - links */}
        <Link href="/" className="flex-shrink-0 mt-3">
          <Image src="/images/Logo.png" alt="FieldMaster Logo" width={150} height={40} />
        </Link>

        {/* Desktop Navigation */}
        <SignedIn>
          <nav className="hidden lg:flex flex-1 justify-center gap-6 mt-4 px-4 max-w-[900px]">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative inline-flex flex-col items-center text-lg font-bold whitespace-nowrap px-3 transition`}
                >
                  <span className={`text-white transition ${active ? "text-secondary-500" : ""}`}>
                    {item.name}
                  </span>
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

        {/* Rechts: User Bereich */}
        <div className="flex flex-1 justify-end items-center gap-4">
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

          {/* Mobile Menü Button */}
          <SignedIn>
            <button className="lg:hidden p-2 text-white cursor-pointer" onClick={() => setOpen(!open)}>
              {open ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </SignedIn>
        </div>
      </div>

      {/* Mobile Navigation */}
      <SignedIn>
        {open && (
          <div className="lg:hidden top-[72px] left-1/2 absolute flex flex-col gap-2 bg-[#242424] shadow-[0_8px_16px_rgba(0,0,0,0.35)] p-4 rounded-lg w-[min(1100px,calc(100%-2rem))] -translate-x-1/2">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block text-base font-bold py-2 px-4 rounded-lg transition cursor-pointer ${
                    active ? "text-secondary-500 bg-[#3a3a3a]" : "text-white hover:bg-[#3a3a3a]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </SignedIn>
    </header>
  );
}
