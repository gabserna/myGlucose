import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = process.env.VUE_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.VUE_APP_SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function obtenerRegistros() {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .order("timestamp", { ascending: false });
  if (error) {
    throw error;
  }
  return data;
}

export async function crearRegistro(registro) {
  const { data, error } = await supabase
    .from("registros")
    .insert([registro])
    .select();
  if (error) {
    throw error;
  }
  return data;
}

export async function eliminarTodosLosRegistros() {
  const { error } = await supabase
    .from("registros")
    .delete()
    .not("id", "is", null);

  if (error) {
    throw error;
  }
  return true;
}
export { supabase };
