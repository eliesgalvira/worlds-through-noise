export type LessonRoute =
  | 'processes'
  | 'detection'
  | 'estimation'
  | 'wiener'
  | 'adaptive'

export type EquationRecord = {
  /** Plain-language meaning, always shown before the symbols. */
  readonly sentence: string
  readonly latex: string
  readonly caption?: string
}

export type LessonModuleRecord = {
  readonly id: string
  readonly title: string
  /** The question the module answers. */
  readonly question: string
  /** The language trap: what the symbols look like before you own the object. */
  readonly trap: string
  /** The better object: the concrete thing to hold in your mind. */
  readonly object: string
  /** The unseen action: the mental motion the figure asks you to perform. */
  readonly action: string
  /** Why the result becomes obvious once the action is performed. */
  readonly payoff: string
  readonly equations: ReadonlyArray<EquationRecord>
  readonly prediction: {
    readonly question: string
    readonly answer: string
  }
  /** Exam-style transfer prompt. */
  readonly transfer: string
  /** Where this move appears in real PSAVC exams. */
  readonly examRefs: ReadonlyArray<string>
}

export type ExamProblemRecord = {
  readonly exam: string
  readonly title: string
  readonly move: string
}

export type LessonRecord = {
  readonly route: LessonRoute
  readonly ordinal: string
  readonly title: string
  readonly thesis: string
  readonly intro: ReadonlyArray<string>
  readonly modules: ReadonlyArray<LessonModuleRecord>
  readonly examBank: ReadonlyArray<ExamProblemRecord>
}
