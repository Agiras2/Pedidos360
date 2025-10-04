"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { ClientHeader } from "@/components/client-header" // 👈 encabezado

export default function PerfilPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Traemos datos de public.users
      const { data, error } = await supabase
        .from("users")
        .select("email, name, phone, address")
        .eq("id", user.id)
        .single()

      if (!error && data) {
        setEmail(data.email) // solo mostrar, no actualizar
        setName(data.name)
        setPhone(data.phone || "")
        setAddress(data.address || "")
      }

      setLoading(false)
    }

    getProfile()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuario no autenticado")

      // 👇 importante: NO actualizamos el email aquí
      const { error } = await supabase
        .from("users")
        .update({
          name,
          phone,
          address,
        })
        .eq("id", user.id)

      if (error) throw error

      alert("Perfil actualizado ✅")
      router.push("/catalogo")
    } catch (err) {
      console.error(err)
      alert("Error al actualizar el perfil ❌")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-center mt-10">Cargando perfil...</p>
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 🔹 Encabezado arriba */}
      <ClientHeader />

      {/* 🔹 Formulario centrado */}
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Editar Perfil</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled // 👈 solo lectura
                />
              </div>
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

