import "./globals.css";
import Nav from "./component/Nav";

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
       
<Nav/>
        {children}  
      </body>
    </html>
  );
}