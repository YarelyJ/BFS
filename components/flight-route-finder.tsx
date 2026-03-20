"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Plane, MapPin } from "lucide-react"

// Ciudades de México con conexiones de vuelos
const CIUDADES_MEXICO: Record<string, string[]> = {
  "Ciudad de México": ["Guadalajara", "Monterrey", "Cancún", "Tijuana", "Mérida", "Oaxaca"],
  "Guadalajara": ["Ciudad de México", "Monterrey", "Tijuana", "Puerto Vallarta", "Los Cabos"],
  "Monterrey": ["Ciudad de México", "Guadalajara", "Cancún", "Tijuana", "Tampico"],
  "Cancún": ["Ciudad de México", "Monterrey", "Mérida", "Oaxaca", "Villahermosa"],
  "Tijuana": ["Ciudad de México", "Guadalajara", "Monterrey", "Los Cabos", "Hermosillo"],
  "Mérida": ["Ciudad de México", "Cancún", "Villahermosa", "Oaxaca"],
  "Oaxaca": ["Ciudad de México", "Cancún", "Mérida", "Villahermosa"],
  "Puerto Vallarta": ["Guadalajara", "Los Cabos", "Hermosillo"],
  "Los Cabos": ["Guadalajara", "Tijuana", "Puerto Vallarta", "Hermosillo"],
  "Tampico": ["Monterrey", "Villahermosa", "Veracruz"],
  "Villahermosa": ["Cancún", "Mérida", "Oaxaca", "Tampico", "Veracruz"],
  "Hermosillo": ["Tijuana", "Puerto Vallarta", "Los Cabos", "Chihuahua"],
  "Chihuahua": ["Hermosillo", "Monterrey", "Durango"],
  "Durango": ["Chihuahua", "Guadalajara", "Mazatlán"],
  "Mazatlán": ["Durango", "Guadalajara", "Los Cabos"],
  "Veracruz": ["Tampico", "Villahermosa", "Ciudad de México"],
}

const CIUDADES_LISTA = Object.keys(CIUDADES_MEXICO).sort()

interface RouteResult {
  exito: boolean
  ruta: string[]
  total_pasos: number
  nodos_visitados_total: number
  iteraciones: number
}

function buscarRutaBFS(origen: string, destino: string): RouteResult {
  if (origen === destino) {
    return {
      exito: true,
      ruta: [origen],
      total_pasos: 1,
      nodos_visitados_total: 1,
      iteraciones: 1,
    }
  }

  const visitados = new Set<string>()
  const cola: { ciudad: string; ruta: string[] }[] = [{ ciudad: origen, ruta: [origen] }]
  visitados.add(origen)
  let iteraciones = 0

  while (cola.length > 0) {
    iteraciones++
    const { ciudad, ruta } = cola.shift()!

    const conexiones = CIUDADES_MEXICO[ciudad] || []
    for (const vecino of conexiones) {
      if (!visitados.has(vecino)) {
        const nuevaRuta = [...ruta, vecino]
        if (vecino === destino) {
          return {
            exito: true,
            ruta: nuevaRuta,
            total_pasos: nuevaRuta.length,
            nodos_visitados_total: visitados.size + 1,
            iteraciones,
          }
        }
        visitados.add(vecino)
        cola.push({ ciudad: vecino, ruta: nuevaRuta })
      }
    }
  }

  return {
    exito: false,
    ruta: [],
    total_pasos: 0,
    nodos_visitados_total: visitados.size,
    iteraciones,
  }
}

