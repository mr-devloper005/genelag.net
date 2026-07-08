'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, FileText, Lock, Send } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const fieldClass =
  'w-full rounded-lg border border-[var(--editable-border-strong)] bg-white px-4 py-3.5 editable-serif italic text-[15px] text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-muted-text)] focus:border-[var(--slot4-accent)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

// Public contribute UI centers on the Reference Library. Profile is excluded
// from the surfaced task picker (it is still supported internally).
function publicTasks() {
  return SITE_CONFIG.tasks.filter((t) => t.enabled && t.key !== 'profile')
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => publicTasks(), [])
  const pdfKey = (enabledTasks.find((t) => t.key === 'pdf')?.key || enabledTasks[0]?.key || 'pdf') as TaskKey
  const [task, setTask] = useState<TaskKey>(pdfKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className={dc.shell.page}>
          <section className={`${dc.shell.section} py-20 sm:py-28`}>
            <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <EditableReveal index={0}>
                <div className="flex h-72 items-center justify-center rounded-[1rem] bg-[var(--slot4-dark-bg)] text-white">
                  <Lock className="h-16 w-16 opacity-80" />
                </div>
              </EditableReveal>
              <div>
                <EditableReveal index={1}>
                  <p className={dc.type.eyebrow}>{pagesContent.create.locked.badge}</p>
                </EditableReveal>
                <EditableReveal index={2}>
                  <h1 className={`${dc.type.displayTitle} mt-8 max-w-[18ch] text-[var(--slot4-page-text)]`}>
                    {pagesContent.create.locked.title}
                  </h1>
                </EditableReveal>
                <EditableReveal index={3}>
                  <p className={`${dc.type.lead} ${pal.mutedText} mt-8 max-w-xl`}>{pagesContent.create.locked.description}</p>
                </EditableReveal>
                <EditableReveal index={4}>
                  <div className="mt-10 flex flex-wrap gap-4">
                    <Link href="/login" className={dc.button.primary}>
                      <span className="btn-text inline-flex items-center gap-2">
                        Sign in <ArrowUpRight className="h-4 w-4" />
                      </span>
                      <span className="btn-text-hover">
                        Sign in <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </Link>
                    <Link href="/signup" className={dc.button.secondary}>
                      <span className="btn-text">Get started</span>
                      <span className="btn-text-hover">Get started</span>
                    </Link>
                  </div>
                </EditableReveal>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className={`${dc.shell.section} py-16 sm:py-24`}>
          <EditableReveal index={0}>
            <p className={dc.type.eyebrow}>{pagesContent.create.hero.badge}</p>
          </EditableReveal>
          <EditableReveal index={1}>
            <h1 className={`${dc.type.displayTitle} mt-8 max-w-[18ch] text-[var(--slot4-page-text)]`}>
              {pagesContent.create.hero.title}
            </h1>
          </EditableReveal>
          <EditableReveal index={2}>
            <p className={`${dc.type.lead} ${pal.mutedText} mt-8 max-w-2xl`}>{pagesContent.create.hero.description}</p>
          </EditableReveal>

          <div className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <aside>
              <p className="editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">Entry type</p>
              <div className="mt-6 grid gap-3">
                {enabledTasks.map((item) => {
                  const active = item.key === task
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTask(item.key as TaskKey)}
                      className={`group flex items-start gap-4 rounded-[1rem] border p-5 text-left transition duration-500 ${
                        active
                          ? 'border-[var(--slot4-accent)] bg-[var(--slot4-accent)] text-white'
                          : 'border-[var(--editable-border)] bg-white hover:-translate-y-1 hover:border-[var(--slot4-accent)]'
                      }`}
                    >
                      <FileText className="h-5 w-5 shrink-0" />
                      <div>
                        <span className="editable-serif block text-[1.15rem] leading-none tracking-[-0.01em]">
                          {item.key === 'pdf' ? 'Reference Library' : item.label}
                        </span>
                        <span className={`mt-2 block text-[12px] ${active ? 'text-white/75' : pal.mutedText}`}>
                          {item.description}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </aside>

            <form onSubmit={submit} className="rounded-[1rem] border border-[var(--editable-border-strong)] bg-white p-8 sm:p-12">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">Draft</p>
                  <h2 className={`${dc.type.subsectionTitle} mt-3 text-[var(--slot4-page-text)]`}>{pagesContent.create.formTitle}</h2>
                </div>
                <span className={dc.badge.pill}>{session.name}</span>
              </div>

              <div className="mt-8 grid gap-4">
                <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title of the entry" required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
                  <input className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="File or source URL" />
                </div>
                <input className={fieldClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Cover image URL" />
                <textarea className={`${fieldClass} min-h-24`} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short summary — one paragraph is enough." required />
                <textarea className={`${fieldClass} min-h-56`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Full description, notes, or body of the entry" required />
              </div>

              {created ? (
                <div className="mt-6 rounded-[1rem] border border-[var(--slot4-accent)]/40 bg-[var(--slot4-accent-soft)] p-5 text-[var(--slot4-accent)]">
                  <p className="inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.16em]">
                    <CheckCircle2 className="h-5 w-5" /> {pagesContent.create.successTitle}
                  </p>
                  <p className="mt-2 editable-serif text-[1.15rem] tracking-[-0.01em]">{created.title}</p>
                </div>
              ) : null}

              <button type="submit" className={`${dc.button.primary} mt-8 w-full`}>
                <span className="btn-text inline-flex items-center gap-2">
                  <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
                </span>
                <span className="btn-text-hover">
                  <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
                </span>
              </button>
            </form>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
