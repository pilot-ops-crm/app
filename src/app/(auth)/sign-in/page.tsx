"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import useUser from "@/hooks/use-user";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading("email");
      setError(null);

      if (!email || !password) {
        throw new Error("Please fill in all fields");
      }

      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (result.error) {
        if (result.error.message.includes("Invalid login credentials")) {
          const signUpResult = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: email.split("@")[0],
              },
            },
          });

          if (signUpResult.error) {
            throw signUpResult.error;
          }

          if (signUpResult.data.user) {
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: signUpResult.data.user.id,
                email: email,
                name: email.split("@")[0],
              });

            if (insertError) {
              console.error("Error creating user record:", insertError);
            }
            
            if (!signUpResult.data.session) {
              setError("Account created! Please check your email to confirm your account.");
              setIsLoading(null);
              return;
            }
            
            return;
          }
        }
        throw result.error;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again.";
      setError(errorMessage);
      console.error("Email auth error:", error);
    } finally {
      setIsLoading(null);
      router.push("/");
    }
  };

  if (loading || user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl text-card-foreground">
            Welcome back
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Enter your email below to sign in to your account
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSignIn} className="space-y-4">
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
              Sign in
            </Button>
          </form>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <div className="text-center">
            <Link
              href="/sign-up"
              className="underline underline-offset-2 text-sm text-muted-foreground hover:text-card-foreground"
            >
              Join Pilot - simulate your DMs with AI, free forever.
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}