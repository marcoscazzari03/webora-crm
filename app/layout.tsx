import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Webora CRM",
  description: "Gestione prospect Webora Studio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-100 px-6 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-gray-900 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs tracking-tight">W</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm tracking-tight">Webora CRM</span>
            </div>
            <span className="text-xs text-gray-400 tracking-widest uppercase font-medium">
              Webora Studio
            </span>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
