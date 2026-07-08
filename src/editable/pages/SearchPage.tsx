import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Filter, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => (typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : '')
const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const compactRaw = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const summaryOf = (post: SitePost) => {
  const raw = post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''
  return stripHtml(raw).replace(/\s+/g, ' ').trim()
}

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  // Profiles never appear in public search results.
  if (derivedTask === 'profile') return false
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'pdf'}`}/${post.slug}`
  const summary = summaryOf(post)
  const cfgLabel = SITE_CONFIG.tasks.find((item) => item.key === task)?.label
  // Never surface the raw "Profile" label publicly — remap to Reference.
  const label = task === 'profile' ? 'Reference' : task === 'pdf' ? 'Reference' : cfgLabel || 'Entry'

  return (
    <Link
      href={href}
      className={`group flex flex-col justify-between gap-8 rounded-[1rem] border border-[var(--editable-border)] bg-white p-8 transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-accent)]`}
    >
      <div>
        <p className="editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--slot4-accent)]">
          {label} · {String(index + 1).padStart(2, '0')}
        </p>
        <h2 className={`${dc.type.subsectionTitle} mt-6 text-[var(--slot4-page-text)] line-clamp-3`}>{post.title}</h2>
        {summary ? <p className={`${dc.type.body} ${pal.mutedText} mt-4 line-clamp-3`}>{summary}</p> : null}
      </div>
      <span className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--slot4-accent)]">
        Open entry <ArrowUpRight className="h-4 w-4 transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }>
}) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length
    ? feed.posts
    : useMaster
    ? []
    : SITE_CONFIG.tasks.filter((item) => item.enabled && item.key !== 'profile').flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const publicTasks = SITE_CONFIG.tasks.filter((item) => item.enabled && item.key !== 'profile')
  const footerSize = pickRandom(getSlotSizes('footer'))

  return (
    <EditableSiteShell>
      <main className={dc.shell.page}>
        <section className={`${dc.shell.section} py-16 sm:py-24`}>
          <EditableReveal index={0}>
            <p className={dc.type.eyebrow}>{pagesContent.search.hero.badge}</p>
          </EditableReveal>
          <EditableReveal index={1}>
            <h1 className={`${dc.type.displayTitle} mt-8 max-w-[18ch] text-[var(--slot4-page-text)]`}>
              {pagesContent.search.hero.title}
            </h1>
          </EditableReveal>
          <EditableReveal index={2}>
            <p className={`${dc.type.lead} ${pal.mutedText} mt-8 max-w-2xl`}>{pagesContent.search.hero.description}</p>
          </EditableReveal>

          <EditableReveal index={3}>
            <form action="/search" className="mt-14 grid gap-3 rounded-[1rem] border border-[var(--editable-border-strong)] bg-white p-4 sm:grid-cols-[1.5fr_1fr_auto] sm:p-3">
              <input type="hidden" name="master" value="1" />
              <label className="flex items-center gap-3 rounded-full border border-[var(--editable-border)] bg-white px-5 py-3.5">
                <Search className="h-5 w-5 text-[var(--slot4-accent)]" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder={pagesContent.search.hero.placeholder}
                  className="min-w-0 flex-1 bg-transparent editable-serif italic text-[16px] outline-none placeholder:text-[var(--slot4-muted-text)]"
                />
              </label>
              <div className="flex items-center gap-3 rounded-full border border-[var(--editable-border)] bg-white px-5 py-3.5">
                <Filter className="h-4 w-4 text-[var(--slot4-accent)]" />
                <select
                  name="task"
                  defaultValue={task}
                  className="min-w-0 flex-1 bg-transparent text-[13px] font-medium uppercase tracking-[0.14em] outline-none"
                >
                  <option value="">All entries</option>
                  {publicTasks.map((item) => (
                    <option key={item.key} value={item.key}>{item.label}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className={dc.button.primary}>
                <span className="btn-text">Search</span>
                <span className="btn-text-hover">Search</span>
              </button>
            </form>
          </EditableReveal>

          <EditableReveal index={4}>
            <div className="mt-16 flex flex-wrap items-end justify-between gap-4 border-t border-[var(--editable-border-strong)] pt-8">
              <div>
                <p className="editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--slot4-muted-text)]">
                  {results.length} results
                </p>
                <h2 className={`${dc.type.subsectionTitle} mt-3 text-[var(--slot4-page-text)]`}>
                  {query ? <>Results for <span className="editable-serif italic">“{query}”</span>.</> : pagesContent.search.resultsTitle}
                </h2>
              </div>
              <Link href="/pdf" className={dc.button.ghost}>
                Browse the shelf <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </EditableReveal>

          {results.length ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post, index) => (
                <EditableReveal key={post.id || post.slug} index={index}>
                  <SearchResultCard post={post} index={index} />
                </EditableReveal>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-[1rem] border border-dashed border-[var(--editable-border-strong)] bg-white p-12 text-center">
              <h3 className={`${dc.type.subsectionTitle} text-[var(--slot4-page-text)]`}>Nothing on the shelf matches that.</h3>
              <p className={`${dc.type.body} ${pal.mutedText} mt-4`}>Try a different keyword or category.</p>
            </div>
          )}

          <div className="mt-16">
            <Ads slot="footer" size={footerSize} showLabel className="mx-auto w-full" />
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
