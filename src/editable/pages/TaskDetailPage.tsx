import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Building2,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Tag,
  UserRound,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { taskThemeStyle } from '@/editable/theme/task-themes'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { Ads, getSlotSizes } from '@/lib/ads'

/*
  Task detail — brand-new layouts for the Reference Library (pdf) and
  Contributor (profile) views. PDF = public document workspace with a large
  embedded preview and no decorative imagery. Profile = premium direct-URL
  contributor record with hero avatar, sidebar contact panel and their filed
  entries (never links to OTHER profiles). No dates rendered on either page.
*/

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateEditableDetailMetadata(
  task: TaskKey,
  params: Promise<{ slug?: string; username?: string }>
) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({
  task,
  params,
}: {
  task: TaskKey
  params: Promise<{ slug?: string; username?: string }>
}) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  // For a contributor detail we still want related items — but never other
  // profiles. Pull related from the Reference Library instead.
  const related =
    task === 'profile'
      ? (await fetchTaskPosts('pdf', 7)).slice(0, 4)
      : (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

/* --------------------- content extraction helpers --------------------- */

const getContent = (post: SitePost) =>
  post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images)
    ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar']
    .map((key) => asText(content[key]))
    .filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return (
    asText(content.body) ||
    asText(content.description) ||
    asText(content.details) ||
    post.summary ||
    'Details will appear here once filed.'
  )
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const safeUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : '#')

const linkifyMarkdown = (value: string) =>
  value.replace(
    /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi,
    (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`
  )

const linkifyText = (value: string) =>
  linkifyMarkdown(value).replace(
    /(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi,
    (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`
  )

const hardenLinks = (html: string) =>
  html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
    let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    if (!/\starget=/i.test(next)) next += ' target="_blank"'
    if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
    return `<a ${next}>`
  })

const sanitizeHtml = (html: string) =>
  hardenLinks(
    html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"')
  )

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) =>
  post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) =>
  asText(getContent(post).category) || post.tags?.[0] || fallback

const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

const contributorTags = (post: SitePost): string[] => {
  const t = Array.isArray(post.tags) ? post.tags.filter((tag): tag is string => typeof tag === 'string' && Boolean(tag)) : []
  const kw = asText(getContent(post).keywords)
  if (t.length) return t.slice(0, 6)
  if (kw) return kw.split(/[,;]+/).map((s) => s.trim()).filter(Boolean).slice(0, 6)
  return []
}

/* ----------------------------- top-level view ----------------------------- */

