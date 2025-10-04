"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import jsPDF from "jspdf"
import "jspdf-autotable"
import autoTable from "jspdf-autotable"

type Option = { id: string; name: string }
type ReportRow = { [key: string]: string | number }

export default function ReportSelector() {
  const [reportType, setReportType] = useState<"empleado" | "producto" | "cliente">("empleado")
  const [reportData, setReportData] = useState<ReportRow[]>([])
  const [title, setTitle] = useState("")

  // Traer reporte según tipo
  useEffect(() => {
    setReportData([])
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports?type=${reportType}`)
        if (!res.ok) throw new Error("Error al cargar reporte")
        const data = await res.json()
        setReportData(data.report)
        setTitle(data.title)
      } catch (err) {
        console.error(err)
      }
    }
    fetchReport()
  }, [reportType])

  // Generar PDF
  const generatePDF = () => {
    if (!reportData || reportData.length === 0) return
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text(title, 10, 20)

    // Configura encabezados
    const head = Object.keys(reportData[0])
    const body = reportData.map(row => head.map(h => row[h] || ""))

    // Aquí usamos directamente autoTable
    autoTable(doc, {
      startY: 30,
      head: [head],
      body,
    })

    doc.save(`${reportType}-reporte.pdf`)
  }

  return (
    <div className="space-y-6">
      {/* Selección tipo de reporte */}
      <Select value={reportType} onValueChange={(val) => setReportType(val as any)}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Selecciona tipo de reporte" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="empleado">Todos los pedidos</SelectItem>
          <SelectItem value="producto">Productos</SelectItem>
          <SelectItem value="cliente">Clientes</SelectItem>
        </SelectContent>
      </Select>

      {/* Mostrar reporte */}
      {reportData && reportData.length > 0 && (
        <Card>
          <CardContent>
            <CardTitle className="mb-4">{title}</CardTitle>
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr>
                    {Object.keys(reportData[0]).map((key) => (
                      <th key={key} className="border px-2 py-1 text-left">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, i) => (
                    <tr key={i}>
                      {Object.keys(row).map((key) => (
                        <td key={key} className="border px-2 py-1">{row[key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button className="mt-4" onClick={generatePDF}>Descargar PDF</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
