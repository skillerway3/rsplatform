export const NAV_SECTIONS = [
  {
    id: 'currency',
    name: 'Currency',
    games: [
      { id: 'OSRS', name: 'OSRS' },
      { id: 'RS3', name: 'RS3' },
      { id: 'RSPS', name: 'RSPS' },
    ],
  },
  {
    id: 'accounts',
    name: 'Accounts',
    games: [
      { id: 'OSRS', name: 'OSRS' },
      { id: 'RS3', name: 'RS3' },
      { id: 'RSPS', name: 'RSPS' },
    ],
  },
  {
    id: 'items',
    name: 'Items',
    games: [
      { id: 'OSRS', name: 'OSRS' },
      { id: 'RS3', name: 'RS3' },
      { id: 'RSPS', name: 'RSPS' },
    ],
  },
  {
    id: 'boosting',
    name: 'Boosting',
    games: [
      { id: 'OSRS', name: 'OSRS' },
      { id: 'RS3', name: 'RS3' },
      { id: 'RSPS', name: 'RSPS' },
    ],
  },
];

export const SECTION_TO_CATEGORY: Record<string, string> = {
  currency: 'gold',
  accounts: 'accounts',
  items: 'items',
  boosting: 'services',
};
