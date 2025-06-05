"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/use-user";

export default function SignUp() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading("email");
      setError(null);

      if (!displayName || !email || !password) {
        throw new Error("Please fill in all fields");
      }

      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (result.error) {
        if (result.error.message.includes("already registered")) {
          setError("This email is already registered. Please sign in instead.");
          return;
        }
        throw result.error;
      }

      if (result.data.user) {
        const { error: insertError } = await supabase.from("users").insert({
          id: result.data.user.id,
          email: email,
          name: displayName,
        });

        if (insertError) {
          console.error("Error creating user record:", insertError);
        }
      }

      if (result.data.user && !result.data.session) {
        setError("Please check your email to confirm your account.");
        return;
      }

      router.push("/");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again.";
      setError(errorMessage);
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(null);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl text-card-foreground">
            Create an account
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Enter your details below to create your account
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="displayName"
                className="text-sm font-medium text-card-foreground"
              >
                Display Name
              </label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading !== null}
                className="bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-card-foreground"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading !== null}
                className="bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-card-foreground"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading !== null}
                className="bg-input text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading !== null}
            >
              {isLoading === "email" ? (
                <Image
                  src="/spinner.svg"
                  alt="Loading"
                  width={16}
                  height={16}
                  className="mr-2 animate-spin"
                />
              ) : null}
              Create account
            </Button>
          </form>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <div className="text-center">
            <Link
              href="/sign-in"
              className="underline underline-offset-2 text-sm text-muted-foreground hover:text-card-foreground"
            >
              Already flying with Pilot? Sign in.
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}