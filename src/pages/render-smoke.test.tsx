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
      const figures = html.match(/<svg[^>]*role="img"/g) ?? []
      expect(figures.length).toBeGreaterThanOrEqual(lesson.modules.length)
      for (const module of lesson.modules) {
        expect(html).toContain(`id="${module.id}"`)
      }
      expect(html).toContain('id="exam-bank"')
    },
  )
})
