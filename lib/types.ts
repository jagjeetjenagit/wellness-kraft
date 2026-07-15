// Shared shapes used by pages and components.
// They match the Prisma models, and also the demo-mode sample data.

export interface ExpertT {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  photo: string;
  bio: string;
  credentials: string[];
  rating: number;
  reviewCount: number;
  calLink: string;
  featured: boolean;
  active?: boolean;
}

export interface ProductT {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  price: number; // rupees
  images: string[];
  stock: number;
  category: string;
  consultRecommended: boolean;
  featured: boolean;
  active?: boolean;
}

export interface CartItemT {
  id: string; // product id
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}
