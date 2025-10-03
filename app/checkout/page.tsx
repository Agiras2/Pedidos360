"use client"

import type React from "react"

import { ClientHeader } from "@/components/client-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { createClient } from "@/lib/supabase/client"
import { CreditCard, Banknote, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<{ name: string; phone: string; address: string } | null>(null)

  const [formData, setFormData] = useState({
    deliveryAddress: "",
    paymentMethod: "cash" as "cash" | "card" | "transfer",
    notes: "",
  })

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from("users").select("name, phone, address").eq("id", user.id).single()
        if (data) {
          setUserData(data)
          setFormData((prev) => ({ ...prev, deliveryAddress: data.address || "" }))
        }
      }
    }
    fetchUserData()
  }, [])

  useEffect(() => {
    if (items.length === 0) {
      router.push("/catalogo")
    }
  }, [items, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total: totalPrice,
          payment_method: formData.paymentMethod,
          delivery_address: formData.deliveryAddress,
          notes: formData.notes,
          status: "pending",
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart and redirect
      clearCart()
      router.push(`/pedido-confirmado?id=${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pedido")
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Finalizar Pedido</h1>
          <p className="text-muted-foreground">Completa los detalles de tu pedido</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información de Entrega</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" value={userData?.name || ""} disabled />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" value={userData?.phone || ""} disabled />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Dirección de Entrega *</Label>
                    <Textarea
                      id="address"
                      placeholder="Ingresa la dirección completa de entrega"
                      required
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Instrucciones especiales, referencias, etc."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Método de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as any })}
                  >
                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Banknote className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Efectivo</p>
                          <p className="text-sm text-muted-foreground">Pago contra entrega</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Tarjeta</p>
                          <p className="text-sm text-muted-foreground">Débito o crédito</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="transfer" id="transfer" />
                      <Label htmlFor="transfer" className="flex items-center gap-3 cursor-pointer flex-1">
                        <Building2 className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Transferencia</p>
                          <p className="text-sm text-muted-foreground">Transferencia bancaria</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm font-medium">${(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envío</span>
                      <span>Gratis</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? "Procesando..." : "Confirmar Pedido"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
