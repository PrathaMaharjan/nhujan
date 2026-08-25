import "./globals.css";
import Nav from "./component/Nav";
import Preloader from "./component/Preloader";

export const metadata = {
  title: "Portfolio",
  description: "Cinematography & Directing Portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
        <html lang="en" suppressHydrationWarning>

      <body className="bg-[#0B0B0B] text-white antialiased">
        <Nav />
        <Preloader>{children}</Preloader>
      </body>
    </html>
  );
}
