"use client";

import React, { useState } from "react";
import {
    UploadCloud,
    Image as ImageIcon,
    Trash2,
    Link as LinkIcon,
    Sparkles,
    Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CoverImagePickerProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    description?: string;
}

export function CoverImagePicker({
                                     value = "",
                                     onChange,
                                     label = "Photo de couverture",
                                     description = "Choisissez la photo principale qui servira d'accroche pour ce logement.",
                                 }: CoverImagePickerProps) {
    const [urlInput, setUrlInput] = useState("");
    const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");

    // Gestion de la sélection de fichier local (conversion en data URL pour la prévisualisation)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    onChange(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Validation du lien URL
    const handleApplyUrl = (e: React.FormEvent) => {
        e.preventDefault();
        if (urlInput.trim()) {
            onChange(urlInput.trim());
            setUrlInput("");
        }
    };

    // Suppression de l'image
    const handleRemove = () => {
        onChange("");
    };

    return (
        <div className="space-y-3">
            <div>
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ImageIcon className="size-4 text-primary" />
                    {label}
                </Label>
                {description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                )}
            </div>

            {/* Zone d'affichage si une image est sélectionnée */}
            {value ? (
                <div className="relative group rounded-2xl overflow-hidden border border-border bg-muted/30 aspect-video max-h-72 w-full flex items-center justify-center">
                    <img
                        src={value}
                        alt="Aperçu de la couverture"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Overlay d'action au survol */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemove}
                            className="rounded-xl gap-2 shadow-lg"
                        >
                            <Trash2 className="size-4" />
                            Supprimer l'image
                        </Button>
                    </div>

                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <Check className="size-3.5 text-emerald-400" />
                        Photo sélectionnée
                    </div>
                </div>
            ) : (
                /* Zone de sélection (Fichier ou URL) */
                <Tabs
                    value={activeTab}
                    onValueChange={(val) => setActiveTab(val as "upload" | "url")}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2 rounded-xl h-9 p-1 bg-muted/60">
                        <TabsTrigger value="upload" className="rounded-lg text-xs gap-2">
                            <UploadCloud className="size-3.5" />
                            Téléverser un fichier
                        </TabsTrigger>
                        <TabsTrigger value="url" className="rounded-lg text-xs gap-2">
                            <LinkIcon className="size-3.5" />
                            Lien web (URL)
                        </TabsTrigger>
                    </TabsList>

                    {/* Onglet 1 : Upload de fichier local */}
                    <TabsContent value="upload" className="mt-3">
                        <label className="relative flex flex-col items-center justify-center w-full h-44 rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/60 bg-card hover:bg-muted/30 transition-all cursor-pointer group p-4 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
                                <UploadCloud className="size-6" />
                            </div>
                            <span className="text-xs font-semibold text-foreground">
                                Cliquez pour parcourir ou glissez votre image ici
                            </span>
                            <span className="text-[11px] text-muted-foreground mt-1">
                                PNG, JPG ou WEBP (recommandé 16:9, max 5MB)
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="sr-only"
                            />
                        </label>
                    </TabsContent>

                    {/* Onglet 2 : Saisie d'une URL directe */}
                    <TabsContent value="url" className="mt-3">
                        <form onSubmit={handleApplyUrl} className="flex gap-2">
                            <Input
                                type="url"
                                placeholder="https://images.unsplash.com/photo-..."
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                className="rounded-xl h-10 text-xs flex-1"
                            />
                            <Button
                                type="submit"
                                disabled={!urlInput.trim()}
                                className="rounded-xl h-10 px-4 text-xs gap-1.5 shrink-0"
                            >
                                <Sparkles className="size-3.5" />
                                Appliquer
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}