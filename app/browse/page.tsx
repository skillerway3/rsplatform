'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  Loader2,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { GAMES, CATEGORIES } from '@/data/mock';
import { formatCurrency, cn } from '@/lib/utils';
import { SECTION_TO_CATEGORY, NAV_SECTIONS } from '@/data/navigation';
import { BoostingSection } from '@/components/boosting/BoostingSection';
import { supabase } from '@/lib/supabase';

type SellerProfile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_verified_seller: boolean | null;
  average_rating: number | null;
  review_count: number | null;
};

type ListingRow = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  game: string;
  category: string;
  seller_id: string;
  created_at?: string;
  status?: string;
  seller?: {
    id: string;
    username: string;
    avatar: string;
    isVerified: boolean;
    rating: number;
    totalSales: number;
  };
  gameId?: string;
  categoryId?: string;
  sellerId?: string;
  deliveryTime?: string;
  deliveryMethod?: string;
};

function ListingCardItem({
  listing,
  viewMode,
}: {
  listing: ListingRow;
  viewMode: 'grid' | 'list';
}) {
  if (viewMode === 'list') {
    return (
      <Link href={`/listing/${listing.id}`} className="block">
        <Card className="group border border-zinc-800/60 bg-zinc-950/70 backdrop-blur hover:border-amber-500/40 transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {listing.game}
                  </Badge>
                  <Badge className="bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {listing.category}
                  </Badge>
                  {listing.seller?.isVerified && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Verified Seller
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  {listing.title}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                  {listing.description || 'Premium marketplace listing.'}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{listing.seller?.username || 'Unknown seller'}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{listing.seller?.rating?.toFixed(1) || '0.0'} rating</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    <span>{listing.deliveryTime || 'Instant Delivery'}</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-4 lg:flex-col lg:items-end">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Price</p>
                  <p className="text-2xl font-black text-amber-400">
                    {formatCurrency(Number(listing.price || 0))}
                  </p>
                </div>

                <Button className="bg-amber-500 text-black hover:bg-amber-400">
                  View Listing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/listing/${listing.id}`} className="block h-full">
      <Card className="group h-full border border-zinc-800/60 bg-zinc-950/70 backdrop-blur hover:border-amber-500/40 transition-all duration-300">
        <CardContent className="flex h-full flex-col p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {listing.game}
            </Badge>
            <Badge className="bg-zinc-900 text-zinc-300 border border-zinc-800">
              {listing.category}
            </Badge>
          </div>

          <h3 className="line-clamp-2 text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
            {listing.title}
          </h3>

          <p className="mt-3 line-clamp-3 flex-1 text-sm text-zinc-400">
            {listing.description || 'Premium marketplace listing.'}
          </p>

          <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              <span className="truncate max-w-[120px]">
                {listing.seller?.username || 'Unknown seller'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>{listing.seller?.rating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Price</p>
              <p className="text-2xl font-black text-amber-400">
                {formatCurrency(Number(listing.price || 0))}
              </p>
            </div>

            <Button className="bg-amber-500 text-black hover:bg-amber-400">
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const sectionParam = searchParams.get('section');
  const gameParam = searchParams.get('game');
  const categoryParam = searchParams.get('category');

  const [listings, setListings] = React.useState<ListingRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedGame, setSelectedGame] = React.useState('all');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  React.useEffect(() => {
    let currentSection = sectionParam;
    const currentGame = gameParam;
    const currentCategory = categoryParam;

    const legacyMapping: Record<string, string> = {
      gold: 'currency',
      items: 'items',
      accounts: 'accounts',
      services: 'boosting',
    };

    if (currentCategory && legacyMapping[currentCategory.toLowerCase()]) {
      const mappedSection = legacyMapping[currentCategory.toLowerCase()];
      const params = new URLSearchParams(searchParams.toString());
      params.set('section', mappedSection);
      params.delete('category');
      router.replace(`${pathname}?${params.toString()}`);
      return;
    }

    if (currentGame) {
      const game = GAMES.find(
        (g: any) => g.id.toLowerCase() === currentGame.toLowerCase()
      );
      setSelectedGame(game ? game.id : 'all');
    } else {
      setSelectedGame('all');
    }

    if (currentSection) {
      const mappedCategory = SECTION_TO_CATEGORY[currentSection.toLowerCase()];
      setSelectedCategory(mappedCategory || 'all');
    } else {
      setSelectedCategory('all');
    }
  }, [sectionParam, gameParam, categoryParam, searchParams, pathname, router]);

  React.useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase.from('listings').select('*').eq('status', 'active');

        if (selectedGame !== 'all') {
          query = query.eq('game', selectedGame);
        }

        if (sectionParam) {
          const mappedCategory = SECTION_TO_CATEGORY[sectionParam.toLowerCase()];
          if (mappedCategory) {
            query = query.eq('category', mappedCategory);
          }
        } else if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }

        if (searchQuery.trim()) {
          query = query.ilike('title', `%${searchQuery.trim()}%`);
        }

        const { data, error: fetchError } = await query.order('created_at', {
          ascending: false,
        });

        if (fetchError) throw fetchError;

        const sellerIds = [
          ...new Set(
            (data || [])
              .map((item: any) => item.seller_id)
              .filter(Boolean)
          ),
        ] as string[];

        let profilesMap = new Map<string, SellerProfile>();

        if (sellerIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select(
              'id, username, avatar_url, is_verified_seller, average_rating, review_count'
            )
            .in('id', sellerIds);

          if (profilesError) throw profilesError;

          profilesMap = new Map(
            ((profilesData || []) as SellerProfile[]).map((profile) => [
              profile.id,
              profile,
            ])
          );
        }

        const transformedData: ListingRow[] = (data || []).map((item: any) => {
          const sellerProfile = profilesMap.get(item.seller_id);

          return {
            ...item,
            gameId: item.game,
            categoryId: item.category,
            sellerId: item.seller_id,
            deliveryTime: 'Instant Delivery',
            deliveryMethod: 'In-game Trade',
            seller: {
              id: item.seller_id,
              username: sellerProfile?.username || 'Unknown',
              avatar:
                sellerProfile?.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.seller_id}`,
              isVerified: sellerProfile?.is_verified_seller || false,
              rating: Number(sellerProfile?.average_rating || 0),
              totalSales: Number(sellerProfile?.review_count || 0),
            },
          };
        });

        setListings(transformedData);
      } catch (err: any) {
        console.error('Error fetching listings:', err);
        setError(err?.message || 'Failed to fetch listings');
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    const isBoostingSection =
      selectedCategory === 'services' || sectionParam?.toLowerCase() === 'boosting';

    if (!isBoostingSection) {
      fetchListings();
    } else {
      setLoading(false);
      setError(null);
    }
  }, [selectedGame, selectedCategory, sectionParam, searchQuery]);

  const updateUrl = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (!value || value === 'all') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleGameSelect = (gameId: string) => {
    updateUrl({ game: gameId === 'all' ? null : gameId });
    if (isFilterOpen) setIsFilterOpen(false);
  };

  const handleCategorySelect = (categoryId: string) => {
    const sectionId = Object.keys(SECTION_TO_CATEGORY).find(
      (key) => SECTION_TO_CATEGORY[key] === categoryId
    );

    updateUrl({ section: sectionId || null, category: null });

    if (isFilterOpen) setIsFilterOpen(false);
  };

  const currentSectionName =
    NAV_SECTIONS.find((s: any) => s.id === sectionParam?.toLowerCase())?.name ||
    'Marketplace';

  const isBoostingSection =
    selectedCategory === 'services' || sectionParam?.toLowerCase() === 'boosting';

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-zinc-800/60 bg-gradient-to-br from-zinc-950 to-zinc-900 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-400">
                The Exchange
                {(sectionParam || gameParam) && (
                  <>
                    {' / '}
                    {sectionParam
                      ? NAV_SECTIONS.find((s: any) => s.id === sectionParam.toLowerCase())
                          ?.name || 'All'
                      : 'All'}
                    {gameParam && <> / {gameParam.toUpperCase()}</>}
                  </>
                )}
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                {currentSectionName}
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
                Browse premium listings, compare verified sellers, and buy safely
                through RSPlatform.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'rounded-xl p-2 transition-all',
                  viewMode === 'grid'
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                )}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'rounded-xl p-2 transition-all',
                  viewMode === 'list'
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                )}
              >
                <List className="h-5 w-5" />
              </button>

              <Button
                onClick={() => setIsFilterOpen(true)}
                className="bg-zinc-900 text-white hover:bg-zinc-800 lg:hidden"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        {isBoostingSection ? (
          <BoostingSection />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <Card className="border border-zinc-800/60 bg-zinc-950/70">
                <CardContent className="space-y-6 p-5">
                  <div>
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
                      Search
                    </p>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search listings..."
                        className="border-zinc-800 bg-zinc-900/80 pl-10 text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
                      Game
                    </p>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleGameSelect('all')}
                        className={cn(
                          'w-full rounded-xl border px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest transition-all',
                          selectedGame === 'all'
                            ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                            : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                        )}
                      >
                        All Games
                      </button>

                      {GAMES.map((game: any) => (
                        <button
                          key={game.id}
                          type="button"
                          onClick={() => handleGameSelect(game.id)}
                          className={cn(
                            'w-full rounded-xl border px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest transition-all',
                            selectedGame === game.id
                              ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                              : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                          )}
                        >
                          {game.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
                      Category
                    </p>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => updateUrl({ section: null, category: null })}
                        className={cn(
                          'w-full rounded-xl border px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest transition-all',
                          selectedCategory === 'all'
                            ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                            : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                        )}
                      >
                        All Categories
                      </button>

                      {CATEGORIES.map((cat: any) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategorySelect(cat.id)}
                          className={cn(
                            'w-full rounded-xl border px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest transition-all',
                            selectedCategory === cat.id
                              ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                              : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                          )}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>

            <section>
              {error && (
                <Card className="mb-5 border border-red-500/30 bg-red-500/10">
                  <CardContent className="p-4 text-sm text-red-300">
                    Failed to load listings: {error}
                  </CardContent>
                </Card>
              )}

              {loading ? (
                <Card className="border border-zinc-800/60 bg-zinc-950/70">
                  <CardContent className="flex items-center justify-center gap-3 p-10 text-zinc-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Scanning inventory...</span>
                  </CardContent>
                </Card>
              ) : listings.length === 0 ? (
                <Card className="border border-zinc-800/60 bg-zinc-950/70">
                  <CardContent className="p-10 text-center">
                    <h3 className="text-xl font-bold text-white">No Inventory Found</h3>
                    <p className="mt-2 text-sm text-zinc-400">
                      Adjust your search parameters or filters.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div
                  className={cn(
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'
                      : 'space-y-4'
                  )}
                >
                  {listings.map((listing) => (
                    <ListingCardItem
                      key={listing.id}
                      listing={listing}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {isFilterOpen && (
        <>
          <button
            type="button"
            onClick={() => setIsFilterOpen(false)}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm lg:hidden"
          />

          <div className="fixed inset-x-0 bottom-0 z-[101] max-h-[85vh] rounded-t-3xl border-t border-zinc-800 bg-zinc-950 p-5 lg:hidden">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-black">Filters</h2>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="rounded-xl bg-zinc-900 p-2 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto pb-4">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
                  Search
                </p>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search listings..."
                    className="border-zinc-800 bg-zinc-900/80 pl-10 text-white placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
                  Game
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleGameSelect('all')}
                    className={cn(
                      'w-full rounded-xl border px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest transition-all',
                      selectedGame === 'all'
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                    )}
                  >
                    All Games
                  </button>

                  {GAMES.map((game: any) => (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => handleGameSelect(game.id)}
                      className={cn(
                        'w-full rounded-xl border px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest transition-all',
                        selectedGame === game.id
                          ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                          : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                      )}
                    >
                      {game.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">
                  Category
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => updateUrl({ section: null, category: null })}
                    className={cn(
                      'w-full rounded-xl border px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest transition-all',
                      selectedCategory === 'all'
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                    )}
                  >
                    All Categories
                  </button>

                  {CATEGORIES.map((cat: any) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={cn(
                        'w-full rounded-xl border px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest transition-all',
                        selectedCategory === cat.id
                          ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                          : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700'
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-amber-500 text-black hover:bg-amber-400"
              >
                Show Results
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return <BrowseContent />;
}