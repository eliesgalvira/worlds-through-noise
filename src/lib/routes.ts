export type RouteStatus = 'available' | 'coming-soon'

export type SiteRoute = {
  readonly path: string
  readonly label: string
  readonly tagline: string
  readonly status: RouteStatus
}

export const siteRoutes: ReadonlyArray<SiteRoute> = [
  {
    path: '/detection',
    label: 'Detection',
    tagline: 'Which hidden world produced the data?',
    status: 'available',
  },
  {
    path: '/estimation',
    label: 'Estimation',
    tagline: 'What hidden value made the data likely?',
    status: 'available',
  },
  {
    path: '/filtering',
    label: 'Filtering',
    tagline: 'How does the hidden state evolve through time?',
    status: 'coming-soon',
  },
]
