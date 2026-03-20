"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Plane, RefreshCw, MapPin } from "lucide-react"

// Definir ciudades y conexiones de vuelo
const CITIES = [
  "Ciudad de Mexico",
  "Guadalajara",
  "Monterrey",
  "Cancun",
  "Tijuana",
  "Puebla",
  "Merida",
  "Leon",
  "Chihuahua",
  "Queretaro",
  "Oaxaca",
  "Veracruz",
] as const

type City = (typeof CITIES)[number]

// Coordenadas aproximadas de las ciudades en el mapa (porcentaje x, y)
const CITY_POSITIONS: Record<City, { x: number; y: number }> = {
  "Ciudad de Mexico": { x: 52, y: 62 },
  "Guadalajara": { x: 38, y: 55 },
  "Monterrey": { x: 55, y: 32 },
  "Cancun": { x: 88, y: 55 },
  "Tijuana": { x: 8, y: 12 },
  "Puebla": { x: 56, y: 65 },
  "Merida": { x: 82, y: 52 },
  "Leon": { x: 42, y: 50 },
  "Chihuahua": { x: 32, y: 22 },
  "Queretaro": { x: 48, y: 52 },
  "Oaxaca": { x: 56, y: 75 },
  "Veracruz": { x: 62, y: 62 },
}

// Grafo de conexiones de vuelo (bidireccional)
const FLIGHT_CONNECTIONS: Record<City, City[]> = {
  "Ciudad de Mexico": ["Guadalajara", "Monterrey", "Cancun", "Tijuana", "Puebla", "Merida", "Oaxaca", "Veracruz"],
  "Guadalajara": ["Ciudad de Mexico", "Tijuana", "Monterrey", "Leon", "Cancun"],
  "Monterrey": ["Ciudad de Mexico", "Guadalajara", "Cancun", "Chihuahua", "Queretaro"],
  "Cancun": ["Ciudad de Mexico", "Guadalajara", "Monterrey", "Merida"],
  "Tijuana": ["Ciudad de Mexico", "Guadalajara", "Chihuahua"],
  "Puebla": ["Ciudad de Mexico", "Veracruz", "Oaxaca"],
  "Merida": ["Ciudad de Mexico", "Cancun", "Oaxaca"],
  "Leon": ["Guadalajara", "Queretaro"],
  "Chihuahua": ["Monterrey", "Tijuana"],
  "Queretaro": ["Monterrey", "Leon", "Ciudad de Mexico"],
  "Oaxaca": ["Ciudad de Mexico", "Puebla", "Merida"],
  "Veracruz": ["Ciudad de Mexico", "Puebla"],
}

interface FlightResult {
  exito: boolean
  ruta: City[]
  total_pasos: number
  ciudades_visitadas_total: number
  iteraciones: number
}

function findFlightRoute(origin: City, destination: City): FlightResult {
  if (origin === destination) {
    return {
      exito: true,
      ruta: [origin],
      total_pasos: 1,
      ciudades_visitadas_total: 1,
      iteraciones: 1,
    }
  }

  const visited = new Set<City>()
  const queue: City[] = [origin]
  visited.add(origin)
  const parent = new Map<City, City>()

  let iterations = 0
  let found = false

  while (queue.length > 0 && !found) {
    iterations++
    const current = queue.shift()!
    const neighbors = FLIGHT_CONNECTIONS[current] || []

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        parent.set(neighbor, current)
        queue.push(neighbor)

        if (neighbor === destination) {
          found = true
          break
        }
      }
    }
  }

  // Reconstruir ruta
  const route: City[] = []
  if (found) {
    let current: City | undefined = destination
    while (current) {
      route.unshift(current)
      current = parent.get(current)
    }
  }

  return {
    exito: found,
    ruta: route,
    total_pasos: route.length,
    ciudades_visitadas_total: visited.size,
    iteraciones: iterations,
  }
}