export function TaskDetailView({
  task,
  post,
  related,
  comments = [],
}: {
  task: TaskKey
  post: SitePost
  related: SitePost[]
  comments?: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

/* -------------------------------------------------------------------------- */
/*                              PDF · public                                  */
/*    Reference Library detail — rich, premium document workspace.            */
/* -------------------------------------------------------------------------- */

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  const category = categoryOf(post, 'Reference')
  const pages = getField(post, ['pages', 'pageCount'])
  const fileSize = getField(post, ['fileSize', 'size'])
  const uploader = getField(post, ['author', 'uploader', 'contributor'])
  const lead = leadText(post)
  const bodyHtml = formatPlainText(getBody(post))
  const tags = contributorTags(post)
  const articleBottomSize = pickRandom(getSlotSizes('article-bottom'))

  // "What's inside" — parse first few h2/h3 or use bullet fallbacks.
  const inside = extractInsideSections(getBody(post))

  return (
    <section className="relative overflow-hidden">
      <div className={`${dc.shell.section} py-14 sm:py-20 lg:py-24`}>
        <BackLink task="pdf" label="Back to the library" />

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* ------------------------ Article column ------------------------ */}
          <article className="min-w-0">
            <EditableReveal index={0}>
              <div className="flex flex-wrap items-center gap-3">
                <span className={dc.badge.accentPill}>Reference document</span>
                <span className={dc.badge.pill}>PDF</span>
                <span className="editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                  {category}
                </span>
              </div>
            </EditableReveal>

            <EditableReveal index={1}>
              <h1 className="editable-serif mt-8 text-[2.6rem] leading-[1.02] tracking-[-0.03em] sm:text-[3.75rem] lg:text-[5rem]">
                {post.title}
              </h1>
            </EditableReveal>

            {lead ? (
              <EditableReveal index={2}>
                <blockquote className="editable-serif mt-10 border-l-2 border-[var(--tk-accent)] pl-6 text-[1.35rem] italic leading-[1.5] text-[var(--tk-text)] sm:text-[1.6rem]">
                  {lead}
                </blockquote>
              </EditableReveal>
            ) : null}

            <EditableReveal index={3}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                {fileUrl ? (
                  <Link
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`${dc.button.primary} min-w-[220px]`}
                  >
                    <span className="btn-text inline-flex items-center gap-2">
                      Download PDF <Download className="h-4 w-4" />
                    </span>
                    <span className="btn-text-hover">
                      Download PDF <Download className="h-4 w-4" />
                    </span>
                  </Link>
                ) : null}
                {fileUrl ? (
                  <Link href={fileUrl} target="_blank" rel="noreferrer" className={dc.button.secondary}>
                    <span className="btn-text inline-flex items-center gap-2">
                      Open in new tab <ExternalLink className="h-4 w-4" />
                    </span>
                    <span className="btn-text-hover">
                      Open in new tab <ExternalLink className="h-4 w-4" />
                    </span>
                  </Link>
                ) : null}
              </div>
            </EditableReveal>

            <EditableReveal index={4}>
              <dl className="mt-14 grid grid-cols-2 gap-6 border-y border-[var(--tk-line)] py-8 sm:grid-cols-2">
                <FactCell label="Format" value="PDF" />
                <FactCell label="Category" value={category} />
              </dl>
            </EditableReveal>

            {/* Large embedded preview — the article's visual centerpiece. */}
            {fileUrl ? (
              <EditableReveal index={5}>
                <div className="mt-14 overflow-hidden rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                  <div className="flex items-center justify-between gap-4 border-b border-[var(--tk-line)] bg-[var(--tk-surface)] p-5">
                    <p className="editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                      Document preview
                    </p>
                    <Link
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--tk-accent)] hover:opacity-70"
                    >
                      Full-screen <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <iframe
                    src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    title={post.title}
                    className="h-[80vh] w-full bg-[var(--tk-raised)]"
                  />
                </div>
              </EditableReveal>
            ) : null}

            {/* Two-column body: display h2 + sanitized body */}
            <EditableReveal index={6}>
              <div className="mt-20 grid gap-14 lg:grid-cols-[240px_minmax(0,1fr)]">
                <div className="hidden lg:block">
                  <p className="editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                    On the shelf
                  </p>
                  <h2 className="editable-serif mt-4 text-[2rem] leading-[1.05] tracking-[-0.02em] text-[var(--tk-text)]">
                    About this reference.
                  </h2>
                </div>
                <div className="min-w-0">
                  <h2 className="editable-serif text-[2.2rem] leading-[1.08] tracking-[-0.02em] text-[var(--tk-text)] lg:hidden">
                    About this reference.
                  </h2>
                  <div
                    className="article-content mt-6 max-w-none text-[1.05rem] leading-[1.85]"
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                  />
                </div>
              </div>
            </EditableReveal>

            {tags.length ? (
              <EditableReveal index={7}>
                <div className="mt-16 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className={dc.badge.pill}>
                      {tag}
                    </span>
                  ))}
                </div>
              </EditableReveal>
            ) : null}

            {/* Repeated CTA callout at the bottom of the article */}
            {fileUrl ? (
              <EditableReveal index={8}>
                <div className="mt-20 overflow-hidden rounded-[1rem] bg-[var(--tk-text)] p-8 text-white sm:p-14">
                  <p className="editable-mono text-[11px] uppercase tracking-[0.22em] text-white/60">Take it with you</p>
                  <h3 className="editable-serif mt-6 max-w-2xl text-[2rem] leading-[1.08] tracking-[-0.02em] sm:text-[2.75rem]">
                    Free to read, download and cite — like everything else on the shelf.
                  </h3>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="editable-btn-slide inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)] transition duration-500 hover:bg-[var(--slot4-accent-soft)]"
                    >
                      <span className="btn-text inline-flex items-center gap-2">
                        Download PDF <Download className="h-4 w-4" />
                      </span>
                      <span className="btn-text-hover">
                        Download PDF <Download className="h-4 w-4" />
                      </span>
                    </Link>
                    <Link
                      href="/pdf"
                      className="editable-btn-slide inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-transparent px-7 py-3.5 text-[13px] font-medium uppercase tracking-[0.16em] text-white transition duration-500 hover:bg-white/10"
                    >
                      <span className="btn-text">Back to the shelf</span>
                      <span className="btn-text-hover">Back to the shelf</span>
                    </Link>
                  </div>
                </div>
              </EditableReveal>
            ) : null}

            {/* ONE article-bottom ad, before related strip */}
            <EditableReveal index={9}>
              <div className="mt-20">
                <Ads slot="article-bottom" size={articleBottomSize} showLabel className="mx-auto w-full" />
              </div>
            </EditableReveal>
          </article>

          {/* ---------------------------- Sidebar --------------------------- */}
          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <EditableReveal index={0}>
              <div className="rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8">
                {/* document glyph — serif letter, not raster */}
                <div className="flex h-40 items-center justify-center rounded-[1rem] bg-[var(--tk-raised)] text-[var(--tk-accent)]">
                  <span className="editable-serif text-[7rem] leading-none tracking-[-0.05em]">Aa</span>
                </div>
                <p className="mt-6 editable-mono truncate text-[11px] uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                  {(post.slug || post.title).replace(/-/g, '_')}.pdf
                </p>
                <dl className="mt-6 grid gap-4 text-[13px]">
                  <SidebarRow label="Category" value={category} />
                  <SidebarRow label="Uploaded by" value={uploader || SITE_CONFIG.name} />
                </dl>
                {fileUrl ? (
                  <Link
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`${dc.button.primary} mt-8 w-full`}
                  >
                    <span className="btn-text inline-flex items-center gap-2">
                      Download <Download className="h-4 w-4" />
                    </span>
                    <span className="btn-text-hover">
                      Download <Download className="h-4 w-4" />
                    </span>
                  </Link>
                ) : null}
              </div>
            </EditableReveal>

            <EditableReveal index={1}>
              <div className="rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8">
                <p className="editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                  What&rsquo;s inside
                </p>
                <ul className="mt-5 grid gap-3 text-[14px] leading-[1.7]">
                  {inside.map((line, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="editable-serif mt-1 text-[var(--tk-accent)]">§</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </EditableReveal>
          </aside>
        </div>
      </div>

      {/* Related documents strip — glyph tiles, no photography */}
      <PdfRelatedStrip related={related} />
    </section>
  )
}

function FactCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--tk-muted)]">{label}</dt>
      <dd className="editable-serif mt-3 text-[1.3rem] leading-[1.2] tracking-[-0.01em] text-[var(--tk-text)]">{value}</dd>
    </div>
  )
}

