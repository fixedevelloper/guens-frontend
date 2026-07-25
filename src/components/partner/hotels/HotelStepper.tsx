import { Check } from "lucide-react";
import { FORM_STEPS } from "@/types/hotel-form";

interface HotelStepperProps {
    currentStep: number;
}

export function HotelStepper({ currentStep }: HotelStepperProps) {
    return (
        <div className="relative">
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {FORM_STEPS.map((step) => {
                    const Icon = step.icon;
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;

                    return (
                        <div key={step.id} className="flex flex-col items-center text-center">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl font-semibold text-sm transition-all duration-200 ${
                                    isCompleted
                                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                        : isCurrent
                                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-md"
                                        : "bg-muted text-muted-foreground"
                                }`}
                            >
                                {isCompleted ? <Check className="size-5" /> : <Icon className="size-5" />}
                            </div>
                            <span className="mt-2 text-xs font-semibold text-foreground hidden sm:block">
                                {step.title}
                            </span>
                            <span className="text-[11px] text-muted-foreground hidden md:block">
                                {step.description}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}