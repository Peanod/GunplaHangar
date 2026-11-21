import { supabase } from "../config/supabaseClient.js";

// Urutan tampil grade di dropdown: dari tingkat pemula sampai yang paling detail
const ORDER = ["EG", "HG", "RG", "MG", "PG", "SD"];
const rank = (name) => {
  const i = ORDER.indexOf(name);
  return i === -1 ? ORDER.length : i;
};

export const GradeModel = {
  async getAll() {
    const { data, error } = await supabase.from("grades").select("*").order("id");
    if (error) throw error;
    return [...data].sort((a, b) => rank(a.name) - rank(b.name) || a.id - b.id);
  },
};