function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-[var(--tk-line)] pb-4 last:border-b-0 last:pb-0">
      <dt className="editable-mono text-[10px] uppercase tracking-[0.22em] text-[var(--tk-muted)]">{label}</dt>
      <dd className="editable-serif text-right text-[14px] tracking-[-0.01em] text-[var(--tk-text)]">{value}</dd>
    </div>
  )
}

function extractInsideSections(body: string): string[] {
  const stripped = body.replace(/<[^>]*>/g, '\n')
  const heads = Array.from(stripped.matchAll(/^\s*#{1,3}\s+(.+)$/gm)).map((m) => m[1].trim())
  if (heads.length >= 3) return heads.slice(0, 6)
  const lines = stripped
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 6 && s.length < 90)
    .slice(0, 6)
  if (lines.length) return lines
  return [
    'Introduction and scope',
    'Key concepts and definitions',
    'Methodology and sources',
    'Findings and analysis',
    'Practical notes for readers',
    'Further reading',
  ]
}

function PdfRelatedStrip({ related }: { related: SitePost[] }) {
  if (!related.length) return null
  return (
    <section className="border-t border-[var(--tk-line)] bg-[var(--tk-raised)]">
      <div className={`${dc.shell.section} py-16 sm:py-24`}>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--tk-accent)]">
              Also on the shelf
            </p>
            <h2 className="editable-serif mt-4 text-[2rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.75rem]">
              Nearby entries.
            </h2>
          </div>
          <Link
            href="/pdf"
            className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--tk-accent)] hover:opacity-70"
          >
            Browse all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => {
            const href = `/pdf/${item.slug}`
            const size = getField(item, ['fileSize', 'size'])
            return (
              <Link
                key={item.id || item.slug}
                href={href}
                className="group flex h-full flex-col justify-between gap-8 rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 transition duration-500 hover:-translate-y-1 hover:border-[var(--tk-accent)]"
              >
                <div className="flex h-32 items-center justify-center rounded-[0.75rem] bg-[var(--tk-raised)] text-[var(--tk-accent)]">
                  <span className="editable-serif text-[5rem] leading-none tracking-[-0.05em]">Aa</span>
                </div>
                <div>
                  <h3 className="editable-serif line-clamp-3 text-[1.15rem] leading-[1.2] tracking-[-0.01em]">
                    {item.title}
                  </h3>
                  <p className="mt-3 editable-mono text-[11px] uppercase tracking-[0.2em] text-[var(--tk-muted)]">
                    {size || 'PDF'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*                          PROFILE · direct URL                              */
/*    Contributor detail — premium record, never surfaced/linked publicly.    */
/* -------------------------------------------------------------------------- */

function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const avatar = images[0]
  const role = getField(post, ['role', 'designation', 'company'])
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const links = extractProfileLinks(post)
  const mapSrc = mapSrcFor(post)
  const lead = leadText(post)
  const bodyHtml = formatPlainText(getBody(post))
  const tags = contributorTags(post)
  const sidebarSize = pickRandom(getSlotSizes('sidebar'))

  return (
    <section className="relative overflow-hidden">
      {/* Hero band */}
      <div className="border-b border-[var(--tk-line)] bg-[var(--tk-raised)]">
        <div className={`${dc.shell.section} py-16 sm:py-24 lg:py-28`}>
          <BackLink task="profile" label="Back" />
          <div className="mt-14 grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
            <EditableReveal index={0}>
              <div className="mx-auto flex h-56 w-56 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_30px_80px_-20px_rgba(2,41,151,0.4)] sm:h-60 sm:w-60 lg:mx-0">
                {avatar ? (
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-24 w-24 text-[var(--tk-muted)]" />
                )}
              </div>
            </EditableReveal>
            <div className="min-w-0 text-center lg:text-left">
              <EditableReveal index={1}>
                <p className={dc.badge.accentPill + ' inline-flex'}>Contributor</p>
              </EditableReveal>
              <EditableReveal index={2}>
                <h1 className="editable-serif mt-6 text-[3rem] leading-[1.02] tracking-[-0.03em] sm:text-[4.5rem]">
                  {post.title}
                </h1>
              </EditableReveal>
              {role ? (
                <EditableReveal index={3}>
                  <p className="editable-serif italic mt-5 text-[1.3rem] leading-[1.5] text-[var(--tk-muted)] sm:text-[1.5rem]">
                    {role}
                  </p>
                </EditableReveal>
              ) : null}
              {lead ? (
                <EditableReveal index={4}>
                  <p className="mt-8 max-w-xl text-[1.05rem] leading-[1.75] text-[var(--tk-muted)] lg:mx-0 lg:max-w-2xl">
                    {lead}
                  </p>
                </EditableReveal>
              ) : null}
              <EditableReveal index={5}>
                <div className="mt-10 flex flex-wrap justify-center gap-6 border-t border-[var(--tk-line)] pt-6 text-[12px] font-medium uppercase tracking-[0.22em] text-[var(--tk-muted)] lg:justify-start">
                  {location ? <FactChip icon={MapPin} label={location} /> : null}
                  {role ? <FactChip icon={Building2} label={role} /> : null}
                  {website ? <FactChip icon={Globe2} label="Website" /> : null}
                  <FactChip icon={CheckCircle2} label="Verified" />
                </div>
              </EditableReveal>
            </div>
          </div>
        </div>
      </div>

      <div className={`${dc.shell.section} py-16 sm:py-24`}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* -------------------------- Article column -------------------------- */}
          <article className="min-w-0">
            <EditableReveal index={0}>
              <h2 className="editable-serif text-[2.2rem] leading-[1.08] tracking-[-0.02em] sm:text-[3rem]">
                About the contributor.
              </h2>
            </EditableReveal>
            <EditableReveal index={1}>
              <div
                className="article-content mt-8 max-w-none text-[1.05rem] leading-[1.85]"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            </EditableReveal>

            {tags.length ? (
              <EditableReveal index={2}>
                <div className="mt-10 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className={dc.badge.pill}>
                      {tag}
                    </span>
                  ))}
                </div>
              </EditableReveal>
            ) : null}

            {mapSrc ? (
              <EditableReveal index={3}>
                <div className="mt-14 overflow-hidden rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                  <div className="flex items-center gap-3 border-b border-[var(--tk-line)] p-5 editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--tk-muted)]">
                    <MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {location || 'Location'}
                  </div>
                  <iframe src={mapSrc} title="Map" loading="lazy" className="h-80 w-full border-0" />
                </div>
              </EditableReveal>
            ) : null}

            {/* Their content — points INTO the Reference Library only */}
            {related.length ? (
              <EditableReveal index={4}>
                <div className="mt-20">
                  <div className="flex items-end justify-between gap-6">
                    <div>
                      <p className="editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--tk-accent)]">
                        Their entries
                      </p>
                      <h2 className="editable-serif mt-4 text-[2rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.6rem]">
                        Filed to the shelf.
                      </h2>
                    </div>
                    <Link
                      href="/pdf"
                      className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--tk-accent)] hover:opacity-70"
                    >
                      Browse the library <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="mt-10 grid gap-6 sm:grid-cols-2">
                    {related.slice(0, 4).map((item) => (
                      <Link
                        key={item.id || item.slug}
                        href={`/pdf/${item.slug}`}
                        className="group flex flex-col gap-5 rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 transition duration-500 hover:-translate-y-1 hover:border-[var(--tk-accent)]"
                      >
                        <div className="flex h-24 items-center justify-center rounded-[0.75rem] bg-[var(--tk-raised)] text-[var(--tk-accent)]">
                          <span className="editable-serif text-[3.5rem] leading-none tracking-[-0.04em]">Aa</span>
                        </div>
                        <h3 className="editable-serif line-clamp-3 text-[1.15rem] leading-[1.2] tracking-[-0.01em]">
                          {item.title}
                        </h3>
                        <p className="editable-mono text-[11px] uppercase tracking-[0.2em] text-[var(--tk-muted)]">
                          Reference · PDF
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </EditableReveal>
            ) : null}
          </article>

          {/* ------------------------------ Sidebar ------------------------------ */}
          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <EditableReveal index={0}>
              <div className="rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8">
                <p className="editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--tk-muted)]">Contact</p>
                <div className="mt-6 divide-y divide-dashed divide-[var(--tk-line)]">
                  {location ? <ContactRow icon={MapPin} label="Address" value={location} /> : null}
                  {phone ? <ContactRow icon={Phone} label="Phone" value={phone} href={`tel:${phone}`} /> : null}
                  {email ? <ContactRow icon={Mail} label="Email" value={email} href={`mailto:${email}`} /> : null}
                  {website ? (
                    <ContactRow icon={Globe2} label="Website" value={cleanDomain(website)} href={website} external />
                  ) : null}
                  {links.map((l) => (
                    <ContactRow key={l.href} icon={ExternalLink} label={l.label} value={cleanDomain(l.href)} href={l.href} external />
                  ))}
                </div>
                {website ? (
                  <Link
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className={`${dc.button.primary} mt-8 w-full`}
                  >
                    <span className="btn-text inline-flex items-center gap-2">
                      Visit their site <ArrowUpRight className="h-4 w-4" />
                    </span>
                    <span className="btn-text-hover">
                      Visit their site <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </Link>
                ) : null}
              </div>
            </EditableReveal>

            <EditableReveal index={1}>
              <div className="rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8">
                <p className="editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--tk-muted)]">Trust</p>
                <ul className="mt-6 grid gap-4 text-[14px]">
                  {['Verified contributor', 'Independent entries', 'Open to reach out'].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tk-accent)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </EditableReveal>

            {/* ONE sidebar ad — the only profile-related ad in the codebase */}
            <EditableReveal index={2}>
              <Ads slot="sidebar" size={sidebarSize} showLabel className="mx-auto w-full" />
            </EditableReveal>
          </aside>
        </div>
      </div>
    </section>
  )
}

