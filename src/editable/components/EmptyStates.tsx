import Link from 'next/link'
import { ArrowUpRight, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({
  title = 'Nothing on this shelf yet',
  description = 'New entries will appear here as they are filed to the library.',
  actionLabel = 'Back to the reading room',
  actionHref = '/',
  className,
}: EmptyStateProps) {
  return (
    <section className={cn('rounded-[1rem] border border-current/15 bg-current/[0.03] p-10 text-center', className)}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-current/10">
        <SearchX className="h-6 w-6" />
      </div>
      <h2 className="editable-serif mt-6 text-[1.9rem] leading-tight tracking-[-0.02em]">{title}</h2>
      <p className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.7] text-current/70">{description}</p>
      <Link
        href={actionHref}
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-current/25 px-6 py-3 text-[12px] font-medium uppercase tracking-[0.2em] transition hover:bg-current hover:text-[var(--slot4-on-accent)]"
      >
        {actionLabel}
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </section>
  )
}

export function TaskEmptyState({ taskLabel = 'entries', className }: { taskLabel?: string; className?: string }) {
  return (
    <EmptyState
      className={className}
      title={`No ${taskLabel} available yet`}
      description={`New ${taskLabel} will appear here as they are filed to the library.`}
      actionLabel="Back to the reading room"
      actionHref="/"
    />
  )
}

export function ContactSuccessState({ className }: { className?: string }) {
  return (
    <EmptyState
      className={className}
      title="Message received"
      description="Someone from the reading room will reply from a real inbox."
      actionLabel="Back to the reading room"
      actionHref="/"
    />
  )
}
