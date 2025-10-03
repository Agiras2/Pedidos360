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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/empleado/pedidos" className="flex items-center gap-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_Mesa%20de%20trabajo%201-bxNcZNFyYuv2mli5Rd8rVFkOHArcNd.png"
            alt="Pedidos360"
            width={120}
            height={48}
            priority
          />
        </Link>

        <nav className="flex items-center gap-2">
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
