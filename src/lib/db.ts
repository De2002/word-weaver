import { supabase } from "@/integrations/supabase/client";

/**
 * Temporary escape hatch for Supabase table typing.
 * When the generated database types catch up, we can remove this and use `supabase` directly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;
