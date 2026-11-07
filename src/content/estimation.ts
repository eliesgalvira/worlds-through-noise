import type { LessonRecord } from '@/domain/types.ts'

export const estimationLesson: LessonRecord = {
  route: 'estimation',
  ordinal: '03',
  title: 'Estimation',
  thesis:
    'An estimator is a machine you must judge by its cloud of outputs, never by one lucky number — and the Cramér-Rao bound says how tight that cloud can be for any unbiased estimator.',
  intro: [
    'Topic 3 walks one path, one module per step. E1 judges an estimator by its cloud of outputs. E2 finds the floor no unbiased estimator can beat. E3 fuses unequal measurements and adds prior knowledge. E4 finds a frequency by maximum likelihood.',
    'Exams walk this skeleton in order — “find the pdf, find the CRB, does the efficient estimator exist, find the ML, is it consistent” — so this lesson does too, with the objects made visible at each step.',
  ],
  modules: [
    {
      id: 'E1',
      title: 'Bias, variance, mean squared error',
      question: 'What do bias, variance and MSE actually describe?',
      trap: 'An estimator is a formula $\\hat{\\theta}(\\mathbf{x})$ that turns observed data $\\mathbf{x}$ into a guess for an unknown parameter $\\theta$. Its output is one draw from a random variable, because the data it ate were random, and a single lucky draw can make a terrible estimator look brilliant. Bias and variance describe the cloud of outputs over many experiments.',
      object:
        'So judge machines, not numbers. Take two competing estimators of the same hidden mean: the sample mean, and the “midrange,” $(\\max + \\min)/2$, which averages only the largest and smallest observations. Feed both the same experiment hundreds of times. Each machine piles up a histogram of its outputs. Bias is where a pile is centered relative to the truth. Variance is the pile’s width. The mean squared error (MSE) charges for both at once.',
      action:
        'Press run in the figure and watch the piles grow under Gaussian noise. Which pile is narrower? Then predict what happens when the noise turns uniform with the same variance, switch it and run again. The two formulas never change. Only the data model $f(\\mathbf{x}; \\theta)$, the density that describes how the data are generated, does.',
      payoff:
        'The ranking depends on the noise model, and that is the lesson of the whole topic: “best estimator” is not a property of a formula, it is a property of the formula–distribution pair. It explains why the theory insists on writing down $f(\\mathbf{x}; \\theta)$ before doing anything else, and why a word like “efficient” is always relative to a model. Consistency also becomes something you can watch: raise $N$ and a good pile tightens onto the truth.',
      equations: [
        {
          sentence:
            'The mean squared error splits into a systematic offset and a random wobble.',
          latex:
            '\\mathrm{MSE}(\\hat\\theta) = E\\,|\\hat\\theta(\\mathbf{x}) - \\theta|^2 = \\sigma^2_{\\hat\\theta} + |b_{\\hat\\theta}|^2',
          caption:
            '$b = E\\{\\hat{\\theta}\\} - \\theta$. A little deliberate bias can be worth a big variance cut — that trade is what a prior buys in E3.',
        },
      ],
      prediction: {
        question:
          'Same noise variance, but uniform instead of Gaussian. Which pile is narrower at $N = 256$?',
        answer:
          'The midrange: its spread is about 0.01, against 0.06 for the sample mean. Bounded noise lets the largest and smallest samples pin the center down, so the ranking flips.',
      },
      transfer:
        'Slides example (T3 p. 15): for $\\hat{m}_2 = \\frac{1}{N+1}\\sum x_i$, find bias and variance and check consistency. Picture the pile: slightly off-center, slightly narrower — then confirm with algebra.',
      examRefs: [
        'Slides T3 §2: sample mean vs midrange under uniform and Gaussian noise',
        'Midterm Apr 2026, Ex. 1(b–c): unbiasedness conditions for proposed estimators',
      ],
    },
    {
      id: 'E2',
      title: 'Cramér–Rao bound: information is curvature',
      question:
        'What limits every unbiased estimator, and when does the perfect one exist?',
      trap: 'Every estimate built from noisy data wobbles from one experiment to the next. The Cramér–Rao bound (CRB) is a floor on that wobble: no unbiased estimator can have a variance below it. Its formula, an expectation of a squared derivative of a logarithm, then inverted, is hard to picture. So is the test for an efficient estimator, one whose variance actually touches the floor. Both are read off the likelihood $f(\\mathbf{x}; \\theta)$, drawn as a function of $\\theta$.',
      object:
        'Draw the likelihood for the data you actually observed: it says how plausible each candidate value of $\\theta$ makes them. The peak of this landscape is the maximum-likelihood (ML) estimate. The sharpness near the peak is how confidently the data votes: a knife-edge peak pins $\\theta$ down, a broad hill leaves it loose. The strip under the landscape draws the slope of its logarithm, the score $\\partial \\ln f/\\partial\\theta$: zero at the peak, and steeper the sharper the peak. Fisher information, $I(\\theta)$, is the average curvature of this landscape drawn on a log scale, and the CRB is its inverse: flat landscape, poor floor.',
      action:
        'The figure draws $N$ samples $x_n = \\theta + w_n$ with Gaussian noise $w_n \\sim \\mathcal{N}(0, \\sigma^2)$, so $\\sigma$ is the noise standard deviation. Draw fresh samples and watch the landscape rebuild — the peak wobbles from draw to draw, and the size of the wobble matches the flatness. Raise $N$: each new sample multiplies another factor into the likelihood, the landscape sharpens, and the wobble’s variance shrinks like $1/N$ (its width like $1/\\sqrt{N}$). Raise the noise $\\sigma$ and it flattens again. The bar around the peak spans $\\pm\\sigma_{CR}$, the square root of the Cramér–Rao bound.',
      payoff:
        'The landscape also shows when an efficient estimator exists. The strip under it draws the score, the slope of the log-likelihood. For the Gaussian mean the score is a straight line through the peak, $\\frac{N}{\\sigma^2}(\\bar{x} - \\theta)$: it factors as $I(\\theta)\\,(g(\\mathbf{x}) - \\theta)$ with $g(\\mathbf{x}) = \\bar{x}$ free of $\\theta$, so the sample mean reaches the bound. What matters is the factorization, not the straightness: a curved score can still factor, as for the exponential mean and the Poisson rate in the workbook. When the score cannot be written that way, as for phase, frequency or power $P = A^2/2$, no unbiased estimator reaches the floor. ML still finds the peak, and presses against the floor asymptotically.',
      equations: [
        {
          sentence:
            'No unbiased estimator can beat the inverse of the average curvature of the log-likelihood.',
          latex:
            '\\sigma^2_{\\hat\\theta} \\;\\ge\\; \\frac{1}{-E\\left[\\dfrac{\\partial^2 \\ln f(\\mathbf{x};\\theta)}{\\partial\\theta^2}\\right]} = \\frac{1}{I(\\theta)} = \\sigma^2_{CR(\\theta)}',
          caption:
            "The denominator is the Fisher information $I(\\theta)$. The second derivative of $\\ln f$ is the slope of the score, so for the Gaussian mean the score strip's slope is exactly $-I(\\theta) = -N/\\sigma^2$.",
        },
        {
          sentence:
            'The efficient estimator exists exactly when the score factors into information times error.',
          latex:
            '\\frac{\\partial \\ln f(\\mathbf{x};\\theta)}{\\partial\\theta} = I(\\theta)\\,\\big(\\hat\\theta(\\mathbf{x}) - \\theta\\big)',
          caption:
            '$\\hat{\\theta}(\\mathbf{x})$ must not depend on $\\theta$, and $I(\\theta)$ must not depend on $\\mathbf{x}$. Exams test this factorization constantly.',
        },
        {
          sentence:
            'For a known signal shape $\\mathbf{p}(\\theta)$ in real white Gaussian noise, the bound rewards signals that change fast with the parameter.',
          latex:
            '\\mathbf{x} = \\mathbf{p}(\\theta) + \\mathbf{w}, \\quad \\mathbf{w} \\sim \\mathcal{N}(\\mathbf{0}, \\sigma^2\\mathbf{I}) \\;\\Longrightarrow\\; \\sigma^2_{CR(\\theta)} = \\frac{\\sigma^2}{\\left\\| \\partial \\mathbf{p}(\\theta) / \\partial\\theta \\right\\|^2}',
          caption:
            'Here the mean is $\\mathbf{p}(\\theta) = \\theta\\mathbf{1}$, so $\\|\\partial\\mathbf{p}/\\partial\\theta\\|^2 = N$ and the bound is $\\sigma^2/N$. Complex noise $\\mathcal{CN}(\\mathbf{0}, \\sigma^2\\mathbf{I})$ puts a 2 in the denominator. Frequency, whose derivative grows with $n$, gets a $1/N^3$ bound, amplitude only $1/N$.',
        },
      ],
      prediction: {
        question:
          'Same data, but the model’s $\\sigma$ doubles. What happens to the landscape and the CRB?',
        answer:
          'The landscape flattens — each sample argues more weakly — and the CRB quadruples: information scales as $1/\\sigma^2$.',
      },
      transfer:
        'Midterm Apr 2026, Ex. 1(d–e): compute the CRB for the amplifier gain (mean AND variance both carry $A$) and explain why the linear estimator, which ignores the variance channel, cannot be efficient.',
      examRefs: [
        'Midterm Apr 2026, Ex. 1: CRB with information in both mean and variance',
        'Midterm Oct 2025, Ex. 2: exponential inter-arrival times — CRB, efficient estimator',
        'Final Jan 2026, Ex. 1: Poisson accidents — score factorization gives the sample mean',
      ],
    },
    {
      id: 'E3',
      title: 'Weighted fusion and the prior',
      question:
        'How should unequal-quality measurements be combined, and where does a prior fit in?',
      trap: 'Three sensors of unequal quality measure the same humidity $\\theta$, each with independent Gaussian noise of its own standard deviation $\\sigma_i$. Averaging them equally wastes the good ones. Separately, old knowledge may say $\\theta$ is usually near $\\mu_\\theta$, with spread $\\sigma_\\theta$. Students memorize the best fusion of the sensors and the MAP estimate (maximum a posteriori: the most probable value once data and prior are combined) as two different results. Both are one weighted average.',
      object:
        'Each measurement acts as a spring. $x_i$ is an anchor pulling the estimate toward itself with stiffness $1/\\sigma_i^2$: precise sensors are stiff springs, noisy sensors are slack ones. The estimate is where all the pulls balance. And a Gaussian prior is nothing special — it is one more spring, anchored at $\\mu_\\theta$, with stiffness $1/\\sigma_\\theta^2$.',
      action:
        'In the figure, drag one sensor’s noise up and watch its spring slacken: the balance point slides away from it, while the combined variance grows, but never past what the other sensors achieve on their own. Raise $\\sigma_1$ to its maximum: sensor 1 then plays the defective pixel of the June 2026 final, whose variance the exam calls $\\sigma_0^2 \\to \\infty$, and watch the balance point settle between the other two sensors, as if the broken one were not there. Then switch the prior spring on, feel it pull the estimate toward $\\mu_\\theta$, and stiffen the sensors (lower their $\\sigma$) to watch the data springs overpower it.',
      payoff:
        'One picture covers greenhouse-sensor fusion, the defective camera pixel, the best linear unbiased estimator (BLUE) and MAP shrinkage. The data springs’ share of the total stiffness is the readout $\\alpha$, and it explains why the prior fades as data accumulate: with $N$ equal data springs against one prior spring, the prior’s share $1 - \\alpha$ shrinks as $N$ grows.',
      equations: [
        {
          sentence:
            'The efficient fusion weighs each observation by its precision — inverse variance.',
          latex:
            '\\hat\\theta = \\frac{\\sum_i x_i/\\sigma_i^2}{\\sum_i 1/\\sigma_i^2}, \\qquad \\mathrm{Var}(\\hat\\theta) = \\frac{1}{\\sum_i 1/\\sigma_i^2}',
          caption:
            'BLUE form: $\\mathbf{h}_{opt} = \\mathbf{C}^{-1}\\mathbf{1}/(\\mathbf{1}^T\\mathbf{C}^{-1}\\mathbf{1})$, with $\\mathbf{C}$ the covariance matrix of the sensor noises, $\\mathbf{1}$ a vector of ones and $\\mathbf{h}_{opt}$ the fusion weights. With independent sensors $\\mathbf{C}$ is diagonal and this is the formula above. Adding any sensor, however bad, never hurts.',
        },
        {
          sentence:
            'MAP is the same balance with the prior seated as one extra measurement.',
          latex:
            '\\hat\\theta_{MAP} = \\frac{\\sum_i x_i/\\sigma_i^2 + \\mu_\\theta/\\sigma_\\theta^2}{\\sum_i 1/\\sigma_i^2 + 1/\\sigma_\\theta^2}, \\qquad \\sigma^2_{\\theta|\\mathbf{x}} = \\frac{1}{\\sum_i 1/\\sigma_i^2 + 1/\\sigma_\\theta^2}',
          caption:
            "In shrinkage form this is $\\hat{\\theta}_{MAP} = \\alpha\\hat{\\theta}_{ML} + (1-\\alpha)\\mu_\\theta$, with $\\alpha$ the data share the figure reads out. The second fraction is the posterior variance the figure reads out. The June-2026 final has one pixel $x_0$ with noise variance $\\sigma_0^2$: $\\sigma_\\theta^2 \\gg \\sigma_0^2$ trusts the data, $\\sigma_0^2 \\gg \\sigma_\\theta^2$ trusts the prior. The exam writes the answer as $x_0/k + \\mu_\\theta/m$ (it names these $\\alpha$ and $\\beta$) with $k = 1 + \\sigma_0^2/\\sigma_\\theta^2$ and $m = 1 + \\sigma_\\theta^2/\\sigma_0^2$, so $x_0/k = \\alpha x_0$ with the figure's data share $\\alpha$.",
        },
      ],
      prediction: {
        question:
          'Two good sensors and a broken one: push $\\sigma_1$ to 12. Does keeping sensor 1 raise or lower the estimator variance, compared with dropping it?',
        answer:
          'Lower, slightly: 7.78 against 8.22 for sensors 2 and 3 alone. Its weight $1/\\sigma_1^2 = 1/144$ is tiny but positive, so keeping it can only help. The June 2026 final asks the same with eight good pixels: the fusion lands just under $\\sigma^2/8$, with $\\sigma^2$ the noise variance of each good pixel.',
      },
      transfer:
        'Final Jun 2026, Ex. 1: defective pixel, with $\\sigma^2$ the noise variance of each good pixel and $\\sigma_0^2$ that of the broken one. Do (a) single pixel, (b) 9-pixel fusion, (c) the two limits $\\sigma_0^2 = \\sigma^2$ and $\\sigma_0^2 \\gg \\sigma^2$, (d–e) MAP with a $N(\\mu_\\theta, \\sigma_\\theta^2)$ prior. All five parts are spring diagrams.',
      examRefs: [
        'Final Jun 2026, Ex. 1: defective pixel fusion + MAP',
        'Final Jun 2025, Ex. 2: greenhouse sensors of unequal quality',
        'Midterm Apr 2026, Ex. 2: two-wire transmission — common noise makes $\\mathbf{C}$ non-diagonal, same machinery',
      ],
    },
    {
      id: 'E4',
      title: 'ML frequency: a detector bank',
      question:
        'How does maximum likelihood find a frequency, and how precisely can it?',
      trap: 'A tone $A e^{j2\\pi f n}$ of unknown frequency $f$ and unknown complex amplitude $A$ (its size and phase) is buried in noise, and you have $N$ samples $x(n)$. Which frequency is it? Maximum likelihood (ML) answers by testing every candidate frequency against the data and keeping the best match, and the figure runs that search.',
      object:
        'Think of it as a bank of candidate explanations. Each candidate frequency $f$ proposes a template, the vector $\\mathbf{s}(f)$ of samples a clean tone at $f$ would produce. The data rates every candidate by how much of $\\mathbf{x}$ lies along that template, a correlation computed from your samples. ML picks the candidate with the best match. This is the Fourier transform working as a detector, not as a change of representation.',
      action:
        'In the figure, slide the candidate $f$ across the band and watch the dot on the curve, whose height is the match $|X(f)|^2/N$: the landscape rises to a peak at the hidden tone. Add noise and watch spurious ripples start to compete. Then raise $N$ and watch the main peak narrow, and the CRB readout with it: a longer record makes the template more sensitive to small frequency errors.',
      payoff:
        'Compressed likelihood explains the recipe: maximize over the easy parameter first, with $\\hat{A}_{ML} = \\mathbf{s}(f)^H\\mathbf{x}/N$ for each candidate $f$, substitute it back, and the leftover function of $f$ alone is the periodogram. For frequency the score function $\\partial \\ln p(\\mathbf{x}; f)/\\partial f$ does not factor, so no efficient estimator exists for finite $N$: ML reaches the CRB only asymptotically, at high enough SNR.',
      equations: [
        {
          sentence:
            'Maximize over amplitude first. The survivor is a matched-filter score swept across frequency.',
          latex:
            '\\hat f_{ML} = \\arg\\max_f \\frac{|X(f)|^2}{N}, \\qquad X(f) = \\sum_{n=0}^{N-1} x(n)\\, e^{-j2\\pi f n} = \\mathbf{s}(f)^H\\mathbf{x}, \\qquad \\hat A_{ML} = \\tfrac{1}{N} X(\\hat f_{ML})',
          caption:
            '$\\mathbf{s}(f)$ is the template, a clean tone at $f$, and $^H$ the conjugate transpose: $X(f)$ is the correlation whose size the figure plots as the match.',
        },
        {
          sentence:
            'With amplitude and phase unknown, frequency information still grows with the cube of the observation length.',
          latex:
            '\\sigma^2_{CR(f)} = \\frac{6}{4\\pi^2\\, \\mathrm{SNR}\\; N(N-1)(N+1)} \\;\\approx\\; \\frac{3}{2\\pi^2\\,\\mathrm{SNR}\\,N^3}, \\qquad \\mathrm{SNR} = \\frac{|A|^2}{\\sigma^2}',
          caption:
            'This is the complex tone $A e^{j2\\pi f n}$ in complex noise of power $\\sigma^2$. It is the model the figure simulates and the bound its CRB readout uses. With the complex amplitude $A$ known the bound is about 4 times lower, $3/(4\\pi^2\\,\\mathrm{SNR}\\,N(N-1)(2N-1))$. Either way the $1/N^3$ is why splitting the data into blocks is a bad idea for frequency estimation.',
        },
      ],
      prediction: {
        question:
          'You double $N$. By how much does the CRB standard deviation of $\\hat{f}$ shrink?',
        answer:
          'By about $\\sqrt{8} \\approx 2.8$, the $1/N^3$ law, against only $\\sqrt{2}$ for an amplitude estimate. Check it in the figure: move $N$ from 48 to 96 and the CRB readout drops by that factor.',
      },
      transfer:
        'Slides exercise: two ML frequency estimates from half-blocks, averaged, versus one full-block estimate. Show the variance ratio $\\approx 4$ and explain it with the $N^3$ law rather than algebra.',
      examRefs: [
        'Slides T3: ML frequency estimation, known and unknown amplitude',
        'Slides T3: block-splitting frequency estimation exercise (variance ratio 4)',
        'Final Jan 2023, Ex. 3: ML frequency of a complex exponential from its phases, and its CRB',
      ],
    },
  ],
  workedProblems: [
    {
      id: 'wp-amp-gain',
      source: 'Midterm, April 13 2026, Ex. 1 (5 points)',
      title: 'Amplifier gain: the mean and the variance both know A',
      why: 'The rare model where the parameter scales both moments at once. It exercises E1 (bias, variance), E2 (CRB and why an unbiased estimator can still waste information), and asks for an ML estimator.',
      statement: [
        {
          kind: 'text',
          content:
            'A real signal $y(n)$ passes through an amplifier of real amplitude gain $A \\geq 0$, whose output is observed: $x(n) = A\\,y(n)$. The input is modeled as',
        },
        {
          kind: 'math',
          content: 'y(n) = \\alpha + w(n)',
        },
        {
          kind: 'text',
          content:
            'where $\\alpha \\geq 0$ is a known constant and $w(n)$ is real zero-mean white Gaussian noise of variance $\\sigma^2$. We have $N$ samples of $x(n)$, $n = 0, \\dots, N-1$, and want to estimate $A$.',
        },
      ],
      parts: [
        {
          label: 'a',
          prompt:
            'Find the mean and variance of $x(n)$ (both depend on $A$), write $f(x(n); A)$, and set up the vector model with density $f(\\mathbf{x}; A)$.',
          steps: [
            {
              title: 'Push the gain through the model',
              body: 'Since $x(n) = \\alpha A + A\\,w(n)$ is a linear transformation of a Gaussian, it stays Gaussian — but notice that $A$ scales the mean and the standard deviation simultaneously.',
              latex:
                'E\\{x(n)\\} = \\alpha A, \\qquad \\sigma_x^2 = A^2\\sigma^2 \\;\\Longrightarrow\\; f(x(n); A) = \\frac{1}{\\sqrt{2\\pi\\sigma^2}\\,A}\\, \\exp\\left(-\\frac{(x(n) - \\alpha A)^2}{2A^2\\sigma^2}\\right)',
            },
            {
              title: 'Stack the samples',
              body: 'White noise means uncorrelated samples: mean vector $\\alpha A \\mathbf{1}$ and covariance $A^2\\sigma^2\\mathbf{I}$.',
              latex:
                'f(\\mathbf{x}; A) = \\frac{1}{(2\\pi\\sigma^2)^{N/2} A^N}\\, \\exp\\!\\left(-\\frac{\\|\\mathbf{x} - \\alpha A\\mathbf{1}\\|^2}{2A^2\\sigma^2}\\right)',
              note: 'The $A^N$ in the normalization is not decoration — it will put a $-N\\ln A$ term in the log-likelihood that most of the later parts feed on.',
            },
          ],
          answer: {
            sentence:
              'Both moments carry $A$: the mean grows like $\\alpha A$ and the noise power like $A^2\\sigma^2$. Two separate channels of information about one parameter.',
          },
        },
        {
          label: 'b',
          prompt:
            'For the estimator $\\hat{A} = \\beta\\,\\mathbf{1}^T\\mathbf{x}$, find $\\beta$ so that $\\hat{A}$ is unbiased and compute its variance. Is there an $\\alpha$ for which this estimator cannot work?',
          steps: [
            {
              title: 'Force the mean to hit A',
              body: 'This estimator is a scaled sum, $\\beta\\mathbf{1}^T\\mathbf{x} = \\beta N\\bar{x}$, so its expectation is $\\beta \\alpha N A$.',
              latex:
                'E\\{\\hat{A}\\} = \\beta\\,\\alpha N A = A \\;\\Longrightarrow\\; \\beta = \\frac{1}{N\\alpha}',
            },
            {
              title: 'Propagate the noise',
              body: 'Substitute $\\mathbf{x} = \\alpha A \\mathbf{1} + A\\mathbf{w}$. Only the noise term survives inside the variance.',
              latex:
                '\\operatorname{Var}(\\hat{A}) = E\\left\\{\\left(\\tfrac{A}{N\\alpha}\\mathbf{1}^T\\mathbf{w}\\right)^2\\right\\} = \\left(\\tfrac{A}{N\\alpha}\\right)^2 N\\sigma^2 = \\frac{A^2\\sigma^2}{N\\alpha^2}',
            },
            {
              title: 'Find the blind spot',
              body: 'If $\\alpha = 0$ the observations have zero mean whatever $A$ is: the sample mean simply contains no information about the gain, and no choice of $\\beta$ can fix that.',
            },
          ],
          answer: {
            sentence:
              'With $\\beta = 1/(N\\alpha)$ the estimator is unbiased with variance $A^2\\sigma^2/(N\\alpha^2)$ — and it goes blind at $\\alpha = 0$, where the mean stops carrying $A$.',
            latex:
              '\\beta = \\frac{1}{N\\alpha}, \\qquad \\sigma_{\\hat{A}}^2 = \\frac{A^2\\sigma^2}{N\\alpha^2}',
          },
        },
        {
          label: 'c',
          prompt:
            'For $\\hat{G} = \\gamma\\,\\|\\mathbf{x}\\|^2$, find $\\gamma$ so that $\\hat{G}$ is an unbiased estimator of the power gain $G = A^2$.',
          steps: [
            {
              title: 'Read the information out of the power',
              body: 'The second moment of each sample is $E\\{x^2(n)\\} = (\\alpha A)^2 + A^2\\sigma^2 = A^2(\\alpha^2 + \\sigma^2)$, so the total energy has expectation proportional to $G$.',
              latex:
                'E\\{\\hat{G}\\} = \\gamma\\,E\\{\\|\\mathbf{x}\\|^2\\} = \\gamma\\,N A^2 (\\alpha^2 + \\sigma^2) = A^2 \\;\\Longrightarrow\\; \\gamma = \\frac{1}{N(\\alpha^2 + \\sigma^2)}',
            },
          ],
          answer: {
            sentence:
              'The energy-based estimator works for any $\\alpha$, including $\\alpha = 0$ — it reads the variance channel that the linear estimator ignores.',
            latex: '\\gamma = \\frac{1}{N(\\alpha^2 + \\sigma^2)}',
          },
        },
        {
          label: 'd',
          prompt:
            'Find the CRB of $A$ and check that for $\\alpha = 0$ it equals $A^2/(2N)$.',
          steps: [
            {
              title: 'Keep only the A-dependent log-likelihood terms',
              body: 'From part (a): a $-N\\ln A$ term from the normalization, plus the quadratic expanded into an energy term and a mean term.',
              latex:
                '\\ln f(\\mathbf{x}; A) = -N\\ln A - \\frac{\\|\\mathbf{x}\\|^2}{2A^2\\sigma^2} + \\frac{\\alpha\\mathbf{1}^T\\mathbf{x}}{A\\sigma^2} + \\text{const}',
            },
            {
              title: 'Differentiate twice',
              body: 'Each term drops a power of $A$ per derivative.',
              latex:
                '\\frac{\\partial^2 \\ln f}{\\partial A^2} = \\frac{N}{A^2} - \\frac{3\\|\\mathbf{x}\\|^2}{A^4\\sigma^2} + \\frac{2\\alpha\\mathbf{1}^T\\mathbf{x}}{A^3\\sigma^2}',
            },
            {
              title: 'Take expectations with the model moments',
              body: 'Use $E\\{\\mathbf{1}^T\\mathbf{x}\\} = N\\alpha A$ and $E\\{\\|\\mathbf{x}\\|^2\\} = N(\\alpha^2 + \\sigma^2)A^2$, then invert the Fisher information.',
              latex:
                'F = -E\\left\\{\\frac{\\partial^2 \\ln f}{\\partial A^2}\\right\\} = \\frac{N}{A^2}\\left(\\frac{\\alpha^2}{\\sigma^2} + 2\\right) \\;\\Longrightarrow\\; \\sigma^2_{CR}(A) = \\frac{A^2}{N\\left(\\frac{\\alpha^2}{\\sigma^2} + 2\\right)}',
              note: 'At $\\alpha = 0$: $CRB = A^2/(2N)$, finite — the variance channel keeps informing on $A$ even when the mean goes silent. And as $\\alpha^2/\\sigma^2$ (the SNR) grows, the bound tightens.',
            },
          ],
          answer: {
            sentence:
              'The Fisher information adds one term per channel: $\\alpha^2/\\sigma^2$ from the mean plus $2$ from the variance. The bound never blows up, even at $\\alpha = 0$.',
            latex:
              '\\sigma^2_{CR}(A) = \\frac{A^2}{N\\left(\\tfrac{\\alpha^2}{\\sigma^2} + 2\\right)}',
          },
        },
        {
          label: 'e',
          prompt: 'Is the estimator of part (b) efficient?',
          steps: [
            {
              title: 'Compare its variance against the bound',
              body: 'Both scale as $A^2/N$, so the ratio is clean — and strictly greater than 1 for every $\\alpha$.',
              latex:
                '\\frac{\\operatorname{Var}(\\hat{A})}{\\sigma^2_{CR}(A)} = \\frac{A^2\\sigma^2}{N\\alpha^2} \\cdot \\frac{N(\\alpha^2/\\sigma^2 + 2)}{A^2} = 1 + \\frac{2\\sigma^2}{\\alpha^2} > 1',
            },
            {
              title: 'Explain the gap',
              body: 'The estimator reads only the mean channel and throws the variance channel away, while an efficient estimator would have to spend both sources of information. Only for $\\alpha \\gg \\sigma$ — mean information dominating — does it come close.',
            },
          ],
          answer: {
            sentence:
              'Not efficient for any $\\alpha$: it wastes the information stored in the observation variance, and the ratio $1 + 2\\sigma^2/\\alpha^2$ prices exactly that waste.',
          },
        },
        {
          label: 'f',
          prompt: '(Extra) For $\\alpha = 0$, find the ML estimator of $A$.',
          steps: [
            {
              title: 'Maximize the simplified log-likelihood',
              body: 'With $\\alpha = 0$ the mean term disappears. Set the derivative of the two remaining terms to zero.',
              latex:
                '\\frac{\\partial \\ln f}{\\partial A} = -\\frac{N}{A} + \\frac{\\|\\mathbf{x}\\|^2}{A^3\\sigma^2} = 0 \\;\\Longrightarrow\\; \\hat{A}_{ML} = \\sqrt{\\frac{\\|\\mathbf{x}\\|^2}{N\\sigma^2}} = \\sqrt{\\hat{G}}',
            },
            {
              title: 'Interpret it',
              body: 'Compare the measured output noise power $\\|\\mathbf{x}\\|^2/N$ against the known input noise power $\\sigma^2$: the amplifier multiplies noise power by $A^2$, so the ratio, square-rooted, is the gain.',
            },
          ],
          answer: {
            sentence:
              'The ML estimate is the square root of the unbiased power-gain estimate of part (c): measure how much the noise got louder.',
            latex:
              '\\hat{A}_{ML} = \\sqrt{\\frac{\\|\\mathbf{x}\\|^2}{N\\sigma^2}}',
          },
        },
      ],
    },
    {
      id: 'wp-pixel',
      source: 'Final, June 19 2026, Ex. 1 (33.3 %)',
      title: 'The defective pixel: classical fusion, then a prior',
      why: 'E3 as an exam problem: nine unequal springs pulling on one estimate, with the two sanity limits ($\\sigma_0^2 = \\sigma^2$, $\\sigma_0^2 \\gg \\sigma^2$) asked explicitly — then the same spring picture again with a prior attached (MAP), so you see classical and Bayesian fusion are one mechanism.',
      statement: [
        {
          kind: 'text',
          content:
            'A camera is suspected to have defective sensors: a defective sensor adds noise of higher variance than a correct one. In a locally homogeneous region (a clear sky of true brightness $\\theta$), the defective pixel and its 8 neighbors are observed as',
        },
        {
          kind: 'math',
          content:
            '\\begin{aligned} x_0 &= \\theta + w_0, & w_0 &\\sim N(0, \\sigma_0^2) \\\\ x_i &= \\theta + w_i, & w_i &\\sim N(0, \\sigma^2), \\quad i = 1, \\dots, 8 \\end{aligned}',
        },
        {
          kind: 'text',
          content:
            'with all noises zero-mean Gaussian and independent across sensors.',
        },
      ],
      parts: [
        {
          label: 'a',
          prompt:
            'Find the ML estimator of $\\theta$ using only the defective pixel $x_0$. What is its variance? Is it efficient?',
          steps: [
            {
              title: 'Differentiate the single-sample log-likelihood',
              body: 'One Gaussian observation centered on $\\theta$. The score is linear in $(x_0 - \\theta)$.',
              latex:
                '\\frac{\\partial \\ln f(x_0; \\theta)}{\\partial \\theta} = \\frac{1}{\\sigma_0^2}(x_0 - \\theta) \\;\\Longrightarrow\\; \\hat{\\theta}_{ML} = x_0',
            },
            {
              title: 'Read efficiency off the score factorization',
              body: 'The score already has the efficient-estimator form: Fisher information times (estimator minus parameter). So the bound is met with equality.',
              latex:
                '\\operatorname{Var}(\\hat{\\theta}_{ML}) = CRB_\\theta = \\sigma_0^2',
            },
          ],
          answer: {
            sentence:
              'With one observation the best you can do is trust it: $\\hat{\\theta} = x_0$, efficient, with all of $\\sigma_0^2$ as variance.',
            latex:
              '\\hat{\\theta}_{ML} = x_0, \\qquad \\operatorname{Var} = \\sigma_0^2',
          },
        },
        {
          label: 'b',
          prompt:
            'Using all nine observations $\\mathbf{x} = [x_0, x_1, \\dots, x_8]^T$, find the efficient estimator of $\\theta$ if it exists (otherwise the ML estimator).',
          steps: [
            {
              title: 'Write the joint density with unequal variances',
              body: 'Independent sensors give a diagonal covariance $\\mathbf{C}_x = \\operatorname{diag}[\\sigma_0^2, \\sigma^2, \\dots, \\sigma^2]$ and mean $\\theta\\mathbf{1}$.',
              latex:
                '\\frac{\\partial \\ln f(\\mathbf{x}; \\theta)}{\\partial \\theta} = \\mathbf{1}^T\\mathbf{C}_x^{-1}(\\mathbf{x} - \\mathbf{1}\\theta) = \\mathbf{1}^T\\mathbf{C}_x^{-1}\\mathbf{1}\\left(\\frac{\\mathbf{1}^T\\mathbf{C}_x^{-1}\\mathbf{x}}{\\mathbf{1}^T\\mathbf{C}_x^{-1}\\mathbf{1}} - \\theta\\right)',
              note: 'The score factorizes, so the estimator it exposes is efficient — no need to hunt further.',
            },
            {
              title: 'Spell out the precision weighting',
              body: 'Each observation enters divided by its own variance: springs with stiffness one over variance.',
              latex:
                '\\hat{\\theta}_{ef} = \\frac{\\frac{x_0}{\\sigma_0^2} + \\frac{1}{\\sigma^2}\\sum_{i=1}^{8} x_i}{\\frac{1}{\\sigma_0^2} + \\frac{8}{\\sigma^2}}, \\qquad \\operatorname{Var}(\\hat{\\theta}_{ef}) = CRB_\\theta = \\frac{1}{\\frac{1}{\\sigma_0^2} + \\frac{8}{\\sigma^2}}',
            },
          ],
          answer: {
            sentence:
              'The efficient estimator exists: a precision-weighted average where precisions (inverse variances) add — the E3 springs, verbatim.',
            latex:
              '\\hat{\\theta}_{ef} = \\frac{x_0/\\sigma_0^2 + \\sum_i x_i/\\sigma^2}{1/\\sigma_0^2 + 8/\\sigma^2}',
          },
        },
        {
          label: 'c',
          prompt:
            'Analyze the estimator and its variance for $\\sigma_0^2 = \\sigma^2$ and $\\sigma_0^2 \\gg \\sigma^2$, and compare with the ML estimator based only on the 8 neighbors.',
          steps: [
            {
              title: 'Equal sensors: the plain average returns',
              body: 'All nine weights equalize and the estimator collapses to the sample mean of nine values.',
              latex:
                '\\sigma_0^2 = \\sigma^2: \\quad \\hat{\\theta}_{ML} = \\frac{1}{9}\\sum_{i=0}^{8} x_i, \\qquad \\operatorname{Var} = \\frac{\\sigma^2}{9}',
            },
            {
              title: 'Broken sensor: the weight goes to zero by itself',
              body: 'As $\\sigma_0^2 \\to \\infty$ the term $1/\\sigma_0^2$ vanishes and the estimator silently discards $x_0$ — nobody has to decide to ignore the bad pixel. The weighting does it.',
              latex:
                '\\sigma_0^2 \\gg \\sigma^2: \\quad \\hat{\\theta}_{ML} \\approx \\frac{1}{8}\\sum_{i=1}^{8} x_i, \\qquad \\operatorname{Var} \\approx \\frac{\\sigma^2}{8}',
            },
            {
              title: 'Compare with using neighbors only',
              body: 'The 8-neighbor estimator has variance $\\sigma^2/8$ always. The nine-pixel fusion never does worse — an extra spring, however soft, can only pull the variance down.',
            },
          ],
          answer: {
            sentence:
              'The fusion interpolates between the 9-average and the 8-average as the defective pixel degrades, and always beats or matches discarding data outright.',
          },
        },
        {
          label: 'd',
          prompt:
            'Compute the MAP estimator of $\\theta$ using $x_0$ as data and the prior $\\theta \\sim N(\\mu_\\theta, \\sigma_\\theta^2)$.',
          steps: [
            {
              title: 'Maximize likelihood × prior',
              body: 'The posterior derivative sets the data pull and the prior pull in balance — the prior enters exactly like one more Gaussian observation located at $\\mu_\\theta$.',
              latex:
                '\\frac{\\partial}{\\partial\\theta}\\ln\\left(f(x_0\\mid\\theta) f(\\theta)\\right) = \\frac{x_0 - \\theta}{\\sigma_0^2} - \\frac{\\theta - \\mu_\\theta}{\\sigma_\\theta^2} = 0',
            },
            {
              title: 'Solve the balance of springs',
              body: 'Same precision-weighted form as part (b), with the prior as the second spring.',
              latex:
                '\\hat{\\theta}_{MAP} = \\frac{\\frac{x_0}{\\sigma_0^2} + \\frac{\\mu_\\theta}{\\sigma_\\theta^2}}{\\frac{1}{\\sigma_0^2} + \\frac{1}{\\sigma_\\theta^2}}',
            },
          ],
          answer: {
            sentence:
              'MAP is fusion with a prior: the measurement and the prior mean, each weighted by its precision. Structurally identical to part (b).',
            latex:
              '\\hat{\\theta}_{MAP} = \\frac{x_0/\\sigma_0^2 + \\mu_\\theta/\\sigma_\\theta^2}{1/\\sigma_0^2 + 1/\\sigma_\\theta^2}',
          },
        },
        {
          label: 'e',
          prompt:
            'Write the result as $\\hat{\\theta}_{MAP} = \\frac{x_0}{\\alpha} + \\frac{\\mu_\\theta}{\\beta}$, give $\\alpha, \\beta$ in terms of $\\sigma_0^2, \\sigma_\\theta^2$, and analyze $\\sigma_\\theta^2 \\gg \\sigma_0^2$ and $\\sigma_0^2 \\gg \\sigma_\\theta^2$.',
          steps: [
            {
              title: 'Split the fraction and read the coefficients',
              body: 'Split the MAP fraction into an $x_0$ term and a $\\mu_\\theta$ term. Multiplying the $x_0$ term above and below by $\\sigma_0^2$ leaves $x_0/(1 + \\sigma_0^2/\\sigma_\\theta^2)$. Multiplying the $\\mu_\\theta$ term by $\\sigma_\\theta^2$ leaves $\\mu_\\theta/(1 + \\sigma_\\theta^2/\\sigma_0^2)$.',
              latex:
                '\\alpha = 1 + \\frac{\\sigma_0^2}{\\sigma_\\theta^2}, \\qquad \\beta = 1 + \\frac{\\sigma_\\theta^2}{\\sigma_0^2}',
            },
            {
              title: 'Take both limits',
              body: 'A vague prior ($\\sigma_\\theta^2 \\gg \\sigma_0^2$) hands the estimate to the data: $\\hat{\\theta}_{MAP} \\approx x_0$. A noisy sensor ($\\sigma_0^2 \\gg \\sigma_\\theta^2$) hands it to the prior: $\\hat{\\theta}_{MAP} \\approx \\mu_\\theta$.',
            },
          ],
          answer: {
            sentence:
              'The estimator slides between trusting the pixel and trusting the prior, governed purely by the variance ratio — the same knob the E3 figure lets you drag.',
            latex:
              '\\alpha = 1 + \\dfrac{\\sigma_0^2}{\\sigma_\\theta^2}, \\qquad \\beta = 1 + \\dfrac{\\sigma_\\theta^2}{\\sigma_0^2}',
          },
        },
      ],
    },
    {
      id: 'wp-exponential',
      source: 'Midterm, Oct 30 2025, Ex. 2 (40 %)',
      title: 'Hospital arrivals: buy accuracy with bias',
      why: 'The cleanest recent example of the E1 lesson that unbiased is not sacred: after finding the efficient estimator, the exam asks whether deliberately shrinking it can lower the MSE.',
      statement: [
        {
          kind: 'text',
          content:
            'The time between successive patient arrivals at an emergency service is exponential with parameter $\\mu$ (the average inter-arrival time):',
        },
        {
          kind: 'math',
          content:
            'f_X(x; \\mu) = \\frac{1}{\\mu}\\,e^{-x/\\mu}, \\qquad x \\geq 0',
        },
        {
          kind: 'text',
          content:
            'We have $N$ independent observations $x_n$, $n = 1, \\dots, N$.',
        },
      ],
      parts: [
        {
          label: 'a',
          prompt:
            'Find the Cramér–Rao bound $CRB_\\mu$ and the efficient estimator $\\hat{\\mu}_{ef}(\\mathbf{x})$.',
          steps: [
            {
              title: 'Write the joint log-likelihood and its score',
              body: 'Independence multiplies the densities. The score then factors into (information) × (sample mean minus parameter), which is the efficient-estimator signature.',
              latex:
                '\\frac{\\partial \\ln f(\\mathbf{x}; \\mu)}{\\partial \\mu} = -\\frac{N}{\\mu} + \\frac{\\mathbf{1}^T\\mathbf{x}}{\\mu^2} = \\frac{N}{\\mu^2}\\left(\\frac{\\mathbf{1}^T\\mathbf{x}}{N} - \\mu\\right)',
            },
            {
              title: 'Read both answers off the factorization',
              body: 'The factor in front is the Fisher information. Its inverse is the bound, and the pivot of the bracket is the efficient estimator.',
              latex:
                'CRB_\\mu = \\frac{\\mu^2}{N}, \\qquad \\hat{\\mu}_{ef} = \\frac{\\mathbf{1}^T\\mathbf{x}}{N}',
            },
          ],
          answer: {
            sentence:
              'The sample mean is efficient: variance exactly $\\mu^2/N$, the E2 curvature bound met with equality.',
            latex:
              '\\hat{\\mu}_{ef} = \\frac{1}{N}\\sum_{n} x_n, \\qquad CRB_\\mu = \\frac{\\mu^2}{N}',
          },
        },
        {
          label: 'b',
          prompt:
            'For the scaled estimator $\\hat{\\mu} = (1+\\alpha)\\,\\hat{\\mu}_{ef}$, find the bias, the variance, and the MSE as functions of $\\alpha$, $\\mu$, $N$.',
          steps: [
            {
              title: 'Scale the moments',
              body: 'Scaling by $(1+\\alpha)$ multiplies the mean by $(1+\\alpha)$ and the variance by $(1+\\alpha)^2$.',
              latex:
                'b_{\\hat{\\mu}} = (1+\\alpha)\\mu - \\mu = \\alpha\\mu, \\qquad \\sigma^2_{\\hat{\\mu}} = (1+\\alpha)^2\\frac{\\mu^2}{N}',
            },
            {
              title: 'Assemble the MSE',
              body: 'MSE is variance plus bias squared — the two currencies the shrinkage will trade against each other.',
              latex:
                'MSE_{\\hat{\\mu}} = (1+\\alpha)^2\\frac{\\mu^2}{N} + \\alpha^2\\mu^2',
            },
          ],
          answer: {
            sentence:
              'Negative $\\alpha$ buys variance reduction (quadratic gain) at the price of bias (quadratic cost, but scaled by 1 instead of $1/N$) — the books are ready for optimization.',
            latex:
              'MSE_{\\hat{\\mu}} = (1+\\alpha)^2\\tfrac{\\mu^2}{N} + \\alpha^2\\mu^2',
          },
        },
        {
          label: 'c',
          prompt:
            'Find the $\\alpha$ that minimizes the MSE as a function of $N$.',
          steps: [
            {
              title: 'Differentiate and solve',
              body: 'The optimum is strictly negative: the MSE-best estimator shrinks toward zero.',
              latex:
                '\\frac{\\partial\\,MSE}{\\partial \\alpha} = \\frac{2(1+\\alpha)\\mu^2}{N} + 2\\alpha\\mu^2 = 0 \\;\\Longrightarrow\\; \\alpha = -\\frac{1}{N+1}',
            },
          ],
          answer: {
            sentence:
              'Shrink by exactly one part in $N+1$: the optimal estimator is $\\frac{N}{N+1}\\hat{\\mu}_{ef}$, deliberately biased low.',
            latex: '\\alpha^\\star = -\\frac{1}{N+1}',
          },
        },
        {
          label: 'd',
          prompt: 'Compare the MSE of $\\hat{\\mu}$ and $\\hat{\\mu}_{ef}$.',
          steps: [
            {
              title: 'Substitute the optimal shrinkage',
              body: 'Insert $\\alpha = -1/(N+1)$ into the MSE of part (b) and simplify.',
              latex:
                'MSE_{\\hat{\\mu}} = \\left(\\tfrac{N}{N+1}\\right)^2\\frac{\\mu^2}{N} + \\frac{\\mu^2}{(N+1)^2} = \\frac{\\mu^2}{N+1} \\;<\\; \\frac{\\mu^2}{N} = MSE_{\\hat{\\mu}_{ef}}',
            },
          ],
          answer: {
            sentence:
              'The biased estimator beats the efficient one for every $N$ — as if a free extra observation appeared. The CRB only referees the unbiased league. Step outside it and you can do better.',
            latex: '\\frac{\\mu^2}{N+1} < \\frac{\\mu^2}{N}',
          },
        },
      ],
    },
    {
      id: 'wp-poisson',
      source: 'Final, January 7 2026, Ex. 1 (40 %)',
      title: 'Poisson accidents: ML, a transformed cost, and a prior',
      why: 'One problem covering the three ways an exam can dress up estimation: straight ML with efficiency and consistency, estimating a nonlinear transformation $c(\\lambda) = \\lambda^2 + \\lambda$ of the parameter, and a MAP estimator with a prior on the parameter.',
      statement: [
        {
          kind: 'text',
          content:
            'A petrochemical plant models the number of people injured per week, $k \\geq 0$, as Poisson with parameter $\\lambda$ (so $E\\{k\\} = \\operatorname{var}\\{k\\} = \\lambda$):',
        },
        {
          kind: 'math',
          content: '\\Pr(k; \\lambda) = \\frac{e^{-\\lambda}\\lambda^k}{k!}',
        },
        {
          kind: 'text',
          content:
            'The HR department has $N$ independent weekly counts $k_n$, $n = 1, \\dots, N$, collected in $\\mathbf{k} = [k_1, \\dots, k_N]^T$.',
        },
      ],
      parts: [
        {
          label: 'a',
          prompt: 'Find the ML estimator $\\hat{\\lambda}_{ML}(\\mathbf{k})$.',
          steps: [
            {
              title: 'Multiply, log, differentiate',
              body: 'Independence turns the product into a sum. The score again factors into information × (sample mean − parameter).',
              latex:
                '\\frac{\\partial \\ln \\Pr(\\mathbf{k}; \\lambda)}{\\partial \\lambda} = -N + \\frac{\\mathbf{1}^T\\mathbf{k}}{\\lambda} = \\frac{N}{\\lambda}\\left(\\frac{\\mathbf{1}^T\\mathbf{k}}{N} - \\lambda\\right) = 0',
            },
          ],
          answer: {
            sentence:
              'The ML estimate of the accident rate is the sample mean of the weekly counts.',
            latex:
              '\\hat{\\lambda}_{ML} = \\frac{1}{N}\\mathbf{1}^T\\mathbf{k}',
          },
        },
        {
          label: 'b',
          prompt:
            'Is $\\hat{\\lambda}_{ML}$ the efficient estimator of $\\lambda$?',
          steps: [
            {
              title: 'Recognize the factorized score',
              body: 'The score in part (a) already has the form $F(\\lambda)(\\hat{\\lambda} - \\lambda)$ with $F = N/\\lambda$. By the CR theorem that is exactly the certificate of efficiency.',
              latex:
                '\\frac{\\partial \\ln \\Pr}{\\partial \\lambda} = \\underbrace{\\frac{N}{\\lambda}}_{F(\\lambda)}\\left(\\hat{\\lambda}_{ML} - \\lambda\\right) \\;\\Longrightarrow\\; \\text{efficient}',
            },
          ],
          answer: {
            sentence:
              'Yes — the factorization is the proof, no variance computation needed.',
          },
        },
        {
          label: 'c',
          prompt: 'Is $\\hat{\\lambda}_{ML}$ consistent?',
          steps: [
            {
              title: 'Let the MSE go to zero',
              body: 'Efficiency gives unbiasedness plus variance equal to the bound $\\lambda/N$. The MSE is then $\\lambda/N \\to 0$ as $N \\to \\infty$.',
              latex:
                'MSE\\{\\hat{\\lambda}_{ML}\\} = \\operatorname{var}\\{\\hat{\\lambda}_{ML}\\} = \\frac{\\lambda}{N} \\xrightarrow{N \\to \\infty} 0',
            },
          ],
          answer: {
            sentence:
              'Consistent: the estimate collapses onto the true rate as weeks accumulate.',
          },
        },
        {
          label: 'd',
          prompt:
            'The insurance cost is $c = c(\\lambda) = E^2\\{k\\} + \\operatorname{var}\\{k\\} = \\lambda^2 + \\lambda$. Find $\\hat{c}_{ML}(\\mathbf{k})$.',
          steps: [
            {
              title: 'Invoke ML invariance',
              body: 'The ML estimate of a transformation is the transformation of the ML estimate — no new optimization.',
              latex:
                '\\hat{c}_{ML} = \\hat{\\lambda}_{ML}^2 + \\hat{\\lambda}_{ML} = \\left(\\tfrac{1}{N}\\mathbf{1}^T\\mathbf{k}\\right)^2 + \\tfrac{1}{N}\\mathbf{1}^T\\mathbf{k}',
            },
          ],
          answer: {
            sentence: 'Plug the sample mean into the cost curve.',
            latex:
              '\\hat{c}_{ML} = \\hat{\\lambda}_{ML}^2 + \\hat{\\lambda}_{ML}',
          },
        },
        {
          label: 'e',
          prompt:
            'Find the bias of $\\hat{c}_{ML}$. Is it an efficient estimator of $c$?',
          steps: [
            {
              title: 'Take the mean using known moments',
              body: 'The square of an estimator picks up its variance: $E\\{\\hat{\\lambda}^2\\} = \\operatorname{var}(\\hat{\\lambda}) + E^2\\{\\hat{\\lambda}\\}$.',
              latex:
                'E\\{\\hat{c}_{ML}\\} = \\frac{\\lambda}{N} + \\lambda^2 + \\lambda = c + \\frac{\\lambda}{N}',
            },
            {
              title: 'Conclude on both properties',
              body: 'Bias $\\lambda/N \\neq 0$, so not unbiased (though asymptotically it is), and a biased estimator cannot be efficient. Deeper reason: the transformation $c(\\lambda)$ is not affine, and efficiency only survives affine maps.',
            },
          ],
          answer: {
            sentence:
              'Biased by $\\lambda/N$ — vanishing with data, but enough to disqualify it from efficiency.',
            latex: 'b = E\\{\\hat{c}_{ML}\\} - c = \\frac{\\lambda}{N}',
          },
        },
        {
          label: 'f',
          prompt: 'Give the Cramér–Rao bound for the cost $c$.',
          steps: [
            {
              title: 'Transform the bound with the slope',
              body: 'For a transformed parameter the CRB scales by the squared derivative of the transformation.',
              latex:
                'CRB(c) = \\left(\\frac{\\partial c}{\\partial \\lambda}\\right)^2 CRB(\\lambda) = (2\\lambda + 1)^2\\,\\frac{\\lambda}{N}',
            },
          ],
          answer: {
            sentence:
              'The floor for estimating the cost is the rate floor amplified by the local slope of the cost curve.',
            latex: 'CRB(c) = (2\\lambda+1)^2\\,\\tfrac{\\lambda}{N}',
          },
        },
        {
          label: 'g',
          prompt:
            'With prior information $f(\\lambda) = \\frac{1}{s}e^{-\\lambda/s}$, $\\lambda > 0$ (so $E\\{\\lambda\\} = s$), find the MAP estimator $\\hat{\\lambda}_{MAP}(\\mathbf{k})$.',
          steps: [
            {
              title: 'Add the log-prior to the log-likelihood',
              body: 'The exponential prior contributes a constant pull $-1/s$ to the score.',
              latex:
                '\\frac{\\partial}{\\partial\\lambda}\\ln\\left(\\Pr(\\mathbf{k}; \\lambda)f(\\lambda)\\right) = -N + \\frac{\\mathbf{1}^T\\mathbf{k}}{\\lambda} - \\frac{1}{s} = 0',
            },
            {
              title: 'Solve for λ',
              body: 'The prior enters as a soft penalty in the denominator.',
              latex:
                '\\hat{\\lambda}_{MAP} = \\frac{s}{1 + Ns}\\,\\mathbf{1}^T\\mathbf{k}',
            },
          ],
          answer: {
            sentence:
              'Same count statistic, discounted by the prior: the smaller $s$ (a prior insisting on low rates), the stronger the discount.',
            latex:
              '\\hat{\\lambda}_{MAP} = \\frac{s}{1+Ns}\\,\\mathbf{1}^T\\mathbf{k}',
          },
        },
        {
          label: 'h',
          prompt:
            'Express $\\hat{\\lambda}_{MAP}$ in terms of $\\hat{\\lambda}_{ML}$ and particularize for $N \\to \\infty$.',
          steps: [
            {
              title: 'Factor out the ML estimator',
              body: 'The MAP is a shrunk ML, with shrinkage factor $sN/(1+Ns) < 1$ that tends to 1 as data accumulate.',
              latex:
                '\\hat{\\lambda}_{MAP} = \\frac{sN}{1 + Ns}\\,\\hat{\\lambda}_{ML} \\xrightarrow{N \\to \\infty} \\hat{\\lambda}_{ML}',
            },
          ],
          answer: {
            sentence:
              'With enough weeks of data the prior is outvoted and MAP converges to ML — priors are starting capital, not a permanent stake.',
          },
        },
        {
          label: 'i',
          prompt:
            'Particularize $\\hat{\\lambda}_{MAP}$ for $s \\to \\infty$ and $s \\to 0$, and interpret.',
          steps: [
            {
              title: 'Take both prior limits',
              body: 'As $s \\to \\infty$ the exponential prior flattens toward uniform: no opinion, so $\\hat{\\lambda}_{MAP} \\to \\hat{\\lambda}_{ML}$ and the data rule. As $s \\to 0$ the prior collapses onto zero — infinite conviction that $\\lambda$ is tiny — and $\\hat{\\lambda}_{MAP} \\to 0$ regardless of the data.',
            },
          ],
          answer: {
            sentence:
              'The prior width $s$ is the volume knob between “listen to the data” and “I already know the answer”. Same slider as the pixel problem’s part (e).',
          },
        },
      ],
    },
    {
      id: 'wp-radar-blue',
      source: 'Midterm, April 7 2025, Ex. 2',
      title: 'Radar amplitude in colored noise: design the estimator yourself',
      why: 'The estimation twin of the Detection page’s whitening move: you build the best linear unbiased estimator with a Lagrange multiplier. The closing parts ask when that linear design is also efficient.',
      statement: [
        {
          kind: 'text',
          content:
            'A pulsed radar receives, after delay correction, $N$ real samples of a known transmitted signal $s(n)$, attenuated by an unknown constant amplitude $A$ and degraded by zero-mean colored noise of known covariance $c_w(m)$:',
        },
        {
          kind: 'math',
          content: 'x(n) = A\\,s(n) + w(n), \\qquad n = 0, \\dots, N-1',
        },
        {
          kind: 'text',
          content:
            'We want an unbiased estimator of $A$ from $x(0), \\dots, x(N-1)$.',
        },
      ],
      parts: [
        {
          label: 'a',
          prompt:
            'Detail the vectors $\\mathbf{x}$, $\\mathbf{s}$, $\\mathbf{w}$ in the model $\\mathbf{x} = \\mathbf{s}A + \\mathbf{w}$ and the content of the covariance matrix $\\mathbf{C}_w$.',
          steps: [
            {
              title: 'Stack the samples. Let the lags fill the matrix',
              body: 'The vectors stack the $N$ samples of each signal. Stationary colored noise makes $\\mathbf{C}_w$ Toeplitz: entry $(i, j)$ is the autocorrelation at lag $i - j$.',
              latex:
                '\\mathbf{C}_w = \\begin{bmatrix} c_w(0) & c_w(-1) & \\cdots & c_w(-N{+}1) \\\\ c_w(1) & c_w(0) & & \\vdots \\\\ \\vdots & & \\ddots & \\\\ c_w(N{-}1) & \\cdots & & c_w(0) \\end{bmatrix}',
              note: 'With zero-mean noise $c_w(m)$ is the autocorrelation $r_w(m)$ of the Processes lesson, arranged into its correlation-matrix terrain — the same matrix the whole course keeps walking on.',
            },
          ],
          answer: {
            sentence:
              'A known direction $\\mathbf{s}$ scaled by the unknown $A$, buried in a colored cloud whose shape $\\mathbf{C}_w$ you know.',
          },
        },
        {
          label: 'b',
          prompt:
            'For a linear estimator $\\hat{A}(\\mathbf{x}) = \\mathbf{h}^T\\mathbf{x}$ with generic $\\mathbf{h}$, find its mean and variance.',
          steps: [
            {
              title: 'Push the linear map through the model',
              body: 'The mean picks up the projection of $\\mathbf{h}$ onto the signal direction. The variance is the quadratic form of $\\mathbf{h}$ on the noise terrain.',
              latex:
                'E\\{\\hat{A}\\} = \\mathbf{h}^T\\mathbf{s}\\,A, \\qquad \\operatorname{Var}\\{\\hat{A}\\} = \\mathbf{h}^T\\mathbf{C}_w\\mathbf{h}',
            },
          ],
          answer: {
            sentence:
              'Bias is controlled by $\\mathbf{h}^T\\mathbf{s}$, price by $\\mathbf{h}^T\\mathbf{C}_w\\mathbf{h}$ — a constrained walk on the noise covariance terrain is coming.',
          },
        },
        {
          label: 'c',
          prompt:
            'State the condition on $\\mathbf{h}$ for unbiasedness, then use a Lagrange multiplier to find the minimum-variance linear unbiased estimator and its variance.',
          steps: [
            {
              title: 'Fix the gain, minimize the noise',
              body: 'Unbiased for every $A$ requires $\\mathbf{h}^T\\mathbf{s} = 1$. Minimize the variance on that plane with a multiplier.',
              latex:
                '\\varphi(\\mathbf{h}, \\lambda) = \\mathbf{h}^T\\mathbf{C}_w\\mathbf{h} - \\lambda\\,(\\mathbf{h}^T\\mathbf{s} - 1)',
            },
            {
              title: 'Differentiate and recognize the whitened match',
              body: 'The gradient condition gives $\\mathbf{h} \\propto \\mathbf{C}_w^{-1}\\mathbf{s}$ — the whitening-then-matching direction of the Detection lesson, now discovered by an estimation argument. The constraint sets the scale.',
              latex:
                '2\\mathbf{C}_w\\mathbf{h} - \\lambda\\mathbf{s} = \\mathbf{0} \\;\\Longrightarrow\\; \\mathbf{h}_{opt} = \\frac{\\mathbf{C}_w^{-1}\\mathbf{s}}{\\mathbf{s}^T\\mathbf{C}_w^{-1}\\mathbf{s}}, \\qquad \\hat{A}(\\mathbf{x}) = \\frac{\\mathbf{s}^T\\mathbf{C}_w^{-1}\\mathbf{x}}{\\mathbf{s}^T\\mathbf{C}_w^{-1}\\mathbf{s}}',
            },
            {
              title: 'Price the design',
              body: 'Substituting back, the constraint makes the variance collapse to one clean scalar.',
              latex:
                '\\operatorname{Var}\\{\\hat{A}\\} = \\mathbf{h}_{opt}^T\\mathbf{C}_w\\mathbf{h}_{opt} = \\frac{1}{\\mathbf{s}^T\\mathbf{C}_w^{-1}\\mathbf{s}}',
            },
          ],
          answer: {
            sentence:
              'The BLUE correlates the data against $\\mathbf{C}_w^{-1}\\mathbf{s}$ — listen along the whitened pulse — and its variance is one over the whitened pulse energy.',
            latex:
              '\\hat{A} = \\frac{\\mathbf{s}^T\\mathbf{C}_w^{-1}\\mathbf{x}}{\\mathbf{s}^T\\mathbf{C}_w^{-1}\\mathbf{s}}, \\qquad \\operatorname{Var} = \\frac{1}{\\mathbf{s}^T\\mathbf{C}_w^{-1}\\mathbf{s}}',
          },
        },
        {
          label: 'd',
          prompt:
            'Now assume the colored noise is Gaussian, $\\mathbf{w} \\sim N(\\mathbf{0}, \\mathbf{C}_w)$. Find the Cramér–Rao bound for $A$.',
          steps: [
            {
              title: 'Differentiate the Gaussian log-likelihood',
              body: 'With $\\mathbf{x} \\sim N(\\mathbf{s}A, \\mathbf{C}_w)$ the score is linear in the data — and it factorizes into information × (estimator − parameter), the E2 signature.',
              latex:
                '\\frac{\\partial \\log f(\\mathbf{x}; A)}{\\partial A} = \\mathbf{s}^T\\mathbf{C}_w^{-1}(\\mathbf{x} - \\mathbf{s}A) = \\mathbf{s}^T\\mathbf{C}_w^{-1}\\mathbf{s}\\left(\\frac{\\mathbf{s}^T\\mathbf{C}_w^{-1}\\mathbf{x}}{\\mathbf{s}^T\\mathbf{C}_w^{-1}\\mathbf{s}} - A\\right)',
            },
            {
              title: 'Read the bound off the factor',
              body: 'The Fisher information is the factor in front. A second derivative confirms it.',
              latex:
                '\\sigma^2_{CR}(A) = \\frac{-1}{E\\left\\{\\frac{\\partial^2 \\log f}{\\partial A^2}\\right\\}} = \\frac{1}{\\mathbf{s}^T\\mathbf{C}_w^{-1}\\mathbf{s}}',
            },
          ],
          answer: {
            sentence:
              'The floor equals the whitened pulse energy inverted — exactly the variance the linear design already achieved.',
            latex:
              '\\sigma^2_{CR}(A) = \\frac{1}{\\mathbf{s}^T\\mathbf{C}_w^{-1}\\mathbf{s}}',
          },
        },
        {
          label: 'e',
          prompt:
            'Does an efficient estimator exist? Compare with part (c) and comment on similarities and differences.',
          steps: [
            {
              title: 'Match the two results',
              body: 'The score factorization in (d) certifies an efficient estimator whose expression coincides with the BLUE of part (c): unbiased, variance equal to the bound. So under Gaussian noise, yes — and it is the same formula.',
            },
            {
              title: 'Draw the boundary of the claim',
              body: 'The subtlety: part (c) never used Gaussianity, so its estimator is the minimum-variance LINEAR unbiased estimator for any noise with covariance $\\mathbf{C}_w$. If the noise had another distribution, the CRB itself would change, and some nonlinear estimator might beat the linear one. Gaussianity is what promotes the BLUE to MVUE.',
            },
          ],
          answer: {
            sentence:
              'Efficient under Gaussian noise, where BLUE and ML coincide. For other noise distributions the linear design is only the best of its class.',
          },
        },
      ],
    },
    {
      id: 'wp-cable',
      source: 'Midterm, April 13 2026, Ex. 2 (5 points)',
      title: 'Two wires, one value: the ML estimator that cancels interference',
      why: 'You assemble the covariance of two correlated wires yourself, derive the ML estimator from it, then test it against the interference power.',
      statement: [
        {
          kind: 'text',
          content:
            'To transmit a value $A$ robustly over a cable exposed to strong ambient interference, two wires carry $A$ and $-A$ respectively. For $n = 0, \\dots, N-1$ we receive',
        },
        {
          kind: 'math',
          content:
            'x_1(n) = A + w(n) + v_1(n), \\qquad x_2(n) = -A + w(n) + v_2(n)',
        },
        {
          kind: 'text',
          content:
            'The external noise $w(n) \\sim N(0, \\sigma_w^2)$ is common to both wires. The thermal noises $v_1(n), v_2(n) \\sim N(0, \\sigma_v^2)$ are not. All are white and mutually independent.',
        },
      ],
      parts: [
        {
          label: 'a',
          prompt:
            'Identify the vectors $\\mathbf{x}(n)$, $\\mathbf{p}$, $\\mathbf{q}$ and $\\mathbf{v}(n)$ in the two-dimensional model $\\mathbf{x}(n) = A\\mathbf{p} + w(n)\\mathbf{q} + \\mathbf{v}(n)$.',
          steps: [
            {
              title: 'Read the signs off the model',
              body: 'The signal enters the wires with opposite signs. The interference enters both alike.',
              latex:
                '\\mathbf{x}(n) = \\begin{bmatrix} x_1(n) \\\\ x_2(n) \\end{bmatrix}, \\quad \\mathbf{p} = \\begin{bmatrix} 1 \\\\ -1 \\end{bmatrix}, \\quad \\mathbf{q} = \\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix}, \\quad \\mathbf{v}(n) = \\begin{bmatrix} v_1(n) \\\\ v_2(n) \\end{bmatrix}',
            },
          ],
          answer: {
            sentence:
              'Signal along $[1, -1]^T$, interference along $[1, 1]^T$ — two orthogonal directions, which is the whole secret of the problem.',
          },
        },
        {
          label: 'b',
          prompt:
            'Find the covariance matrix $\\mathbf{C}_x$ of $\\mathbf{x}(n)$ and the density $f(\\mathbf{x}(0), \\dots, \\mathbf{x}(N{-}1); A)$.',
          steps: [
            {
              title: 'Assemble the structured covariance',
              body: 'The common noise correlates the two wires, so $\\mathbf{C}_x$ is NOT diagonal: a rank-one interference part along $\\mathbf{q}$ plus a thermal floor.',
              latex:
                '\\mathbf{C}_x = \\sigma_w^2\\,\\mathbf{q}\\mathbf{q}^T + \\sigma_v^2\\,\\mathbf{I} = \\begin{bmatrix} \\sigma_w^2 + \\sigma_v^2 & \\sigma_w^2 \\\\ \\sigma_w^2 & \\sigma_w^2 + \\sigma_v^2 \\end{bmatrix}',
            },
            {
              title: 'Multiply over independent time instants',
              body: 'Each snapshot is $N(A\\mathbf{p}, \\mathbf{C}_x)$ and different instants are independent.',
              latex:
                'f = \\prod_{n=0}^{N-1} \\frac{1}{2\\pi\\sqrt{\\det\\mathbf{C}_x}} \\exp\\!\\left(-\\tfrac{1}{2}\\left(\\mathbf{x}(n) - \\mathbf{p}A\\right)^T\\mathbf{C}_x^{-1}\\left(\\mathbf{x}(n) - \\mathbf{p}A\\right)\\right)',
            },
          ],
          answer: {
            sentence:
              'A correlated two-channel Gaussian — the first exam model where the covariance you whiten with is one you built from the physics.',
          },
        },
        {
          label: 'c',
          prompt:
            'Find the ML estimator $\\hat{A}_{ML}$, simplify it as far as possible, and show it is a linear combiner of the two channels. Interpret.',
          steps: [
            {
              title: 'Set the score to zero in vector form',
              body: 'Differentiating the log-likelihood and equating to zero gives the general whitened-projection estimator.',
              latex:
                '\\hat{A}_{ML} = \\frac{1}{N\\,\\mathbf{p}^T\\mathbf{C}_x^{-1}\\mathbf{p}}\\;\\mathbf{p}^T\\mathbf{C}_x^{-1}\\sum_{n=0}^{N-1}\\mathbf{x}(n)',
            },
            {
              title: 'Let the structure collapse the algebra',
              body: 'Inverting the $2\\times 2$ matrix and multiplying by $\\mathbf{p}$, the interference terms cancel: $\\mathbf{p}^T\\mathbf{C}_x^{-1} = \\frac{1}{\\sigma_v^2}[1, -1]$, because $\\mathbf{p} \\perp \\mathbf{q}$.',
              latex:
                '\\hat{A}_{ML} = \\frac{1}{N}\\sum_{n=0}^{N-1}\\frac{x_1(n) - x_2(n)}{2}',
            },
            {
              title: 'Say what the formula discovered',
              body: 'The difference of the wires is immune to $w(n)$ — it cancels sample by sample, whatever its power — and halves the thermal noise by averaging the two copies of $A$: $\\frac{x_1 - x_2}{2} = A + \\frac{v_1 - v_2}{2}$. The outer average over $n$ then estimates the mean, as always.',
            },
          ],
          answer: {
            sentence:
              'ML rediscovers differential signaling: subtract the wires, halve, average. The interference never gets a vote.',
            latex:
              '\\hat{A}_{ML} = \\frac{1}{N}\\sum_{n}\\frac{x_1(n) - x_2(n)}{2}',
          },
        },
        {
          label: 'd',
          prompt:
            'Find the bias and variance of $\\hat{A}_{ML}$ and discuss its sensitivity to $\\sigma_w^2$ and $\\sigma_v^2$.',
          steps: [
            {
              title: 'Average N clean copies',
              body: 'Each term $\\frac{x_1(n) - x_2(n)}{2} \\sim N(A, \\sigma_v^2/2)$, and the $N$ terms are uncorrelated.',
              latex:
                'E\\{\\hat{A}_{ML}\\} = A, \\qquad \\operatorname{Var}\\{\\hat{A}_{ML}\\} = \\frac{\\sigma_v^2}{2N}',
            },
            {
              title: 'Read the sensitivities',
              body: 'Neither the estimate nor its variance depends on $\\sigma_w^2$ at all — the design bought total immunity to the ambient interference. The thermal noise $\\sigma_v^2$ remains, halved by the two wires and divided by $N$ by the averaging.',
            },
          ],
          answer: {
            sentence:
              'Unbiased, with variance $\\sigma_v^2 / 2N$ — the interference power does not appear anywhere in the answer.',
            latex:
              'E\\{\\hat{A}_{ML}\\} = A, \\qquad \\operatorname{Var} = \\frac{\\sigma_v^2}{2N}',
          },
        },
        {
          label: 'e',
          prompt: 'Is $\\hat{A}_{ML}$ consistent? Is it efficient?',
          steps: [
            {
              title: 'Check both certificates',
              body: 'Consistent: unbiased with variance $\\to 0$ as $N \\to \\infty$. Efficient: rewrite the score as $N\\mathbf{p}^T\\mathbf{C}_x^{-1}\\mathbf{p} \\cdot (\\hat{A}_{ML} - A)$ — the factorized form that certifies the estimator meets the CRB with equality.',
              latex:
                '\\frac{\\partial \\ln f}{\\partial A} = N\\,\\mathbf{p}^T\\mathbf{C}_x^{-1}\\mathbf{p}\\left(\\hat{A}_{ML} - A\\right) \\;\\Longrightarrow\\; \\text{efficient}',
            },
          ],
          answer: {
            sentence:
              'Both: the score factorization is the one-line proof of efficiency, and the vanishing variance gives consistency.',
          },
        },
        {
          label: 'f',
          prompt:
            '(Extra) What changes in parts (c) and (d) if the sign of $A$ is NOT inverted on the second wire?',
          steps: [
            {
              title: 'Re-run the simplification with p = [1, 1]ᵀ',
              body: 'The general expressions hold, but now $\\mathbf{p}$ is parallel to $\\mathbf{q}$ instead of orthogonal: $\\mathbf{p}^T\\mathbf{C}_x^{-1} = \\frac{1}{\\sigma_v^2 + 2\\sigma_w^2}[1, 1]$, and the estimator becomes the average of the wire sum.',
              latex:
                '\\hat{A}_{ML} = \\frac{1}{N}\\sum_{n}\\frac{x_1(n) + x_2(n)}{2}, \\qquad \\frac{x_1 + x_2}{2} = A + w(n) + \\frac{v_1 + v_2}{2}',
              note: 'The printed solution writes $(v_1 - v_2)/2$, a slip carried over from part (c). With $x_2 = A + w + v_2$ the half-sum has $+$. The variance is the same either way.',
            },
            {
              title: 'Price the lost orthogonality',
              body: 'The sum no longer cancels $w(n)$: the interference now rides straight into the estimate, and the variance inherits its full power.',
              latex:
                '\\operatorname{Var}\\{\\hat{A}_{ML}\\} = \\frac{2\\sigma_w^2 + \\sigma_v^2}{2N}',
            },
          ],
          answer: {
            sentence:
              'Still ML, still efficient for its model — but the variance jumps from $\\sigma_v^2/2N$ to $(2\\sigma_w^2 + \\sigma_v^2)/2N$. The sign flip was the entire design: it put the signal orthogonal to the interference.',
            latex:
              '\\operatorname{Var} = \\frac{2\\sigma_w^2 + \\sigma_v^2}{2N} \\;\\text{ (vs. } \\tfrac{\\sigma_v^2}{2N} \\text{ with the flip)}',
          },
        },
      ],
    },
  ],
}
