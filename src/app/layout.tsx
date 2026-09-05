import "./globals.css";
import Nav from "./component/Nav";
import Footer from "./component/Footer";
import Preloader from "./component/Preloader";
import PageTransition from "./component/PageTransition";
import RightClickDisabler from "./component/RightClickDisabler";

export const metadata = {
  title: "Nhujan Dongol - Portfolio",
  description: "Filmmaker and Editor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col bg-[#0B0B0B] text-white antialiased">
        <RightClickDisabler />
        <Nav />
        <Preloader>
          <PageTransition>{children}</PageTransition>
        </Preloader>
        <Footer />
      </body>
    </html>
  );
}
