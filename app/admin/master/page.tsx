"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Loader2, RefreshCw } from "lucide-react"
import { AdminHeader } from "@/components/admin-header"

type User = {
  id: string
  email: string
  name: string
  phone: string | null
  address: string | null
  role: string
  created_at: string
}

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  category: string | null
  stock: number
  created_at: string
}

const initialFormState = {
  email: "",
  password: "",
  name: "",
  phone: "",
  address: "",
  productName: "",
  description: "",
  price: "",
  image: "",
  category: "",
  stock: ""
}

export default function MasterPage() {
  const [activeTab, setActiveTab] = useState<"employees" | "clients" | "products">("employees")
  
  const [data, setData] = useState<{
    employees: User[];
    clients: User[];
    products: Product[];
  }>({ employees: [], clients: [], products: [] })

  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"employee" | "client" | "product">("employee")
  const [editingItem, setEditingItem] = useState<User | Product | null>(null)
  const [formData, setFormData] = useState(initialFormState)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [empRes, clientRes, prodRes] = await Promise.all([
        fetch('/api/master?type=employees'),
        fetch('/api/master?type=clients'),
        fetch('/api/master?type=products')
      ])
      
      const empData = await empRes.json()
      const clientData = await clientRes.json()
      const prodData = await prodRes.json()
      
      setData({
        employees: empData.data || [],
        clients: clientData.data || [],
        products: prodData.data || []
      })
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const openDialog = (type: "employee" | "client" | "product", item?: User | Product) => {
    setDialogType(type)
    setEditingItem(item || null)
    
    if (item) {
      if (type === "product") {
        const prod = item as Product
        setFormData({
          ...initialFormState,
          productName: prod.name,
          description: prod.description || "",
          price: prod.price.toString(),
          image: prod.image || "",
          category: prod.category || "",
          stock: prod.stock.toString()
        })
      } else {
        const user = item as User
        setFormData({
          ...initialFormState,
          email: user.email,
          name: user.name,
          phone: user.phone || "",
          address: user.address || "",
        })
      }
    } else {
      setFormData(initialFormState)
    }
    
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let payload: any = {}

    if (dialogType === "product") {
      payload = {
        name: formData.productName,
        description: formData.description,
        price: parseFloat(formData.price),
        image: formData.image,
        category: formData.category,
        stock: parseInt(formData.stock)
      }
    } else {
      payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        ...( !editingItem && {
          email: formData.email,
          password: formData.password
        })
      }
    }

    try {
      const method = editingItem ? 'PUT' : 'POST'
      
      const body = {
        type: dialogType,
        id: editingItem ? editingItem.id : undefined,
        data: payload
      }

      const res = await fetch('/api/master', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error en la operación')
      }

      setIsDialogOpen(false)
      fetchData()
    } catch (error: any) {
      console.error("Error saving:", error)
      alert(error.message || "Error al guardar. Por favor intenta de nuevo.")
    }
  }

  const handleDelete = async (type: "employee" | "client" | "product", id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este elemento?")) return

    try {
      const res = await fetch(`/api/master?type=${type}&id=${id}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) throw new Error('Error al eliminar')
      
      fetchData()
    } catch (error) {
      console.error("Error deleting:", error)
      alert("Error al eliminar. Por favor intenta de nuevo.")
    }
  }

  if (isLoading && data.employees.length === 0) {
    return (
      <>
        <AdminHeader />
        <div className="flex min-h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </>
    )
  }

  const renderTable = (items: any[], type: "user" | "product") => (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
            {type === "user" ? (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
              </>
            ) : (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              </>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                No hay registros encontrados
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium">{item.name}</td>
                {type === "user" ? (
                  <>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.phone || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.address || "-"}</td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.category || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">${Number(item.price).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.stock}</td>
                  </>
                )}
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openDialog(activeTab === "products" ? "product" : activeTab === "employees" ? "employee" : "client", item)} 
                      className="p-1 hover:bg-gray-200 rounded text-gray-600 hover:text-black transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(activeTab === "products" ? "product" : activeTab === "employees" ? "employee" : "client", item.id)} 
                      className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      <AdminHeader />
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel Master</h1>
              <p className="text-gray-500 mt-1 text-sm">Gestión centralizada de recursos</p>
            </div>
            <button onClick={fetchData} className="p-2 hover:bg-gray-200 rounded-full transition-colors" title="Recargar datos">
              <RefreshCw className={`h-5 w-5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="p-6">
            {/* Tabs Navigation */}
            <div className="flex gap-6 border-b border-gray-200 mb-6">
              {[
                { id: "employees", label: "Empleados", count: data.employees.length },
                { id: "clients", label: "Clientes", count: data.clients.length },
                { id: "products", label: "Productos", count: data.products.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label} <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex justify-end mb-4">
               <button
                  onClick={() => openDialog(activeTab === "products" ? "product" : activeTab === "employees" ? "employee" : "client")}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Crear {activeTab === "products" ? "Producto" : activeTab === "employees" ? "Empleado" : "Cliente"}
                </button>
            </div>

            {/* Content Area */}
            {activeTab === "employees" && renderTable(data.employees, "user")}
            {activeTab === "clients" && renderTable(data.clients, "user")}
            {activeTab === "products" && renderTable(data.products, "product")}
          </div>
        </div>

        {/* Dialog Modal */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
              <h2 className="text-xl font-bold mb-1 text-gray-900">
                {editingItem ? "Editar" : "Crear"} {dialogType === "employee" ? "Empleado" : dialogType === "client" ? "Cliente" : "Producto"}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {editingItem ? "Modifica la información existente." : "Ingresa los datos para el nuevo registro."}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {dialogType === "product" ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Nombre del Producto</label>
                      <input
                        type="text"
                        value={formData.productName}
                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Precio</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                            required
                        />
                        </div>
                        <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Stock</label>
                        <input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                            required
                        />
                        </div>
                    </div>
                    {/* ... Resto de campos de producto ... */}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Nombre Completo</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        required
                      />
                    </div>
                    
                    {/* El email y password solo se muestran al crear, o el email deshabilitado al editar */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none disabled:bg-gray-100 disabled:text-gray-500"
                        disabled={!!editingItem}
                        required
                      />
                    </div>

                    {!editingItem && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Contraseña</label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                          minLength={5}
                          required
                          placeholder="Mínimo 5 caracteres"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Teléfono</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                            />
                        </div>
                        <div>
                             {/* Espacio reservado para posible otro campo en el futuro */}
                        </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Dirección</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none"
                        rows={2}
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black shadow-lg shadow-black/20"
                  >
                    {editingItem ? "Guardar Cambios" : "Crear Registro"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}