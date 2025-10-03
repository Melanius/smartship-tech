import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "스마트십 기술 비교",
  description: "스마트십 기술을 벤치마킹하고 최신 트렌드를 정리하는 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 container mx-auto max-w-screen-2xl px-4 py-6">
            {children}
          </main>
          <footer className="border-t py-6 md:py-0">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
              <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                스마트십 기술 비교 플랫폼 © 2025
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
