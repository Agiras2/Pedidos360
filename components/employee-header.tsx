"use client"

import { Package, Box, FileText, LogOut, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"

export function EmployeeHeader() {
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
        <Link href="/empleado/pedidos" className="flex items-center">
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
          <Button variant={pathname === "/empleado/pedidos" ? "default" : "ghost"} asChild>
            <Link href="/empleado/pedidos" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Pedidos
            </Link>
          </Button>

          <Button variant={pathname === "/empleado/historial-pedidos" ? "default" : "ghost"} asChild>
            <Link href="/empleado/historial-pedidos" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Historial
            </Link>
          </Button>

          <Button variant={pathname === "/empleado/inventario" ? "default" : "ghost"} asChild>
            <Link href="/empleado/inventario" className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              Inventario
            </Link>
          </Button>

          <Button variant={pathname === "/empleado/reportes" ? "default" : "ghost"} asChild>
            <Link href="/empleado/reportes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reportes
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
