import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tyorpbzvjnasyaqbggcp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5b3JwYnp2am5hc3lhcWJnZ2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODI4MjIsImV4cCI6MjA3NDY1ODgyMn0.WTG7UBwYkuSWPruJL_Uz0u5l6wYJolakzI780q13B_U";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    },
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries: number) => {
      return Math.min(tries * 1000, 10000);
    },
  },
  global: {
    headers: {
      'x-client-info': 'experiencias-selecta-checkout'
    }
  }
});
