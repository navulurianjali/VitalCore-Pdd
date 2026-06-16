import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VitalCore | AI-Powered Preventive Wellness & Healthcare Platform",
  description: "Predict health shifts, identify invisible decline, simulate your digital twin version, and prevent burnout with custom AI Coaching.",
  keywords: ["Preventive Health", "AI Fitness Coach", "Digital Twin Health", "Fatigue Detection", "Burnout Prevention", "Smart Nutrition", "Sleep Circadian Rythms"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="antialiased min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            <div className="flex-1 flex flex-col">{children}</div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
