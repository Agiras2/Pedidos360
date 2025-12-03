// app/api/reports/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const type = req.nextUrl.searchParams.get("type")
  if (!type) return NextResponse.json({ error: "Falta parámetro type" }, { status: 400 })

  if (type === "empleado") {
    // Todos los pedidos activos
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        created_at,
        users:user_id(name)
      `)
      .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const report = orders?.map((o) => {
      // Forzar el tipo correcto
      const user = o.users as unknown as { name: string } | null
      return {
        PedidoID: o.id,
        Cliente: user?.name || "Desconocido",
        Estado: o.status,
        Fecha: new Date(o.created_at).toLocaleDateString("es-CO")
      }
    }) || []

    return NextResponse.json({ report, title: "Reporte de Pedidos (Todos los empleados)" })
  }

  if (type === "producto") {
    // Todos los productos y cantidad vendida
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        stock,
        order_items(quantity)
      `)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const report = products?.map((p) => {
      const totalVendidos = p.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
      return {
        Nombre: p.name,
        Stock: p.stock,
        "Cantidad Vendida": totalVendidos,
      }
    }) || []

    return NextResponse.json({ report, title: "Reporte de Productos" })
  }

  if (type === "cliente") {
    // Todos los clientes y cantidad de pedidos
    const { data: clients, error } = await supabase
      .from("users")
      .select(`
        id,
        name,
        email,
        created_at,
        orders(id)
      `)
      .eq("role", "client")

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const report = clients?.map((c) => ({
      Cliente: c.name,
      Email: c.email,
      "Cantidad de Pedidos": c.orders?.length || 0,
      "Fecha de Registro": new Date(c.created_at).toLocaleDateString("es-CO")
    })) || []

    return NextResponse.json({ report, title: "Reporte de Clientes" })
  }

  return NextResponse.json({ error: "Tipo de reporte no válido" }, { status: 400 })
}
