import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/TeamUp_favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "white" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link rel="icon" href="/TeamUp_favicon.png" />
      </head>
      <body
        className={clsx(
          "min-h-screen  font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "white" }}>
          <div className="flex flex-col h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <footer className="w-full flex items-center justify-center py-5 mt-auto">
              <span className="text-gray-2">Copyright © chicTrip</span>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
