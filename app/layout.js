import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import Providers from "./providers";
import ProtectedRoute from "./components/protectedRoute";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Journivo",
  description: "Publish your journal, article, books from the comfort of your home.",
  email: "wisdomchukwuemeka97@gmail.com",
  contact: "+234906907221"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`flex flex-col min-h-screen bg-white text-gray-900 ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {/* Header */}
          <Header />
          {/* Main fills space between header and footer */}
          <ProtectedRoute>
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
          </ProtectedRoute>

          {/* Footeyr stays at bottom */}
          <Footer />
        </Providers>
      </body>
    </html>
  );y
}
