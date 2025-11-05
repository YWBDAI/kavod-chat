import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL('https://kavod-ai.vercel.app'),
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#000', color: '#fff' }}>
        {children}
      </body>
    </html>
  );
}
