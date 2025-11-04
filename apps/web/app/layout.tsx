import type { ReactNode } from "react";

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
