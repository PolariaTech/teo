import { Literata, Source_Sans_3 } from "next/font/google";
import "../styles/tokens.css";
import "../styles/base.css";
import "../styles/shell.css";

const sans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Literata({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata = {
  title: "TEO",
  description: "Acompañamiento para el plan de cuidado",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#efe6d8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${sans.variable} ${serif.variable}`}>{children}</body>
    </html>
  );
}