export function FlightRouteFinder() {
  const [origen, setOrigen] = useState("Ciudad de México")
  const [destino, setDestino] = useState("Cancún")
  const [data, setData] = useState<RouteResult | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const buscarRuta = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
    const resultado = buscarRutaBFS(origen, destino)
    setData(resultado)
  }, [origen, destino])

  useEffect(() => {
    buscarRuta()
  }, [buscarRuta])

  useEffect(() => {
    if (!isPlaying || !data || !data.exito) return
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= data.ruta.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 1200)
    return () => clearInterval(interval)
  }, [isPlaying, data])

  const reset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const togglePlay = () => {
    if (!data?.exito) return
    if (currentStep >= (data?.ruta.length ?? 0) - 1) setCurrentStep(0)
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="space-y-6">
      {/* Selector de ciudades */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plane className="size-5" />
            Buscar Ruta de Vuelo
          </CardTitle>
          <CardDescription>
            Selecciona la ciudad de origen y destino para encontrar la ruta mas corta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="origen" className="text-sm font-medium">
                Ciudad de Origen
              </label>
              <select
                id="origen"
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background"
              >
                {CIUDADES_LISTA.map((ciudad) => (
                  <option key={ciudad} value={ciudad}>
                    {ciudad}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="destino" className="text-sm font-medium">
                Ciudad de Destino
              </label>
              <select
                id="destino"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background"
              >
                {CIUDADES_LISTA.map((ciudad) => (
                  <option key={ciudad} value={ciudad}>
                    {ciudad}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={buscarRuta} className="gap-2">
            <Plane className="size-4" />
            Buscar Ruta
          </Button>
        </CardContent>
      </Card>

      {data && (
        <>
          {/* Visualizacion de la ruta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5 text-chart-1" />
                Ruta Encontrada
              </CardTitle>
              <CardDescription>
                {data.exito
                  ? `${data.ruta.length} ciudad${data.ruta.length > 1 ? "es" : ""} en la ruta - Paso ${currentStep + 1} de ${data.ruta.length}`
                  : "No se encontro una ruta disponible"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.exito ? (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {data.ruta.map((ciudad, idx) => (
                    <div key={idx} className="flex items-center">
                      <div
                        className={`
                          px-4 py-3 rounded-lg text-center transition-all duration-300
                          ${idx === currentStep
                            ? "bg-chart-1 text-white shadow-lg scale-105"
                            : idx < currentStep
                            ? "bg-chart-2 text-white"
                            : "bg-muted text-muted-foreground"
                          }
                        `}
                      >
                        <div className="font-semibold text-sm">{ciudad}</div>
                        <div className="text-xs opacity-75">
                          {idx === 0 ? "Origen" : idx === data.ruta.length - 1 ? "Destino" : `Escala ${idx}`}
                        </div>
                      </div>
                      {idx < data.ruta.length - 1 && (
                        <Plane
                          className={`size-5 mx-2 transition-colors ${
                            idx < currentStep ? "text-chart-2" : "text-muted-foreground"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Plane className="size-12 mx-auto mb-4 opacity-50" />
                  <p>No hay vuelos disponibles entre estas ciudades</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Controles */}
          {data.exito && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft className="size-4" />
                    <span className="sr-only">Paso anterior</span>
                  </Button>
                  <Button variant="outline" size="icon" onClick={reset}>
                    <RotateCcw className="size-4" />
                    <span className="sr-only">Reiniciar</span>
                  </Button>
                  <Button size="lg" onClick={togglePlay} className="px-8">
                    {isPlaying ? (
                      <>
                        <Pause className="size-4 mr-2" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="size-4 mr-2" />
                        Reproducir
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentStep(Math.min(data.ruta.length - 1, currentStep + 1))}
                    disabled={currentStep === data.ruta.length - 1}
                  >
                    <ChevronRight className="size-4" />
                    <span className="sr-only">Paso siguiente</span>
                  </Button>
                </div>
                <div className="mt-6 flex gap-1">
                  {data.ruta.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentStep(idx)
                        setIsPlaying(false)
                      }}
                      className={`
                        flex-1 h-2 rounded-full transition-colors
                        ${idx <= currentStep ? "bg-primary" : "bg-muted"}
                        ${idx === currentStep ? "ring-2 ring-primary ring-offset-2" : ""}
                      `}
                      aria-label={`Ir al paso ${idx + 1}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estadisticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estadisticas del Algoritmo</CardTitle>
              <CardDescription>Metricas de rendimiento de la busqueda BFS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <div className="text-3xl font-bold text-chart-1">{data.total_pasos}</div>
                  <div className="text-sm text-muted-foreground">Ciudades en ruta</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <div className="text-3xl font-bold text-chart-2">{data.nodos_visitados_total}</div>
                  <div className="text-sm text-muted-foreground">Ciudades visitadas</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <div className="text-3xl font-bold text-chart-3">{data.iteraciones}</div>
                  <div className="text-sm text-muted-foreground">Iteraciones</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <Badge variant={data.exito ? "default" : "destructive"} className="text-lg px-4 py-1">
                    {data.exito ? "Ruta encontrada" : "Sin ruta"}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">Resultado</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mapa de conexiones */}
          <Card>
            <CardHeader>
              <CardTitle>Conexiones desde {data.ruta[currentStep]}</CardTitle>
              <CardDescription>Vuelos directos disponibles desde la ciudad actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(CIUDADES_MEXICO[data.ruta[currentStep]] || []).map((ciudad) => (
                  <Badge
                    key={ciudad}
                    variant={data.ruta.includes(ciudad) ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {ciudad}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Explicacion del algoritmo */}
          <Card>
            <CardHeader>
              <CardTitle>Como funciona BFS para rutas de vuelo?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Busqueda en Amplitud (BFS)</strong> explora las ciudades
                nivel por nivel, encontrando siempre la ruta con el menor numero de escalas posibles.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="p-3 rounded-lg bg-muted">
                  <div className="font-medium text-foreground mb-1">Paso 1</div>
                  <div className="text-sm">Empezar en la ciudad origen</div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="font-medium text-foreground mb-1">Paso 2</div>
                  <div className="text-sm">Explorar todos los vuelos directos</div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="font-medium text-foreground mb-1">Paso 3</div>
                  <div className="text-sm">Repetir hasta encontrar el destino</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
