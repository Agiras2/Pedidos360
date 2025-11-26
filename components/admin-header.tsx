"use client"

import { Package, Clock, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"

export function AdminHeader() {
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
        <Link href="/admin/master" className="flex items-center">
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
          {/* Pedidos */}
          <Button 
            variant={pathname === "/empleado/pedidos" ? "default" : "ghost"} 
            asChild
          >
            <Link href="/empleado/pedidos" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Pedidos
            </Link>
          </Button>

          {/* Historial */}
          <Button 
            variant={pathname === "/empleado/historial-pedidos" ? "default" : "ghost"} 
            asChild
          >
            <Link href="/empleado/historial-pedidos" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Historial
            </Link>
          </Button>

          {/* Master */}
          <Button variant={pathname === "/admin/master" ? "default" : "ghost"} asChild>
            <Link href="/admin/master" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Master
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