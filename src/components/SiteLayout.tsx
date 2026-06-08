import { Outlet } from 'react-router-dom'
import { SiteFooter } from '@/components/SiteFooter.tsx'
import { SiteHeader } from '@/components/SiteHeader.tsx'

function SiteLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

export { SiteLayout }
