export type UserRole = "user" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  createdAt?: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: "digital" | "physical";
  priceNgn: number;
  images: string[];
  /** Index into `images` for card thumbnail and default gallery slide */
  primaryImageIndex?: number;
  stock: number | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PhysicalDeliveryStatus =
  | "pending_payment"
  | "awaiting_fulfillment"
  | "processing"
  | "out_for_delivery"
  | "delivered";

export interface OrderItem {
  _id: string;
  product: Product | string;
  title: string;
  productType: "digital" | "physical";
  quantity: number;
  unitPriceNgn: number;
  deliveryStatus?: PhysicalDeliveryStatus;
}

export interface Order {
  _id: string;
  user: string | User;
  items: OrderItem[];
  totalNgn: number;
  currency: string;
  paystackReference: string;
  paymentStatus: "pending" | "paid" | "failed" | "abandoned";
  paidAt?: string | null;
  fulfillmentNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  title: string;
  priceNgn: number;
  type: "digital" | "physical";
  quantity: number;
  image?: string;
}
