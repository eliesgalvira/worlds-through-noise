import { ArrowRight, Gauge, RadioTower, Signal, Waves } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'

function App() {
  const routes = [
    {
      title: 'Detection',
      body: 'Choose which hidden world produced the observation.',
      href: '/detection',
    },
    {
      title: 'Estimation',
      body: 'Infer the hidden value that made the data likely.',
      href: '/estimation',
    },
    {
      title: 'Filtering',
      body: 'Reserve the time-evolving hidden state for the next route.',
      href: '/filtering',
    },
  ]

  return (
    <main className="min-h-svh px-6 py-10 text-foreground">
      <section className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground">
            <Signal className="h-4 w-4 text-primary" aria-hidden="true" />
            Worlds Through Noise
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-normal text-foreground md:text-6xl">
              Learn to infer hidden causes from corrupted traces.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              An interactive signal-processing textbook for detection,
              estimation, and eventually filtering.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="/detection">
                Start detection
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
            <Button variant="secondary" asChild>
              <a href="/estimation">Open estimation</a>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Inference frame
              </p>
              <h2 className="text-2xl font-semibold">
                Hidden world to decision
              </h2>
            </div>
            <RadioTower className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div className="grid gap-3">
            <div className="rounded-md border bg-background p-4">
              <div className="flex items-center gap-3">
                <Waves className="h-5 w-5 text-chart-3" aria-hidden="true" />
                <span className="font-medium">Hidden cause</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                H0, H1, or a continuous parameter that the sensor cannot see
                directly.
              </p>
            </div>
            <div className="rounded-md border bg-background p-4">
              <div className="flex items-center gap-3">
                <Gauge className="h-5 w-5 text-chart-2" aria-hidden="true" />
                <span className="font-medium">Noisy observation</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                A waveform, packet delay, image pixel, or measurement cloud.
              </p>
            </div>
            <div className="rounded-md border bg-background p-4">
              <div className="flex items-center gap-3">
                <Signal className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="font-medium">Inference</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Choose the world, estimate the value, then predict how the rule
                behaves.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-3">
        {routes.map((route) => (
          <a
            key={route.href}
            href={route.href}
            className="rounded-lg border bg-card p-5 text-left transition hover:border-primary hover:bg-card/80"
          >
            <h2 className="text-xl font-semibold">{route.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {route.body}
            </p>
          </a>
        ))}
      </section>
    </main>
  )
}

export default App
