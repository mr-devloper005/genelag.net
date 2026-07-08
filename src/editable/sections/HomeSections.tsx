import Link from 'next/link'
import { ArrowUpRight, BookMarked, BookOpen, Compass, Download, FileText, Search, Sparkles } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref, getEditableExcerpt, getEditableCategory, EditorialFeatureCard, RailPostCard, CompactIndexCard } from '@/editable/cards/PostCards'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

/*
  Home mirrors the reference section rhythm — all built around the Reference Library.
  No profile cards, no profile sections, no profile links.
*/

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

/* ---------------------------------- Hero ---------------------------------- */

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const featured = pool[0]
  const heroWords = pagesContent.home.hero.title || ['A quiet room for', 'reading, referencing, and citing.']
  const featuredHref = featured ? postHref(primaryTask, featured, primaryRoute) : primaryRoute

  return (
    <section className="relative overflow-hidden bg-[var(--slot4-page-bg)]">
      <div className={`${dc.shell.section} ${dc.shell.sectionYLg}`}>
        <div className="grid gap-14 lg:grid-cols-[1.35fr_1fr] lg:items-end">
          <div>
            <EditableReveal index={0}>
              <p className={`${dc.type.eyebrow}`}>{pagesContent.home.hero.badge}</p>
            </EditableReveal>
            <EditableReveal index={1}>
              <h1 className={`${dc.type.displayTitle} mt-6 max-w-[18ch] text-[var(--slot4-page-text)]`}>
                {heroWords[0]}
                {heroWords[1] ? (
                  <>
                    <span className="editable-serif italic"> {heroWords[1]}</span>
                  </>
                ) : null}
              </h1>
            </EditableReveal>
            <EditableReveal index={2}>
              <p className={`${dc.type.lead} mt-8 max-w-2xl ${pal.mutedText}`}>{pagesContent.home.hero.description}</p>
            </EditableReveal>
            <EditableReveal index={3}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href={pagesContent.home.hero.primaryCta.href} className={`${dc.button.primary} min-w-[220px]`}>
                  <span className="btn-text inline-flex items-center gap-2">
                    {pagesContent.home.hero.primaryCta.label} <ArrowUpRight className="h-4 w-4" />
                  </span>
                  <span className="btn-text-hover">
                    {pagesContent.home.hero.primaryCta.label} <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
                <Link href={pagesContent.home.hero.secondaryCta.href} className={dc.button.secondary}>
                  <span className="btn-text">{pagesContent.home.hero.secondaryCta.label}</span>
                  <span className="btn-text-hover">{pagesContent.home.hero.secondaryCta.label}</span>
                </Link>
              </div>
            </EditableReveal>
          </div>

          {featured ? (
            <EditableReveal index={4}>
              <Link
                href={featuredHref}
                className={`group relative block overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}
              >
                <div className={`${dc.media.frame} aspect-[4/5]`}>
                  <img
                    src={getEditablePostImage(featured)}
                    alt={featured.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] group-hover:scale-[1.04]"
                  />
                  <span className={`absolute left-5 top-5 ${dc.badge.softPill}`}>{pagesContent.home.hero.featureCardBadge}</span>
                </div>
                <div className="p-6 sm:p-8">
                  <p className={dc.type.eyebrow}>{getEditableCategory(featured)}</p>
                  <h3 className={`${dc.type.cardTitle} mt-3 line-clamp-3 ${pal.pageText} sm:text-[1.65rem]`}>{featured.title}</h3>
                  <p className={`${pal.mutedText} mt-3 line-clamp-3 text-[14px] leading-[1.7]`}>{getEditableExcerpt(featured, 160)}</p>
                  <span className={`mt-6 inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] ${pal.accentText}`}>
                    Open the entry <ArrowUpRight className="h-4 w-4 transition duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </EditableReveal>
          ) : null}
        </div>

        {/* Search band under hero — quiet, editorial */}
        <EditableReveal index={5}>
          <form
            action="/search"
            className="mt-16 flex items-center gap-3 border-t border-[var(--editable-border-strong)] pt-6 sm:mt-20"
          >
            <Search className="h-5 w-5 shrink-0 text-[var(--slot4-accent)]" />
            <input
              name="q"
              placeholder={pagesContent.home.hero.searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent py-3 text-[16px] editable-serif italic outline-none placeholder:text-[var(--slot4-muted-text)]"
            />
            <button type="submit" className={dc.button.ghost}>
              Search the shelf <ArrowUpRight className="h-4 w-4" />
            </button>
          </form>
        </EditableReveal>
      </div>
    </section>
  )
}

/* --------------------------- Trending / rail ------------------------------ */

export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)]).slice(0, 6)
  if (!pool.length) return null
  return (
    <section className="bg-[var(--slot4-warm)]">
      <div className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <EditableReveal index={0}>
            <div className="max-w-2xl">
              <p className={dc.type.eyebrow}>Newly shelved</p>
              <h2 className={`${dc.type.sectionTitle} mt-4 text-[var(--slot4-page-text)]`}>
                What arrived <span className="editable-serif italic">this week</span>.
              </h2>
              <p className={`${dc.type.body} ${pal.mutedText} mt-5 max-w-xl`}>
                New arrivals rise to the top of the room. Everything below has been filed with its category, page count and file size.
              </p>
            </div>
          </EditableReveal>
          <EditableReveal index={1}>
            <Link href={primaryRoute} className={dc.button.secondary}>
              <span className="btn-text">Browse the shelf</span>
              <span className="btn-text-hover">Browse the shelf</span>
            </Link>
          </EditableReveal>
        </div>

        <div className={`${dc.layout.rail} mt-12`}>
          {pool.map((post, i) => (
            <EditableReveal key={post.id || post.slug || i} index={i}>
              <RailPostCard post={post} href={postHref(primaryTask, post, primaryRoute)} index={i} />
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------- Categories band (6-tile grid) ---------------------- */

const CATEGORY_ICONS = [BookOpen, FileText, BookMarked, Compass, Sparkles, Download]

function collectCategories(posts: SitePost[]) {
  const map = new Map<string, number>()
  for (const post of posts) {
    const cat = getEditableCategory(post)
    if (!cat) continue
    map.set(cat, (map.get(cat) || 0) + 1)
  }
  const list = Array.from(map.entries())
  if (list.length >= 3) return list.slice(0, 6)
  // Fallback shelf categories so the band always reads well
  const fallback: [string, number][] = [
    ['Guides', 12], ['Reports', 8], ['References', 15], ['Primers', 6], ['Papers', 9], ['Handbooks', 4],
  ]
  return list.length ? list.concat(fallback).slice(0, 6) : fallback
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((s) => s.posts)])
  const featured = pool[0]
  const categories = collectCategories(pool)
  if (!pool.length) return null

  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        <EditableReveal index={0}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className={dc.type.eyebrow}>Wander the room</p>
              <h2 className={`${dc.type.sectionTitle} mt-4 text-[var(--slot4-page-text)]`}>
                Shelves, <span className="editable-serif italic">by subject</span>.
              </h2>
            </div>
            <Link href={primaryRoute} className={dc.button.ghost}>
              See the whole shelf <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </EditableReveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {featured ? (
            <EditableReveal index={1}>
              <EditorialFeatureCard post={featured} href={postHref(primaryTask, featured, primaryRoute)} label="Editor's shelf" />
            </EditableReveal>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            {categories.map(([label, count], i) => {
              const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length]
              return (
                <EditableReveal key={label} index={i + 2}>
                  <Link
                    href={`${primaryRoute}?category=${encodeURIComponent(label)}`}
                    className={`group flex h-full flex-col justify-between gap-8 rounded-[1rem] border border-[var(--editable-border)] bg-white p-6 transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-accent)]`}
                  >
                    <span className={`flex h-12 w-12 items-center justify-center rounded-full ${pal.accentSoftBg} text-[var(--slot4-accent)]`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className={`text-[11px] font-medium uppercase tracking-[0.2em] ${pal.mutedText}`}>{count} entries</p>
                      <h3 className={`${dc.type.cardTitle} mt-2 ${pal.pageText}`}>{label}</h3>
                    </div>
                  </Link>
                </EditableReveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------ Latest / time collections ----------------------- */

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 6), href: primaryRoute, title: 'New in the last 7 days' },
          { key: 'browse', posts: posts.slice(6, 12), href: primaryRoute, title: 'Popular this month' },
          { key: 'index', posts: posts.slice(12, 18), href: primaryRoute, title: 'From the archive' },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href' | 'title'>[])
  const visible = sections.filter((s) => s.posts.length)
  if (!visible.length) return null

  const primary = visible[0]
  const secondary = visible.slice(1)
  const primaryList = primary.posts.slice(0, 6)
  const feature = primaryList[0]
  const rest = primaryList.slice(1)

  return (
    <section className="bg-[var(--slot4-warm)]">
      <div className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        <EditableReveal index={0}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className={dc.type.eyebrow}>Latest reading</p>
              <h2 className={`${dc.type.sectionTitle} mt-4 text-[var(--slot4-page-text)]`}>
                Fresh entries, <span className="editable-serif italic">quietly filed</span>.
              </h2>
              <p className={`${dc.type.body} ${pal.mutedText} mt-5`}>
                {primary.title || 'The most recently filed entries in the library — with the newest at the top.'}
              </p>
            </div>
            <Link href={primary.href || primaryRoute} className={dc.button.secondary}>
              <span className="btn-text">Browse all entries</span>
              <span className="btn-text-hover">Browse all entries</span>
            </Link>
          </div>
        </EditableReveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          {feature ? (
            <EditableReveal index={1}>
              <EditorialFeatureCard post={feature} href={postHref(primaryTask, feature, primaryRoute)} label="Featured this week" />
            </EditableReveal>
          ) : null}

          <div className="flex flex-col">
            {rest.map((post, i) => (
              <EditableReveal key={post.id || post.slug || i} index={i + 2}>
                <CompactIndexCard post={post} href={postHref(primaryTask, post, primaryRoute)} index={i} />
              </EditableReveal>
            ))}
          </div>
        </div>

        {secondary.length ? (
          <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {secondary
              .flatMap((s) => s.posts.slice(0, 3))
              .slice(0, 6)
              .map((post, i) => (
                <EditableReveal key={post.id || post.slug || i} index={i}>
                  <RailPostCard post={post} href={postHref(primaryTask, post, primaryRoute)} index={i} />
                </EditableReveal>
              ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

/* --------------------------------- CTA band -------------------------------- */

export function EditableHomeCta() {
  return (
    <section id="get-started" className="scroll-mt-24 bg-[var(--slot4-page-bg)]">
      <div className={`${dc.shell.section} ${dc.shell.sectionYLg}`}>
        <div className="relative overflow-hidden rounded-[1rem] bg-[var(--slot4-dark-bg)] px-6 py-16 text-white sm:px-16 sm:py-24 lg:px-24 lg:py-32">
          <EditableReveal index={0}>
            <p className={`text-[11px] font-medium uppercase tracking-[0.24em] text-white/60`}>{pagesContent.home.cta.badge}</p>
          </EditableReveal>
          <EditableReveal index={1}>
            <h2 className="editable-serif mt-8 max-w-3xl text-[2.6rem] leading-[1.05] tracking-[-0.02em] sm:text-[4rem] lg:text-[5rem]">
              {pagesContent.home.cta.title}
            </h2>
          </EditableReveal>
          <EditableReveal index={2}>
            <p className="mt-8 max-w-xl text-[1.15rem] leading-[1.6] text-white/80">{pagesContent.home.cta.description}</p>
          </EditableReveal>
          <EditableReveal index={3}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={pagesContent.home.cta.primaryCta.href}
                className="editable-btn-slide inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-medium uppercase tracking-[0.16em] text-[var(--slot4-accent)] transition duration-500 hover:bg-[var(--slot4-accent-soft)]"
              >
                <span className="btn-text inline-flex items-center gap-2">{pagesContent.home.cta.primaryCta.label} <ArrowUpRight className="h-4 w-4" /></span>
                <span className="btn-text-hover">{pagesContent.home.cta.primaryCta.label} <ArrowUpRight className="h-4 w-4" /></span>
              </Link>
              <Link
                href={pagesContent.home.cta.secondaryCta.href}
                className="editable-btn-slide inline-flex items-center justify-center gap-2 rounded-full border border-white/50 bg-transparent px-7 py-3.5 text-[13px] font-medium uppercase tracking-[0.16em] text-white transition duration-500 hover:bg-white/10"
              >
                <span className="btn-text">{pagesContent.home.cta.secondaryCta.label}</span>
                <span className="btn-text-hover">{pagesContent.home.cta.secondaryCta.label}</span>
              </Link>
            </div>
          </EditableReveal>

          {/* oversized wordmark like the reference footer */}
          <p className="editable-serif absolute -bottom-8 -right-8 whitespace-nowrap text-[16vw] leading-none tracking-[-0.05em] text-white/8 sm:text-[12vw]">
            {SITE_CONFIG.name}
          </p>
        </div>
      </div>
    </section>
  )
}
