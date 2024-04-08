import type { Metadata } from "next";

import { Inter } from "next/font/google";
import 'simplebar-react/dist/simplebar.min.css'
import "./globals.css";
import {cn, constructMetadata } from '@/lib/utils'
import Navbar from "@/components/Navbar";
import Provider from "@/components/Providers";
import 'react-loading-skeleton/dist/skeleton.css'
import { Toaster } from "@/components/ui/toaster";
const inter = Inter({ subsets: ["latin"] });


export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en" className="light">
      <Provider>
      <body className={
        cn(
          'min-h-screen font-sans antialiased grainy',
          inter.className)
      }>
        <Toaster/>
        <Navbar/>
        {children}
        </body>
        </Provider>
    </html>
   
  );
}
