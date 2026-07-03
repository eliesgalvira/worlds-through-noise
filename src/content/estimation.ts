import type { LessonRecord } from '@/domain/types.ts'

export const estimationLesson: LessonRecord = {
  route: 'estimation',
  ordinal: '03',
  title: 'Estimation',
  thesis:
    'An estimator is a machine you must judge by its cloud of outputs, never by one lucky number — and the Cramér-Rao bound is the physics of how tight that cloud can ever be.',
  intro: [
    'Tema 3 has one skeleton: model the data f(x; θ), ask how much the data even knows about θ (CRB), try to build the estimator that extracts all of it (efficient / ML), and, when prior knowledge exists, add it as one more measurement (MAP, MMSE).',
    'Exams walk this skeleton in order — “find the pdf, find the CRB, does the efficient estimator exist, find the ML, is it consistent” — so this lesson does too, with the objects made visible at each step.',
  ],
  modules: [
    {
      id: 'E1',
      title: 'Judge the machine, not the number',
      question: 'What do bias, variance and MSE actually describe?',
      trap: 'θ̂(x) looks like an answer. It is a draw from a random variable, and a single draw can make a terrible estimator look brilliant. Bias and variance read as abstract penalties until you see the cloud they measure.',
      object:
        'Two competing machines fed the same experiment: the sample mean, and the “midrange” (max+min)/2. Run the experiment hundreds of times; each machine piles up a histogram of outputs. Bias is where a pile is centered relative to the truth; variance is the pile’s width; MSE is both at once.',
      action:
        'Press run and watch the piles grow with Gaussian noise: the sample mean wins, the midrange is a wide mess. Now switch the noise to uniform and run again — the ranking flips, the midrange pile becomes eerily narrow. Nothing about the machines changed; only f(x; θ) did.',
      payoff:
        'This is the course’s System-3 shock: “best estimator” is not a property of the formula, it is a property of the formula–distribution pair. It explains why the whole theory bothers with f(x; θ) at all, and why words like efficient are always relative to a model. Consistency also becomes visible: raise N and watch a good pile tighten toward the truth.',
      equations: [
        {
          sentence:
            'The mean squared error splits into a systematic offset and a random wobble.',
          latex:
            '\\mathrm{MSE}(\\hat\\theta) = E\\,|\\hat\\theta(\\mathbf{x}) - \\theta|^2 = \\sigma^2_{\\hat\\theta} + |b_{\\hat\\theta}|^2',
          caption:
            'b = E[θ̂] − θ. A little deliberate bias can be worth a big variance cut — that trade is MAP’s whole business.',
        },
      ],
      prediction: {
        question:
          'An estimator lands exactly on θ in one run. What did you learn about its bias?',
        answer:
          'Almost nothing. Bias is the center of the pile over many runs; one draw cannot reveal it.',
      },
      transfer:
        'Classic collection exercise: for m̂₂ = (1/(N+1))Σxᵢ, find bias and variance and check consistency. Picture the pile: slightly off-center, slightly narrower — then confirm with algebra.',
      examRefs: [
        'Teoría T3 §2: sample mean vs midrange under uniform and Gaussian noise',
        'Parcial Abr 2026, Ex. 1(b–c): unbiasedness conditions for proposed estimators',
      ],
    },
    {
      id: 'E2',
      title: 'Information is curvature',
      question:
        'What limits every unbiased estimator, and when does the perfect one exist?',
      trap: 'The CRB formula — an expectation of a squared derivative of a logarithm, inverted — is the least visual object in the course. And the “efficient estimator exists iff ∂lnf/∂θ = I(θ)(θ̂(x) − θ)” condition looks like pattern-matching for its own sake.',
      object:
        'The likelihood as a landscape over candidate θ, drawn for the data you actually observed. Its peak is the ML estimate. Its sharpness near the peak is how confidently the data votes: a knife-edge peak pins θ down; a broad hill leaves it loose. Fisher information is literally the average curvature of this landscape; the CRB is its inverse.',
      action:
        'Draw fresh samples and watch the landscape rebuild — the peak wobbles from draw to draw, and the wobble’s size matches the flatness. Now raise N: each sample multiplies in another factor, the landscape sharpens, the peak wobble shrinks like 1/N. Raise σ and watch it flatten again. You are watching σ²_CR(θ) = σ²/N live.',
      payoff:
        'The existence condition stops being mystical: the score ∂lnf/∂θ for the Gaussian-mean problem is (N/σ²)(x̄ − θ) — a straight line through the peak whose slope never depends on the data. When the score has that rigid shape, the peak position x̄ carries everything, and it achieves the bound. When the score bends (phase, frequency, P = A²/2), no unbiased estimator reaches the floor — but ML still finds the peak, and asymptotically presses against it.',
      equations: [
        {
          sentence:
            'No unbiased estimator can beat the inverse of the average curvature of the log-likelihood.',
          latex:
            '\\sigma^2_{\\hat\\theta} \\;\\ge\\; \\frac{1}{-E\\left[\\dfrac{\\partial^2 \\ln f(\\mathbf{x};\\theta)}{\\partial\\theta^2}\\right]} = \\sigma^2_{CR(\\theta)}',
        },
        {
          sentence:
            'The efficient estimator exists exactly when the score factors into information times error.',
          latex:
            '\\frac{\\partial \\ln f(\\mathbf{x};\\theta)}{\\partial\\theta} = I(\\theta)\\,\\big(\\hat\\theta(\\mathbf{x}) - \\theta\\big)',
          caption:
            'θ̂(x) must not depend on θ, and I(θ) must not depend on x. Exams test this factorization constantly.',
        },
        {
          sentence:
            'For a deterministic signal in white noise the bound rewards signals that change fast with the parameter.',
          latex:
            '\\sigma^2_{CR(\\theta)} = \\frac{\\sigma^2}{2\\,\\left\\| \\partial \\mathbf{p}(\\theta) / \\partial\\theta \\right\\|^2}',
          caption:
            'This is why frequency (whose derivative grows with n) enjoys a 1/N³ bound while amplitude gets 1/N.',
        },
      ],
      prediction: {
        question:
          'Same data, but the model’s σ doubles. What happens to the landscape and the CRB?',
        answer:
          'The landscape flattens — each sample argues more weakly — and the CRB quadruples: information scales as 1/σ².',
      },
      transfer:
        'Parcial Abr 2026, Ex. 1(d–e): compute the CRB for the amplifier gain (mean AND variance both carry A) and explain why the linear estimator, which ignores the variance channel, cannot be efficient.',
      examRefs: [
        'Parcial Abr 2026, Ex. 1: CRB with information in both mean and variance',
        'Parcial Oct 2025, Ex. 2: exponential inter-arrival times — CRB, efficient estimator',
        'Final Ene 2026, Ex. 1: Poisson accidents — score factorization gives the sample mean',
      ],
    },
    {
      id: 'E3',
      title: 'Precision votes',
      question:
        'How should unequal-quality measurements be combined — and what is a prior, really?',
      trap: 'The fusion formula θ̂ = (Σxᵢ/σᵢ²)/(Σ1/σᵢ²) and the MAP formula θ̂ = (x₀/σ₀² + μ_θ/σ_θ²)/(1/σ₀² + 1/σ_θ²) are memorized as two different results. They are the same picture.',
      object:
        'Springs. Each measurement xᵢ is an anchor pulling the estimate toward itself with stiffness 1/σᵢ² — precise sensors are stiff springs, noisy sensors are slack ones. The estimate is where the pulls balance. A Gaussian prior is one more spring, anchored at μ_θ with stiffness 1/σ_θ².',
      action:
        'Drag a sensor’s noise up and watch its spring slacken: the balance point slides away from it, and the combined variance 1/Σ(1/σᵢ²) barely misses it. Break one sensor completely (σ₀² → ∞, the defective pixel) and watch the estimate ignore it entirely. Then switch the prior spring on and pull the estimate toward μ_θ — and watch data springs overwhelm it as sensors accumulate.',
      payoff:
        'One object covers four exam staples: the greenhouse humidity fusion, the defective camera pixel, the BLUE (which is exactly “balance of springs” derived under a linearity constraint), and MAP shrinkage θ̂_MAP = αθ̂_ML + (1−α)μ_θ. The fading of the prior with N stops being a slogan: N data springs against one prior spring is not a fair fight.',
      equations: [
        {
          sentence:
            'The efficient fusion weighs each observation by its precision — inverse variance.',
          latex:
            '\\hat\\theta = \\frac{\\sum_i x_i/\\sigma_i^2}{\\sum_i 1/\\sigma_i^2}, \\qquad \\mathrm{Var}(\\hat\\theta) = \\frac{1}{\\sum_i 1/\\sigma_i^2}',
          caption:
            'BLUE form: h_opt = C⁻¹1/(1ᵀC⁻¹1); adding any sensor, however bad, never hurts.',
        },
        {
          sentence:
            'MAP is the same balance with the prior seated as one extra measurement.',
          latex:
            '\\hat\\theta_{MAP} = \\frac{x_0/\\sigma_0^2 + \\mu_\\theta/\\sigma_\\theta^2}{1/\\sigma_0^2 + 1/\\sigma_\\theta^2}',
          caption:
            'σ_θ² ≫ σ₀²: trust the data. σ₀² ≫ σ_θ²: trust the prior. The June-2026 final asks exactly this.',
        },
      ],
      prediction: {
        question:
          'Eight good pixels and one broken one. How much estimation variance does the broken pixel contribute?',
        answer:
          'Almost none is lost by keeping it: its weight 1/σ₀² ≈ 0 makes the fusion converge to the 8-pixel average with variance σ²/8. Fusion degrades gracefully.',
      },
      transfer:
        'Final Jun 2026, Ex. 1: defective pixel — do (a) single pixel, (b) 9-pixel fusion, (c) the two limits σ₀² = σ² and σ₀² ≫ σ², (d–e) MAP with a N(μ_θ, σ_θ²) prior. All five parts are spring diagrams.',
      examRefs: [
        'Final Jun 2026, Ex. 1: defective pixel fusion + MAP',
        'Final Jun 2025, Ex. 2: greenhouse sensors of unequal quality',
        'Parcial Abr 2026, Ex. 2: two-wire transmission — common noise makes C non-diagonal, same machinery',
      ],
    },
    {
      id: 'E4',
      title: 'The best explanation, found by a detector bank',
      question:
        'What does maximum likelihood do when no efficient estimator exists — and what does it cost to transform parameters?',
      trap: 'f̂_ML = argmax|X(f)|² is presented as “the periodogram peak,” which sounds like a recipe from a different course. And the invariance property P̂_ML = Â²_ML/2 looks free — until an exam asks why the transformed estimator is biased.',
      object:
        'A bank of candidate explanations. Each candidate frequency f proposes a template s(f); the data scores every candidate by how much of x lies along its template — |s(f)ᴴx|², a genuine correlation computed against your actual samples. ML is the candidate with the top score. This is the Fourier transform working as a detector, not as a change of representation.',
      action:
        'Slide the candidate f across the band and watch the score meter — the landscape |X(f)|² rises to a peak at the hidden tone. Add noise and watch spurious ripples compete. Now raise N and watch the main peak narrow dramatically: frequency’s CRB shrinks like 1/N³, because the template’s sensitivity to f grows with time. Compare a two-block strategy (average two N/2 estimates) and see it lose by a factor ≈ 4 — halving N is quadratically expensive here.',
      payoff:
        'Compressed likelihood stops being abstract: maximize over the easy parameter first (Â_ML = s(f)ᴴx/N for each f), substitute, and the leftover function of f is exactly the periodogram. Invariance is a gift with a price tag: g(θ̂_ML) is the ML of g(θ), but if g bends (squaring an amplitude to get power), the estimator picks up an O(1/N) bias — asymptotically forgiven, never free.',
      equations: [
        {
          sentence:
            'Maximize over amplitude first; the survivor is a matched-filter score swept across frequency.',
          latex:
            '\\hat f_{ML} = \\arg\\max_f \\left| \\sum_{n=0}^{N-1} x(n)\\, e^{-j2\\pi f n} \\right|^2, \\qquad \\hat A_{ML} = \\tfrac{1}{N} X(\\hat f_{ML})',
        },
        {
          sentence:
            'Frequency information grows with the cube of the observation length.',
          latex:
            '\\sigma^2_{CR(f)} = \\frac{3}{4\\pi^2\\, \\mathrm{SNR}\\; N(N-1)(2N-1)} \\;\\approx\\; \\frac{3}{8\\pi^2\\,\\mathrm{SNR}\\,N^3}',
          caption:
            'The 1/N³ is why splitting the data into blocks is a bad idea for frequency estimation.',
        },
      ],
      prediction: {
        question:
          'You double N. Roughly how much narrower does the periodogram peak’s wobble get?',
        answer:
          'Standard deviation shrinks by about √8 ≈ 2.8 — the 1/N³ law — versus only √2 for an amplitude estimate.',
      },
      transfer:
        'Teoría exercise: two ML frequency estimates from half-blocks, averaged, versus one full-block estimate. Show the variance ratio ≈ 4 and explain it with the N³ law rather than algebra.',
      examRefs: [
        'Teoría T3 ML2/ML3: frequency estimation, known and unknown amplitude',
        'Teoría T3: block-splitting frequency estimation exercise (variance ratio 4)',
        'Final Ene 2025: joint amplitude/frequency estimation with compressed likelihood',
      ],
    },
  ],
  examBank: [
    {
      exam: 'Final Jun 2026, Ex. 1',
      title: 'Defective pixel: fusion + MAP',
      move: 'Precision-weighted average of 9 pixels; MAP adds the prior as a tenth spring; check both limits.',
    },
    {
      exam: 'Parcial Abr 2026, Ex. 1',
      title: 'Amplifier gain (information in mean and variance)',
      move: 'f(x;A) has A in both moments; CRB = A²/(N(α²/σ²+2)); the linear estimator is not efficient.',
    },
    {
      exam: 'Parcial Abr 2026, Ex. 2',
      title: 'Two-wire differential transmission',
      move: 'Common noise cancels in x₁−x₂; ML is a linear combiner immune to σ_w²; verify efficiency by score factorization.',
    },
    {
      exam: 'Parcial Oct 2025, Ex. 2',
      title: 'Exponential inter-arrival times',
      move: 'Score factorizes ⇒ sample mean is efficient with variance μ²/N.',
    },
    {
      exam: 'Final Ene 2026, Ex. 1',
      title: 'Poisson accident rate, ML and MAP',
      move: 'ML is the sample mean of counts; a Gamma prior shifts it exactly like one more pseudo-observation.',
    },
  ],
}
