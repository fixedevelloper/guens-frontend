"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  CheckCircle2,
  Clock,
  Ban,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Loader2,
  RefreshCw,
  UserCheck,
  AlertCircle,
  Percent,
  Wallet,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import {
  useAdminResellersQuery,
  useRejectResellerMutation,
  useSuspendResellerMutation,
} from "@/hooks/use-admin";
import { Reseller, ResellerResponse, ResellerStatus } from "@/lib/api/types";
import { ApproveResellerModal } from "@/components/dashboard/ApproveResellerModal";


// Configuration visuelle des statuts
const STATUS_CONFIG: Record<
  ResellerStatus,
  { label: string; tone: string; icon: React.ComponentType<{ className?: string }> }
> = {
  PENDING_REVIEW: {
    label: "En attente",
    tone: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Clock,
  },
  APPROVED: {
    label: "Actif",
    tone: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckCircle2,
  },
  SUSPENDED: {
    label: "Suspendu",
    tone: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    icon: Ban,
  },
  REJECTED: {
    label: "Rejeté",
    tone: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    icon: XCircle,
  },
};

export default function ResellersListPage() {
  const router = useRouter();

  // ÉTATS DE FILTRAGE & PAGINATION
  const [selectedStatus, setSelectedStatus] = useState<ResellerStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 15;

  // ÉTATS MODALES & ACTIONS
  const [approveModalState, setApproveModalState] = useState<{
    isOpen: boolean;
    resellerId: string|number;
    resellerName: string;
  }>({ isOpen: false, resellerId: "", resellerName: "" });

  const [confirmDialogState, setConfirmDialogState] = useState<{
    isOpen: boolean;
    type: "REJECT" | "SUSPEND" | null;
    reseller: Reseller | null;
  }>({ isOpen: false, type: null, reseller: null });

  // MUTATIONS & QUERIES
  const apiStatus = selectedStatus === "ALL" ? undefined : selectedStatus;
  const { data, isLoading, isError, refetch, isFetching } = useAdminResellersQuery(
    apiStatus,
    page,
    pageSize
  );

  const rejectMutation = useRejectResellerMutation();
  const suspendMutation = useSuspendResellerMutation();

  // FILTRAGE CÔTÉ CLIENT SUR LA RECHERCHE (Recherche dynamique sur la page courante)
  const filteredResellers = useMemo(() => {
    if (!data?.content) return [];
    if (!searchQuery.trim()) return data.content;

    const query = searchQuery.toLowerCase().trim();
    return data.content.filter(
      (item) =>
        item.companyName.toLowerCase().includes(query) ||
        item.contactName.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.promoCode.toLowerCase().includes(query)
    );
  }, [data?.content, searchQuery]);

  // GESTION DU REJET / SUSPENSION
  const handleConfirmAction = async () => {
    if (!confirmDialogState.reseller || !confirmDialogState.type) return;

    try {
      if (confirmDialogState.type === "REJECT") {
        await rejectMutation.mutateAsync(String(confirmDialogState?.reseller?.id));
      } else if (confirmDialogState.type === "SUSPEND") {
        await suspendMutation.mutateAsync(String(confirmDialogState?.reseller.id));
      }
      setConfirmDialogState({ isOpen: false, type: null, reseller: null });
    } catch (err) {
      console.error("Erreur lors de l'action sur le revendeur:", err);
    }
  };

  const isActionPending = rejectMutation.isPending || suspendMutation.isPending;

  return (
    <div className="space-y-6">
      {/* HEADER DE LA PAGE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Building2 className="size-6 text-primary" />
            <span>Gestion des Revendeurs</span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Superviser les partenaires, ajuster les taux de commission et valider les demandes.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-xl font-bold text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          <span>Actualiser</span>
        </Button>
      </div>

      {/* TABS DE FILTRE PAR STATUT & BARRE DE RECHERCHE */}
      <Card className="p-3 rounded-2xl border-border/60 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* ONGLETS STATUTS */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "ALL", label: "Tous" },
              { id: "PENDING_REVIEW", label: "En attente" },
              { id: "APPROVED", label: "Actifs" },
              { id: "SUSPENDED", label: "Suspendus" },
              { id: "REJECTED", label: "Rejetés" },
            ].map((tab) => {
              const isActive = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedStatus(tab.id as any);
                    setPage(0); // Réinitialiser à la première page
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* RECHERCHE */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher par nom, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-border/60 bg-background"
            />
          </div>
        </div>
      </Card>

      {/* TABLEAU DES REVENDEURS */}
      <Card className="rounded-2xl border-border/60 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-muted/40 text-[11px] font-black uppercase text-muted-foreground tracking-wider">
                <th className="py-3.5 px-4">Entreprise / Contact</th>
                <th className="py-3.5 px-4">Code Promo</th>
                <th className="py-3.5 px-4">Commission</th>
                <th className="py-3.5 px-4">Ventes / Portefeuille</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 font-medium">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-36 rounded-md" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-20 rounded-md" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-12 rounded-md" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-28 rounded-md" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-20 rounded-md" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-8 rounded-md ml-auto" /></td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <AlertCircle className="size-8 text-destructive mx-auto mb-2" />
                    <p className="font-bold">Erreur de chargement des données.</p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => refetch()}
                      className="text-xs text-primary mt-1"
                    >
                      Réessayer
                    </Button>
                  </td>
                </tr>
              ) : filteredResellers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <UserCheck className="size-8 mx-auto mb-2 opacity-40" />
                    <p className="font-extrabold text-foreground">Aucun revendeur trouvé</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Essayez de modifier votre recherche ou vos filtres.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredResellers.map((reseller) => {
                  const statusInfo = STATUS_CONFIG[reseller.status] ?? STATUS_CONFIG.PENDING_REVIEW;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={reseller.id} className="hover:bg-muted/30 transition-colors">
                      {/* ENTREPRISE & CONTACT */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <Link
                            href={`/admin/resellers/${reseller.id}`}
                            className="font-extrabold text-foreground hover:text-primary transition-colors text-sm"
                          >
                            {reseller.companyName}
                          </Link>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {reseller.contactName} • {reseller.email}
                          </span>
                        </div>
                      </td>

                      {/* CODE PROMO */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-muted border border-border/60 text-foreground">
                          {reseller.promoCode}
                        </span>
                      </td>

                      {/* COMMISSION */}
                      <td className="py-3.5 px-4 font-extrabold">
                        <div className="flex items-center gap-1 text-foreground">
                          <Percent className="size-3 text-amber-500" />
                          <span>{((reseller.commissionRate ?? 0) * 100).toFixed(1)}%</span>
                        </div>
                      </td>

                      {/* VENTES & WALLET */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-foreground">
                            {(reseller.totalSales ?? 0).toLocaleString()} XAF
                          </span>
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <Wallet className="size-3" />
                            Solde : {(reseller.walletBalance ?? 0).toLocaleString()} XAF
                          </span>
                        </div>
                      </td>

                      {/* STATUT */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-lg px-2 py-0.5 text-[10px] font-black gap-1 border",
                            statusInfo.tone
                          )}
                        >
                          <StatusIcon className="size-3" />
                          <span>{statusInfo.label}</span>
                        </Badge>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3.5 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-xl hover:bg-muted"
                            >
                              <MoreVertical className="size-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground">
                              Actions Revendeur
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/resellers/${reseller.id}`)}
                              className="text-xs font-bold gap-2 cursor-pointer"
                            >
                              <Eye className="size-3.5 text-primary" />
                              <span>Voir les détails</span>
                            </DropdownMenuItem>

                            {reseller.status === "PENDING_REVIEW" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setApproveModalState({
                                      isOpen: true,
                                      resellerId: reseller.id,
                                      resellerName: reseller.companyName,
                                    })
                                  }
                                  className="text-xs font-bold gap-2 text-emerald-600 cursor-pointer focus:text-emerald-600"
                                >
                                  <CheckCircle2 className="size-3.5" />
                                  <span>Approuver</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    setConfirmDialogState({
                                      isOpen: true,
                                      type: "REJECT",
                                      reseller,
                                    })
                                  }
                                  className="text-xs font-bold gap-2 text-destructive cursor-pointer focus:text-destructive"
                                >
                                  <XCircle className="size-3.5" />
                                  <span>Rejeter</span>
                                </DropdownMenuItem>
                              </>
                            )}

                            {reseller.status === "APPROVED" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  setConfirmDialogState({
                                    isOpen: true,
                                    type: "SUSPEND",
                                    reseller,
                                  })
                                }
                                className="text-xs font-bold gap-2 text-rose-600 cursor-pointer focus:text-rose-600"
                              >
                                <Ban className="size-3.5" />
                                <span>Suspendre</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-border/40 flex items-center justify-between bg-muted/20">
            <p className="text-xs text-muted-foreground font-medium">
              Page <span className="font-bold text-foreground">{data.number + 1}</span> sur{" "}
              <span className="font-bold text-foreground">{data.totalPages}</span> ({data.totalElements} revendeurs)
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.number === 0 || isFetching}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                className="rounded-xl font-bold text-xs gap-1 h-8"
              >
                <ChevronLeft className="size-3.5" />
                <span>Précédent</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={data.number + 1 >= data.totalPages || isFetching}
                onClick={() => setPage((prev) => prev + 1)}
                className="rounded-xl font-bold text-xs gap-1 h-8"
              >
                <span>Suivant</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* MODALE D'APPROBATION */}
      {approveModalState.isOpen && (
        <ApproveResellerModal
          isOpen={approveModalState.isOpen}
          onClose={() =>
            setApproveModalState({ isOpen: false, resellerId: "", resellerName: "" })
          }
          resellerId={String(approveModalState.resellerId)}
          resellerName={approveModalState.resellerName}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* DIALOG DE CONFIRMATION (REJET OU SUSPENSION) */}
      <Dialog
        open={confirmDialogState.isOpen}
        onOpenChange={(open) =>
          !open && !isActionPending && setConfirmDialogState({ isOpen: false, type: null, reseller: null })
        }
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              {confirmDialogState.type === "REJECT" ? (
                <>
                  <XCircle className="size-5 text-destructive" />
                  <span>Rejeter la demande</span>
                </>
              ) : (
                <>
                  <Ban className="size-5 text-rose-600" />
                  <span>Suspendre le revendeur</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium pt-1">
              {confirmDialogState.reseller?.companyName}
            </DialogDescription>
          </DialogHeader>

          <p className="text-xs text-muted-foreground leading-relaxed py-2">
            {confirmDialogState.type === "REJECT"
              ? "Êtes-vous sûr de vouloir rejeter cette demande ? Le partenaire ne pourra pas utiliser le code promo généré."
              : "La suspension désactivera immédiatement le code promo et empêchera la comptabilisation de nouvelles ventes."}
          </p>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isActionPending}
              onClick={() =>
                setConfirmDialogState({ isOpen: false, type: null, reseller: null })
              }
              className="rounded-xl font-bold text-xs"
            >
              Annuler
            </Button>
            <Button
              size="sm"
              disabled={isActionPending}
              onClick={handleConfirmAction}
              className={cn(
                "rounded-xl font-bold text-xs text-white gap-1.5",
                confirmDialogState.type === "REJECT"
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-rose-600 hover:bg-rose-700"
              )}
            >
              {isActionPending && <Loader2 className="size-3.5 animate-spin" />}
              <span>
                {confirmDialogState.type === "REJECT"
                  ? "Confirmer le rejet"
                  : "Confirmer la suspension"}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}