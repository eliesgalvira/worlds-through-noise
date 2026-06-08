import { Link } from 'react-router-dom'
import { LogoMark } from '@/components/Logo.tsx'
import { siteRoutes } from '@/lib/routes.ts'

function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <LogoMark className="h-6 w-6" />
            <span className="font-serif text-sm font-semibold uppercase tracking-[0.06em]">
              Worlds Through Noise
            </span>
          </Link>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            An interactive textbook for detection, estimation, and filtering in
            audiovisual signal processing.
          </p>
        </div>

        <nav aria-label="Modules" className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Modules
          </p>
          <ul className="space-y-2 text-sm">
            {siteRoutes.map((route) => (
              <li key={route.path}>
                <Link
                  to={route.path}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {route.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Principle
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Start with the human problem. Manipulate the phenomenon. Reveal the
            mathematics only after intuition exists.
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>Worlds Through Noise. A public-science explainer.</span>
          <span>
            Made by <span className="font-medium text-foreground">Elies</span>
          </span>
        </div>
      </div>
    </footer>
  )
}

export { SiteFooter }
