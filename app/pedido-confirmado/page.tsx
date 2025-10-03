import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClientHeader } from "@/components/client-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  if (!params.id) {
    redirect("/catalogo")
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name))")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!order) {
    redirect("/catalogo")
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-3xl">¡Pedido Confirmado!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground">Tu pedido ha sido recibido y está siendo procesado</p>
                <p className="text-sm text-muted-foreground mt-2">Número de pedido: {order.id.slice(0, 8)}</p>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold">Detalles del Pedido</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estado</span>
                    <span className="font-medium capitalize">{order.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Método de pago</span>
                    <span className="font-medium capitalize">{order.payment_method}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dirección de entrega</span>
                    <span className="font-medium text-right max-w-xs">{order.delivery_address}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-3">
                <h3 className="font-semibold">Productos</h3>
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.products.name} x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button asChild className="flex-1">
                  <Link href="/mis-pedidos">Ver Mis Pedidos</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 bg-transparent">
                  <Link href="/catalogo">Seguir Comprando</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
