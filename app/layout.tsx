import './globals.css';

export const metadata = {
  title: "Major Pick'em 2026",
  description: "Masters pool app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
