import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className={`${dc.shell.section} ${dc.shell.sectionYLg}`}>
          <EditableReveal index={0}>
            <p className={dc.type.eyebrow}>{pagesContent.about.badge}</p>
          </EditableReveal>
          <EditableReveal index={1}>
            <h1 className={`${dc.type.displayTitle} mt-8 max-w-[18ch] text-[var(--slot4-page-text)]`}>
              About <span className="editable-serif italic">{SITE_CONFIG.name}</span>.
            </h1>
          </EditableReveal>
          <EditableReveal index={2}>
            <p className={`${dc.type.lead} ${pal.mutedText} mt-10 max-w-2xl`}>{pagesContent.about.description}</p>
          </EditableReveal>

          <div className="mt-24 grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-start">
            <EditableReveal index={3}>
              <div className="space-y-8">
                {pagesContent.about.paragraphs.map((paragraph) => (
                  <p key={paragraph} className={`${dc.type.body} ${pal.mutedText}`}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </EditableReveal>

            <div className="grid gap-6">
              {pagesContent.about.values.map((value, i) => (
                <EditableReveal key={value.title} index={i + 4}>
                  <div className="border-t border-[var(--editable-border-strong)] py-8">
                    <p className="editable-serif text-[3rem] leading-none tracking-[-0.02em] text-[var(--slot4-accent)]/40">
                      {String(i + 1).padStart(2, '0')}
                    </p>
                    <h2 className={`${dc.type.subsectionTitle} mt-6 text-[var(--slot4-page-text)]`}>{value.title}</h2>
                    <p className={`${dc.type.body} ${pal.mutedText} mt-4`}>{value.description}</p>
                  </div>
                </EditableReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
