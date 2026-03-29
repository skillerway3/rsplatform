'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  Zap,
  LayoutGrid,
  List,
  X,
  Loader2,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { motion, AnimatePresence } from 'motion/react';
import { GAMES, CATEGORIES } from '@/data/mock';
import { formatCurrency, cn } from '@/lib/utils';
import {
  GameId,
  CategoryId,
  SectionId,
  Listing,
  AccountMetadata,
  isAccountListing,
} from '@/types';
import { SECTION_TO_CATEGORY, NAV_SECTIONS } from '@/data/navigation';
import { AccountFilters } from '@/components/browse/AccountFilters';
import { AccountListingCard } from '@/components/browse/AccountListingCard';
import { BoostingSection } from '@/components/boosting/BoostingSection';
import { ListingCard } from '@/components/ListingCard';
import { supabase } from '@/lib/supabase';

interface Seller {
  id: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  rating: number;
  totalSales: number;
  joinedAt: string;
}

interface DbListingRow {
  id: string;
  title: string;
  description: string;
  price: number;
  game: string;
  category: string;
  seller_id: string;
  created_at: string;
  metadata?: AccountMetadata | Record<string, unknown> | null;
}

interface BrowseListing extends Listing {
  game: string;
  category: string;
  seller_id: string;
  created_at: string;
  seller: Seller;
}

