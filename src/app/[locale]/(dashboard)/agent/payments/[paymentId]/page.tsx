"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
    ArrowLeft,
    Building2,
    Car,
    Check,
    Home,
    Loader2,
    Plane,
    ShieldCheck,
    User,
    Wallet,
    X,
} from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/tracking/status-badge";
import { normalizeApiError } from "@/lib/api/client";
import { airlineLabel, formatDate, formatDateTime, formatMoney } from "@/lib/format";
import {
    useConfirmManualPaymentMutation,
    useManualPaymentDetailQuery,
    useRejectManualPaymentMutation,
} from "@/hooks/use-agent";

const OFFER_ICONS = {
    FLIGHT: Plane,
    HOTEL: Building2,
    CAR_RENTAL: Car,
    FURNISHED_RENTAL: Home,
} as const;

/**
 * Full reservation detail behind one manual payment (see AgentPaymentController#detail) - reached
 * from a row in AgentPendingPaymentsPage. Lets an agent see everything about the booking (not just
 * the compact amount/reference/country the pending queue shows) before confirming, and shows who
 * confirmed it once it's done - see Payment#confirmedByAgentEmail.
 */
export default function AgentPaymentDetailPage() {
    const t = useTranslations("Agent");
    const params = useParams<{ paymentId: string }>();
    const paymentId = params.paymentId;
    const locale = useLocale();

    const { data, isLoading, isError } = useManualPaymentDetailQuery(paymentId);
    const confirmMutation = useConfirmManualPaymentMutation();
    const rejectMutation = useRejectManualPaymentMutation();
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    function handleConfirm() {
        confirmMutation.mutate(paymentId, {
            onSuccess: () => toast.success(t("confirmSuccessSimple")),
            onError: (error) => toast.error(normalizeApiError(error).message),
        });
    }

    function handleReject() {
        rejectMutation.mutate(
            { paymentId, reason: rejectReason.trim() || t("defaultRejectReason") },
            {
                onSuccess: () => {
                    toast.success(t("rejectSuccess"));
                    setIsRejectDialogOpen(false);
                },
                onError: (error) => toast.error(normalizeApiError(error).message),
            }
        );
    }

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto space-y-4 pb-12">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="max-w-3xl mx-auto pb-12">
                <p className="text-sm text-destructive font-medium">
                    {t("loadErrorDetail")}
                </p>
            </div>
        );
    }

    const { booking } = data;
    const OfferIcon = OFFER_ICONS[booking.offerType] ?? Wallet;
    const isPending = data.status === "PENDING";

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="sm" className="rounded-xl gap-1.5 -ml-2">
                    <Link href="/agent">
                        <ArrowLeft className="size-4" />
                        {t("backAction")}
                    </Link>
                </Button>
            </div>

            {/* CARTE PAIEMENT */}
            <Card className="rounded-2xl border-border/60 shadow-xs overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/40 bg-slate-50/40 dark:bg-zinc-900/10 p-5">
                    <div className="flex items-center gap-2">
                        <Wallet className="size-5 text-primary" />
                        <h1 className="text-lg font-black tracking-tight">{t("detailTitle")}</h1>
                    </div>
                    <Badge
                        variant={data.status === "SUCCEEDED" ? "success" : data.status === "FAILED" ? "destructive" : "outline"}
                        className="rounded-full"
                    >
                        {data.status === "PENDING" ? t("statusPending") : data.status === "SUCCEEDED" ? t("statusConfirmed") : data.status}
                    </Badge>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{t("labelAmount")}</span>
                            <p className="font-bold text-foreground">{formatMoney(data.amount, locale)}</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{t("labelMethod")}</span>
                            <p className="font-semibold">{data.paymentMethod} · {data.countryCode}</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                                {t("labelReference")}
                            </span>
                            <p className="font-mono font-semibold">{data.customerReference ?? "—"}</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{t("labelNumber")}</span>
                            <p className="font-mono text-muted-foreground">{data.payerReferenceLast4 ?? "—"}</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{t("labelSubmittedAt")}</span>
                            <p className="font-semibold">{formatDateTime(data.createdAt, locale)}</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{t("labelClient")}</span>
                            <p className="font-semibold">{booking.contactEmail}</p>
                        </div>
                    </div>

                    {data.status === "SUCCEEDED" && data.confirmedByAgentEmail && (
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.04] px-4 py-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                            <ShieldCheck className="size-4 shrink-0" />
                            {t("confirmedBy", { email: data.confirmedByAgentEmail, date: formatDateTime(data.updatedAt, locale) })}
                        </div>
                    )}
                    {data.status === "FAILED" && data.failureReason && (
                        <div className="rounded-xl border border-destructive/25 bg-destructive/[0.03] px-4 py-3 text-xs font-semibold text-destructive">
                            {t("rejectedReason", { reason: data.failureReason })}
                        </div>
                    )}

                    {isPending && (
                        <>
                            <Separator />
                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    variant="outline"
                                    disabled={confirmMutation.isPending || rejectMutation.isPending}
                                    onClick={() => { setRejectReason(""); setIsRejectDialogOpen(true); }}
                                    className="rounded-xl gap-1.5 text-rose-600 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-700"
                                >
                                    <X className="size-4" />
                                    {t("rejectAction")}
                                </Button>
                                <Button
                                    disabled={confirmMutation.isPending || rejectMutation.isPending}
                                    onClick={handleConfirm}
                                    className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {confirmMutation.isPending ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Check className="size-4" />
                                    )}
                                    {t("confirmAction")}
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* CARTE RESERVATION */}
            <Card className="rounded-2xl border-border/60 shadow-xs overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/40 bg-slate-50/40 dark:bg-zinc-900/10 p-5">
                    <div className="flex items-center gap-2">
                        <OfferIcon className="size-5 text-primary" />
                        <h2 className="text-base font-black tracking-tight">{t("reservationDetailTitle")}</h2>
                    </div>
                    <StatusBadge status={booking.status} />
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{t("labelBookingReference")}</span>
                            <p className="font-mono font-semibold">{booking.id}</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{t("labelTotalPrice")}</span>
                            <p className="font-bold">{formatMoney(booking.price, locale)}</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{t("labelProvider")}</span>
                            <p className="font-semibold">{booking.providerType}</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{t("labelConfirmation")}</span>
                            <p className="font-mono font-semibold">{booking.providerConfirmationNumber ?? "—"}</p>
                        </div>
                    </div>

                    {booking.offerType === "FLIGHT" && (
                        <div className="space-y-3">
                            <Separator />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("itineraryTitle")}</h3>
                            {booking.itineraryLegs.length > 0 ? (
                                <div className="space-y-2">
                                    {booking.itineraryLegs.map((leg) => (
                                        <div key={leg.legIndex} className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm">
                                            <div>
                                                <p className="font-bold">{leg.origin} → {leg.destination}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {airlineLabel(leg.airline)} {leg.flightNumber}
                                                </p>
                                            </div>
                                            <div className="text-right text-xs text-muted-foreground">
                                                <p>{formatDateTime(leg.departureTime, locale)}</p>
                                                <p>→ {formatDateTime(leg.arrivalTime, locale)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm">
                                    <div>
                                        <p className="font-bold">{booking.origin} → {booking.destination}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {booking.airline ? airlineLabel(booking.airline) : ""} {booking.flightNumber}
                                        </p>
                                    </div>
                                    {booking.departureTime && (
                                        <div className="text-right text-xs text-muted-foreground">
                                            <p>{formatDateTime(booking.departureTime, locale)}</p>
                                            {booking.arrivalTime && <p>→ {formatDateTime(booking.arrivalTime, locale)}</p>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {booking.offerType === "HOTEL" && (
                        <div className="space-y-3">
                            <Separator />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("stayTitle")}</h3>
                            <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm">
                                <p className="font-bold">{booking.hotelName}</p>
                                <p className="text-xs text-muted-foreground">{booking.cityCode} · {booking.fareClass}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {booking.checkIn && formatDate(booking.checkIn, locale)} → {booking.checkOut && formatDate(booking.checkOut, locale)}
                                    {booking.roomQuantity ? t("roomsSuffix", { count: booking.roomQuantity }) : ""}
                                </p>
                            </div>
                        </div>
                    )}

                    {booking.offerType === "CAR_RENTAL" && (
                        <div className="space-y-3">
                            <Separator />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("vehicleTitle")}</h3>
                            <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm">
                                <p className="font-bold">{booking.vehicleBrand} {booking.vehicleModel}</p>
                                <p className="text-xs text-muted-foreground">
                                    {booking.pickupCity} → {booking.dropoffCity}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {booking.rentalStart && formatDate(booking.rentalStart, locale)} → {booking.rentalEnd && formatDate(booking.rentalEnd, locale)}
                                </p>
                            </div>
                        </div>
                    )}

                    {booking.offerType === "FURNISHED_RENTAL" && (
                        <div className="space-y-3">
                            <Separator />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("propertyTitle")}</h3>
                            <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm">
                                <p className="font-bold">{booking.propertyTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                    {t("propertyDetailsLine", {
                                        type: booking.propertyType ?? "",
                                        country: booking.country ?? "",
                                        bedrooms: booking.bedrooms ?? 0,
                                        maxGuests: booking.maxGuests ?? 0,
                                    })}
                                </p>
                            </div>
                        </div>
                    )}

                    {booking.travelers.length > 0 && (
                        <div className="space-y-3">
                            <Separator />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t("travelersTitle")}</h3>
                            <div className="space-y-2">
                                {booking.travelers.map((traveler, idx) => (
                                    <div key={idx} className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-muted/20 px-4 py-2.5 text-sm">
                                        <User className="size-4 text-muted-foreground shrink-0" />
                                        <span className="font-semibold">{traveler.fullName}</span>
                                        <span className="text-xs text-muted-foreground">({traveler.type})</span>
                                        {traveler.seatNumber && (
                                            <span className="text-xs font-mono text-muted-foreground ml-auto">
                                                {t("seatLabel", { seat: traveler.seatNumber })}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>{t("rejectDialogTitle")}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {t("rejectDialogDescription")}
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="rejectReason">{t("rejectReasonLabel")}</Label>
                            <Input
                                id="rejectReason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder={t("rejectReasonPlaceholder")}
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsRejectDialogOpen(false)} className="rounded-xl">
                            {t("cancelAction")}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={rejectMutation.isPending}
                            onClick={handleReject}
                            className="rounded-xl gap-2"
                        >
                            {rejectMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                            {t("rejectAction")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
