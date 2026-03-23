import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Listing, SectionId } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getListingSection(listing: Listing): SectionId | null {
  if (listing.sectionId) return listing.sectionId;
  
  // Infer from categoryId
  if (listing.categoryId === 'gold') return 'currency';
  if (listing.categoryId === 'accounts') return 'accounts';
  if (listing.categoryId === 'items') return 'items';
  if (listing.categoryId === 'services') return 'boosting';

  // Infer from title/description keywords
  const text = (listing.title + ' ' + listing.description).toLowerCase();
  
  const currencyKeywords = ['gold', 'gp', 'coins', 'currency'];
  const accountKeywords = ['account', 'main', 'pure', 'ironman', 'skiller', 'maxed', 'hcim'];
  const itemKeywords = ['item', 'gear', 'weapon', 'armor', 'cape', 'pet', 'supplies', 'rare'];
  const boostingKeywords = ['boosting', 'service', 'questing', 'leveling', 'raids', 'diaries', 'fire cape'];

  if (currencyKeywords.some(k => text.includes(k))) return 'currency';
  if (accountKeywords.some(k => text.includes(k))) return 'accounts';
  if (itemKeywords.some(k => text.includes(k))) return 'items';
  if (boostingKeywords.some(k => text.includes(k))) return 'boosting';

  return null;
}