function FactChip({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {label}
    </span>
  )
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: typeof MapPin
  label: string
  value: string
  href?: string
  external?: boolean
}) {
  const content = (
    <div className="flex items-center gap-4 py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="editable-mono text-[10px] uppercase tracking-[0.22em] text-[var(--tk-muted)]">{label}</p>
        <p className="mt-1 truncate text-[14px] font-medium text-[var(--tk-text)]">{value}</p>
      </div>
      {href ? <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--tk-muted)]" /> : null}
    </div>
  )
  if (!href) return content
  return (
    <Link href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="block transition hover:opacity-80">
      {content}
    </Link>
  )
}

function extractProfileLinks(post: SitePost): Array<{ label: string; href: string }> {
  const content = getContent(post)
  const raw = content.links
  const out: Array<{ label: string; href: string }> = []
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (item && typeof item === 'object') {
        const rec = item as Record<string, unknown>
        const href = asText(rec.href || rec.url)
        const label = asText(rec.label || rec.name) || 'Link'
        if (href && /^https?:\/\//i.test(href)) out.push({ label, href })
      } else if (typeof item === 'string' && /^https?:\/\//i.test(item)) {
        out.push({ label: 'Link', href: item })
      }
    }
  }
  return out.slice(0, 4)
}

const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

/* -------------------------------------------------------------------------- */
/*     Other tasks — kept functional; not surfaced from home/nav/footer.      */
/* -------------------------------------------------------------------------- */

