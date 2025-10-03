"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Plus, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ProductFormDialogProps {
  mode: "create" | "edit"
  product?: {
    id: string
    name: string
    description: string | null
    price: number
    stock: number
    category: string | null
    image: string | null
  }
}

export function ProductFormDialog({ mode, product }: ProductFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    stock: product?.stock?.toString() || "",
    category: product?.category || "",
    image: product?.image || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
        category: formData.category || null,
        image: formData.image || null,
      }

      if (mode === "create") {
        const { error } = await supabase.from("products").insert(productData)
        if (error) throw error
      } else {
        const { error } = await supabase.from("products").update(productData).eq("id", product!.id)
        if (error) throw error
      }

      setOpen(false)
      router.refresh()
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        image: "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el producto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Producto
          </Button>
        ) : (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Agregar Producto" : "Editar Producto"}</DialogTitle>
            <DialogDescription>
              {mode === "create" ? "Completa los detalles del nuevo producto" : "Actualiza la información del producto"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">URL de Imagen</Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : mode === "create" ? "Crear Producto" : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
