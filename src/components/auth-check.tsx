"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/use-user";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        if (!loading && user) {
          const { data, error } = await supabase
            .from('users')
            .select('onboarding_complete')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("Error checking onboarding status:", error);
            return;
          }

          if (!data?.onboarding_complete) {
            router.replace('/onboard');
            return;
          }
        } else if (!loading && !user) {
          router.replace("/sign-in");
        }
      } catch (error) {
        console.error("Error in auth check:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboarding();
  }, [user, loading, router]);

  if (loading || isChecking) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}