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

/** A block of problem prose (`text`, inline math between $…$) or display math (`math`). */
export type ProblemBlock =
  | { readonly kind: 'text'; readonly content: string }
  | { readonly kind: 'math'; readonly content: string }

export type SolutionStepRecord = {
  /** The move being made, as a short imperative. */
  readonly title: string
  /** Why this move, in prose; supports inline $math$. */
  readonly body: string
  /** The derivation or result of the step, as display math. */
  readonly latex?: string
  /** Interpretation aside shown under the math. */
  readonly note?: string
}

export type ProblemPartRecord = {
  /** The part letter as printed on the exam: 'a', 'b', … */
  readonly label: string
  /** The question as asked; supports inline $math$. */
  readonly prompt: string
  /** Display math belonging to the prompt (a proposed estimator, a model). */
  readonly promptMath?: string
  readonly steps: ReadonlyArray<SolutionStepRecord>
  /** The final result, stated plainly. */
  readonly answer: {
    readonly sentence: string
    readonly latex?: string
  }
}

export type WorkedProblemRecord = {
  readonly id: string
  /** Where the problem comes from: exam sitting or collection number. */
  readonly source: string
  readonly title: string
  /** Why this problem earned its slot; supports inline $math$. */
  readonly why: string
  readonly statement: ReadonlyArray<ProblemBlock>
  readonly parts: ReadonlyArray<ProblemPartRecord>
  /** Cross-link when the same exam problem continues on another page. */
  readonly related?: {
    readonly text: string
    readonly href: string
  }
}

export type LessonRecord = {
  readonly route: LessonRoute
  readonly ordinal: string
  readonly title: string
  readonly thesis: string
  readonly intro: ReadonlyArray<string>
  readonly modules: ReadonlyArray<LessonModuleRecord>
  readonly workedProblems: ReadonlyArray<WorkedProblemRecord>
}
