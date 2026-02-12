
export enum Page {
  STORE,
  USED_PARTS,
  DETAIL,
}

export enum UseCase {
  GAMING = 'Gaming',
  STUDENT = 'Student',
  GENERAL = 'General Use',
}

export interface Question {
  question: string;
  options: string[];
}

export interface Answer {
  question: string;
  answer: string;
}

export interface ComponentSpec {
  name: string;
  spec: string;
}

export interface PurchaseOption {
    vendor: string;
    link: string;
    price: number;
}

export interface Review {
    source: string; // e.g., "TechSpot", "Gadgets360", "User Review"
    author: string;
    rating: number; // out of 5
    content: string;
}

export type ProductType = 'Custom Build' | 'Prebuilt PC' | 'Laptop';
export type FilterType = 'All' | ProductType;

export interface Product {
  isBestMatch: boolean;
  type: ProductType;
  title: string;
  rationale: string;
  estimatedPriceINR: number;
  components: ComponentSpec[];
  purchaseOptions: PurchaseOption[];
  reviews: Review[];
  imageUrl: string;
  tag?: 'Recommended for You' | 'Good Value' | 'High Performance';
}

export interface PriceHistoryData {
  month: string;
  price: number;
}

export interface UsedPart {
  id: string;
  component: string;
  grade: 'A' | 'B' | 'C';
  condition: string;
  price: number;
  imageUrl: string;
  details: string;
}