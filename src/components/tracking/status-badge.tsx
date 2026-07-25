import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/lib/api/types";

const VARIANT: Record<BookingStatus, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  PENDING_PAYMENT: "secondary",
  DEPOSIT_PAID: "warning",
  PAID: "warning",
  CONFIRMING: "warning",
  CONFIRMED: "success",
  FAILED: "destructive",
  CANCELLED: "secondary",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const t = useTranslations("Tracking");
  return <Badge variant={VARIANT[status]}>{t(`status.${status}`)}</Badge>;
}
