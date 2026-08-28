import "./globals.css";
import Nav from "./component/Nav";
import Footer from "./component/Footer";
import Preloader from "./component/Preloader";
import PageTransition from "./component/PageTransition";

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
      <body className="flex min-h-dvh flex-col bg-[#0B0B0B] text-white antialiased">
        <Nav />
        <Preloader>
          <PageTransition>{children}</PageTransition>
        </Preloader>
        <Footer />
      </body>
    </html>
  );
}

