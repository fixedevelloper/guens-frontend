"use client";

import { useEffect, useState } from "react";
import {
    Image as ImageIcon,
    Upload,
    Check,
    Search,
    Loader2,
    X,
    Link as LinkIcon,
    CloudUpload,
    AlertCircle
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserImage } from "@/types/hotel-form";
import { listMyImages, uploadImage, UserImageResponse } from "@/lib/api/images";

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    const units = ["Ko", "Mo", "Go"];
    let value = bytes / 1024;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }
    return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function toUserImage(image: UserImageResponse): UserImage {
    return {
        id: image.id,
        url: image.url,
        name: image.name,
        size: formatFileSize(image.sizeBytes),
        createdAt: image.createdAt,
    };
}

interface ImageSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectImage: (image: UserImage) => void;
    currentSelectedId?: string;
    title?: string;
}

export function ImageSelectModal({
                                     isOpen,
                                     onClose,
                                     onSelectImage,
                                     currentSelectedId,
                                     title = "Sélectionner une image",
                                 }: ImageSelectModalProps) {
    const [images, setImages] = useState<UserImage[]>([]);
    const [selectedImage, setSelectedImage] = useState<UserImage | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"gallery" | "upload">("gallery");

    // État pour le téléversement (Upload)
    const [uploadUrl, setUploadUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Récupère la galerie de l'utilisateur connecté depuis le backend à chaque ouverture du modal
    useEffect(() => {
        if (!isOpen) return;

        let cancelled = false;
        setLoading(true);
        setLoadError(null);

        listMyImages()
            .then((fetched) => {
                if (cancelled) return;
                const mapped = fetched.map(toUserImage);
                setImages(mapped);
                setSelectedImage(mapped.find((img) => img.id === currentSelectedId) ?? null);
            })
            .catch((error) => {
                console.error("Erreur lors du chargement des images:", error);
                if (!cancelled) setLoadError("Impossible de charger vos images.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isOpen, currentSelectedId]);

    // Filtrage des images par nom
    const filteredImages = images.filter((img) =>
        img.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Gestion de la sélection
    const handleConfirm = () => {
        if (selectedImage) {
            onSelectImage(selectedImage);
            onClose();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFilePreview(URL.createObjectURL(file));
        }
    };

    const handleAddImage = async () => {
        if (!selectedFile && !uploadUrl) return;

        setUploading(true);

        try {
            let newImg: UserImage;

            if (selectedFile) {
                const uploaded = await uploadImage(selectedFile);
                newImg = toUserImage(uploaded);
            } else {
                // Pas d'équivalent backend pour une URL externe : utilisée telle quelle, sans persistance.
                newImg = {
                    id: `external-${Date.now()}`,
                    url: uploadUrl,
                    name: uploadUrl.split("/").pop() || "image-web.jpg",
                };
            }

            setImages((prev) => [newImg, ...prev]);
            setSelectedImage(newImg);

            // Reset des champs d'upload et retour à la galerie
            setSelectedFile(null);
            setFilePreview(null);
            setUploadUrl("");
            setActiveTab("gallery");
        } catch (error) {
            console.error("Erreur lors de l'envoi de l'image:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl">
                <DialogHeader className="p-5 pb-3 border-b">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <ImageIcon className="size-5 text-primary" />
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "gallery" | "upload")} className="flex-1 flex flex-col min-h-0">
                    <div className="px-5 pt-3 border-b bg-muted/30">
                        <TabsList className="grid w-full grid-cols-2 max-w-xs">
                            <TabsTrigger value="gallery" className="gap-2">
                                <ImageIcon className="size-4" />
                                Mes images ({images.length})
                            </TabsTrigger>
                            <TabsTrigger value="upload" className="gap-2">
                                <Upload className="size-4" />
                                Téléverser
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* ONGLET 1 : GALERIE */}
                    <TabsContent value="gallery" className="flex-1 flex flex-col p-5 space-y-4 min-h-0 m-0 data-[state=inactive]:hidden">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher une image..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                                    <Loader2 className="size-5 animate-spin" />
                                    Chargement de vos images...
                                </div>
                            ) : loadError ? (
                                <div className="flex flex-col items-center justify-center gap-2 py-12 text-destructive text-center">
                                    <AlertCircle className="size-5" />
                                    {loadError}
                                </div>
                            ) : filteredImages.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    Aucune image trouvée.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {filteredImages.map((img) => {
                                        const isSelected = selectedImage?.id === img.id;
                                        return (
                                            <div
                                                key={img.id}
                                                onClick={() => setSelectedImage(img)}
                                                className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                                                    isSelected
                                                        ? "border-primary ring-2 ring-primary/20 shadow-md"
                                                        : "border-transparent hover:border-muted-foreground/30"
                                                }`}
                                            >
                                                <img
                                                    src={img.url}
                                                    alt={img.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                                                    <span className="text-[11px] text-white truncate font-medium">
                                                        {img.name}
                                                    </span>
                                                </div>

                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-full shadow-md">
                                                        <Check className="size-4" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* ONGLET 2 : TÉLÉVERSER UNE IMAGE */}
                    <TabsContent value="upload" className="flex-1 p-5 space-y-5 overflow-y-auto m-0 data-[state=inactive]:hidden">
                        {/* Zone de Drag & Drop */}
                        <div className="space-y-2">
                            <Label>Depuis votre appareil</Label>
                            <label className="relative border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 bg-muted/10 hover:bg-muted/20 transition-all rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="sr-only"
                                />
                                <div className="p-3 bg-primary/10 text-primary rounded-full">
                                    <CloudUpload className="size-6" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">Cliquez ou glissez une image ici</p>
                                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP jusqu'à 10MB</p>
                                </div>
                            </label>
                        </div>

                        {/* Aperçu de l'image importée en fichier */}
                        {filePreview && (
                            <div className="relative h-40 w-full rounded-xl overflow-hidden border">
                                <img src={filePreview} alt="Aperçu" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => {
                                        setFilePreview(null);
                                        setSelectedFile(null);
                                    }}
                                    className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1 rounded-full"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        )}

                        <div className="relative flex items-center py-1">
                            <div className="flex-grow border-t border-border"></div>
                            <span className="flex-shrink mx-4 text-xs text-muted-foreground font-medium uppercase">
                                Ou via URL externe
                            </span>
                            <div className="flex-grow border-t border-border"></div>
                        </div>

                        {/* Champ URL */}
                        <div className="space-y-2">
                            <Label htmlFor="url" className="flex items-center gap-1.5">
                                <LinkIcon className="size-3.5 text-muted-foreground" />
                                Lien direct vers l'image
                            </Label>
                            <Input
                                id="url"
                                placeholder="https://domaine.com/image.jpg"
                                value={uploadUrl}
                                onChange={(e) => setUploadUrl(e.target.value)}
                            />
                        </div>

                        <Button
                            type="button"
                            onClick={handleAddImage}
                            disabled={(!filePreview && !uploadUrl) || uploading}
                            className="w-full gap-2 rounded-xl"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Téléversement en cours...
                                </>
                            ) : (
                                <>
                                    <Upload className="size-4" />
                                    Ajouter à ma galerie et sélectionner
                                </>
                            )}
                        </Button>
                    </TabsContent>
                </Tabs>

                {/* PIED DE PAGE DU MODAL */}
                <DialogFooter className="p-4 border-t bg-muted/10 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground hidden sm:block">
                        {selectedImage ? (
                            <span>
                                Sélectionné : <strong className="text-foreground">{selectedImage.name}</strong>
                            </span>
                        ) : (
                            "Aucune image sélectionnée"
                        )}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none rounded-xl">
                            Annuler
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!selectedImage}
                            className="flex-1 sm:flex-none gap-2 rounded-xl bg-primary"
                        >
                            <Check className="size-4" />
                            Choisir cette image
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}