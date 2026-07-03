import type { LessonRecord } from '@/domain/types.ts'

export const adaptiveLesson: LessonRecord = {
  route: 'adaptive',
  ordinal: '05',
  title: 'Adaptive filtering',
  thesis:
    'Steepest descent rolls a ball down the Wiener bowl. LMS rolls the same ball in fog — and the entire theory of Tema 5 is pricing the fog.',
  intro: [
    'Two reasons to abandon h = R_x⁻¹r_xd: the inverse is expensive, and the world may not sit still long enough for R_x to mean anything. Steepest descent fixes the first with iteration; LMS fixes both by replacing the true gradient with the crudest possible estimate — one sample’s worth.',
    'Everything examinable lives in three quantities you can watch: the stability window 0 < μ < 2/λ_max, the convergence speed set by the eigenvalue spread λ_max/λ_min, and the misadjustment M ≈ (μ/2)·tr(R_x) that LMS pays forever for its cheap gradient.',
  ],
  modules: [
    {
      id: 'A1',
      title: 'Rolling downhill',
      question:
        'Why does one step size converge, another crawl, and a third explode — on the same bowl?',
      trap: 'h_{k+1} = h_k − μ(R_x h_k − r_xd) is a recursion to memorize, and 0 < μ < 2/λ_max arrives as an unexplained commandment.',
      object:
        'The Tema 4 bowl, now with a ball on it. Each iteration reads the local slope and hops against it, hop length scaled by μ. In the eigenvector basis the bowl has no cross-terms, so the ball is really Q independent 1-D balls, the i-th on a parabola of steepness λᵢ, each shrinking its error by the factor (1 − μλᵢ) per hop.',
      action:
        'Drop the ball anywhere and play. Small μ: safe, slow, every mode creeps. Push μ past 1/λ_max: the steep mode starts overshooting side to side yet still converges. Push past 2/λ_max: |1 − μλ_max| > 1 and the overshoot compounds — divergence, live. Then switch bowls: on the round bowl (spread 1.7) one μ suits everyone; on the cigar bowl (spread 13) the μ that the steep axis tolerates leaves the shallow axis crawling down the valley floor.',
      payoff:
        'The commandment becomes geometry: convergence needs every |1 − μλᵢ| < 1, and the binding constraint is the steepest mode — hence 2/λ_max, and the conservative exam-friendly bound 2/tr(R_x) = 2/(Q·P_x) when eigenvalues are unknown. Slow convergence with correlated inputs is not folklore: it is the shallow eigen-direction of a stretched bowl, and μ_opt = 2/(λ_max + λ_min) is just the best compromise between the two worst modes.',
      equations: [
        {
          sentence:
            'Each eigen-mode of the error contracts independently, by a factor set by its own eigenvalue.',
          latex:
            'z_{k+1,i} = (1 - \\mu\\lambda_i)^{\\,k+1} z_{0,i}, \\qquad 0 < \\mu < \\frac{2}{\\lambda_{max}}',
          caption:
            'z = Uᴴ(h − h_opt): the error expressed along the bowl’s own axes.',
        },
        {
          sentence:
            'Without eigenvalues, bound the step with the trace — total input power the filter sees.',
          latex:
            '0 < \\mu \\le \\frac{2}{\\mathrm{tr}(\\mathbf{R}_x)} = \\frac{2}{Q\\,P_x}, \\qquad \\mu_{opt} = \\frac{2}{\\lambda_{max}+\\lambda_{min}}',
        },
      ],
      prediction: {
        question:
          'Eigenvalue spread 13, μ tuned so the steep mode converges fastest. Which mode dominates the tail of the learning curve?',
        answer:
          'The shallow one: its factor |1 − μλ_min| is closest to 1, so after the fast mode dies the error decays at the slow mode’s rate — the long valley crawl.',
      },
      transfer:
        'Final Jun 2025, Ex. 3: speech (highly correlated) makes the canceller crawl. Show that regularizing R_x + μ_rI shifts every eigenvalue up and shrinks the spread — the bowl becomes rounder.',
      examRefs: [
        'Teoría T5 Ejemplos 2–3: spread 1.71 vs 13, trajectories and divergence at μ = 0.2934',
        'Final Jun 2025, Ex. 3: regularization to fix eigenvalue spread',
      ],
    },
    {
      id: 'A2',
      title: 'Descending in fog',
      question:
        'What does LMS lose by estimating the gradient from a single sample — and what does it buy?',
      trap: 'h(n+1) = h(n) + μx(n)e*(n) looks like steepest descent with a typo, and “misadjustment” sounds like an implementation nuisance rather than a law.',
      object:
        'The same bowl, in fog. LMS cannot see the slope; it feels one noisy sample of it — x(n)e*(n), whose average is the true gradient but whose every instance points somewhere else. The trajectory becomes a drunken descent that, crucially, never stops walking: at the very bottom the true slope is zero but the noisy slope is not, so the ball jitters around the optimum forever.',
      action:
        'Run LMS on a real generated signal (the two-mic canceller from Tema 4, α = 0) and watch the learning curve |e(n)|² fall and then flatten — not at ξ_min, but a fixed percentage above it. Read the excess honestly measured from the run and compare with the theory M ≈ (μ/2)tr(R_x). Now turn μ down: the floor drops toward ξ_min while convergence stretches out. Turn on drift — let the true h_opt wander — and watch small-μ LMS lag behind the moving bottom while large-μ LMS tracks it, jittering.',
      payoff:
        'μ stops being a knob you guess and becomes a contract: convergence time scales like 1/(μλ), the permanent noise penalty scales like μ. The June 2026 final prices this exactly — σ_h² = (μ/2)ξ_min for the scalar canceller, hence output SNR = 2/(μσ_h²-terms): halve μ, double the cleaned SNR, wait twice as long. And nonstationarity flips the sign of the argument: in a drifting world, the “safe” tiny μ is the one that fails.',
      equations: [
        {
          sentence:
            'Replace the expectation with the sample: the whole algorithm is one multiply-and-nudge per coefficient.',
          latex:
            '\\mathbf{h}(n+1) = \\mathbf{h}(n) + \\mu\\,\\mathbf{x}(n)\\,e^*(n), \\qquad e(n) = d(n) - \\mathbf{h}^H(n)\\mathbf{x}(n)',
          caption:
            'Converges in mean under the same 0 < μ < 2/λ_max window as steepest descent.',
        },
        {
          sentence:
            'The fog never clears: after convergence the coefficients keep a variance and the error keeps an excess.',
          latex:
            '\\mathrm{Cov}(\\mathbf{h}(n)) \\approx \\frac{\\mu}{2}\\,\\xi_{min}\\,\\mathbf{I}, \\qquad \\mathcal{M} = \\frac{\\xi - \\xi_{min}}{\\xi_{min}} \\approx \\frac{\\mu}{2}\\,\\mathrm{tr}(\\mathbf{R}_x)',
          caption:
            'NLMS normalizes the step by the instantaneous input power ‖x(n)‖², making the contract self-tuning.',
        },
      ],
      prediction: {
        question:
          'You halve μ after convergence. What happens to the learning-curve floor and to tracking?',
        answer:
          'The floor drops by half its excess (misadjustment ∝ μ) — but if h_opt drifts, the lag error grows: steady-state noise and tracking agility are bought with the same coin.',
      },
      transfer:
        'Final Jun 2026, Ex. 2(e–g): write c(n) = y(n)z(n) for the scalar canceller, use Cov(h) = (μ/2)ξ_min to get σ_h², and express the output SNR as a function of μ. The whole exercise is this module with α = 0.',
      examRefs: [
        'Final Jun 2026, Ex. 2(e–g): LMS on the scalar canceller, SNR vs μ',
        'Teoría T5 §3: convergence in mean, coefficient covariance, misadjustment',
      ],
    },
  ],
  examBank: [
    {
      exam: 'Final Jun 2026, Ex. 2(e–g)',
      title: 'LMS on the two-mic canceller',
      move: 'c(n) = y(n)z(n); σ_h² = μξ_min/2; output SNR trades directly against μ.',
    },
    {
      exam: 'Final Jun 2025, Ex. 3',
      title: 'Echo canceller with correlated input',
      move: 'Eigenvalue spread slows LMS; regularization R_x + μI rounds the bowl at the price of a biased optimum.',
    },
    {
      exam: 'Teoría T5, Ejemplo 3',
      title: 'Narrowband prediction, spread 13',
      move: 'Fast drop along λ_max, long crawl along λ_min; divergence just past μ = 2/λ_max.',
    },
  ],
}
