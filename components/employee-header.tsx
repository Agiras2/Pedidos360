"use client"

import { Package, Box, LogOut } from "lucide-react"
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

        <nav className="flex items-center gap-4 md:gap-6">
          <Button variant={pathname === "/empleado/pedidos" ? "default" : "ghost"} asChild>
            <Link href="/empleado/pedidos">
              <Package className="mr-2 h-4 w-4" />
              Pedidos
            </Link>
          </Button>
          <Button variant={pathname === "/empleado/inventario" ? "default" : "ghost"} asChild>
            <Link href="/empleado/inventario">
              <Box className="mr-2 h-4 w-4" />
              Inventario
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

