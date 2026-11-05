import { useState } from "react"

export default function LayerPanel() {
  const [activeLayers, setActiveLayers] = useState<string[]>(["topography"])

  return (
    <aside style={{ background: "#101d2c", color: "white", padding: 20, borderRadius: 16 }}>
      <h2>Harita Katmanları</h2>
      <p>Aktif katman sayısı: {activeLayers.length}</p>
    </aside>
  )
}