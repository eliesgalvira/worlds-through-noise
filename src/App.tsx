import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { SiteLayout } from '@/components/SiteLayout.tsx'
import { DetectionPage } from '@/pages/DetectionPage.tsx'
import { EstimationPage } from '@/pages/EstimationPage.tsx'
import { FilteringPage } from '@/pages/FilteringPage.tsx'
import { HomePage } from '@/pages/HomePage.tsx'
import { NotFoundPage } from '@/pages/NotFoundPage.tsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

function App() {
  return (
    <BrowserRouter>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:shadow-sm"
      >
        Skip to content
      </a>
      <ScrollToTop />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/detection" element={<DetectionPage />} />
          <Route path="/estimation" element={<EstimationPage />} />
          <Route path="/filtering" element={<FilteringPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
