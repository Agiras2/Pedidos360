"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

const statusLabels = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
}

interface OrderStatusSelectProps {
  orderId: string
  currentStatus: string
}

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating order status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isUpdating}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(statusLabels).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
