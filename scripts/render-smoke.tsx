import * as React from 'react'
void React
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { lessons } from '@/content/lessons.ts'
import { LessonPage } from '@/pages/LessonPage.tsx'
import { HomePage } from '@/pages/HomePage.tsx'

const html = renderToString(
  <MemoryRouter>
    <HomePage />
  </MemoryRouter>,
)
console.log('home ok', html.length, 'chars')

for (const lesson of lessons) {
  const page = renderToString(
    <MemoryRouter>
      <LessonPage lesson={lesson} />
    </MemoryRouter>,
  )
  const figures = (page.match(/Perform the action/g) ?? []).length
  console.log(
    `${lesson.route} ok — ${page.length} chars, ${figures} figure shells`,
  )
}
