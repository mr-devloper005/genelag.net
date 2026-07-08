'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

/*
  Clean nav — no task labels, no library links here.
  Left: brand / Center-left: About, Contact / Right: search icon, auth actions.
  Footer is the discovery surface; this stays quiet.
*/

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  const staticLinks = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--editable-border)] bg-[var(--editable-nav-bg)]/95 text-[var(--editable-nav-text)] backdrop-blur-md">
      <nav className="mx-auto flex min-h-[80px] w-full max-w-[87rem] items-center gap-6 px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded border border-[var(--editable-border-strong)] bg-white">
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-9 w-9 object-contain" />
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="editable-serif block max-w-[220px] truncate text-[1.5rem] leading-none tracking-[-0.02em]">{SITE_CONFIG.name}</span>
            <span className="mt-1 block max-w-[220px] truncate text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-muted-text)]">
              {globalContent.nav?.tagline || SITE_CONFIG.tagline}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {staticLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[13px] font-medium tracking-[0.02em] transition ${
                isActive(item.href) ? 'text-[var(--slot4-accent)]' : 'text-[var(--slot4-muted-text)] hover:text-[var(--slot4-page-text)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--editable-border)] text-[var(--slot4-accent)] transition hover:border-[var(--slot4-accent)] hover:bg-white"
          >
            <Search className="h-4 w-4" />
          </Link>

          {session ? (
            <>
              <Link
                href="/create"
                className="hidden rounded-full bg-[var(--slot4-accent)] px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[var(--slot4-accent-secondary)] sm:inline-flex"
              >
                Submit
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden rounded-full border border-[var(--editable-border)] px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--slot4-muted-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-page-text)] sm:inline-flex"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full border border-[var(--editable-border)] px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--slot4-muted-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-page-text)] sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="hidden rounded-full bg-[var(--slot4-accent)] px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[var(--slot4-accent-secondary)] sm:inline-flex"
              >
                Get started
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--editable-border)] text-[var(--slot4-accent)] lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-[var(--editable-nav-bg)] px-5 py-6 lg:hidden">
          <div className="grid gap-1">
            {[
              { label: 'Home', href: '/' },
              ...staticLinks,
              ...(session
                ? [{ label: 'Submit', href: '/create' }]
                : [
                    { label: 'Sign in', href: '/login' },
                    { label: 'Get started', href: '/signup' },
                  ]),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-4 py-3 text-sm font-medium tracking-[0.02em] transition ${
                  isActive(item.href)
                    ? 'bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]'
                    : 'text-[var(--slot4-muted-text)] hover:bg-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {session ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  logout()
                }}
                className="rounded-md px-4 py-3 text-left text-sm font-medium tracking-[0.02em] text-[var(--slot4-muted-text)] hover:bg-white"
              >
                Sign out
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}
