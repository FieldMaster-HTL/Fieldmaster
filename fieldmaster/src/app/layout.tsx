import { type Metadata } from 'next'
import Link from 'next/link'
// Clerk imports for authentication | FMST-25, FMST-27, FMST-28, FMST-29
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Fieldmaster — Feld‑ und Einsatzverwaltung',
  description: 'Fieldmaster: Verwaltung von Flächen, Einsätzen und Werkzeugen — schnell, übersichtlich und zuverlässig.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <header className="flex justify-end items-center gap-4 p-4 h-16">
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button className="bg-[#6c47ff] px-4 sm:px-5 rounded-full h-10 sm:h-12 font-medium text-white text-sm sm:text-base cursor-pointer">
                  Registrieren
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <nav className="flex items-center gap-4 mr-auto">
                <Link href="/dashboard" className="text-sm font-medium hover:text-primary-500 transition-colors">
                  Übersicht
                </Link>
                <Link href="/area" className="text-sm font-medium hover:text-primary-500 transition-colors">
                  Flächen
                </Link>
                <Link href="/task" className="text-sm font-medium hover:text-primary-500 transition-colors">
                  Aufgaben
                </Link>
                <Link href="/tools" className="text-sm font-medium hover:text-primary-500 transition-colors">
                  Werkzeuge
                </Link>
              </nav>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}