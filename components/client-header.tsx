"use client"

import { ShoppingCart, User, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export function ClientHeader() {
  const { totalItems } = useCart()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/catalogo" className="flex items-center gap-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_Mesa%20de%20trabajo%201-bxNcZNFyYuv2mli5Rd8rVFkOHArcNd.png"
            alt="Pedidos360"
            width={120}
            height={48}
            priority
          />
        </Link>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/mis-pedidos">
              <User className="h-5 w-5" />
              <span className="sr-only">Mis Pedidos</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/carrito">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                  {totalItems}
                </Badge>
              )}
              <span className="sr-only">Carrito</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Cerrar Sesión</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
