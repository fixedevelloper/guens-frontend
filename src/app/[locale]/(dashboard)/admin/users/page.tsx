// app/[locale]/admin/users/page.tsx (ou le chemin correspondant à ta structure)
"use client";

import { useLocale, useTranslations } from "next-intl";
import { Users, ShieldAlert } from "lucide-react";

import { useAdminUsersQuery } from "@/hooks/use-admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function initials(fullName: string | undefined) {
  if (!fullName) return "?";
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function AdminUsersPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const usersQuery = useAdminUsersQuery();

  const userCount = usersQuery.data?.length ?? 0;

  return (
    <div className="space-y-8">
      {/* SECTION TITRE ET STATISTIQUE */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
            {t("allUsersTitle") ?? "Gestion des utilisateurs"}
          </h1>
          <p className="text-xs text-muted-foreground/80 font-medium mt-0.5">
            Supervisez les accès et rôles de la plateforme.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-xl border border-border/40 bg-card px-3.5 py-2 shadow-2xs sm:self-auto">
          <Users className="size-4 text-primary" />
          <span className="text-xs font-extrabold text-foreground">
            {t("resultsCount", { count: userCount }) ?? `${userCount} utilisateurs`}
          </span>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50 bg-card shadow-2xs overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-slate-50/20 dark:bg-zinc-900/10 px-6 py-4.5">
          <CardTitle className="text-sm font-black uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
            Liste globale
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {usersQuery.isLoading ? (
            <div className="p-6 space-y-4">
              {/* Squelette de tableau réaliste */}
              <div className="flex items-center justify-between pb-2 border-b border-border/30">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-xl" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-5 w-14 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : usersQuery.isError ? (
            <div className="p-6">
              <Alert variant="destructive" className="rounded-xl border-destructive/20 bg-destructive/5">
                <ShieldAlert className="size-4 text-destructive" />
                <AlertDescription className="text-xs font-semibold ml-2">
                  {t("loadError") ?? "Erreur de chargement des utilisateurs."}
                </AlertDescription>
              </Alert>
            </div>
          ) : !usersQuery.data || usersQuery.data.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="size-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-xs font-bold text-muted-foreground">
                {t("noUsers") ?? "Aucun utilisateur trouvé."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 bg-slate-50/40 dark:bg-zinc-900/20">
                    <th className="py-3.5 pl-6 pr-4 font-bold">{t("userName") ?? "Nom"}</th>
                    <th className="py-3.5 px-4 font-bold">{t("userEmail") ?? "Email"}</th>
                    <th className="py-3.5 px-4 font-bold">{t("userRole") ?? "Rôle"}</th>
                    <th className="py-3.5 pl-4 pr-6 font-bold text-right">{t("userCreatedAt") ?? "Inscrit le"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/35">
                  {usersQuery.data.map((u) => {
                    const isAdminUser = u.role === "ADMIN";
                    return (
                      <tr 
                        key={u.id} 
                        className="group hover:bg-slate-50/40 dark:hover:bg-zinc-900/30 transition-all duration-150"
                      >
                        {/* NOM */}
                        <td className="py-3 pl-6 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[10px] font-black text-primary border border-primary/10 group-hover:scale-105 transition-transform">
                              {initials(u.fullName)}
                            </div>
                            <span className="font-extrabold text-foreground tracking-tight truncate max-w-[160px] capitalize">
                              {u.fullName?.toLowerCase()}
                            </span>
                          </div>
                        </td>

                        {/* EMAIL */}
                        <td className="py-3 px-4 font-medium text-muted-foreground/90 truncate max-w-[200px]">
                          {u.email}
                        </td>

                        {/* RÔLE */}
                        <td className="py-3 px-4">
                          <Badge 
                            variant={isAdminUser ? "default" : "outline"}
                            className={cn(
                              "rounded-lg text-[9px] font-black tracking-wide border-none px-2 py-0.5",
                              isAdminUser 
                                ? "bg-primary/10 text-primary hover:bg-primary/15" 
                                : "bg-muted text-muted-foreground hover:bg-muted"
                            )}
                          >
                            {u.role}
                          </Badge>
                        </td>

                        {/* DATE INCRIPTION */}
                        <td className="py-3 pl-4 pr-6 text-right text-muted-foreground/75 font-semibold text-[11px]">
                          {formatDate(u.createdAt, locale)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}