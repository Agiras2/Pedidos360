"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"
import { useState } from "react"

interface ProductCardProps {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  stock: number
}

export function ProductCard({ id, name, description, price, image, stock }: ProductCardProps) {
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    addItem({
      id,
      name,
      price,
      image: image || "/placeholder.svg?height=200&width=200",
      stock,
    })
    setTimeout(() => setIsAdding(false), 500)
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={image || "/placeholder.svg?height=200&width=200&query=product"}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="flex-1 p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{name}</h3>
        {description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{description}</p>}
        <p className="text-2xl font-bold">${price.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-1">{stock > 0 ? `${stock} disponibles` : "Sin stock"}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={handleAddToCart} disabled={stock === 0 || isAdding} className="w-full">
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isAdding ? "Agregado!" : stock === 0 ? "Sin Stock" : "Agregar al Carrito"}
        </Button>
      </CardFooter>
    </Card>
  )
}
