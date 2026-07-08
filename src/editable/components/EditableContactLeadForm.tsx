'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

const fieldClass =
  'h-12 w-full rounded-lg border border-[var(--editable-border-strong)] bg-white px-4 editable-serif italic text-[15px] text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-muted-text)] focus:border-[var(--slot4-accent)]'

export function EditableContactLeadForm() {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setMessage('')
    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data?.message || 'Unable to send your message.')
      setStatus('success')
      setMessage(data?.message || 'Thank you — your note is with us.')
      form.reset()
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Unable to send your message.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field name="name" label="Your name" placeholder="Full name" required />
        <Field name="email" type="email" label="Email" placeholder="you@example.com" required />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field name="phone" label="Phone" placeholder="Optional" />
        <Field name="subject" label="Subject" placeholder="What is this about?" />
      </div>
      <label className="grid gap-2 editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">
        Message
        <textarea
          name="message"
          required
          rows={6}
          placeholder="Tell us what you were looking for…"
          className="rounded-lg border border-[var(--editable-border-strong)] bg-white px-4 py-4 editable-serif italic text-[15px] leading-[1.6] text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-muted-text)] focus:border-[var(--slot4-accent)]"
        />
      </label>
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {message ? (
        <div
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-[13px] font-medium ${
            status === 'success'
              ? 'border-[var(--slot4-accent)]/40 bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]'
              : 'border-red-300 bg-red-50 text-red-700'
          }`}
        >
          {status === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : null}
          <span>{message}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="editable-btn-slide inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent)] px-6 text-[13px] font-medium uppercase tracking-[0.18em] text-white transition duration-500 hover:bg-[var(--slot4-accent-secondary)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        <span className="btn-text">Send the note</span>
        <span className="btn-text-hover">Send the note</span>
      </button>
    </form>
  )
}

function Field({ name, label, type = 'text', placeholder, required = false }: { name: string; label: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">
      {label}
      <input name={name} type={type} required={required} placeholder={placeholder} className={fieldClass} />
    </label>
  )
}