const CATEGORY_TO_SECTION: Record<CategoryId, SectionId> = {
  gold: 'currency',
  items: 'items',
  accounts: 'accounts',
  boosting: 'boosting',
};

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sectionParam = searchParams.get('section');
  const gameParam = searchParams.get('game');
  const categoryParam = searchParams.get('category');

  const [listings, setListings] = React.useState<BrowseListing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedGame, setSelectedGame] = React.useState<GameId | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryId | 'all'>('all');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  const [accountFilters, setAccountFilters] = React.useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    build: '',
    type: '',
    loginMethod: '',
    totalLevel: '',
  });

  React.useEffect(() => {
    const currentSection = sectionParam;
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
      const game = GAMES.find((g) => g.id.toLowerCase() === currentGame.toLowerCase());
      if (game) setSelectedGame(game.id as GameId);
      else setSelectedGame('all');
    } else {
      setSelectedGame('all');
    }

    if (currentSection) {
      const categoryId = SECTION_TO_CATEGORY[currentSection.toLowerCase()];
      if (categoryId) setSelectedCategory(categoryId as CategoryId);
      else setSelectedCategory('all');
    } else {
      setSelectedCategory('all');
    }
  }, [sectionParam, gameParam, categoryParam, searchParams, pathname, router]);

  React.useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);

      try {
        let query = supabase
          .from('listings')
          .select('id, title, price, game, category, seller_id, created_at, description, metadata')
          .eq('status', 'active');

        if (selectedGame !== 'all') {
          query = query.eq('game', selectedGame);
        }

        if (sectionParam) {
          const categoryId = SECTION_TO_CATEGORY[sectionParam.toLowerCase()];
          if (categoryId) {
            query = query.eq('category', categoryId);
          }
        } else if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }

        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }

        const { data: listingsData, error: fetchError } = await query.order('created_at', {
          ascending: false,
        });

        if (fetchError) throw fetchError;

        if (listingsData && listingsData.length > 0) {
          const typedListingsData = listingsData as DbListingRow[];
          const sellerIds = Array.from(new Set(typedListingsData.map((l) => l.seller_id)));

          const { data: profilesData } = await supabase
            .from('profiles')
            .select(
              'id, username, avatar_url, is_verified_seller, average_rating, review_count, created_at'
            )
            .in('id', sellerIds);

          const profileMap = (profilesData || []).reduce(
            (acc, p) => {
              acc[p.id] = p;
              return acc;
            },
            {} as Record<
              string,
              {
                username: string;
                avatar_url: string | null;
                is_verified_seller: boolean;
                average_rating: number;
                review_count: number;
                created_at: string;
              }
            >
          );

          const transformedData: BrowseListing[] = typedListingsData.map((item) => {
            const seller = profileMap[item.seller_id];
            const categoryId = item.category as CategoryId;
            const sectionId = CATEGORY_TO_SECTION[categoryId] ?? 'currency';

            return {
              ...item,
              createdAt: item.created_at,
              gameId: item.game as GameId,
              sectionId,
              categoryId,
              sellerId: item.seller_id,
              deliveryTime: 'Instant Delivery',
              deliveryMethod: 'In-game Trade',
              metadata: item.metadata ?? undefined,
              seller: {
                id: item.seller_id,
                username: seller?.username || 'Unknown',
                avatar:
                  seller?.avatar_url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.seller_id}`,
                isVerified: seller?.is_verified_seller || false,
                rating: seller?.average_rating || 0,
                totalSales: seller?.review_count || 0,
                joinedAt: seller?.created_at || new Date().toISOString(),
              },
            };
          });

          setListings(transformedData);
        } else {
          setListings([]);
        }
      } catch (err: unknown) {
        console.error('Error fetching listings:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [selectedGame, selectedCategory, sectionParam, searchQuery]);

  const updateUrl = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === 'all') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleGameSelect = (gameId: string) => {
    updateUrl({ game: gameId });
    if (isFilterOpen) setIsFilterOpen(false);
  };

  const handleCategorySelect = (categoryId: string) => {
    const sectionId = Object.keys(SECTION_TO_CATEGORY).find(
      (key) => SECTION_TO_CATEGORY[key] === categoryId
    );

    if (sectionId) {
      updateUrl({ section: sectionId });
    } else {
      updateUrl({ section: null });
    }

    if (isFilterOpen) setIsFilterOpen(false);
  };

  const isAccountSection =
    selectedCategory === 'accounts' || sectionParam?.toLowerCase() === 'accounts';

  const isBoostingSection =
    selectedCategory === 'boosting' || sectionParam?.toLowerCase() === 'boosting';

  const clearAccountFilters = () => {
    setAccountFilters({
      search: '',
      minPrice: '',
      maxPrice: '',
      build: '',
      type: '',
      loginMethod: '',
      totalLevel: '',
    });
  };

  return (
    <div className="pt-32 pb-32 bg-zinc-950 min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[20%] h-[20%] bg-amber-500/5 rounded-full blur-[60px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center space-x-2 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                <span>The Exchange</span>
                {(sectionParam || gameParam) && (
                  <>
                    <span className="text-zinc-800">/</span>
                    <span className="text-zinc-400">
                      {sectionParam
                        ? NAV_SECTIONS.find((s) => s.id === sectionParam.toLowerCase())?.name
                        : 'All'}
                    </span>
                    {gameParam && (
                      <>
                        <span className="text-zinc-800">/</span>
                        <span className="text-amber-500">{gameParam.toUpperCase()}</span>
                      </>
                    )}
                  </>
                )}
              </div>
              <h1 className="text-6xl font-black text-zinc-100 tracking-tighter uppercase leading-none">
                {sectionParam
                  ? NAV_SECTIONS.find((s) => s.id === sectionParam.toLowerCase())?.name
                  : 'Marketplace'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    viewMode === 'grid'
                      ? 'bg-amber-500 text-zinc-950'
                      : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    viewMode === 'list'
                      ? 'bg-amber-500 text-zinc-950'
                      : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <Button
                variant="secondary"
                className="md:hidden rounded-xl border border-white/5 bg-zinc-900/50"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {isAccountSection && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8"
            >
              <AccountFilters
                filters={accountFilters}
                setFilters={setAccountFilters}
                onClear={clearAccountFilters}
              />
            </motion.div>
          )}

          {isBoostingSection ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <BoostingSection />
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {!isAccountSection && (
                <aside className="hidden lg:block lg:col-span-3 space-y-10 sticky top-32">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6">
                        Search
                      </h3>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <Input
                          placeholder="Search marketplace..."
                          className="pl-12 bg-zinc-900/30 border-zinc-800/50"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6">
                        Game Selection
                      </h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleGameSelect('all')}
                          className={cn(
                            'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-[11px] font-black uppercase tracking-widest',
                            selectedGame === 'all'
                              ? 'bg-amber-500/10 border-amber-500/50 text-amber-500'
                              : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700'
                          )}
                        >
                          All Games
                        </button>

                        {GAMES.map((game) => (
                          <button
                            key={game.id}
                            onClick={() => handleGameSelect(game.id)}
                            className={cn(
                              'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-[11px] font-black uppercase tracking-widest',
                              selectedGame === game.id
                                ? 'bg-amber-500/10 border-amber-500/50 text-amber-500'
                                : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700'
                            )}
                          >
                            {game.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6">
                        Asset Category
                      </h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleCategorySelect('all')}
                          className={cn(
                            'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-[11px] font-black uppercase tracking-widest',
                            selectedCategory === 'all'
                              ? 'bg-amber-500/10 border-amber-500/50 text-amber-500'
                              : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700'
                          )}
                        >
                          All Categories
                        </button>

                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat.id)}
                            className={cn(
                              'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-[11px] font-black uppercase tracking-widest',
                              selectedCategory === cat.id
                                ? 'bg-amber-500/10 border-amber-500/50 text-amber-500'
                                : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700'
                            )}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </aside>
              )}

              <div className={cn(isAccountSection ? 'lg:col-span-12' : 'lg:col-span-9')}>
                <div
                  className={cn(
                    'grid gap-8',
                    isAccountSection
                      ? 'grid-cols-1'
                      : viewMode === 'grid'
                        ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                        : 'grid-cols-1'
                  )}
                >
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      <div className="lg:col-span-full py-32 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">
                          Scanning Inventory...
                        </p>
                      </div>
                    ) : (
                      listings.map((listing, i) => (
                        <motion.div
                          key={listing.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                        >
                          {isAccountSection && isAccountListing(listing) ? (
                            <AccountListingCard listing={listing} />
                          ) : viewMode === 'list' ? (
                            <Link href={`/listing/${listing.id}`}>
                              <Card className="premium-card group overflow-hidden hover:border-amber-500/30 transition-all duration-300">
                                <div className="flex flex-col sm:flex-row h-full">
                                  <div className="w-full sm:w-48 h-48 sm:h-auto relative overflow-hidden shrink-0 bg-zinc-900 flex items-center justify-center">
                                    <Package className="w-8 h-8 text-zinc-800" />
                                    <div className="absolute top-3 left-3">
                                      <Badge
                                        variant="gold"
                                        className="text-[8px] font-black uppercase tracking-widest"
                                      >
                                        {listing.gameId}
                                      </Badge>
                                    </div>
                                  </div>

                                  <CardContent className="p-6 flex flex-col justify-between flex-grow">
                                    <div>
                                      <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-black text-zinc-100 tracking-tight uppercase group-hover:text-amber-500 transition-colors line-clamp-1">
                                          {listing.title}
                                        </h3>
                                      </div>

                                      <p className="text-zinc-500 text-xs line-clamp-2 mb-4 font-medium leading-relaxed">
                                        {listing.description}
                                      </p>

                                      <div className="flex items-center space-x-4">
                                        <div className="flex items-center text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                                          <Zap className="w-3 h-3 mr-1" />
                                          {listing.deliveryTime}
                                        </div>
                                        <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                                        <div className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                                          {listing.deliveryMethod}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
                                      <div className="text-xl font-black text-zinc-100 tracking-tighter">
                                        {formatCurrency(listing.price)}
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest group-hover:bg-amber-500 group-hover:text-zinc-950 transition-all"
                                      >
                                        Buy Now
                                      </Button>
                                    </div>
                                  </CardContent>
                                </div>
                              </Card>
                            </Link>
                          ) : (
                            <ListingCard listing={listing} index={i} />
                          )}
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                {!loading && listings.length === 0 && (
                  <div className="py-32 text-center">
                    <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-8">
                      <Search className="w-8 h-8 text-zinc-700" />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-100 uppercase tracking-tight mb-4">
                      No Inventory Found
                    </h3>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">
                      Adjust your search parameters or filters.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/80 z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-zinc-950 border-l border-white/10 z-[101] lg:hidden overflow-y-auto"
            >
              <div className="p-8 space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    Filters
                  </h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 bg-zinc-900 rounded-xl text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6">
                      Search
                    </h3>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <Input
                        placeholder="Search marketplace..."
                        className="pl-12 bg-zinc-900/30 border-zinc-800/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6">
                      Game Selection
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleGameSelect('all')}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-[11px] font-black uppercase tracking-widest',
                          selectedGame === 'all'
                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-500'
                            : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700'
                        )}
                      >
                        All Games
                      </button>

                      {GAMES.map((game) => (
                        <button
                          key={game.id}
                          onClick={() => handleGameSelect(game.id)}
                          className={cn(
                            'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-[11px] font-black uppercase tracking-widest',
                            selectedGame === game.id
                              ? 'bg-amber-500/10 border-amber-500/50 text-amber-500'
                              : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700'
                          )}
                        >
                          {game.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6">
                      Asset Category
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleCategorySelect('all')}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-[11px] font-black uppercase tracking-widest',
                          selectedCategory === 'all'
                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-500'
                            : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700'
                        )}
                      >
                        All Categories
                      </button>

                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat.id)}
                          className={cn(
                            'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-[11px] font-black uppercase tracking-widest',
                            selectedCategory === cat.id
                              ? 'bg-amber-500/10 border-amber-500/50 text-amber-500'
                              : 'bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700'
                          )}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <Button
                    className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black uppercase tracking-widest py-6"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Show Results
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BrowseContent />
    </React.Suspense>
  );
}