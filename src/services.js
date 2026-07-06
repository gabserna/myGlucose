import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VUE_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.VUE_APP_SUPABASE_KEY;

const globalForSupabase = window;

export const supabase =
  globalForSupabase.__supabase ||
  createClient(SUPABASE_URL, SUPABASE_KEY);

globalForSupabase.__supabase = supabase;

// obtener todos los registros
export async function obtenerRegistros() {
  const { data, error } = await supabase
    .from("registros")
    .select("*")
    .order("timestamp", { ascending: false });
  if (error) throw error;
  return data;
}

// crear registro
export async function crearRegistro(registro) {
  const { data, error } = await supabase
    .from("registros")
    .insert([registro])
    .select();
  if (error) throw error;
  return data;
}

// eliminar uno
export async function eliminarRegistro(id) {
  const { error } = await supabase
    .from("registros")
    .delete()
    .eq("id", id)
    .select("*");
  if (error) throw error;
  return true;
}

// eliminar todos
export async function eliminarTodosLosRegistros() {
  const { error } = await supabase
    .from("registros")
    .delete()
    .not("id", "is", null);
  if (error) throw error;
  return true;
}
