"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Wallet,
  Percent,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  Ban,
  ExternalLink,
  Edit3,
  Loader2,
  Plane,
  ArrowUpRight,
  Clock,
  FileText,
  AlertCircle,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Importer vos hooks API réels
import {
  useAdminResellerDetailQuery,
  useAdminResellerBookingsQuery,
  useAdminResellerWithdrawalsQuery,
  useApproveResellerMutation,
  useUpdateCommissionMutation,
  useSuspendResellerMutation,
} from "@/hooks/use-admin"; // Ajustez selon votre structure

export type ResellerStatus = "PENDING_REVIEW" | "APPROVED" | "SUSPENDED" | "REJECTED";

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

export default function ResellerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resellerId = params.id as string;

  // Modales
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);

  // Requêtes React Query
  const { data: reseller, isLoading, isError, refetch } = useAdminResellerDetailQuery(resellerId);
  const { data: bookingsData, isLoading: isLoadingBookings } = useAdminResellerBookingsQuery(resellerId);
  const { data: withdrawalsData, isLoading: isLoadingWithdrawals } = useAdminResellerWithdrawalsQuery(resellerId);

  const approveMutation = useApproveResellerMutation();
  const suspendMutation = useSuspendResellerMutation();

  if (isLoading) {
    return <ResellerDetailSkeleton />;
  }

  if (isError || !reseller) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertCircle className="size-10 text-destructive mx-auto" />
        <h2 className="text-lg font-extrabold">Revendeur introuvable</h2>
        <p className="text-xs text-muted-foreground">
          Impossible de charger les détails de ce partenaire.
        </p>
        <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-xl font-bold">
          Retour à la liste
        </Button>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[reseller.status] ?? STATUS_CONFIG.PENDING_REVIEW;
  const StatusIcon = statusInfo.icon;
  const bookings = bookingsData?.content ?? [];
  const withdrawals = withdrawalsData?.content ?? [];

  const handleSuspend = async () => {
    try {
      await suspendMutation.mutateAsync(resellerId);
      setIsSuspendModalOpen(false);
    } catch (err) {
      console.error("Erreur suspension:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* BOUTON RETOUR & ACTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-xl shrink-0"
            onClick={() => router.push("/admin/resellers")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                {reseller.companyName}
              </h1>
              <Badge
                variant="outline"
                className={cn("rounded-lg px-2 py-0.5 text-[10px] font-black gap-1", statusInfo.tone)}
              >
                <StatusIcon className="size-3" />
                <span>{statusInfo.label}</span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Inscrit le {new Date(reseller.createdAt).toLocaleDateString("fr-FR")} • Code Promo :{" "}
              <span className="font-mono font-bold text-foreground">{reseller.promoCode}</span>
            </p>
          </div>
        </div>

        {/* ACTIONS STATUT */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCommissionModalOpen(true)}
            className="rounded-xl font-bold text-xs gap-1.5"
          >
            <Edit3 className="size-3.5" />
            <span>Modifier Taux ({((reseller.commissionRate ?? 0) * 100).toFixed(1)}%)</span>
          </Button>

          {reseller.status !== "APPROVED" && (
            <Button
              size="sm"
              onClick={() => setIsApproveModalOpen(true)}
              className="rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Approuver</span>
            </Button>
          )}

          {reseller.status === "APPROVED" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsSuspendModalOpen(true)}
              className="rounded-xl font-bold text-xs gap-1.5"
            >
              <Ban className="size-3.5" />
              <span>Suspendre</span>
            </Button>
          )}
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/60 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              Chiffre d'Affaires Généré
            </CardTitle>
            <TrendingUp className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">
              {(reseller.totalSales ?? 0).toLocaleString()} XAF
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">
              Via le code {reseller.promoCode}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              Solde Portefeuille
            </CardTitle>
            <Wallet className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600">
              {(reseller.walletBalance ?? 0).toLocaleString()} XAF
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">Disponible pour retrait</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              Taux de Commission
            </CardTitle>
            <Percent className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">
              {((reseller.commissionRate ?? 0) * 100).toFixed(1)}%
            </div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">Appliqué sur chaque réservation</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
              Réservations Effectuées
            </CardTitle>
            <Plane className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{reseller.totalBookingsCount ?? bookings.length}</div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">Billets vendus</p>
          </CardContent>
        </Card>
      </div>

      {/* CONTENU ONGLETS */}
      <Tabs defaultValue="overview" className="w-full space-y-4">
        <TabsList className="bg-card border border-border/60 p-1 rounded-2xl h-11 inline-flex w-full sm:w-auto">
          <TabsTrigger value="overview" className="rounded-xl text-xs font-bold px-4">
            Aperçu & Profil
          </TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-xl text-xs font-bold px-4">
            Réservations ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="rounded-xl text-xs font-bold px-4">
            Historique Wallet & Retraits
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: APERÇU & PROFIL */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations de contact */}
            <Card className="rounded-2xl border-border/60 shadow-2xs lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-black flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  <span>Informations de l'Entreprise & Contact</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
                  <span className="text-[10px] uppercase font-black text-muted-foreground">Nom Société</span>
                  <p className="font-extrabold text-foreground text-sm">{reseller.companyName}</p>
                </div>

                <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
                  <span className="text-[10px] uppercase font-black text-muted-foreground">Responsable</span>
                  <p className="font-extrabold text-foreground text-sm">{reseller.contactName}</p>
                </div>

                <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
                  <span className="text-[10px] uppercase font-black text-muted-foreground">Email professionnel</span>
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <Mail className="size-3.5 text-muted-foreground" />
                    <span>{reseller.email}</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
                  <span className="text-[10px] uppercase font-black text-muted-foreground">Téléphone / WhatsApp</span>
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <Phone className="size-3.5 text-muted-foreground" />
                    <span>{reseller.phone}</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
                  <span className="text-[10px] uppercase font-black text-muted-foreground">Localisation</span>
                  <p className="font-bold text-foreground flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    <span>{reseller.city ? `${reseller.city}, ${reseller.country || ''}` : 'Non spécifié'}</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-border/40 bg-muted/20 space-y-1">
                  <span className="text-[10px] uppercase font-black text-muted-foreground">Registre du commerce (RCCM)</span>
                  <p className="font-mono font-bold text-foreground">{reseller.registrationNumber || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Document & Paramètres Partenaire */}
            <Card className="rounded-2xl border-border/60 shadow-2xs space-y-4 p-5">
              <div>
                <h3 className="text-sm font-black flex items-center gap-2 mb-3">
                  <FileText className="size-4 text-primary" />
                  <span>Pièces Justificatives</span>
                </h3>
                {reseller.logoUrl ? (
                  <a
                    href={reseller.logoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl border border-border/50 bg-muted/30 flex items-center justify-between hover:bg-muted/50 transition-colors group"
                  >
                    <span className="text-xs font-bold text-foreground">Document d'immatriculation / Logo</span>
                    <ExternalLink className="size-4 text-primary group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Aucun document joint.</p>
                )}
              </div>

              <div className="border-t border-border/40 pt-4">
                <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider mb-2">
                  Paramètres de Commission
                </h3>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Commission Actuelle</span>
                    <span className="text-lg font-black">{((reseller.commissionRate ?? 0) * 100).toFixed(1)}%</span>
                  </div>
                  <p className="text-[11px] opacity-80 mt-1">
                    Génère {((reseller.commissionRate ?? 0) * 10000).toLocaleString()} XAF par tranche de 100 000 XAF vendus.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: RÉSERVATIONS */}
        <TabsContent value="bookings">
          <Card className="rounded-2xl border-border/60 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-border/40">
              <h3 className="text-sm font-black">Réservations attribuées</h3>
              <p className="text-xs text-muted-foreground">
                Billets achetés par les clients avec le code promo <span className="font-mono font-bold text-foreground">{reseller.promoCode}</span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/40 text-[11px] font-black uppercase text-muted-foreground">
                    <th className="py-3 px-4">Réf. PNR</th>
                    <th className="py-3 px-4">Passager</th>
                    <th className="py-3 px-4">Montant Billet</th>
                    <th className="py-3 px-4">Commission Générée</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 font-medium">
                  {isLoadingBookings ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        <Loader2 className="size-5 animate-spin mx-auto mb-2" />
                        Chargement des réservations...
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        Aucune réservation enregistrée pour ce code promo.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking: any) => (
                      <tr key={booking.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono font-extrabold text-primary">
                          {booking.pnrNumber || booking.id.substring(0, 8)}
                        </td>
                        <td className="py-3 px-4 font-bold">{booking.passengerName || "N/A"}</td>
                        <td className="py-3 px-4">{booking.totalAmount?.toLocaleString()} XAF</td>
                        <td className="py-3 px-4 font-black text-emerald-600">
                          +{(booking.commissionAmount ?? 0).toLocaleString()} XAF
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(booking.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 3: WALLET & RETRAITS */}
        <TabsContent value="withdrawals">
          <Card className="rounded-2xl border-border/60 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-border/40">
              <h3 className="text-sm font-black">Historique des Demandes de Retrait</h3>
              <p className="text-xs text-muted-foreground">
                Suivi des paiements de commission versés au revendeur
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/40 text-[11px] font-black uppercase text-muted-foreground">
                    <th className="py-3 px-4">ID Demande</th>
                    <th className="py-3 px-4">Montant</th>
                    <th className="py-3 px-4">Méthode</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 font-medium">
                  {isLoadingWithdrawals ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        <Loader2 className="size-5 animate-spin mx-auto mb-2" />
                        Chargement des retraits...
                      </td>
                    </tr>
                  ) : withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        Aucun retrait effectué pour le moment.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((item: any) => (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono font-bold">{item.id.substring(0, 8)}</td>
                        <td className="py-3 px-4 font-black">{item.amount?.toLocaleString()} XAF</td>
                        <td className="py-3 px-4">{item.payoutMethod || "Mobile Money"}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="rounded-md font-bold text-[10px]">
                            {item.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODALE 1: EDITEUR DE COMMISSION */}
      {isCommissionModalOpen && (
        <EditCommissionModalDialog
          resellerId={reseller.id}
          currentRate={reseller.commissionRate ?? 0.1}
          onClose={() => setIsCommissionModalOpen(false)}
          onSuccess={() => {
            setIsCommissionModalOpen(false);
            refetch();
          }}
        />
      )}

      {/* MODALE 2: CONFIRMATION APPROBATION */}
      {isApproveModalOpen && (
        <EditCommissionModalDialog
          resellerId={reseller.id}
          currentRate={reseller.commissionRate ?? 0.1}
          isApproval={true}
          onClose={() => setIsApproveModalOpen(false)}
          onSuccess={() => {
            setIsApproveModalOpen(false);
            refetch();
          }}
        />
      )}

      {/* MODALE 3: CONFIRMATION SUSPENSION */}
      <Dialog open={isSuspendModalOpen} onOpenChange={setIsSuspendModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <Ban className="size-5 text-rose-600" />
              <span>Suspendre le revendeur</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium pt-1">
              {reseller.companyName}
            </DialogDescription>
          </DialogHeader>

          <p className="text-xs text-muted-foreground leading-relaxed py-2">
            La suspension désactivera immédiatement le code promo <strong className="text-foreground">{reseller.promoCode}</strong> et empêchera la création de nouvelles commissions.
          </p>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={suspendMutation.isPending}
              className="rounded-xl font-bold text-xs"
              onClick={() => setIsSuspendModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              disabled={suspendMutation.isPending}
              className="rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 gap-1.5"
              onClick={handleSuspend}
            >
              {suspendMutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
              <span>Confirmer la suspension</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// SUB-COMPOSANT : Modale d'édition de la commission / approbation
function EditCommissionModalDialog({
  resellerId,
  currentRate,
  isApproval = false,
  onClose,
  onSuccess,
}: {
  resellerId: string;
  currentRate: number;
  isApproval?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const approveMutation = useApproveResellerMutation();
  const updateCommissionMutation = useUpdateCommissionMutation();

  const [percentage, setPercentage] = useState<string>((currentRate * 100).toString());
  const [error, setError] = useState<string | null>(null);

  const isPending = approveMutation.isPending || updateCommissionMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericVal = parseFloat(percentage);
    if (isNaN(numericVal) || numericVal < 0 || numericVal > 100) {
      setError("Entrez un pourcentage valide entre 0% et 100%.");
      return;
    }

    const commissionRate = numericVal / 100;

    try {
      if (isApproval) {
        await approveMutation.mutateAsync({ resellerId, payload: { commissionRate } });
      } else {
        await updateCommissionMutation.mutateAsync({ resellerId, payload: { commissionRate } });
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Une erreur est survenue lors de l'enregistrement.");
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-black flex items-center gap-2">
            <Percent className="size-5 text-primary" />
            <span>{isApproval ? "Approuver & Fixer la commission" : "Modifier le taux de commission"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-medium pt-1">
            Définissez le pourcentage que le revendeur percevra sur chaque réservation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Nouveau taux de commission (%)
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="10.00"
                className="pr-8 h-9 text-xs font-mono font-bold rounded-xl border-border/60"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-xs font-bold text-muted-foreground">%</span>
              </div>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground font-medium flex items-center justify-between">
              <span>Valeur transmise au serveur :</span>
              <span className="font-mono font-extrabold text-foreground">
                {(parseFloat(percentage) / 100 || 0).toFixed(4)}
              </span>
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              className="rounded-xl font-bold text-xs"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary/90 gap-1.5"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isApproval ? "Approuver" : "Enregistrer"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// SKELETON LOADER POUR CHARGEMENT INITIAL
function ResellerDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}