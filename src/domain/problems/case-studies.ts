import type { CaseStudyRecord } from '@/domain/types.ts'

export const caseStudyRecords: ReadonlyArray<CaseStudyRecord> = [
  {
    id: 'doppler-ultrasound-blood-flow',
    title: 'Doppler Ultrasound Blood-Flow Detection',
    route: 'detection',
    concepts: [
      'Neyman-Pearson',
      'deterministic signal detection',
      'complex Gaussian noise',
      'matched filtering',
      'Doppler shift',
    ],
    story:
      'Medical Doppler ultrasound is used to evaluate vascular pathology. The task is to decide whether red blood cells are moving, H1, or not moving, H0.',
    mathematicalModel: [
      'Received samples: x(n)=B exp(j 2 pi f_i n)+w(n), n=0,...,N-1.',
      'Under H0, f_i=f0. Under H1, f_i=f1.',
      'w(n) is circular complex white Gaussian noise CN(0, sigma_w^2).',
      'Known parameters: B, f0, f1, sigma_w^2, N.',
      'Steering vector: s(f)=[1, exp(j2 pi f), ..., exp(j2 pi (N-1)f)]^T.',
      'Mean vectors: mu0=B s(f0), mu1=B s(f1).',
      'For equal covariance Gaussian hypotheses, the log likelihood ratio is affine in x.',
      'A useful visual statistic is score=Re((mu1-mu0)^H x) plus a constant threshold term.',
    ],
    tasks: [
      'Name H0 and H1 in clinical language.',
      'Choose a projection statistic that compares the two templates.',
      'Explain how N and sigma_w change the reliability of the decision.',
    ],
    solutionSketch: [
      'H0 is the static-cell rhythm and H1 is the shifted moving-cell rhythm.',
      'Project the observation onto the difference between the two expected returns.',
      'More samples make the projection more stable; larger noise spreads both score distributions.',
    ],
    visualIdea:
      'Emit wave crests from a probe. Static cells return the same rhythm. Moving cells compress or stretch the return. Show two correlation meters: sounds like f0 and sounds like f1.',
    ranking: {
      exemplifiesSubject: 5,
      visualPotential: 5,
      practicalRealLife: 5,
    },
  },
  {
    id: 'tcp-ip-latency-estimation',
    title: 'TCP/IP Latency Estimation',
    route: 'estimation',
    concepts: [
      'ML',
      'gamma distribution',
      'efficiency',
      'consistency',
      'nonlinear transform bias',
    ],
    story:
      'Network latency of TCP/IP packets is modeled statistically. The hidden parameter theta controls the scale of packet delays.',
    mathematicalModel: [
      'x_i are iid gamma with known k and unknown theta.',
      'f(x;k,theta)=x^(k-1) exp(-x/theta)/(theta^k Gamma(k)), x>0.',
      'E[x]=k theta and Var[x]=k theta^2.',
      'Observed data are x1,...,xN.',
      'theta_hat_ML=(sum_i x_i)/(N k).',
      'Bias(theta_hat_ML)=0 and Var(theta_hat_ML)=theta^2/(N k).',
      'The ML estimate of mean delay is the sample mean.',
      'The ML estimate of delay variance, k theta_hat_ML^2, is biased for finite N.',
    ],
    tasks: [
      'Identify the hidden parameter.',
      'Compute the ML scale estimate from total delay.',
      'Explain why the transformed variance estimate is biased.',
    ],
    solutionSketch: [
      'The hidden parameter is theta, the gamma scale.',
      'The likelihood peaks at total delay divided by N k.',
      'Squaring an unbiased estimate adds variance, so the nonlinear transform is biased.',
    ],
    visualIdea:
      'Packets move through a queue or tube. Changing theta widens the delay distribution. The likelihood curve peaks where observed packet delays are least surprising.',
    ranking: {
      exemplifiesSubject: 5,
      visualPotential: 4,
      practicalRealLife: 5,
    },
  },
  {
    id: 'streaming-video-control-traffic',
    title: 'Streaming-Video vs Control-Packet Traffic Detection',
    route: 'detection',
    concepts: [
      'Neyman-Pearson',
      'gamma likelihood ratio',
      'sufficient statistic',
      'packet traffic classification',
    ],
    story:
      'TCP/IP packet delay is larger for streaming video than for control-only traffic. Decide whether observed packets correspond to video streaming, H1, or control traffic, H0.',
    mathematicalModel: [
      'Each packet delay has density f(x;theta)=x exp(-x/theta)/theta^2, x>0.',
      'This is gamma with shape 2 and scale theta.',
      'H0: theta=theta0 for control packets. H1: theta=theta1 for streaming video.',
      'theta0 < theta1 and x1,...,xN are iid.',
      'The sufficient statistic is z=sum_i x_i.',
      'log f(x|H1)/f(x|H0)=z(1/theta0-1/theta1)+2N log(theta0/theta1).',
      'Since theta1>theta0, decide H1 for large z.',
    ],
    tasks: [
      'Find the sufficient statistic.',
      'Describe the threshold direction.',
      'Predict what happens when N increases.',
    ],
    solutionSketch: [
      'The total delay z carries the evidence.',
      'Large z favors the higher-scale video hypothesis.',
      'More packets make the total-delay distributions separate more clearly.',
    ],
    visualIdea:
      'Two network modes. Control traffic has a short queue; video traffic has a heavier queue. Put a threshold over total delay z.',
    ranking: {
      exemplifiesSubject: 4,
      visualPotential: 4,
      practicalRealLife: 5,
    },
  },
  {
    id: 'video-surveillance-background-learning',
    title: 'Video Surveillance Background Learning',
    route: 'estimation',
    concepts: [
      'Gaussian RGB model',
      'ML estimation',
      'covariance',
      'Mahalanobis distance',
      'estimate-then-detect bridge',
    ],
    story:
      'A static surveillance camera learns the background from training images with no intruder. Later, a pixel that differs too much from the learned background is flagged as intruder.',
    mathematicalModel: [
      'For one pixel, x_c=p_c+w_c.',
      'p_c=[R,G,B]^T is the true background color.',
      'w_c=[w_R,w_G,w_B]^T is Gaussian sensor noise.',
      'Noise has zero mean, equal component variance sigma_w^2, and cross-correlation rho sigma_w^2.',
      'Training images provide samples x_c^(1),...,x_c^(M).',
      'Estimate p_hat as the sample mean and C_hat as the sample covariance or known covariance model.',
      'For a new pixel x, D^2=(x-p_hat)^T C_hat^-1 (x-p_hat).',
      'Flag intruder if D^2>gamma.',
    ],
    tasks: [
      'Identify the parameter learned during training.',
      'Explain why covariance matters for RGB deviations.',
      'Choose a detection statistic for a new pixel.',
    ],
    solutionSketch: [
      'The training phase estimates the background RGB mean and covariance.',
      'Correlated color noise changes which deviations are surprising.',
      'Mahalanobis distance turns the learned model into an intruder detector.',
    ],
    visualIdea:
      'Left: training frames without intruder. Middle: learned RGB cloud. Right: new frame with pixels colored by Mahalanobis distance.',
    ranking: {
      exemplifiesSubject: 5,
      visualPotential: 5,
      practicalRealLife: 5,
    },
  },
  {
    id: 'hard-disk-repeated-bit-map',
    title: 'Hard-Disk Repeated-Bit MAP Detector',
    route: 'detection',
    concepts: [
      'MAP',
      'priors',
      'binary channel',
      'sufficient statistic',
      'majority vote',
    ],
    story:
      'An old unreliable hard disk flips stored bits independently with probability epsilon < 0.5. To improve reliability, each information bit is stored N times.',
    mathematicalModel: [
      'Stored bit b is in {0,1}. If b=0, x=[0,...,0]^T. If b=1, x=[1,...,1]^T.',
      'Read vector y=[y1,...,yN]^T and Pr(yi != xi)=epsilon.',
      'Pr(b=1)=alpha and Pr(b=0)=1-alpha.',
      'Pr(y|H0)=epsilon^(sum y_i)(1-epsilon)^(N-sum y_i).',
      'Pr(y|H1)=(1-epsilon)^(sum y_i)epsilon^(N-sum y_i).',
      'The log likelihood ratio is (2 sum_i y_i - N) log((1-epsilon)/epsilon).',
      'The MAP threshold is shifted by the prior odds; alpha=0.5 recovers majority vote.',
    ],
    tasks: [
      'Find the sufficient statistic.',
      'Explain when majority vote is optimal.',
      'Predict how the prior shifts the threshold.',
    ],
    solutionSketch: [
      'Only the number of read ones matters.',
      'Majority vote is MAP when the two stored bits are equally likely.',
      'A prior favoring 1 lowers the number of read ones needed to decide H1.',
    ],
    visualIdea:
      'Rows of repeated bits, random flips, a live vote counter, and a prior shifting the threshold.',
    ranking: {
      exemplifiesSubject: 4,
      visualPotential: 4,
      practicalRealLife: 4,
    },
  },
  {
    id: 'ferritin-anemia-detector',
    title: 'Ferritin/Anemia Neyman-Pearson and MAP Detector',
    route: 'detection',
    concepts: [
      'Gaussian detection',
      'NP threshold',
      'MAP threshold',
      'ROC',
      'false-alarm ethics',
    ],
    story:
      'A health campaign wants to detect anemia from ferritin levels. Anemic individuals tend to have lower ferritin.',
    mathematicalModel: [
      'For N daily measurements, x_i|H0 ~ N(m0,sigma^2) for healthy and x_i|H1 ~ N(m1,sigma^2) for anemic.',
      'm0 > m1 and x_i are iid.',
      'The statistic is y=sum_i x_i.',
      'Under H0, y ~ N(N m0, N sigma^2). Under H1, y ~ N(N m1, N sigma^2).',
      'Since anemia means lower ferritin, decide H1 for small y.',
      'The NP threshold for false alarm alpha is gamma_NP=N m0 + sigma sqrt(N) Phi^-1(alpha).',
      'Detection probability is Phi((gamma_NP - N m1)/(sigma sqrt(N))).',
      'The MAP threshold includes the log prior odds.',
    ],
    tasks: [
      'Explain why the decision is a left-tail threshold.',
      'Set a false-alarm budget and predict the detection probability.',
      'Compare NP and MAP for public-health policy.',
    ],
    solutionSketch: [
      'Lower ferritin favors H1, so small sums are evidence of anemia.',
      'Lower alpha moves the threshold left and reduces both false alarms and detection probability.',
      'NP constrains one error; MAP uses priors; Bayes risk would add mistake costs.',
    ],
    visualIdea:
      'Two Gaussian curves, a threshold, red false-positive area, green detection area, and an ROC point. Explain threshold as a public-health policy choice.',
    ranking: {
      exemplifiesSubject: 5,
      visualPotential: 5,
      practicalRealLife: 5,
    },
  },
  {
    id: 'greenhouse-humidity-sensor-fusion',
    title: 'Greenhouse Humidity Sensor Fusion',
    route: 'estimation',
    concepts: ['weighted ML', 'sensor quality', 'MSE', 'MAP shrinkage'],
    story:
      'A greenhouse needs to estimate humidity A using N sensors of different quality.',
    mathematicalModel: [
      'x_i ~ N(A, sigma_i^2), independently.',
      'The simple estimator is A_hat_1=(1/N) sum_i x_i.',
      'The ML estimator is A_hat_ML=[sum_i x_i/sigma_i^2]/[sum_i 1/sigma_i^2].',
      'Let W=sum_i 1/sigma_i^2. Then Var(A_hat_ML)=1/W.',
      'With prior A ~ N(m_A, sigma_A^2), A_hat_MAP=[sum_i x_i/sigma_i^2 + m_A/sigma_A^2]/[W + 1/sigma_A^2].',
      'Equivalently, A_hat_MAP=alpha A_hat_ML+(1-alpha)m_A.',
    ],
    tasks: [
      'Compare the simple average and weighted ML estimator.',
      'Show how sensor variance becomes voting strength.',
      'Explain why a prior acts like a soft extra sensor.',
    ],
    solutionSketch: [
      'Precise sensors have larger inverse-variance weights.',
      'The weighted estimator has lower variance when sensor qualities differ.',
      'MAP blends the data estimate with the prior mean; the blend weakens as data precision grows.',
    ],
    visualIdea:
      'Sensors as votes. Narrow bell sensors pull strongly; wide bell sensors pull weakly. The prior appears as a soft extra sensor.',
    ranking: {
      exemplifiesSubject: 5,
      visualPotential: 4,
      practicalRealLife: 5,
    },
  },
  {
    id: 'codeword-colored-gaussian-noise',
    title: 'Codeword Design in Colored Gaussian Noise',
    route: 'detection',
    concepts: [
      'Neyman-Pearson',
      'colored noise',
      'Mahalanobis distance',
      'whitening',
      'eigenvectors',
    ],
    story:
      'A researcher designs two codewords c0 and c1 for communication through colored Gaussian noise. Robust detection requires them to be far apart in the directions where noise is small.',
    mathematicalModel: [
      'w ~ N(0,C).',
      'H0: x=c0+w. H1: x=c1+w.',
      'c1=c0+a with constraint ||a||_2=1.',
      'The NP statistic is y=a^T C^-1 x.',
      'Variance under both hypotheses is sigma_y^2=a^T C^-1 a.',
      'Mahalanobis distance is d_M^2=(c1-c0)^T C^-1(c1-c0)=a^T C^-1 a.',
      'The optimal design maximizes a^T C^-1 a subject to ||a||=1.',
      'a_opt is the eigenvector of C with smallest eigenvalue, and max d_M^2=1/lambda_min(C).',
    ],
    tasks: [
      'Explain why Euclidean distance is not enough.',
      'Find the quietest noise direction.',
      'Predict how whitening changes the geometry.',
    ],
    solutionSketch: [
      'Colored noise makes some directions less reliable than others.',
      'The smallest covariance eigenvalue marks the direction where noise is smallest.',
      'Whitening turns ellipses into circles and makes Mahalanobis distance visible.',
    ],
    visualIdea:
      'A 2D noise ellipse. Whiten it. Show that the best codeword difference points along the quietest noise direction.',
    ranking: {
      exemplifiesSubject: 5,
      visualPotential: 5,
      practicalRealLife: 4,
    },
  },
  {
    id: 'radar-amplitude-colored-noise',
    title: 'Radar Amplitude Estimation in Colored Noise',
    route: 'estimation',
    concepts: [
      'linear unbiased estimation',
      'ML',
      'CRB',
      'colored noise',
      'projection',
    ],
    story:
      'A radar receives a known transmitted pulse after delay correction. The pulse amplitude A is unknown and the noise is colored.',
    mathematicalModel: [
      'x(n)=A s(n)+w(n), n=0,...,N-1.',
      'Vector form: x=s A+w, with known s.',
      'w has zero mean and known covariance C_w.',
      'If Gaussian, w ~ N(0,C_w).',
      'A linear estimator has A_hat=h^T x and unbiased condition h^T s=1.',
      'The minimum variance linear unbiased estimator is A_hat=(s^T C_w^-1 x)/(s^T C_w^-1 s).',
      'Its variance is 1/(s^T C_w^-1 s).',
      'For Gaussian noise this equals the CRB, so the estimator is efficient.',
    ],
    tasks: [
      'State the unbiasedness condition.',
      'Compare white-noise correlation with covariance-aware correlation.',
      'Relate the estimator variance to the CRB.',
    ],
    solutionSketch: [
      'The projection weights must preserve the known template amplitude.',
      'Colored noise changes the right projection direction through C_w^-1.',
      'For Gaussian noise, the best linear unbiased estimator reaches the CRB.',
    ],
    visualIdea:
      'Known pulse template. In white noise, correlate with the pulse. In colored noise, first respect covariance, then correlate.',
    ranking: {
      exemplifiesSubject: 5,
      visualPotential: 4,
      practicalRealLife: 4,
    },
  },
  {
    id: 'industrial-accident-poisson-estimation',
    title: 'Industrial Accident-Rate Poisson Estimation',
    route: 'estimation',
    concepts: [
      'Poisson ML',
      'efficiency',
      'consistency',
      'parameter transformation',
      'biased nonlinear estimate',
      'MAP with exponential prior',
    ],
    story:
      'A petrochemical plant models the number of people injured per week as Poisson with parameter lambda. Insurance cost depends on the mean and variance, both equal to lambda.',
    mathematicalModel: [
      'k_n ~ Poisson(lambda), n=1,...,N.',
      'Pr(k;lambda)=exp(-lambda) lambda^k/k!.',
      'lambda_hat_ML=(1/N) sum_n k_n.',
      'The estimator is unbiased, efficient, and consistent.',
      'The cost c(lambda)=E[k]^2+Var[k]=lambda^2+lambda.',
      'By invariance, c_hat_ML=lambda_hat_ML^2+lambda_hat_ML.',
      'This is biased for finite N because of the squared term.',
      'With Exponential(scale s) prior, lambda_hat_MAP=sum_n k_n/(N+1/s).',
      'As N grows, MAP approaches ML.',
    ],
    tasks: [
      'Estimate lambda from weekly counts.',
      'Explain why the transformed cost estimate is biased.',
      'Show how an exponential prior pulls small samples toward zero.',
    ],
    solutionSketch: [
      'The ML rate is the average weekly count.',
      'Squaring the sample mean adds variance to the expectation.',
      'MAP shrinks the estimate by Ns/(Ns+1), so the shrinkage fades as N grows.',
    ],
    visualIdea:
      'Weekly accident counts as bars. Lambda is a hidden rate dial. The prior pulls small-sample estimates toward zero; data dominates as N grows.',
    ranking: {
      exemplifiesSubject: 4,
      visualPotential: 4,
      practicalRealLife: 5,
    },
  },
]
