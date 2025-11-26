import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  
  try {
    // Para usuarios (empleados y clientes), usa el admin client
    if (type === "employees" || type === "clients") {
      const adminClient = createAdminClient()
      const role = type === "employees" ? "employee" : "client"
      
      const { data, error } = await adminClient
        .from("users")
        .select("*")
        .eq("role", role)
        .order("created_at", { ascending: false })
      
      if (error) throw error
      return NextResponse.json({ data })
    }
    
    if (type === "products") {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      return NextResponse.json({ data })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { type, data: itemData } = body
  
  try {
    // Lógica de PRODUCTOS (se mantiene igual, usa insert normal)
    if (type === "product") {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: itemData.name,
          description: itemData.description || null,
          price: parseFloat(itemData.price),
          image: itemData.image || null,
          category: itemData.category || null,
          stock: parseInt(itemData.stock)
        })
        .select()
      
      if (error) throw error
      return NextResponse.json({ data })
    }

    // Lógica de USUARIOS (Aquí está el cambio clave)
    if (type === "employee" || type === "client") {
      const adminClient = createAdminClient()
      
      // 1. Crear usuario en Auth (Supabase genera ID)
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: itemData.email,
        password: itemData.password,
        email_confirm: true,
        user_metadata: { name: itemData.name } // Opcional: guardar nombre en metadata también
      })

      if (authError) throw authError

      // 2. Insertar o Actualizar en public.users
      // Usamos .upsert() para evitar el error "duplicate key" si el trigger ya creó la fila
      const { data: userData, error: userError } = await adminClient
        .from("users")
        .upsert({
          id: authData.user.id, // ID generado por Auth
          email: itemData.email,
          name: itemData.name,
          phone: itemData.phone || null,
          address: itemData.address || null,
          role: type === "employee" ? "employee" : "client"
        })
        .select()

      if (userError) {
        // Si falla el perfil, intentamos limpiar el usuario de Auth para no dejar basura
        await adminClient.auth.admin.deleteUser(authData.user.id)
        throw userError
      }
      
      return NextResponse.json({ data: userData })
    }

    return NextResponse.json({ 
      error: "Invalid type" 
    }, { status: 400 })
  } catch (error) {
    console.error("Error creating data:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Error creating data" 
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { type, id, data: itemData } = body
  
  const adminClient = createAdminClient()

  try {
    if (type === "product") {
      const { data, error } = await adminClient
        .from("products")
        .update({
          name: itemData.name,
          description: itemData.description || null,
          price: parseFloat(itemData.price),
          image: itemData.image || null,
          category: itemData.category || null,
          stock: parseInt(itemData.stock),
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
      
      if (error) throw error
      return NextResponse.json({ data })
    }
    
    if (type === "employee" || type === "client") {
      const { data, error } = await adminClient
        .from("users")
        .update({
          name: itemData.name,
          phone: itemData.phone || null,
          address: itemData.address || null
        })
        .eq("id", id)
        .select()
      
      if (error) throw error
      return NextResponse.json({ data })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Error updating data:", error)
    return NextResponse.json({ error: "Error updating data" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const id = searchParams.get("id")
  
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }
  
  const adminClient = createAdminClient()

  try {
    if (type === "product") {
      const { error } = await adminClient
        .from("products")
        .delete()
        .eq("id", id)
      
      if (error) throw error
      return NextResponse.json({ success: true })
    }
    
    if (type === "employee" || type === "client") {
      // Nota: Si tienes configurado "ON DELETE CASCADE" en tu DB,
      // borrar el auth user automáticamente borrará el public user.
      // Pero hacerlo explícitamente es más seguro.
      
      // 1. Borramos el usuario Auth (la fuente de verdad)
      const { error: authError } = await adminClient.auth.admin.deleteUser(id)
      if (authError) throw authError

      // 2. Opcional: Borramos de public.users si no tienes cascade
      // (Si tienes cascade, esto no hará nada o retornará null, lo cual está bien)
      const { error: userError } = await adminClient
        .from("users")
        .delete()
        .eq("id", id)
      
      // No lanzamos error si userError existe porque el usuario podría haber sido
      // borrado por el cascade del paso 1.

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Error deleting data:", error)
    return NextResponse.json({ error: "Error deleting data" }, { status: 500 })
  }
}