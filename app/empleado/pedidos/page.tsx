import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EmployeeHeader } from "@/components/employee-header"
import { AdminHeader } from "@/components/admin-header" // <--- Importante: Importar el header de admin
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OrderStatusSelect } from "@/components/order-status-select"
import { OrderSearchInput } from "@/components/order-search-input"

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
  if (!user) redirect("/auth/login")


  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (userData?.role !== "employee" && userData?.role !== "admin") {
    redirect("/catalogo")
  }


  const { data: allOrders } = await supabase
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
      cancel_solicitude,
      users(name, phone),
      order_items (
        id,
        quantity,
        price,
        products(name)
      )
    `)
    .neq("status", "delivered")
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })


  let orders = allOrders || []

  if (params.status) {
    orders = orders.filter(order => order.status === params.status)
  }

  if (params.q) {
    const searchTerm = params.q.toLowerCase().trim()
    orders = orders.filter((order) => {
      const cliente = order.users as unknown as { name: string | null }
      const clienteName = cliente?.name?.toLowerCase() || ""
      const orderId = order.id.toLowerCase()
      const orderIdShort = order.id.slice(0, 8).toLowerCase()
      const address = order.delivery_address?.toLowerCase() || ""
      
      return (
        orderId.includes(searchTerm) ||
        orderIdShort.includes(searchTerm) ||
        clienteName.includes(searchTerm) ||
        address.includes(searchTerm)
      )
    })
  }


  const { data: statusCounts } = await supabase
    .from("orders")
    .select("status")
    .neq("status", "delivered")
    .neq("status", "cancelled")

  const counts = statusCounts?.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="min-h-screen bg-background">
      {/*Mostrar Header correcto según el rol */}
      {userData?.role === "admin" ? <AdminHeader /> : <EmployeeHeader />}
      
      <main className="container mx-auto px-8 py-8 max-w-5xl">
        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="text-xl md:text-3xl font-bold mb-2">Gestión de Pedidos</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Administra y actualiza el estado de los pedidos
          </p>
        </div>

        {/* Filtros por estado */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {Object.entries(statusLabels).map(([status, label]) => (
            <a
              key={status}
              href={
                params.status === status
                  ? "/empleado/pedidos"
                  : `/empleado/pedidos?status=${status}`
              }
              className={`p-4 rounded-lg border text-center hover:bg-accent transition-colors ${
                params.status === status ? "bg-accent" : ""
              }`}
            >
              <p className="text-2xl font-bold">{counts?.[status] || 0}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </a>
          ))}
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <OrderSearchInput />
        </div>

        {/* Lista de pedidos */}
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

                        {/* Badge para solicitud de cancelación */}
                        {order.cancel_solicitude && (
                          <Badge variant="outline" className="bg-yellow-200 text-yellow-800">
                            Solicitud de cancelación enviada
                          </Badge>
                        )}

                        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
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
            <p className="text-muted-foreground">No se encontraron pedidos</p>
          </div>
        )}
      </main>
    </div>
  )
}