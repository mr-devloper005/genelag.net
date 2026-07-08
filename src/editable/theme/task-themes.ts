import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Shared visual language — every task consumes one palette (olipy tokens).
  Only kicker/note copy varies per task. The two user-visible task labels are:
    pdf     → "Reference Library" (public)
    profile → "Contributor" (direct-URL detail only)
*/

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const FONT_DISPLAY = "'Libre Baskerville', Georgia, 'Times New Roman', serif"
const FONT_BODY = "'Geist', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

const base = {
  dark: false,
  fontDisplay: FONT_DISPLAY,
  fontBody: FONT_BODY,
  bg: '#f4f5f7',
  surface: '#ffffff',
  raised: '#eef0f4',
  text: '#022997',
  muted: '#022997b3',
  line: '#02299726',
  accent: '#022997',
  accentSoft: '#d0ddff',
  onAccent: '#ffffff',
  glow: 'rgba(2,41,151,0.06)',
  radius: '1rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Journal', note: 'Considered essays and long reads.' },
  listing: { ...base, kicker: 'Index', note: 'A quiet directory of noteworthy places.' },
  classified: { ...base, kicker: 'Announcements', note: 'Fresh notices and open calls.' },
  image: { ...base, kicker: 'Gallery', note: 'Standout images and visual studies.' },
  sbm: { ...base, kicker: 'Marginalia', note: 'Curated links worth returning to.' },
  pdf: { ...base, kicker: 'Reference Library', note: 'A careful shelf of documents, guides and reports — free to read, download and cite.' },
  profile: { ...base, kicker: 'Contributor', note: 'A person behind the shelf.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.pdf
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
