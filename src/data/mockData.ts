import { Poem, Poet } from '@/types/poem';

export const mockPoets: Poet[] = [
  {
    id: '1',
    name: 'Elena Marquez',
    username: 'elenaverses',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    bio: 'Writing from the edges of silence. Mexico City → Brooklyn.',
    languages: ['English', 'Spanish'],
    totalReads: 45230,
    totalUpvotes: 12400,
    totalPoems: 87,
    followersCount: 3420,
    badges: [{ type: 'trending', label: 'Trending' }],
    supportLinks: { kofi: 'elenaverses' },
  },
  {
    id: '2',
    name: 'James Chen',
    username: 'quietink',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    bio: 'Finding poetry in the mundane. Software engineer by day, poet by night.',
    languages: ['English', 'Mandarin'],
    totalReads: 8920,
    totalUpvotes: 2100,
    totalPoems: 23,
    followersCount: 890,
    badges: [{ type: 'rising', label: 'Rising' }],
  },
  {
    id: '3',
    name: 'Amara Okonkwo',
    username: 'amarawrites',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face',
    bio: 'Lagos-born. London-based. Poetry is my first language.',
    languages: ['English', 'Yoruba'],
    totalReads: 2340,
    totalUpvotes: 780,
    totalPoems: 12,
    followersCount: 340,
    badges: [{ type: 'new', label: 'New Voice' }],
  },
  {
    id: '4',
    name: 'Sofia Lindberg',
    username: 'nordicpoet',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    bio: 'Capturing northern lights in words. Stockholm, Sweden.',
    languages: ['English', 'Swedish'],
    totalReads: 15670,
    totalUpvotes: 4300,
    totalPoems: 45,
    followersCount: 1230,
    badges: [],
  },
  {
    id: '5',
    name: 'Kai Nakamura',
    username: 'haiku_kai',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    bio: 'Haiku traditionalist. Finding infinity in seventeen syllables.',
    languages: ['English', 'Japanese'],
    totalReads: 67800,
    totalUpvotes: 18900,
    totalPoems: 312,
    followersCount: 8900,
    badges: [{ type: 'trending', label: 'Trending' }],
  },
];

export const mockPoems: Poem[] = [
  {
    id: '1',
    title: 'After the Rain',
    text: `The city exhales,
wet pavement mirrors streetlights—
a thousand small moons.

I walk home alone
counting puddles like blessings,
each one holding sky.`,
    poet: mockPoets[4],
    language: 'English',
    tags: ['haiku', 'nature', 'city', 'reflection'],
    upvotes: 234,
    comments: 18,
    saves: 45,
    reads: 1203,
    createdAt: '2026-01-08T10:30:00Z',
    isUpvoted: false,
    isSaved: false,
  },
  {
    id: '2',
    title: "Grandmother's Hands",
    text: `Her hands knew things
mine have forgotten—
how to knead bread without measuring,
how to mend torn fabric
so the seam disappears,
how to hold a child's fever
until morning came quiet.

I press my palms to the kitchen window
watching snow fall like flour
and try to remember
the weight of her touch.`,
    poet: mockPoets[0],
    language: 'English',
    tags: ['memory', 'family', 'loss', 'love'],
    upvotes: 892,
    comments: 67,
    saves: 234,
    reads: 4521,
    createdAt: '2026-01-07T15:45:00Z',
    isUpvoted: true,
    isSaved: true,
  },
  {
    id: '3',
    text: `i learned to code before i learned to cry in public
both require syntax
both break when you forget a closing bracket

in this language of machines
i write myself errors:
undefined variable: self
null reference: home
stack overflow: trying to hold it all

the compiler does not care
if your logic is beautiful
only if it runs

i wish people worked that way`,
    poet: mockPoets[1],
    language: 'English',
    tags: ['modern', 'tech', 'identity', 'vulnerability'],
    upvotes: 445,
    comments: 89,
    saves: 167,
    reads: 2890,
    createdAt: '2026-01-07T09:20:00Z',
    isUpvoted: false,
    isSaved: false,
  },
  {
    id: '4',
    title: 'First Day',
    text: `I arrived with words
packed tight in my throat—
afraid they would spill wrong,
accent-heavy, rhythm off.

But here, in this strange new quiet,
I found my mother tongue
waiting in the margins,
patient as always.

Today I wrote my name
in two languages
and neither felt like home
and both did.`,
    poet: mockPoets[2],
    language: 'English',
    tags: ['immigration', 'identity', 'language', 'belonging'],
    upvotes: 178,
    comments: 23,
    saves: 56,
    reads: 890,
    createdAt: '2026-01-06T18:00:00Z',
    isUpvoted: false,
    isSaved: false,
  },
  {
    id: '5',
    title: 'Winter Archipelago',
    text: `Between islands of snow
the sea turns to iron,
holding boats like caught breath.

We wait for spring
the way grandmothers wait—
with tea, with silence,
with certainty born of repetition.

The ice will break.
It always does.
We just have to outlast
the stillness.`,
    poet: mockPoets[3],
    language: 'English',
    tags: ['nature', 'nordic', 'patience', 'seasons'],
    upvotes: 312,
    comments: 28,
    saves: 89,
    reads: 1567,
    createdAt: '2026-01-05T12:15:00Z',
    isUpvoted: false,
    isSaved: true,
  },
  {
    id: '6',
    title: 'Untitled (3 AM)',
    text: `cannot sleep again
so i am counting all the ways
i could have said i love you
and did not

the ceiling knows my secrets now
plaster confessor,
silent priest

tomorrow i will be fine
tomorrow i will forget
tonight i am just
awake
and missing you`,
    poet: mockPoets[0],
    language: 'English',
    tags: ['love', 'insomnia', 'longing', 'night'],
    upvotes: 567,
    comments: 45,
    saves: 203,
    reads: 3421,
    createdAt: '2026-01-04T03:00:00Z',
    isUpvoted: false,
    isSaved: false,
  },
];

export const trendingPoets = mockPoets.filter(p => 
  p.badges.some(b => b.type === 'trending')
);

export const newPoets = mockPoets.filter(p => 
  p.badges.some(b => b.type === 'new')
);

export const risingPoets = mockPoets.filter(p => 
  p.badges.some(b => b.type === 'rising')
);
