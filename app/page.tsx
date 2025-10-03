import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 p-6 bg-background">
      <div className="flex flex-col items-center gap-6 text-center">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_Mesa%20de%20trabajo%201-bxNcZNFyYuv2mli5Rd8rVFkOHArcNd.png"
          alt="Pedidos360 Logo"
          width={300}
          height={120}
          priority
        />
        <h1 className="text-4xl font-bold tracking-tight text-balance">Bienvenido a Pedidos360</h1>
        <p className="text-lg text-muted-foreground max-w-md text-pretty">
          Sistema de gestión de pedidos para clientes y empleados
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/auth/login">Iniciar Sesión</Link>
        </Button>
      </div>
    </div>
  )
}
