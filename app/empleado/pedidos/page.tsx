import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EmployeeHeader } from "@/components/employee-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OrderStatusSelect } from "@/components/order-status-select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

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

export default async function EmployeeOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is employee
  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role !== "employee") {
    redirect("/catalogo")
  }

  // Fetch orders with filters
  let query = supabase
    .from("orders")
    .select("*, users(name, phone), order_items(*, products(name))")
    .order("created_at", { ascending: false })

  if (params.status) {
    query = query.eq("status", params.status)
  }

  const { data: orders } = await query

  // Get order counts by status
  const { data: statusCounts } = await supabase.from("orders").select("status")

  const counts = statusCounts?.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="min-h-screen bg-background">
      <EmployeeHeader />
      <main className="container px-8 py-8">
        <div className="mb-6">
          <h1 className="text-xl md:text-3xl font-bold mb-2">Gestión de Pedidos</h1>
          <p className="text-sm md:text-base text-muted-foreground">Administra y actualiza el estado de los pedidos</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {Object.entries(statusLabels).map(([status, label]) => (
            <a
              key={status}
              href={params.status === status ? "/empleado/pedidos" : `/empleado/pedidos?status=${status}`}
              className={`p-4 rounded-lg border text-center hover:bg-accent transition-colors ${
                params.status === status ? "bg-accent" : ""
              }`}
            >
              <p className="text-2xl font-bold">{counts?.[status] || 0}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </a>
          ))}
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por número de pedido o cliente..." className="pl-9" />
          </div>
        </div>

        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">Pedido #{order.id.slice(0, 8)}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {order.users.name} - {order.users.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                        {statusLabels[order.status as keyof typeof statusLabels]}
                      </Badge>
                      <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Productos:</h4>
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
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron pedidos</p>
          </div>
        )}
      </main>
    </div>
  )
}
