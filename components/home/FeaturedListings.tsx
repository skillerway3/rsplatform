import Link from 'next/link';

export function FeaturedListings() {
  const games = [
    {
      id: 'osrs',
      name: 'OSRS',
      image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop',
      href: '/browse?section=boosting&game=osrs'
    },
    {
      id: 'rs3',
      name: 'RS3',
      image: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?q=80&w=2070&auto=format&fit=crop',
      href: '/browse?section=boosting&game=rs3'
    },
    {
      id: 'rsps',
      name: 'RSPS',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop',
      href: '/browse?section=boosting&game=rsps'
    }
  ];

  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {games.map((game) => (
            <Link 
              key={game.id} 
              href={game.href}
              className="group relative aspect-[16/9] overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 hover:border-amber-500/30 transition-all duration-700 shadow-2xl hover:shadow-amber-500/10"
            >
              <img 
                src={game.image} 
                alt={game.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-700" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="w-12 h-[1px] bg-amber-500/50 mb-4 group-hover:w-20 transition-all duration-700" />
                <span className="text-3xl font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform duration-700">
                  {game.name}
                </span>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Explore Boosting</span>
                </div>
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
