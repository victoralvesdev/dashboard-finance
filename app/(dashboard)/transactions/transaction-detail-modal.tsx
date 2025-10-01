"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { useUpdateTransaction } from "@/features/transactions/api/use-update-transaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Image as ImageIcon, Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Transaction = {
  id: string;
  description: string;
  amount: string;
  due_date: string;
  paid_at: string;
  is_shared: boolean;
  proof_image_url: string | null;
  paid_by: string;
};

type TransactionDetailModalProps = {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
};

export const TransactionDetailModal = ({
  transaction,
  open,
  onClose,
}: TransactionDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Transaction | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const updateMutation = useUpdateTransaction(transaction?.id);

  if (!transaction) return null;

  const currentData = isEditing ? editedData || transaction : transaction;

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(transaction);
    setImagePreview(transaction.proof_image_url);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!editedData) return;

    const updates: any = {};

    if (editedData.description !== transaction.description) {
      updates.description = editedData.description;
    }
    if (editedData.amount !== transaction.amount) {
      updates.amount = editedData.amount;
    }
    if (editedData.proof_image_url !== transaction.proof_image_url) {
      updates.proof_image_url = editedData.proof_image_url;
    }

    if (Object.keys(updates).length === 0) {
      setIsEditing(false);
      return;
    }

    updateMutation.mutate(updates, {
      onSuccess: () => {
        setIsEditing(false);
        setEditedData(null);
        setImagePreview(null);
        onClose();
      },
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        if (editedData) {
          setEditedData({
            ...editedData,
            proof_image_url: reader.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (editedData) {
      setEditedData({
        ...editedData,
        proof_image_url: null,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEditing ? "Editar Pagamento" : "Detalhes do Pagamento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite as informações do pagamento"
              : "Visualize as informações completas do pagamento"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            {isEditing ? (
              <Input
                id="description"
                value={currentData.description}
                onChange={(e) =>
                  setEditedData({ ...currentData, description: e.target.value })
                }
              />
            ) : (
              <p className="text-lg font-medium">{currentData.description}</p>
            )}
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            {isEditing ? (
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={currentData.amount}
                onChange={(e) =>
                  setEditedData({ ...currentData, amount: e.target.value })
                }
              />
            ) : (
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(parseFloat(currentData.amount))}
              </p>
            )}
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo de Conta</Label>
            <div>
              <Badge variant={currentData.is_shared ? "default" : "secondary"} className="text-sm">
                {currentData.is_shared ? "Conta da Casa" : "Despesa Individual"}
              </Badge>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <p className="text-sm">
                {format(new Date(currentData.due_date), "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Data de Pagamento</Label>
              <p className="text-sm">
                {format(new Date(currentData.paid_at), "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>

          {/* Comprovante */}
          <div className="space-y-2">
            <Label>Comprovante de Pagamento</Label>
            {isEditing ? (
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Comprovante"
                      className="w-full h-auto max-h-96 object-contain rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <ImageIcon className="size-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Nenhum comprovante anexado
                    </p>
                    <Label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                      <Upload className="size-4 mr-2" />
                      Fazer Upload
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                {currentData.proof_image_url ? (
                  <img
                    src={currentData.proof_image_url}
                    alt="Comprovante"
                    className="w-full h-auto max-h-96 object-contain rounded-lg border cursor-pointer hover:opacity-90 transition"
                    onClick={() => window.open(currentData.proof_image_url!, "_blank")}
                  />
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <ImageIcon className="size-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum comprovante anexado
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button onClick={handleEdit}>Editar</Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
