import Link from 'next/link';
import Image from 'next/image';

export function FeaturedListings() {
  const games = [
    {
      id: 'osrs',
      name: 'OSRS',
      image: '/osrs-hero-v2.jpg',
      href: '/browse?section=boosting&game=osrs'
    },
    {
      id: 'rs3',
      name: 'RS3',
      image: '/rs3-hero-v2.jpg',
      href: '/browse?section=boosting&game=rs3'
    },
    {
      id: 'rsps',
      name: 'RSPS',
      image: '/rsps-hero-v2.jpg',
      href: '/browse?section=boosting&game=rsps'
    }
  ];

  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden">

      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {games.map((game) => (
            <Link 
              key={game.id} 
              href={game.href}
              className="group relative aspect-[16/9] overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 hover:border-amber-500/30 transition-all duration-700 shadow-2xl hover:shadow-amber-500/10"
            >
              <Image 
                src={game.image} 
                alt={game.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-zinc-950/10 to-transparent opacity-50 group-hover:opacity-20 transition-opacity duration-700" />

              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}