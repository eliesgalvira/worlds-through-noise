import { useEffect, useId, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/Logo.tsx'
import { siteRoutes } from '@/lib/routes.ts'
import { cn } from '@/lib/utils.ts'

function SoonTag() {
  return (
    <span className="rounded-sm bg-muted px-1 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      Soon
    </span>
  )
}

function SiteHeader() {
  const [open, setOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Worlds Through Noise, home"
        >
          <Logo className="text-base sm:text-lg" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {siteRoutes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                )
              }
            >
              <span className="flex items-center gap-1.5">
                {route.label}
                {route.status === 'coming-soon' ? <SoonTag /> : null}
              </span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => {
            setOpen((prev) => !prev)
          }}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls={menuId}
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {open ? (
        <nav
          id={menuId}
          aria-label="Primary"
          className="border-t border-border bg-background/95 backdrop-blur md:hidden"
        >
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            {siteRoutes.map((route) => (
              <li key={route.path}>
                <NavLink
                  to={route.path}
                  onClick={() => {
                    setOpen(false)
                  }}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between rounded-md px-3 py-3 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                    )
                  }
                >
                  <span className="flex flex-col">
                    <span>{route.label}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {route.tagline}
                    </span>
                  </span>
                  {route.status === 'coming-soon' ? <SoonTag /> : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  )
}

export { SiteHeader }
