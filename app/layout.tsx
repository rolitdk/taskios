import type { Metadata } from "next";

import { AuthProvider } from "@/modules/user/providers/auth-provider";
import { StoreProvider } from "@/store/store-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Taskios",
  description:
    "Простые доски задач Taskios — планируйте проекты с нежной палитрой.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="bg-background text-foreground flex min-h-screen flex-col font-sans">
        <StoreProvider>
          <AuthProvider>{children}</AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
