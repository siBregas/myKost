import MonthlySheetRangeTable from "@/components/Table"

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Ketersediaan Kost
      </h1>
      <MonthlySheetRangeTable />
    </main>
  )
}