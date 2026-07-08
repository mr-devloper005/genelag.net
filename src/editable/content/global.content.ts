import { slot4BrandConfig } from '@/editable/theme/brand.config'

/*
  Public copy — Reference Library platform.
  Nav intentionally minimal: About + Contact only. Task-labels never surface in nav.
  Footer discovery lists only the Reference Library (renamed pdf task).
*/

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'A quiet reference library',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  nav: {
    tagline: 'A reference library',
    primaryLinks: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    actions: {
      primary: { label: 'Get started', href: '/signup' },
      secondary: { label: 'Contribute', href: '/create' },
    },
  },
  footer: {
    tagline: 'Read, reference, cite.',
    description: 'A carefully kept shelf of documents, guides, and reports — collected in one quiet place so a good reference is always a click away.',
    columns: [
      {
        title: 'Discover',
        links: [
          { label: 'Reference Library', href: '/pdf' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
      {
        title: 'Account',
        links: [
          { label: 'Sign in', href: '/login' },
          { label: 'Get started', href: '/signup' },
          { label: 'Contribute', href: '/create' },
        ],
      },
    ],
    bottomNote: 'A calm shelf of references — read, cite, and revisit.',
  },
  commonLabels: {
    readMore: 'Read more',
    viewAll: 'Browse the library',
    explore: 'Open the library',
    latest: 'Newly shelved',
    related: 'Related on the shelf',
    published: 'Filed',
  },
} as const
