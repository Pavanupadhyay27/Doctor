import "./globals.css";
import { CRMProvider } from "@/context/CRMState";

export const metadata = {
  title: "Aura Dermatology & Aesthetics | Premium Care & CRM",
  description: "Board-certified clinical dermatology and advanced laser aesthetics in a safe, premium medical space.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-[#1E2A28]">
        <CRMProvider>
          {children}
        </CRMProvider>
      </body>
    </html>
  );
}

