import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'

/*
  Editorial cards — serif headline over Geist meta.
  Signatures kept byte-identical. Public feeds render library documents only.
*/

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'On the shelf'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

/* ------------------------------------------------------------------ */

export function EditorialFeatureCard({ post, href, label = 'Featured entry' }: { post: SitePost; href: string; label?: string }) {
  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}
    >
      <div className={`${dc.media.frame} aspect-[16/10]`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.03]"
        />
        <span className={`absolute left-5 top-5 ${dc.badge.softPill}`}>{label}</span>
      </div>
      <div className="flex flex-col gap-4 px-6 pb-8 pt-6 sm:px-8 sm:pt-8">
        <p className={`${dc.type.eyebrow}`}>{getEditableCategory(post)}</p>
        <h3 className={`${dc.type.subsectionTitle} ${pal.pageText} sm:text-[2.4rem]`}>{post.title}</h3>
        <p className={`${dc.type.body} ${pal.mutedText}`}>{getEditableExcerpt(post, 200)}</p>
        <span className={`mt-2 inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.2em] ${pal.accentText}`}>
          Open the entry <ArrowUpRight className="h-4 w-4 transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group ${dc.layout.minRailCard} block overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}>
      <div className={`${dc.media.frame} aspect-[4/3]`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.04]"
        />
        <span className={`absolute left-4 top-4 ${dc.badge.softPill}`}>
          {String(index + 1).padStart(2, '0')} · {getEditableCategory(post)}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-6">
        <h3 className={`${dc.type.cardTitle} ${pal.pageText} line-clamp-3`}>{post.title}</h3>
        <p className={`${pal.mutedText} line-clamp-3 text-[14px] leading-[1.7]`}>{getEditableExcerpt(post, 135)}</p>
        <span className={`mt-1 inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.2em] ${pal.accentText}`}>
          Open <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  )
}

export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      className={`group grid min-w-0 items-start gap-5 border-b border-[var(--editable-border)] py-6 transition duration-500 hover:-translate-y-[2px] sm:grid-cols-[64px_minmax(0,1fr)_auto]`}
    >
      <span className="editable-serif text-[2.2rem] leading-none tracking-[-0.02em] text-[var(--slot4-accent)]/60">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <p className={`${dc.type.eyebrow}`}>{getEditableCategory(post)}</p>
        <h3 className={`mt-2 ${dc.type.cardTitle} ${pal.pageText} line-clamp-2`}>{post.title}</h3>
        <p className={`mt-2 line-clamp-2 text-[14px] leading-[1.7] ${pal.mutedText}`}>{getEditableExcerpt(post, 130)}</p>
      </div>
      <ArrowUpRight className="hidden h-5 w-5 shrink-0 text-[var(--slot4-accent)] transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:block" />
    </Link>
  )
}

export function ArticleListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      className={`group grid min-w-0 gap-6 overflow-hidden ${dc.surface.card} p-5 ${dc.motion.lift} sm:grid-cols-[300px_minmax(0,1fr)] sm:p-6`}
    >
      <div className={`${dc.media.frame} aspect-[4/3] sm:aspect-auto sm:min-h-[220px]`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex min-w-0 flex-col gap-4 py-1 sm:py-3">
        <p className={`${dc.type.eyebrow}`}>{getEditableCategory(post)} · {String(index + 1).padStart(2, '0')}</p>
        <h2 className={`${dc.type.subsectionTitle} ${pal.pageText} line-clamp-3 sm:text-[2rem]`}>{post.title}</h2>
        <p className={`${pal.mutedText} line-clamp-3 text-[15px] leading-[1.75]`}>{getEditableExcerpt(post, 220)}</p>
        <span className={`mt-2 inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] ${pal.accentText}`}>
          Open the entry <ArrowUpRight className="h-4 w-4 transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
