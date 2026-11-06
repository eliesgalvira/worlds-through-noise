import type { LessonRecord, LessonRoute } from '@/domain/types.ts'

export type RouteStatus = 'available' | 'coming-soon'

export type CourseLessonEntry = {
  readonly lesson: LessonRecord
  readonly navLabel: string
  readonly tagline: string
  readonly status: RouteStatus
}

export type SiteRoute = {
  readonly path: string
  readonly label: string
  readonly tagline: string
  readonly status: RouteStatus
}

export type CourseLink = {
  readonly route: LessonRoute
  readonly label: string
}

export type StudyStep = {
  readonly lead: string
  readonly body: string
}

export type CourseRecord = {
  readonly manifest: {
    readonly name: string
    readonly homeAriaLabel: string
    readonly slogan: string
    readonly eyebrow: string
  }
  readonly lessons: ReadonlyArray<CourseLessonEntry>
  readonly labels: {
    readonly allLessons: string
    readonly unit: string
    readonly lessonIndexTitle: string
    readonly assessmentEyebrow: string
    readonly assessmentTitle: string
    readonly assessmentDescription: string
    readonly backToIndex: string
    readonly nextPrefix: string
  }
  readonly home: {
    readonly intro: string
    readonly unifyingSentence: string
    readonly primaryCta: CourseLink
    readonly secondaryCta: CourseLink
    readonly studyTitle: string
    readonly studySteps: ReadonlyArray<StudyStep>
  }
  readonly footer: {
    readonly description: string
    readonly modulesLabel: string
    readonly principleLabel: string
    readonly principle: string
    readonly bottomLine: string
    readonly creditPrefix: string
    readonly creditName: string
  }
}
