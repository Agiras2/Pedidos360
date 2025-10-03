import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EmployeeHeader } from "@/components/employee-header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProductFormDialog } from "@/components/product-form-dialog"
import { DeleteProductDialog } from "@/components/delete-product-dialog"
import { Search, Package } from "lucide-react"
import Image from "next/image"

export default async function EmployeeInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>
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

  // Fetch products
  let query = supabase.from("products").select("*").order("name")

  if (params.q) {
    query = query.ilike("name", `%${params.q}%`)
  }

  if (params.categoria) {
    query = query.eq("category", params.categoria)
  }

  const { data: products } = await query

  // Get unique categories
  const { data: categories } = await supabase.from("products").select("category").not("category", "is", null)

  const uniqueCategories = [...new Set(categories?.map((c) => c.category) || [])]

  // Get inventory stats
  const totalProducts = products?.length || 0
  const lowStock = products?.filter((p) => p.stock < 10).length || 0
  const outOfStock = products?.filter((p) => p.stock === 0).length || 0

  return (
    <div className="min-h-screen bg-background">
      <EmployeeHeader />
      <main className="container py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestión de Inventario</h1>
            <p className="text-muted-foreground">Administra productos y stock</p>
          </div>
          <ProductFormDialog mode="create" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Productos</p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stock Bajo</p>
                  <p className="text-2xl font-bold text-yellow-500">{lowStock}</p>
                </div>
                <Package className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sin Stock</p>
                  <p className="text-2xl font-bold text-red-500">{outOfStock}</p>
                </div>
                <Package className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar productos..." className="pl-9" />
          </div>
          {uniqueCategories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {uniqueCategories.map((category) => (
                <a
                  key={category}
                  href={`/empleado/inventario?categoria=${category}`}
                  className="px-4 py-2 rounded-md border bg-background hover:bg-accent text-sm"
                >
                  {category}
                </a>
              ))}
              {params.categoria && (
                <a
                  href="/empleado/inventario"
                  className="px-4 py-2 rounded-md border bg-primary text-primary-foreground text-sm"
                >
                  Ver Todos
                </a>
              )}
            </div>
          )}
        </div>

        {products && products.length > 0 ? (
          <div className="space-y-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={product.image || "/placeholder.svg?height=96&width=96&query=product"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          {product.category && <Badge variant="outline">{product.category}</Badge>}
                        </div>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Precio: </span>
                            <span className="font-bold">${product.price.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Stock: </span>
                            <span
                              className={`font-bold ${
                                product.stock === 0
                                  ? "text-red-500"
                                  : product.stock < 10
                                    ? "text-yellow-500"
                                    : "text-green-500"
                              }`}
                            >
                              {product.stock} unidades
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2">
                        <ProductFormDialog mode="edit" product={product} />
                        <DeleteProductDialog productId={product.id} productName={product.name} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron productos</p>
          </div>
        )}
      </main>
    </div>
  )
}
