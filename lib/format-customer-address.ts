import type { User } from "@/lib/types";

/** Single-line shipping / profile address for tables and summaries. */
export function formatCustomerAddress(u: Pick<User, "address" | "city" | "state" | "zip">): string {
  const parts = [u.address, u.city, u.state, u.zip].filter(
    (p) => typeof p === "string" && p.trim().length > 0,
  );
  return parts.length > 0 ? parts.join(", ") : "—";
}
