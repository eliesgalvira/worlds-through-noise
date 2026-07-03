import type { LessonRecord } from '@/domain/types.ts'

export const detectionLesson: LessonRecord = {
  route: 'detection',
  ordinal: '02',
  title: 'Detection',
  thesis:
    'A detector never discovers the truth. It spends a false-alarm budget where the evidence is strongest, and every formula in Tema 2 is bookkeeping for that purchase.',
  intro: [
    'Radar, anemia screening, stored bits, covert transmissions: in every exam problem two machines could have dealt the trace you hold, and a rule must pick one while owning its mistakes. The likelihood ratio, the Q function, the matched filter and the chi-squared tail are all shadows of one picture — two overlapping clouds and a boundary you are free to move.',
    'This lesson builds the picture first. Each module hands you the clouds and makes you move the boundary; the Neyman-Pearson lemma then reads like a description of what your hands already did.',
  ],
  modules: [
    {
      id: 'D1',
      title: 'One trace, two machines',
      question:
        'Why do even good detectors make mistakes — and why does averaging help?',
      trap: '“Decide H₁ if x > γ” looks like the detector knows something. It knows nothing about this trace; both machines can produce every value of x. And the reflex “large x means signal present” is a trap the exams exploit: in the anemia screen the sick population has the LOWER ferritin mean, so the inequality flips.',
      object:
        'Two dealing machines and their piles. H₀ deals from a Gaussian centered at m₀, H₁ from one centered at m₁. Where the piles overlap, one number is honestly compatible with both machines — that region is where false alarms and misses are manufactured.',
      action:
        'Draw a trace and see where it lands: near a peak the answer is easy; in the overlap the trace itself cannot settle it. Then raise N and average the samples before deciding. Watch both piles tighten by √N around their means — the overlap drains away. You did not get better evidence per sample; you stacked weak evidence until the piles separated.',
      payoff:
        'The test statistic T(x) = (1/N)·1ᵀx is not a trick: it is the coordinate along which the two piles separate fastest, and its two distributions N(m₀, σ²/N) and N(m₁, σ²/N) are all you need to price any threshold. The threshold direction comes from the geometry, not from habit — when m₁ < m₀ you decide H₁ for small averages.',
      equations: [
        {
          sentence:
            'Evidence is comparative: how ordinary is this trace under H₁ versus under H₀.',
          latex:
            'L(\\mathbf{x}) = \\frac{f(\\mathbf{x}\\mid\\mathcal{H}_1)}{f(\\mathbf{x}\\mid\\mathcal{H}_0)} \\;\\underset{\\mathcal{H}_0}{\\overset{\\mathcal{H}_1}{\\gtrless}}\\; \\gamma',
        },
        {
          sentence:
            'For Gaussian means the likelihood ratio collapses the whole vector to the sample mean.',
          latex:
            'T(\\mathbf{x}) = \\tfrac{1}{N}\\mathbf{1}^T\\mathbf{x} \\sim \\mathcal{N}\\!\\left(m_i,\\ \\tfrac{\\sigma^2}{N}\\right) \\text{ under } \\mathcal{H}_i',
          caption:
            'The √N tightening is the processing gain: ENR = N·A²/σ² grows linearly with N.',
        },
      ],
      prediction: {
        question:
          'With the anemia model (m₁ < m₀), you demand fewer misses. Which way does the threshold move?',
        answer:
          'Up, toward m₀: you call “anemic” on a wider range of low averages. Misses fall, false alarms rise — the overlap only lets you trade, never win.',
      },
      transfer:
        'Parcial Abr 2025: ferritin screen with m₀ > m₁. Write the test, note the flipped inequality, and give P_FA and P_D as Q-functions of the threshold on the sample mean.',
      examRefs: [
        'Parcial Abr 2025, Ex. 1: anemia screening, N-day average, flipped threshold',
        'Teoría T2, Ejercicio 1: DC level in white Gaussian noise',
      ],
    },
    {
      id: 'D2',
      title: 'The false-alarm budget',
      question:
        'Neyman-Pearson says “fix P_FA, maximize P_D.” What is actually being spent?',
      trap: 'γ = σ_y Q⁻¹(α) looks like an incantation: an inverse of a function nobody can picture, applied to a Greek letter.',
      object:
        'The H₀ pile is a reservoir of probability, and α is the fraction of it you are licensed to spill. The threshold is a dam: everything beyond it under H₀ is spilled budget (false alarms), everything beyond it under H₁ is caught signal (detections).',
      action:
        'Choose the budget α and slide the dam until the spilled H₀ area equals it exactly — that position IS Q⁻¹(α), no incantation involved. Read off the H₁ area beyond the dam: that is your P_D, one operating point. Now sweep the dam from permissive to strict and watch the point trace the ROC curve. Raise the ENR and watch the whole curve bow toward the perfect corner.',
      payoff:
        'The ROC stops being a mysterious benchmark plot: it is the exhaustive menu of budget-versus-catch deals this sensor offers, and no threshold choice can move you off the menu — only more energy (N up, σ² down, means apart) buys a better menu. P_D = Q(Q⁻¹(α) − √ENR) is the whole story in one line: start from your budget, get pushed left by the separation.',
      equations: [
        {
          sentence:
            'Spend the budget exactly, then read the detection probability from the same geometry.',
          latex:
            '\\gamma_y = \\sigma_y\\, Q^{-1}(\\alpha), \\qquad P_D = Q\\!\\left(Q^{-1}(\\alpha) - \\sqrt{\\mathrm{ENR}}\\right)',
          caption:
            'ENR = NA²/σ² for the DC problem; for the general pulse it is 2|A|²pᴴC_w⁻¹p.',
        },
      ],
      prediction: {
        question:
          'You double N. What happens to the ROC curve and to a fixed-α operating point?',
        answer:
          'ENR doubles, the curve bows up, and the fixed-α point rides the new curve upward: same spilled budget, more caught signal.',
      },
      transfer:
        'Every NP exam question ends the same way: “obtain the threshold for P_FA ≤ α and the resulting P_D.” Practice reading both areas before touching algebra — the algebra is just naming the two areas.',
      examRefs: [
        'Final Jun 2026, Ex. 3(f): Gaussian-approximated test, P_D vs P_FA under σ_w² ≫ P',
        'Teoría T2: ROC family parametrized by ENR (0–10 dB)',
      ],
    },
    {
      id: 'D3',
      title: 'Whiten, then match',
      question:
        'Where does the matched filter h = C_w⁻¹p come from, and why does whitening keep appearing?',
      trap: 'Re{A*pᴴC_w⁻¹x} ≷ γ looks like the output of a symbol-pushing machine. Memorizing it leaves you helpless when the exam changes the noise or asks you to design the pulse.',
      object:
        'A cloud and a direction. In signal space the noise is a cloud around each hypothesis mean (0 under H₀, Ap under H₁). White noise makes a round cloud; colored noise makes a tilted ellipse that wobbles more along some directions than others. The detector is nothing but a direction to project onto — a shadow-line that separates the two cloud centers best.',
      action:
        'Start with colored noise and the naive choice: project straight onto p. Watch the two shadow histograms overlap because p points into the loud axis of the ellipse. Now squeeze the space with C_w^{-1/2} — the ellipse becomes a circle, the means move, and in the whitened world the best direction is trivially “toward the (whitened) pulse.” Undo the change of variables and the composite direction you built with your hands is exactly C_w⁻¹p.',
      payoff:
        'One mental move — make the noise round first — generates the whole family: matched filter (already-white case h ∝ p), generalized matched filter (h ∝ C_w⁻¹p), Mahalanobis distance (length measured after whitening), and pulse design (put your energy along the quiet eigen-direction, SNR_opt = 2|A|²E_p/λ_min). None of them needs to be memorized separately.',
      equations: [
        {
          sentence:
            'The NP detector for a known pulse in Gaussian noise projects the data onto the whitened-then-matched direction.',
          latex:
            'y = \\mathrm{Re}\\{A^*\\mathbf{p}^H\\mathbf{C}_w^{-1}\\mathbf{x}\\} \\;\\gtrless\\; \\gamma_y, \\qquad \\mathrm{SNR}_y = 2|A|^2\\,\\mathbf{p}^H\\mathbf{C}_w^{-1}\\mathbf{p}',
        },
        {
          sentence:
            'If the phase of A is unknown, project and take the magnitude instead; the exponential tail replaces the Q function.',
          latex:
            'y = |\\mathbf{p}^H\\mathbf{C}_w^{-1}\\mathbf{x}|^2, \\qquad \\gamma_{|\\cdot|} = -\\sigma_z^2 \\ln P_{FA}',
          caption:
            '|z|² of a complex Gaussian is exponential — a chi-squared with 2 degrees of freedom.',
        },
      ],
      prediction: {
        question:
          'The noise ellipse is loud exactly along p. Is projecting onto p still a good idea?',
        answer:
          'No — that shadow has maximum noise. C_w⁻¹p tilts the projection away from the loud axis; in the whitened picture this is obvious, in the original picture it looks like magic.',
      },
      transfer:
        'Parcial Oct 2025: two codewords in colored noise. Whiten, reduce to a distance comparison, then argue where codewords should be placed. All three parts are the same squeeze.',
      examRefs: [
        'Parcial Abr 2025, Ex. 2: radar amplitude with colored noise (same C_w⁻¹ machinery)',
        'Parcial Oct 2025, Ex. 1: codeword detection and design in colored noise',
        'Teoría T2, Ejercicios 2–3: radar detector, whitening interpretation, pulse design',
      ],
    },
    {
      id: 'D4',
      title: 'Detecting loudness',
      question:
        'What can a detector do when the signal itself is unknown — only its power distinguishes the hypotheses?',
      trap: 'The energy detector y = Σ|x(n)|² and its chi-squared thresholds look like a separate theory with new tables. And the covert-communications result — the jailer needs P·√N, the receiver only needs P·N — looks like a paradox.',
      object:
        'Two loudness gauges. Under H₀ the average power settles near σ_w²; under H₁ near σ_w² + P. Each gauge reading is a chi-squared bump: skewed and wide for small N, tightening like √N as samples accumulate.',
      action:
        'Slide N and watch the two bumps separate — slowly. Their centers stay a fixed distance P apart while their widths shrink like 1/√N, so distinguishability grows only like √N·(P/σ_w²). Compare with D1, where knowing the waveform let the mean itself grow with N. Then set P below the σ_w²·N^{-1/2} waterline and watch the bumps refuse to separate: the transmission is statistically invisible.',
      payoff:
        'The square-root law of covert communications falls out of the picture: a jailer who must detect unknown signals gains only √N, while the intended receiver, who knows the waveform, gains N. Keep P ∝ N^{-2/3} and, as N grows, the jailer’s P_D collapses to P_FA while the receiver’s P_D climbs to 1. The chi-squared tables are just the honest shape of a sum of squares — nothing more exotic than that.',
      equations: [
        {
          sentence:
            'With only power to go on, the NP test is the measured energy against a chi-squared tail.',
          latex:
            'y = \\sum_{n=0}^{N-1} x^2(n), \\qquad P_D = Q_{\\chi_N}\\!\\left(\\frac{Q_{\\chi_N}^{-1}(P_{FA})}{1 + \\mathrm{SNR}}\\right)',
          caption:
            'SNR = P/σ_w². For complex data the degrees of freedom double.',
        },
        {
          sentence:
            'For large N the test statistic is approximately Gaussian, and the separation is √N in SNR units.',
          latex:
            'P_D \\approx Q\\!\\left(Q^{-1}(P_{FA}) - \\sqrt{\\tfrac{N}{2}}\\,\\frac{P}{\\sigma_w^2}\\right)',
        },
      ],
      prediction: {
        question:
          'σ₁²/σ₀² = 2 and N = 2 (complex). Roughly how good can the detector be?',
        answer:
          'Poor: with two samples the bumps overlap heavily — P_D = P_FA^{1/2} for the exponential case, e.g. only 0.32 at P_FA = 0.1. Power detection is sample-hungry.',
      },
      transfer:
        'Final Jun 2026, Ex. 3: derive the jailer’s test, apply the Gaussian approximation, then show P ∝ N^{-2/3} defeats the jailer but not the receiver. Every step is a picture from this module.',
      examRefs: [
        'Final Jun 2026, Ex. 3: covert communications, energy detector, square-root law',
        'Teoría T2, Ej. 2.1: power-increase detection, chi-squared ROC P_D = P_FA^{σ₀²/σ₁²}',
      ],
    },
    {
      id: 'D5',
      title: 'Priors put a thumb on the scale',
      question:
        'What changes when hypotheses have prior probabilities and mistakes have prices?',
      trap: 'MAP and Bayes risk look like a second theory of detection with its own threshold formula to memorize, γ = P₀(C₁₀−C₀₀)/P₁(C₀₁−C₁₁).',
      object:
        'A stored bit, written five times onto an unreliable disk that flips each copy with probability ε. The detector counts the ones. The evidence is the count k; the prior Pr(bit = 1) and the two mistake prices are weights placed on the two pans of a scale before the evidence arrives.',
      action:
        'Move the prior and watch the decision threshold on the count k slide: at Pr(1) = 0.5 it is majority vote; make ones rare and suddenly three ones out of five is no longer convincing. Make missing a one expensive and the threshold slides back. Read the exactly computed error probability as you move — the minimum-error rule is the one your hands settle on.',
      payoff:
        'NP, MAP and minimum Bayes risk are one detector with three stories about the threshold: NP fixes it by a false-alarm budget, MAP by prior odds, Bayes risk by prior odds times price ratio. The likelihood-ratio side never changes. On the exam, the phrase “equally likely bits” or “cost of a miss is ten times larger” is just an instruction for where to put γ.',
      equations: [
        {
          sentence:
            'Same likelihood ratio, threshold set by priors and prices rather than by a budget.',
          latex:
            '\\frac{f(\\mathbf{x}\\mid\\mathcal{H}_1)}{f(\\mathbf{x}\\mid\\mathcal{H}_0)} \\;\\gtrless\\; \\frac{P_0\\,(C_{10}-C_{00})}{P_1\\,(C_{01}-C_{11})} = \\gamma_{MRB}',
          caption:
            'Equal costs reduce MRB to MAP; MAP with equal priors reduces to maximum likelihood.',
        },
        {
          sentence:
            'For n repeated bits with flip probability ε the sufficient statistic is the count of ones, distributed binomially.',
          latex:
            '\\Pr(k \\mid \\mathcal{H}_i) = \\binom{n}{k} \\varepsilon_i^{\\,k} (1-\\varepsilon_i)^{\\,n-k}',
        },
      ],
      prediction: {
        question:
          'Five copies, ε = 0.2, but Pr(bit=1) = 0.1. Is “three or more ones” still the right rule?',
        answer:
          'No. The prior odds of 9:1 against demand stronger evidence: the threshold moves to four ones. Rare hypotheses need louder data.',
      },
      transfer:
        'Final Jun 2025, Ex. 1: unreliable disk with repetition code. Derive the count test, then answer how the threshold moves when the read-error probability or the bit prior changes.',
      examRefs: [
        'Final Jun 2025, Ex. 1: repeated-bit storage, binomial test, MAP threshold',
        'Teoría T2 §3: minimum Bayes risk and MAP detectors',
      ],
    },
  ],
  examBank: [
    {
      exam: 'Parcial Abr 2025, Ex. 1',
      title: 'Anemia screen: Gaussian means with m₀ > m₁',
      move: 'Average N days, decide H₁ below the threshold; both error probabilities are Q of standardized distances.',
    },
    {
      exam: 'Parcial Oct 2025, Ex. 1',
      title: 'Codeword detection in colored noise',
      move: 'Whiten with C⁻¹, compare cᵢᵀC⁻¹x terms; best codewords sit along the quiet eigen-direction.',
    },
    {
      exam: 'Final Jun 2026, Ex. 3',
      title: 'Covert communications (energy detection)',
      move: 'Unknown signal ⇒ energy detector ⇒ chi-squared tails ⇒ √N detectability ⇒ P ∝ N^{-2/3} stays hidden.',
    },
    {
      exam: 'Final Jun 2025, Ex. 1',
      title: 'Repeated bit on an unreliable disk',
      move: 'Count the ones (binomial), majority vote for equal priors, threshold slides with prior/cost.',
    },
    {
      exam: 'Final Ene 2026, Ex. 2',
      title: 'Pilot-tone loss detection on a power line',
      move: 'Known tone ⇒ project onto the steering vector; unknown phase ⇒ magnitude-squared and exponential tail.',
    },
  ],
}
