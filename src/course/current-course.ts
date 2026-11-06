import { adaptiveLesson } from '@/content/adaptive.ts'
import { detectionLesson } from '@/content/detection.ts'
import { estimationLesson } from '@/content/estimation.ts'
import { processesLesson } from '@/content/processes.ts'
import { wienerLesson } from '@/content/wiener.ts'
import type { CourseRecord } from '@/course/types.ts'

export const currentCourse: CourseRecord = {
  manifest: {
    name: 'Worlds Through Noise',
    homeAriaLabel: 'Worlds Through Noise, home',
    slogan: 'See worlds through noise and hear noise through walls.',
    eyebrow:
      'An interactive companion to a course on statistical signal processing',
  },
  lessons: [
    {
      lesson: processesLesson,
      navLabel: 'Random processes',
      tagline:
        'The machine behind the trace: ensembles, memory, $\\mathbf{R}_x$.',
      status: 'available',
    },
    {
      lesson: detectionLesson,
      navLabel: 'Detection',
      tagline: 'Spend a false-alarm budget where evidence is strongest.',
      status: 'available',
    },
    {
      lesson: estimationLesson,
      navLabel: 'Estimation',
      tagline: 'Judge the machine by its cloud; curvature sets the floor.',
      status: 'available',
    },
    {
      lesson: wienerLesson,
      navLabel: 'Wiener filtering',
      tagline: 'Every optimal filter is the bottom of the same bowl.',
      status: 'available',
    },
    {
      lesson: adaptiveLesson,
      navLabel: 'Adaptive filtering',
      tagline: 'Roll the ball down the bowl — then price the fog.',
      status: 'available',
    },
  ],
  labels: {
    allLessons: 'All lessons',
    unit: 'Tema',
    lessonIndexTitle: 'Five temas',
    assessmentEyebrow: 'Exam workbook',
    assessmentTitle: 'Real problems, worked one move at a time',
    assessmentDescription:
      'These are real recent exam and collection problems, chosen because each one runs the moves this tema just taught. Read the statement, solve on paper, and only then walk the solution — each step is revealed one honest move at a time, so you can stop the moment you see where it goes.',
    backToIndex: 'Back to the index',
    nextPrefix: 'Next:',
  },
  home: {
    intro:
      'Every module here follows one rule: find the object the formula is secretly about, then perform the unseen action that makes the formula unavoidable. Slice an ensemble. Spend a false-alarm budget. Balance springs. Roll a ball down a bowl — first in daylight, then in fog.',
    unifyingSentence:
      'The course in one sentence: characterize the random machine, decide which machine dealt the data, estimate the dial the machine was set to, then build — and finally adapt — the filter that undoes it.',
    primaryCta: {
      route: 'processes',
      label: 'Start with random processes',
    },
    secondaryCta: {
      route: 'detection',
      label: 'Jump to detection',
    },
    studyTitle: 'How to study here',
    studySteps: [
      {
        lead: 'Read the opening paragraphs first.',
        body: 'Each module starts by naming where the official notation misleads and what to picture instead. If the confusion doesn’t sting, you may already own the idea — skip ahead.',
      },
      {
        lead: 'Perform the action with your hands.',
        body: 'Every readout in every figure is genuinely computed — the point is to predict it before you move the slider, and be wrong.',
      },
      {
        lead: 'Only then reveal the equation.',
        body: 'It should read like a description of what you just did.',
      },
      {
        lead: 'Close with the exam workbook.',
        body: 'Each tema ends with real recent exam problems. Solve on paper first; the solution then unfolds one move at a time, so you can stop revealing the moment you see the way.',
      },
    ],
  },
  footer: {
    description:
      'An interactive textbook for detection, estimation, and filtering in audiovisual signal processing.',
    modulesLabel: 'Modules',
    principleLabel: 'Principle',
    principle:
      'Start with the human problem. Manipulate the phenomenon. Reveal the mathematics only after intuition exists.',
    bottomLine: 'Worlds Through Noise. A public-science explainer.',
    creditPrefix: 'Made by',
    creditName: 'Elies',
  },
}
