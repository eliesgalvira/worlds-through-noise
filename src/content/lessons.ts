import { adaptiveLesson } from '@/content/adaptive.ts'
import { detectionLesson } from '@/content/detection.ts'
import { estimationLesson } from '@/content/estimation.ts'
import { processesLesson } from '@/content/processes.ts'
import { wienerLesson } from '@/content/wiener.ts'
import type { LessonRecord, LessonRoute } from '@/domain/types.ts'

export const lessons: ReadonlyArray<LessonRecord> = [
  processesLesson,
  detectionLesson,
  estimationLesson,
  wienerLesson,
  adaptiveLesson,
]

export function lessonByRoute(route: LessonRoute): LessonRecord {
  const found = lessons.find((lesson) => lesson.route === route)
  if (found === undefined) {
    throw new Error(`Unknown lesson route: ${route}`)
  }
  return found
}
