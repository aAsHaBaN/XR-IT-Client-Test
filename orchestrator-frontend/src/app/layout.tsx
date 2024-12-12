import type { Metadata } from "next";
import "@xyflow/react/dist/style.css";
import "@/styles/globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "XR-IT",
  description: "XR-IT User Interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="flex">
          <div className="relative h-screen w-screen pt-14">
            <Header />
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