function ArticleDetail({
  post,
  related,
  comments,
}: {
  post: SitePost
  related: SitePost[]
  comments: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  const images = getImages(post)
  return (
    <>
      <article className={`${dc.shell.sectionRead} py-16 sm:py-24`}>
        <BackLink task="article" />
        <p className="mt-10 editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--tk-accent)]">
          {categoryOf(post, 'Entry')}
        </p>
        <h1 className="editable-serif mt-6 text-[2.6rem] leading-[1.04] tracking-[-0.03em] sm:text-[3.75rem]">
          {post.title}
        </h1>
        {images[0] ? (
          <img
            src={images[0]}
            alt=""
            className="mt-10 aspect-[16/9] w-full rounded-[1rem] border border-[var(--tk-line)] object-cover"
          />
        ) : null}
        <div
          className="article-content mt-10 max-w-none text-[1.05rem] leading-[1.85]"
          dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
        />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <SimpleRelatedStrip task="article" related={related} />
    </>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <section className={`${dc.shell.section} py-16 sm:py-24`}>
      <BackLink task="listing" />
      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="min-w-0">
          <h1 className="editable-serif text-[2.6rem] leading-[1.04] tracking-[-0.03em] sm:text-[3.75rem]">{post.title}</h1>
          {leadText(post) ? <p className="mt-6 text-[1.2rem] leading-[1.55] text-[var(--tk-muted)]">{leadText(post)}</p> : null}
          {images[0] ? (
            <img src={images[0]} alt="" className="mt-10 aspect-[16/9] w-full rounded-[1rem] border border-[var(--tk-line)] object-cover" />
          ) : null}
          <div
            className="article-content mt-10 max-w-none text-[1.05rem] leading-[1.85]"
            dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
          />
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <ContactPanel address={address} phone={phone} email={email} website={website} />
          <SimpleRelatedPanel task="listing" related={related} />
        </aside>
      </div>
    </section>
  )
}

function ClassifiedDetail({ post }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  return (
    <section className={`${dc.shell.section} py-16 sm:py-24`}>
      <BackLink task="classified" />
      <div className="mt-10 grid gap-12 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8">
            <p className="editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--tk-muted)]">Notice</p>
            <h1 className="editable-serif mt-4 text-[1.75rem] leading-[1.1] tracking-[-0.02em]">{post.title}</h1>
            <p className="editable-serif mt-6 text-[3rem] leading-none tracking-[-0.03em] text-[var(--tk-accent)]">{price || '—'}</p>
            {location ? <p className="mt-4 text-[13px] text-[var(--tk-muted)]">{location}</p> : null}
          </div>
        </aside>
        <article className="min-w-0">
          {images[0] ? (
            <img src={images[0]} alt="" className="aspect-[16/9] w-full rounded-[1rem] border border-[var(--tk-line)] object-cover" />
          ) : null}
          <div
            className="article-content mt-10 max-w-none text-[1.05rem] leading-[1.85]"
            dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
          />
        </article>
      </div>
    </section>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className={`${dc.shell.section} py-16 sm:py-24`}>
        <BackLink task="image" />
        <h1 className="editable-serif mt-10 text-[2.6rem] leading-[1.04] tracking-[-0.03em] sm:text-[3.75rem]">
          {post.title}
        </h1>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-5 sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[1rem] border border-[var(--tk-line)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div
              className="article-content max-w-none text-[15px] leading-[1.7]"
              dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
            />
          </aside>
        </div>
      </section>
      <SimpleRelatedStrip task="image" related={related} />
    </>
  )
}

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className={`${dc.shell.sectionRead} py-16 sm:py-24`}>
        <BackLink task="sbm" />
        <div className="mt-10 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <Bookmark className="h-6 w-6" />
        </div>
        <h1 className="editable-serif mt-8 text-[2.6rem] leading-[1.04] tracking-[-0.03em] sm:text-[3.75rem]">
          {post.title}
        </h1>
        {website ? (
          <Link href={website} target="_blank" rel="noreferrer" className={`${dc.button.primary} mt-8`}>
            <span className="btn-text inline-flex items-center gap-2">Open resource <ExternalLink className="h-4 w-4" /></span>
            <span className="btn-text-hover">Open resource <ExternalLink className="h-4 w-4" /></span>
          </Link>
        ) : null}
        <div
          className="article-content mt-10 max-w-none text-[1.05rem] leading-[1.85]"
          dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
        />
      </article>
      <SimpleRelatedStrip task="sbm" related={related} />
    </>
  )
}

