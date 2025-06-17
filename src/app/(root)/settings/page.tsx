"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

type InstagramConnection = {
  connected: boolean;
  username?: string;
  error?: string;
};

export default function SettingsPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [instagramConnection, setInstagramConnection] =
    useState<InstagramConnection>({
      connected: false,
    });
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkInstagramConnection = async () => {
      try {
        const response = await fetch("/api/auth/instagram/status");
        if (response.ok) {
          const data = await response.json();
          setInstagramConnection({
            connected: data.connected,
            username: data.username,
          });
        }
      } catch (error) {
        console.error("Error checking Instagram connection:", error);
      }
    };

    checkInstagramConnection();
  }, []);

  useEffect(() => {
    const error = searchParams.get("error");
    const success = searchParams.get("success");

    if (error) {
      toast.error(`Instagram connection failed: ${error}`);
    }

    if (success === "instagram_connected") {
      toast.success("Successfully connected to Instagram!");
      window.location.href = "/settings";
    }
  }, [searchParams]);

  const handleInstagramConnect = () => {
    setIsConnecting(true);
    try {
      window.location.href = `/api/auth/instagram`;
    } catch (error) {
      console.error("Error connecting to Instagram:", error);
      setIsConnecting(false);
    }
  };

  const handleInstagramDisconnect = async () => {
    try {
      const response = await fetch("/api/auth/instagram/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Disconnected from Instagram");
        setInstagramConnection({ connected: false });
      } else {
        toast.error("Failed to disconnect from Instagram");
      }
    } catch (error) {
      console.error("Error disconnecting from Instagram:", error);
      toast.error("Error disconnecting from Instagram");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Integrations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Instagram</CardTitle>
            <CardDescription>
              Connect your Instagram account to manage DMs directly from Pilot
            </CardDescription>
          </CardHeader>
          <CardContent>
            {instagramConnection.connected ? (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <p className="text-sm">
                  Connected as{" "}
                  <span className="font-semibold">
                    {instagramConnection.username}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                Access your Instagram messages and respond to them using
                Pilot&apos;s AI suggestions
              </p>
            )}
          </CardContent>
          <CardFooter>
            {instagramConnection.connected ? (
              <Button variant="destructive" onClick={handleInstagramDisconnect} className="w-full">
                Disconnect
              </Button>
            ) : (
              <Button onClick={handleInstagramConnect} disabled={isConnecting} className="w-full">
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}