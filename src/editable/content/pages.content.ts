import { slot4BrandConfig } from '@/editable/theme/brand.config'

/*
  Public copy — everything framed around the Reference Library.
  The pdf task is user-visible as "Reference Library"; profile stays direct-URL only.
*/

export const pagesContent = {
  home: {
    metadata: {
      title: 'A quiet reference library',
      description: 'A calm, well-kept shelf of documents, guides and reports — free to read, download and cite.',
      openGraphTitle: 'A quiet reference library',
      openGraphDescription: 'Read, reference, cite — a careful shelf of documents kept in one calm place.',
      keywords: ['reference library', 'documents', 'guides', 'reports', 'reading room'],
    },
    hero: {
      badge: 'The Reference Library',
      title: ['A quiet room for', 'reading, referencing, and citing.'],
      description: 'A carefully collected shelf of documents, guides and reports — kept in one calm place so the reference you need is always waiting.',
      primaryCta: { label: 'Enter the library', href: '/pdf' },
      secondaryCta: { label: 'How this works', href: '/about' },
      searchPlaceholder: 'Search titles, topics, categories…',
      focusLabel: 'On the shelf',
      featureCardBadge: 'this week on the shelf',
      featureCardTitle: 'New arrivals shape the library each week.',
      featureCardDescription: 'Recently filed documents rise to the front of the room without disrupting the quiet reading order behind them.',
    },
    intro: {
      badge: 'Inside the library',
      title: 'Every entry is filed with care — one reference at a time.',
      paragraphs: [
        'Rather than scatter useful references across many places, we keep them together on a single quiet shelf that is easy to browse, easy to cite, and easy to return to.',
        'Each document is filed with its category, length and file size clearly on display — no surprise downloads, no noisy previews, no unfinished pages.',
        'The room is small on purpose, so you can spend a Saturday moving through the collection without ever feeling lost.',
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        'Every document is free to open, read and download.',
        'Categories are shallow and clearly labelled.',
        'File size, page count and last update are shown up front.',
        'The library is added to slowly — new arrivals rise to the top.',
      ],
      primaryLink: { label: 'Enter the library', href: '/pdf' },
      secondaryLink: { label: 'About this room', href: '/about' },
    },
    cta: {
      badge: 'Ready when you are',
      title: 'One shelf, quietly kept — open whenever you need a good reference.',
      description: 'No login required to read or download. Sign up only if you would like to contribute a document to the shelf.',
      primaryCta: { label: 'Open the library', href: '/pdf' },
      secondaryCta: { label: 'Say hello', href: '/contact' },
    },
    taskSection: {
      heading: 'Recently on the shelf',
      descriptionSuffix: 'The most recently filed entries in the library.',
    },
  },
  about: {
    badge: 'About the room',
    title: 'A calm shelf, kept slowly, with care.',
    description: `${slot4BrandConfig.siteName} is a small reference library — a single room of documents, guides and reports collected for people who prefer a quiet shelf to an infinite feed.`,
    paragraphs: [
      'We keep the collection deliberately small. Every document is chosen because it is likely to be worth returning to — not just once, but many times.',
      'The room is free to enter. There is no paywall, no login required to read or download, and no advertising slid between the shelves.',
    ],
    values: [
      {
        title: 'Slow additions',
        description: 'The library grows in weeks and months, not minutes. Every arrival is filed with a category, a summary, and its full metadata.',
      },
      {
        title: 'Free to open',
        description: 'Every document on the shelf is free to read online, download to your device, and cite in your own work.',
      },
      {
        title: 'Quiet by design',
        description: 'No autoplaying media, no infinite recommendation carousels — just a shelf, a reading room, and a way out when you are done.',
      },
    ],
  },
  contact: {
    eyebrow: `Write to ${slot4BrandConfig.siteName}`,
    title: 'The reading room is quiet — but we always answer the door.',
    description: 'Tell us what you were looking for, what you found, or what you would like added to the shelf. We reply from a real inbox.',
    formTitle: 'Send a note',
  },
  search: {
    metadata: {
      title: 'Search the shelf',
      description: 'Search across every document on the shelf — titles, categories and summaries.',
    },
    hero: {
      badge: 'Search the shelf',
      title: 'Find the reference you came for.',
      description: 'Search by title, category or keyword and open the entry directly. Every result is a document on the library shelf.',
      placeholder: 'Search titles, categories, keywords…',
    },
    resultsTitle: 'On the shelf',
  },
  create: {
    metadata: {
      title: 'Contribute to the shelf',
      description: 'Submit a document for consideration in the library.',
    },
    locked: {
      badge: 'Contributor access',
      title: 'Sign in to contribute a document to the shelf.',
      description: 'Contributors submit documents through the workspace once signed in. Reading and downloading remain free and require no account.',
    },
    hero: {
      badge: 'Contribution workspace',
      title: 'Add a document to the library.',
      description: 'Upload the file, add a short summary and choose a category. Contributions are reviewed before they appear on the shelf.',
    },
    formTitle: 'Document details',
    submitLabel: 'Submit to the shelf',
    successTitle: 'Thank you — your submission is with us.',
  },
  auth: {
    login: {
      metadataDescription: 'Sign in to your contributor account.',
      badge: 'Contributor access',
      title: 'Welcome back to the reading room.',
      description: 'Sign in to continue contributing to the shelf. Reading and downloading do not require an account.',
      formTitle: 'Sign in',
      submitLabel: 'Continue',
      noAccount: 'No account matched those details. Create one first, then sign in.',
      success: 'Signed in. One moment…',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Create a contributor account.',
      badge: 'Get started',
      title: 'Create an account to contribute to the shelf.',
      description: 'Contributors sign up to submit documents. Anyone can read or download without an account.',
      formTitle: 'Create your account',
      submitLabel: 'Create account',
      passwordShort: 'Please use at least four characters.',
      success: 'Account created. One moment…',
      loginCta: 'Sign in',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Also on the shelf',
      fallbackTitle: 'Entry details',
    },
    listing: {
      relatedTitle: 'Also on the shelf',
      fallbackTitle: 'Entry details',
    },
    image: {
      relatedTitle: 'Also on the shelf',
      fallbackTitle: 'Entry details',
    },
    profile: {
      relatedTitle: 'Also on the shelf',
      fallbackDescription: 'Details will appear here once filed.',
      visitButton: 'Visit their site',
    },
  },
} as const
