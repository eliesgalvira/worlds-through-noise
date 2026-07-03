import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { SiteLayout } from '@/components/SiteLayout.tsx'
import { lessons } from '@/content/lessons.ts'
import { HomePage } from '@/pages/HomePage.tsx'
import { LessonPage } from '@/pages/LessonPage.tsx'
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
          {lessons.map((lesson) => (
            <Route
              key={lesson.route}
              path={`/${lesson.route}`}
              element={<LessonPage lesson={lesson} />}
            />
          ))}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
