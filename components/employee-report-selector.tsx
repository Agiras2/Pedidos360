"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type ReportRow = { [key: string]: string | number }

type ChartData = {
  name: string
  value: number
}

export default function ReportSelector() {
  const [reportType, setReportType] = useState<"empleado" | "producto" | "cliente">("empleado")
  const [reportData, setReportData] = useState<ReportRow[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [title, setTitle] = useState("")

  // Traer reporte según tipo
  useEffect(() => {
    setReportData([])
    setChartData([])
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports?type=${reportType}`)
        if (!res.ok) throw new Error("Error al cargar reporte")
        const data = await res.json()
        setReportData(data.report)
        setTitle(data.title)
        
        // Procesar datos para la gráfica según el tipo
        processChartData(data.report, reportType)
      } catch (err) {
        console.error(err)
      }
    }
    fetchReport()
  }, [reportType])

  const processChartData = (data: ReportRow[], type: string) => {
    if (!data || data.length === 0) return

    let processed: ChartData[] = []

    if (type === "empleado") {
      // Agrupar pedidos por fecha
      const pedidosPorFecha: { [key: string]: number } = {}
      data.forEach((row) => {
        const fecha = row["Fecha"] as string
        if (fecha) {
          const fechaCorta = fecha.split(" ")[0] // Solo la fecha, sin hora
          pedidosPorFecha[fechaCorta] = (pedidosPorFecha[fechaCorta] || 0) + 1
        }
      })
      
      processed = Object.entries(pedidosPorFecha)
        .map(([fecha, cantidad]) => ({
          name: fecha,
          value: cantidad
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(-10) // Últimos 10 días
    } else if (type === "producto") {
      // Top 10 productos por stock
      processed = data
        .map((row) => {
          const nombre = row["Nombre"] as string
          return {
            name: nombre.length > 15 ? nombre.substring(0, 15) + "..." : nombre,
            value: row["Stock"] as number
          }
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
    } else if (type === "cliente") {
      // Clientes registrados por fecha
      const clientesPorFecha: { [key: string]: number } = {}
      data.forEach((row) => {
        const fecha = row["Fecha de Registro"] as string
        if (fecha) {
          const fechaCorta = fecha.split(" ")[0]
          clientesPorFecha[fechaCorta] = (clientesPorFecha[fechaCorta] || 0) + 1
        }
      })
      
      processed = Object.entries(clientesPorFecha)
        .map(([fecha, cantidad]) => ({
          name: fecha,
          value: cantidad
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(-10)
    }

    setChartData(processed)
  }

  const generatePDF = () => {
    if (!reportData || reportData.length === 0) return
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text(title, 10, 20)

    const head = Object.keys(reportData[0])
    const body = reportData.map(row => head.map(h => row[h] || ""))

    autoTable(doc, {
      startY: 30,
      head: [head],
      body,
    })

    doc.save(`${reportType}-reporte.pdf`)
  }

  const getChartTitle = () => {
    if (reportType === "empleado") return "Pedidos por Día (Últimos 10 días)"
    if (reportType === "producto") return "Top 10 Productos por Stock"
    return "Clientes Registrados por Día"
  }

  const getChartColor = () => {
    if (reportType === "empleado") return "#3b82f6" // blue
    if (reportType === "producto") return "#10b981" // green
    return "#8b5cf6" // purple
  }

  return (
    <div className="space-y-6">
      {/* Selección tipo de reporte */}
      <div className="flex items-center gap-4">
        <select 
          value={reportType} 
          onChange={(e) => setReportType(e.target.value as any)}
          className="px-4 py-2 border rounded-md bg-white"
        >
          <option value="empleado">Todos los pedidos</option>
          <option value="producto">Productos</option>
          <option value="cliente">Clientes</option>
        </select>
      </div>

      {/* Gráfica */}
      {chartData && chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">{getChartTitle()}</h3>
          <ResponsiveContainer width="100%" height={300}>
            {reportType === "producto" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill={getChartColor()} name="Stock" />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={getChartColor()} 
                  strokeWidth={2}
                  name={reportType === "empleado" ? "Pedidos" : "Clientes"}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Mostrar reporte en tabla */}
      {reportData && reportData.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(reportData[0]).map((key) => (
                      <th key={key} className="border px-4 py-2 text-left font-medium text-gray-700">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {Object.keys(row).map((key) => (
                        <td key={key} className="border px-4 py-2 text-sm">
                          {row[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
              className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              onClick={generatePDF}
            >
              Descargar PDF
            </button>
          </div>
        </div>
      )}

      {reportData && reportData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay datos para mostrar</p>
        </div>
      )}
    </div>
  )
}
