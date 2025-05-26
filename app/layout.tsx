'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { usePathname } from 'next/navigation';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutos
        gcTime: 1000 * 60 * 10, // 10 minutos
        retry: 3,
        refetchOnWindowFocus: false,
      },
    },
  }))

  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isLogin = pathname === '/' || pathname === '/login' || pathname.startsWith('/auth');
  const isClinica = pathname.startsWith('/clinica/');

  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50`}
      >
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen flex flex-col">
            {!isAdmin && !isLogin && !isClinica && <Navbar />}
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
