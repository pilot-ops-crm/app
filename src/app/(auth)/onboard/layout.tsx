import { ReactNode } from "react";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden md:flex flex-col w-2/5 bg-primary text-white p-8 justify-between">
        <h1 className="text-4xl font-bold">
          A few clicks away from creating your workspace.
        </h1>

        <p className="text-primary-foreground text-lg">
          Start your journey in minutes.
          <br />
          Save time and money.
        </p>
      </div>

      <div className="flex-1 w-3/5">{children}</div>
    </div>
  );
}