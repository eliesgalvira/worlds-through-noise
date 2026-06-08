import { LessonShell } from '@/components/LessonShell.tsx'
import {
  getCaseStudiesForRoute,
  getLessonRoute,
} from '@/domain/services/app-layer.ts'

const estimationLesson = getLessonRoute('estimation')
const estimationCaseStudies = getCaseStudiesForRoute('estimation')

function EstimationPage() {
  return (
    <LessonShell
      lesson={estimationLesson}
      caseStudies={estimationCaseStudies}
    />
  )
}

export { EstimationPage }
