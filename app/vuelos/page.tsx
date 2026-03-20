import { FlightRouteVisualizer } from "@/components/flight-route-visualizer"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function VuelosPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Volver al Puzzle Lineal
          </Link>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            Rutas de Vuelo BFS
          </h1>
          <p className="mt-3 text-lg text-muted-foreground text-balance">
            Visualizador del algoritmo BFS para encontrar la ruta mas corta entre ciudades
          </p>
        </header>

        <FlightRouteVisualizer />

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>Algoritmo BFS (Breadth-First Search) para busqueda de rutas aereas</p>
        </footer>
      </div>
    </main>
  )
}
