import * as Schema from 'effect/Schema'

export class InvalidParameter extends Schema.TaggedErrorClass<InvalidParameter>()(
  'InvalidParameter',
  {
    parameter: Schema.String,
    message: Schema.String,
  },
) {}

export class UnknownLesson extends Schema.TaggedErrorClass<UnknownLesson>()(
  'UnknownLesson',
  {
    lessonId: Schema.String,
  },
) {}

export class UnknownProblem extends Schema.TaggedErrorClass<UnknownProblem>()(
  'UnknownProblem',
  {
    problemId: Schema.String,
  },
) {}

export class UnknownFormula extends Schema.TaggedErrorClass<UnknownFormula>()(
  'UnknownFormula',
  {
    formulaId: Schema.String,
  },
) {}

export class NumericalError extends Schema.TaggedErrorClass<NumericalError>()(
  'NumericalError',
  {
    operation: Schema.String,
    message: Schema.String,
  },
) {}

export class StorageUnavailable extends Schema.TaggedErrorClass<StorageUnavailable>()(
  'StorageUnavailable',
  {
    reason: Schema.String,
  },
) {}
