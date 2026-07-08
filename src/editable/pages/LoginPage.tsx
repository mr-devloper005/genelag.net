import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/login', title: 'Sign in', description: pagesContent.auth.login.metadataDescription })
}

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className={`${dc.shell.section} grid min-h-[calc(100vh-12rem)] items-center gap-16 py-20 lg:grid-cols-[1fr_0.9fr] lg:py-28`}>
          <div>
            <EditableReveal index={0}>
              <p className={dc.type.eyebrow}>{pagesContent.auth.login.badge}</p>
            </EditableReveal>
            <EditableReveal index={1}>
              <h1 className={`${dc.type.displayTitle} mt-8 max-w-[16ch] text-[var(--slot4-page-text)]`}>
                {pagesContent.auth.login.title}
              </h1>
            </EditableReveal>
            <EditableReveal index={2}>
              <p className={`${dc.type.lead} ${pal.mutedText} mt-8 max-w-lg`}>{pagesContent.auth.login.description}</p>
            </EditableReveal>
          </div>
          <EditableReveal index={3}>
            <div className="rounded-[1rem] border border-[var(--editable-border-strong)] bg-white p-8 sm:p-12">
              <h2 className={`${dc.type.subsectionTitle} text-[var(--slot4-page-text)]`}>{pagesContent.auth.login.formTitle}</h2>
              <div className="mt-6">
                <EditableLocalLoginForm />
              </div>
              <p className={`mt-8 text-[14px] ${pal.mutedText}`}>
                New here?{' '}
                <Link href="/signup" className="editable-serif italic text-[var(--slot4-accent)] underline-offset-4 hover:underline">
                  {pagesContent.auth.login.createCta}
                </Link>
              </p>
            </div>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
