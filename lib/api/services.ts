import { apiFetch } from "@/lib/api/client";
import type { Order, Product, User } from "@/lib/types";

/* ——— Auth ——— */

export async function login(body: { email: string; password: string }) {
  return apiFetch<{
    status: string;
    token: string;
    data: { user: User };
  }>("/users/login", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

export async function signUp(body: Record<string, unknown>) {
  return apiFetch<{
    status: string;
    token: string;
    data: { user: User };
  }>("/users/signUp", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

export async function getMe(token?: string) {
  return apiFetch<{ status: string; data: { user: User } }>("/users/me", {
    token: token ?? null,
  });
}

export async function updateMe(body: Partial<User>) {
  return apiFetch<{ status: string; data: { user: User } }>("/users/updateMe", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function updatePassword(body: {
  passwordCurrent: string;
  password: string;
  passwordConfirm: string;
}) {
  return apiFetch<{ status: string; token: string; data: { user: User } }>(
    "/users/updatePassword",
    { method: "PATCH", body: JSON.stringify(body) },
  );
}

export async function forgotPassword(body: { email: string }) {
  return apiFetch<{ status: string; message: string }>("/users/forgotPassword", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

export async function resetPassword(body: {
  token: string;
  password: string;
  passwordConfirm: string;
}) {
  return apiFetch<{
    status: string;
    message: string;
    token: string;
    data: { user: User };
  }>("/users/resetPassword", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

export async function submitContact(body: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  return apiFetch<{ status: string; message: string }>("/contact", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

/* ——— Products (public) ——— */

export async function listProducts(params?: { type?: "digital" | "physical" }) {
  const q = params?.type ? `?type=${params.type}` : "";
  return apiFetch<{
    status: string;
    results: number;
    data: { products: Product[] };
  }>(`/products${q}`, { skipAuth: true });
}

export async function getProduct(id: string) {
  return apiFetch<{ status: string; data: { product: Product } }>(
    `/products/${id}`,
    { skipAuth: true },
  );
}

/* ——— Admin products ——— */

export async function adminListProducts() {
  return apiFetch<{
    status: string;
    results: number;
    data: { products: Product[] };
  }>("/admin/products");
}

export async function adminGetProduct(id: string) {
  return apiFetch<{ status: string; data: { product: Product } }>(
    `/admin/products/${id}`,
  );
}

export async function createPhysicalProductJson(body: {
  title: string;
  description: string;
  priceNgn: number;
  stock: number;
  slug?: string;
  images?: string[];
}) {
  return apiFetch<{ status: string; data: { product: Product } }>(
    "/admin/products",
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function createPhysicalProductMultipart(form: FormData) {
  return apiFetch<{ status: string; data: { product: Product } }>(
    "/admin/products",
    { method: "POST", body: form },
  );
}

export async function createDigitalProduct(form: FormData) {
  return apiFetch<{ status: string; data: { product: Product } }>(
    "/admin/products/digital",
    { method: "POST", body: form },
  );
}

export async function updateProduct(id: string, body: FormData | Record<string, unknown>) {
  const isForm = body instanceof FormData;
  return apiFetch<{ status: string; data: { product: Product } }>(
    `/admin/products/${id}`,
    {
      method: "PATCH",
      body: isForm ? body : JSON.stringify(body),
      headers: isForm ? undefined : { "Content-Type": "application/json" },
    },
  );
}

export async function deactivateProduct(id: string) {
  return apiFetch<{ status: string; data: { product: Product } }>(
    `/admin/products/${id}`,
    { method: "DELETE" },
  );
}

/** Only allowed when the product is not referenced by any order line item. */
export async function deleteProductPermanent(id: string) {
  return apiFetch<{ status: string; message?: string }>(
    `/admin/products/${id}/permanent`,
    { method: "DELETE" },
  );
}

/* ——— Orders ——— */

export async function checkout(body: {
  items: { productId: string; quantity: number }[];
}) {
  return apiFetch<{
    status: string;
    data: {
      order: {
        id: string;
        totalNgn: number;
        currency: string;
        paystackReference: string;
        paymentStatus: string;
      };
      paystack: {
        authorizationUrl: string;
        accessCode?: string;
        reference: string;
      };
    };
  }>("/orders/checkout", { method: "POST", body: JSON.stringify(body) });
}

export async function getMyOrders() {
  return apiFetch<{ status: string; results: number; data: { orders: Order[] } }>(
    "/orders/me",
  );
}

export async function getOrder(orderId: string) {
  return apiFetch<{ status: string; data: { order: Order } }>(
    `/orders/${orderId}`,
  );
}

export async function verifyPayment(reference: string) {
  return apiFetch<{ status: string; data: unknown }>(
    `/orders/verify/${encodeURIComponent(reference)}`,
  );
}

export async function getDownloadUrl(orderId: string, productId: string) {
  return apiFetch<{
    status: string;
    data: {
      downloadUrl: string;
      expiresInSeconds: number;
      contentType: string;
      fileName?: string;
    };
  }>(`/orders/${orderId}/products/${productId}/download`);
}

/* ——— Admin orders ——— */

export async function adminListOrders(params?: { paymentStatus?: string }) {
  const q =
    params?.paymentStatus === "pending" || params?.paymentStatus === "paid"
      ? `?paymentStatus=${params.paymentStatus}`
      : "";
  return apiFetch<{
    status: string;
    results: number;
    data: { orders: Order[] };
  }>(`/admin/orders${q}`);
}

export async function adminUpdateFulfillmentNotes(
  orderId: string,
  fulfillmentNotes: string,
) {
  return apiFetch<{ status: string; data: { order: Order } }>(
    `/admin/orders/${orderId}/fulfillment-notes`,
    {
      method: "PATCH",
      body: JSON.stringify({ fulfillmentNotes }),
    },
  );
}

export async function adminUpdateDelivery(
  orderId: string,
  itemId: string,
  deliveryStatus: string,
) {
  return apiFetch<{ status: string; data: { order: Order } }>(
    `/admin/orders/${orderId}/items/${itemId}/delivery`,
    {
      method: "PATCH",
      body: JSON.stringify({ deliveryStatus }),
    },
  );
}
