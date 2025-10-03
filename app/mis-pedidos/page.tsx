import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClientHeader } from "@/components/client-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"

const statusColors = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  preparing: "bg-purple-500",
  ready: "bg-green-500",
  delivered: "bg-gray-500",
  cancelled: "bg-red-500",
}

const statusLabels = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
}

export default async function MyOrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mis Pedidos</h1>
          <p className="text-muted-foreground">Historial y estado de tus pedidos</p>
        </div>

        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-lg">Pedido #{order.id.slice(0, 8)}</CardTitle>
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                      {statusLabels[order.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.products.name} x {item.quantity}
                        </span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Método de pago</span>
                      <span className="capitalize">{order.payment_method}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dirección de entrega</span>
                      <span className="text-right max-w-xs">{order.delivery_address}</span>
                    </div>
                    {order.notes && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Notas</span>
                        <span className="text-right max-w-xs">{order.notes}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Package className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">No tienes pedidos</h2>
            <p className="text-muted-foreground">Realiza tu primer pedido desde el catálogo</p>
          </div>
        )}
      </main>
    </div>
  )
}
