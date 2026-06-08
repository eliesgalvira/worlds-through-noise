import type { LessonRouteRecord } from '@/domain/types.ts'

export const lessonRouteRecords: ReadonlyArray<LessonRouteRecord> = [
  {
    route: 'detection',
    title: 'Detection',
    thesis:
      'Detection is what you do when reality is hidden but consequences force a decision.',
    summary:
      'A detector chooses among hidden worlds. The lesson is not that one threshold is correct, but that each threshold makes a promise about which errors you are willing to control.',
    modules: [
      {
        id: 'D0',
        title: 'The Decision Problem Before the Math',
        question:
          'A scanner has one corrupted trace. What is it allowed to conclude?',
        body: [
          'Begin with the pressure, not the notation. A Doppler probe hears a noisy echo. The clinic must decide whether blood cells are moving. Waiting for certainty is not an option, because the output is a medical action.',
          'H0 and H1 are names for competing hidden worlds. H0 might mean static cells, no target, healthy baseline, or a stored bit equal to 0. H1 might mean moving cells, signal present, anemia, or a stored bit equal to 1.',
          'The observation x is only a trace left by the hidden world after the sensor, channel, or biological mechanism has corrupted it. A detector is a rule that looks at x and chooses a world.',
          'The hard part is that one trace can be plausible under both worlds. Detection theory exists because the rule must make decisions while owning false alarms and misses.',
        ],
        concepts: ['H0/H1', 'observation', 'decision rule'],
        interactive: 'likelihood',
        prediction: {
          question:
            'Why can the same observation be compatible with both worlds?',
          answer:
            'Noise gives each hidden world a spread of possible observations. Where those spreads overlap, one trace can be plausible under both worlds.',
        },
        formulaIds: ['likelihood-ratio'],
        transferCheck:
          'In a blood-flow detector, write H0 and H1 as clinical statements before choosing any threshold.',
      },
      {
        id: 'D1',
        title: 'Noise Creates Overlap',
        question: 'Why do even good detectors make mistakes?',
        body: [
          'Imagine each hidden world as a generator of possible observations. If H0 and H1 produced two non-overlapping sets of traces, detection would be bookkeeping. In the real course problems, noise smears both sets until they overlap.',
          'The overlap is the region where the same value of x would not be shocking under either world. That region is where false alarms and misses are born.',
          'Mean separation moves the worlds apart. Noise sigma widens them. Sample count N can tighten the distribution of an averaged statistic, so repeated weak evidence becomes stronger evidence.',
          'This is why detection is not a search for certainty. It is the design of a rule whose mistakes are predictable before deployment.',
        ],
        concepts: ['Gaussian overlap', 'noise', 'sample count'],
        interactive: 'likelihood',
        prediction: {
          question:
            'If the distributions separate, what happens to false alarms and misses?',
          answer:
            'For the same threshold, both kinds of mistakes can shrink because less probability mass sits in the overlap region.',
        },
        formulaIds: ['false-alarm-probability', 'detection-probability'],
        transferCheck:
          'If a sensor becomes noisier, predict whether an ROC curve moves toward or away from the diagonal.',
      },
      {
        id: 'D2',
        title: 'Evidence Is Likelihood Ratio',
        question:
          'When one observation fits both worlds, how do we compare them?',
        body: [
          'A high density under H1 alone is not evidence unless you ask what H0 would have expected at the same observation. Evidence is comparative.',
          'The likelihood ratio asks one Feynman-style question: if H1 were true, how ordinary would this trace be, compared with how ordinary it would be under H0?',
          'When the ratio is bigger than 1, the trace fits H1 better than H0. When it is smaller than 1, it fits H0 better. The log version is the same evidence on an additive scale, which is why repeated samples can accumulate evidence cleanly.',
          'This is the compression step behind many exam solutions: a full vector of readings becomes one statistic because that statistic preserves the comparison the decision actually needs.',
        ],
        concepts: ['likelihood ratio', 'log evidence', 'statistic'],
        interactive: 'likelihood',
        prediction: {
          question:
            'Where should the evidence meter point if x sits closer to the H1 curve peak?',
          answer:
            'It should favor H1, but the strength depends on the density values, not just the nearest mean.',
        },
        formulaIds: ['likelihood-ratio', 'log-likelihood-ratio'],
        transferCheck:
          'For packet delays, explain why total delay can replace the whole data vector as evidence.',
      },
      {
        id: 'D3',
        title: 'Thresholds Are Promises About Mistakes',
        question: 'What promise does a threshold make?',
        body: [
          'After evidence is compressed into a statistic, the threshold turns evidence into action. It says: above this line, act as if H1 is true.',
          'The line does not reveal the hidden world. It chooses which mistake you are more willing to suffer. Move it right and H0 is protected from false alarms, but more real H1 cases are missed. Move it left and H1 is caught more often, but H0 is accused more often.',
          'For ferritin screening, this is not abstract. A false alarm can worry a healthy person and consume clinical resources. A miss can leave an anemic person untreated. The threshold is a policy encoded as math.',
        ],
        concepts: ['threshold', 'false alarm', 'miss'],
        interactive: 'threshold',
        prediction: {
          question:
            'If you demand stronger evidence for H1, which error becomes rarer?',
          answer:
            'False alarms become rarer because fewer H0 observations cross the threshold. Misses become more common.',
        },
        formulaIds: ['false-alarm-probability', 'detection-probability'],
        transferCheck:
          'For an anemia screen, explain why moving a threshold is also a policy choice.',
      },
      {
        id: 'D4',
        title: 'Neyman-Pearson',
        question:
          'How do you build the strongest detector under a public false-alarm promise?',
        body: [
          'Neyman-Pearson begins with a constraint someone can audit: under H0, the detector may call H1 only alpha of the time. That alpha is the false-alarm budget.',
          'Once the budget is fixed, the detector should spend it on the observations that are most characteristic of H1. Calling H1 on weak evidence wastes budget; calling H1 on strong likelihood-ratio evidence buys more detection probability.',
          'This is why the Neyman-Pearson result feels inevitable after the lab: sort observations by evidence for H1 over H0, then include the strongest ones until the H0 budget is spent.',
        ],
        concepts: ['Neyman-Pearson', 'alpha', 'most powerful test'],
        interactive: 'threshold',
        prediction: {
          question:
            'If alpha is tightened from 10 percent to 2 percent, what should happen to detection probability?',
          answer:
            'Detection probability usually falls because the detector is allowed to call H1 less often under H0.',
        },
        formulaIds: ['neyman-pearson-decision', 'false-alarm-probability'],
        transferCheck:
          'State which error is constrained and which error is optimized in a traffic classifier.',
      },
      {
        id: 'D5',
        title: 'MAP and Bayes',
        question: 'How do priors and mistake costs move the decision boundary?',
        body: [
          'Neyman-Pearson controls one error rate. MAP asks a different question: after seeing the trace, which hidden world is more probable?',
          'That means the prior matters. If H1 was rare before the observation, the same sensor evidence may not be enough. If H1 was common, the boundary can move the other way.',
          'Bayes risk adds the cost of being wrong. A missed diagnosis and a false alarm do not necessarily have the same consequence, so the threshold should move when their costs change.',
          'The hard-disk repeated-bit problem is the clean version: count the ones, compare to a threshold, and watch the prior shift what would otherwise be majority vote.',
        ],
        concepts: ['MAP', 'Bayes risk', 'prior', 'cost'],
        interactive: 'threshold',
        prediction: {
          question:
            'If missing H1 becomes very costly, should the threshold require more or less evidence for H1?',
          answer:
            'Less evidence. A high miss cost makes the detector more willing to call H1.',
        },
        formulaIds: ['map-binary-decision'],
        transferCheck:
          'Explain the difference between NP, MAP, and Bayes risk in one sentence each.',
      },
      {
        id: 'D6',
        title: 'Signal Detection as Projection',
        question:
          'How does a detector recognize which rhythm is hidden inside noise?',
        body: [
          'Some detection problems are not about a scalar measurement. The observation is a whole waveform. The hidden worlds are two possible templates buried in noise.',
          'In Gaussian noise, the useful statistic is often a projection: ask how much the received trace points in the direction of one template rather than another.',
          'Doppler ultrasound is the flagship example. Static blood cells return the emitted rhythm. Moving cells compress or stretch the returning rhythm, so the peaks arrive with a shifted frequency. The detector listens for which template the echo sounds like.',
          'Matched filtering is not a mysterious box here. It is a disciplined way to ask: how much of this noisy trace lies along the signal shape I would expect under each world?',
        ],
        concepts: ['matched filtering', 'projection', 'Doppler'],
        interactive: 'doppler',
        prediction: {
          question:
            'If the moving-cell frequency separates from the static frequency, what happens to the two correlation meters?',
          answer:
            'The H1 meter separates from the H0 meter more clearly, making the decision less ambiguous.',
        },
        formulaIds: ['log-likelihood-ratio'],
        transferCheck:
          'Describe matched filtering without using the word filter.',
      },
      {
        id: 'D7',
        title: 'ROC Curves',
        question:
          'How can one curve describe every caution level of a detector?',
        body: [
          'ROC stands for receiver operating characteristic, but the name is less important than the picture. It is the detector personality you get when you try every threshold.',
          'Pick one threshold and you get one operating point: a false-alarm probability on the horizontal axis and a detection probability on the vertical axis. Sweep the threshold from permissive to strict and those points trace a curve.',
          'A permissive detector calls H1 often, so both false alarms and detections are high. A strict detector calls H1 rarely, so both are low. A good sensor bends the curve upward, meaning it can get high detection without paying much false alarm.',
          'This belongs after thresholds because ROC removes the policy choice for a moment. It lets you compare detectors before deciding which threshold a clinic, network operator, or storage system should actually use.',
        ],
        concepts: ['ROC', 'operating point', 'threshold sweep'],
        interactive: 'roc',
        prediction: {
          question:
            'If the threshold becomes very permissive, where does the ROC point move?',
          answer:
            'It moves toward high false alarm and high detection because almost everything is called H1.',
        },
        formulaIds: ['roc-point'],
        transferCheck:
          'Use an ROC point to compare two detectors without choosing a final operating threshold.',
      },
      {
        id: 'D8',
        title: 'Geometry of Detection',
        question: 'When noise is colored, which direction is far?',
        body: [
          'In two dimensions, distance is not only about centimeters on the page. It is about how surprising a displacement is under the noise.',
          'If noise is stretched horizontally, then a horizontal move is less impressive than a vertical move of the same Euclidean length. The sensor is already used to horizontal wobble.',
          'Whitening rescales the space so ordinary noise becomes round. Mahalanobis distance is Euclidean distance after that rescaling, measured in units of noise.',
          'Codeword design uses this idea directly: place alternatives far apart in the quiet directions, because quiet directions make deviations more convincing.',
        ],
        concepts: ['Mahalanobis distance', 'whitening', 'colored noise'],
        interactive: 'mahalanobis',
        prediction: {
          question:
            'If noise is stretched horizontally, which vertical or horizontal displacement is more convincing?',
          answer:
            'A vertical displacement is more convincing because it moves against the quieter direction.',
        },
        formulaIds: ['mahalanobis-distance'],
        transferCheck:
          'For codeword design, identify the covariance eigenvector that gives the best separation.',
      },
    ],
    finalChallenge: {
      title: 'Detection Challenge',
      prompt:
        'A ferritin screen observes three noisy measurements from one person. Decide which hidden worlds are competing, which statistic should summarize the data, and how the threshold should move when noise, N, prior probability, or false-alarm budget changes.',
      checks: [
        'Name H0 and H1 before naming the statistic.',
        'Choose the sufficient statistic and threshold direction.',
        'Predict the effect of larger N, larger sigma, stronger prior, and stricter alpha.',
      ],
    },
  },
  {
    route: 'estimation',
    title: 'Estimation',
    thesis:
      'Estimation is what you do when reality is not one of two worlds, but a hidden number.',
    summary:
      'An estimator is a machine: observations go in, one value comes out. The lesson is to predict how bias, variance, priors, covariance, and sample count change that output.',
    modules: [
      {
        id: 'E0',
        title: 'The Unknown Dial',
        question: 'What hidden dial could have produced these samples?',
        body: [
          'Estimation begins when reality is not one of two boxes. It is a hidden value that changes how the data is generated.',
          'In the course problems, that value might be the scale of TCP/IP packet delays, the true humidity in a greenhouse, a radar amplitude, or a weekly accident rate.',
          'The learner never sees the dial directly. They see samples. An estimator is a rule that turns those samples into theta-hat, a guess about the hidden value.',
          'The first skill is identification: before calculating, say what theta is and what observation model connects theta to the data.',
        ],
        concepts: ['parameter', 'estimator', 'sample'],
        interactive: 'estimator',
        prediction: {
          question:
            'If you see only two noisy samples, should theta-hat be trusted as much as with fifty samples?',
          answer:
            'No. Small samples can land far from the hidden value; repeated estimates form a wide cloud.',
        },
        formulaIds: ['ml-estimator'],
        transferCheck:
          'For TCP/IP latency, identify theta before writing the likelihood.',
      },
      {
        id: 'E1',
        title: 'Estimator as a Machine',
        question: 'What properties describe a machine that outputs theta-hat?',
        body: [
          'A single estimate can look lucky or unlucky. To understand an estimator, imagine repeating the whole experiment many times with the same hidden theta.',
          'The outputs form a cloud. The cloud center tells you bias: does the machine miss in the same direction on average? The cloud spread tells you variance: does the machine wobble from run to run?',
          'Mean squared error combines both, because the user usually cares how far the output lands from the truth, not whether the error came from bias or variance.',
          'Consistency is the long-run behavior you want to feel: as N grows, the cloud should tighten around the true dial.',
        ],
        concepts: ['bias', 'variance', 'MSE', 'consistency'],
        interactive: 'estimator',
        prediction: {
          question:
            'What should happen to the estimate cloud as sample count grows?',
          answer:
            'The cloud should tighten around the hidden value when the estimator is consistent.',
        },
        formulaIds: ['bias', 'variance', 'mse'],
        transferCheck:
          'Explain why one estimate cannot prove an estimator is unbiased.',
      },
      {
        id: 'E2',
        title: 'Why Weighted Averaging Exists',
        question: 'Why should better sensors vote more strongly?',
        body: [
          'The greenhouse problem is a voting problem disguised as algebra. Several sensors report humidity, but some sensors are precise and others are noisy.',
          'A simple average gives each sensor one vote. That is only defensible when the sensors have the same variance.',
          'Weighted maximum likelihood gives each sensor a vote proportional to its precision, which is inverse variance. A narrow bell pulls hard. A wide bell still speaks, but softly.',
          'This is a major estimation habit: do not average numbers only because they are numbers. Average according to the uncertainty model that produced them.',
        ],
        concepts: ['weighted ML', 'sensor variance', 'precision'],
        interactive: 'estimator',
        prediction: {
          question:
            'If one humidity sensor is much noisier than the others, should it move the estimate much?',
          answer:
            'No. Its wide uncertainty gives it a small inverse-variance weight.',
        },
        formulaIds: ['weighted-gaussian-mean'],
        transferCheck:
          'Describe the greenhouse prior as one extra soft sensor.',
      },
      {
        id: 'E3',
        title: 'Likelihood Surface',
        question:
          'Which theta makes the observed packet delays least surprising?',
        body: [
          'The TCP/IP latency example is a strong place to learn likelihood because the hidden parameter has a physical feel: theta controls the scale of packet delays.',
          'Once packets have been observed, the data is fixed. Now possible theta values compete to explain those same delays.',
          'A likelihood curve is not the probability distribution of theta. It is a score assigned to each theta after the observations have already happened.',
          'For gamma packet delays, larger theta makes long delays less surprising. The likelihood peak moves toward the scale where the observed queue looks ordinary rather than exceptional.',
        ],
        concepts: ['likelihood surface', 'gamma model', 'packet delay'],
        interactive: 'packet',
        prediction: {
          question:
            'If observed packet delays are large, where should the likelihood peak move?',
          answer:
            'Toward a larger theta, because a wider delay distribution makes large delays less surprising.',
        },
        formulaIds: ['gamma-ml-scale'],
        transferCheck:
          'Explain why theta is searched over while packet delays are fixed.',
      },
      {
        id: 'E4',
        title: 'Maximum Likelihood',
        question: 'What does ML optimize?',
        body: [
          'Maximum likelihood is the rule that chooses the hidden value that makes the observed data least surprising under the model.',
          'It does not say the chosen theta was probable before observing data. It only asks which theta gives the data the highest likelihood.',
          'That distinction matters. ML is data-only. MAP will later add prior belief.',
          'For gamma packet delay with known shape k, the ML scale estimate becomes total delay divided by N k. The visual reason is simple: the hidden scale should match the average amount of delay the packets actually showed.',
        ],
        concepts: ['ML', 'arg max', 'data only'],
        interactive: 'packet',
        prediction: {
          question:
            'If you triple every observed delay, should the ML scale estimate grow or shrink?',
          answer:
            'It should grow because the sample mean grows and the gamma scale estimate follows it.',
        },
        formulaIds: ['ml-estimator', 'gamma-ml-scale'],
        transferCheck:
          'For Poisson accidents, compute the ML rate from total weekly counts.',
      },
      {
        id: 'E5',
        title: 'Cramer-Rao Bound',
        question: 'What is the floor under unbiased estimator variance?',
        body: [
          'The Cramer-Rao bound is often taught as calculus, but its role is simpler: it is an information floor.',
          'If an estimator is unbiased, the model itself limits how tightly repeated estimates can cluster. Some noise mechanisms reveal theta clearly; others hide it.',
          'More independent samples add information and lower the floor. More noise raises the floor. An efficient estimator reaches the floor for that model.',
          'The bound is not an estimator. It is the standard you use to ask whether an estimator is wasting information.',
        ],
        concepts: ['CRB', 'information', 'variance floor'],
        interactive: 'bias-variance',
        prediction: {
          question: 'If N doubles, does the variance floor go up or down?',
          answer: 'It goes down because independent samples add information.',
        },
        formulaIds: ['cramer-rao-bound', 'variance'],
        transferCheck:
          'Explain why reaching the CRB is a property of an estimator-model pair.',
      },
      {
        id: 'E6',
        title: 'MSE and Productive Bias',
        question: 'Can a biased estimator reduce expected squared error?',
        body: [
          'Unbiased is not the same word as best. It means the estimator is centered correctly over repeated experiments, not that its typical squared error is smallest.',
          'Mean squared error cares about bias squared plus variance. A small intentional bias can be worth it if it removes a lot of wobble.',
          'Shrinkage makes the trade visible. Pull every estimate toward a stable center and the cloud narrows, but its center moves away from the truth.',
          'This prepares the student for MAP: a prior can behave like useful shrinkage when data is scarce, then fade as data becomes strong.',
        ],
        concepts: ['MSE', 'bias-variance tradeoff', 'shrinkage'],
        interactive: 'bias-variance',
        prediction: {
          question:
            'As shrinkage increases, which term rises and which term can fall?',
          answer:
            'Bias rises because the estimator is pulled away from the truth; variance can fall because outputs wobble less.',
        },
        formulaIds: ['mse', 'bias', 'variance'],
        transferCheck:
          'Give one situation where a biased estimator is worth considering.',
      },
      {
        id: 'E7',
        title: 'MAP',
        question: 'What changes when the estimator uses prior belief?',
        body: [
          'MAP changes the question from data-only to data plus prior belief. It asks where the posterior is largest.',
          'The likelihood says which theta values explain the observations. The prior says which theta values were plausible before the observations. The posterior combines them.',
          'With little data, the prior can visibly pull the estimate. With lots of data, the likelihood usually becomes sharp enough to dominate.',
          'The greenhouse and Poisson accident-rate examples show the same idea in different clothing: prior knowledge behaves like a soft measurement whose influence weakens as N grows.',
        ],
        concepts: ['MAP', 'prior', 'posterior'],
        interactive: 'prior-posterior',
        prediction: {
          question:
            'If the prior is weak and N is large, should MAP look close to ML?',
          answer:
            'Yes. The likelihood becomes sharp and overwhelms the weak prior.',
        },
        formulaIds: ['map-posterior'],
        transferCheck:
          'Compare the greenhouse MAP estimator with the Poisson accident-rate MAP estimator.',
      },
      {
        id: 'E8',
        title: 'Estimation in Images',
        question:
          'How does estimation become detection in a surveillance pixel?',
        body: [
          'A surveillance camera does not begin by detecting intruders. First it learns what the empty scene usually looks like.',
          'For one pixel, training frames estimate the RGB background mean and covariance. The covariance matters because color channels can move together under lighting and sensor noise.',
          'Later, a new pixel is not compared with the mean by ordinary distance alone. It is compared by Mahalanobis distance: how unusual is this color difference in the learned noise shape?',
          'This is the bridge between subjects. Estimation learns the model. Detection uses that model to flag deviations.',
        ],
        concepts: ['background learning', 'RGB covariance', 'Mahalanobis'],
        interactive: 'pixel-background',
        prediction: {
          question:
            'If color channels are correlated, why is a simple RGB distance not enough?',
          answer:
            'Because some color deviations are normal together. Mahalanobis distance accounts for the covariance shape.',
        },
        formulaIds: ['mahalanobis-distance'],
        transferCheck:
          'Name the estimated quantity and the later detection statistic.',
      },
      {
        id: 'E9',
        title: 'Vector Estimation as Projection',
        question: 'How does colored noise change a projection estimator?',
        body: [
          'The radar amplitude problem is estimation in vector form. The pulse shape is known; the unknown is the amplitude multiplying that shape.',
          'In white noise, correlation with the known pulse is the natural projection: how much of the received vector lies along the pulse?',
          'Colored noise changes the geometry. Some directions wobble more than others, so raw correlation can trust the wrong parts of the vector.',
          'The covariance-aware estimator first respects the noise covariance, then projects. This is the same geometric lesson as Mahalanobis distance, now used to estimate a number instead of choose a world.',
        ],
        concepts: ['projection', 'colored noise', 'efficient estimator'],
        interactive: 'mahalanobis',
        prediction: {
          question:
            'If noise is strong along the pulse direction, should the estimator trust raw correlation?',
          answer:
            'No. It should discount noisy directions through the covariance inverse.',
        },
        formulaIds: ['weighted-gaussian-mean', 'cramer-rao-bound'],
        transferCheck:
          'Write the amplitude estimator as a covariance-aware projection.',
      },
    ],
    finalChallenge: {
      title: 'Estimation Challenge',
      prompt:
        'A greenhouse sensor array reports noisy humidity measurements. Identify theta, choose ML or MAP, explain bias and variance, and predict what happens as N grows or the prior weakens.',
      checks: [
        'State the hidden parameter.',
        'Choose the estimator and explain its inputs.',
        'Predict bias, variance, MSE, and large-N behavior.',
      ],
    },
  },
  {
    route: 'filtering',
    title: 'Filtering',
    thesis:
      'Filtering will combine estimation with time evolution and prediction-correction loops.',
    summary:
      'This route is reserved. Filtering asks how a hidden state evolves through time while noisy observations arrive one frame, pulse, or packet at a time.',
    modules: [],
    finalChallenge: {
      title: 'Filtering Challenge',
      prompt: 'Reserved for the filtering route.',
      checks: [],
    },
  },
]
