'use client'

import { BookOpen, FileText, Mail } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

const lanes = [
  {
    icon: BookOpen,
    title: 'Reading room questions',
    body: 'Can’t find an entry, or curious whether we shelve a certain kind of reference? Tell us what you were looking for.',
  },
  {
    icon: FileText,
    title: 'Contribute a document',
    body: 'You have a report, guide or reference you think belongs on the shelf. Send us the file and a short summary.',
  },
  {
    icon: Mail,
    title: 'Anything else',
    body: 'Corrections, quiet feedback, or a note about the reading room — the inbox is always open.',
  },
]

export default function ContactPage() {
  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className={`${dc.shell.section} ${dc.shell.sectionYLg}`}>
          <EditableReveal index={0}>
            <p className={dc.type.eyebrow}>{pagesContent.contact.eyebrow}</p>
          </EditableReveal>
          <EditableReveal index={1}>
            <h1 className={`${dc.type.displayTitle} mt-8 max-w-[20ch] text-[var(--slot4-page-text)]`}>
              {pagesContent.contact.title}
            </h1>
          </EditableReveal>
          <EditableReveal index={2}>
            <p className={`${dc.type.lead} ${pal.mutedText} mt-10 max-w-2xl`}>{pagesContent.contact.description}</p>
          </EditableReveal>

          <div className="mt-20 grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div className="space-y-3">
              {lanes.map((lane, i) => (
                <EditableReveal key={lane.title} index={i + 3}>
                  <div className="border-t border-[var(--editable-border-strong)] py-8">
                    <lane.icon className="h-6 w-6 text-[var(--slot4-accent)]" />
                    <h2 className={`${dc.type.subsectionTitle} mt-6 text-[var(--slot4-page-text)]`}>{lane.title}</h2>
                    <p className={`${dc.type.body} ${pal.mutedText} mt-4`}>{lane.body}</p>
                  </div>
                </EditableReveal>
              ))}
            </div>

            <EditableReveal index={6}>
              <div className="rounded-[1rem] border border-[var(--editable-border-strong)] bg-white p-8 lg:p-12">
                <h2 className={`${dc.type.subsectionTitle} text-[var(--slot4-page-text)]`}>{pagesContent.contact.formTitle}</h2>
                <div className="mt-6">
                  <EditableContactLeadForm />
                </div>
              </div>
            </EditableReveal>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
