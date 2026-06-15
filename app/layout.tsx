import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Webora CRM",
  description: "Gestione prospect Webora Studio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="font-semibold text-gray-900 text-lg">Webora CRM</span>
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              Webora Studio
            </span>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
