
import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("As variáveis do Supabase não foram configuradas.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
