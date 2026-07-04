import type { LessonRecord } from '@/domain/types.ts'

export const adaptiveLesson: LessonRecord = {
  route: 'adaptive',
  ordinal: '05',
  title: 'Adaptive filtering',
  thesis:
    'Steepest descent rolls a ball down the Wiener bowl. LMS rolls the same ball in fog — and the entire theory of Tema 5 is pricing the fog.',
  intro: [
    'Two reasons to abandon $\\mathbf{h} = \\mathbf{R}_x^{-1}\\mathbf{r}_{xd}$: the inverse is expensive, and the world may not sit still long enough for $\\mathbf{R}_x$ to mean anything. Steepest descent fixes the first with iteration; LMS fixes both by replacing the true gradient with the crudest possible estimate — one sample’s worth.',
    'Everything examinable lives in three quantities you can watch: the stability window $0 < \\mu < 2/\\lambda_{\\max}$, the convergence speed set by the eigenvalue spread $\\lambda_{\\max}/\\lambda_{\\min}$, and the misadjustment $\\mathcal{M} \\approx \\frac{\\mu}{2}\\operatorname{tr}(\\mathbf{R}_x)$ that LMS pays forever for its cheap gradient.',
  ],
  modules: [
    {
      id: 'A1',
      title: 'Rolling downhill',
      question:
        'Why does one step size converge, another crawl, and a third explode — on the same bowl?',
      trap: '$\\mathbf{h}_{k+1} = \\mathbf{h}_k - \\mu(\\mathbf{R}_x\\mathbf{h}_k - \\mathbf{r}_{xd})$ is a recursion to memorize, and $0 < \\mu < 2/\\lambda_{\\max}$ arrives as an unexplained commandment.',
      object:
        'The Tema 4 bowl, now with a ball on it. Each iteration reads the local slope and hops against it, hop length scaled by $\\mu$. In the eigenvector basis the bowl has no cross-terms, so the ball is really $Q$ independent 1-D balls, the $i$-th on a parabola of steepness $\\lambda_i$, each shrinking its error by the factor $(1 - \\mu\\lambda_i)$ per hop.',
      action:
        'Drop the ball anywhere and play. Small $\\mu$: safe, slow, every mode creeps. Push $\\mu$ past $1/\\lambda_{\\max}$: the steep mode starts overshooting side to side yet still converges. Push past $2/\\lambda_{\\max}$: $|1 - \\mu\\lambda_{\\max}| > 1$ and the overshoot compounds — divergence, live. Then switch bowls: on the round bowl (spread 1.7) one $\\mu$ suits everyone; on the cigar bowl (spread 13) the $\\mu$ that the steep axis tolerates leaves the shallow axis crawling down the valley floor.',
      payoff:
        'The commandment becomes geometry: convergence needs every $|1 - \\mu\\lambda_i| < 1$, and the binding constraint is the steepest mode — hence $2/\\lambda_{\\max}$, and the conservative exam-friendly bound $2/\\operatorname{tr}(\\mathbf{R}_x) = 2/(Q P_x)$ when eigenvalues are unknown. Slow convergence with correlated inputs is not folklore: it is the shallow eigen-direction of a stretched bowl, and $\\mu_{opt} = 2/(\\lambda_{\\max} + \\lambda_{\\min})$ is just the best compromise between the two worst modes.',
      equations: [
        {
          sentence:
            'Each eigen-mode of the error contracts independently, by a factor set by its own eigenvalue.',
          latex:
            'z_{k+1,i} = (1 - \\mu\\lambda_i)^{\\,k+1} z_{0,i}, \\qquad 0 < \\mu < \\frac{2}{\\lambda_{max}}',
          caption:
            '$\\mathbf{z} = \\mathbf{U}^H(\\mathbf{h} - \\mathbf{h}_{opt})$: the error expressed along the bowl’s own axes.',
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
          'Eigenvalue spread 13, $\\mu$ tuned so the steep mode converges fastest. Which mode dominates the tail of the learning curve?',
        answer:
          'The shallow one: its factor $|1 - \\mu\\lambda_{\\min}|$ is closest to 1, so after the fast mode dies the error decays at the slow mode’s rate — the long valley crawl.',
      },
      transfer:
        'Final Jun 2025, Ex. 3: speech (highly correlated) makes the canceller crawl. Show that regularizing $\\mathbf{R}_x + \\alpha\\mathbf{I}$ shifts every eigenvalue up and shrinks the spread — the bowl becomes rounder.',
      examRefs: [
        'Teoría T5 Ejemplos 2–3: spread 1.71 vs 13, trajectories and divergence at $\\mu = 0.2934$',
        'Final Jun 2025, Ex. 3: regularization to fix eigenvalue spread',
      ],
    },
    {
      id: 'A2',
      title: 'Descending in fog',
      question:
        'What does LMS lose by estimating the gradient from a single sample — and what does it buy?',
      trap: '$\\mathbf{h}(n{+}1) = \\mathbf{h}(n) + \\mu\\,\\mathbf{x}(n)\\,e^*(n)$ looks like steepest descent with a typo, and “misadjustment” sounds like an implementation nuisance rather than a law.',
      object:
        'The same bowl, in fog. LMS cannot see the slope; it feels one noisy sample of it — $\\mathbf{x}(n)e^*(n)$, whose average is the true gradient but whose every instance points somewhere else. The trajectory becomes a drunken descent that, crucially, never stops walking: at the very bottom the true slope is zero but the noisy slope is not, so the ball jitters around the optimum forever.',
      action:
        'Run LMS on a real generated signal (the two-mic canceller from Tema 4, $\\alpha = 0$) and watch the learning curve $|e(n)|^2$ fall and then flatten — not at $\\xi_{\\min}$, but a fixed percentage above it. Read the excess honestly measured from the run and compare with the theory $\\mathcal{M} \\approx \\frac{\\mu}{2}\\operatorname{tr}(\\mathbf{R}_x)$. Now turn $\\mu$ down: the floor drops toward $\\xi_{\\min}$ while convergence stretches out. Turn on drift — let the true $h_{opt}$ wander — and watch small-$\\mu$ LMS lag behind the moving bottom while large-$\\mu$ LMS tracks it, jittering.',
      payoff:
        '$\\mu$ stops being a knob you guess and becomes a contract: convergence time scales like $1/(\\mu\\lambda)$, the permanent noise penalty scales like $\\mu$. The June 2026 final prices this exactly — $\\sigma_h^2 = \\frac{\\mu}{2}\\xi_{\\min}$ for the scalar canceller, hence output $SNR = 2/\\mu$: halve $\\mu$, double the cleaned SNR, wait twice as long. And nonstationarity flips the sign of the argument: in a drifting world, the “safe” tiny $\\mu$ is the one that fails.',
      equations: [
        {
          sentence:
            'Replace the expectation with the sample: the whole algorithm is one multiply-and-nudge per coefficient.',
          latex:
            '\\mathbf{h}(n+1) = \\mathbf{h}(n) + \\mu\\,\\mathbf{x}(n)\\,e^*(n), \\qquad e(n) = d(n) - \\mathbf{h}^H(n)\\mathbf{x}(n)',
          caption:
            'Converges in mean under the same $0 < \\mu < 2/\\lambda_{\\max}$ window as steepest descent.',
        },
        {
          sentence:
            'The fog never clears: after convergence the coefficients keep a variance and the error keeps an excess.',
          latex:
            '\\mathrm{Cov}(\\mathbf{h}(n)) \\approx \\frac{\\mu}{2}\\,\\xi_{min}\\,\\mathbf{I}, \\qquad \\mathcal{M} = \\frac{\\xi - \\xi_{min}}{\\xi_{min}} \\approx \\frac{\\mu}{2}\\,\\mathrm{tr}(\\mathbf{R}_x)',
          caption:
            'NLMS normalizes the step by the instantaneous input power $\\|\\mathbf{x}(n)\\|^2$, making the contract self-tuning.',
        },
      ],
      prediction: {
        question:
          'You halve $\\mu$ after convergence. What happens to the learning-curve floor and to tracking?',
        answer:
          'The floor drops by half its excess (misadjustment $\\propto \\mu$) — but if $h_{opt}$ drifts, the lag error grows: steady-state noise and tracking agility are bought with the same coin.',
      },
      transfer:
        'Final Jun 2026, Ex. 2(e–g): write $c(n) = y(n)z(n)$ for the scalar canceller, use $\\operatorname{Cov}(h) = \\frac{\\mu}{2}\\xi_{\\min}$ to get $\\sigma_h^2$, and express the output SNR as a function of $\\mu$. The whole exercise is this module with $\\alpha = 0$.',
      examRefs: [
        'Final Jun 2026, Ex. 2(e–g): LMS on the scalar canceller, SNR vs $\\mu$',
        'Teoría T5 §3: convergence in mean, coefficient covariance, misadjustment',
      ],
    },
  ],
  workedProblems: [
    {
      id: 'wp-echo-dga',
      source: 'Final · Juny 2025 · Ex. 3',
      title: 'Echo cancellation: regularize the bowl, then descend it',
      why: 'A1’s referenced problem, worked in full: identifying an acoustic echo path gives $\\mathbf{h}_{opt} = \\mathbf{c}$ exactly, regularization $\\mathbf{R}_x + \\alpha\\mathbf{I}$ biases the bottom of the bowl by an amount you price per eigen-direction, and steepest descent is proven to converge to that biased bottom with the speed limit $2/(\\lambda_{\\max} + \\alpha)$ — the payoff being a rounder bowl that converges faster.',
      statement: [
        {
          kind: 'text',
          content:
            'In hands-free audio, a loudspeaker signal $x(n)$ reaches the microphone through an acoustic channel modeled as a known-order FIR filter $\\mathbf{c} = [c(0), \\dots, c(Q{-}1)]^T$, producing an echo that adds to the local speech $v(n)$: the microphone captures $d(n) = \\mathbf{c}^T\\mathbf{x}(n) + v(n)$, with $x(n)$ and $v(n)$ independent, stationary, zero-mean. An adaptive filter $\\mathbf{h}$ forms $e(n) = d(n) - \\mathbf{h}^T\\mathbf{x}(n)$. Because speech is highly correlated, the standard algorithms behave poorly; this exercise proposes regularizing the data correlation matrix.',
        },
      ],
      parts: [
        {
          label: 'a',
          prompt:
            'Find the Wiener filter $\\mathbf{h}_{opt}$ minimizing $\\xi(\\mathbf{h}) = E[e(n)^2]$, show explicitly how it depends on $\\mathbf{c}$, and find $\\xi_{\\min}$.',
          steps: [
            {
              title: 'Write the generic Wiener solution',
              body: 'The normal equations as always; the work is in evaluating the cross-correlation for this desired signal.',
              latex:
                '\\mathbf{h}_{opt} = \\mathbf{R}_x^{-1}\\mathbf{r}_{xd}, \\qquad \\mathbf{r}_{xd} = E\\{\\mathbf{x}(n)\\,d(n)\\}',
            },
            {
              title: 'Substitute the echo model',
              body: 'With $d(n) = \\mathbf{c}^T\\mathbf{x}(n) + v(n)$ and $v \\perp x$, the cross-correlation is the echo path filtered by the data matrix — which the inverse then undoes exactly.',
              latex:
                '\\mathbf{r}_{xd} = E\\{\\mathbf{x}(n)\\mathbf{x}^T(n)\\}\\,\\mathbf{c} = \\mathbf{R}_x\\mathbf{c} \\;\\Longrightarrow\\; \\mathbf{h}_{opt} = \\mathbf{c}, \\qquad \\xi_{\\min} = P_d - \\mathbf{r}_{xd}^T\\mathbf{h}_{opt} = P_v',
              note: 'System identification in its purest form: the bowl’s bottom IS the echo path, and the leftover error is exactly the local speech — the signal you wanted to keep.',
            },
          ],
          answer: {
            sentence:
              'The optimal canceller replicates the acoustic channel, $\\mathbf{h}_{opt} = \\mathbf{c}$, and the minimum error power is the speech power $P_v$: perfect echo removal.',
            latex:
              '\\mathbf{h}_{opt} = \\mathbf{c}, \\qquad \\xi_{\\min} = P_v',
          },
        },
        {
          label: 'b',
          prompt:
            'Using the regularized matrix $\\hat{\\mathbf{R}}_x = \\mathbf{R}_x + \\alpha\\mathbf{I}$ ($\\alpha > 0$) in the normal equations gives a suboptimal $\\mathbf{h}_r$. Find the excess error $\\Delta\\xi$, in terms of $\\alpha$, the eigenvalues $\\lambda_i$ of $\\mathbf{R}_x$, and $\\tilde{\\mathbf{c}} = \\mathbf{U}^T\\mathbf{c}$.',
          steps: [
            {
              title: 'Write the excess as a quadratic form in the miss',
              body: 'Any filter away from the bottom pays the bowl’s curvature on the miss vector $\\mathbf{h}_{opt} - \\mathbf{h}_r$, with $\\mathbf{h}_r = (\\mathbf{R}_x + \\alpha\\mathbf{I})^{-1}\\mathbf{R}_x\\mathbf{c}$.',
              latex:
                '\\Delta\\xi = (\\mathbf{h}_{opt} - \\mathbf{h}_r)^T\\,\\mathbf{R}_x\\,(\\mathbf{h}_{opt} - \\mathbf{h}_r)',
            },
            {
              title: 'Diagonalize everything at once',
              body: 'In the eigenbasis of $\\mathbf{R}_x$ the regularized inverse is diagonal too, so the miss decouples per direction: each component of the echo path is shrunk by $\\lambda_i/(\\lambda_i + \\alpha)$.',
              latex:
                '\\mathbf{h}_{opt} - \\mathbf{h}_r = \\mathbf{U}\\left(\\mathbf{I} - (\\boldsymbol{\\Lambda} + \\alpha\\mathbf{I})^{-1}\\boldsymbol{\\Lambda}\\right)\\tilde{\\mathbf{c}} \\;\\Longrightarrow\\; \\Delta\\xi = \\sum_{i=1}^{Q} \\frac{\\alpha^2\\,\\lambda_i}{(\\lambda_i + \\alpha)^2}\\,\\tilde{c}_i^2',
              note: 'The tax is heaviest where $\\lambda_i \\approx \\alpha$; directions with $\\lambda_i \\gg \\alpha$ barely notice. In exchange, $\\hat{\\mathbf{R}}_x$ is always invertible.',
            },
          ],
          answer: {
            sentence:
              'Regularization moves the bottom of the bowl slightly, and the bill itemizes per eigen-direction: $\\alpha^2\\lambda_i/(\\lambda_i + \\alpha)^2$ times the echo energy in that direction.',
            latex:
              '\\Delta\\xi = \\sum_i \\frac{\\alpha^2 \\lambda_i}{(\\lambda_i + \\alpha)^2}\\,\\tilde{c}_i^2',
          },
        },
        {
          label: 'c',
          prompt:
            'Write the steepest-descent (DGA) recursion for minimizing the MSE, replacing the exact correlation matrix by the regularized one.',
          steps: [
            {
              title: 'Step against the gradient, with the substituted matrix',
              body: 'The MSE gradient is $-2(\\mathbf{r}_{xd} - \\mathbf{R}_x\\mathbf{h})$; substituting $\\hat{\\mathbf{R}}_x$ and absorbing the factor 2 into $\\mu$ gives the working recursion.',
              latex:
                '\\mathbf{h}_{k+1} = \\mathbf{h}_k + \\mu\\left(\\mathbf{r}_{xd} - \\hat{\\mathbf{R}}_x\\mathbf{h}_k\\right) = \\left((1 - \\mu\\alpha)\\mathbf{I} - \\mu\\mathbf{R}_x\\right)\\mathbf{h}_k + \\mu\\,\\mathbf{r}_{xd}',
            },
          ],
          answer: {
            sentence:
              'The A1 ball-rolling recursion, with the regularization visible as an extra leak factor $(1 - \\mu\\alpha)$ on the coefficients.',
            latex:
              '\\mathbf{h}_{k+1} = ((1-\\mu\\alpha)\\mathbf{I} - \\mu\\mathbf{R}_x)\\,\\mathbf{h}_k + \\mu\\mathbf{r}_{xd}',
          },
        },
        {
          label: 'd',
          prompt:
            'Show the algorithm converges to the suboptimal solution $\\mathbf{h}_r$ and find the maximum step size guaranteeing convergence.',
          steps: [
            {
              title: 'Translate to the miss, then rotate to the eigenbasis',
              body: 'Define $\\Delta\\mathbf{h} = \\mathbf{h} - \\mathbf{h}_r$ and use $\\mathbf{r}_{xd} = \\hat{\\mathbf{R}}_x\\mathbf{h}_r$: the recursion becomes a pure contraction of the miss. Rotating with $\\mathbf{z} = \\mathbf{U}^T\\Delta\\mathbf{h}$ decouples it per coordinate.',
              latex:
                '\\Delta\\mathbf{h}_{k+1} = (\\mathbf{I} - \\mu\\hat{\\mathbf{R}}_x)\\,\\Delta\\mathbf{h}_k \\;\\Longrightarrow\\; \\mathbf{z}_{k+1} = \\left((1-\\mu\\alpha)\\mathbf{I} - \\mu\\boldsymbol{\\Lambda}\\right)\\mathbf{z}_k',
            },
            {
              title: 'Bound every mode',
              body: 'Each coordinate contracts by $1 - \\mu(\\alpha + \\lambda_i)$; convergence to $\\mathbf{z} = \\mathbf{0}$ (i.e. to $\\mathbf{h}_r$) needs every factor inside the unit interval, and the steepest mode binds.',
              latex:
                '\\left|1 - \\mu(\\alpha + \\lambda_i)\\right| < 1 \\;\\forall i \\;\\Longrightarrow\\; 0 < \\mu < \\frac{2}{\\lambda_{\\max} + \\alpha}',
              note: 'The bonus the exam hints at: the mode ratio improves from $\\lambda_{\\max}/\\lambda_{\\min}$ to $(\\alpha + \\lambda_{\\max})/(\\alpha + \\lambda_{\\min})$ — regularization rounds the bowl, so correlated speech stops crippling the descent. That is the whole reason to accept the $\\Delta\\xi$ tax of part (b).',
            },
          ],
          answer: {
            sentence:
              'The descent converges to the regularized bottom under $\\mu < 2/(\\lambda_{\\max} + \\alpha)$, and the eigenvalue spread — the thing that made speech hard — is provably reduced.',
            latex: '0 < \\mu < \\frac{2}{\\lambda_{\\max} + \\alpha}',
          },
        },
      ],
    },
    {
      id: 'wp-two-mics-lms',
      source: 'Final · 19 Juny 2026 · Ex. 2, parts e–g (of a–g)',
      title: 'LMS keeps the canceller honest — and charges for it',
      why: 'The fog tax of A2 computed exactly on the simplest possible filter: one coefficient. You get the LMS update from the general rule, the coefficient jitter $\\sigma_h^2 = \\mu/2$ from the covariance formula, and an output SNR that reads $2/\\mu$ — the step size is literally the price of the noise floor.',
      statement: [
        {
          kind: 'text',
          content:
            'Continuation of the two-microphone canceller (Wiener page): $x(n) = s(n) + w(n)$, reference $y(n) = \\alpha s(n) + w(n)$, output $z(n) = x(n) - h\\,y(n)$. From now on $\\alpha = 0$ — the reference hears only the jackhammer — and the gain is computed by the LMS recursion',
        },
        {
          kind: 'math',
          content: 'h(n+1) = h(n) + \\mu\\,c(n)',
        },
        {
          kind: 'text',
          content:
            'with $\\mu$ a positive step small enough to guarantee convergence in the mean to the Wiener solution $h_{opt} = 1$. In steady state, model $h(n)$ as a process of mean 1 and variance $\\sigma_h^2$, independent of music and jackhammer.',
        },
      ],
      related: {
        text: 'Back to parts a–d on the Wiener page: the fixed-gain design LMS is chasing',
        href: '/wiener#wp-two-mics',
      },
      parts: [
        {
          label: 'e',
          prompt: 'Specify the signal $c(n)$.',
          steps: [
            {
              title: 'Recall what LMS correlates',
              body: 'The LMS update is always (error signal) × (filter input). Here the error is the canceller output $z(n)$ and the filter input is the reference $y(n)$; with $\\alpha = 0$, $y(n) = w(n)$.',
              latex: 'c(n) = z(n)\\,y(n) = z(n)\\,w(n)',
            },
          ],
          answer: {
            sentence:
              'The stochastic gradient: the error times the input, no expectation anywhere — the whole point of LMS.',
            latex: 'c(n) = z(n)\\,w(n)',
          },
        },
        {
          label: 'f',
          prompt:
            'Express $\\sigma_h^2$ as a function of $\\mu$. Hint: start from the general expression of the LMS coefficient covariance.',
          steps: [
            {
              title: 'Write the steady-state covariance rule',
              body: 'In steady state the coefficient covariance is proportional to the step size and the minimum Wiener error.',
              latex:
                '\\mathbf{C}_h = \\frac{\\mu}{2}\\,\\xi_{\\min}\\,\\mathbf{I}',
            },
            {
              title: 'Evaluate the minimum error for this problem',
              body: 'With $\\alpha = 0$: $P_z = 1 + (1-h)^2$, minimized at $h = 1$ with $\\xi_{\\min} = P_z^{\\min} = 1$ — the leftover music. One coefficient means the matrix is a scalar.',
              latex: '\\sigma_h^2 = \\frac{\\mu}{2}',
            },
          ],
          answer: {
            sentence:
              'The gain never settles: it rattles around 1 with variance $\\mu/2$, stirred by the very music it is protecting.',
            latex: '\\sigma_h^2 = \\frac{\\mu}{2}',
          },
        },
        {
          label: 'g',
          prompt:
            'From $z(n) = x(n) - h(n)\\,w(n)$, obtain the SNR of $z(n)$ as a function of $\\mu$.',
          steps: [
            {
              title: 'See what the jitter leaks through',
              body: 'Substituting $x(n) = s(n) + w(n)$ leaves the music plus a residual noise gated by the coefficient error $(1 - h(n))$.',
              latex: 'z(n) = s(n) + (1 - h(n))\\,w(n)',
            },
            {
              title: 'Compute the residual noise power',
              body: 'Independence of $h(n)$ and $w(n)$ splits the expectation; $E\\{(1-h(n))^2\\}$ is exactly the coefficient variance, and $E\\{w^2\\} = 1$.',
              latex:
                'P_{noise} = E\\{(1 - h(n))^2\\}\\,E\\{w^2(n)\\} = \\sigma_h^2 = \\frac{\\mu}{2}',
            },
            {
              title: 'Take the ratio',
              body: 'Music power is 1, so the SNR is the reciprocal of the jitter.',
              latex:
                'SNR_z = \\frac{P_s}{P_{noise}} = \\frac{1}{\\sigma_h^2} = \\frac{2}{\\mu}',
            },
          ],
          answer: {
            sentence:
              'A perfect Wiener canceller gave infinite SNR at $\\alpha = 0$; LMS delivers $2/\\mu$ instead. The step size is a dial trading tracking speed against how much jackhammer you are willing to hear again.',
            latex: 'SNR_z = \\frac{2}{\\mu}',
          },
        },
      ],
    },
    {
      id: 'wp-ale-lms',
      source: 'Final · 7 Gener 2026 · Ex. 2, parts h–k (of a–k)',
      title: 'The adaptive line enhancer: step size, patience, misadjustment',
      why: 'Every A1/A2 quantity asked in one chain, on the tone-plus-noise terrain from Tema 1: the stability bound from $\\lambda_{\\max}$, the convergence time from $\\lambda_{\\min}$, the misadjustment from the trace trick, and finally a single SNDR formula where $Q$ and $\\alpha$ fight each other.',
      statement: [
        {
          kind: 'text',
          content:
            'Continuation of the pilot-tone predictor (Wiener page). Because the noise power $\\sigma^2$ fluctuates, the $Q$-coefficient predictor is now obtained with LMS — an Adaptive Line Enhancer (ALE). The input correlation matrix is $\\mathbf{R}_x = |A_0|^2\\mathbf{s}^*\\mathbf{s}^T + \\sigma^2\\mathbf{I}$ with $SNR = |A_0|^2/\\sigma^2$. For the last parts, with $\\tilde{\\mathbf{h}} = \\mathbf{h}(n) - \\mathbf{h}_{opt}$ the coefficient error after convergence, the distortion it adds at the output defines',
        },
        {
          kind: 'math',
          content:
            'SNDR = \\frac{P_{t_{out}}}{P_{w_{out}} + \\Delta\\xi(\\tilde{\\mathbf{h}})}',
        },
        {
          kind: 'text',
          content:
            'and for $Q\\,SNR \\gg 1$ we may use $\\mathbf{h}_{opt} \\approx \\frac{1}{Q}e^{-j2\\pi f_0}\\mathbf{s}^*$ and $\\xi_{\\min} \\approx \\sigma^2$, with $\\mathbf{x}(n)$ and $\\mathbf{h}(n)$ statistically independent.',
        },
      ],
      related: {
        text: 'Back to parts d–g on the Wiener page: the closed-form predictor LMS is chasing',
        href: '/wiener#wp-pilot-predictor',
      },
      parts: [
        {
          label: 'h',
          prompt:
            'Give a bound $\\mu_{\\max}$ on the LMS step size guaranteeing convergence, in terms of $A_0$, $\\sigma^2$ and $Q$.',
          steps: [
            {
              title: 'Find the largest eigenvalue of the terrain',
              body: 'The rank-one tone part contributes its full energy $Q|A_0|^2$ along the steering direction, on top of the noise floor $\\sigma^2$; every other direction sits at the floor. Convergence in the mean requires the step to respect the steepest curvature.',
              latex:
                '\\lambda_{\\max} = Q|A_0|^2 + \\sigma^2 \\;\\Longrightarrow\\; \\mu_{\\max} = \\frac{2}{\\lambda_{\\max}} = \\frac{2}{Q|A_0|^2 + \\sigma^2}',
              note: 'The safer practical variant divides by the total input power instead: $\\mu_{\\max} = 2/\\operatorname{tr}(\\mathbf{R}_x) = 2/(Q(|A_0|^2 + \\sigma^2))$.',
            },
          ],
          answer: {
            sentence:
              'The steepest direction of the bowl — the tone direction, with eigenvalue $Q|A_0|^2 + \\sigma^2$ — sets the speed limit.',
            latex: '\\mu_{\\max} = \\frac{2}{Q|A_0|^2 + \\sigma^2}',
          },
        },
        {
          label: 'i',
          prompt:
            'With $\\mu = \\alpha\\,\\mu_{\\max}$, $\\alpha \\ll 1$, and knowing $\\lambda_{\\min}(\\mathbf{R}_x) = \\sigma^2$, find the number of iterations $N_{ite}$ for the coefficient error to decay to $\\epsilon$, in terms of $\\epsilon$, $\\alpha$, $Q$ and $SNR$.',
          steps: [
            {
              title: 'Track the slowest mode',
              body: 'Each eigen-direction decays geometrically with ratio $(1 - \\mu\\lambda_i)$; the flattest direction — the noise floor $\\lambda_{\\min} = \\sigma^2$ — is the last to arrive, so it defines convergence.',
              latex:
                '(1 - \\mu\\lambda_{\\min})^{N_{ite}} = \\epsilon \\;\\Longrightarrow\\; N_{ite} = \\frac{\\ln\\epsilon}{\\ln\\!\\left(1 - \\frac{2\\alpha\\sigma^2}{Q|A_0|^2 + \\sigma^2}\\right)}',
            },
            {
              title: 'Approximate for a small step',
              body: 'For $\\alpha \\ll 1$ use $\\ln(1 - u) \\approx -u$ and divide through by $\\sigma^2$ to expose the SNR.',
              latex:
                'N_{ite} \\approx -\\frac{(1 + Q\\,SNR)\\,\\ln\\epsilon}{2\\alpha}',
              note: '$\\ln\\epsilon < 0$, so $N_{ite}$ is positive — and it grows with the eigenvalue spread $1 + Q\\,SNR$: the fog crawl of the A1 figure, in a formula.',
            },
          ],
          answer: {
            sentence:
              'Patience scales with the eigenvalue spread and inversely with the step: a stronger tone (bigger $Q\\,SNR$) makes the bowl more elongated and the quiet direction slower.',
            latex:
              'N_{ite} \\approx -\\frac{(1 + Q\\,SNR)\\ln\\epsilon}{2\\alpha}',
          },
        },
        {
          label: 'j',
          prompt:
            'Obtain the excess output power $\\Delta\\xi(\\tilde{\\mathbf{h}})$ as a function of $\\alpha$ and $\\sigma^2$. (Use the circularity of the trace.)',
          steps: [
            {
              title: 'Turn the quadratic form into a trace',
              body: 'The distortion is the coefficient error passed through the input terrain; independence plus trace circularity converts it into the trace of $\\mathbf{R}_x$ times the coefficient covariance.',
              latex:
                '\\Delta\\xi = E\\{\\tilde{\\mathbf{h}}^H\\mathbf{R}_x\\tilde{\\mathbf{h}}\\} = \\operatorname{tr}\\!\\left(\\mathbf{R}_x\\,E\\{\\tilde{\\mathbf{h}}\\tilde{\\mathbf{h}}^H\\}\\right) = \\operatorname{tr}(\\mathbf{R}_x\\mathbf{C}_h)',
            },
            {
              title: 'Insert the LMS covariance and the trace bound',
              body: 'With $\\mathbf{C}_h = \\frac{\\mu}{2}\\xi_{\\min}\\mathbf{I} = \\frac{\\alpha\\mu_{\\max}}{2}\\sigma^2\\mathbf{I}$ and $\\mu_{\\max} = 2/\\operatorname{tr}(\\mathbf{R}_x)$, the trace cancels itself.',
              latex:
                '\\Delta\\xi = \\frac{\\alpha\\mu_{\\max}}{2}\\,\\sigma^2\\operatorname{tr}(\\mathbf{R}_x) = \\frac{\\alpha}{\\operatorname{tr}(\\mathbf{R}_x)}\\,\\sigma^2\\operatorname{tr}(\\mathbf{R}_x) = \\alpha\\,\\sigma^2',
            },
          ],
          answer: {
            sentence:
              'A pleasantly clean tax: the misadjustment noise is just $\\alpha$ times the noise floor, independent of $Q$.',
            latex: '\\Delta\\xi = \\alpha\\,\\sigma^2',
          },
        },
        {
          label: 'k',
          prompt:
            'Obtain the SNDR in terms of $SNR$, $\\alpha$ and $Q$, and reason how the number of coefficients and the step size affect the detector’s $P_d$.',
          steps: [
            {
              title: 'Assemble the three powers',
              body: 'With the simplified $\\mathbf{h}_{opt} \\approx \\frac{1}{Q}e^{-j2\\pi f_0}\\mathbf{s}^*$: the tone passes whole, the noise is divided by $Q$, and the distortion is the part-(j) tax.',
              latex:
                'P_{t_{out}} = |A_0|^2, \\qquad P_{w_{out}} = \\frac{\\sigma^2}{Q}, \\qquad SNDR = \\frac{|A_0|^2}{\\frac{\\sigma^2}{Q} + \\alpha\\sigma^2} = \\frac{Q\\,SNR}{1 + \\alpha Q}',
            },
            {
              title: 'Read the two dials',
              body: 'Raising $Q$ boosts the detector’s input SNR ($P_d$ up) but multiplies the misadjustment term $\\alpha Q$ — past $Q \\sim 1/\\alpha$ the returns die. Lowering $\\alpha$ cleans the distortion but, by part (i), inflates $N_{ite}$: decisions arrive later. Nothing is free in the fog.',
            },
          ],
          answer: {
            sentence:
              'The Wiener gain of $Q$ survives only until the misadjustment term $\\alpha Q$ catches up — pick $Q$ and $\\alpha$ together, trading detection gain, distortion, and convergence delay.',
            latex: 'SNDR = \\frac{Q\\,SNR}{1 + \\alpha Q}',
          },
        },
      ],
    },
  ],
}