export function FlightRouteVisualizer() {
  const [origin, setOrigin] = useState<City>("Ciudad de Mexico")
  const [destination, setDestination] = useState<City>("Cancun")
  const [data, setData] = useState<FlightResult | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const solve = useCallback((from: City, to: City) => {
    setIsLoading(true)
    setIsPlaying(false)
    setCurrentStep(0)

    // Simular un pequeno delay para mostrar el estado de carga
    setTimeout(() => {
      const result = findFlightRoute(from, to)
      setData(result)
      setIsLoading(false)
    }, 300)
  }, [])

  useEffect(() => {
    solve(origin, destination)
  }, [])

  useEffect(() => {
    if (!isPlaying || !data) return
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= data.ruta.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isPlaying, data])

  const handleSolve = () => {
    if (origin === destination) {
      return
    }
    solve(origin, destination)
  }

  const reset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const togglePlay = () => {
    if (currentStep >= (data?.ruta.length ?? 0) - 1) setCurrentStep(0)
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="space-y-6">
      {/* Configuracion */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plane className="size-5" />
            Configurar Ruta de Vuelo
          </CardTitle>
          <CardDescription>Selecciona la ciudad de origen y destino para encontrar la ruta mas corta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="origin-select" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="size-4 text-chart-2" />
                Ciudad de Origen
              </label>
              <select
                id="origin-select"
                value={origin}
                onChange={(e) => setOrigin(e.target.value as City)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background"
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="destination-select" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="size-4 text-chart-1" />
                Ciudad de Destino
              </label>
              <select
                id="destination-select"
                value={destination}
                onChange={(e) => setDestination(e.target.value as City)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background"
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {origin === destination && (
            <p className="text-sm text-amber-600">Por favor selecciona ciudades diferentes para origen y destino.</p>
          )}
          <Button onClick={handleSolve} disabled={isLoading || origin === destination} className="gap-2">
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Buscando ruta..." : "Buscar Ruta"}
          </Button>
        </CardContent>
      </Card>

      {!data ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-pulse text-muted-foreground">Calculando ruta...</div>
        </div>
      ) : (
        <>
          {/* Visualizacion Principal */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Ciudad Actual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="size-5 text-chart-1" />
                  Ciudad Actual
                </CardTitle>
                <CardDescription>
                  Escala {currentStep + 1} de {data.ruta.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6">
                  <div
                    className={`
                      flex items-center justify-center
                      w-full max-w-xs h-24
                      text-xl sm:text-2xl font-bold rounded-xl
                      transition-all duration-300
                      ${
                        data.ruta[currentStep] === destination
                          ? "bg-chart-2 text-foreground shadow-lg scale-105"
                          : data.ruta[currentStep] === origin
                            ? "bg-chart-1/80 text-foreground"
                            : "bg-muted text-foreground"
                      }
                    `}
                  >
                    <MapPin className="size-6 mr-2" />
                    {data.ruta[currentStep]}
                  </div>
                  {currentStep > 0 && currentStep < data.ruta.length && (
                    <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
                      <span>Vuelo desde</span>
                      <Badge variant="outline">{data.ruta[currentStep - 1]}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resumen de Ruta */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Ruta</CardTitle>
                <CardDescription>Origen y destino del viaje</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4 py-4">
                  <div className="text-center flex-1">
                    <div className="w-16 h-16 mx-auto rounded-full bg-chart-2/20 border-2 border-chart-2 flex items-center justify-center">
                      <MapPin className="size-7 text-chart-2" />
                    </div>
                    <p className="mt-2 font-semibold text-sm">{origin}</p>
                    <p className="text-xs text-muted-foreground">Origen</p>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <div className="w-8 h-0.5 bg-border" />
                    <Plane className="size-5" />
                    <div className="w-8 h-0.5 bg-border" />
                  </div>
                  <div className="text-center flex-1">
                    <div className="w-16 h-16 mx-auto rounded-full bg-chart-1/20 border-2 border-chart-1 flex items-center justify-center">
                      <MapPin className="size-7 text-chart-1" />
                    </div>
                    <p className="mt-2 font-semibold text-sm">{destination}</p>
                    <p className="text-xs text-muted-foreground">Destino</p>
                  </div>
                </div>
                {data.exito ? (
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    {data.ruta.length - 1} {data.ruta.length - 1 === 1 ? "vuelo" : "vuelos"} necesarios
                  </p>
                ) : (
                  <p className="text-center text-sm text-destructive mt-2">No se encontro ruta disponible</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Controles */}
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
                  <span className="sr-only">Escala anterior</span>
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
                  <span className="sr-only">Siguiente escala</span>
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
                    aria-label={`Ir a escala ${idx + 1}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ruta Completa */}
          <Card>
            <CardHeader>
              <CardTitle>Ruta de Vuelo Completa</CardTitle>
              <CardDescription>Escalas encontradas por el algoritmo BFS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2">
                {data.ruta.map((city, idx) => (
                  <div key={idx} className="flex items-center">
                    <button
                      onClick={() => {
                        setCurrentStep(idx)
                        setIsPlaying(false)
                      }}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${
                          idx === currentStep
                            ? "bg-primary text-primary-foreground shadow-md scale-105"
                            : idx < currentStep
                              ? "bg-chart-2/20 text-foreground"
                              : "bg-secondary text-secondary-foreground"
                        }
                      `}
                    >
                      <span className="text-xs opacity-60">{idx + 1}.</span>
                      {city}
                    </button>
                    {idx < data.ruta.length - 1 && <Plane className="size-4 mx-2 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                  <div className="text-sm text-muted-foreground">Escalas totales</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <div className="text-3xl font-bold text-chart-2">{data.ruta.length - 1}</div>
                  <div className="text-sm text-muted-foreground">Vuelos necesarios</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <div className="text-3xl font-bold text-chart-3">{data.ciudades_visitadas_total}</div>
                  <div className="text-sm text-muted-foreground">Ciudades exploradas</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <Badge variant={data.exito ? "default" : "destructive"} className="text-lg px-4 py-1">
                    {data.exito ? "Ruta Encontrada" : "Sin Ruta"}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">Resultado</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mapa Visual de Mexico */}
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Ruta</CardTitle>
              <CardDescription>Visualizacion geografica del recorrido de vuelo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full aspect-[16/10] bg-gradient-to-b from-sky-100 to-sky-50 dark:from-sky-950 dark:to-sky-900 rounded-xl border overflow-hidden">
                {/* Fondo del mapa con forma aproximada de Mexico */}
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="xMidYMid slice"
                >
                  {/* Conexiones de vuelo como lineas */}
                  {CITIES.map((city) =>
                    FLIGHT_CONNECTIONS[city].map((connectedCity) => {
                      const from = CITY_POSITIONS[city]
                      const to = CITY_POSITIONS[connectedCity]
                      const isInRoute =
                        data.ruta.includes(city) &&
                        data.ruta.includes(connectedCity) &&
                        Math.abs(data.ruta.indexOf(city) - data.ruta.indexOf(connectedCity)) === 1
                      const isCurrentSegment =
                        isInRoute &&
                        ((data.ruta[currentStep] === city && data.ruta[currentStep - 1] === connectedCity) ||
                          (data.ruta[currentStep] === connectedCity && data.ruta[currentStep - 1] === city))

                      return (
                        <line
                          key={`${city}-${connectedCity}`}
                          x1={from.x}
                          y1={from.y}
                          x2={to.x}
                          y2={to.y}
                          className={`transition-all duration-500 ${
                            isCurrentSegment
                              ? "stroke-primary stroke-[0.8]"
                              : isInRoute
                                ? "stroke-chart-2 stroke-[0.5]"
                                : "stroke-muted-foreground/20 stroke-[0.15]"
                          }`}
                          strokeDasharray={isInRoute ? "none" : "1,1"}
                        />
                      )
                    })
                  )}

                  {/* Ciudades como puntos */}
                  {CITIES.map((city) => {
                    const pos = CITY_POSITIONS[city]
                    const isInRoute = data.ruta.includes(city)
                    const isCurrent = data.ruta[currentStep] === city
                    const isOrigin = city === origin
                    const isDestination = city === destination
                    const routeIndex = data.ruta.indexOf(city)
                    const isVisited = routeIndex !== -1 && routeIndex <= currentStep

                    return (
                      <g key={city}>
                        {/* Circulo de fondo para ciudades importantes */}
                        {(isOrigin || isDestination || isCurrent) && (
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={isCurrent ? 4 : 3}
                            className={`transition-all duration-300 ${
                              isCurrent
                                ? "fill-primary/30 animate-pulse"
                                : isOrigin
                                  ? "fill-chart-2/30"
                                  : "fill-chart-1/30"
                            }`}
                          />
                        )}
                        {/* Punto de la ciudad */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isCurrent ? 2.5 : isInRoute ? 2 : 1.5}
                          className={`transition-all duration-300 ${
                            isCurrent
                              ? "fill-primary"
                              : isVisited
                                ? "fill-chart-2"
                                : isInRoute
                                  ? "fill-chart-3"
                                  : "fill-muted-foreground/50"
                          }`}
                        />
                      </g>
                    )
                  })}

                  {/* Avion animado en la ruta actual */}
                  {currentStep > 0 && (
                    <g
                      className="transition-all duration-500"
                      transform={`translate(${CITY_POSITIONS[data.ruta[currentStep]].x}, ${CITY_POSITIONS[data.ruta[currentStep]].y})`}
                    >
                      <circle r="3" className="fill-primary/20" />
                      <text
                        x="0"
                        y="0.5"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-[3px] fill-primary"
                      >
                        ✈
                      </text>
                    </g>
                  )}
                </svg>

                {/* Etiquetas de ciudades */}
                <div className="absolute inset-0">
                  {CITIES.map((city) => {
                    const pos = CITY_POSITIONS[city]
                    const isInRoute = data.ruta.includes(city)
                    const isCurrent = data.ruta[currentStep] === city
                    const isOrigin = city === origin
                    const isDestination = city === destination

                    return (
                      <div
                        key={`label-${city}`}
                        className="absolute transform -translate-x-1/2 transition-all duration-300"
                        style={{
                          left: `${pos.x}%`,
                          top: `${pos.y + 4}%`,
                        }}
                      >
                        <span
                          className={`text-[9px] sm:text-[10px] font-medium whitespace-nowrap px-1 py-0.5 rounded ${
                            isCurrent
                              ? "bg-primary text-primary-foreground"
                              : isOrigin
                                ? "bg-chart-2 text-foreground"
                                : isDestination
                                  ? "bg-chart-1 text-foreground"
                                  : isInRoute
                                    ? "bg-chart-3/80 text-foreground"
                                    : "text-muted-foreground"
                          }`}
                        >
                          {city.length > 12 ? city.substring(0, 10) + "..." : city}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Leyenda */}
                <div className="absolute bottom-2 left-2 flex flex-wrap gap-2 text-[10px]">
                  <div className="flex items-center gap-1 bg-background/80 px-2 py-1 rounded">
                    <div className="w-2 h-2 rounded-full bg-chart-2" />
                    <span>Origen</span>
                  </div>
                  <div className="flex items-center gap-1 bg-background/80 px-2 py-1 rounded">
                    <div className="w-2 h-2 rounded-full bg-chart-1" />
                    <span>Destino</span>
                  </div>
                  <div className="flex items-center gap-1 bg-background/80 px-2 py-1 rounded">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Actual</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mapa de Conexiones */}
          <Card>
            <CardHeader>
              <CardTitle>Conexiones de Vuelo Disponibles</CardTitle>
              <CardDescription>Red de rutas aereas entre ciudades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {CITIES.map((city) => (
                  <div
                    key={city}
                    className={`p-3 rounded-lg border transition-colors ${
                      data.ruta.includes(city) ? "bg-chart-2/10 border-chart-2" : "bg-muted/50"
                    }`}
                  >
                    <div className="font-medium text-sm flex items-center gap-2">
                      <MapPin
                        className={`size-4 ${data.ruta.includes(city) ? "text-chart-2" : "text-muted-foreground"}`}
                      />
                      {city}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Conecta con: {FLIGHT_CONNECTIONS[city].length} ciudades
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Explicacion */}
          <Card>
            <CardHeader>
              <CardTitle>¿Como funciona BFS para rutas de vuelo?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Busqueda en Amplitud (BFS)</strong> es ideal para encontrar la ruta
                mas corta (menor numero de escalas) entre dos ciudades. El algoritmo explora todas las ciudades
                conectadas directamente antes de pasar a las conexiones indirectas.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="p-3 rounded-lg bg-muted">
                  <div className="font-medium text-foreground mb-1">1. Inicio</div>
                  <div className="text-sm">Comienza desde la ciudad de origen</div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="font-medium text-foreground mb-1">2. Expansion</div>
                  <div className="text-sm">Explora todas las ciudades conectadas directamente</div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="font-medium text-foreground mb-1">3. Resultado</div>
                  <div className="text-sm">Garantiza la ruta con menos escalas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
