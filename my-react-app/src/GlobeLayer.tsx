import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    Cesium: any
    CESIUM_BASE_URL: string
  }
}

export default function GlobeLayer() {
  const globeRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [status, setStatus] = useState("Dünya hazırlanıyor...")

  useEffect(() => {
    let cancelled = false

    const loadCesium = async () => {
      window.CESIUM_BASE_URL =
        "https://cesium.com/downloads/cesiumjs/releases/1.145/Build/Cesium/"

      if (!document.getElementById("cesium-css")) {
        const css = document.createElement("link")
        css.id = "cesium-css"
        css.rel = "stylesheet"
        css.href = window.CESIUM_BASE_URL + "Widgets/widgets.css"
        document.head.appendChild(css)
      }

      if (!window.Cesium) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script")
          script.src = window.CESIUM_BASE_URL + "Cesium.js"
          script.async = true
          script.onload = () => resolve()
          script.onerror = () => reject(new Error("Cesium yüklenemedi."))
          document.head.appendChild(script)
        })
      }

      if (cancelled || !globeRef.current) return

      const Cesium = window.Cesium

      const viewer = new Cesium.Viewer(globeRef.current, {
        baseLayer: false,
        baseLayerPicker: false,
        geocoder: false,
        animation: false,
        timeline: false,
        sceneModePicker: false,
        navigationHelpButton: false,
        fullscreenButton: false,
        infoBox: false,
        selectionIndicator: false,
        homeButton: false,
        creditContainer: document.createElement("div")
      })

      viewerRef.current = viewer

      const imageDate = new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000
      ).toISOString().slice(0, 10)

      const nasaImagery = new Cesium.UrlTemplateImageryProvider({
        url:
          "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/" +
          "MODIS_Terra_CorrectedReflectance_TrueColor/" +
          "default/" +
          imageDate +
          "/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg",
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        minimumLevel: 0,
        maximumLevel: 9,
        credit: "NASA GIBS / NASA Earthdata"
      })

      viewer.imageryLayers.addImageryProvider(nasaImagery)
      viewer.scene.globe.enableLighting = true

      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(20, 20, 23000000)
      })

      setStatus("NASA uydu görüntüsü aktif")
    }

    loadCesium().catch((error) => {
      console.error(error)
      if (!cancelled) {
        setStatus("Yükleme hatası: Sayfayı yenilemeyi deneyin.")
      }
    })

    return () => {
      cancelled = true
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [])

  const zoomIn = () => {
    viewerRef.current?.camera.zoomIn(1500000)
  }

  const zoomOut = () => {
    viewerRef.current?.camera.zoomOut(1500000)
  }

  const goHome = () => {
    viewerRef.current?.camera.flyTo({
      destination: window.Cesium.Cartesian3.fromDegrees(20, 20, 23000000),
      duration: 2
    })
  }

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      position: "relative",
      background: "#071321",
      overflow: "hidden"
    }}>
      <div ref={globeRef} style={{ width: "100%", height: "100%" }} />

      <div style={{
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 10,
        color: "white",
        background: "rgba(5,20,35,0.85)",
        padding: "14px 18px",
        borderRadius: 10
      }}>
        <div style={{ fontSize: 22, fontWeight: "bold" }}>TETRA BİLGİ</div>
        <div style={{ fontSize: 12, color: "#9fc7dc" }}>COĞRAFİ BİLGİ</div>
        <div style={{ fontSize: 11, marginTop: 8 }}>{status}</div>
      </div>

      <div style={{
        position: "absolute",
        right: 20,
        top: 20,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }}>
        <button onClick={zoomIn} style={buttonStyle}>+</button>
        <button onClick={zoomOut} style={buttonStyle}>−</button>
        <button onClick={goHome} style={buttonStyle}>Dünya</button>
      </div>

      <div style={{
        position: "absolute",
        bottom: 15,
        left: 15,
        color: "white",
        fontSize: 11,
        background: "rgba(5,20,35,0.8)",
        padding: 10,
        borderRadius: 6
      }}>
        Görüntü kaynağı: NASA GIBS / MODIS Terra
      </div>
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  background: "#123b55",
  color: "white",
  border: "1px solid #47718a",
  borderRadius: 8,
  padding: "12px 17px",
  fontSize: 18,
  cursor: "pointer"
}