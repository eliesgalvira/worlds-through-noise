export type LessonRoute = 'detection' | 'estimation' | 'filtering'

export type FormulaId =
  | 'likelihood-ratio'
  | 'log-likelihood-ratio'
  | 'neyman-pearson-decision'
  | 'false-alarm-probability'
  | 'detection-probability'
  | 'roc-point'
  | 'map-binary-decision'
  | 'ml-estimator'
  | 'bias'
  | 'variance'
  | 'mse'
  | 'cramer-rao-bound'
  | 'map-posterior'
  | 'mahalanobis-distance'
  | 'weighted-gaussian-mean'
  | 'poisson-ml'
  | 'gamma-ml-scale'

export type InteractiveKind =
  | 'likelihood'
  | 'threshold'
  | 'roc'
  | 'doppler'
  | 'packet'
  | 'estimator'
  | 'bias-variance'
  | 'prior-posterior'
  | 'mahalanobis'
  | 'pixel-background'

export type FormulaRecord = {
  readonly id: FormulaId
  readonly title: string
  readonly meaning: string
  readonly latex: string
  readonly caption: string
}

export type LessonModuleRecord = {
  readonly id: string
  readonly title: string
  readonly question: string
  readonly body: ReadonlyArray<string>
  readonly concepts: ReadonlyArray<string>
  readonly interactive: InteractiveKind
  readonly prediction: {
    readonly question: string
    readonly answer: string
  }
  readonly formulaIds: ReadonlyArray<FormulaId>
  readonly transferCheck: string
}

export type LessonRouteRecord = {
  readonly route: LessonRoute
  readonly title: string
  readonly thesis: string
  readonly summary: string
  readonly modules: ReadonlyArray<LessonModuleRecord>
  readonly finalChallenge: {
    readonly title: string
    readonly prompt: string
    readonly checks: ReadonlyArray<string>
  }
}

export type CaseStudyRecord = {
  readonly id: string
  readonly title: string
  readonly route: LessonRoute
  readonly concepts: ReadonlyArray<string>
  readonly story: string
  readonly mathematicalModel: ReadonlyArray<string>
  readonly tasks: ReadonlyArray<string>
  readonly solutionSketch: ReadonlyArray<string>
  readonly visualIdea: string
  readonly ranking: {
    readonly exemplifiesSubject: number
    readonly visualPotential: number
    readonly practicalRealLife: number
  }
}