function BackLink({ task, label }: { task: TaskKey; label?: string }) {
  const taskConfig = getTaskConfig(task)
  const fallback = task === 'pdf' ? 'Back to the library' : task === 'profile' ? 'Back' : `Back to ${taskConfig?.label || 'index'}`
  return (
    <Link
      href={taskConfig?.route || '/'}
      className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]"
    >
      <ArrowLeft className="h-4 w-4" /> {label || fallback}
    </Link>
  )
}

function ContactPanel({
  address,
  phone,
  email,
  website,
}: {
  address: string
  phone: string
  email: string
  website: string
}) {
  if (!address && !phone && !email && !website) return null
  return (
    <div className="rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8">
      <p className="editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--tk-muted)]">Contact</p>
      <div className="mt-6 divide-y divide-dashed divide-[var(--tk-line)]">
        {address ? <ContactRow icon={MapPin} label="Address" value={address} /> : null}
        {phone ? <ContactRow icon={Phone} label="Phone" value={phone} href={`tel:${phone}`} /> : null}
        {email ? <ContactRow icon={Mail} label="Email" value={email} href={`mailto:${email}`} /> : null}
        {website ? (
          <ContactRow icon={Globe2} label="Website" value={cleanDomain(website)} href={website} external />
        ) : null}
      </div>
    </div>
  )
}

