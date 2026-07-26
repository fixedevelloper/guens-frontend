import { useTranslations } from "next-intl";
import { Compass, ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("NotFoundPage");

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-primary/10 text-primary mb-2">
          <Compass className="size-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
  {t("error404")}
</span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {t("title") ?? "Page introuvable"}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            {t("description") ?? "La page que vous cherchez n'existe pas ou a été déplacée."}
          </p>
        </div>

        <div className="pt-2">
          <Button asChild size="lg" className="rounded-xl font-bold gap-2 px-6">
            <Link href="/hotels">
              <ArrowLeft className="size-4" />
              {t("backToHotels") ?? "Voir les hébergements"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}