import { Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/NavBar";

const manrope = Manrope({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={manrope.className + " h-screen flex flex-col"}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
