"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { getAuthSession } from "@/lib/auth";

type Props = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = setTimeout(() => {
      const session = getAuthSession();

      if (!session) {
        router.replace("/signin");
        setIsChecking(false);
        return;
      }

      setIsAuthorized(true);
      setIsChecking(false);
    }, 0);

    return () => clearTimeout(checkAuth);
  }, [router]);

  if (isChecking || !isAuthorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080c14] px-6 text-slate-100">
        <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/90 px-5 py-4 text-sm text-slate-300">
          <ShieldCheck className="h-5 w-5 text-blue-400" />
          Checking access
        </div>
      </main>
    );
  }

  return children;
}
