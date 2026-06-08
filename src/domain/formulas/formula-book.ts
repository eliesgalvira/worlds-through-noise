import type { FormulaRecord } from '@/domain/types.ts'

export const formulaRecords: ReadonlyArray<FormulaRecord> = [
  {
    id: 'likelihood-ratio',
    title: 'Likelihood Ratio',
    meaning:
      'Compare how well the same observation is explained by two hidden worlds.',
    latex: '\\Lambda(x)=\\frac{f(x\\mid H_1)}{f(x\\mid H_0)}',
    caption:
      'Large values favor H1; small values favor H0. The statistic is evidence, not certainty.',
  },
  {
    id: 'log-likelihood-ratio',
    title: 'Log Likelihood Ratio',
    meaning:
      'Add evidence on a log scale so repeated samples become a sum instead of a product.',
    latex: '\\log\\Lambda(x)=\\log f(x\\mid H_1)-\\log f(x\\mid H_0)',
    caption:
      'The log form is numerically stable and turns independent evidence into a running score.',
  },
  {
    id: 'neyman-pearson-decision',
    title: 'Neyman-Pearson Decision',
    meaning:
      'Spend a fixed false-alarm budget where it buys the most detection probability.',
    latex: '\\Lambda(x)\\mathop{\\gtrless}_{H_0}^{H_1}\\eta',
    caption:
      'The threshold eta is chosen so the false-alarm probability meets the constraint.',
  },
  {
    id: 'false-alarm-probability',
    title: 'False Alarm Probability',
    meaning: 'Measure how often H0 data is mistakenly called H1.',
    latex: 'P_{FA}=P(\\text{decide }H_1\\mid H_0)',
    caption:
      'False alarms are not generic errors. They happen under a specific hidden world.',
  },
  {
    id: 'detection-probability',
    title: 'Detection Probability',
    meaning: 'Measure how often H1 data is correctly called H1.',
    latex: 'P_D=P(\\text{decide }H_1\\mid H_1)',
    caption: 'A detector can raise PD by accepting more false alarms.',
  },
  {
    id: 'roc-point',
    title: 'ROC Point',
    meaning:
      'One threshold produces one false-alarm probability and one detection probability.',
    latex: '\\text{ROC}(\\eta)=\\big(P_{FA}(\\eta),P_D(\\eta)\\big)',
    caption:
      'Sweeping eta traces the curve. A single operating point is a policy choice.',
  },
  {
    id: 'map-binary-decision',
    title: 'MAP Binary Decision',
    meaning: 'Choose the hidden world with the larger posterior probability.',
    latex:
      'f(x\\mid H_1)P(H_1)\\mathop{\\gtrless}_{H_0}^{H_1}f(x\\mid H_0)P(H_0)',
    caption:
      'MAP uses priors. Bayes risk also uses the costs of the two mistakes.',
  },
  {
    id: 'ml-estimator',
    title: 'Maximum Likelihood Estimator',
    meaning:
      'Choose the parameter value that makes the observed data least surprising.',
    latex: '\\hat\\theta_{ML}=\\arg\\max_\\theta f(x;\\theta)',
    caption:
      'ML treats the data as fixed and searches over possible hidden parameter values.',
  },
  {
    id: 'bias',
    title: 'Bias',
    meaning:
      'Measure the average offset between the estimator and the true parameter.',
    latex: '\\operatorname{Bias}(\\hat\\theta)=E[\\hat\\theta]-\\theta',
    caption:
      'Bias is about repeated use of the estimator, not one unlucky sample.',
  },
  {
    id: 'variance',
    title: 'Variance',
    meaning:
      'Measure how much the estimator wobbles across repeated experiments.',
    latex:
      '\\operatorname{Var}(\\hat\\theta)=E[(\\hat\\theta-E[\\hat\\theta])^2]',
    caption: 'More independent evidence usually reduces estimator variance.',
  },
  {
    id: 'mse',
    title: 'Mean Squared Error',
    meaning:
      'Split expected squared error into systematic offset and random wobble.',
    latex:
      '\\operatorname{MSE}(\\hat\\theta)=\\operatorname{Bias}(\\hat\\theta)^2+\\operatorname{Var}(\\hat\\theta)',
    caption:
      'A biased estimator can still win when the variance reduction is large enough.',
  },
  {
    id: 'cramer-rao-bound',
    title: 'Cramer-Rao Bound',
    meaning:
      'Set a lower floor on the variance of any unbiased estimator under regular conditions.',
    latex: '\\operatorname{Var}(\\hat\\theta)\\ge \\frac{1}{I(\\theta)}',
    caption:
      'The bound is not an estimator. It is a benchmark for how much information the data contains.',
  },
  {
    id: 'map-posterior',
    title: 'Posterior Proportionality',
    meaning:
      'Combine what the data says with what the prior believed before the data.',
    latex: 'p(\\theta\\mid x)\\propto f(x\\mid\\theta)p(\\theta)',
    caption:
      'With large sample counts, the likelihood often dominates a weak prior.',
  },
  {
    id: 'mahalanobis-distance',
    title: 'Mahalanobis Distance',
    meaning:
      'Measure distance in units of the covariance, so noisy directions count less.',
    latex: 'D^2=(x-\\mu)^T C^{-1}(x-\\mu)',
    caption:
      'Whitening turns colored covariance into ordinary Euclidean distance.',
  },
  {
    id: 'weighted-gaussian-mean',
    title: 'Weighted Gaussian Mean',
    meaning:
      'Average sensors by precision so less noisy measurements vote more strongly.',
    latex:
      '\\hat A_{ML}=\\frac{\\sum_i x_i/\\sigma_i^2}{\\sum_i 1/\\sigma_i^2}',
    caption: 'The weights are inverse variances, not preferences.',
  },
  {
    id: 'poisson-ml',
    title: 'Poisson ML',
    meaning: 'Estimate a Poisson rate by the average observed count.',
    latex: '\\hat\\lambda_{ML}=\\frac{1}{N}\\sum_{n=1}^{N}k_n',
    caption: 'For a Poisson model, the mean and variance are both lambda.',
  },
  {
    id: 'gamma-ml-scale',
    title: 'Gamma Scale ML',
    meaning:
      'Estimate the gamma scale by dividing the sample mean by the known shape.',
    latex: '\\hat\\theta_{ML}=\\frac{\\sum_i x_i}{Nk}',
    caption: 'For shape k and scale theta, the mean delay is k theta.',
  },
]
