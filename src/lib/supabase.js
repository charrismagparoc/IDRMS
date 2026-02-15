import { createClient } from '@supabase/supabase-js';

// ── Real Supabase credentials for Barangay Kauswagan IDRMS ───
const SUPABASE_URL     = 'https://rduibvtqzrpfvwzfbrun.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdWlidnRxenJwZnZ3emZicnVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzk5NzAsImV4cCI6MjA4NjY1NTk3MH0.XMFVE5NzepKFV9RC8es2xWJIaK55gqRg5x8mO_dJwes';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Auth ────────────────────────────────────────────────────
export const signIn  = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOut = () => supabase.auth.signOut();

// ─── Generic DB helpers ──────────────────────────────────────
export const db = {
  getAll:  (table, opts = {}) => {
    let q = supabase.from(table).select(opts.select || '*');
    if (opts.order) q = q.order(opts.order, { ascending: opts.asc ?? false });
    return q;
  },
  insert:  (table, data)     => supabase.from(table).insert(data).select().single(),
  update:  (table, id, data) => supabase.from(table).update(data).eq('id', id).select().single(),
  // NOTE: remove() is intentionally NOT exposed here.
  // Deletes only hide records in UI — they are preserved in the database.
  getById: (table, id)       => supabase.from(table).select('*').eq('id', id).single(),
};
