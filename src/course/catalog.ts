import { currentCourse } from '@/course/current-course.ts'
import type { CourseLessonEntry, SiteRoute } from '@/course/types.ts'
import type { LessonRecord, LessonRoute } from '@/domain/types.ts'

export const courseLessonEntries: ReadonlyArray<CourseLessonEntry> =
  currentCourse.lessons

export const lessons: ReadonlyArray<LessonRecord> = courseLessonEntries.map(
  (entry) => entry.lesson,
)

export const siteRoutes: ReadonlyArray<SiteRoute> = courseLessonEntries.map(
  (entry) => ({
    path: `/${entry.lesson.route}`,
    label: entry.navLabel,
    tagline: entry.tagline,
    status: entry.status,
  }),
)

export function lessonByRoute(route: LessonRoute): LessonRecord {
  const found = courseLessonEntries.find(
    (entry) => entry.lesson.route === route,
  )
  if (found === undefined) {
    throw new Error(`Unknown lesson route: ${route}`)
  }
  return found.lesson
}

export function entryByRoute(route: LessonRoute): CourseLessonEntry {
  const found = courseLessonEntries.find(
    (entry) => entry.lesson.route === route,
  )
  if (found === undefined) {
    throw new Error(`Unknown lesson route: ${route}`)
  }
  return found
}

export function lessonNeighbors(route: LessonRoute): {
  readonly previous?: LessonRecord
  readonly next?: LessonRecord
} {
  const index = courseLessonEntries.findIndex(
    (entry) => entry.lesson.route === route,
  )
  const previous =
    index > 0 ? courseLessonEntries[index - 1]?.lesson : undefined
  const next = index >= 0 ? courseLessonEntries[index + 1]?.lesson : undefined
  return {
    ...(previous !== undefined ? { previous } : {}),
    ...(next !== undefined ? { next } : {}),
  }
}
