'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

/*
  Footer is the discovery surface.
  Discovery column lists ONLY the Reference Library (renamed pdf task).
  No profile links anywhere — profile detail is direct-URL only.
*/

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()
  const brandLine = (globalContent.footer?.description || SITE_CONFIG.description) as string

  return (
    <footer className="border-t border-[var(--editable-border-strong)] bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto grid max-w-[87rem] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-12 lg:py-24">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded border border-white/25 bg-white/5">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-9 w-9 object-contain" />
            </span>
            <span className="editable-serif text-[2rem] leading-none tracking-[-0.02em] text-white">{SITE_CONFIG.name}</span>
          </Link>
          <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-white/70">{brandLine}</p>
          <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.24em] text-white/50">{globalContent.footer?.tagline}</p>
        </div>

        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/55">Discover</h3>
          <div className="mt-6 grid gap-3">
            <Link
              href="/pdf"
              className="group inline-flex items-center justify-between gap-2 border-b border-white/15 pb-3 editable-serif text-[1.3rem] leading-none tracking-[-0.01em] text-white transition hover:text-[var(--slot4-accent-soft)]"
            >
              <span>Reference Library</span>
              <ArrowUpRight className="h-4 w-4 shrink-0 transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <p className="text-[13px] leading-[1.6] text-white/60">
              A quiet shelf of documents, guides and reports — free to read, download and cite.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/55">Resources</h3>
          <div className="mt-6 grid gap-3">
            {[
              ['About the room', '/about'],
              ['Write to us', '/contact'],
              ['Search the shelf', '/search'],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="inline-flex items-center gap-2 text-[14px] font-medium text-white/75 transition hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/55">Account</h3>
          <div className="mt-6 grid gap-3">
            {session ? (
              <>
                <Link href="/create" className="inline-flex items-center gap-2 text-[14px] font-medium text-white/75 transition hover:text-white">
                  Contribute
                </Link>
                <button type="button" onClick={logout} className="text-left text-[14px] font-medium text-white/75 transition hover:text-white">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="inline-flex items-center gap-2 text-[14px] font-medium text-white/75 transition hover:text-white">
                  Sign in
                </Link>
                <Link href="/signup" className="inline-flex items-center gap-2 text-[14px] font-medium text-white/75 transition hover:text-white">
                  Get started
                </Link>
                <Link href="/create" className="inline-flex items-center gap-2 text-[14px] font-medium text-white/75 transition hover:text-white">
                  Contribute
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Big brand wordmark strip, like the reference footer's oversized mark */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[87rem] overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
          <p className="editable-serif whitespace-nowrap text-[18vw] leading-[0.9] tracking-[-0.05em] text-white/8 sm:text-[16vw] lg:text-[13vw]">
            {SITE_CONFIG.name}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[87rem] flex-col items-start gap-3 px-5 py-6 text-[12px] font-medium tracking-[0.02em] text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <span>© {year} {SITE_CONFIG.name}. {globalContent.footer?.bottomNote || 'All rights reserved.'}</span>
          <span className="uppercase tracking-[0.24em] text-white/45">Kept slowly · read freely</span>
        </div>
      </div>
    </footer>
  )
}
