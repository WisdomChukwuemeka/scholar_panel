import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "./components/header";
import { Footer } from "./components/footer";
import Providers from "./providers";
// import ProtectedRoute from "./components/protectedRoute";
// import ProtectedRoute from "./components/protectedRoute"; // Keep commented if not using client-side fallback

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Journivo",
    template: "%s | Journivo",
  },
  description: "Publish your journal, article, books from the comfort of your home.",
  url: "https://www.journivo.com", // replace with your domain
  siteName: "Journivo",
  keywords: [
    "Journivo",
    "Journal Publishing",
    "Academic Publishing",
    "Research Articles",
    "Open Access",
    "Peer-Reviewed Journals",
    "Scholarly Articles",
    "Conference Proceedings",
    "Research Dissemination",
    "Editorial Services",
    "Academic Journals",
    "Research Publication",
    "Scientific Journals",
    "Publishing Platform",
    "Research Community",
  ],
  icons: {
    icon: "/logo/logo.png",
  },
  openGraph: {
    title: "Journivo",
    description: "Publish your journal, article, books from the comfort of your home.",
    images: [
      {
        url: "/logo/logo.png",
        width: 800, // Replace with actual dimensions
        height: 600,
        alt: "Journivo Logo",
      },
    ],
    siteName: "Journivo", // Enhances Facebook/OG previews
    type: "website", // Optional but good
  },
  twitter: {
    card: "summary_large_image",
    title: "Journivo",
    description: "Publish your journal, article, books from the comfort of your home.",
    images: [
      {
        url: "/logo/logo.png",
        width: 800,
        height: 600,
        alt: "Journivo Logo",
      },
    ],
  },
  // Optional: Add robots if needed
  robots: "index, follow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`container flex flex-col min-h-screen bg-white text-gray-900 ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {/* Header */}
          <Header />
          {/* Main fills space between header and footer */}
          {/* <ProtectedRoute> */}
          <main className="flex-grow container mx-auto ">
            {children}
          </main>
          {/* </ProtectedRoute> */}
          {/* Footer stays at bottom */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}