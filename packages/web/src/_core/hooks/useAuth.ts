import { useState, useEffect } from "react";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

function mapUser(sbUser: SupabaseUser): User {
  return {
    id: sbUser.id,
    email: sbUser.email ?? "",
    name: sbUser.user_metadata?.name ?? sbUser.user_metadata?.full_name,
    role: sbUser.user_metadata?.role ?? "user",
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? mapUser(session.user) : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, logout };
}
