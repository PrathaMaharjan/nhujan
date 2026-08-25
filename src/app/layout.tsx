import "./globals.css";
import Nav from "./component/Nav";
import Footer from "./component/Footer";

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
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
