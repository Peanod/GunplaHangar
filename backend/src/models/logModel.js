import { supabase } from "../config/supabaseClient.js";

const SELECT = "*, kits ( id, name, status, progress_photos )";

export const LogModel = {
  async getAll() {
    const { data, error } = await supabase
      .from("build_logs")
      .select(SELECT)
      .order("work_date", { ascending: false })
      .order("id", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("build_logs")
      .select(SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create({ kit_id, title, technique, notes, work_date }) {
    const row = { kit_id, title, technique: technique || null, notes: notes || null };
    if (work_date) row.work_date = work_date;
    const { data, error } = await supabase
      .from("build_logs")
      .insert([row])
      .select(SELECT)
      .single();
    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase.from("build_logs").delete().eq("id", id);
    if (error) throw error;
    return { message: "Build log deleted successfully" };
  },
};
