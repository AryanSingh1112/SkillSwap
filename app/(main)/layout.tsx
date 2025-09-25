import Nav from "@/components/ui/Nav";
import Sidebar from "../_components/SideBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <div className="flex">
        <Sidebar />
        <section className="flex flex-1 flex-col min-h-screen px-6 pb-6 pt-28 sm:px-14 bg-black">
          {children}
        </section>
      </div>
    </>
  );
}
