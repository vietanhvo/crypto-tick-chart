import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crypto Tick Chart",
  icons: {
    icon: ["/icon.jpg"],
  },
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
