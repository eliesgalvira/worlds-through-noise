import type { LessonRecord } from '@/domain/types.ts'

export const processesLesson: LessonRecord = {
  route: 'processes',
  ordinal: '01',
  title: 'Random processes',
  thesis:
    'A random signal is not a wiggly line. It is a machine that deals wiggly lines, and everything in this course is a question about the machine.',
  intro: [
    'Every later topic — detection, estimation, Wiener filtering, LMS — manipulates the same three objects: the ensemble behind one trace, the autocorrelation $r_x(m)$, and the correlation matrix $\\mathbf{R}_x$. This lesson makes those three objects physical before anyone asks you to compute with them.',
    'If you can slice an ensemble, slide a copy of a signal past itself, and walk on a power terrain, Tema 1 stops being definitions and becomes furniture.',
  ],
  modules: [
    {
      id: 'P1',
      title: 'One trace hides an ensemble',
      question: 'What exactly is random about a random process?',
      trap: 'The notation $x(n)$ looks like one signal, so “stationary” sounds like a property of the wiggle you see — maybe it means the wiggle is flat, or repeats. None of that is it.',
      object:
        'A deck of signals. The random process is the dealer; the trace on your screen is one card. Stack forty dealt traces on top of each other and the process becomes visible as a cloud with a shape.',
      action:
        'Freeze time: cut the stack vertically at one instant $n$ and collect the forty values into a histogram. Now slide the cut left and right. Stationary means the histogram refuses to move when the cut moves. Switch to the burst process and watch the histogram breathe as you slide — that process is not stationary, and no single trace could have told you.',
      payoff:
        '$E\\{x(n)\\}$ and $\\sigma^2(n)$ stop being formulas: they are the center and width of the vertical slice. Stationarity ($m_x(n) = m_x$, $r_x(n{+}m, n) = r_x(m)$) just says the slices are interchangeable, so one clock time is as good as another. Ergodicity is the separate, stronger claim that the horizontal average along one dealt trace matches the vertical average across the deck — which is the only reason we can measure anything from a single recording.',
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
          'No. Slide the slice into the burst: the histogram widens, so $\\sigma^2(n)$ depends on $n$. Stationarity is about the slices, not about the mean alone.',
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
      question: 'What does $r_x(m)$ actually measure?',
      trap: '$r_x(m) = E\\{x(n{+}m)\\,x^*(n)\\}$ reads as bookkeeping — an expectation with two time indices to memorize, hermitian symmetry as a fact to recite.',
      object:
        'The signal and a transparent copy of itself on a slider. At shift $m$, lay the copy over the original, multiply the overlapping samples, and average. Signals that still resemble themselves after the shift score high; signals with no memory score zero.',
      action:
        'Drag the lag $m$ and watch the overlap product being averaged into one number — that number is $\\hat{r}_x(m)$, and it gets stamped onto the growing autocorrelation plot. Do it for white noise (all resemblance dies at $m \\neq 0$), for filtered noise (resemblance fades over a few lags), and for a tone in noise (resemblance never dies, it oscillates forever).',
      payoff:
        'Every property becomes visible: $r_x(0)$ is the power because at zero shift a signal resembles itself perfectly; $r_x(m)$ can never beat $r_x(0)$ because nothing overlaps better than no shift; and the power spectral density is just the same information asked in frequency — a wide, slowly-fading $r_x$ means a narrow spectrum, a spiky $r_x$ means a flat one. The Fourier pair is a change of language, not new content.',
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
          'For a pure complex tone $A e^{j\\varphi} e^{j2\\pi f_0 n}$ with random phase, what does $r_x(m)$ look like?',
        answer:
          '$r_x(m) = |A|^2 e^{j2\\pi f_0 m}$: constant magnitude forever. A tone never forgets itself; its spectrum is a single spike at $f_0$.',
      },
      transfer:
        'A prediction filter can only exploit memory. Read from an autocorrelation plot how many lags of memory are available, and say what happens to predictability when $r_x(m) = P_x\\,\\delta(m)$.',
      examRefs: [
        'Tema 1 collection: $r_x$ of tone, white noise, and tone+noise (the $\\mathbf{R}_x = |A|^2\\mathbf{s}\\mathbf{s}^H + \\sigma^2\\mathbf{I}$ workhorse)',
      ],
    },
    {
      id: 'P3',
      title: 'The correlation matrix is a terrain',
      question:
        'Why do eigenvectors of $\\mathbf{R}_x$ keep deciding the answer to design problems?',
      trap: '$\\mathbf{R}_x = E\\{\\mathbf{x}\\mathbf{x}^H\\}$ looks like a table of numbers, and “find the eigenvector of the covariance” looks like a trick someone pulls out of a hat in exercise after exercise.',
      object:
        'A landscape. For a 2-tap filter $\\mathbf{h}$, the output power $P_y = \\mathbf{h}^H\\mathbf{R}_x\\mathbf{h}$ assigns a height to every point of the $(h_0, h_1)$ plane. The iso-power curves are ellipses; $\\mathbf{R}_x$ is not a table, it is this terrain. The eigenvectors are the ellipse axes; the eigenvalues are how steeply power grows along each axis.',
      action:
        'Drag $\\mathbf{h}$ across the plane and read the honestly computed power $\\mathbf{h}^H\\mathbf{R}_x\\mathbf{h}$. Then constrain yourself to the unit circle $\\|\\mathbf{h}\\| = 1$ and walk it: the power rises and falls, and its maximum sits exactly where the circle crosses the long axis of the ellipses. You have just solved $\\max \\mathbf{h}^H\\mathbf{R}_x\\mathbf{h}$ subject to $\\|\\mathbf{h}\\| = 1$ with your hands — the answer is the principal eigenvector, and the height there is $\\lambda_{\\max}$.',
      payoff:
        'The Tema 1 exam classic — design the filter that maximizes SNR for a tone in white noise — stops being Lagrange-multiplier ritual. $\\mathbf{R}_x = |A|^2\\mathbf{s}\\mathbf{s}^H + \\sigma^2\\mathbf{I}$ makes a cigar-shaped terrain whose long axis is the steering vector $\\mathbf{s}$, so the best unit filter is $\\mathbf{s}$ itself, and every other eigen-direction is pure noise floor $\\sigma^2$. The same terrain runs the whole course: it is the MSE bowl of Tema 4 and the convergence landscape of Tema 5.',
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
          'For white noise, $\\mathbf{R}_x = \\sigma^2\\mathbf{I}$. What does the terrain look like, and which unit filter is best?',
        answer:
          'A perfectly round bowl: circles instead of ellipses. Every unit filter gives the same power $\\sigma^2$ — there is no preferred direction to exploit.',
      },
      transfer:
        'Pulse design (Tema 2, radar): to maximize detection SNR in colored noise, the pulse must be the eigenvector of $\\mathbf{C}_w$ with the smallest eigenvalue. Restate that as a fact about walking this terrain for $\\mathbf{C}_w$ instead of $\\mathbf{R}_x$.',
      examRefs: [
        'Parcial Oct 2025, Ex. 1: codeword design in colored noise via eigen-directions',
        'Tema 1 ejercicio final: max-SNR FIR filter for a noisy tone',
      ],
    },
  ],
  workedProblems: [
    {
      id: 'wp-sinusoid-predictor',
      source: 'Exercise collection · Temes 4–5 (Feb 2026) · Ex. 4.8',
      title: 'A sinusoid that predicts itself',
      why: 'Tema 1 never gets its own exam problem — its moves open the others. This exercise runs both P1 and P2: an ensemble average over the random phase gives the exact $r_x(m)$, then a single recorded realization has to reproduce it by time averages, and you watch the biased estimator fall short.',
      statement: [
        {
          kind: 'text',
          content: 'Consider the stochastic process consisting of the sinusoid',
        },
        {
          kind: 'math',
          content:
            'x(n) = 2\\cos\\!\\left(\\tfrac{\\pi}{2}n + \\varphi\\right)',
        },
        {
          kind: 'text',
          content:
            'where the phase $\\varphi$ is a random variable uniformly distributed in $[-\\pi, \\pi)$.',
        },
      ],
      parts: [
        {
          label: 'a',
          prompt:
            'Give the expression of the autocorrelation $r_x(m)$ of the process. Starting from the orthogonality principle, derive the equations of the optimal linear predictor of order 2 and solve them for the predictor coefficients.',
          steps: [
            {
              title: 'Average over the phase, not over time',
              body: 'The only random thing here is $\\varphi$, so the expectation is an average over the phase deck. Expand the product of cosines; the term carrying $2\\varphi$ averages to zero over a full uniform circle.',
              latex:
                '\\begin{aligned} r_x(m) &= E\\{x(n+m)\\,x(n)\\} = 2\\cos\\!\\left(\\tfrac{\\pi}{2}m\\right) + 2\\,\\underbrace{E\\left\\{\\cos\\!\\left(\\tfrac{\\pi}{2}(2n+m) + 2\\varphi\\right)\\right\\}}_{=\\,0} \\\\[2pt] &= 2\\cos\\!\\left(\\tfrac{\\pi}{2}m\\right) \\end{aligned}',
              note: 'No $n$ survives — the phase average makes the process stationary, exactly the P1 move.',
            },
            {
              title: 'Impose orthogonality of the error to the data',
              body: 'The order-2 predictor is $\\hat{x}(n) = a_1 x(n-1) + a_2 x(n-2)$. The optimal error $e(n) = x(n) - \\hat{x}(n)$ must be orthogonal to every sample the predictor is allowed to use.',
              latex:
                'E\\{e(n)\\,x(n-k)\\} = 0,\\; k=1,2 \\;\\Longrightarrow\\; \\begin{bmatrix} r_x(0) & r_x(1) \\\\ r_x(1) & r_x(0) \\end{bmatrix} \\begin{bmatrix} a_1 \\\\ a_2 \\end{bmatrix} = \\begin{bmatrix} r_x(1) \\\\ r_x(2) \\end{bmatrix}',
            },
            {
              title: 'Insert the three lags and solve',
              body: 'From step 1: $r_x(0) = 2$, $r_x(1) = 2\\cos(\\pi/2) = 0$, $r_x(2) = 2\\cos(\\pi) = -2$. The matrix is diagonal, so the system falls apart into two scalar equations.',
              latex:
                '\\begin{bmatrix} 2 & 0 \\\\ 0 & 2 \\end{bmatrix} \\begin{bmatrix} a_1 \\\\ a_2 \\end{bmatrix} = \\begin{bmatrix} 0 \\\\ -2 \\end{bmatrix} \\;\\Longrightarrow\\; a_1 = 0,\\quad a_2 = -1',
            },
          ],
          answer: {
            sentence:
              'The optimal order-2 predictor is $\\hat{x}(n) = -x(n-2)$: the tone never forgets itself, and two samples back it is exactly its own negative.',
            latex: 'a_1 = 0, \\qquad a_2 = -1',
          },
        },
        {
          label: 'b',
          prompt:
            'Now take the realization of the process with phase $\\varphi = 0$. With $N = 8$, sketch $x(n)$ for $n = 0, \\dots, N-1$ and use the picture to explain the coefficient values found in part (a).',
          steps: [
            {
              title: 'List the eight samples',
              body: 'With $\\varphi = 0$, $x(n) = 2\\cos(\\pi n / 2)$ cycles with period 4.',
              latex:
                'x(n) = 2,\\; 0,\\; -2,\\; 0,\\; 2,\\; 0,\\; -2,\\; 0 \\qquad (n = 0,\\dots,7)',
            },
            {
              title: 'Read the predictor off the picture',
              body: 'Every sample is minus the sample two steps before: $x(n) = -x(n-2)$ holds exactly, for every $n$. The sample one step before is useless (it sits on a zero crossing when the current sample peaks), which is why $a_1 = 0$.',
            },
          ],
          answer: {
            sentence:
              'The coefficients just restate the period-4 structure of the wave: $a_2 = -1$ copies the sample from half a period ago with a sign flip, and the prediction error is exactly zero.',
          },
        },
        {
          label: 'c',
          prompt:
            'Determine the predictor coefficients using the biased estimator of the autocorrelation on this realization. Compare the results for $N = 8$ and $N = 4$ against part (a). What happens as $N \\to \\infty$, and why?',
          steps: [
            {
              title: 'Estimate the lags with the biased formula',
              body: 'The biased estimator always divides by $N$, even though only $N - m$ products exist at lag $m$. On the record $2, 0, -2, 0, \\dots$ the lag-1 products are all zero, and each nonzero lag-2 product equals $-4$.',
              latex:
                '\\hat{r}_x(m) = \\frac{1}{N} \\sum_{n=0}^{N-1-m} x(n)\\,x(n+m): \\qquad \\hat{r}_x(0) = 2, \\quad \\hat{r}_x(1) = 0, \\quad \\hat{r}_x(2) = \\begin{cases} -\\tfrac{12}{8} = -\\tfrac{3}{2} & N = 8 \\\\[2pt] -\\tfrac{4}{4} = -1 & N = 4 \\end{cases}',
            },
            {
              title: 'Solve the same normal equations with the estimates',
              body: 'The estimated matrix is still diagonal with $\\hat{r}_x(0) = 2$, so $a_2 = \\hat{r}_x(2) / 2$.',
              latex:
                'N = 8: \\; a_1 = 0,\\; a_2 = -\\tfrac{3}{4} \\qquad\\quad N = 4: \\; a_1 = 0,\\; a_2 = -\\tfrac{1}{2}',
            },
            {
              title: 'Let the record grow',
              body: 'At lag $m$ the biased estimator misses exactly $m$ products but still divides by $N$, so it multiplies the true lag by $(N-m)/N$. As $N \\to \\infty$ that triangular taper flattens out and $a_2 \\to -1$: the time average converges to the ensemble answer of part (a) — ergodicity at work.',
            },
          ],
          answer: {
            sentence:
              'The biased estimate shrinks the lag-2 correlation by the factor $(N-2)/N$ — a half at $N=4$, a quarter at $N=8$ — and the predictor inherits the shrinkage; only as $N \\to \\infty$ does $a_2$ reach $-1$.',
            latex:
              'a_2 = -\\tfrac{1}{2} \\;(N{=}4), \\qquad a_2 = -\\tfrac{3}{4} \\;(N{=}8), \\qquad a_2 \\to -1 \\;(N \\to \\infty)',
          },
        },
        {
          label: 'd',
          prompt:
            'Repeat part (c) with $N = 8$ for the unbiased estimator. Compare the resulting coefficients. Why does the biased estimator do worse here?',
          steps: [
            {
              title: 'Divide by the number of products actually summed',
              body: 'The unbiased estimator divides each lag by $N - m$ instead of $N$, removing the triangular taper.',
              latex:
                '\\hat{r}_x^{u}(m) = \\frac{1}{N-m} \\sum_{n=0}^{N-1-m} x(n)\\,x(n+m): \\qquad \\hat{r}_x^{u}(0) = 2, \\quad \\hat{r}_x^{u}(1) = 0, \\quad \\hat{r}_x^{u}(2) = -\\tfrac{12}{6} = -2',
            },
            {
              title: 'Solve and compare',
              body: 'The normal equations now reproduce the exact lags of part (a), so the coefficients come out exact: $a_1 = 0$, $a_2 = -1$. The biased estimator does worse on this signal because its taper $(N-m)/N$ systematically underestimates long-lag memory, pulling the predictor toward doing nothing — even though on noisy data the same taper is what keeps estimated correlation matrices well behaved.',
            },
          ],
          answer: {
            sentence:
              'The unbiased estimate recovers $a_1 = 0$, $a_2 = -1$ exactly at $N = 8$. The biased version loses because its built-in triangular window shrinks exactly the lag the predictor needs.',
            latex: 'a_1 = 0, \\qquad a_2 = -1',
          },
        },
      ],
    },
    {
      id: 'wp-tone-noise',
      source: 'Exercise collection · Temes 4–5 (Feb 2026) · Ex. 4.9',
      title: 'Tone in noise: the workhorse autocorrelation',
      why: 'This is the $r_x(m) = P\\cos(\\omega_1 m) + \\sigma_w^2\\,\\delta(m)$ object that P2 builds and P3 walks on. Part (d) is the eigenvalue fact the Oct 2025 exam (Detection workbook, last part) pays real points for.',
      statement: [
        {
          kind: 'text',
          content:
            'A signal $x(n)$ consists of a sinusoid of power $P$, frequency $\\omega_1$ and phase uniformly distributed in $[0, 2\\pi)$, immersed in white noise of power $\\sigma_w^2$, independent of the sinusoid.',
        },
      ],
      parts: [
        {
          label: 'a',
          prompt: 'Find the exact autocorrelation of $x(n)$.',
          steps: [
            {
              title: 'Autocorrelation of the tone alone',
              body: 'A sinusoid of power $P$ has amplitude $\\sqrt{2P}$. The same phase-averaging as in Ex. 4.8 kills the $2\\varphi$ term and leaves a cosine in the lag.',
              latex:
                'r_s(m) = E\\left\\{\\sqrt{2P}\\cos(\\omega_1(n{+}m) + \\varphi)\\cdot\\sqrt{2P}\\cos(\\omega_1 n + \\varphi)\\right\\} = P\\cos(\\omega_1 m)',
            },
            {
              title: 'Independent parts add their autocorrelations',
              body: 'Tone and noise are independent and zero-mean, so cross terms vanish and the white noise contributes only at zero lag.',
              latex:
                'r_x(m) = r_s(m) + r_w(m) = P\\cos(\\omega_1 m) + \\sigma_w^2\\,\\delta(m)',
              note: 'Memorize the shape: an everlasting cosine floor plus a spike of noise power at $m = 0$.',
            },
          ],
          answer: {
            sentence:
              'The tone never forgets itself; the noise forgets instantly.',
            latex: 'r_x(m) = P\\cos(\\omega_1 m) + \\sigma_w^2\\,\\delta(m)',
          },
        },
        {
          label: 'b',
          prompt:
            'Determine the coefficients of the optimal order-2 predictor as functions of $\\omega_1$ and $\\sigma_w^2$.',
          steps: [
            {
              title: 'Fill the normal equations with the lags',
              body: 'The predictor $\\hat{x}(n) = h_0 x(n-1) + h_1 x(n-2)$ needs $r_x(0) = P + \\sigma_w^2$, $r_x(1) = P\\cos\\omega_1$, $r_x(2) = P\\cos 2\\omega_1$.',
              latex:
                '\\begin{bmatrix} P + \\sigma_w^2 & P\\cos\\omega_1 \\\\ P\\cos\\omega_1 & P + \\sigma_w^2 \\end{bmatrix} \\begin{bmatrix} h_0 \\\\ h_1 \\end{bmatrix} = \\begin{bmatrix} P\\cos\\omega_1 \\\\ P\\cos 2\\omega_1 \\end{bmatrix}',
            },
            {
              title: 'Solve the 2×2 system (Cramer)',
              body: 'Divide each determinant by $\\Delta = (P+\\sigma_w^2)^2 - (P\\cos\\omega_1)^2$.',
              latex:
                'h_0 = \\frac{P\\cos\\omega_1\\left[(P + \\sigma_w^2) - P\\cos 2\\omega_1\\right]}{(P+\\sigma_w^2)^2 - (P\\cos\\omega_1)^2}, \\qquad h_1 = \\frac{(P + \\sigma_w^2)P\\cos 2\\omega_1 - (P\\cos\\omega_1)^2}{(P+\\sigma_w^2)^2 - (P\\cos\\omega_1)^2}',
              note: 'Sanity check the knobs: as $\\sigma_w^2$ grows, both coefficients shrink — the noisier the data, the less the predictor dares to move.',
            },
          ],
          answer: {
            sentence:
              'The coefficients above interpolate between “trust the cosine memory” and “do nothing” as the noise power dials up.',
          },
        },
        {
          label: 'c',
          prompt:
            'Assuming no noise, determine the coefficient values and the prediction error power.',
          steps: [
            {
              title: 'Set the noise to zero and simplify',
              body: 'With $\\sigma_w^2 = 0$ the fractions collapse under $1 - \\cos 2\\omega_1 = 2\\sin^2\\omega_1$ and $\\cos 2\\omega_1 - \\cos^2\\omega_1 = -\\sin^2\\omega_1$.',
              latex: 'h_0 = 2\\cos\\omega_1, \\qquad h_1 = -1',
            },
            {
              title: 'Recognize the exact recursion',
              body: 'These are the coefficients of the trigonometric identity $\\cos(\\omega_1 n) = 2\\cos\\omega_1 \\cos(\\omega_1(n{-}1)) - \\cos(\\omega_1(n{-}2))$: a clean sinusoid satisfies the recursion exactly, so the predictor makes no error at all.',
              latex: 'E_{\\min} = r_x(0) - h_0 r_x(1) - h_1 r_x(2) = 0',
            },
          ],
          answer: {
            sentence:
              'A noiseless sinusoid is perfectly predictable from two past samples — all its randomness was in the phase, and two samples pin the phase down.',
            latex:
              'h_0 = 2\\cos\\omega_1, \\qquad h_1 = -1, \\qquad E_{\\min} = 0',
          },
        },
        {
          label: 'd',
          prompt:
            'Show that the noise power $\\sigma_w^2$ is the smallest eigenvalue of the correlation matrix of size $M \\geq 3$.',
          steps: [
            {
              title: 'Split the matrix into tone plus noise floor',
              body: 'A real sinusoid is two complex exponentials, so its correlation matrix $\\mathbf{R}_s$ has rank 2 whatever the size $M$: only two directions in signal space are ever occupied by the tone.',
              latex:
                '\\mathbf{R}_x = \\mathbf{R}_s + \\sigma_w^2 \\mathbf{I}, \\qquad \\operatorname{rank}(\\mathbf{R}_s) = 2',
            },
            {
              title: 'Shift the eigenvalues by the noise floor',
              body: 'Adding $\\sigma_w^2 \\mathbf{I}$ shifts every eigenvalue of $\\mathbf{R}_s$ up by $\\sigma_w^2$ without touching the eigenvectors. For $M \\geq 3$, $\\mathbf{R}_s$ has at least $M - 2$ zero eigenvalues, and $\\mathbf{R}_s$ is positive semidefinite so the other two shifted eigenvalues sit above the floor.',
              latex:
                '\\lambda_i(\\mathbf{R}_x) = \\lambda_i(\\mathbf{R}_s) + \\sigma_w^2 \\;\\Longrightarrow\\; \\lambda_{\\min}(\\mathbf{R}_x) = \\sigma_w^2 \\quad (M \\geq 3)',
              note: 'This is the P3 terrain in words: outside the two tone directions, the landscape is a flat noise floor of height $\\sigma_w^2$.',
            },
          ],
          answer: {
            sentence:
              'For $M \\geq 3$ the smallest eigenvalue of $\\mathbf{R}_x$ equals the noise power, with eigenvectors spanning every direction the tone does not occupy — the fact the eigen-design exam questions cash in.',
            latex: '\\lambda_{\\min}(\\mathbf{R}_x) = \\sigma_w^2',
          },
        },
      ],
    },
  ],
}
