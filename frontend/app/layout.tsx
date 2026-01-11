import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShiftBridge - Healthcare Staffing Platform",
  description: "Multi-state healthcare staffing and scheduling management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}