import type { Metadata, Viewport } from "next";
import { Caveat, Inter } from "next/font/google";
import { ProgressProvider } from "@/context/ProgressContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { PwaRegister } from "@/components/PwaRegister";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-sketch",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AWS Path — Learn Cloud the Right Way",
    template: "%s · AWS Path",
  },
  description:
    "Clean AWS learning platform with lessons, diagrams, quizzes, local progress, and offline PWA support.",
  applicationName: "AWS Path",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AWS Path",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#14110e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "light dark",
};

const themeInitScript = `
(function(){
  try {
    var k = 'aws-path-theme';
    var t = localStorage.getItem(k);
    if (t !== 'light' && t !== 'dark') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.dataset.theme = t;
    document.documentElement.style.colorScheme = t;
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.variable} ${caveat.variable} ${inter.className}`}>
        <ThemeProvider>
          <ProgressProvider>
            <PwaRegister />
            {children}
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
