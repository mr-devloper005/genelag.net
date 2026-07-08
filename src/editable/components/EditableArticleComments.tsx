'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { MessageCircle, Send } from 'lucide-react'

type Comment = { id: string; name: string; comment: string; createdAt: string }

const storageKey = (slug: string) => `editable:article-comments:${slug}`

function initial(name: string) {
  return (name.trim()[0] || 'G').toUpperCase()
}

export function EditableArticleComments({ slug, comments = [] }: { slug: string; comments?: Comment[] }) {
  const [stored, setStored] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(slug))
      setStored(raw ? (JSON.parse(raw) as Comment[]) : [])
    } catch {
      setStored([])
    }
  }, [slug])

  const persist = (next: Comment[]) => {
    setStored(next)
    try {
      window.localStorage.setItem(storageKey(slug), JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = text.trim()
    if (!body) return
    const entry: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim() || 'Guest',
      comment: body,
      createdAt: new Date().toISOString(),
    }
    persist([entry, ...stored])
    setText('')
  }

  const all = useMemo(() => [...stored, ...comments], [stored, comments])

  return (
    <section className="mt-20 border-t border-[var(--tk-line)] pt-14">
      <div className="flex items-center gap-3 editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--tk-muted)]">
        <MessageCircle className="h-4 w-4 text-[var(--tk-accent)]" /> Marginalia
        <span>({all.length})</span>
      </div>
      <h3 className="editable-serif mt-4 text-[2rem] leading-[1.1] tracking-[-0.02em]">Leave a note in the margin.</h3>

      <form onSubmit={submit} className="mt-8 grid gap-4 rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name (optional)"
          maxLength={60}
          className="h-12 w-full rounded-lg border border-[var(--tk-line)] bg-white px-4 editable-serif italic text-[15px] outline-none transition focus:border-[var(--tk-accent)]"
        />
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Share your thoughts…"
          rows={4}
          maxLength={1500}
          className="w-full resize-y rounded-lg border border-[var(--tk-line)] bg-white px-4 py-3 editable-serif italic text-[15px] leading-[1.6] outline-none transition focus:border-[var(--tk-accent)]"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!text.trim()}
            className="editable-btn-slide inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3 text-[12px] font-medium uppercase tracking-[0.2em] text-white transition duration-500 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span className="btn-text">Post</span>
            <span className="btn-text-hover">Post</span>
          </button>
        </div>
      </form>

      <div className="mt-8 grid gap-3">
        {all.map((comment) => (
          <div key={comment.id} className="rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
            <div className="flex items-center gap-3">
              <span className="editable-serif flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[1.1rem] text-[var(--tk-accent)]">
                {initial(comment.name)}
              </span>
              <p className="editable-serif truncate text-[1.1rem] tracking-[-0.01em] text-[var(--tk-text)]">{comment.name || 'Guest'}</p>
            </div>
            <p className="mt-4 whitespace-pre-line text-[15px] leading-[1.7] text-[var(--tk-text)]">{comment.comment}</p>
          </div>
        ))}
        {!all.length ? <p className="text-[14px] text-[var(--tk-muted)]">Be the first to leave a note.</p> : null}
      </div>
    </section>
  )
}
