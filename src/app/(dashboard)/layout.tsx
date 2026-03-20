import { AuthGuard } from "@/components/shared/AuthGuard";

/* ------------------------------------------------------------------
   Dashboard layout — wraps all (dashboard) routes.
   AuthGuard handles redirect to /login for unauthenticated users.
   Sidebar + Topbar will be added in Phase 4.
------------------------------------------------------------------ */

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-page-bg">
        {children}
      </div>
    </AuthGuard>
  );
}
