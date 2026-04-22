import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "番茄钟",
  description: "专注时间管理工具",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
