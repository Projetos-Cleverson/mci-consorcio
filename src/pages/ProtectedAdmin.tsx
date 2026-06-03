import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import Leads from '@/pages/admin/Leads';

const LOCAL_ADMIN_KEY = "mci_consorcio_admin_session";

export default function ProtectedAdmin() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        setIsAllowed(Boolean(data.session));
        setIsLoading(false);
        return;
      }

      setIsAllowed(localStorage.getItem(LOCAL_ADMIN_KEY) === "true");
      setIsLoading(false);
    };

    verify();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">
        Verificando acesso...
      </div>
    );
  }

  if (!isAllowed) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Leads />;
}
