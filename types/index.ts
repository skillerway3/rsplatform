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
  stats?: { [key: string]: number };
  highlights?: string[];
  notes?: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  gameId: GameId;
  sectionId?: SectionId;
  categoryId: CategoryId;
  title: string;
  description: string;
  price: number;
  stock: number;
  deliveryTime: string;
  deliveryMethod: string;
  images: string[];
  isFeatured?: boolean;
  createdAt: string;
  accountMetadata?: AccountMetadata;
  metadata?: any;
  seller?: User;
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

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
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
