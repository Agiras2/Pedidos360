import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EmployeeHeader } from "@/components/employee-header"
import { AdminHeader } from "@/components/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

export default async function EmployeeHistorialPedidosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  // Verificar rol empleado o admin
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  // Permitir acceso a empleados y admins
  if (userData?.role !== "employee" && userData?.role !== "admin") {
    redirect("/catalogo")
  }

  const isAdmin = userData?.role === "admin"

  // Traer solo pedidos entregados o cancelados
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      total,
      payment_method,
      delivery_address,
      notes,
      created_at,
      user_id,
      users(name, phone),
      order_items (
        id,
        quantity,
        price,
        products(name)
      )
    `)
    .in("status", ["delivered", "cancelled"])
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      {isAdmin ? <AdminHeader /> : <EmployeeHeader />}
      <main className="container mx-auto px-8 py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-xl md:text-3xl font-bold mb-2">Historial de Pedidos</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Aquí se muestran todos los pedidos entregados o cancelados
          </p>
        </div>

        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const cliente = order.users as unknown as { name: string | null; phone: string | null }
              return (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">Pedido #{order.id.slice(0, 8)}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Cliente: {cliente?.name || "Desconocido"} - {cliente?.phone || "N/A"}
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
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Productos:</h4>
                      {order.order_items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.products.name} x {item.quantity}</span>
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
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron pedidos en historial</p>
          </div>
        )}
      </main>
    </div>
  )
}