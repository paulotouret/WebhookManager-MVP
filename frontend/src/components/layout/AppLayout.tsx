import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, LogOut, Webhook, Activity, Moon, Sun, UserCog } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border/50">
          <SidebarHeader className="px-6 py-6 border-b border-border/50">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                <Webhook className="h-5 w-5" />
              </div>
              <span className="text-xl font-display font-bold tracking-tight text-foreground">
                HookFlow
              </span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="px-3 py-6">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location === "/dashboard" || location === "/"}
                      className="rounded-lg h-11 text-[15px]"
                    >
                      <Link href="/dashboard" className="flex items-center gap-3">
                        <LayoutDashboard className="h-5 w-5 opacity-70" />
                        <span className="font-medium">Projetos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location === "/profile"}
                      className="rounded-lg h-11 text-[15px]"
                    >
                      <Link href="/profile" className="flex items-center gap-3">
                        <UserCog className="h-5 w-5 opacity-70" />
                        <span className="font-medium">Perfil</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {}
                  <div className="mt-8 mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Sistema
                  </div>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={logout}
                      className="rounded-lg h-11 text-[15px] text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="h-5 w-5 opacity-70" />
                      <span className="font-medium">Sair</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <div className="mt-auto p-6 border-t border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 border border-primary/10">
                <span className="text-sm font-bold text-primary">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground truncate max-w-[140px]">
                  {user?.name}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 overflow-hidden relative">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/40 bg-sidebar/80 px-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4 text-primary" />
              <span className="font-medium">Sistema operacional</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-lg hover:bg-sidebar-accent"
              title={theme === "dark" ? "Alternar para modo claro" : "Alternar para modo escuro"}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </header>
          <main className="flex-1 overflow-y-auto p-6 lg:p-10">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
