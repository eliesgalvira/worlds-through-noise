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
  examBank: [
    {
      exam: 'Final Jun 2026, Ex. 2',
      title: 'Concert hall vs jackhammer (scalar canceller)',
      move: 'P_z as a 1-D bowl; h_opt = (α+1)/(α²+1); mic placement drives α → 0.',
    },
    {
      exam: 'Final Jun 2025, Ex. 3',
      title: 'Echo cancellation with correlated speech',
      move: 'Regularize: R_x + μI shifts all eigenvalues up, taming the eigenvalue spread that ruins convergence.',
    },
    {
      exam: 'Teoría T4, Ejemplo 2',
      title: 'Channel equalization',
      move: 'h_opt = (CᴴC + I/SNR)⁻¹Cᴴδ: zero-forcer at high SNR, channel-matched filter at low SNR.',
    },
    {
      exam: 'Teoría T4, Ejemplo 1',
      title: 'System identification',
      move: 'White excitation makes R_x diagonal: h_opt = SNR/(SNR+1)·c, a shrunk copy of the unknown system.',
    },
  ],
}