function SimpleRelatedPanel({ task, related }: { task: TaskKey; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  if (!related.length) return null
  return (
    <div className="rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8">
      <div className="flex items-center justify-between gap-3">
        <p className="editable-mono text-[11px] uppercase tracking-[0.22em] text-[var(--tk-muted)]">Also on the shelf</p>
        <Link href={taskConfig?.route || '/'} className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--tk-accent)]">
          View
        </Link>
      </div>
      <div className="mt-5 grid gap-4">
        {related.slice(0, 4).map((item) => (
          <Link key={item.id || item.slug} href={`${taskConfig?.route || `/${task}`}/${item.slug}`} className="group block">
            <p className="editable-mono text-[10px] uppercase tracking-[0.2em] text-[var(--tk-muted)]">
              <Tag className="mr-1 inline h-3 w-3 text-[var(--tk-accent)]" /> {taskConfig?.label || task}
            </p>
            <p className="editable-serif mt-2 line-clamp-2 text-[15px] leading-snug tracking-[-0.01em] group-hover:text-[var(--tk-accent)]">
              {item.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

function SimpleRelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)] bg-[var(--tk-raised)]">
      <div className={`${dc.shell.section} py-16`}>
        <div className="flex items-center justify-between">
          <h2 className="editable-serif text-[2rem] leading-[1.1] tracking-[-0.02em]">Also on the shelf</h2>
          <Link
            href={taskConfig?.route || '/'}
            className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--tk-accent)]"
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => {
            const image = getImages(item)[0]
            const href = `${taskConfig?.route || `/${task}`}/${item.slug}`
            return (
              <Link
                key={item.id || item.slug}
                href={href}
                className="group block overflow-hidden rounded-[1rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
                  {image ? (
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FileText className="h-7 w-7 text-[var(--tk-muted)]" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="editable-serif line-clamp-2 text-[1.05rem] leading-snug tracking-[-0.01em]">{item.title}</h3>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
