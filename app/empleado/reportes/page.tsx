import { EmployeeHeader } from "@/components/employee-header"
import ReportSelector from "@/components/employee-report-selector" // Client Component

export default function EmployeeReportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <EmployeeHeader />
      <main className="container mx-auto px-8 py-8 max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Generar Reportes</h1>
        <ReportSelector />
      </main>
    </div>
  )
}

