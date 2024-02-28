import Navbar from "@/components/NavBar";

export default function PredictionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="pl-20 py-5 grow">{children}</div>;
}
