import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const type = url.searchParams.get("type")
  const supabase = await createClient()

  let data: { data: any[] | null; error: any } = { data: null, error: null }

  if (type === "empleado") {
    data = await supabase.from("users").select("id,name").eq("role","employee")
  } else if (type === "producto") {
    data = await supabase.from("products").select("id,name")
  } else if (type === "cliente") {
    data = await supabase.from("users").select("id,name").eq("role","client")
  }
  
  return NextResponse.json(data.data ?? [])
}