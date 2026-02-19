import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useStore } from "@/context/StoreContext";
import { Badge } from "@/components/ui/badge";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const { isAdmin } = useStore();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b px-4 bg-card no-print">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground font-body">Oak Woods & Interiors Management</span>
            </div>
            <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
              {isAdmin ? "Admin" : "Viewer"}
            </Badge>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto grain-texture">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
