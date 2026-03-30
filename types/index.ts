export type GameId = 'OSRS' | 'RS3' | 'RSPS';

export type SectionId = 'currency' | 'accounts' | 'items' | 'boosting';

export type CategoryId = 'gold' | 'items' | 'accounts' | 'boosting';

export interface Game {
  id: GameId;
  name: string;
  icon: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  totalSales: number;
  isVerified: boolean;
  isTrusted?: boolean;
  joinedAt: string;
}

export interface AccountMetadata {
  build: string;
  type: string;
  loginMethod: string;
  totalLevel: string;
  deliveryTime: string;
  tags: string[];
  stats?: Record<string, number>;
  highlights?: string[];
  notes?: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  gameId: GameId;
  sectionId: SectionId;
  categoryId: CategoryId;
  title: string;
  description: string;
  price: number;
  stock?: number;
  deliveryTime: string;
  deliveryMethod: string;
  images?: string[];
  isFeatured?: boolean;
  createdAt: string;
  metadata?: AccountMetadata | Record<string, unknown>;
  seller?: User;
}

export interface AccountListing extends Listing {
  sectionId: 'accounts';
  categoryId: 'accounts';
  metadata?: AccountMetadata;
}

export function isAccountListing(listing: Listing): listing is AccountListing {
  return listing.sectionId === 'accounts';
}

export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  totalPrice: number;
  status: 'pending' | 'processing' | 'completed' | 'disputed' | 'cancelled';
  createdAt: string;
}

export interface ConversationPerson {
  username: string | null;
  avatar_url: string | null;
}

export interface ConversationListing {
  title: string | null;
}

export interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id?: string | null;
  last_message_at?: string | null;
  buyer_last_read_at?: string | null;
  seller_last_read_at?: string | null;
  last_message_by?: string | null;
  buyer?: ConversationPerson | null;
  seller?: ConversationPerson | null;
  listing?: ConversationListing | null;
  other_person?: ConversationPerson | null;
}

export interface Message {
  id: string;
  content: string;

  senderId?: string;
  receiverId?: string;
  createdAt?: string;
  isRead?: boolean;

  conversation_id?: string;
  sender_id?: string;
  created_at?: string;
  is_read?: boolean | null;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: 'order_issue' | 'account_issue' | 'payment_issue' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  lastUpdate: string;
}