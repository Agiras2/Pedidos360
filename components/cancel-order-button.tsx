"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

interface CancelOrderButtonProps {
  orderId: string
  cancelSolicitude?: boolean
}

export function CancelOrderButton({ orderId, cancelSolicitude = false }: CancelOrderButtonProps) {
  const [loading, setLoading] = useState(false)
  const [requested, setRequested] = useState(cancelSolicitude)

  useEffect(() => {
    setRequested(cancelSolicitude)
  }, [cancelSolicitude])

  const handleCancelRequest = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("orders")
        .update({ cancel_solicitude: true })
        .eq("id", orderId)
        .select("id, cancel_solicitude") // importante para recibir confirmación

      if (error) throw error

      if (data && data.length > 0) {
        toast({ title: "Solicitud de cancelación enviada" })
        setRequested(true)
      } else {
        toast({ title: "No se pudo actualizar el pedido" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCancelRequest}
      disabled={loading || requested}
      variant={requested ? "outline" : "destructive"}
    >
      {loading ? "Enviando..." : requested ? "Cancelación solicitada" : "Solicitar cancelación"}
    </Button>
  )
}
