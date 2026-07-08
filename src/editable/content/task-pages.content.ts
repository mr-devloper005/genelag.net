import type { TaskKey } from '@/lib/site-config'

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

/*
  Public copy applies to `pdf` (Reference Library) surfaces only.
  Other task voices are kept for internal completeness but are not surfaced publicly.
  `profile` copy is used ONLY on the direct-URL profile detail page.
*/

export const taskPageVoices = {
  pdf: {
    eyebrow: 'The Reference Library',
    headline: 'A quiet shelf of documents, guides and reports.',
    description: 'Every entry on the shelf is free to open, read and download. Browse by topic, or scan the most recent arrivals below.',
    filterLabel: 'Filter by category',
    secondaryNote: 'The shelf is added to slowly — new arrivals rise to the top of the room.',
    chips: ['Free to read', 'Free to download', 'Free to cite'],
  },
  profile: {
    eyebrow: 'Contributor',
    headline: 'A person behind the shelf.',
    description: 'A brief record of a contributor and the documents they have filed to the library.',
    filterLabel: 'Filter by focus',
    secondaryNote: 'Contributors submit — they never sell.',
    chips: ['On the shelf', 'Verified', 'Independent'],
  },
  article: {
    eyebrow: 'Journal',
    headline: 'Notes and essays from the reading room.',
    description: 'Occasional writing that accompanies the library — background, context, and thinking.',
    filterLabel: 'Filter by topic',
    secondaryNote: 'Companion writing to the shelf itself.',
    chips: ['Essays', 'Notes', 'Companion writing'],
  },
  classified: {
    eyebrow: 'Notices',
    headline: 'Occasional announcements and open calls.',
    description: 'A slow noticeboard for things worth passing along.',
    filterLabel: 'Filter notices',
    secondaryNote: 'Rare and considered.',
    chips: ['Notices', 'Open calls', 'Announcements'],
  },
  sbm: {
    eyebrow: 'Marginalia',
    headline: 'External links worth keeping.',
    description: 'A small marginalia column of pointers to further reading elsewhere.',
    filterLabel: 'Filter marginalia',
    secondaryNote: 'Curated, not comprehensive.',
    chips: ['Pointers', 'Further reading', 'Marginalia'],
  },
  listing: {
    eyebrow: 'Index',
    headline: 'A quiet index of noteworthy places.',
    description: 'A companion index — kept for the archive.',
    filterLabel: 'Filter index',
    secondaryNote: 'A companion index.',
    chips: ['Index', 'Companion', 'Archive'],
  },
  image: {
    eyebrow: 'Gallery',
    headline: 'Visual studies and cover imagery.',
    description: 'Occasional visual studies and cover illustrations.',
    filterLabel: 'Filter studies',
    secondaryNote: 'Visual companion to the shelf.',
    chips: ['Cover art', 'Studies', 'Visual notes'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
