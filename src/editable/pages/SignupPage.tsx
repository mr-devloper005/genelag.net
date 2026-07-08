import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/signup', title: 'Get started', description: pagesContent.auth.signup.metadataDescription })
}

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className={`${dc.shell.section} grid min-h-[calc(100vh-12rem)] items-center gap-16 py-20 lg:grid-cols-[0.9fr_1fr] lg:py-28`}>
          <EditableReveal index={0}>
            <div className="rounded-[1rem] border border-[var(--editable-border-strong)] bg-white p-8 sm:p-12">
              <h1 className={`${dc.type.subsectionTitle} text-[var(--slot4-page-text)]`}>{pagesContent.auth.signup.formTitle}</h1>
              <div className="mt-6">
                <EditableLocalSignupForm />
              </div>
              <p className={`mt-8 text-[14px] ${pal.mutedText}`}>
                Already have an account?{' '}
                <Link href="/login" className="editable-serif italic text-[var(--slot4-accent)] underline-offset-4 hover:underline">
                  {pagesContent.auth.signup.loginCta}
                </Link>
              </p>
            </div>
          </EditableReveal>
          <div>
            <EditableReveal index={1}>
              <p className={dc.type.eyebrow}>{pagesContent.auth.signup.badge}</p>
            </EditableReveal>
            <EditableReveal index={2}>
              <h2 className={`${dc.type.displayTitle} mt-8 max-w-[16ch] text-[var(--slot4-page-text)]`}>
                {pagesContent.auth.signup.title}
              </h2>
            </EditableReveal>
            <EditableReveal index={3}>
              <p className={`${dc.type.lead} ${pal.mutedText} mt-8 max-w-lg`}>{pagesContent.auth.signup.description}</p>
            </EditableReveal>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
