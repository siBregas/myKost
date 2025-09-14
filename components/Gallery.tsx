"use client"

export default function Gallery({ roomId }: { roomId: string }) {
  // Sample images for demo - ganti dengan images dari Google Sheets jika diperlukan
  const sampleImages = [
    "/next.svg", // Ganti dengan URL gambar kamar yang sebenarnya
    "/vercel.svg", // Ganti dengan URL gambar kamar yang sebenarnya
  ]

  return (
    <div className="grid grid-cols-2 gap-2">
      {sampleImages.length > 0 ? (
        sampleImages.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Kamar ${roomId} - Gambar ${i + 1}`}
            className="rounded-xl shadow-md w-full h-32 object-cover bg-gray-100"
          />
        ))
      ) : (
        <div className="col-span-2 text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📷</div>
          <p>Belum ada foto untuk Kamar #{roomId}</p>
          <p className="text-sm">Tambahkan URL gambar di Google Sheets untuk menampilkan foto</p>
        </div>
      )}
    </div>
  )
}