"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useIGAuth } from "@/hooks/use-ig-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ExternalLink, Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isChallengeRequired } = useIGAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(username, password);
      router.push("/messages");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to login. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-140px)]">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Login to Instagram</CardTitle>
          <CardDescription>
            Enter your Instagram credentials to access your direct messages
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {isChallengeRequired && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Security Verification Required</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    Instagram requires additional verification for your account. Please follow these steps:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1 text-sm">
                    <li>Open the official Instagram app or website</li>
                    <li>Log in with your credentials</li>
                    <li>Complete any security verification prompted</li>
                    <li>Wait 5-10 minutes for Instagram to process the verification</li>
                    <li>Return here and try logging in again</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}
            
            {error && !isChallengeRequired && (
              <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Your Instagram username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={toggleShowPassword}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            
            {isChallengeRequired && (
              <div className="text-xs text-center text-gray-500 mt-2 space-y-2">
                <p>
                  After verifying in the official Instagram app, you may need to wait a few minutes before trying again.
                </p>
                <p className="flex items-center justify-center gap-1">
                  <a 
                    href="https://www.instagram.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center gap-1"
                  >
                    Open Instagram.com <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 