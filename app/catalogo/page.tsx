import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClientHeader } from "@/components/client-header"
import { ProductCard } from "@/components/product-card"
import { SearchInput } from "@/components/search-input" // 👈 Importar el nuevo componente

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

  // Get user role
  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role === "employee") {
    redirect("/empleado/pedidos")
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

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      <main className="px-8 py-8">
        <div className="mb-6">
          <h1 className="text-xl md:text-3xl font-bold mb-2">Catálogo de Productos</h1>
          <p className="text-sm md:text-base text-muted-foreground">Explora nuestros productos y agrega al carrito</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* 👇 Reemplazar el Input con SearchInput */}
          <SearchInput />
        </div>

      </main>
    </div>
  )
}