import type { LessonRecord } from '@/domain/types.ts'

export const wienerLesson: LessonRecord = {
  route: 'wiener',
  ordinal: '04',
  title: 'Wiener filtering',
  thesis:
    'The Wiener filter is the bottom of a bowl. Everything else — normal equations, orthogonality, prediction, cancellation — is a way of describing where the bottom is.',
  intro: [
    'Tema 4 asks one question in four costumes: given an observed process x(n) and a desired process d(n), what fixed linear filter makes hᴴx(n) resemble d(n) best in mean square? Identification, equalization, prediction and interference cancellation only differ in which wire carries which signal.',
    'The object to own is the error surface ξ(h) = P_d − 2Re{hᴴr_xd} + hᴴR_x h: a bowl over filter space whose shape is set by R_x and whose bottom is h_opt = R_x⁻¹r_xd. Tema 5 will roll a ball down this exact bowl, so time spent feeling its curvature pays twice.',
  ],
  modules: [
    {
      id: 'W1',
      title: 'The error bowl',
      question:
        'Where do the normal equations come from, and what does “orthogonality” mean physically?',
      trap: 'R_x h_opt = r_xd is memorized as “the formula,” and the orthogonality principle E[x(n)e*(n)] = 0 floats beside it as an unrelated slogan.',
      object:
        'A bowl. Every 2-tap filter h is a point on the floor; the height above it is the honestly computed error power ξ(h). The bowl is elliptical — its axes are the eigenvectors of R_x, its steepness along each axis is the eigenvalue. Somewhere on this floor is a lowest point.',
      action:
        'Drag h around and watch two meters: the error power ξ(h), and the correlation between the input and the residual error, E[x e*]. Away from the bottom, the residual still correlates with the input — there is leftover predictable material the filter failed to use. Slide downhill and watch that correlation drain to zero exactly at the bottom. That is the orthogonality principle: the optimum is the point where the error has nothing left in common with the data.',
      payoff:
        'The normal equations are just “∇ξ = 0 at the bottom”: R_x h = r_xd and E[x e*] = 0 are the same sentence in two notations. The minimum error ξ_min = P_d − hᴴ_opt r_xd, and the penalty for being wrong by Δh is Δξ = ΔhᴴR_xΔh — the bowl’s own quadratic. When r_xd = 0, the bottom is at h = 0: a filter cannot manufacture resemblance where no correlation exists.',
      equations: [
        {
          sentence:
            'The error power is a quadratic bowl over filter space; its unique minimum satisfies the normal equations.',
          latex:
            '\\xi(\\mathbf{h}) = P_d - \\mathbf{r}_{xd}^H\\mathbf{h} - \\mathbf{h}^H\\mathbf{r}_{xd} + \\mathbf{h}^H\\mathbf{R}_x\\mathbf{h}, \\qquad \\mathbf{R}_x\\,\\mathbf{h}_{opt} = \\mathbf{r}_{xd}',
        },
        {
          sentence:
            'At the optimum the error is statistically orthogonal to every observation the filter can see.',
          latex:
            'E\\{\\mathbf{x}(n)\\, e^*_{opt}(n)\\} = \\mathbf{0}, \\qquad \\xi_{min} = P_d - \\mathbf{h}_{opt}^H\\mathbf{r}_{xd}',
          caption:
            'And off the optimum: ξ = ξ_min + Δhᴴ R_x Δh — the excess is the bowl itself.',
        },
      ],
      prediction: {
        question:
          'The input x(n) is uncorrelated with d(n). Where is the bottom of the bowl and how deep is it?',
        answer:
          'At h = 0, with depth ξ_min = P_d. The best the filter can do is stay silent; filtering cannot create correlation.',
      },
      transfer:
        'System identification (exam staple): x = s + w_x, d = cᴴs + w_d gives h_opt = (SNR/(SNR+1))·c. Locate that answer on the bowl: noise on the input shrinks the bottom toward zero, never rotates it.',
      examRefs: [
        'Teoría T4 Ejemplo 1: identification, h_opt = SNR/(SNR+1)·c',
        'Teoría T4 Ejemplo 2: equalizer — zero-forcer at high SNR, matched filter at low SNR',
      ],
    },
    {
      id: 'W2',
      title: 'One knob against the jackhammer',
      question:
        'How does a reference microphone cancel noise it never measures cleanly?',
      trap: 'z(n) = x(n) − h·y(n) with a single scalar h looks too small to be an exam problem, yet the June 2026 final builds its entire filtering exercise on it — because every Wiener idea already lives inside one coefficient.',
      object:
        'A concert hall. Microphone 1 hears music plus jackhammer: x = s + w. Microphone 2, placed near the window, hears mostly jackhammer with a music leak α: y = αs + w. The knob h decides how much of mic 2 to subtract. Turn it too little and jackhammer survives; too much and you start subtracting the music’s leaked copy.',
      action:
        'Turn the knob and watch the residual power P_z = (1−hα)² + (1−h)² trace a parabola — the 1-D slice of the bowl. Find the bottom by hand; check it against h_opt = (α+1)/(α²+1). Then move the microphone: slide α toward 0 and watch cancellation become perfect (h_opt = 1, all jackhammer gone, music untouched); slide α toward 1 and watch the two mics become the same signal — subtracting one from the other removes music and noise alike.',
      payoff:
        'The design rule falls out physically: the reference sensor must hear the interference, not the signal. SNR_z = (1−h_optα)²/(1−h_opt)² explodes as α → 0. This tiny system is also the perfect seed for Tema 5: replace the knob-turning hand with a rule that senses the slope of the parabola, and you have invented LMS.',
      equations: [
        {
          sentence:
            'One coefficient, one parabola: the canceller’s residual power and its minimizing gain.',
          latex:
            'P_z(h) = (1-h\\alpha)^2 + (1-h)^2, \\qquad h_{opt} = \\frac{\\alpha+1}{\\alpha^2+1}',
          caption:
            'Unit-power music and noise, uncorrelated. α = 0 gives h_opt = 1 and total cancellation.',
        },
        {
          sentence:
            'In general form: the scalar Wiener filter is a correlation divided by a power.',
          latex:
            'h_{opt} = \\frac{r_{yx}}{P_y}, \\qquad \\xi_{min} = \\sigma_x^2\\,(1 - |\\rho_{xy}|^2)',
          caption:
            'ρ is the correlation coefficient: the fraction of d’s power a linear filter can ever remove.',
        },
      ],
      prediction: {
        question: 'With α = 1/2, can the jackhammer be fully removed?',
        answer:
          'No. h_opt = 6/5 leaves both a music dent and residual noise: once the reference is contaminated, cancellation and self-erasure trade against each other.',
      },
      transfer:
        'Final Jun 2026, Ex. 2(a–d): derive P_z, minimize, express z = As + Bw, and answer where to put the microphone. Then keep going — parts (e–g) hand the same knob to LMS.',
      examRefs: [
        'Final Jun 2026, Ex. 2: two-microphone canceller, scalar Wiener + LMS',
        'Teoría T4: fetal ECG and helicopter cancellation architectures',
      ],
    },
    {
      id: 'W3',
      title: 'A signal that remembers is a signal you can predict',
      question:
        'Why does a linear predictor separate tones from noise — without being told any frequencies?',
      trap: '“The prediction-error filter is a whitening filter” and “the ALE separates narrowband from wideband” sound like two more facts. They are one fact about memory, visible in the autocorrelation you built in Tema 1.',
      object:
        'A predictor betting on the next sample using the previous Q. Its ammunition is only correlation: a tone, whose r never decays, is perfectly predictable; white noise, whose r is a spike, is a coin flip. Feed it tone-plus-noise and the predictor can only chase the part with memory — its output y(n) is a cleaned tone, its error e(n) is what refused to be predicted.',
      action:
        'Slide the tone’s SNR and watch the honestly computed optimum (h_opt = R_x⁻¹r_x with R_x = |A|²ssᴴ + σ²I) split the signal: prediction output captures SNR·Q/(1+SNR·Q) of the tone; the error keeps the noise. Then look at the prediction-error filter’s frequency response: as SNR grows, a notch digs itself exactly at f₀ — no one told the filter the frequency; the autocorrelation did.',
      payoff:
        'Three exam objects become one: the ALE (delay long enough to decorrelate the wideband part, keep the narrowband correlation alive), the whitening interpretation (a long enough predictor eats all memory, leaving white error — used in DPCM and speech coding), and the eigen-story (as σ² → 0, R_x becomes rank-deficient, ξ_min → 0, and the error filter places a zero on the unit circle at e^{j2πf₀}). Prediction is Tema 1’s autocorrelation, weaponized.',
      equations: [
        {
          sentence:
            'The one-step predictor and its floor: what remains is what has no memory.',
          latex:
            '\\mathbf{R}_x\\,\\mathbf{h}_{opt} = \\mathbf{r}_x, \\qquad \\xi_{min} = r_x(0) - \\mathbf{r}_x^H\\mathbf{h}_{opt}',
        },
        {
          sentence:
            'For one tone in white noise the optimum is a steering vector scaled by how much memory survives the noise.',
          latex:
            '\\mathbf{h}_{opt} = \\mathbf{s}(-f_0)\\, e^{-j2\\pi f_0}\\, \\frac{\\mathrm{SNR}}{1 + Q\\cdot\\mathrm{SNR}}, \\qquad \\xi_{min} = \\sigma_w^2\\left(1 + \\frac{\\mathrm{SNR}}{1+Q\\cdot\\mathrm{SNR}}\\right)',
          caption:
            'SNR → 0: filter gives up (h → 0). SNR → ∞: perfect prediction of the tone, ξ_min → σ_w², and the error filter has a spectral null at f₀.',
        },
      ],
      prediction: {
        question:
          'M distinct tones in noise. What is the minimum predictor length that can cancel them all as σ² → 0?',
        answer:
          'Q = M: the error filter needs M zeros on the unit circle, one per tone — equivalently R_t has rank M.',
      },
      transfer:
        'Ejercicio 5.1 (ALE / spectrum overlay): choose the decorrelation delay D so the wideband channel forgets itself but the narrowband channels do not, then explain what appears at y(n) and at e(n).',
      examRefs: [
        'Teoría T4 Ejemplos 3–5: carrier recovery, multi-tone prediction, ALE',
        'Final Jun 2025, Ex. 3: echo cancellation with regularized R_x (adds μI — shifts every eigenvalue)',
      ],
    },
  ],
  workedProblems: [
    {
      id: 'wp-two-mics',
      source: 'Final · 19 Juny 2026 · Ex. 2, parts a–d (of a–g)',
      title: 'Two microphones: cancel the jackhammer, keep the music',
      why: 'The W2 canceller as a real exam problem, reduced to a single gain so every Wiener idea is visible by hand: the error-power bowl, the derivative that finds its bottom, and the physical placement rule that the algebra ends up dictating.',
      statement: [
        {
          kind: 'text',
          content:
            'A microphone in a concert hall captures $x(n) = s(n) + w(n)$: music $s(n)$ plus, uncorrelated with it, the noise $w(n)$ of a jackhammer outside. Both are zero-mean with unit power. A second microphone captures a simplified mixture $y(n) = \\alpha s(n) + w(n)$, with $0 \\leq \\alpha \\leq 1$. We form',
        },
        {
          kind: 'math',
          content:
            'z(n) = x(n) - h\\,y(n), \\qquad h_{opt} = \\arg\\min_h E\\{z^2(n)\\}',
        },
      ],
      related: {
        text: 'Parts e–g continue on the Adaptive page: LMS learns this h and pays a price',
        href: '/adaptive#wp-two-mics-lms',
      },
      parts: [
        {
          label: 'a',
          prompt: 'Write the power of $z(n)$, $P_z$.',
          steps: [
            {
              title: 'Group by source before squaring',
              body: 'Substitute both microphone models and collect the music and noise coefficients — $z(n)$ is a two-channel mixture with gains set by $h$.',
              latex:
                'z(n) = (s(n) + w(n)) - h(\\alpha s(n) + w(n)) = (1 - h\\alpha)\\,s(n) + (1 - h)\\,w(n)',
            },
            {
              title: 'Add powers of uncorrelated parts',
              body: 'No cross terms survive ($s \\perp w$, both unit power), so the powers of the two branches simply add.',
              latex: 'P_z = (1 - h\\alpha)^2 + (1 - h)^2',
            },
          ],
          answer: {
            sentence:
              'A one-dimensional parabola in $h$ — the W1 bowl, with one term trying to keep the music and the other trying to kill the noise.',
            latex: 'P_z = (1 - h\\alpha)^2 + (1 - h)^2',
          },
        },
        {
          label: 'b',
          prompt:
            'Find the $h$ minimizing $P_z$, and verify that $\\alpha = 0$ gives $h_{opt} = 1$, $P_z^{\\min} = 1$.',
          steps: [
            {
              title: 'Descend to the bottom of the bowl',
              body: 'Set the derivative to zero — the scalar normal equation.',
              latex:
                '\\frac{dP_z}{dh} = -2\\alpha(1 - h\\alpha) - 2(1 - h) = 0 \\;\\Longrightarrow\\; h_{opt} = \\frac{\\alpha + 1}{\\alpha^2 + 1}',
            },
            {
              title: 'Check the clean-reference case',
              body: 'With $\\alpha = 0$ the second microphone hears only the jackhammer: $h_{opt} = 1$ subtracts it exactly, and what remains is the unit-power music, $P_z^{\\min} = 1$ — total noise cancellation.',
            },
          ],
          answer: {
            sentence:
              'The optimal gain balances noise cancellation against music self-cancellation; a clean noise reference makes the cancellation perfect.',
            latex: 'h_{opt} = \\frac{\\alpha + 1}{\\alpha^2 + 1}',
          },
        },
        {
          label: 'c',
          prompt:
            'With $h = h_{opt}$, write $z(n) = A\\,s(n) + B\\,w(n)$, find $A$ and $B$, and obtain the SNR of $z(n)$ as a function of $\\alpha$.',
          steps: [
            {
              title: 'Substitute the optimal gain into both branches',
              body: 'Each coefficient becomes a rational function of $\\alpha$.',
              latex:
                'A = 1 - \\frac{(\\alpha+1)\\alpha}{\\alpha^2+1} = \\frac{1 - \\alpha}{\\alpha^2 + 1}, \\qquad B = 1 - \\frac{\\alpha+1}{\\alpha^2+1} = \\frac{\\alpha(\\alpha - 1)}{\\alpha^2 + 1}',
            },
            {
              title: 'Take the power ratio',
              body: 'Unit source powers make the SNR just $A^2/B^2$; the $(1-\\alpha)^2$ factors cancel.',
              latex:
                'SNR_z = \\frac{A^2}{B^2} = \\frac{(1-\\alpha)^2}{\\alpha^2(1-\\alpha)^2} = \\frac{1}{\\alpha^2}',
            },
          ],
          answer: {
            sentence:
              'The output SNR is $1/\\alpha^2$: the only thing that limits the canceller is how much music leaks into the reference microphone.',
            latex: 'SNR_z = \\frac{1}{\\alpha^2}',
          },
        },
        {
          label: 'd',
          prompt:
            'How should $\\alpha$ be for the best quality? Where should the second microphone be placed?',
          steps: [
            {
              title: 'Read the design rule off the SNR',
              body: 'SNR $= 1/\\alpha^2$ wants $\\alpha$ as small as possible, ideally $0$. Physically: put the reference microphone outside, right next to the jackhammer and as far from the music as possible. Otherwise Wiener — minimizing total output power — will happily cancel the music too, since to a power-minimizer all power is equally offensive.',
            },
          ],
          answer: {
            sentence:
              'Place the reference where it hears the enemy and not the friend: $\\alpha \\to 0$. This is the general rule of Wiener noise cancellation, derived rather than recited.',
          },
        },
      ],
    },
    {
      id: 'wp-pilot-predictor',
      source: 'Final · 7 Gener 2026 · Ex. 2, parts d–g (of a–k)',
      title: 'Predicting a pilot tone out of the noise',
      why: 'The W3 predictor on the course’s favorite signal model $\\mathbf{R}_x = |A_0|^2\\mathbf{s}^*\\mathbf{s}^T + \\sigma^2\\mathbf{I}$: one matrix-inversion-lemma move gives $\\mathbf{h}_{opt}$ in closed form, and the payoff is an SNR multiplied by $Q$. Continues the pilot-tone detector from the Detection page.',
      statement: [
        {
          kind: 'text',
          content:
            'Detecting the pilot tone $t(n) = A_0 e^{j2\\pi f_0 n}$ (Detection page, same exam) is hard at low SNR, so a linear predictor $\\mathbf{h}$ of $Q$ coefficients is inserted before the detector: it predicts the tone from the previous $Q$ samples, and detection is then performed on the prediction $\\hat{t}(n)$. The observation is $x(n) = t(n) + w(n)$ with complex white noise of variance $\\sigma^2$, and $SNR = |A_0|^2/\\sigma^2$.',
        },
      ],
      related: {
        text: 'Parts h–k continue on the Adaptive page: the same predictor learned by LMS',
        href: '/adaptive#wp-ale-lms',
      },
      parts: [
        {
          label: 'd',
          prompt:
            'Describe the block diagram (predictor + detector), naming every signal involved.',
          steps: [
            {
              title: 'Chain the two blocks',
              body: 'The predictor reads the vector of the $Q$ past samples $\\mathbf{x}(n-1) = [x(n-1), \\dots, x(n-Q)]^T$ and outputs $\\hat{x}(n) = \\mathbf{h}^H\\mathbf{x}(n-1)$, its guess of the tone at time $n$. That prediction — not the raw sample — feeds the Neyman–Pearson detector of part (b), which compares its statistic against the threshold to decide tone present / tone lost.',
            },
          ],
          answer: {
            sentence:
              'Past window → predictor $\\mathbf{h}$ → predicted tone $\\hat{x}(n)$ → matched-filter detector. The predictor’s job is to pass the tone and starve the noise.',
          },
        },
        {
          label: 'e',
          prompt:
            'Find the Wiener solution $\\mathbf{h}_{opt}$ for the predictor and show it can be written as $\\mathbf{h}_{opt} = \\frac{SNR}{1 + Q\\,SNR}\\,e^{-j2\\pi f_0}\\,\\mathbf{s}^*$.',
          steps: [
            {
              title: 'Write the normal equations for prediction',
              body: 'The desired signal is the next sample, so the cross-correlation vector is the autocorrelation at lag $-1$; the data matrix is the tone-plus-noise workhorse.',
              latex:
                '\\mathbf{h}_{opt} = \\mathbf{R}_x^{-1}\\mathbf{r}_x(-1), \\qquad \\mathbf{R}_x = |A_0|^2\\,\\mathbf{s}^*\\mathbf{s}^T + \\sigma^2\\mathbf{I}, \\qquad \\mathbf{r}_x(-1) = |A_0|^2 e^{-j2\\pi f_0}\\,\\mathbf{s}^*',
            },
            {
              title: 'Invert rank-one-plus-identity with the inversion lemma',
              body: 'The lemma turns the inverse into identity minus a scaled projector onto the tone direction — no honest matrix inversion needed.',
              latex:
                '\\mathbf{R}_x^{-1} = \\frac{1}{\\sigma^2}\\left(\\mathbf{I} - \\frac{SNR}{1 + Q\\,SNR}\\,\\mathbf{s}^*\\mathbf{s}^T\\right)',
            },
            {
              title: 'Multiply and collapse',
              body: 'Using $\\mathbf{s}^T\\mathbf{s}^* = Q$, the two terms combine into a single coefficient in front of $\\mathbf{s}^*$.',
              latex:
                '\\mathbf{h}_{opt} = \\frac{SNR}{1 + Q\\,SNR}\\,e^{-j2\\pi f_0}\\,\\mathbf{s}^*',
              note: 'Shape: a matched filter pointed at the tone direction, scaled down by how much the noise is trusted; the $e^{-j2\\pi f_0}$ advances the phase by the one-step prediction.',
            },
          ],
          answer: {
            sentence:
              'The optimal predictor is a shrunk, phase-advanced matched filter along the tone’s steering vector.',
            latex:
              '\\mathbf{h}_{opt} = \\frac{SNR}{1 + Q\\,SNR}\\,e^{-j2\\pi f_0}\\,\\mathbf{s}^*',
          },
        },
        {
          label: 'f',
          prompt:
            'Find $SNR_{out} = P_{t_{out}}/P_{w_{out}}$ at the predictor output, in terms of $SNR$ and $Q$.',
          steps: [
            {
              title: 'Pass tone and noise through the filter separately',
              body: 'The tone projects fully onto $\\mathbf{h}_{opt}$ (coherent gain $Q$); the white noise only contributes through $\\|\\mathbf{h}_{opt}\\|^2$.',
              latex:
                'P_{t_{out}} = |A_0|^2\\left(\\frac{Q\\,SNR}{1 + Q\\,SNR}\\right)^2, \\qquad P_{w_{out}} = \\sigma^2\\|\\mathbf{h}_{opt}\\|^2 = \\sigma^2\\,\\frac{Q\\,SNR^2}{(1 + Q\\,SNR)^2}',
            },
            {
              title: 'Divide and cancel',
              body: 'The $(1+Q\\,SNR)^2$ denominators cancel and one factor of $Q\\,SNR$ survives.',
              latex: 'SNR_{out} = \\frac{P_{t_{out}}}{P_{w_{out}}} = Q\\,SNR',
            },
          ],
          answer: {
            sentence:
              'The predictor multiplies the SNR by the number of taps: $Q$ samples of a perfectly predictable tone average coherently while the noise averages incoherently.',
            latex: 'SNR_{out} = Q \\cdot SNR',
          },
        },
        {
          label: 'g',
          prompt:
            'How does using the predictor affect the detection probability of part (c) (Detection page)?',
          steps: [
            {
              title: 'Carry the improved SNR into the ROC',
              body: 'Strictly, the noise at the predictor output is no longer white, so the NP test should be re-derived. But if it can be taken as approximately white, the part-(c) formula applies with $SNR \\to Q\\,SNR$.',
              latex:
                'P_d = Q\\!\\left(Q^{-1}(P_{fa}) - \\sqrt{2N\\,Q\\,SNR}\\right)',
            },
          ],
          answer: {
            sentence:
              'The deflection gains a factor $\\sqrt{Q}$: every extra predictor tap works like lengthening the detector’s observation window.',
            latex:
              'P_d = Q\\!\\left(Q^{-1}(P_{fa}) - \\sqrt{2NQ\\,SNR}\\right)',
          },
        },
      ],
    },
    {
      id: 'wp-ar-wiener',
      source: 'Exercise collection · Temes 4–5 (Feb 2026) · Ex. 4.1',
      title: 'The canonical AR(1) denoiser',
      why: 'The collection’s opening exercise and the numbers everyone should have solved once by hand: build $r_s(m)$ from the AR recursion (a Tema 1 move), fill the $2 \\times 2$ normal equations, and price the cleanup with the MMSE formula.',
      statement: [
        {
          kind: 'text',
          content:
            'Let $x(n) = s(n) + w(n)$, where $s(n)$ is an AR process satisfying the recursion',
        },
        {
          kind: 'math',
          content: 's(n) = 0.8\\,s(n-1) + v(n)',
        },
        {
          kind: 'text',
          content:
            'and $v(n)$, $w(n)$ are uncorrelated white noises with powers $\\sigma_v^2 = 0.49$ and $\\sigma_w^2 = 1$.',
        },
      ],
      parts: [
        {
          label: 'a',
          prompt:
            'Determine the autocorrelation sequences of $s(n)$ and of $x(n)$.',
          steps: [
            {
              title: 'Milk the recursion for the autocorrelation',
              body: 'Multiply the recursion by $s(n-m)$ and take expectations: for $m \\geq 1$ the innovation $v(n)$ is uncorrelated with the past, giving a geometric decay; at $m = 0$ the innovation contributes.',
              latex:
                'r_s(m) = 0.8\\,r_s(m-1) \\; (m \\geq 1), \\qquad r_s(0) = \\frac{\\sigma_v^2}{1 - 0.8^2} = \\frac{0.49}{0.36} = \\frac{49}{36}',
            },
            {
              title: 'Add the white observation noise',
              body: 'Signal and noise are uncorrelated, so autocorrelations add; the noise only shows up at lag zero.',
              latex:
                'r_s(m) = \\frac{49}{36}\\,0.8^{|m|}, \\qquad r_x(m) = r_s(m) + \\delta(m)',
            },
          ],
          answer: {
            sentence:
              'A geometrically fading memory of about 1.36 at lag zero, plus a unit noise spike on top — the exact shape the P2 slider builds.',
            latex: 'r_x(m) = \\tfrac{49}{36}\\,0.8^{|m|} + \\delta(m)',
          },
        },
        {
          label: 'b',
          prompt:
            'Design a Wiener filter of length $M = 2$ to estimate $s(n)$ from the samples of $x(n)$.',
          steps: [
            {
              title: 'Fill the normal equations',
              body: 'The data correlation matrix uses $r_x$; the cross-correlation with the desired clean signal is just $r_s$ (the noise is uncorrelated with $s$).',
              latex:
                '\\begin{bmatrix} \\tfrac{49}{36}{+}1 & \\tfrac{49}{36}\\,0.8 \\\\[2pt] \\tfrac{49}{36}\\,0.8 & \\tfrac{49}{36}{+}1 \\end{bmatrix}\\begin{bmatrix} h_0 \\\\ h_1 \\end{bmatrix} = \\begin{bmatrix} \\tfrac{49}{36} \\\\[2pt] \\tfrac{49}{36}\\,0.8 \\end{bmatrix}',
            },
            {
              title: 'Solve the 2×2 system',
              body: 'Numerically: $r_x(0) = 2.361$, $r_x(1) = 1.089$, $r_s(0) = 1.361$. Cramer or elimination gives the pair of taps.',
              latex: '\\hat{s}(n) = 0.462\\,x(n) + 0.248\\,x(n-1)',
            },
          ],
          answer: {
            sentence:
              'The filter keeps less than half of the current sample and borrows a quarter of the previous one — averaging along the signal’s memory to dilute the memoryless noise.',
            latex: 'h_0 = 0.462, \\qquad h_1 = 0.248',
          },
        },
        {
          label: 'c',
          prompt: 'Compute the minimum mean squared error for $M = 2$.',
          steps: [
            {
              title: 'Use the MMSE shortcut',
              body: 'At the bottom of the bowl the error is the desired-signal power minus what the filter managed to explain.',
              latex:
                'E_{\\min} = r_s(0) - \\mathbf{h}^T\\mathbf{r}_{sx} = \\frac{49}{36} - \\left(0.462 \\cdot \\frac{49}{36} + 0.248 \\cdot \\frac{49}{36} \\cdot 0.8\\right) = 0.462',
            },
          ],
          answer: {
            sentence:
              'The two-tap filter cuts the error power from $r_s(0) \\approx 1.36$ (using no filter at all would leave the full unit noise on top) down to $0.462$ — and the coincidence with $h_0 = 0.462$ is exactly that, a coincidence of these numbers.',
            latex: 'E_{\\min} = 0.462',
          },
        },
      ],
    },
  ],
}
