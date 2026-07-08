import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import type { SitePost, SiteFeedPagination } from '@/lib/site-connector'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'
import { ArticleListCard, postHref } from '@/editable/cards/PostCards'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export function EditableArticleArchive({
  posts,
  pagination,
  category = 'all',
  basePath = '/article',
}: {
  posts: SitePost[]
  pagination: SiteFeedPagination
  category?: string
  basePath?: string
}) {
  const voice = taskPageVoices.article
  const page = pagination.page || 1
  const pageHref = (nextPage: number) =>
    `${basePath}?${new URLSearchParams({ ...(category && category !== 'all' ? { category } : {}), page: String(nextPage) }).toString()}`

  return (
    <main className={dc.shell.page}>
      <section className={`${dc.shell.section} py-20 sm:py-28`}>
        <EditableReveal index={0}>
          <p className={dc.type.eyebrow}>{voice.eyebrow}</p>
        </EditableReveal>
        <EditableReveal index={1}>
          <h1 className={`${dc.type.displayTitle} mt-8 max-w-[20ch] text-[var(--slot4-page-text)]`}>{voice.headline}</h1>
        </EditableReveal>
        <EditableReveal index={2}>
          <p className={`${dc.type.lead} ${pal.mutedText} mt-8 max-w-2xl`}>{voice.description}</p>
        </EditableReveal>
        <EditableReveal index={3}>
          <form action={basePath} className="mt-10 flex max-w-xl flex-wrap gap-3">
            <select
              name="category"
              defaultValue={category || 'all'}
              className="min-w-0 flex-1 rounded-full border border-[var(--editable-border-strong)] bg-white px-5 py-3 text-[13px] font-medium text-[var(--slot4-page-text)] outline-none"
            >
              <option value="all">All categories</option>
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item.slug} value={item.slug}>{item.name}</option>
              ))}
            </select>
            <button className={dc.button.primary}>
              <span className="btn-text">Filter</span>
              <span className="btn-text-hover">Filter</span>
            </button>
          </form>
        </EditableReveal>
      </section>

      <section className={`${dc.shell.section} pb-24`}>
        {posts.length ? (
          <div className="grid gap-6">
            {posts.map((post, index) => (
              <EditableReveal key={post.id} index={index}>
                <ArticleListCard post={post} href={postHref('article', post, basePath)} index={index + (page - 1) * pagination.limit} />
              </EditableReveal>
            ))}
          </div>
        ) : (
          <div className={`${dc.surface.soft} p-12 text-center`}>
            <h2 className={`${dc.type.subsectionTitle}`}>Nothing on this shelf yet.</h2>
            <p className={`mt-4 text-[15px] leading-[1.7] ${pal.mutedText}`}>Try another category, or return to the library.</p>
          </div>
        )}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          {pagination.hasPrevPage ? (
            <Link href={pageHref(page - 1)} className={dc.button.secondary}>
              <span className="btn-text">Previous</span>
              <span className="btn-text-hover">Previous</span>
            </Link>
          ) : null}
          <span className="rounded-full border border-[var(--editable-border-strong)] px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-muted-text)]">
            Page {page} of {pagination.totalPages || 1}
          </span>
          {pagination.hasNextPage ? (
            <Link href={pageHref(page + 1)} className={dc.button.primary}>
              <span className="btn-text">Next</span>
              <span className="btn-text-hover">Next</span>
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export function EditableArticleDetailShell({ slug, post }: { slug: string; post: SitePost | null }) {
  const voice = taskPageVoices.article
  return (
    <main className={dc.shell.page}>
      <section className={`${dc.shell.section} py-20 sm:py-28`}>
        <Link
          href="/pdf"
          className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the library
        </Link>
        <p className={`${dc.type.eyebrow} mt-10`}>{voice.eyebrow}</p>
        <h1 className={`${dc.type.displayTitle} mt-8 max-w-[20ch] text-[var(--slot4-page-text)]`}>
          {post?.title || pagesContent.detailPages.article.fallbackTitle}
        </h1>
        <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[1rem] border border-[var(--editable-border-strong)] bg-white p-8 sm:p-12">
            <p className={`${dc.type.body} ${pal.mutedText}`}>
              {post?.summary || `Entry ${slug} will render through the editable detail page.`}
            </p>
          </div>
          <aside className="rounded-[1rem] bg-[var(--slot4-dark-bg)] p-8 text-white sm:p-10">
            <p className="editable-mono text-[11px] uppercase tracking-[0.22em] text-white/60">Reading note</p>
            <p className="mt-6 text-[15px] leading-[1.75] text-white/80">{voice.secondaryNote}</p>
            <Link
              href="/contact"
              className="editable-btn-slide mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-accent)] transition duration-500 hover:bg-[var(--slot4-accent-soft)]"
            >
              <span className="btn-text inline-flex items-center gap-2">
                Contact <ArrowUpRight className="h-4 w-4" />
              </span>
              <span className="btn-text-hover">
                Contact <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </aside>
        </div>
      </section>
    </main>
  )
}
