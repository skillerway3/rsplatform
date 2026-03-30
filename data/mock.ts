import { Game, Category, User, Listing, Order, Message, SupportTicket } from '../types';

export const GAMES: Game[] = [
  { id: 'OSRS', name: 'Old School RuneScape', icon: 'Shield' },
  { id: 'RS3', name: 'RuneScape 3', icon: 'Sword' },
  { id: 'RSPS', name: 'Private Servers', icon: 'Zap' },
];

export const CATEGORIES: Category[] = [
  { id: 'gold', name: 'Currency', icon: 'Coins' },
  { id: 'items', name: 'Items', icon: 'Package' },
  { id: 'accounts', name: 'Accounts', icon: 'User' },
  { id: 'boosting', name: 'Boosting', icon: 'Wrench' },
];

export const USERS: User[] = [
  {
    id: 'u1',
    username: 'PremiumTrader',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u1',
    rating: 4.9,
    totalSales: 1250,
    isVerified: true,
    joinedAt: '2023-01-15',
  },
  {
    id: 'u2',
    username: 'IronmanSupplies',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=u2',
    rating: 4.8,
    totalSales: 850,
    isVerified: true,
    joinedAt: '2023-05-20',
  },
];

export const LISTINGS: Listing[] = [
  {
    id: 'l1',
    sellerId: 'u1',
    gameId: 'OSRS',
    sectionId: 'currency',
    categoryId: 'gold',
    title: '100M OSRS Gold - Instant Delivery',
    description:
      'Safe and secure OSRS gold. Instant delivery via face-to-face trade. 100% safe, sourced from high-level players.',
    price: 24.5,
    stock: 5000,
    deliveryTime: '5 mins',
    deliveryMethod: 'Face-to-Face',
    images: [],
    isFeatured: true,
    createdAt: '2024-03-10',
  },
  {
    id: 'l2',
    sellerId: 'u2',
    gameId: 'OSRS',
    sectionId: 'items',
    categoryId: 'items',
    title: 'Twisted Bow - Clean',
    description:
      'Selling a clean Twisted Bow. No history of RWT on this account. Safe transfer guaranteed.',
    price: 1250.0,
    stock: 1,
    deliveryTime: '15 mins',
    deliveryMethod: 'Face-to-Face',
    images: [],
    isFeatured: true,
    createdAt: '2024-03-12',
  },
  {
    id: 'l3',
    sellerId: 'u1',
    gameId: 'RS3',
    sectionId: 'currency',
    categoryId: 'gold',
    title: '1B RS3 Gold - Best Price',
    description:
      'Cheap RS3 gold. Fast delivery. Trusted seller with thousands of successful trades.',
    price: 18.9,
    stock: 10000,
    deliveryTime: '10 mins',
    deliveryMethod: 'Face-to-Face',
    images: [],
    createdAt: '2024-03-15',
  },
  {
    id: 'l4',
    sellerId: 'u1',
    gameId: 'OSRS',
    sectionId: 'accounts',
    categoryId: 'accounts',
    title: 'Maxed Main - 2277 Total - Infernal Cape',
    description:
      'Selling my personal maxed main account. 2277 total level, Infernal Cape, Quiver, all diaries completed. Clean history, email included.',
    price: 3500.0,
    stock: 1,
    deliveryTime: '30 mins',
    deliveryMethod: 'Manual Transfer',
    images: [],
    isFeatured: true,
    createdAt: '2024-03-18',
    metadata: {
      build: 'Max',
      type: 'Main',
      loginMethod: 'Legacy Login',
      totalLevel: '2000+',
      deliveryTime: '30 min',
      tags: ['email set', 'clean', 'quested', 'rare items'],
      highlights: ['2277 Total', 'Infernal Cape', 'All Diaries', 'Pet Kraken'],
    },
  },
  {
    id: 'l5',
    sellerId: 'u2',
    gameId: 'OSRS',
    sectionId: 'accounts',
    categoryId: 'accounts',
    title: 'Ironman Starter - 99 Firemaking',
    description:
      'Fresh ironman account with 99 Firemaking from Wintertodt. Ready for your journey.',
    price: 45.0,
    stock: 1,
    deliveryTime: 'Instant',
    deliveryMethod: 'Jagex Launcher',
    images: [],
    createdAt: '2024-03-19',
    metadata: {
      build: 'Ironman',
      type: 'Ironman',
      loginMethod: 'Jagex Launcher',
      totalLevel: '500-999',
      deliveryTime: 'Instant',
      tags: ['tutorial completed', 'clean', 'rested'],
      highlights: ['99 Firemaking', 'Wintertodt Loot', 'Fresh Start'],
    },
  },
  {
    id: 'l6',
    sellerId: 'u1',
    gameId: 'OSRS',
    sectionId: 'currency',
    categoryId: 'gold',
    title: '500M OSRS Gold - Bulk Discount',
    description: 'Large amount of OSRS gold available. Safe and fast.',
    price: 120.0,
    stock: 1000,
    deliveryTime: '10 mins',
    deliveryMethod: 'Face-to-Face',
    images: [],
    createdAt: '2024-03-20',
  },
  {
    id: 'l7',
    sellerId: 'u2',
    gameId: 'OSRS',
    sectionId: 'items',
    categoryId: 'items',
    title: 'Scythe of Vitur',
    description: 'Uncharged Scythe of Vitur. Best in slot for many bosses.',
    price: 850.0,
    stock: 1,
    deliveryTime: '15 mins',
    deliveryMethod: 'Face-to-Face',
    images: [],
    createdAt: '2024-03-21',
  },
];

export const ORDERS: Order[] = [
  {
    id: 'o1',
    listingId: 'l1',
    buyerId: 'u2',
    sellerId: 'u1',
    totalPrice: 24.5,
    status: 'completed',
    createdAt: '2024-03-16T10:00:00Z',
  },
];

export const MESSAGES: Message[] = [
  {
    id: 'm1',
    senderId: 'u2',
    receiverId: 'u1',
    content: 'Hi, is the gold still available for instant delivery?',
    createdAt: '2024-03-16T09:45:00Z',
    isRead: true,
  },
  {
    id: 'm2',
    senderId: 'u1',
    receiverId: 'u2',
    content: 'Yes, I am online now. Ready when you are.',
    createdAt: '2024-03-16T09:50:00Z',
    isRead: true,
  },
];

export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 't1',
    userId: 'u2',
    subject: 'Order #o1 delivery delay',
    category: 'order_issue',
    status: 'resolved',
    createdAt: '2024-03-16T11:00:00Z',
    lastUpdate: '2024-03-16T12:00:00Z',
  },
];