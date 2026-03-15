export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  tag: string;
  date: string;
  readTime: string;
  content: string[];
};

export const journalPosts: JournalPost[] = [
  {
    slug: 'capsule-wardrobe-nairobi-weather',
    title: 'How to Build a Capsule Wardrobe for Nairobi Weather',
    excerpt:
      'A practical layering guide for cool mornings, warm afternoons, and everything in between.',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1800&auto=format&fit=crop',
    tag: 'Style Guide',
    date: 'March 2026',
    readTime: '4 min read',
    content: [
      'Nairobi weather can change quickly across the day, so your wardrobe works best when it is built around layers. Start with lightweight base pieces like soft tees and tanks that breathe and are easy to combine under overshirts or jackets.',
      'Add one or two structured middle layers like an overshirt, denim shirt, or utility jacket. These are pieces you can remove at noon and put back on in the evening without changing your full outfit. Neutral shades make combinations easier and help you buy less while wearing more.',
      'For bottoms, prioritize durable cuts that can move between casual and elevated looks. A strong capsule wardrobe is not about owning very few items. It is about owning intentional items that repeat well, fit properly, and age gracefully with daily use.'
    ]
  },
  {
    slug: 'heavy-cotton-ages-better',
    title: 'Fabric Notes: Why Heavy Cotton Ages Better',
    excerpt:
      'From texture to durability, this is what to look for when buying pieces meant to last years.',
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1800&auto=format&fit=crop',
    tag: 'Materials',
    date: 'February 2026',
    readTime: '5 min read',
    content: [
      'Heavy cotton develops character as it wears. Instead of thinning too quickly, it softens gradually and keeps structure in key areas like shoulders, hems, and collars. That makes it ideal for everyday garments that need both comfort and longevity.',
      'When checking cotton quality, pay attention to weight, weave tightness, and finishing. A slightly denser fabric usually resists pilling and shape distortion better than very light alternatives. Wash behavior also matters: better cotton tends to settle into its fit after a few wears and rinses.',
      'The best way to buy for longevity is simple: choose pieces that feel substantial in hand, have clean seam finishing, and can be styled across multiple seasons. You may buy fewer pieces up front, but they serve longer and look better over time.'
    ]
  },
  {
    slug: 'designing-for-real-movement',
    title: 'Behind the Brand: Designing for Real Movement',
    excerpt:
      'A quick look at how fit, proportion, and utility shape every Mnada silhouette.',
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1800&auto=format&fit=crop',
    tag: 'Inside Mnada',
    date: 'January 2026',
    readTime: '4 min read',
    content: [
      'Every product begins with movement. Before style details are finalized, we test how a garment behaves while walking, reaching, commuting, and spending long hours in it. Real comfort comes from balancing room where needed and structure where it matters.',
      'Proportion is equally important. We focus on shapes that look deliberate without feeling restrictive, so the garment still feels useful when your day shifts from errands to meetings to evenings out. Utility details are added only when they improve daily function.',
      'Our goal is timelessness through usability. When fit, proportion, and purpose align, clothing becomes part of your routine rather than something you struggle to style. That is the standard we aim for in every release.'
    ]
  }
];

export function getJournalPostBySlug(slug: string) {
  return journalPosts.find((post) => post.slug === slug);
}
