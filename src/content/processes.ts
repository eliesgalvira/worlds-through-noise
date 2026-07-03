import type { LessonRecord } from '@/domain/types.ts'

export const processesLesson: LessonRecord = {
  route: 'processes',
  ordinal: '01',
  title: 'Random processes',
  thesis:
    'A random signal is not a wiggly line. It is a machine that deals wiggly lines, and everything in this course is a question about the machine.',
  intro: [
    'Every later topic — detection, estimation, Wiener filtering, LMS — manipulates the same three objects: the ensemble behind one trace, the autocorrelation r_x(m), and the correlation matrix R_x. This lesson makes those three objects physical before anyone asks you to compute with them.',
    'If you can slice an ensemble, slide a copy of a signal past itself, and walk on a power terrain, Tema 1 stops being definitions and becomes furniture.',
  ],
  modules: [
    {
      id: 'P1',
      title: 'One trace hides an ensemble',
      question: 'What exactly is random about a random process?',
      trap: 'The notation x(n) looks like one signal, so “stationary” sounds like a property of the wiggle you see — maybe it means the wiggle is flat, or repeats. None of that is it.',
      object:
        'A deck of signals. The random process is the dealer; the trace on your screen is one card. Stack forty dealt traces on top of each other and the process becomes visible as a cloud with a shape.',
      action:
        'Freeze time: cut the stack vertically at one instant n and collect the forty values into a histogram. Now slide the cut left and right. Stationary means the histogram refuses to move when the cut moves. Switch to the burst process and watch the histogram breathe as you slide — that process is not stationary, and no single trace could have told you.',
      payoff:
        'E[x(n)] and σ²(n) stop being formulas: they are the center and width of the vertical slice. Stationarity (m_x(n) = m_x, r_x(n+m,n) = r_x(m)) just says the slices are interchangeable, so one clock time is as good as another. Ergodicity is the separate, stronger claim that the horizontal average along one dealt trace matches the vertical average across the deck — which is the only reason we can measure anything from a single recording.',
      equations: [
        {
          sentence:
            'A process is stationary (in the wide sense) when its first and second moments do not care where the time origin is.',
          latex:
            'm_X(n) = m_X, \\qquad r_X(n+m,\\,n) = E\\{x(n+m)\\,x^*(n)\\} = r_X(m)',
          caption:
            'The course says “PAE” for these processes. Everything from Tema 4 onward assumes them.',
        },
        {
          sentence:
            'Ergodicity lets a time average along one realization stand in for the ensemble average.',
          latex:
            '\\lim_{N\\to\\infty} \\frac{1}{2N+1} \\sum_{n=-N}^{N} x(n) = m_X',
          caption:
            'Assumed in practice whenever only one realization was ever recorded.',
        },
      ],
      prediction: {
        question:
          'The amplitude-burst process has a flat-looking mean. Is it stationary?',
        answer:
          'No. Slide the slice into the burst: the histogram widens, so σ²(n) depends on n. Stationarity is about the slices, not about the mean alone.',
      },
      transfer:
        'Speech is processed in short frames. Say precisely which assumption fails on whole sentences and is rescued frame by frame.',
      examRefs: [
        'Tema 1 slides: /f/→/u/ phoneme transition as a non-stationary power profile',
      ],
    },
    {
      id: 'P2',
      title: 'Autocorrelation is self-resemblance under a shift',
      question: 'What does r_x(m) actually measure?',
      trap: 'r_x(m) = E[x(n+m)x*(n)] reads as bookkeeping — an expectation with two time indices to memorize, hermitian symmetry as a fact to recite.',
      object:
        'The signal and a transparent copy of itself on a slider. At shift m, lay the copy over the original, multiply the overlapping samples, and average. Signals that still resemble themselves after the shift score high; signals with no memory score zero.',
      action:
        'Drag the lag m and watch the overlap product being averaged into one number — that number is r̂_x(m), and it gets stamped onto the growing autocorrelation plot. Do it for white noise (all resemblance dies at m ≠ 0), for filtered noise (resemblance fades over a few lags), and for a tone in noise (resemblance never dies, it oscillates forever).',
      payoff:
        'Every property becomes visible: r_x(0) is the power because at zero shift a signal resembles itself perfectly; r_x(m) can never beat r_x(0) because nothing overlaps better than no shift; and the power spectral density is just the same information asked in frequency — a wide, slowly-fading r_x means a narrow spectrum, a spiky r_x means a flat one. The Fourier pair is a change of language, not new content.',
      equations: [
        {
          sentence:
            'Power spectral density: the autocorrelation, re-expressed by frequency; the area under it is the power.',
          latex:
            'S_X(f) = \\sum_{k=-\\infty}^{+\\infty} r_X(k)\\, e^{-j2\\pi f k}, \\qquad P_X = r_X(0) = \\int_{-1/2}^{1/2} S_X(f)\\,df',
        },
        {
          sentence:
            'Filtering a stationary process reshapes its spectrum with the filter magnitude as a mask.',
          latex: 'S_Y(f) = |H(f)|^2\\, S_X(f), \\qquad m_y = m_x H(0)',
          caption:
            'The output stays stationary; only the sand under the curve is redistributed.',
        },
      ],
      prediction: {
        question:
          'For a pure complex tone A e^{jφ} e^{j2πf₀n} with random phase, what does r_x(m) look like?',
        answer:
          'r_x(m) = |A|² e^{j2πf₀m}: constant magnitude forever. A tone never forgets itself; its spectrum is a single spike at f₀.',
      },
      transfer:
        'A prediction filter can only exploit memory. Read from an autocorrelation plot how many lags of memory are available, and say what happens to predictability when r_x(m) = P_x δ(m).',
      examRefs: [
        'Tema 1 collection: r_x of tone, white noise, and tone+noise (the R_x = |A|²ssᴴ + σ²I workhorse)',
      ],
    },
    {
      id: 'P3',
      title: 'The correlation matrix is a terrain',
      question:
        'Why do eigenvectors of R_x keep deciding the answer to design problems?',
      trap: 'R_x = E[xxᴴ] looks like a table of numbers, and “find the eigenvector of the covariance” looks like a trick someone pulls out of a hat in exercise after exercise.',
      object:
        'A landscape. For a 2-tap filter h, the output power P_y = hᴴR_x h assigns a height to every point of the (h₀, h₁) plane. The iso-power curves are ellipses; R_x is not a table, it is this terrain. The eigenvectors are the ellipse axes; the eigenvalues are how steeply power grows along each axis.',
      action:
        'Drag h across the plane and read the honestly computed power hᴴR_x h. Then constrain yourself to the unit circle ‖h‖ = 1 and walk it: the power rises and falls, and its maximum sits exactly where the circle crosses the long axis of the ellipses. You have just solved max hᴴR_x h subject to ‖h‖ = 1 with your hands — the answer is the principal eigenvector, and the height there is λ_max.',
      payoff:
        'The Tema 1 exam classic — design the filter that maximizes SNR for a tone in white noise — stops being Lagrange-multiplier ritual. R_x = |A|²s sᴴ + σ²I makes a cigar-shaped terrain whose long axis is the steering vector s, so the best unit filter is s itself, and every other eigen-direction is pure noise floor σ². The same terrain runs the whole course: it is the MSE bowl of Tema 4 and the convergence landscape of Tema 5.',
      equations: [
        {
          sentence:
            'Filter output power is a quadratic form: a height on the terrain over filter space.',
          latex:
            'P_y = E\\,|\\mathbf{h}^H\\mathbf{x}(n)|^2 = \\mathbf{h}^H \\mathbf{R}_x \\mathbf{h} = \\sum_{i} \\lambda_i\\, |z_i|^2,\\quad z_i = \\mathbf{u}_i^H\\mathbf{h}',
          caption:
            'In the eigenvector basis the terrain has no cross-terms: each direction contributes independently.',
        },
        {
          sentence:
            'The unit-norm filter with maximum output power is the principal eigenvector.',
          latex:
            '\\max_{\\|\\mathbf{h}\\|=1} \\mathbf{h}^H \\mathbf{R}_x \\mathbf{h} = \\lambda_{max},\\qquad \\mathbf{h}_{opt} = \\mathbf{u}_{max}',
        },
      ],
      prediction: {
        question:
          'For white noise, R_x = σ²I. What does the terrain look like, and which unit filter is best?',
        answer:
          'A perfectly round bowl: circles instead of ellipses. Every unit filter gives the same power σ² — there is no preferred direction to exploit.',
      },
      transfer:
        'Pulse design (Tema 2, radar): to maximize detection SNR in colored noise, the pulse must be the eigenvector of C_w with the smallest eigenvalue. Restate that as a fact about walking this terrain for C_w instead of R_x.',
      examRefs: [
        'Parcial Oct 2025, Ex. 1: codeword design in colored noise via eigen-directions',
        'Tema 1 ejercicio final: max-SNR FIR filter for a noisy tone',
      ],
    },
  ],
  examBank: [
    {
      exam: 'Parcial Abr 2026, Ex. 1',
      title: 'Amplifier gain: mean and variance both carry information',
      move: 'Write f(x; A) noting that A scales both the mean αA and the noise σ²A² — the log-likelihood then has a −N ln A term.',
    },
    {
      exam: 'Parcial Oct 2025, Ex. 1',
      title: 'Codeword separation in colored noise',
      move: 'Distance that matters is Mahalanobis distance; separation is best along the quiet eigen-direction of C.',
    },
    {
      exam: 'Tema 1 collection',
      title: 'R_x of tone + white noise, eigenvalues and eigenvectors',
      move: 'R_x = |A|²ssᴴ + σ²I has one eigenvalue N|A|² + σ² along s/‖s‖ and the rest σ² — memorize the shape, not the algebra.',
    },
  ],
}
