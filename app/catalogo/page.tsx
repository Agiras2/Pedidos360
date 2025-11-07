import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClientHeader } from "@/components/client-header"
import { ProductCard } from "@/components/product-card"
import { SearchInput } from "@/components/search-input"

export default async function CatalogPage({
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

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role === "employee") {
    redirect("/empleado/pedidos")
  }

  let query = supabase.from("products").select("*").order("name")

  if (params.q) {
    query = query.ilike("name", `%${params.q}%`)
  }

  if (params.categoria) {
    query = query.eq("category", params.categoria)
  }

  const { data: products } = await query

  const { data: categories } = await supabase.from("products").select("category").not("category", "is", null)

  const uniqueCategories = [...new Set(categories?.map((c) => c.category) || [])]

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      <main className="px-8 py-8">
        <div className="mb-6">
          <h1 className="text-xl md:text-3xl font-bold mb-2">Catálogo de Productos</h1>
          <p className="text-sm md:text-base text-muted-foreground">Explora nuestros productos y agrega al carrito</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <SearchInput />
          {uniqueCategories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {uniqueCategories.map((category) => (
                <a
                  key={category}
                  href={`/catalogo?categoria=${encodeURIComponent(category)}`}

                  className="px-4 py-2 rounded-md border bg-background hover:bg-accent text-sm"
                >
                  {category}
                </a>
              ))}
              {params.categoria && (
                <a href="/catalogo" className="px-4 py-2 rounded-md border bg-primary text-primary-foreground text-sm">
                  Ver Todos
                </a>
              )}
            </div>
          )}
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                image={product.image}
                stock={product.stock}
              />
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