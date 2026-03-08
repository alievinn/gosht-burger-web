
export enum Category {
  BURGER = 'Burgerler',
  STEAK = 'Steak & Etler',
  KIDS = 'Çocuk Menüsü'
}

export interface Variant {
  id: string;
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // base price or default variant price
  category: Category;
  image: string;
  isSignature?: boolean;
  variants?: Variant[];
}

export interface CartItem extends MenuItem {
  quantity: number;
  customizations?: string;
  cartItemId: string;
  selectedVariant?: Variant;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  paymentMethod: 'cash' | 'card';
  orderNote?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  customer: CustomerInfo;
  total: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface LoyaltyHistoryEntry {
  type: 'earn' | 'redeem';
  amount: number;
  timestamp: number;
  description: string;
}

export interface LoyaltyAccount {
  phone: string;
  points: number;
  history: LoyaltyHistoryEntry[];
}

export interface SiteSettings {
  aboutText: string;
  aboutLabel: string;
  aboutTitle: string;
  aboutQuote: string;
  aboutFeatures: string;
  aboutImage1: string | null;
  aboutImage2: string | null;
  franchiseText: string;
  franchiseLabel: string;
  franchiseTitle: string;
  franchiseQuote: string;
  franchiseWhyTitle: string;
  franchiseImage: string | null;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  whatsappNumber: string;
  instagramUrl: string;
  tiktokUrl: string;
  // Hero Settings
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  // Footer Settings
  footerDescription: string;
  footerCopyright: string;
  // Loyalty Settings
  loyaltyEnabled: boolean;
  pointsPerTL: number;
  minPointsToRedeem: number;
  pointValueInTL: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: number;
}

export interface FranchiseApplication {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  message: string;
  timestamp: number;
}

export interface Feedback {
  id: string;
  name: string;
  email?: string;
  rating: number; // 1-5
  comment: string;
  timestamp: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  timestamp: number;
}
