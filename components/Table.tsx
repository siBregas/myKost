"use client"

import { useEffect, useState } from "react"
import dayjs from "dayjs"

interface RowData {
  room_id: number
  start_date: string
  end_date: string
  status: string
  note?: string
}

export default function MonthlySheetRangeTable() {
  const [rows, setRows] = useState<RowData[]>([])
  const [month, setMonth] = useState(8) // September (0-based: 8 = September)
  const [year, setYear] = useState(2025)
  const [loading, setLoading] = useState(true)

  const daysInMonth = dayjs(`${year}-${month + 1}-01`).daysInMonth()

  useEffect(() => {
    async function fetchSheet() {
      setLoading(true)
      const sheetId = "1dpt5uCyBfpfBLh0w-8uVC9LgU4ihKErU7babxc_p23Y"
      
      // Coba beberapa URL yang berbeda
      const urls = [
        `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`,
        `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`,
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:E?key=AIzaSyDummy` // fallback
      ]

      console.log("🔍 Trying to fetch Google Sheets data...")

      // Method 1: Coba GVIZ API
      try {
        console.log("Method 1: Trying GVIZ API:", urls[0])
        const res = await fetch(urls[0])
        console.log("Response status:", res.status, res.statusText)
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        
        const text = await res.text()
        console.log("Raw response (first 500 chars):", text.substring(0, 500))

        // Parsing JSONP response
        let jsonText = ""
        if (text.includes('google.visualization.Query.setResponse(')) {
          jsonText = text.replace(/^.*google\.visualization\.Query\.setResponse\(/, "").slice(0, -2)
        } else if (text.includes('(')) {
          jsonText = text.replace(/^[^\(]*\(/, "").slice(0, -2)
        } else {
          jsonText = text
        }

        const json = JSON.parse(jsonText)
        console.log("RAW JSON:", json)

        if (!json.table || !json.table.rows || json.table.rows.length === 0) {
          throw new Error("No data found in Google Sheets")
        }

        const data: RowData[] = json.table.rows
          .map((r: { c?: Array<{ v?: string | number }> }) => {
            const c = r.c
            if (!c) return null
            const roomIdRaw = c[0]?.v
            const start = c[1]?.v
            const end = c[2]?.v
            const status = c[3]?.v
            const note = c[4]?.v || ""

            if (
              roomIdRaw == null ||
              start == null ||
              end == null ||
              status == null
            ) {
              // skip baris yang tidak lengkap
              return null
            }

            return {
              room_id: Number(roomIdRaw),
              start_date: String(start),
              end_date: String(end),
              status: String(status).toLowerCase(), // jadi “terisi” / “booking”
              note: String(note),
            }
          })
          .filter((x: RowData | null): x is RowData => x !== null)

        console.log("PARSED DATA:", data)
        
        if (data.length === 0) {
          throw new Error("No valid data parsed from Google Sheets")
        }

        setRows(data)
        return // Success!
        
      } catch (gvizError) {
        console.error("GVIZ method failed:", gvizError)
      }

      // Method 2: Coba CSV export
      try {
        console.log("Method 2: Trying CSV export:", urls[1])
        const res = await fetch(urls[1])
        
        if (!res.ok) {
          throw new Error(`CSV HTTP ${res.status}: ${res.statusText}`)
        }
        
        const csvText = await res.text()
        console.log("CSV response (first 300 chars):", csvText.substring(0, 300))
        
        // Parse CSV
        const lines = csvText.split('\n')
        const data: RowData[] = []
        
        for (let i = 1; i < lines.length; i++) { // Skip header
          const line = lines[i].trim()
          if (!line) continue
          
          const cols = line.split(',').map(col => col.replace(/"/g, ''))
          if (cols.length >= 4) {
            const roomId = parseInt(cols[0])
            if (roomId && cols[1] && cols[2] && cols[3]) {
              data.push({
                room_id: roomId,
                start_date: cols[1],
                end_date: cols[2],
                status: cols[3].toLowerCase(),
                note: cols[4] || ""
              })
            }
          }
        }
        
        console.log("CSV PARSED DATA:", data)
        
        if (data.length > 0) {
          setRows(data)
          return // Success!
        }
        
      } catch (csvError) {
        console.error("CSV method failed:", csvError)
        // Semua method gagal - gunakan fallback data
        console.log("⚠️ All methods failed, using fallback data for month:", month + 1, year)
        const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`
        
        setRows([
          {
            room_id: 1,
            start_date: `${currentMonthStr}-01`,
            end_date: `${currentMonthStr}-10`,
            status: "terisi",
            note: "Penghuni lama (fallback)"
          },
          {
            room_id: 1,
            start_date: `${currentMonthStr}-15`,
            end_date: `${currentMonthStr}-20`,
            status: "booking",
            note: "Rosalia DP 200rb (fallback)"
          },
          {
            room_id: 2,
            start_date: `${currentMonthStr}-11`,
            end_date: `${currentMonthStr}-25`,
            status: "booking",
            note: "Yasmin DP (fallback)"
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchSheet()
  }, [month, year])

  const handlePrev = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const handleNext = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading calendar data...</div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrev} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          ⬅️ Prev
        </button>
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">
            {dayjs(`${year}-${month + 1}-01`).format("MMMM YYYY")}
          </h2>
          <button 
            onClick={() => window.location.reload()} 
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            title="Reload data from Google Sheets"
          >
            🔄 Reload
          </button>
        </div>
        <button onClick={handleNext} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
          Next ➡️
        </button>
      </div>

      {/* Debug Panel */}
      <div className="mb-4 p-3 border border-yellow-200 rounded">
        <strong>🔍 Debug Info:</strong><br/>
        • Data loaded: {rows.length} records<br/>
        • Viewing month: {month + 1}/{year} ({dayjs(`${year}-${month + 1}-01`).format("MMMM YYYY")})<br/>
        • Sheet ID: 1dpt5uCyBfpfBLh0w-8uVC9LgU4ihKErU7babxc_p23Y<br/>
        {rows.length === 0 && (
          <div className="mt-2 text-red-600">
            <strong>⚠️ No data loaded!</strong><br/>
            <span className="text-xs">
              Make sure Google Sheets is public: Share → Anyone with link can view<br/>
              Check browser console for detailed error logs
            </span>
          </div>
        )}
        {rows.length > 0 && (
          <div className="mt-2">
            <strong>Records:</strong>
            {rows.map((row, i) => (
              <div key={i} className="text-sm">
                • Room {row.room_id}: {row.start_date} → {row.end_date} ({row.status}) - {row.note}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 border border-gray-300"></div>
          <span><strong>T</strong> = Terisi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 border border-gray-300"></div>
          <span><strong>B</strong> = Booking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-gray-300"></div>
          <span>Kosong</span>
        </div>
      </div>

      <table className="border-collapse border border-gray-400">
        <thead>
          <tr>
            <th className="border p-2">Kamar</th>
            {Array.from({ length: daysInMonth }, (_, i) => (
              <th key={i} className="border p-1 text-xs">{i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }, (_, r) => (
            <tr key={r}>
              <td className="border p-2 font-bold">{r + 1}</td>
              {Array.from({ length: daysInMonth }, (_, d) => {
                const date = dayjs(`${year}-${month + 1}-${d + 1}`)

                const record = rows.find((av) => {
                  const start = dayjs(av.start_date)
                  const end = dayjs(av.end_date)
                  
                  const roomMatch = av.room_id === r + 1
                  const afterStart = date.isAfter(start) || date.isSame(start, "day")
                  const beforeEnd = date.isBefore(end) || date.isSame(end, "day")
                  
                  // Debug untuk room 1 dan beberapa hari pertama saja
                  if (r === 0 && d < 5 && rows.length > 0) {
                    console.log(`🔍 Room ${r + 1}, Day ${d + 1} (${date.format('YYYY-MM-DD')}):`, {
                      checkingRecord: `Room ${av.room_id}: ${av.start_date} to ${av.end_date} (${av.status})`,
                      roomMatch: `${av.room_id} === ${r + 1}? ${roomMatch}`,
                      dateRange: `${date.format('YYYY-MM-DD')} between ${start.format('YYYY-MM-DD')} and ${end.format('YYYY-MM-DD')}?`,
                      afterStart: `After/same start? ${afterStart}`,
                      beforeEnd: `Before/same end? ${beforeEnd}`,
                      finalMatch: roomMatch && afterStart && beforeEnd
                    })
                  }
                  
                  return roomMatch && afterStart && beforeEnd
                })

                // Tentukan warna background berdasarkan status
                let bg = "bg-white" // Default: putih (tidak ada data)
                let textColor = "text-gray-400"
                let symbol = ""
                
                if (record) {
                  if (record.status === "terisi") {
                    bg = "bg-red-500" // Merah untuk terisi
                    textColor = "text-white"
                    
                  } else if (record.status === "booking") {
                    bg = "bg-gray-400" // Abu-abu untuk booking
                    textColor = "text-white" 
                    
                  }
                }

                return (
                  <td
                    key={d}
                    className={`border text-center text-xs w-8 h-8 ${bg} ${textColor} font-semibold cursor-pointer hover:opacity-80`}
                    title={record ? `${record.note || 'No notes'} (${record.status})` : `Kosong - ${date.format('DD/MM/YYYY')}`}
                  >
                    {symbol}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}