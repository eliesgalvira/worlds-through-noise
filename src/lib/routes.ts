export type RouteStatus = 'available' | 'coming-soon'

export type SiteRoute = {
  readonly path: string
  readonly label: string
  readonly tagline: string
  readonly status: RouteStatus
}

export const siteRoutes: ReadonlyArray<SiteRoute> = [
  {
    path: '/processes',
    label: 'Random processes',
    tagline:
      'The machine behind the trace: ensembles, memory, $\\mathbf{R}_x$.',
    status: 'available',
  },
  {
    path: '/detection',
    label: 'Detection',
    tagline: 'Spend a false-alarm budget where evidence is strongest.',
    status: 'available',
  },
  {
    path: '/estimation',
    label: 'Estimation',
    tagline: 'Judge the machine by its cloud; curvature sets the floor.',
    status: 'available',
  },
  {
    path: '/wiener',
    label: 'Wiener filtering',
    tagline: 'Every optimal filter is the bottom of the same bowl.',
    status: 'available',
  },
  {
    path: '/adaptive',
    label: 'Adaptive filtering',
    tagline: 'Roll the ball down the bowl — then price the fog.',
    status: 'available',
  },
]
