import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Real client initialization if keys are present
const realSupabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Clean, realistic emulation layer if keys are missing
const simulatedSupabase = {
  auth: {
    getSession: async () => {
      const email = localStorage.getItem('pathy_user_email') || 'guest@pathfinder.com';
      const name = localStorage.getItem('pathy_user_name') || 'Guest';
      const isLoggedIn = localStorage.getItem('pathy_logged_in') === 'true' || sessionStorage.getItem('logged_in') === 'true';
      
      if (!isLoggedIn) {
        return { data: { session: null }, error: null };
      }
      
      return {
        data: {
          session: {
            user: {
              id: 'virtual_user_777',
              email: email,
              user_metadata: {
                full_name: name,
              }
            },
            access_token: 'virtual_token'
          }
        },
        error: null
      };
    },
    
    getUser: async () => {
      const email = localStorage.getItem('pathy_user_email') || 'guest@pathfinder.com';
      const name = localStorage.getItem('pathy_user_name') || 'Guest';
      const isLoggedIn = localStorage.getItem('pathy_logged_in') === 'true' || sessionStorage.getItem('logged_in') === 'true';
      
      if (!isLoggedIn) {
        return { data: { user: null }, error: null };
      }
      
      return {
        data: {
          user: {
            id: 'virtual_user_777',
            email: email,
            user_metadata: {
              full_name: name,
            }
          }
        },
        error: null
      };
    },
    
    signInWithOAuth: async ({ provider, options }) => {
      // Simulate real OAuth redirect & login sequence
      localStorage.setItem('pathy_logged_in', 'true');
      sessionStorage.setItem('logged_in', 'true');
      const mockName = localStorage.getItem('pathy_user_name') || 'Guest';
      localStorage.setItem('pathy_user_name', mockName);
      localStorage.setItem('pathy_user_email', 'guest@pathfinder.com');
      
      return { 
        data: { provider, url: options?.redirectTo || window.location.href }, 
        error: null 
      };
    },
    
    signInWithOtp: async ({ email, options }) => {
      // Simulate secure email magic-link auth
      localStorage.setItem('pathy_logged_in', 'true');
      sessionStorage.setItem('logged_in', 'true');
      localStorage.setItem('pathy_user_email', email);
      
      const cleanName = email.split('@')[0];
      const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      localStorage.setItem('pathy_user_name', capitalized);
      
      return { data: { email }, error: null };
    },
    
    signOut: async () => {
      localStorage.removeItem('pathy_logged_in');
      sessionStorage.removeItem('logged_in');
      return { error: null };
    },
    
    onAuthStateChange: (callback) => {
      const email = localStorage.getItem('pathy_user_email') || 'guest@pathfinder.com';
      const isLoggedIn = localStorage.getItem('pathy_logged_in') === 'true' || sessionStorage.getItem('logged_in') === 'true';
      
      if (isLoggedIn) {
        callback('SIGNED_IN', { 
          id: 'virtual_user_777', 
          email: email,
          user_metadata: { full_name: localStorage.getItem('pathy_user_name') || 'Guest' }
        });
      } else {
        callback('SIGNED_OUT', null);
      }
      
      return { 
        data: { 
          subscription: { 
            unsubscribe: () => {} 
          } 
        } 
      };
    }
  },
  
  from: (table) => {
    return {
      upsert: async (row) => {
        const userId = row.user_id || 'virtual_user_777';
        const key = `pathy_analyses_${userId}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Remove prior entry with same session_id if exists, then push updated row
        const filtered = existing.filter(item => item.session_id !== row.session_id);
        filtered.push(row);
        
        localStorage.setItem(key, JSON.stringify(filtered));
        return { error: null };
      },
      
      select: () => {
        return {
          eq: (col, val) => {
            return {
              order: (orderCol, { ascending } = { ascending: false }) => {
                return {
                  limit: (num) => {
                    return {
                      maybeSingle: async () => {
                        const key = `pathy_analyses_${val}`;
                        const list = JSON.parse(localStorage.getItem(key) || '[]');
                        if (list.length === 0) {
                          return { data: null, error: null };
                        }
                        // Sort by session_id/timestamp descending
                        const sorted = [...list].sort((a, b) => b.session_id.localeCompare(a.session_id));
                        return { data: sorted[0], error: null };
                      }
                    };
                  }
                };
              }
            };
          }
        };
      }
    };
  }
};

export const isSupabaseConfigured = Boolean(realSupabase);
export const supabase = realSupabase || (import.meta.env.MODE === 'production' || import.meta.env.PROD ? null : simulatedSupabase);

export const saveResultToSupabase = async (sessionData) => {
  if (!supabase) return false;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const currentLang = localStorage.getItem('pref_lang') || 'id';
    const finalSessionId = sessionData.session_id || 'local_session_' + Date.now();

    const { error } = await supabase
      .from('analyses')
      .upsert({
        user_id: user.id,
        session_id: finalSessionId,
        user_name: sessionData.user_name || localStorage.getItem('pathy_user_name') || 'Teman',
        answers: sessionData.answers,
        signal_chips: sessionData.signal_chips,
        readiness_score: sessionData.readiness_score,
        top_roles: sessionData.top_roles,
        skill_gaps: sessionData.skill_gaps,
        scout_message: sessionData.scout_message,
        project_recommendation: sessionData.project_recommendation || sessionData.project || {},
        jobs_analyzed: sessionData.jobs_analyzed || 20,
        live_jobs: sessionData.live_jobs || [],
        visual_roadmap: sessionData.visual_roadmap || [],
        jobs_source: sessionData.jobs_source || null,
        is_live: Boolean(sessionData.is_live),
        fetched_at: sessionData.fetched_at || new Date().toISOString(),
        job_data_snapshot: {
          jobs_source: sessionData.jobs_source || null,
          is_live: Boolean(sessionData.is_live),
          fetched_at: sessionData.fetched_at || null,
          fallback_used: sessionData.is_live === false
        },
        location: sessionData.location || 'Indonesia',
        lang: currentLang,
      }, { onConflict: 'user_id, session_id' });
      
    if (error) {
      console.warn("Could not save to Supabase. Table 'analyses' might not exist.", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase insert error", err);
    return false;
  }
};

export const getLatestResultFromSupabase = async () => {
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('session_id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn("Could not fetch latest analysis from Supabase.", error);
      return null;
    }
    
    if (data && data.lang) {
      localStorage.setItem('pref_lang', data.lang);
      // Let the caller handle the UI update smoothly so we don't collide language UI and data
    }

    if (data) Object.assign(data, { _restored_from_db: true });
    
    return data;
  } catch (err) {
    console.error("Supabase select error", err);
    return null;
  }
};
