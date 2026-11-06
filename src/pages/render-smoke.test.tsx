import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { lessons } from '@/content/lessons.ts'
import { HomePage } from '@/pages/HomePage.tsx'
import { LessonPage } from '@/pages/LessonPage.tsx'

describe('server render of every page', () => {
  it('renders the home page', () => {
    const html = renderToString(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )
    expect(html).toContain('Worlds Through Noise')
  })

  it.each(lessons)(
    'renders /$route with one figure per module and its workbook',
    (lesson) => {
      const html = renderToString(
        <MemoryRouter>
          <LessonPage lesson={lesson} />
        </MemoryRouter>,
      )
      for (const module of lesson.modules) {
        // The figure slot must hold a rendered FigureShell, not stay empty.
        expect(html).toMatch(
          new RegExp(`id="${module.id}-figure"[^>]*><section`),
        )
      }
      expect(html).toContain('id="exam-bank"')
    },
  )
})
