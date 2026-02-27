import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "EveryRank — Compare AI Models, Pricing & Benchmarks",
    template: "%s | EveryRank",
  },
  description:
    "Compare AI models side-by-side. Pricing, benchmarks, context windows, and capabilities for GPT-5, Claude, Gemini, Llama, and more.",
  metadataBase: new URL("https://everyrank.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "EveryRank",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-W4YTHYY613"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-W4YTHYY613');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Nav />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Nav() {
  return (
    <nav className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-lg font-bold tracking-tight">
          Every<span className="text-accent-light">Rank</span>
        </a>
        <div className="flex items-center gap-6 text-sm text-muted">
          <a href="/models" className="hover:text-foreground transition-colors">
            Models
          </a>
          <a
            href="/compare"
            className="hover:text-foreground transition-colors"
          >
            Compare
          </a>
          <a
            href="/pricing"
            className="hover:text-foreground transition-colors"
          >
            Pricing
          </a>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-8 mt-20">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted">
        <p>
          &copy; {new Date().getFullYear()} EveryRank. Data updated regularly.
          Pricing may vary by region and usage tier.
        </p>
      </div>
    </footer>
  );
}
