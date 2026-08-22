import "./globals.css";

export const metadata = {
  title: "StadiumChef Ops",
  description: "Culinary operations platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
