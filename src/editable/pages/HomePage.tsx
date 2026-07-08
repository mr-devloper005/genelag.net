import type { Metadata } from 'next'
import { SchemaJsonLd } from '@/components/seo/schema-jsonld'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { buildPageMetadata } from '@/lib/seo'
import { fetchHomeTaskFeed, fetchHomeTimeSections, type HomeTimeSection } from '@/lib/task-data'
import { pagesContent } from '@/editable/content/pages.content'
import type { SitePost } from '@/lib/site-connector'
import { EditableHomeCta, EditableHomeHero, EditableMagazineSplit, EditableStoryRail, EditableTimeCollections } from '@/editable/sections/HomeSections'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 300

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/',
    title: pagesContent.home.metadata.title,
    description: pagesContent.home.metadata.description,
    openGraphTitle: pagesContent.home.metadata.openGraphTitle,
    openGraphDescription: pagesContent.home.metadata.openGraphDescription,
    image: SITE_CONFIG.defaultOgImage,
    keywords: [...pagesContent.home.metadata.keywords],
  })
}

type TaskFeedItem = { task: (typeof SITE_CONFIG.tasks)[number]; posts: SitePost[] }

function uniquePosts(posts: SitePost[]) {
  return Array.from(new Map(posts.map((post) => [post.slug || post.id || post.title, post])).values())
}

export default async function HomePage() {
  // Reference Library (pdf) is the public-facing primary — never a profile.
  const preferred: TaskKey = 'pdf'
  const primaryTask: TaskKey =
    (SITE_CONFIG.tasks.find((t) => t.key === preferred && t.enabled)?.key as TaskKey) ||
    ((SITE_CONFIG.tasks.find((t) => t.enabled && t.key !== 'profile')?.key || 'pdf') as TaskKey)
  const primaryRoute = SITE_CONFIG.taskViews[primaryTask] || `/${primaryTask}`

  const taskFeed: TaskFeedItem[] = await fetchHomeTaskFeed(12, { timeoutMs: 2500 })
  const primaryPosts = uniquePosts(
    taskFeed.find(({ task }) => task.key === primaryTask)?.posts ||
      taskFeed.filter(({ task }) => task.key !== 'profile').flatMap(({ posts }) => posts)
  ).slice(0, 24)
  const timeSections: HomeTimeSection[] = await fetchHomeTimeSections(primaryTask, { limit: 8, timeoutMs: 2500 })
  const baseUrl = SITE_CONFIG.baseUrl.replace(/\/$/, '')
  const headerSize = pickRandom(getSlotSizes('header'))

  return (
    <EditableSiteShell>
      <main>
        <SchemaJsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_CONFIG.name,
            url: baseUrl,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${baseUrl}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }}
        />
        <EditableHomeHero primaryTask={primaryTask} primaryRoute={primaryRoute} posts={primaryPosts} timeSections={timeSections} />
        <div className="mx-auto w-full max-w-[87rem] px-5 sm:px-8 lg:px-12">
          <Ads slot="header" size={headerSize} showLabel eager className="mx-auto w-full py-4" />
        </div>
        <EditableStoryRail primaryTask={primaryTask} primaryRoute={primaryRoute} posts={primaryPosts} timeSections={timeSections} />
        <EditableMagazineSplit primaryTask={primaryTask} primaryRoute={primaryRoute} posts={primaryPosts} timeSections={timeSections} />
        <EditableTimeCollections primaryTask={primaryTask} primaryRoute={primaryRoute} posts={primaryPosts} timeSections={timeSections} />
        <EditableHomeCta />
      </main>
    </EditableSiteShell>
  )
}
