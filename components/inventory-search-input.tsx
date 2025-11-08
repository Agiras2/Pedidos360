'use client'

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTransition, useEffect, useState } from "react"

export function InventorySearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '')

  useEffect(() => {
    setSearchValue(searchParams.get('q') || '')
  }, [searchParams])

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (searchValue) {
        params.set('q', searchValue)
      } else {
        params.delete('q')
      }

      startTransition(() => {
        router.push(`/empleado/inventario?${params.toString()}`)
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue, router, searchParams])

  return (
    <div className="relative flex-1 max-w-lg mx-auto sm:mx-0">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar productos..."
        className="pl-9"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  )
}