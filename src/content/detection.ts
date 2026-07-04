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
      trap: '“Decide $\\mathcal{H}_1$ if $x > \\gamma$” looks like the detector knows something. It knows nothing about this trace; both machines can produce every value of $x$. And the reflex “large $x$ means signal present” is a trap the exams exploit: in the anemia screen the sick population has the LOWER ferritin mean, so the inequality flips.',
      object:
        'Two dealing machines and their piles. $\\mathcal{H}_0$ deals from a Gaussian centered at $m_0$, $\\mathcal{H}_1$ from one centered at $m_1$. Where the piles overlap, one number is honestly compatible with both machines — that region is where false alarms and misses are manufactured.',
      action:
        'Draw a trace and see where it lands: near a peak the answer is easy; in the overlap the trace itself cannot settle it. Then raise $N$ and average the samples before deciding. Watch both piles tighten by $\\sqrt{N}$ around their means — the overlap drains away. You did not get better evidence per sample; you stacked weak evidence until the piles separated.',
      payoff:
        'The test statistic $T(\\mathbf{x}) = \\frac{1}{N}\\mathbf{1}^T\\mathbf{x}$ is not a trick: it is the coordinate along which the two piles separate fastest, and its two distributions $N(m_0, \\sigma^2/N)$ and $N(m_1, \\sigma^2/N)$ are all you need to price any threshold. The threshold direction comes from the geometry, not from habit — when $m_1 < m_0$ you decide $\\mathcal{H}_1$ for small averages.',
      equations: [
        {
          sentence:
            'Evidence is comparative: how ordinary is this trace under $\\mathcal{H}_1$ versus under $\\mathcal{H}_0$.',
          latex:
            'L(\\mathbf{x}) = \\frac{f(\\mathbf{x}\\mid\\mathcal{H}_1)}{f(\\mathbf{x}\\mid\\mathcal{H}_0)} \\;\\underset{\\mathcal{H}_0}{\\overset{\\mathcal{H}_1}{\\gtrless}}\\; \\gamma',
        },
        {
          sentence:
            'For Gaussian means the likelihood ratio collapses the whole vector to the sample mean.',
          latex:
            'T(\\mathbf{x}) = \\tfrac{1}{N}\\mathbf{1}^T\\mathbf{x} \\sim \\mathcal{N}\\!\\left(m_i,\\ \\tfrac{\\sigma^2}{N}\\right) \\text{ under } \\mathcal{H}_i',
          caption:
            'The $\\sqrt{N}$ tightening is the processing gain: $ENR = N A^2/\\sigma^2$ grows linearly with $N$.',
        },
      ],
      prediction: {
        question:
          'With the anemia model ($m_1 < m_0$), you demand fewer misses. Which way does the threshold move?',
        answer:
          'Up, toward $m_0$: you call “anemic” on a wider range of low averages. Misses fall, false alarms rise — the overlap only lets you trade, never win.',
      },
      transfer:
        'Parcial Abr 2025: ferritin screen with $m_0 > m_1$. Write the test, note the flipped inequality, and give $P_{FA}$ and $P_D$ as $Q$-functions of the threshold on the sample mean.',
      examRefs: [
        'Parcial Abr 2025, Ex. 1: anemia screening, N-day average, flipped threshold',
        'Teoría T2, Ejercicio 1: DC level in white Gaussian noise',
      ],
    },
    {
      id: 'D2',
      title: 'The false-alarm budget',
      question:
        'Neyman-Pearson says “fix $P_{FA}$, maximize $P_D$.” What is actually being spent?',
      trap: '$\\gamma = \\sigma_y Q^{-1}(\\alpha)$ looks like an incantation: an inverse of a function nobody can picture, applied to a Greek letter.',
      object:
        'The $\\mathcal{H}_0$ pile is a reservoir of probability, and $\\alpha$ is the fraction of it you are licensed to spill. The threshold is a dam: everything beyond it under $\\mathcal{H}_0$ is spilled budget (false alarms), everything beyond it under $\\mathcal{H}_1$ is caught signal (detections).',
      action:
        'Choose the budget $\\alpha$ and slide the dam until the spilled $\\mathcal{H}_0$ area equals it exactly — that position IS $Q^{-1}(\\alpha)$, no incantation involved. Read off the $\\mathcal{H}_1$ area beyond the dam: that is your $P_D$, one operating point. Now sweep the dam from permissive to strict and watch the point trace the ROC curve. Raise the ENR and watch the whole curve bow toward the perfect corner.',
      payoff:
        'The ROC stops being a mysterious benchmark plot: it is the exhaustive menu of budget-versus-catch deals this sensor offers, and no threshold choice can move you off the menu — only more energy ($N$ up, $\\sigma^2$ down, means apart) buys a better menu. $P_D = Q(Q^{-1}(\\alpha) - \\sqrt{ENR})$ is the whole story in one line: start from your budget, get pushed left by the separation.',
      equations: [
        {
          sentence:
            'Spend the budget exactly, then read the detection probability from the same geometry.',
          latex:
            '\\gamma_y = \\sigma_y\\, Q^{-1}(\\alpha), \\qquad P_D = Q\\!\\left(Q^{-1}(\\alpha) - \\sqrt{\\mathrm{ENR}}\\right)',
          caption:
            '$ENR = NA^2/\\sigma^2$ for the DC problem; for the general pulse it is $2|A|^2\\mathbf{p}^H\\mathbf{C}_w^{-1}\\mathbf{p}$.',
        },
      ],
      prediction: {
        question:
          'You double $N$. What happens to the ROC curve and to a fixed-$\\alpha$ operating point?',
        answer:
          'ENR doubles, the curve bows up, and the fixed-$\\alpha$ point rides the new curve upward: same spilled budget, more caught signal.',
      },
      transfer:
        'Every NP exam question ends the same way: “obtain the threshold for $P_{FA} \\leq \\alpha$ and the resulting $P_D$.” Practice reading both areas before touching algebra — the algebra is just naming the two areas.',
      examRefs: [
        'Final Jun 2026, Ex. 3(f): Gaussian-approximated test, $P_D$ vs $P_{FA}$ under $\\sigma_w^2 \\gg P$',
        'Teoría T2: ROC family parametrized by ENR (0–10 dB)',
      ],
    },
    {
      id: 'D3',
      title: 'Whiten, then match',
      question:
        'Where does the matched filter $\\mathbf{h} = \\mathbf{C}_w^{-1}\\mathbf{p}$ come from, and why does whitening keep appearing?',
      trap: '$\\operatorname{Re}\\{A^*\\mathbf{p}^H\\mathbf{C}_w^{-1}\\mathbf{x}\\} \\gtrless \\gamma$ looks like the output of a symbol-pushing machine. Memorizing it leaves you helpless when the exam changes the noise or asks you to design the pulse.',
      object:
        'A cloud and a direction. In signal space the noise is a cloud around each hypothesis mean ($\\mathbf{0}$ under $\\mathcal{H}_0$, $A\\mathbf{p}$ under $\\mathcal{H}_1$). White noise makes a round cloud; colored noise makes a tilted ellipse that wobbles more along some directions than others. The detector is nothing but a direction to project onto — a shadow-line that separates the two cloud centers best.',
      action:
        'Start with colored noise and the naive choice: project straight onto $\\mathbf{p}$. Watch the two shadow histograms overlap because $\\mathbf{p}$ points into the loud axis of the ellipse. Now squeeze the space with $\\mathbf{C}_w^{-1/2}$ — the ellipse becomes a circle, the means move, and in the whitened world the best direction is trivially “toward the (whitened) pulse.” Undo the change of variables and the composite direction you built with your hands is exactly $\\mathbf{C}_w^{-1}\\mathbf{p}$.',
      payoff:
        'One mental move — make the noise round first — generates the whole family: matched filter (already-white case $\\mathbf{h} \\propto \\mathbf{p}$), generalized matched filter ($\\mathbf{h} \\propto \\mathbf{C}_w^{-1}\\mathbf{p}$), Mahalanobis distance (length measured after whitening), and pulse design (put your energy along the quiet eigen-direction, $SNR_{opt} = 2|A|^2 E_p/\\lambda_{\\min}$). None of them needs to be memorized separately.',
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
            '$|z|^2$ of a complex Gaussian is exponential — a chi-squared with 2 degrees of freedom.',
        },
      ],
      prediction: {
        question:
          'The noise ellipse is loud exactly along $\\mathbf{p}$. Is projecting onto $\\mathbf{p}$ still a good idea?',
        answer:
          'No — that shadow has maximum noise. $\\mathbf{C}_w^{-1}\\mathbf{p}$ tilts the projection away from the loud axis; in the whitened picture this is obvious, in the original picture it looks like magic.',
      },
      transfer:
        'Parcial Oct 2025: two codewords in colored noise. Whiten, reduce to a distance comparison, then argue where codewords should be placed. All three parts are the same squeeze.',
      examRefs: [
        'Parcial Abr 2025, Ex. 2: radar amplitude with colored noise (same $\\mathbf{C}_w^{-1}$ machinery)',
        'Parcial Oct 2025, Ex. 1: codeword detection and design in colored noise',
        'Teoría T2, Ejercicios 2–3: radar detector, whitening interpretation, pulse design',
      ],
    },
    {
      id: 'D4',
      title: 'Detecting loudness',
      question:
        'What can a detector do when the signal itself is unknown — only its power distinguishes the hypotheses?',
      trap: 'The energy detector $y = \\sum |x(n)|^2$ and its chi-squared thresholds look like a separate theory with new tables. And the covert-communications result — the jailer needs $P \\cdot \\sqrt{N}$, the receiver only needs $P \\cdot N$ — looks like a paradox.',
      object:
        'Two loudness gauges. Under $\\mathcal{H}_0$ the average power settles near $\\sigma_w^2$; under $\\mathcal{H}_1$ near $\\sigma_w^2 + P$. Each gauge reading is a chi-squared bump: skewed and wide for small $N$, tightening like $\\sqrt{N}$ as samples accumulate.',
      action:
        'Slide $N$ and watch the two bumps separate — slowly. Their centers stay a fixed distance $P$ apart while their widths shrink like $1/\\sqrt{N}$, so distinguishability grows only like $\\sqrt{N}\\,(P/\\sigma_w^2)$. Compare with D1, where knowing the waveform let the mean itself grow with $N$. Then set $P$ below the $\\sigma_w^2 N^{-1/2}$ waterline and watch the bumps refuse to separate: the transmission is statistically invisible.',
      payoff:
        'The square-root law of covert communications falls out of the picture: a jailer who must detect unknown signals gains only $\\sqrt{N}$, while the intended receiver, who knows the waveform, gains $N$. Keep $P \\propto N^{-2/3}$ and, as $N$ grows, the jailer’s $P_D$ collapses to $P_{FA}$ while the receiver’s $P_D$ climbs to 1. The chi-squared tables are just the honest shape of a sum of squares — nothing more exotic than that.',
      equations: [
        {
          sentence:
            'With only power to go on, the NP test is the measured energy against a chi-squared tail.',
          latex:
            'y = \\sum_{n=0}^{N-1} x^2(n), \\qquad P_D = Q_{\\chi_N}\\!\\left(\\frac{Q_{\\chi_N}^{-1}(P_{FA})}{1 + \\mathrm{SNR}}\\right)',
          caption:
            '$SNR = P/\\sigma_w^2$. For complex data the degrees of freedom double.',
        },
        {
          sentence:
            'For large $N$ the test statistic is approximately Gaussian, and the separation is $\\sqrt{N}$ in SNR units.',
          latex:
            'P_D \\approx Q\\!\\left(Q^{-1}(P_{FA}) - \\sqrt{\\tfrac{N}{2}}\\,\\frac{P}{\\sigma_w^2}\\right)',
        },
      ],
      prediction: {
        question:
          '$\\sigma_1^2/\\sigma_0^2 = 2$ and $N = 2$ (complex). Roughly how good can the detector be?',
        answer:
          'Poor: with two samples the bumps overlap heavily — $P_D = P_{FA}^{1/2}$ for the exponential case, e.g. only 0.32 at $P_{FA} = 0.1$. Power detection is sample-hungry.',
      },
      transfer:
        'Final Jun 2026, Ex. 3: derive the jailer’s test, apply the Gaussian approximation, then show $P \\propto N^{-2/3}$ defeats the jailer but not the receiver. Every step is a picture from this module.',
      examRefs: [
        'Final Jun 2026, Ex. 3: covert communications, energy detector, square-root law',
        'Teoría T2, Ej. 2.1: power-increase detection, chi-squared ROC $P_D = P_{FA}^{\\sigma_0^2/\\sigma_1^2}$',
      ],
    },
    {
      id: 'D5',
      title: 'Priors put a thumb on the scale',
      question:
        'What changes when hypotheses have prior probabilities and mistakes have prices?',
      trap: 'MAP and Bayes risk look like a second theory of detection with its own threshold formula to memorize, $\\gamma = \\frac{P_0(C_{10} - C_{00})}{P_1(C_{01} - C_{11})}$.',
      object:
        'A stored bit, written five times onto an unreliable disk that flips each copy with probability $\\varepsilon$. The detector counts the ones. The evidence is the count $k$; the prior $\\Pr(\\text{bit} = 1)$ and the two mistake prices are weights placed on the two pans of a scale before the evidence arrives.',
      action:
        'Move the prior and watch the decision threshold on the count $k$ slide: at $\\Pr(1) = 0.5$ it is majority vote; make ones rare and suddenly three ones out of five is no longer convincing. Make missing a one expensive and the threshold slides back. Read the exactly computed error probability as you move — the minimum-error rule is the one your hands settle on.',
      payoff:
        'NP, MAP and minimum Bayes risk are one detector with three stories about the threshold: NP fixes it by a false-alarm budget, MAP by prior odds, Bayes risk by prior odds times price ratio. The likelihood-ratio side never changes. On the exam, the phrase “equally likely bits” or “cost of a miss is ten times larger” is just an instruction for where to put $\\gamma$.',
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
            'For $n$ repeated bits with flip probability $\\varepsilon$ the sufficient statistic is the count of ones, distributed binomially.',
          latex:
            '\\Pr(k \\mid \\mathcal{H}_i) = \\binom{n}{k} \\varepsilon_i^{\\,k} (1-\\varepsilon_i)^{\\,n-k}',
        },
      ],
      prediction: {
        question:
          'Five copies, $\\varepsilon = 0.2$, but $\\Pr(\\text{bit}{=}1) = 0.1$. Is “three or more ones” still the right rule?',
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
  workedProblems: [
    {
      id: 'wp-anemia',
      source: 'Parcial · 7 Abril 2025 · Ex. 1',
      title: 'The anemia screen: a threshold that points the other way',
      why: 'The gentlest complete NP problem in the recent bank — and it carries the D1 trap verbatim: the sick world has the LOWER mean, so every inequality flips. Parts f–h then run the D5 move on the same data: a prior of $p = 0.1$ drags the threshold, and you read NP and MAP as two points on one ROC.',
      statement: [
        {
          kind: 'text',
          content:
            'A health campaign screens for anemia. Positive individuals ($\\mathcal{H}_1$) have blood ferritin modeled as Gaussian $N(m_1, \\sigma^2)$; negative individuals ($\\mathcal{H}_0$) as $N(m_0, \\sigma^2)$, with $m_0 > m_1$. Each decision uses $N$ i.i.d. samples $\\{x_1, \\dots, x_N\\}$ taken on $N$ consecutive days.',
        },
      ],
      parts: [
        {
          label: 'a',
          prompt:
            'Obtain the conditional densities of the observation vector, $f_X(\\mathbf{x}\\mid\\mathcal{H}_0)$ and $f_X(\\mathbf{x}\\mid\\mathcal{H}_1)$.',
          steps: [
            {
              title: 'Stack N independent Gaussians around each mean',
              body: 'Same variance under both hypotheses; only the center moves. Independence multiplies the sample densities into one exponent of a squared norm.',
              latex:
                'f(\\mathbf{x}\\mid\\mathcal{H}_i) = \\frac{1}{(2\\pi\\sigma^2)^{N/2}} \\exp\\!\\left(-\\frac{1}{2\\sigma^2}\\,\\|\\mathbf{x} - m_i\\mathbf{1}\\|^2\\right), \\qquad i = 0, 1',
            },
          ],
          answer: {
            sentence:
              'Two identical Gaussian clouds centered at $m_0\\mathbf{1}$ and $m_1\\mathbf{1}$ — the elementary mean-shift setup of D1.',
          },
        },
        {
          label: 'b',
          prompt:
            'Show that Neyman–Pearson yields the test statistic $y = \\mathbf{1}^T\\mathbf{x} = \\sum_n x_n$.',
          steps: [
            {
              title: 'Cancel the quadratic terms in the log-ratio',
              body: 'The $\\|\\mathbf{x}\\|^2$ terms cancel and the data survive only through $(m_1 - m_0)\\,\\mathbf{1}^T\\mathbf{x}$.',
              latex:
                '\\ln\\frac{f(\\mathbf{x}\\mid\\mathcal{H}_1)}{f(\\mathbf{x}\\mid\\mathcal{H}_0)} > \\ln\\gamma \\;\\Longleftrightarrow\\; (m_1 - m_0)\\,\\mathbf{1}^T\\mathbf{x} > \\gamma_1',
            },
            {
              title: 'Divide by a negative number — and flip',
              body: 'Here is the trap: $m_1 - m_0 < 0$, so isolating the statistic reverses the inequality. Low ferritin is evidence of anemia, so you decide $\\mathcal{H}_1$ for SMALL sums.',
              latex:
                'y = \\mathbf{1}^T\\mathbf{x} = \\sum_{n=1}^{N} x_n \\;<\\; \\gamma_y \\;\\Longrightarrow\\; \\hat{\\mathcal{H}}_1',
            },
          ],
          answer: {
            sentence:
              'The sufficient statistic is the plain sum, but the decision region for $\\mathcal{H}_1$ is BELOW the threshold — the direction comes from the geometry, not from habit.',
            latex:
              'y = \\mathbf{1}^T\\mathbf{x} < \\gamma_y \\Rightarrow \\hat{\\mathcal{H}}_1',
          },
        },
        {
          label: 'c',
          prompt:
            'Find the density of $y$ under each hypothesis and sketch the two decision regions for a generic threshold $\\gamma_y$.',
          steps: [
            {
              title: 'Sum N independent Gaussians',
              body: 'Means add to $N m_i$ and variances add to $N\\sigma^2$. On the axis of $y$: the $\\mathcal{H}_1$ bell sits to the LEFT of the $\\mathcal{H}_0$ bell, region $y < \\gamma_y$ decides anemia, $y > \\gamma_y$ decides healthy.',
              latex:
                'y\\mid\\mathcal{H}_0 \\sim N(N m_0,\\, N\\sigma^2), \\qquad y\\mid\\mathcal{H}_1 \\sim N(N m_1,\\, N\\sigma^2)',
            },
          ],
          answer: {
            sentence:
              'The D1 two-worlds picture with the piles labeled the honest way round: sick on the left.',
          },
        },
        {
          label: 'd',
          prompt:
            'The health authority requires that the probability of calling a healthy individual positive stay below $\\alpha = 0.05$. Find $\\gamma_y = \\gamma_y^{NP}$.',
          steps: [
            {
              title: 'Write the false alarm as a LEFT tail',
              body: 'Because $\\mathcal{H}_1$ lives below the threshold, the false alarm is the lower tail of the $\\mathcal{H}_0$ bell — not the usual upper one. Standardize and solve.',
              latex:
                'P_{FA} = \\Pr(y < \\gamma_y \\mid \\mathcal{H}_0) = Q\\!\\left(\\frac{N m_0 - \\gamma_y}{\\sqrt{N}\\sigma}\\right) = \\alpha \\;\\Longrightarrow\\; \\gamma_y^{NP} = N m_0 - \\sqrt{N}\\,\\sigma\\, Q^{-1}(\\alpha)',
            },
          ],
          answer: {
            sentence:
              'The threshold sits $Q^{-1}(\\alpha)$ deviations BELOW the healthy center — the budget move of D2, mirrored.',
            latex:
              '\\gamma_y^{NP} = N m_0 - \\sqrt{N}\\sigma\\,Q^{-1}(\\alpha)',
          },
        },
        {
          label: 'e',
          prompt:
            'For that threshold, find the probability of detecting a truly anemic individual, in terms of $d = m_0 - m_1$. How does $d$ affect it?',
          steps: [
            {
              title: 'Same tail, other bell',
              body: 'Standardize the left tail under $\\mathcal{H}_1$ and substitute the threshold from part (d); the separation enters as $\\sqrt{N}d/\\sigma$.',
              latex:
                'P_D = \\Pr(y < \\gamma_y^{NP} \\mid \\mathcal{H}_1) = Q\\!\\left(Q^{-1}(\\alpha) - \\frac{\\sqrt{N}\\,d}{\\sigma}\\right)',
            },
            {
              title: 'Read the knob',
              body: 'Growing $d$ makes the argument of $Q$ more negative, so $P_D$ climbs toward 1 — and so does growing $N$, at the square-root rate the D1 figure shows.',
            },
          ],
          answer: {
            sentence:
              'The same ROC law as every mean-shift problem, with deflection $\\sqrt{N}d/\\sigma$: separation and days averaged are the only two knobs.',
            latex:
              'P_D = Q\\!\\left(Q^{-1}(\\alpha) - \\tfrac{\\sqrt{N} d}{\\sigma}\\right)',
          },
        },
        {
          label: 'f',
          prompt:
            'Last year’s prevalence gives $\\Pr\\{\\mathcal{H}_1\\} = p = 0.1$. Find the new threshold $\\gamma_y^{MAP}$ from the MAP criterion (decide the hypothesis most probable given $\\mathbf{x}$).',
          steps: [
            {
              title: 'Weigh the likelihoods by the priors',
              body: 'MAP compares $p\\,f(\\mathbf{x}\\mid\\mathcal{H}_1)$ against $(1-p)\\,f(\\mathbf{x}\\mid\\mathcal{H}_0)$ — the same likelihood ratio as NP with the threshold set by prior odds instead of by a budget.',
              latex:
                'p \\, f(\\mathbf{x}\\mid\\mathcal{H}_1) \\;\\underset{\\hat{\\mathcal{H}}_0}{\\overset{\\hat{\\mathcal{H}}_1}{\\gtrless}}\\; (1-p)\\, f(\\mathbf{x}\\mid\\mathcal{H}_0)',
            },
            {
              title: 'Solve for the threshold on y',
              body: 'Taking logs and isolating $y$ (remembering the flip) puts the threshold at the midpoint of the two means, shifted by a prior-odds term scaled by $\\sigma^2/d$.',
              latex:
                '\\gamma_y^{MAP} = \\frac{\\sigma^2}{d}\\ln\\frac{p}{1-p} + \\frac{N(m_1 + m_0)}{2}',
              note: 'With $p = 0.1$ the log is negative: rare disease pushes the threshold DOWN, demanding stronger evidence before crying anemia.',
            },
          ],
          answer: {
            sentence:
              'Midpoint plus a prior-odds correction: the D5 thumb on the scale, computed.',
            latex:
              '\\gamma_y^{MAP} = \\tfrac{\\sigma^2}{d}\\ln\\tfrac{p}{1-p} + \\tfrac{N(m_1+m_0)}{2}',
          },
        },
        {
          label: 'g',
          prompt:
            'The exam shows the ROC of $y$ with three marked points (+, o, △). Which corresponds to the NP detector of parts (b)–(e), and which to the MAP detector of part (f)?',
          steps: [
            {
              title: 'Use what each criterion pins down',
              body: 'The NP point is the one sitting at exactly $P_{FA} = \\alpha = 0.05$ (that is what its threshold was built to do): the △. The MAP point must at least lie ON the ROC curve, since it uses the same statistic with a different threshold: the +. The o lies off the curve, so no threshold on $y$ can ever produce it.',
            },
          ],
          answer: {
            sentence:
              'NP is the point at the budgeted $P_{FA}$; MAP is elsewhere on the same curve; off-curve points are unreachable — the ROC is the whole menu, as D2 insists.',
          },
        },
        {
          label: 'h',
          prompt:
            'From the figure, reason whether $\\gamma_y^{NP} > \\gamma_y^{MAP}$, $<$, or $=$.',
          steps: [
            {
              title:
                'Note which way both probabilities move with the threshold',
              body: 'The decision region for $\\mathcal{H}_1$ is $y < \\gamma_y$, so raising the threshold enlarges it: both $P_D$ and $P_{FA}$ increase with $\\gamma_y$. The figure shows the NP point above and to the right of the MAP point ($P_D^{NP} > P_D^{MAP}$, $P_{FA}^{NP} > P_{FA}^{MAP}$), so its threshold is the larger one.',
              latex: '\\gamma_y^{NP} > \\gamma_y^{MAP}',
            },
          ],
          answer: {
            sentence:
              'The rare-disease prior made MAP the stricter detector: lower threshold, fewer alarms of both kinds.',
            latex: '\\gamma_y^{NP} > \\gamma_y^{MAP}',
          },
        },
      ],
    },
    {
      id: 'wp-codewords',
      source: 'Parcial · 30 Oct 2025 · Ex. 1 (60 %)',
      title: 'Codewords in colored noise',
      why: 'One problem that runs the whole tema in order: Neyman–Pearson (D1–D2), the whitening metric $\\mathbf{C}^{-1}$ (D3), and then the eigen-design move from the Tema 1 terrain — the last two parts are where the exam separates students.',
      statement: [
        {
          kind: 'text',
          content:
            'A PhD student is designing an alphabet of codewords $\\mathbf{c}_i \\in \\mathbb{R}^N$ to transmit messages over a noisy medium, and wants the codewords maximally separated so detection stays robust. The noise is a zero-mean colored Gaussian vector $\\mathbf{w} \\sim N(\\mathbf{0}, \\mathbf{C})$. Under each hypothesis the observed vector is',
        },
        {
          kind: 'math',
          content:
            '\\mathcal{H}_0: \\; \\mathbf{x} = \\mathbf{c}_0 + \\mathbf{w}, \\qquad \\mathcal{H}_1: \\; \\mathbf{x} = \\mathbf{c}_1 + \\mathbf{w}',
        },
        {
          kind: 'text',
          content:
            'To keep energies bounded, the difference between the codewords is forced to be unit norm: $\\mathbf{c}_1 = \\mathbf{c}_0 + \\mathbf{a}$ with $\\|\\mathbf{a}\\|^2 = 1$.',
        },
      ],
      parts: [
        {
          label: 'a',
          prompt:
            'Apply Neyman–Pearson to obtain a test function $y = T(\\mathbf{x})$, as simplified as possible.',
          steps: [
            {
              title: 'Write both likelihoods',
              body: 'Same colored covariance $\\mathbf{C}$ under both hypotheses; only the mean moves.',
              latex:
                'f(\\mathbf{x}\\mid\\mathcal{H}_i) = \\frac{1}{\\sqrt{(2\\pi)^N \\det \\mathbf{C}}} \\exp\\!\\left(-\\tfrac{1}{2}(\\mathbf{x}-\\mathbf{c}_i)^T \\mathbf{C}^{-1} (\\mathbf{x}-\\mathbf{c}_i)\\right)',
            },
            {
              title: 'Take the log-likelihood ratio and cancel',
              body: 'The quadratic term $\\mathbf{x}^T\\mathbf{C}^{-1}\\mathbf{x}$ is common to both hypotheses and cancels; what survives is linear in $\\mathbf{x}$, and everything constant gets swept into the threshold.',
              latex:
                '\\ln\\frac{f(\\mathbf{x}\\mid\\mathcal{H}_1)}{f(\\mathbf{x}\\mid\\mathcal{H}_0)} > \\ln\\gamma \\;\\Longrightarrow\\; \\mathbf{c}_1^T\\mathbf{C}^{-1}\\mathbf{x} - \\mathbf{c}_0^T\\mathbf{C}^{-1}\\mathbf{x} > \\ln\\gamma + \\tfrac{1}{2}\\mathbf{c}_1^T\\mathbf{C}^{-1}\\mathbf{c}_1 - \\tfrac{1}{2}\\mathbf{c}_0^T\\mathbf{C}^{-1}\\mathbf{c}_0',
            },
            {
              title: 'Name the test statistic',
              body: 'The data only enter through one scalar projection. Crucially, $\\mathbf{C}^{-1}$ cannot be simplified away — the noise is colored, so the metric of the problem is not Euclidean.',
              latex:
                'y = T(\\mathbf{x}) = (\\mathbf{c}_1 - \\mathbf{c}_0)^T\\mathbf{C}^{-1}\\mathbf{x} = \\mathbf{a}^T\\mathbf{C}^{-1}\\mathbf{x} \\;\\gtrless\\; \\gamma_y',
            },
          ],
          answer: {
            sentence:
              'Project the data onto the codeword difference, but through the whitening metric: this is the D3 move — correlate against $\\mathbf{C}^{-1}\\mathbf{a}$, not $\\mathbf{a}$.',
            latex:
              'y = \\mathbf{a}^T\\mathbf{C}^{-1}\\mathbf{x} \\gtrless \\gamma_y',
          },
        },
        {
          label: 'b',
          prompt:
            'Show that the variance of $y$ is identical under both hypotheses and can be written in terms of the Mahalanobis distance between the codewords, $d_M^2 = (\\mathbf{c}_1-\\mathbf{c}_0)^T\\mathbf{C}^{-1}(\\mathbf{c}_1-\\mathbf{c}_0) = \\mathbf{a}^T\\mathbf{C}^{-1}\\mathbf{a}$.',
          steps: [
            {
              title: 'Split the statistic into signal plus noise',
              body: 'Under either hypothesis $y$ is a deterministic part plus the same projected noise, so the randomness — and hence the variance — does not depend on the hypothesis.',
              latex:
                'y\\mid\\mathcal{H}_i = \\mathbf{a}^T\\mathbf{C}^{-1}\\mathbf{c}_i + \\mathbf{a}^T\\mathbf{C}^{-1}\\mathbf{w}, \\qquad i = 0, 1',
            },
            {
              title: 'Push the expectation through the projection',
              body: 'The middle $\\mathbf{C}^{-1}\\mathbf{C}\\mathbf{C}^{-1}$ collapses to $\\mathbf{C}^{-1}$ — the whitening metric measures its own variance.',
              latex:
                '\\sigma_y^2 = E\\{(\\mathbf{a}^T\\mathbf{C}^{-1}\\mathbf{w})^2\\} = \\mathbf{a}^T\\mathbf{C}^{-1}E\\{\\mathbf{w}\\mathbf{w}^T\\}\\mathbf{C}^{-1}\\mathbf{a} = \\mathbf{a}^T\\mathbf{C}^{-1}\\mathbf{a} = d_M^2',
            },
          ],
          answer: {
            sentence:
              'The test variance equals the Mahalanobis distance itself — one number, $d_M^2$, will control the whole ROC.',
            latex: '\\sigma_y^2 = d_M^2 \\;\\text{ under both hypotheses}',
          },
        },
        {
          label: 'c',
          prompt:
            'Find the density of the test variable under each hypothesis, $f_Y(y\\mid\\mathcal{H}_0)$ and $f_Y(y\\mid\\mathcal{H}_1)$.',
          steps: [
            {
              title: 'A linear function of a Gaussian is Gaussian',
              body: 'Means come from part (b)’s deterministic term; the variance is $d_M^2$, also from part (b).',
              latex:
                'y\\mid\\mathcal{H}_0 \\sim N\\!\\left(\\mathbf{a}^T\\mathbf{C}^{-1}\\mathbf{c}_0,\\; d_M^2\\right), \\qquad y\\mid\\mathcal{H}_1 \\sim N\\!\\left(\\mathbf{a}^T\\mathbf{C}^{-1}\\mathbf{c}_1,\\; d_M^2\\right)',
              note: 'Two equal-width Gaussians whose centers are $\\mathbf{a}^T\\mathbf{C}^{-1}\\mathbf{a} = d_M^2$ apart — exactly the D1 two-worlds picture.',
            },
          ],
          answer: {
            sentence:
              'Two identical Gaussians separated by $d_M^2$: the problem has been reduced to the elementary mean-shift test.',
          },
        },
        {
          label: 'd',
          prompt:
            'Find the decision threshold $\\gamma_y$ such that the false-alarm probability satisfies $P_{FA} \\leq \\alpha$.',
          steps: [
            {
              title: 'Spend the false-alarm budget exactly',
              body: 'False alarm is the $\\mathcal{H}_0$ tail above the threshold; standardize and invert the $Q$ function.',
              latex:
                'P_{FA} = Q\\!\\left(\\frac{\\gamma_y - \\mathbf{a}^T\\mathbf{C}^{-1}\\mathbf{c}_0}{\\sigma_y}\\right) = \\alpha \\;\\Longrightarrow\\; \\gamma_y = \\sigma_y\\,Q^{-1}(\\alpha) + \\mathbf{a}^T\\mathbf{C}^{-1}\\mathbf{c}_0',
            },
          ],
          answer: {
            sentence:
              'The threshold sits $Q^{-1}(\\alpha)$ standard deviations above the $\\mathcal{H}_0$ center — the D2 budget move, verbatim.',
            latex:
              '\\gamma_y = \\sigma_y Q^{-1}(\\alpha) + \\mathbf{a}^T\\mathbf{C}^{-1}\\mathbf{c}_0',
          },
        },
        {
          label: 'e',
          prompt:
            'Find the detection probability $P_D$ and express it only in terms of $\\alpha$ and $d_M^2$.',
          steps: [
            {
              title: 'Same threshold, other Gaussian',
              body: 'The $\\mathcal{H}_1$ center is $d_M^2$ further along, and $\\sigma_y = d_M$, so the standardized shift is exactly $d_M$.',
              latex:
                'P_D = Q\\!\\left(\\frac{\\gamma_y - \\mathbf{a}^T\\mathbf{C}^{-1}\\mathbf{c}_1}{\\sigma_y}\\right) = Q\\!\\left(Q^{-1}(\\alpha) - \\frac{d_M^2}{d_M}\\right) = Q\\!\\left(Q^{-1}(\\alpha) - d_M\\right)',
            },
          ],
          answer: {
            sentence:
              'The entire receiver quality collapses into one scalar: the ROC is $Q(Q^{-1}(\\alpha) - d_M)$, so more Mahalanobis distance is strictly better.',
            latex: 'P_D = Q\\!\\left(Q^{-1}(\\alpha) - d_M\\right)',
          },
        },
        {
          label: 'f',
          prompt:
            'With unknown priors $\\Pr\\{\\mathcal{H}_1\\} = p$, $\\Pr\\{\\mathcal{H}_0\\} = 1-p$, find the error probability $P_e$ in terms of $p$, $\\alpha$ and $d_M^2$, and reason how $d_M$ affects it.',
          steps: [
            {
              title: 'Weigh both ways of being wrong',
              body: 'Error happens as a false alarm under $\\mathcal{H}_0$ or a miss under $\\mathcal{H}_1$; use $1 - Q(u) = Q(-u)$ to fold the miss term.',
              latex:
                'P_e = (1-p)\\,\\alpha + p\\,(1 - P_D) = (1-p)\\,\\alpha + p\\,Q\\!\\left(d_M - Q^{-1}(\\alpha)\\right)',
            },
            {
              title: 'Push the distance knob',
              body: 'For fixed $\\alpha$, growing $d_M$ increases the argument of the $Q$ in the miss term, so that $Q(\\cdot)$ — and with it $P_e$ — strictly decreases. Separation in the Mahalanobis metric is the only thing the error probability sees.',
            },
          ],
          answer: {
            sentence:
              'More Mahalanobis distance means fewer errors, whatever the prior mix.',
            latex:
              'P_e = (1-p)\\,\\alpha + p\\,Q\\!\\left(d_M - Q^{-1}(\\alpha)\\right)',
          },
        },
        {
          label: 'g',
          prompt:
            'Design the vector $\\mathbf{a}$ to maximize $d_M^2$ subject to $\\|\\mathbf{a}\\|^2 = 1$: set up and solve the Lagrangian.',
          steps: [
            {
              title: 'Write the constrained cost',
              body: 'Maximize the quadratic form on the unit sphere — this is walking the Tema 1 terrain along the circle $\\|\\mathbf{a}\\| = 1$.',
              latex:
                'L(\\mathbf{a}, \\gamma) = \\mathbf{a}^T\\mathbf{C}^{-1}\\mathbf{a} - \\gamma\\,(\\mathbf{a}^T\\mathbf{a} - 1)',
            },
            {
              title: 'Differentiate and recognize an eigenproblem',
              body: 'Setting the gradient to zero says the optimal $\\mathbf{a}$ is an eigenvector of $\\mathbf{C}^{-1}$ with eigenvalue $\\gamma$.',
              latex:
                '\\frac{\\partial L}{\\partial \\mathbf{a}} = 2\\mathbf{C}^{-1}\\mathbf{a} - 2\\gamma\\mathbf{a} = \\mathbf{0} \\;\\Longrightarrow\\; \\mathbf{C}^{-1}\\mathbf{a}_{op} = \\gamma\\,\\mathbf{a}_{op}',
            },
            {
              title: 'Pick which eigenvector by evaluating the cost',
              body: 'At any candidate the achieved distance is the eigenvalue itself, so take the largest one.',
              latex:
                'd_M^2 = \\mathbf{a}_{op}^T\\mathbf{C}^{-1}\\mathbf{a}_{op} = \\gamma\\,\\|\\mathbf{a}_{op}\\|^2 = \\gamma \\;\\Longrightarrow\\; \\gamma = \\lambda_{\\max}(\\mathbf{C}^{-1}),\\quad \\mathbf{a}_{op} = \\mathbf{u}_{\\max}(\\mathbf{C}^{-1})',
            },
          ],
          answer: {
            sentence:
              'The best codeword difference is the principal eigenvector of $\\mathbf{C}^{-1}$, and the best achievable distance is its largest eigenvalue.',
            latex:
              '\\mathbf{a}_{op} = \\mathbf{u}_{\\max}(\\mathbf{C}^{-1}), \\qquad d_M^2 = \\lambda_{\\max}(\\mathbf{C}^{-1})',
          },
        },
        {
          label: 'h',
          prompt:
            'Relate $\\mathbf{a}_{op}$ and the maximal $d_M^2$ to the eigenvectors and eigenvalues of the covariance matrix $\\mathbf{C}$, and comment.',
          steps: [
            {
              title: 'Invert the eigendecomposition',
              body: '$\\mathbf{C}$ and $\\mathbf{C}^{-1}$ share eigenvectors while eigenvalues invert, so “largest of the inverse” is “smallest of the original”.',
              latex:
                '\\mathbf{C} = \\mathbf{U}\\boldsymbol{\\Lambda}\\mathbf{U}^H \\;\\Rightarrow\\; \\mathbf{C}^{-1} = \\mathbf{U}\\boldsymbol{\\Lambda}^{-1}\\mathbf{U}^H \\;\\Rightarrow\\; \\mathbf{a}_{op} = \\mathbf{u}_{\\min}(\\mathbf{C}), \\quad d_M^2 = \\frac{1}{\\lambda_{\\min}(\\mathbf{C})}',
            },
            {
              title: 'Say it in one sentence',
              body: 'Separate the codewords along the direction where the noise is quietest; the detector $y = \\mathbf{a}^T\\mathbf{C}^{-1}\\mathbf{x}$ then listens only along that quiet axis. This is Tema 1’s “smallest eigenvalue is the noise floor” — cashed in for exam points.',
            },
          ],
          answer: {
            sentence:
              'Point the codeword difference down the quietest eigen-direction of the noise; the payoff is one over the smallest noise eigenvalue.',
            latex:
              '\\mathbf{a}_{op} = \\mathbf{u}_{\\min}(\\mathbf{C}), \\qquad d_M^2 = \\tfrac{1}{\\lambda_{\\min}(\\mathbf{C})}',
          },
        },
      ],
    },
    {
      id: 'wp-covert',
      source: 'Final · 19 Juny 2026 · Ex. 3 (33.3 %)',
      title: 'Covert communications: hiding under the noise floor',
      why: 'The energy detector of D4 taken seriously: unknown signal, chi-squared tails, then a central-limit shortcut — and a genuinely modern punchline, the square-root law that lets a transmission stay invisible to a warden yet readable by its intended receiver.',
      statement: [
        {
          kind: 'text',
          content:
            'In covert communications the goal is to transmit without a third party detecting that any transmission is happening — two prisoners talking past a warden. We study the warden’s detector. Under $\\mathcal{H}_0$ there is no transmission and the warden hears real white Gaussian noise of variance $\\sigma_w^2$; under $\\mathcal{H}_1$ the transmitted signal $s(n)$ — unknown to the warden, modeled as white Gaussian of power $P$ — is added. The transmission lasts $N$ samples:',
        },
        {
          kind: 'math',
          content:
            '\\mathcal{H}_0: \\; x(n) = w(n), \\qquad \\mathcal{H}_1: \\; x(n) = s(n) + w(n), \\qquad n = 0, \\dots, N-1',
        },
      ],
      parts: [
        {
          label: 'a',
          prompt:
            'A transmission is undetectable if the observations have the same statistics under $\\mathcal{H}_1$ and $\\mathcal{H}_0$. In which situation is the transmission undetectable: $P_D > P_{FA}$, $P_D = P_{FA}$, or $P_D < P_{FA}$?',
          steps: [
            {
              title: 'Push identical statistics through the test',
              body: 'If $f(\\mathbf{x}\\mid\\mathcal{H}_0) = f(\\mathbf{x}\\mid\\mathcal{H}_1)$, then any statistic $y = T(\\mathbf{x})$ also has identical distributions under both hypotheses, so $\\Pr(y > \\gamma)$ is the same number under each.',
              latex:
                'P_{FA} = \\Pr(y > \\gamma \\mid \\mathcal{H}_0) = \\Pr(y > \\gamma \\mid \\mathcal{H}_1) = P_D',
            },
            {
              title: 'Rule out the third case',
              body: '$P_D < P_{FA}$ never makes sense: flipping every decision of such a detector yields a better one with $P_D > P_{FA}$. The diagonal $P_D = P_{FA}$ of the ROC is the floor.',
            },
          ],
          answer: {
            sentence:
              'Undetectable means living on the ROC diagonal: $P_D = P_{FA}$ — the warden can do no better than flipping a coin with the same bias.',
            latex: 'P_D = P_{FA}',
          },
        },
        {
          label: 'b',
          prompt:
            'Define the vector model for the $N$ samples and find the likelihoods $f(\\mathbf{x}\\mid\\mathcal{H}_0)$ and $f(\\mathbf{x}\\mid\\mathcal{H}_1)$.',
          steps: [
            {
              title: 'Notice the signal is invisible in the mean',
              body: 'To the warden, $s(n)$ is just more zero-mean white Gaussian: the hypotheses differ only in variance, not in mean. That single observation determines the whole problem.',
              latex:
                '\\mathcal{H}_0: \\; \\mathbf{x} \\sim N(\\mathbf{0}, \\sigma_w^2\\mathbf{I}), \\qquad \\mathcal{H}_1: \\; \\mathbf{x} \\sim N(\\mathbf{0}, (P + \\sigma_w^2)\\,\\mathbf{I})',
            },
            {
              title: 'Write both densities',
              body: 'White covariance makes both densities functions of $\\mathbf{x}^T\\mathbf{x}$ alone.',
              latex:
                'f(\\mathbf{x}\\mid\\mathcal{H}_0) = \\frac{\\exp\\left(-\\mathbf{x}^T\\mathbf{x} / 2\\sigma_w^2\\right)}{(2\\pi\\sigma_w^2)^{N/2}}, \\qquad f(\\mathbf{x}\\mid\\mathcal{H}_1) = \\frac{\\exp\\left(-\\mathbf{x}^T\\mathbf{x} / 2(\\sigma_w^2{+}P)\\right)}{(2\\pi(\\sigma_w^2{+}P))^{N/2}}',
            },
          ],
          answer: {
            sentence:
              'Two zero-mean Gaussians that differ only in scale — all the evidence about the transmission lives in the size of the observations.',
          },
        },
        {
          label: 'c',
          prompt:
            'Find the Neyman–Pearson test function $y = T(\\mathbf{x})$ and interpret it.',
          steps: [
            {
              title: 'Take the log-ratio; only the energy survives',
              body: 'The likelihood ratio depends on the data through $\\mathbf{x}^T\\mathbf{x}$ with a positive coefficient (since $\\sigma_w^2 + P > \\sigma_w^2$), so the monotone simplification leaves the energy alone.',
              latex:
                '\\left(\\frac{1}{2\\sigma_w^2} - \\frac{1}{2(\\sigma_w^2 + P)}\\right)\\mathbf{x}^T\\mathbf{x} \\gtrless \\gamma_1 \\;\\Longrightarrow\\; y = T(\\mathbf{x}) = \\mathbf{x}^T\\mathbf{x} \\gtrless \\gamma_y',
              note: 'Normalized by $N$ it would read as an estimate of the observation power — the detector is literally a power meter.',
            },
          ],
          answer: {
            sentence:
              'The optimal warden measures total energy: with no known waveform to correlate against, variance is the only tell.',
            latex: 'y = \\mathbf{x}^T\\mathbf{x} \\gtrless \\gamma_y',
          },
        },
        {
          label: 'd',
          prompt:
            'Obtain $P_D$ as a function of $P_{FA}$, $N$, the $SNR = P/\\sigma_w^2$ and the function $Q_{\\chi^2_{N,1}}$. How would you choose the SNR to keep the transmission undetectable?',
          steps: [
            {
              title: 'Recognize the chi-squared statistic',
              body: 'A sum of $N$ squared i.i.d. Gaussians is chi-squared with $N$ degrees of freedom, scaled by the per-sample variance.',
              latex:
                'y\\mid\\mathcal{H}_0 \\sim \\chi^2_{N,\\,\\sigma_w^2}, \\qquad y\\mid\\mathcal{H}_1 \\sim \\chi^2_{N,\\,\\sigma_w^2 + P}',
            },
            {
              title: 'Normalize each tail to unit variance',
              body: 'Divide the statistic by the per-sample variance of the hypothesis at hand, so both tails use the same normalized function $Q_{\\chi^2_{N,1}}$; solve the false-alarm equation for the threshold.',
              latex:
                'P_{FA} = Q_{\\chi^2_{N,1}}\\!\\left(\\frac{\\gamma_y}{\\sigma_w^2}\\right) \\Rightarrow \\gamma_y = \\sigma_w^2\\,Q^{-1}_{\\chi^2_{N,1}}(P_{FA}), \\qquad P_D = Q_{\\chi^2_{N,1}}\\!\\left(\\frac{\\gamma_y}{\\sigma_w^2 + P}\\right)',
            },
            {
              title: 'Read the ROC and its hiding condition',
              body: 'The variance ratio compresses the threshold; as $SNR \\to 0$ the compression disappears and $P_D \\to P_{FA}$. Exactly $SNR = 0$ means not transmitting at all, so the prisoners can only approach invisibility.',
              latex:
                'P_D = Q_{\\chi^2_{N,1}}\\!\\left(\\frac{1}{1 + SNR}\\,Q^{-1}_{\\chi^2_{N,1}}(P_{FA})\\right) \\xrightarrow{\\;SNR \\to 0\\;} P_{FA}',
            },
          ],
          answer: {
            sentence:
              'The ROC depends on the transmission only through $1/(1+SNR)$: drive the SNR toward zero and the warden slides down to the diagonal.',
            latex:
              'P_D = Q_{\\chi^2_{N,1}}\\!\\left(\\tfrac{1}{1 + SNR}\\,Q^{-1}_{\\chi^2_{N,1}}(P_{FA})\\right)',
          },
        },
        {
          label: 'e',
          prompt:
            '(Optional) Find the mean and variance of the test statistic under each hypothesis. Use that $v \\sim N(0, \\sigma_v^2)$ implies $E\\{v^4\\} = 3\\sigma_v^4$.',
          steps: [
            {
              title: 'Work per sample, then scale by N',
              body: 'For one squared Gaussian the mean is the variance and — using the fourth-moment rule — the variance is twice its square. Independent samples then add.',
              latex:
                '\\operatorname{Var}\\{x^2(n)\\} = E\\{x^4(n)\\} - E^2\\{x^2(n)\\} = 3\\sigma^4 - \\sigma^4 = 2\\sigma^4',
            },
            {
              title: 'Assemble both hypotheses',
              body: 'Substitute $\\sigma^2 = \\sigma_w^2$ under $\\mathcal{H}_0$ and $\\sigma^2 = \\sigma_w^2 + P$ under $\\mathcal{H}_1$.',
              latex:
                '\\begin{aligned} y\\mid\\mathcal{H}_0&: \\; E = N\\sigma_w^2, \\; \\operatorname{Var} = 2N\\sigma_w^4 \\\\[2pt] y\\mid\\mathcal{H}_1&: \\; E = N(\\sigma_w^2{+}P), \\; \\operatorname{Var} = 2N(\\sigma_w^2{+}P)^2 \\end{aligned}',
              note: 'These are the parameters of the Gaussian approximation the statement hands you for the next part — now you know where they come from.',
            },
          ],
          answer: {
            sentence:
              'Mean grows like $N$, standard deviation like $\\sqrt{N}$ — that mismatch in growth rates is what the whole covertness story turns on.',
          },
        },
        {
          label: 'f',
          prompt:
            'Use the Gaussian approximation of the test statistic to get an alternative $P_D$ vs. $P_{FA}$ expression, then simplify using $\\sigma_w^2 \\gg P$.',
          steps: [
            {
              title: 'Solve the false-alarm equation for the threshold',
              body: 'Standard Gaussian tails now, instead of chi-squared ones.',
              latex:
                'P_{FA} = Q\\!\\left(\\frac{\\gamma_y - N\\sigma_w^2}{\\sqrt{2N\\sigma_w^4}}\\right) \\;\\Longrightarrow\\; \\gamma_y = \\sqrt{2N\\sigma_w^4}\\,Q^{-1}(P_{FA}) + N\\sigma_w^2',
            },
            {
              title: 'Standardize under H₁ and simplify',
              body: 'With $\\sigma_w^2 \\gg P$ (the SNR must be low to stay hidden anyway), replace $\\sigma_w^2 + P \\approx \\sigma_w^2$ — except where $P/\\sigma_w^2$ is multiplied by $N$, because $N$ can grow without bound.',
              latex:
                'P_D = Q\\!\\left(\\frac{\\sigma_w^2}{\\sigma_w^2 + P}\\,Q^{-1}(P_{FA}) - \\sqrt{\\frac{N}{2}}\\,\\frac{P}{\\sigma_w^2 + P}\\right) \\approx Q\\!\\left(Q^{-1}(P_{FA}) - \\sqrt{\\tfrac{N}{2}}\\,SNR\\right)',
            },
          ],
          answer: {
            sentence:
              'Detectability rides on the single product $\\sqrt{N/2} \\cdot SNR$: doubling the observation window buys the warden as much as raising the SNR by $\\sqrt{2}$.',
            latex:
              'P_D \\approx Q\\!\\left(Q^{-1}(P_{FA}) - \\sqrt{\\tfrac{N}{2}}\\,SNR\\right)',
          },
        },
        {
          label: 'g',
          prompt:
            'The intended receiver knows the waveform, so its trade-off is $P_D = Q(Q^{-1}(P_{FA}) - \\sqrt{N P / \\sigma_w^2})$. Keep $\\sigma_w^2$ fixed and choose $P = \\text{const}/N^{2/3}$. Compare warden and prisoner as $N \\to \\infty$.',
          steps: [
            {
              title: 'Scale the warden’s deflection',
              body: 'The warden’s argument shrinks: his detection probability collapses onto the false-alarm rate — asymptotically invisible.',
              latex:
                '\\sqrt{\\tfrac{N}{2}}\\,\\frac{P}{\\sigma_w^2} \\propto \\sqrt{N} \\cdot N^{-2/3} = N^{-1/6} \\to 0 \\;\\Longrightarrow\\; P_D^{\\text{warden}} \\to P_{FA}',
            },
            {
              title: 'Scale the prisoner’s deflection',
              body: 'Knowing the waveform earns a $\\sqrt{NP}$ law instead of $\\sqrt{N}\\,P$: the exponent flips sign and the same power schedule now diverges.',
              latex:
                '\\sqrt{\\frac{N P}{\\sigma_w^2}} \\propto \\sqrt{N \\cdot N^{-2/3}} = N^{1/6} \\to \\infty \\;\\Longrightarrow\\; P_D^{\\text{prisoner}} \\to Q(-\\infty) = 1',
            },
          ],
          answer: {
            sentence:
              'With power decaying like $N^{-2/3}$, a long enough transmission is simultaneously invisible to the warden and received with certainty by the prisoner — knowing the waveform is worth a full square root of $N$.',
          },
        },
      ],
    },
    {
      id: 'wp-pilot-detect',
      source: 'Final · 7 Gener 2026 · Ex. 2, parts a–c (of a–k)',
      title: 'Pilot tone on a power line: the matched filter',
      why: 'The known-signal counterpart to the covert-comms problem: when you know the waveform you correlate against it instead of measuring energy, and the deflection grows like $\\sqrt{2N\\,SNR}$. Complex data, so this is also where the $\\mathcal{CN}$ bookkeeping gets rehearsed.',
      statement: [
        {
          kind: 'text',
          content:
            'High-voltage lines carry a low-power pilot tone (kHz) whose disappearance at the receiving end signals damage to the conductor. After filtering out the power component, the monitoring system observes $N$ samples grouped as $\\mathbf{x}(n) = [x(n), \\dots, x(n{+}N{-}1)]^T$:',
        },
        {
          kind: 'math',
          content:
            '\\mathcal{H}_0: \\; \\mathbf{x}(n) = \\mathbf{w}(n), \\qquad \\mathcal{H}_1: \\; \\mathbf{x}(n) = A(n)\\,\\mathbf{s} + \\mathbf{w}(n)',
        },
        {
          kind: 'text',
          content:
            'where the tone frequency $f_0$ and complex amplitude $A_0$ are known and $w(n)$ is complex white Gaussian noise of zero mean and variance $\\sigma^2$.',
        },
      ],
      related: {
        text: 'This exam continues on the Wiener page: the predictor that boosts this detector',
        href: '/wiener#wp-pilot-predictor',
      },
      parts: [
        {
          label: 'a',
          prompt:
            'Define $A(n)$ and $\\mathbf{s}$, and find the likelihoods $f(\\mathbf{x}(n)\\mid\\mathcal{H}_0)$ and $f(\\mathbf{x}(n)\\mid\\mathcal{H}_1)$.',
          steps: [
            {
              title: 'Factor the tone into amplitude × steering vector',
              body: 'The complex exponential across the window is a fixed direction in complex $N$-space; the time index only rotates the scalar in front.',
              latex:
                'A(n) = A_0\\,e^{j2\\pi f_0 n}, \\qquad \\mathbf{s} = [1, \\; e^{j2\\pi f_0}, \\; \\dots, \\; e^{j2\\pi f_0 (N-1)}]^T',
            },
            {
              title: 'Write the complex Gaussian densities',
              body: 'Circular complex Gaussian noise: no factor $1/2$ in the exponent and $(\\pi\\sigma^2)^N$ in the normalization.',
              latex:
                'f(\\mathbf{x}\\mid\\mathcal{H}_0) = \\frac{e^{-\\|\\mathbf{x}\\|^2/\\sigma^2}}{(\\pi\\sigma^2)^N}, \\qquad f(\\mathbf{x}\\mid\\mathcal{H}_1) = \\frac{e^{-\\|\\mathbf{x} - A(n)\\mathbf{s}\\|^2/\\sigma^2}}{(\\pi\\sigma^2)^N}',
            },
          ],
          answer: {
            sentence:
              'A known complex signal in white complex noise — the cleanest possible mean-shift problem, just written in complex space.',
          },
        },
        {
          label: 'b',
          prompt:
            'Find the Neyman–Pearson test function $y = T(\\mathbf{x}(n))$.',
          steps: [
            {
              title: 'Expand the log-ratio and keep the cross term',
              body: 'The $\\|\\mathbf{x}\\|^2$ terms cancel; the real part of the inner product with the known signal survives, and the signal-energy term joins the threshold.',
              latex:
                '\\ln\\frac{f(\\mathbf{x}\\mid\\mathcal{H}_1)}{f(\\mathbf{x}\\mid\\mathcal{H}_0)} = \\frac{2\\operatorname{Re}\\!\\left[A(n)^*\\,\\mathbf{s}^H\\mathbf{x}(n)\\right] - |A_0|^2 N}{\\sigma^2} \\gtrless \\ln\\gamma',
            },
            {
              title: 'Normalize into the printed form',
              body: 'Divide by $2N/\\sigma^2$ and absorb every constant into the threshold: what remains is a correlator against the known tone.',
              latex:
                'y = \\frac{1}{N}\\operatorname{Re}\\!\\left[A(n)^*\\,\\mathbf{s}^H\\mathbf{x}(n)\\right] \\;\\gtrless\\; \\frac{\\sigma^2}{2N}\\ln\\gamma + \\frac{|A_0|^2}{2}',
            },
          ],
          answer: {
            sentence:
              'Correlate the window against a local replica of the tone and take the real part: the matched filter — the D3 move for a known signal.',
            latex:
              'y = \\tfrac{1}{N}\\operatorname{Re}[A(n)^*\\mathbf{s}^H\\mathbf{x}(n)]',
          },
        },
        {
          label: 'c',
          prompt:
            'Obtain $P_d$ as a function of $P_{fa}$, $N$ and $SNR = |A_0|^2/\\sigma^2$.',
          steps: [
            {
              title: 'Characterize the statistic under each hypothesis',
              body: 'The statistic is real and Gaussian. Under $\\mathcal{H}_1$ its mean is the tone power $|A_0|^2$, since $\\mathbf{s}^H\\mathbf{s} = N$; taking the real part halves the complex variance.',
              latex:
                'y\\mid\\mathcal{H}_0 \\sim N\\!\\left(0, \\tfrac{|A_0|^2\\sigma^2}{2N}\\right), \\qquad y\\mid\\mathcal{H}_1 \\sim N\\!\\left(|A_0|^2, \\tfrac{|A_0|^2\\sigma^2}{2N}\\right)',
            },
            {
              title: 'Spend the budget, then standardize under H₁',
              body: 'Solve the false-alarm equation for the threshold and shift by the $\\mathcal{H}_1$ mean; the deflection is the mean over the standard deviation.',
              latex:
                'P_d = Q\\!\\left(Q^{-1}(P_{fa}) - \\frac{|A_0|^2}{\\sqrt{|A_0|^2\\sigma^2/2N}}\\right) = Q\\!\\left(Q^{-1}(P_{fa}) - \\sqrt{2N \\cdot SNR}\\right)',
            },
          ],
          answer: {
            sentence:
              'Known waveform buys a deflection of $\\sqrt{2N\\,SNR}$ — compare the warden of the covert-comms problem, stuck at $\\sqrt{N/2}\\,SNR$: knowing what you listen for turns the SNR from a factor into a square root.',
            latex: 'P_d = Q\\!\\left(Q^{-1}(P_{fa}) - \\sqrt{2N\\,SNR}\\right)',
          },
        },
      ],
    },
    {
      id: 'wp-repeated-bit',
      source: 'Final · Juny 2025 · Ex. 1',
      title: 'A repeated bit on an unreliable disk',
      why: 'The only problem in the bank with discrete data — and the point is that nothing changes: likelihoods, log-ratio, MAP threshold, all the D5 machinery runs on Bernoulli products exactly as it did on Gaussians, and the optimal detector turns out to be something you already believed in: majority vote.',
      statement: [
        {
          kind: 'text',
          content:
            'An old, unreliable hard disk flips each stored bit independently with probability $\\varepsilon < 0.5$: $\\Pr(y_i \\neq x_i) = \\varepsilon$. To protect one information bit $b$, it is written $N$ times: all zeros for $b = 0$, all ones for $b = 1$. From the read vector $\\mathbf{y} = [y_1, \\dots, y_N]^T$ the detector must decide',
        },
        {
          kind: 'math',
          content:
            '\\mathcal{H}_0: \\; \\mathbf{x} = [0, \\dots, 0]^T \\qquad\\quad \\mathcal{H}_1: \\; \\mathbf{x} = [1, \\dots, 1]^T',
        },
        {
          kind: 'text',
          content:
            'minimizing the probability of error, with priors $\\Pr(b{=}1) = \\alpha$, $\\Pr(b{=}0) = 1 - \\alpha$.',
        },
      ],
      parts: [
        {
          label: 'a',
          prompt:
            'Find the statistics of the $N$ observations under each stored bit, $\\Pr(\\mathbf{y}\\mid\\mathcal{H}_0)$ and $\\Pr(\\mathbf{y}\\mid\\mathcal{H}_1)$.',
          steps: [
            {
              title: 'Multiply independent Bernoulli factors',
              body: 'Under $\\mathcal{H}_0$ every read one is an error (probability $\\varepsilon$) and every zero is correct; under $\\mathcal{H}_1$ the roles swap. The whole vector matters only through the count of ones, $\\mathbf{1}^T\\mathbf{y}$.',
              latex:
                '\\Pr(\\mathbf{y}\\mid\\mathcal{H}_0) = \\varepsilon^{\\mathbf{1}^T\\mathbf{y}}\\,(1-\\varepsilon)^{N - \\mathbf{1}^T\\mathbf{y}}, \\qquad \\Pr(\\mathbf{y}\\mid\\mathcal{H}_1) = (1-\\varepsilon)^{\\mathbf{1}^T\\mathbf{y}}\\,\\varepsilon^{N - \\mathbf{1}^T\\mathbf{y}}',
            },
          ],
          answer: {
            sentence:
              'Bernoulli products in which the count of ones already announces itself as the sufficient statistic.',
          },
        },
        {
          label: 'b',
          prompt:
            'Find the log-likelihood ratio and express it in terms of $\\log\\frac{1-\\varepsilon}{\\varepsilon} > 0$, $N$ and the observations $y_i$.',
          steps: [
            {
              title: 'Take logs and collect the count',
              body: 'Each read one contributes $+\\log\\frac{1-\\varepsilon}{\\varepsilon}$ of evidence for $\\mathcal{H}_1$ and each zero the same amount against — evidence arrives in identical discrete coins.',
              latex:
                '\\log\\frac{\\Pr(\\mathbf{y}\\mid\\mathcal{H}_1)}{\\Pr(\\mathbf{y}\\mid\\mathcal{H}_0)} = \\left(2\\,\\mathbf{1}^T\\mathbf{y} - N\\right)\\log\\frac{1-\\varepsilon}{\\varepsilon}',
              note: 'Because $\\varepsilon < 0.5$ the coin value $\\log\\frac{1-\\varepsilon}{\\varepsilon}$ is positive — a very noisy disk ($\\varepsilon \\to 0.5$) mints nearly worthless coins.',
            },
          ],
          answer: {
            sentence:
              'The log-ratio is linear in the count of ones: reading the disk is counting evidence coins.',
            latex:
              '\\log L(\\mathbf{y}) = (2\\,\\mathbf{1}^T\\mathbf{y} - N)\\log\\tfrac{1-\\varepsilon}{\\varepsilon}',
          },
        },
        {
          label: 'c',
          prompt:
            'Find the test function $t = T(\\mathbf{y})$ and the threshold $\\gamma$ minimizing the probability of error (MAP criterion).',
          steps: [
            {
              title: 'Compare the log-ratio against the prior odds',
              body: 'Minimum error means MAP: decide $\\mathcal{H}_1$ when the posterior wins, i.e. when the log-likelihood ratio exceeds $\\log\\frac{\\Pr(\\mathcal{H}_0)}{\\Pr(\\mathcal{H}_1)}$.',
              latex:
                '\\log\\frac{\\Pr(\\mathbf{y}\\mid\\mathcal{H}_1)}{\\Pr(\\mathbf{y}\\mid\\mathcal{H}_0)} > \\log\\frac{1-\\alpha}{\\alpha}',
            },
            {
              title: 'Isolate the count',
              body: 'Divide by the (positive) coin value and rearrange: the threshold is half the copies, shifted by the prior odds priced in coin units.',
              latex:
                't = \\mathbf{1}^T\\mathbf{y} = \\sum_{i=1}^{N} y_i \\;>\\; \\frac{N}{2} + \\frac{1}{2}\\,\\frac{\\log\\frac{1-\\alpha}{\\alpha}}{\\log\\frac{1-\\varepsilon}{\\varepsilon}} = \\gamma',
            },
          ],
          answer: {
            sentence:
              'Count the ones and compare against $N/2$ plus a prior correction — rare ones demand extra coins before you believe them, exactly the D5 slider.',
            latex:
              '\\gamma = \\frac{N}{2} + \\frac{1}{2}\\,\\frac{\\log\\frac{1-\\alpha}{\\alpha}}{\\log\\frac{1-\\varepsilon}{\\varepsilon}}',
          },
        },
        {
          label: 'd',
          prompt:
            'Particularize part (c) for equiprobable bits, $\\Pr(b{=}1) = \\Pr(b{=}0) = 0.5$, and interpret.',
          steps: [
            {
              title: 'Kill the prior term',
              body: 'With $\\alpha = 0.5$ the odds are even, the correction vanishes, and the rule reads: decide the bit was 1 if more than half the read copies are ones.',
              latex:
                't = \\mathbf{1}^T\\mathbf{y} > \\frac{N}{2} \\;\\Longrightarrow\\; \\hat{b} = 1',
            },
          ],
          answer: {
            sentence:
              'Majority vote is not folklore — it is the minimum-error detector, derived. And notably, $\\varepsilon$ dropped out: as long as the disk is better than a coin flip, the vote rule is the same.',
            latex:
              '\\text{majority vote: } \\mathbf{1}^T\\mathbf{y} \\gtrless N/2',
          },
        },
      ],
    },
  ],
}
