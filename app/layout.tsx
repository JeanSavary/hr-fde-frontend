import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { Toaster } from "@/components/ui/sonner";

const satoshi = localFont({
  src: [
    { path: "../public/fonts/Satoshi/Satoshi-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/Satoshi/Satoshi-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../public/fonts/Satoshi/Satoshi-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Satoshi/Satoshi-Italic.ttf", weight: "400", style: "italic" },
    { path: "../public/fonts/Satoshi/Satoshi-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/Satoshi/Satoshi-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../public/fonts/Satoshi/Satoshi-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/Satoshi/Satoshi-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../public/fonts/Satoshi/Satoshi-Black.ttf", weight: "900", style: "normal" },
    { path: "../public/fonts/Satoshi/Satoshi-BlackItalic.ttf", weight: "900", style: "italic" },
  ],
  variable: "--font-satoshi",
});

const clashGrotesk = localFont({
  src: [
    { path: "../public/fonts/ClashGrotesk/ClashGrotesk-Extralight.ttf", weight: "200" },
    { path: "../public/fonts/ClashGrotesk/ClashGrotesk-Light.ttf", weight: "300" },
    { path: "../public/fonts/ClashGrotesk/ClashGrotesk-Regular.ttf", weight: "400" },
    { path: "../public/fonts/ClashGrotesk/ClashGrotesk-Medium.ttf", weight: "500" },
    { path: "../public/fonts/ClashGrotesk/ClashGrotesk-Semibold.ttf", weight: "600" },
    { path: "../public/fonts/ClashGrotesk/ClashGrotesk-Bold.ttf", weight: "700" },
  ],
  variable: "--font-clash-grotesk",
});

export const metadata: Metadata = {
  title: "Acme Logistics | Dashboard",
  description: "Operations dashboard for the Carrier Sales AI Agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${satoshi.variable} ${clashGrotesk.variable}`}>
      <body className="bg-gray-50 antialiased">
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Topbar />
              <main className="animate-fade-in flex-1 overflow-auto p-6">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
