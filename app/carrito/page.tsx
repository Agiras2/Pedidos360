"use client"

import { ClientHeader } from "@/components/client-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/lib/cart-context"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart()
  const router = useRouter()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <ClientHeader />
        <main className="container py-8">
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Tu carrito está vacío</h2>
            <p className="text-muted-foreground">Agrega productos desde el catálogo</p>
            <Button asChild>
              <Link href="/catalogo">Ver Catálogo</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Carrito de Compras</h1>
          <p className="text-muted-foreground">{totalItems} productos en tu carrito</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-lg font-bold mt-1">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-auto text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Resumen del Pedido</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span>Gratis</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={() => router.push("/checkout")}>
                  Proceder al Pago
                </Button>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/catalogo">Seguir Comprando</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
