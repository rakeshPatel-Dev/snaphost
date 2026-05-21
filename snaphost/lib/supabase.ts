import { createClient } from "@supabase/supabase-js";
import { isKeyNull } from "@/validators/isKeyNull";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (isKeyNull(supabaseUrl) || isKeyNull(supabaseKey)) {
	throw new Error(
		"Missing required Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.",
	);
}

export const supabase = createClient(supabaseUrl, supabaseKey);


