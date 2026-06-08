import { LessonShell } from '@/components/LessonShell.tsx'
import {
  getCaseStudiesForRoute,
  getLessonRoute,
} from '@/domain/services/app-layer.ts'

const detectionLesson = getLessonRoute('detection')
const detectionCaseStudies = getCaseStudiesForRoute('detection')

function DetectionPage() {
  return (
    <LessonShell lesson={detectionLesson} caseStudies={detectionCaseStudies} />
  )
}

export { DetectionPage }
