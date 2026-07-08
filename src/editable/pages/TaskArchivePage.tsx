import Link from 'next/link'
import { ArrowUpRight, ChevronDown, Download, FileText, Search } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { Ads, getSlotSizes } from '@/lib/ads'

/*
  Archive template — the Reference Library (pdf) is the only publicly promoted archive.
  Other task archives keep their functional cards but are not surfaced from nav/home.
  The pdf archive gets the reference-inspired editorial layout + one header ad.
*/

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-8 md:grid-cols-2 xl:grid-cols-3',
  listing: 'grid gap-6 xl:grid-cols-2',
  classified: 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
}

const cardBase = 'group block rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1'

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return (
    <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
  )
}

export function TaskArchiveView({
  task,
  posts,
  pagination,
  category,
  basePath,
}: {
  task: TaskKey
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  basePath: string
}) {
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const isLibrary = task === 'pdf'
  const headerSize = isLibrary ? pickRandom(getSlotSizes('header')) : null

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <header className="relative overflow-hidden border-b border-[var(--tk-line)]">
          <div className={`${dc.shell.section} py-20 sm:py-28 lg:py-32`}>
            <EditableReveal index={0}>
              <p className={`${dc.type.eyebrow}`}>{theme.kicker}</p>
            </EditableReveal>
            <EditableReveal index={1}>
              <h1 className={`${dc.type.heroTitle} mt-6 max-w-[18ch] text-[var(--tk-text)]`}>
                {voice?.headline || theme.kicker}
              </h1>
            </EditableReveal>
            <EditableReveal index={2}>
              <p className={`${dc.type.lead} ${pal.mutedText} mt-8 max-w-2xl`}>{voice?.description || theme.note}</p>
            </EditableReveal>
            {voice?.chips?.length ? (
              <EditableReveal index={3}>
                <div className="mt-8 flex flex-wrap gap-3">
                  {voice.chips.map((chip) => (
                    <span key={chip} className={dc.badge.pill}>{chip}</span>
                  ))}
                </div>
              </EditableReveal>
            ) : null}

            <EditableReveal index={4}>
              <div className="mt-14 flex flex-col gap-5 border-t border-[var(--tk-line)] pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] font-medium tracking-[0.02em] text-[var(--tk-muted)]">
                  <span className="editable-serif text-[1.6rem] leading-none text-[var(--tk-text)]">{posts.length}</span>{' '}
                  <span className="uppercase tracking-[0.22em]">on the shelf · {categoryLabel}</span>
                </p>
                <form action={basePath} className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      name="category"
                      defaultValue={category}
                      className="h-12 appearance-none rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] pl-5 pr-11 text-[13px] font-medium text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-accent)]"
                      aria-label={voice?.filterLabel || 'Filter category'}
                    >
                      <option value="all">All categories</option>
                      {CATEGORY_OPTIONS.map((item) => (
                        <option key={item.slug} value={item.slug}>{item.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                  </div>
                  <button className={dc.button.primary}>
                    <span className="btn-text">Apply</span>
                    <span className="btn-text-hover">Apply</span>
                  </button>
                </form>
              </div>
            </EditableReveal>
          </div>
        </header>

        {isLibrary && headerSize ? (
          <div className={`${dc.shell.section} pt-8`}>
            <Ads slot="header" size={headerSize} showLabel className="mx-auto w-full" />
          </div>
        ) : null}

        <section className={`${dc.shell.section} py-16 sm:py-20 lg:py-24`}>
          {posts.length ? (
            <div className={taskGrid[task]}>
              {posts.map((post, index) => (
                <EditableReveal key={post.id || post.slug} index={index}>
                  <ArchivePostCard post={post} task={task} basePath={basePath} index={index} />
                </EditableReveal>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-[1rem] border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-20 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className={`${dc.type.subsectionTitle} mt-6`}>Nothing on this shelf yet</h2>
              <p className="mt-3 text-[14px] leading-7 text-[var(--tk-muted)]">Try another category, or check back soon.</p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-20 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? (
                <Link href={pageHref(basePath, category, page - 1)} className={dc.button.secondary}>
                  <span className="btn-text">Previous</span>
                  <span className="btn-text-hover">Previous</span>
                </Link>
              ) : null}
              <span className={`rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.2em] ${pal.mutedText}`}>
                Page {page} of {pagination.totalPages || 1}
              </span>
              {pagination.hasNextPage ? (
                <Link href={pageHref(basePath, category, page + 1)} className={dc.button.primary}>
                  <span className="btn-text">Next</span>
                  <span className="btn-text-hover">Next</span>
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} index={index} />
  if (task === 'listing') return <ArticleArchiveCard post={post} href={href} index={index} />
  if (task === 'classified') return <ArticleArchiveCard post={post} href={href} index={index} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Entry')
  return (
    <Link href={href} className={`${cardBase} overflow-hidden`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.03]" />
      </div>
      <div className="p-6 sm:p-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">
          {category} · {String(index + 1).padStart(2, '0')}
        </p>
        <h2 className="editable-serif mt-4 text-[1.6rem] leading-[1.15] tracking-[-0.02em]">{post.title}</h2>
        <p className="mt-4 line-clamp-3 text-[14px] leading-[1.7] text-[var(--tk-muted)]">{getSummary(post)}</p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--tk-accent)]">
          Open <ArrowUpRight className="h-4 w-4 transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link href={href} className="group mb-6 block break-inside-avoid overflow-hidden rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(2,41,151,0.78))]" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h2 className="editable-serif line-clamp-2 text-[1.3rem] leading-snug tracking-[-0.02em] text-white">{post.title}</h2>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className={`${cardBase} flex gap-5 p-6`}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <ArrowUpRight className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Marginalia · {String(index + 1).padStart(2, '0')}</span>
        <h2 className="editable-serif mt-2 text-[1.25rem] leading-snug tracking-[-0.01em]">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-[14px] leading-[1.7] text-[var(--tk-muted)]">{getSummary(post)}</p>
        {website ? <p className="mt-3 truncate text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--tk-accent)]">{cleanDomain(website)}</p> : null}
      </div>
    </Link>
  )
}

function PdfArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const category = getCategory(post, 'Reference')
  const pages = getField(post, ['pages', 'pageCount'])
  const size = getField(post, ['fileSize', 'size'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col overflow-hidden`}>
      <div className="flex items-start justify-between gap-6 border-b border-[var(--tk-line)] bg-[var(--tk-raised)] p-6">
        <div className="flex items-center gap-4">
          <span className="editable-serif text-[3rem] leading-none tracking-[-0.03em] text-[var(--tk-accent)]/30">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tk-accent)] text-white">
            <FileText className="h-6 w-6" />
          </div>
        </div>
        <span className="rounded-full border border-[var(--tk-line)] bg-white/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--tk-muted)]">
          {category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-6 sm:p-7">
        <h2 className="editable-serif text-[1.5rem] leading-[1.15] tracking-[-0.02em]">{post.title}</h2>
        <p className="line-clamp-3 flex-1 text-[14px] leading-[1.7] text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">
          {pages ? <span>{pages} pages</span> : null}
          {size ? <span>{size}</span> : null}
          <span>PDF</span>
        </div>
        <span className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--tk-accent)]">
          Open on the shelf <Download className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  // Kept functional; profile archive is never publicly linked, but if someone
  // reaches it by direct URL, this renders a quiet placeholder card.
  return (
    <Link href={href} className={`${cardBase} flex flex-col gap-4 p-7`}>
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--tk-accent)]">Contributor</p>
      <h2 className="editable-serif text-[1.4rem] leading-snug tracking-[-0.02em]">{post.title}</h2>
      <p className="line-clamp-3 text-[14px] leading-[1.7] text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}
