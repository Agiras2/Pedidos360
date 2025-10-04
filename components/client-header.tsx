"use client"

import { ShoppingCart, User, LogOut, Settings, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export function ClientHeader() {
  const { totalItems } = useCart()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-6 md:px-8">
        {/* Logo */}
        <Link href="/catalogo" className="flex items-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_Mesa%20de%20trabajo%201-bxNcZNFyYuv2mli5Rd8rVFkOHArcNd.png"
            alt="Pedidos360"
            width={32}
            height={32}
            className="h-8 w-auto object-contain md:h-10"
            priority
          />
        </Link>

        {/* Navegación */}
        <nav className="flex items-center gap-4 md:gap-6">
          {/* Mis Pedidos */}
          <Button variant={pathname === "/mis-pedidos" ? "default" : "ghost"} asChild>
            <Link href="/mis-pedidos" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Mis Pedidos
            </Link>
          </Button>

          {/* Historial */}
          <Button variant={pathname === "/historial-pedidos" ? "default" : "ghost"} asChild>
            <Link href="/historial-pedidos" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Historial
            </Link>
          </Button>

          {/* Perfil */}
          <Button variant={pathname === "/perfil" ? "default" : "ghost"} asChild>
            <Link href="/perfil" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Perfil
            </Link>
          </Button>

          {/* Carrito */}
          <Button variant={pathname === "/carrito" ? "default" : "ghost"} asChild className="relative">
            <Link href="/carrito" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Carrito
              {totalItems > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                  {totalItems}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Logout */}
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Cerrar Sesión</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
