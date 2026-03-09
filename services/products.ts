import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Product,
  ProductInsert,
  WeeklyProductScorecard,
  WeeklyProductScorecardInsert,
} from "@/types";

const PRODUCTS_TABLE = "products";
const SCORECARDS_TABLE = "weekly_product_scorecards";

// ============================================================================
// PRODUCTS
// ============================================================================

export async function getProducts(
  supabase: SupabaseClient,
  filters?: { workspace_id?: string; owner_id?: string; status?: Product["status"] }
) {
  let query = supabase.from(PRODUCTS_TABLE).select("*").order("name");
  if (filters?.workspace_id) query = query.eq("workspace_id", filters.workspace_id);
  if (filters?.owner_id) query = query.eq("owner_id", filters.owner_id);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load products");
  return (data ?? []) as Product[];
}

export async function getProductById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message ?? "Failed to load product");
  return data as Product;
}

export async function createProduct(
  supabase: SupabaseClient,
  payload: ProductInsert
) {
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create product");
  return data as Product;
}

export async function updateProduct(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<ProductInsert>
) {
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to update product");
  return data as Product;
}

export async function deleteProduct(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from(PRODUCTS_TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message ?? "Failed to delete product");
}

// ============================================================================
// WEEKLY PRODUCT SCORECARDS
// ============================================================================

export async function getProductScorecards(
  supabase: SupabaseClient,
  filters?: { product_id?: string; week_start?: string; from_week?: string }
) {
  let query = supabase
    .from(SCORECARDS_TABLE)
    .select("*")
    .order("week_start", { ascending: false });

  if (filters?.product_id) query = query.eq("product_id", filters.product_id);
  if (filters?.week_start) query = query.eq("week_start", filters.week_start);
  if (filters?.from_week) query = query.gte("week_start", filters.from_week);

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load product scorecards");
  return (data ?? []) as WeeklyProductScorecard[];
}

export async function upsertProductScorecard(
  supabase: SupabaseClient,
  payload: WeeklyProductScorecardInsert
) {
  const existing = await supabase
    .from(SCORECARDS_TABLE)
    .select("id")
    .eq("product_id", payload.product_id)
    .eq("week_start", payload.week_start)
    .maybeSingle();

  if (existing.data) {
    const { data, error } = await supabase
      .from(SCORECARDS_TABLE)
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", existing.data.id)
      .select()
      .single();
    if (error) throw new Error(error.message ?? "Failed to update scorecard");
    return data as WeeklyProductScorecard;
  } else {
    const { data, error } = await supabase
      .from(SCORECARDS_TABLE)
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(error.message ?? "Failed to create scorecard");
    return data as WeeklyProductScorecard;
  }
}

export function calculateProductScore(scorecard: WeeklyProductScorecard): number {
  let score = 0;
  
  // Adoption (30 points)
  if (scorecard.active_orgs > 0) score += 10;
  if (scorecard.active_users > 10) score += 10;
  if (scorecard.activation_rate_pct >= 50) score += 10;
  
  // Retention (20 points)
  if (scorecard.retention_pct >= 30) score += 10;
  if (scorecard.retention_pct >= 50) score += 10;
  
  // Revenue/Pilots (20 points)
  if (scorecard.pilot_count > 0) score += 10;
  if (scorecard.revenue_booked > 0) score += 10;
  
  // Quality (20 points)
  if (scorecard.sev1_incidents === 0) score += 10;
  if (scorecard.uptime_pct >= 99) score += 10;
  
  // Shipping (10 points)
  if (scorecard.release_shipped) score += 10;
  
  return score;
}
