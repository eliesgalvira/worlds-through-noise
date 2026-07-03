# Examples: Making Math Obvious

This is a field guide to mathematical explanations where the hard part is not a
calculation, but finding the representation in which the calculation becomes
natural.

The framing comes from David Bessis's *Mathematica*, especially chapters 1-3,
5-6, and 9-12, plus the 3Blue1Brown transcript corpus downloaded under
`/home/bigweld/Sandbox/3b1b_transcripts`.

The working thesis:

> A "trick" is usually an unseen action that has not been named yet.

The goal of this file is to build a reusable library of those actions. When a
new field feels opaque, search this catalog for a nearby pattern: a way to turn
symbols into objects, equations into actions, calculations into geometry, or
probabilities into areas.

## The Bessis Lens

Use these concepts as tags when studying an explanation.

### Secret Math vs Official Math

Official math is the public transcript: definitions, notation, proof, and
line-by-line verification.

Secret math is the inner experience: mental images, physical sensations,
spatial relations, analogies, and small invisible actions. Official math is
needed because it checks and communicates secret math, but it is not the source
of understanding.

An explanation is good when it proposes a private action the learner can
recreate.

### Unseen Actions

An unseen action is a mental motion that cannot be learned by imitation alone:
pairing two ends of a list, rotating a copy, tracking an invariant, slicing a
surface, changing coordinates, projecting onto a shadow, or asking what remains
fixed.

In a classroom these actions often get hidden behind words like "obvious,"
"clearly," "by symmetry," or "the trick is." This catalog tries to spell them
out.

### The Language Trap

The language trap is the belief that naming a thing is enough to have imagined
it. "The sum from 1 to 100," "matrix multiplication," "conditional
probability," and "Fourier transform" are labels. They are not yet objects in
the mind.

To escape the trap, ask:

- What object does the phrase designate?
- Can I make it large enough to move around in?
- What can I touch, slide, rotate, slice, fold, or project?
- What would a childlike physical version of this be?

### System 3

System 3 is the deliberate dialogue between intuition and logic. Logic checks
the image. Intuition proposes the image. When they disagree, the disagreement is
not failure; it is the entrance to learning.

Use the dissonance:

- If the answer is right but feels arbitrary, an image is missing.
- If the image feels right but the algebra contradicts it, the image needs
  refinement.
- If a proof is correct but ugly, look for the mental operation it is hiding.

### Synesthesia and Scale

Mathematical objects should be allowed to feel like things: heavy, balanced,
slippery, stretched, tense, resonant, compressed, projected, flowing, or
rotating.

Scale matters. Some objects are too small when imagined as marks on paper.
Enlarge them into room-sized or landscape-sized structures. Walk around them.
Let a matrix move the plane. Let a probability be an area. Let an integral be a
surface. Let a vector field be weather.

### No Tricks

When an explanation says "the trick is," translate it as:

> There is a better representation in which this action is natural.

The useful question is not "How do I memorize this move?" but "What would I have
needed to see for this move to be the low-effort path?"

## A Template for Adding Examples

Use this format when adding to the library.

```md
### Example Name

- Source:
- Trap:
- Better object:
- Unseen action:
- Why it becomes obvious:
- Transfer pattern:
- Practice prompt:
```

## Core Archetypes

### 1. Turn Symbols Into Objects

The phrase is only a pointer. Replace it with an object you can inspect.

Examples: Gauss sum as a triangle of blocks, determinant as transformed area,
Bayes as areas in a rectangle.

### 2. Turn Objects Into Actions

Numbers, matrices, functions, and operators are not inert nouns. They do things.

Examples: complex numbers rotate and scale the plane, matrices move space,
exponentials turn addition into multiplication.

### 3. Add a Dimension

Some structures are invisible in the original space. Add a dimension so the
hidden symmetry can appear.

Examples: Gaussian integral, Gaussian convolution, colliding blocks in
configuration space.

### 4. Change Coordinates or Language

The same object can become simple in another coordinate system.

Examples: change of basis, roots of unity filters, odds form of Bayes, Laplace
domain.

### 5. Track What Cannot Change

If the system moves too much, stop watching the motion and watch the invariant.

Examples: windmill problem, conservation laws, Euler characteristic.

### 6. Encode the Choice Space

A hard combinatorial problem can become a simple geometric object if all
possible choices are encoded in the right space.

Examples: Borsuk-Ulam and stolen necklaces, generating functions, Hamming code
syndromes.

### 7. Turn a Formula Into a Detector

A transform is often a test. It asks whether a hidden component is present.

Examples: Fourier transform as winding center-of-mass, Laplace transform as
exponential detector, attention as query-key matching.

### 8. Replace Casework With Addressing

Instead of checking many cases, build a representation where the answer's
location is encoded directly.

Examples: Hamming codes, binary counting on fingers, roots of unity filters.

## The Library

### 1. Gauss / Thurston Sum: 1 + 2 + ... + 100

- Source: Bessis, *Mathematica*, chapter 12; classic Gauss anecdote.
- Trap: Seeing the expression as a long list of additions.
- Better object: A triangular pile of blocks: row 1 has one block, row 2 has two
  blocks, and so on up to row 100.
- Unseen action: Copy the triangle, rotate it, and join it to the original.
- Why it becomes obvious: The two triangles form a `100 x 101` rectangle. Half
  the rectangle is the desired sum, so the answer is `100 * 101 / 2 = 5050`.
- Transfer pattern: When a sum has a smooth ramp, look for the shape whose area
  it approximates or exactly counts.
- Practice prompt: Draw `1 + 2 + ... + n` as a staircase. Then ask what object
  fills the missing half.

This is the model example. The usual school explanation presents the paired
rows as a clever symbolic maneuver. The Bessis version asks what mental image
would make that maneuver unavoidable.

### 2. Average of 1 Through 100

- Source: Bessis, *Mathematica*, chapter 12.
- Trap: Guessing the center as `50` because 50 feels like the middle of the
  written range.
- Better object: A bag with checks from `$1` through `$100`, or 100 people each
  receiving one check.
- Unseen action: Pair the extremes: `1` with `100`, `2` with `99`, and so on.
- Why it becomes obvious: Each pair averages to `50.5`, so the whole collection
  averages to `50.5`.
- Transfer pattern: For a uniform sequence, average by symmetry around the
  midpoint between endpoints.
- Practice prompt: Compare `1..99`, `1..100`, and `0..100`. Watch the center
  shift depending on whether there is a middle item or a middle gap.

This example is useful because the first intuition is close but slightly wrong.
That makes it a System 3 training case: listen to the image, find where it is
off by one half, and update it.

### 3. Ball and Bat

- Source: Bessis, *Mathematica*, chapter 11.
- Trap: Hearing "$1 more" and immediately splitting `$1.10` into `$1 + 10c`.
- Better object: Two price segments, one exactly `$1` longer than the other.
- Unseen action: Remove the `$1` difference first. What remains is two equal
  ball-sized pieces.
- Why it becomes obvious: `$1.10 - $1 = $0.10`, and that remainder is two balls,
  so one ball is `$0.05`.
- Transfer pattern: When quantities differ by a fixed offset, remove the offset
  before dividing.
- Practice prompt: Draw the bat as "ball + $1." Then draw the total as "ball +
  ball + $1."

The lesson is not "distrust intuition." It is "build the intuition that sees
the equal parts."

### 4. Decimal Notation and 1,000,000 - 1

- Source: Bessis, *Mathematica*, chapter 4 and chapter 11.
- Trap: Treating decimal notation as mere writing.
- Better object: A place-value machine with columns that borrow and carry.
- Unseen action: Collapse one unit from the million column into a full cascade
  of `9`s below it.
- Why it becomes obvious: `1,000,000 - 1` becomes `999,999` because a single
  high-place unit can be redistributed into all lower places.
- Transfer pattern: A notation system can be a cognitive prosthetic. Changing
  notation changes what can be imagined.
- Practice prompt: Compare the action in Arabic numerals with Roman numerals.
  Notice that the difficulty is not in subtraction itself but in the available
  mental object.

This is a reminder to respect notation. Some notations are doors into states of
consciousness.

### 5. Straight Line and Circle

- Source: Bessis, *Mathematica*, chapter 3.
- Trap: "A line can intersect a circle in at most two points" sounds like a fact
  to remember.
- Better object: A line sweeping across a circle.
- Unseen action: Move the line continuously and watch contacts appear, merge,
  and disappear.
- Why it becomes obvious: The line can enter the circle and leave it, giving at
  most two boundary crossings. Three crossings would require a new kind of
  motion your image cannot support.
- Transfer pattern: For geometric impossibility, animate the object instead of
  staring at a static diagram.
- Practice prompt: Sweep a line across an ellipse, a square, and a non-convex
  shape. Ask when the "at most two" intuition fails.

This is an example of already-owned intuition. The task is to notice that you
perform a sophisticated proof-like action without naming it.

### 6. Matrices as Moving Space

- Source: 3Blue1Brown, [Linear transformations and matrices](https://www.youtube.com/watch?v=kYB8IZa5AuE).
- Trap: A matrix is a rectangular table of numbers plugged into a formula.
- Better object: A transformation that moves the whole plane while keeping grid
  lines parallel and evenly spaced.
- Unseen action: Track where the basis vectors land, then rebuild every other
  vector as the same linear combination of those new basis vectors.
- Why it becomes obvious: The columns of the matrix are not arbitrary entries;
  they are the landing places of the basis vectors.
- Transfer pattern: When a formula has many coordinates, ask what action on the
  underlying space those coordinates encode.
- Practice prompt: Pick two new basis-vector landing places. Before computing,
  sketch where `(3, 2)` must go.

This is one of the strongest "language trap" antidotes in the corpus. The word
"matrix" stops naming a symbol and starts naming a motion.

### 7. Matrix Multiplication as Composition

- Source: 3Blue1Brown, [Matrix multiplication as composition](https://www.youtube.com/watch?v=XkY2DOUCWMU).
- Trap: Matrix multiplication is a row-column ritual with strange order rules.
- Better object: One movement of space followed by another.
- Unseen action: Apply the right-hand transformation first, then apply the next
  transformation to the already-moved basis vectors.
- Why it becomes obvious: The product matrix records where the basis vectors end
  up after the full sequence.
- Transfer pattern: For algebraic products of operators, read multiplication as
  "do this, then that."
- Practice prompt: Compose a shear and a rotation in both orders. Feel why the
  order matters.

The calculation becomes bookkeeping for a motion you can already imagine.

### 8. Determinant as Area Scaling

- Source: 3Blue1Brown, [The determinant](https://www.youtube.com/watch?v=Ip3X9LOh2dk).
- Trap: The determinant is `ad - bc` or a memorized expansion rule.
- Better object: The unit square being transformed into a parallelogram.
- Unseen action: Watch area stretch, squash, flip orientation, or collapse.
- Why it becomes obvious: A determinant of zero means the plane has been
  squashed into a line. A negative determinant means orientation flipped.
- Transfer pattern: Replace a scalar formula with the geometric quantity it
  measures.
- Practice prompt: Draw a grid. Move the basis vectors. Estimate whether the
  area doubled, halved, flipped, or vanished before computing.

The determinant is not a number attached to a matrix. It is a felt property of
the motion.

### 9. Dot Product and Duality

- Source: 3Blue1Brown, [Dot products and duality](https://www.youtube.com/watch?v=LyGKycYT2v0).
- Trap: Dot product means multiply coordinates and add.
- Better object: A vector as a measuring device, or a projection onto a number
  line.
- Unseen action: Turn a vector into the linear function that scores other
  vectors by their shadow in its direction.
- Why it becomes obvious: The coordinate formula is just how that measuring
  action looks in a chosen basis.
- Transfer pattern: When a vector appears beside a scalar output, ask whether it
  is secretly a linear functional.
- Practice prompt: Pick a direction. Project several vectors onto it. Then
  compute dot products and compare the numbers to the shadows.

This example is valuable because it crosses a boundary: object becomes function.

### 10. Cramer's Rule as Volume Accounting

- Source: 3Blue1Brown, [Cramer's rule, explained geometrically](https://www.youtube.com/watch?v=jBsC34PxzoM).
- Trap: Cramer's rule is a strange determinant formula for solving equations.
- Better object: A coordinate encoded as signed area or volume.
- Unseen action: Track how a transformation scales all relevant areas by the
  same determinant factor.
- Why it becomes obvious: The ratio of two transformed volumes recovers the
  coordinate that was hidden in the system.
- Transfer pattern: If a formula is a quotient of determinants, look for a ratio
  of scaled geometric quantities.
- Practice prompt: In 2D, draw the parallelogram spanned by one basis vector and
  the unknown output. Ask which area contains the unknown coordinate.

The formula stops being magic because the determinant has already been made into
a physical scaling action.

### 11. Change of Basis as Translation Between Languages

- Source: 3Blue1Brown, [Change of basis](https://www.youtube.com/watch?v=P2LTAUO1TdA).
- Trap: `A^-1 M A` looks like arbitrary algebraic wrapping.
- Better object: Two observers using different coordinate languages for the
  same space.
- Unseen action: Translate into the other observer's coordinates, apply the
  transformation there, then translate back.
- Why it becomes obvious: The "sandwich" is just a round trip through another
  language.
- Transfer pattern: When a formula has inverse wrappers, ask whether it means
  "go there, act there, come back."
- Practice prompt: Describe the same point in standard axes and in a skew basis.
  Notice that the point did not move; only the language changed.

This is directly connected to Bessis's warning that names are not objects.
Coordinates are descriptions, not the thing described.

### 12. Fundamental Theorem of Calculus

- Source: 3Blue1Brown, [Integration and the fundamental theorem of calculus](https://www.youtube.com/watch?v=rfG8ce4nNh0).
- Trap: Derivatives and integrals are inverse because a theorem says so.
- Better object: Accumulated area under a graph.
- Unseen action: Nudge the right endpoint and watch the new thin rectangle of
  area appear.
- Why it becomes obvious: The added area is approximately height times width.
  Therefore the rate at which accumulated area changes is the current height.
- Transfer pattern: For a derivative of an accumulated quantity, ask what small
  piece gets added when the input moves.
- Practice prompt: Draw an accumulation graph for velocity, rainfall, or money.
  Nudge time forward and identify the thin added piece.

The proof is a translation of a tactile image: area grows by a sliver.

### 13. Chain Rule and Product Rule

- Source: 3Blue1Brown, [Visualizing the chain rule and product rule](https://www.youtube.com/watch?v=YG15m2VwSjA).
- Trap: Rules like `(fg)' = f'g + fg'` and `(f(g(x)))' = f'(g(x))g'(x)` are
  symbolic patterns.
- Better object: A rectangle whose side lengths change, and a chain of number
  lines where one nudge causes another.
- Unseen action: Track first-order changes and ignore second-order scraps.
- Why it becomes obvious: A changing rectangle gains one strip from the width
  change and one strip from the height change; the tiny corner is negligible.
- Transfer pattern: For derivative rules, ask what tiny physical pieces are
  gained or lost.
- Practice prompt: Draw a rectangle with sides `f` and `g`. Increase both
  slightly. Label the two strips and the tiny corner.

The formula becomes a picture of motion plus a disciplined decision about which
tiny effects matter.

### 14. Taylor Series as Matching Local Behavior

- Source: 3Blue1Brown, [Taylor series](https://www.youtube.com/watch?v=3d6DsjIBzJ4).
- Trap: Taylor series is a factorial-heavy formula.
- Better object: A polynomial built to match a function's value, slope,
  curvature, and higher behaviors at one point.
- Unseen action: Encode each layer of local behavior into a coefficient.
- Why it becomes obvious: The factorials cancel the repeated power-rule factors
  so each derivative contributes exactly what it should.
- Transfer pattern: When a formula contains factorials, look for repeated
  differentiation or repeated counting that needs to be normalized.
- Practice prompt: Build a polynomial that matches `sin(x)` at zero one
  derivative at a time.

The series is not an incantation. It is a machine for preserving a local tactile
profile.

### 15. Roots of Unity Filter for Counting

- Source: 3Blue1Brown, [Olympiad level counting (Generating functions)](https://www.youtube.com/watch?v=bOXCLR3Wric).
- Trap: Count subsets of `{1, ..., 2000}` whose sums are divisible by 5
  directly.
- Better object: A polynomial whose coefficients count subset sums.
- Unseen action: Evaluate the polynomial at the fifth roots of unity so the
  unwanted residue classes cancel by rotation.
- Why it becomes obvious: Rotating through all fifth roots makes nonmultiples of
  5 average to zero, while multiples of 5 survive.
- Transfer pattern: To select every `k`th coefficient, use `k`fold rotational
  symmetry as a sieve.
- Practice prompt: First filter even coefficients using `x = 1` and `x = -1`.
  Then generalize to thirds or fifths on the complex unit circle.

This is a high-value example because complex numbers stop being ornament. They
become the physical action of cancellation by rotation.

### 16. Borsuk-Ulam and Stolen Necklaces

- Source: 3Blue1Brown, [Using topology for discrete problems](https://www.youtube.com/watch?v=yuVqxCSsE7c).
- Trap: Fairly divide a necklace with several jewel types by discrete casework.
- Better object: The space of all cut-and-allocation choices as a sphere.
- Unseen action: Encode each allocation as a point; swapping thieves is moving
  to the antipodal point.
- Why it becomes obvious: Borsuk-Ulam guarantees an antipodal pair with the same
  output, which means a fair split exists.
- Transfer pattern: When choices are too many to list, model the choice space
  itself.
- Practice prompt: For two cuts, represent the three piece lengths by squared
  coordinates on a sphere. Let signs encode ownership.

This is one of the cleanest "add the right world" examples. The problem is not
solved inside the necklace; it is solved in the space of possible ways to cut
the necklace.

### 17. Windmill IMO Problem

- Source: 3Blue1Brown, [The unexpectedly hard windmill question](https://www.youtube.com/watch?v=M64HUIJFTZM).
- Trap: Follow a rotating line through many pivot changes.
- Better object: The count of points on each side of the oriented line.
- Unseen action: Stop tracking the visible motion and track an invariant.
- Why it becomes obvious: The pivot changes, but the side-count structure is
  constrained. The line cannot behave freely.
- Transfer pattern: In dynamic geometry, ask what remains unchanged through the
  motion.
- Practice prompt: Draw a small point set and rotate a line. At each pivot, note
  what changed and what did not.

This is a rock-climbing move: do not climb straight up the moving chaos. Step
sideways onto the invariant.

### 18. Moser's Circle Problem

- Source: 3Blue1Brown, [This pattern breaks, but for a good reason](https://www.youtube.com/watch?v=YtkIWDE36qU).
- Trap: Guess powers of two from the first few region counts.
- Better object: A planar graph whose crossings are vertices.
- Unseen action: Reclassify chord intersections as graph structure, then use
  Euler characteristic.
- Why it becomes obvious: The true formula is `1 + C(n, 2) + C(n, 4)`. The
  early powers of two appear because a partial Pascal row temporarily imitates
  a full one.
- Transfer pattern: When a visual pattern breaks, find the structural count
  that produced the early coincidence.
- Practice prompt: Count vertices, edges, and faces after turning crossings into
  vertices. Do not count regions directly.

The explanation trains suspicion of pattern-matching without cynicism: the false
pattern was not random; it was a shadow of a truer one.

### 19. Colliding Blocks Compute Pi

- Source: 3Blue1Brown, [How colliding blocks act like a beam of light](https://www.youtube.com/watch?v=brU5yLm9DZM) and [Why colliding blocks compute pi](https://www.youtube.com/watch?v=6dTyOl1fmDo).
- Trap: Simulate many elastic collisions one by one.
- Better object: A point moving in configuration space, with walls representing
  collisions.
- Unseen action: Rescale coordinates by square roots of mass, then unfold
  reflections into a straight ray.
- Why it becomes obvious: Collision-counting becomes angle-counting. Pi appears
  because the ray sweeps through angular sectors.
- Transfer pattern: Conservation laws often mean motion is simple in a hidden
  space.
- Practice prompt: For two moving objects, plot their positions as one point in
  a 2D plane. Ask what walls mean.

This is a flagship "change the world" example. The physics is hard in the
original view and nearly visual in the transformed view.

### 20. Convolution as Diagonal Slicing

- Source: 3Blue1Brown, [Convolutions](https://www.youtube.com/watch?v=IaSGqQa5O-M) and [But what is a convolution?](https://www.youtube.com/watch?v=KuXjwB4LzSA).
- Trap: The convolution integral looks like flip, shift, multiply, integrate for
  no reason.
- Better object: A joint distribution over the `xy` plane.
- Unseen action: Fix `x + y = s` and slice the joint surface along a diagonal.
- Why it becomes obvious: Adding random variables means gathering all pairs that
  land on the same sum.
- Transfer pattern: When an expression combines two independent inputs, draw the
  product space and slice by the constraint.
- Practice prompt: Roll two dice. Draw the `6 x 6` grid. Diagonals are sums.
  Then replace dice cells with continuous density.

The continuous formula is just the dice-grid diagonal picture made smooth.

### 21. Gaussian Plus Gaussian

- Source: 3Blue1Brown, [A pretty reason why Gaussian + Gaussian = Gaussian](https://www.youtube.com/watch?v=d_qvLDhkg00).
- Trap: Complete the square inside a convolution integral.
- Better object: A rotationally symmetric bell surface in two dimensions.
- Unseen action: Rotate diagonal slices to axis-parallel slices.
- Why it becomes obvious: Because the surface is rotationally symmetric, every
  slice with the same offset has the same shape after rotation. The result must
  still be Gaussian.
- Transfer pattern: If an integral is ugly but the object is symmetric, rotate
  the object rather than grind the formula.
- Practice prompt: Draw a circular hill. Compare vertical slices at different
  diagonal angles.

The algebraic miracle is symmetry wearing a mask.

### 22. Why Pi Is in the Normal Distribution

- Source: 3Blue1Brown, [Why pi is in the normal distribution](https://www.youtube.com/watch?v=cy8r7WSuT1I).
- Trap: Evaluate `int e^(-x^2) dx` as a mysterious one-dimensional integral.
- Better object: Square the integral to create a two-dimensional surface.
- Unseen action: Read the same volume by rectangular separability and by
  circular shells.
- Why it becomes obvious: Pi enters because the two-dimensional version has
  circular symmetry.
- Transfer pattern: If a 1D integral resists direct interpretation, ask whether
  its square creates geometry.
- Practice prompt: Imagine the product `e^(-x^2)e^(-y^2)` as height over the
  plane. Now walk around its circular level curves.

This is a direct answer to "where did the trick come from?" The trick is the
action of creating the space where symmetry can be seen.

### 23. Fourier Transform as Winding

- Source: 3Blue1Brown, [But what is the Fourier Transform?](https://www.youtube.com/watch?v=spUNpyF58BY).
- Trap: A Fourier transform is a complex-valued integral.
- Better object: A signal wrapped around a circle at a test frequency.
- Unseen action: Wind the graph, then track the center of mass.
- Why it becomes obvious: When the test frequency matches a hidden frequency,
  the wrapped signal becomes unbalanced and its center moves away from zero.
- Transfer pattern: A transform can be a detector. Ask what pattern would make
  the output fail to cancel.
- Practice prompt: Draw a sine wave around a circle too slowly, too quickly, and
  at the matching rate.

The complex exponential is not decoration. It is the winding action.

### 24. Laplace Transform as Exponential Detection

- Source: 3Blue1Brown, [But what is a Laplace Transform?](https://www.youtube.com/watch?v=j0wJBEZdwLs) and [Why Laplace transforms are so useful](https://www.youtube.com/watch?v=FE-hM1kRK4Y).
- Trap: Laplace transforms are tables for solving differential equations.
- Better object: The `s`-plane as a search space of exponential behaviors.
- Unseen action: Multiply by `e^(-st)` and see whether a hidden component stops
  moving, creating a pole.
- Why it becomes obvious: Poles mark the exponential ingredients of a signal or
  system.
- Transfer pattern: If a system is built from exponential modes, analyze it in a
  space whose coordinates are those modes.
- Practice prompt: Compare a decaying exponential, an oscillation, and a driven
  oscillator. Ask where each would leave a pole.

This is a "formula into detector" example. The integral is a scanning device.

### 25. Bayes as Geometry

- Source: 3Blue1Brown, [Bayes theorem, the geometry of changing beliefs](https://www.youtube.com/watch?v=HZGCoVF3YvM).
- Trap: Bayes' theorem is a formula with conditional probabilities in the
  numerator and denominator.
- Better object: A rectangle of possibilities, partitioned by hypothesis and
  evidence.
- Unseen action: Restrict attention to the evidence region, then measure what
  fraction of that region is the hypothesis.
- Why it becomes obvious: Updating belief is not a new formula; it is zooming in
  on the part of the world compatible with the observation.
- Transfer pattern: For conditional probability, draw the condition first. It is
  the new universe.
- Practice prompt: Draw a population rectangle. Shade disease, then shade
  positive tests. Now look only inside the positive-test region.

This matches Bessis's "make the object present" instruction: probability becomes
space you can inspect.

### 26. Bayes as Odds Updating

- Source: 3Blue1Brown, [The medical test paradox](https://www.youtube.com/watch?v=lG4VkPoG3ko).
- Trap: Confusing test accuracy with probability of disease after a positive
  test.
- Better object: Odds as a ratio that evidence multiplies.
- Unseen action: Change units from probability to odds, apply an evidence
  multiplier, then convert back if needed.
- Why it becomes obvious: A test result is not a final belief. It is a force
  applied to prior odds.
- Transfer pattern: If updating is awkward in one unit, find the unit where the
  update is linear or multiplicative.
- Practice prompt: Convert `1%` prior probability to odds. Multiply by a
  likelihood ratio. Convert back.

The paradox dissolves when the representation matches the action.

### 27. Hamming Codes as Address Bits

- Source: 3Blue1Brown, [But what are Hamming codes?](https://www.youtube.com/watch?v=X8jsijhllIA) and [Hamming codes part 2](https://www.youtube.com/watch?v=b3NxrZOu_CE).
- Trap: Error correction seems to require duplicating lots of data or checking
  many cases.
- Better object: Parity checks as yes/no questions whose failed answers encode
  an address.
- Unseen action: Read the syndrome as the binary location of the flipped bit.
- Why it becomes obvious: The failed checks do not merely say something is
  wrong; together they point to where it is wrong.
- Transfer pattern: Design redundancy so the error writes its own address.
- Practice prompt: Number bit positions in binary. Ask which parity checks each
  position participates in.

This is one of the best engineering examples of "no tricks." The one-line XOR
implementation is just the representation finally made explicit.

### 28. Entropy as Compression Budget

- Source: 3Blue1Brown, [Reinventing Entropy](https://www.youtube.com/watch?v=l6DKRf-fAAM).
- Trap: Entropy is a mysterious formula involving `-log p`.
- Better object: A codebook where common messages deserve short addresses and
  rare messages can tolerate long ones.
- Unseen action: Translate probability into address-space cost.
- Why it becomes obvious: A message with probability `p` naturally occupies
  about a `p` fraction of the address space, requiring about `-log2(p)` bits.
- Transfer pattern: When logarithms appear in information theory, ask what is
  being counted by powers of two.
- Practice prompt: Design a prefix code for four messages with unequal
  probabilities. Feel why equal-length codes waste space.

The formula is forced by the compression problem. It is not a definition to
memorize first.

### 29. Wordle and Information

- Source: 3Blue1Brown, [Solving Wordle using information theory](https://www.youtube.com/watch?v=v68zYyaEmEA).
- Trap: A good guess is a word with common letters or likely hits.
- Better object: A guess as a partition of possible worlds into feedback
  buckets.
- Unseen action: Before seeing the result, inspect how evenly the guess splits
  the remaining possibilities.
- Why it becomes obvious: A good guess is one whose feedback is expected to
  shrink uncertainty the most.
- Transfer pattern: Evaluate questions by the partition they induce, not by the
  answer you hope to get.
- Practice prompt: Compare two candidate guesses by listing their possible
  feedback patterns and bucket sizes.

This is entropy made playable. It turns an abstract quantity into a sense of
how sharply a question cuts possibility space.

### 30. Attention as Semantic Routing

- Source: 3Blue1Brown, [Attention in transformers, step-by-step](https://www.youtube.com/watch?v=eMlx5fFNoYc).
- Trap: Attention is an opaque matrix formula.
- Better object: Tokens asking questions, advertising keys, and carrying values.
- Unseen action: Reinterpret dot products as match scores that route information
  between tokens.
- Why it becomes obvious: The matrix multiplication is not arbitrary; it is a
  learned communication pattern.
- Transfer pattern: For large matrix formulas in machine learning, ask what
  information is being routed from where to where.
- Practice prompt: In a sentence, mark which words need information from which
  other words. Then map that need to query-key matching.

This extends the Bessis lens into AI: the formula becomes a social action among
embeddings.

### 31. LLM Facts as Feature Detectors and Update Directions

- Source: 3Blue1Brown, [How might LLMs store facts](https://www.youtube.com/watch?v=9-Jl0dxWQs8).
- Trap: Facts are mysteriously smeared across billions of parameters.
- Better object: Rows as feature detectors and columns as directions to add
  when a detector fires.
- Unseen action: See an MLP as "if this feature conjunction is present, push the
  embedding in that semantic direction."
- Why it becomes obvious: A fact can be imagined as a conditional vector update,
  even if real networks superpose many such updates.
- Transfer pattern: In neural nets, look for probes, gates, and writes.
- Practice prompt: Invent a toy embedding where "Eiffel Tower" activates a
  detector that adds a "Paris" direction.

This is not a complete theory of LLMs. It is a useful mental object that can be
refined by mechanistic evidence.

### 32. Sphere Surface Area as Shadow/Cylinder Projection

- Source: 3Blue1Brown, [But why is a sphere's surface area four times its shadow?](https://www.youtube.com/watch?v=GNcFjFmqEc8).
- Trap: Memorize `4 pi r^2`.
- Better object: Tiny rectangles on a sphere projected onto a cylinder or
  related to shadows.
- Unseen action: Compare the width stretch with the height squish.
- Why it becomes obvious: The two distortions cancel, so the sphere's area
  equals the cylinder label area, `2 pi r * 2r`.
- Transfer pattern: For curved surfaces, approximate locally and compare
  distortions.
- Practice prompt: Take a small patch near the pole and near the equator. Ask
  what projection stretches and what it squashes.

This is a case where scale matters. Imagine the patches large enough to feel the
stretching and squashing.

### 33. Dandelin Spheres and Cone Slices

- Source: 3Blue1Brown, [Why slicing a cone gives an ellipse](https://www.youtube.com/watch?v=pQa_tWZmlGs).
- Trap: Prove a cone slice has the focal-sum property by coordinate algebra.
- Better object: Spheres tucked inside the cone, tangent to the slicing plane.
- Unseen action: Add an auxiliary object that makes equal tangent lengths
  visible.
- Why it becomes obvious: Tangent segments from the same point to the same
  sphere are equal, so the focal-distance sum becomes a fixed cone-side length.
- Transfer pattern: When a length relation is hidden, add circles or spheres
  whose tangencies expose equal lengths.
- Practice prompt: Draw the 2D version first: two tangent circles and a line
  from an external point.

The "construction" is not a trick; it is a trained response to a missing
equality.

### 34. Pythagorean Triples as Gaussian Integer Squares

- Source: 3Blue1Brown, [All possible Pythagorean triples, visualized](https://www.youtube.com/watch?v=QJYmyhnaaek).
- Trap: Integer triples look like a list of coincidences.
- Better object: Lattice points, complex numbers, and rational points on the
  unit circle.
- Unseen action: Square Gaussian integers and interpret the resulting real and
  imaginary parts as legs.
- Why it becomes obvious: Squaring encodes the identity that makes
  `a^2 + b^2 = c^2` possible.
- Transfer pattern: Number theory often becomes visible when integers are placed
  in a geometric algebra.
- Practice prompt: Square `2 + i`, `2 + 3i`, and `m + ni`. Compare real and
  imaginary parts to Pythagorean triples.

This is arithmetic becoming motion in the complex plane.

### 35. Basel Problem as Light

- Source: 3Blue1Brown, [A geometric answer to the Basel problem](https://www.youtube.com/watch?v=d-o3eB9sfls).
- Trap: Sum reciprocal squares by analytic manipulation.
- Better object: Lighthouses whose brightness falls off by inverse square.
- Unseen action: Replace each term with light intensity, then transform the
  lighthouse arrangement while preserving total brightness.
- Why it becomes obvious: Pi appears through the geometry of circles and lines,
  not from symbolic coincidence.
- Transfer pattern: If a series has `1 / distance^2`, look for a physical
  inverse-square model.
- Practice prompt: Interpret `1/n^2` as brightness from a lighthouse at distance
  `n`. Ask how the total brightness changes when the lighthouses are rearranged.

The value of the series becomes a conserved sensory quantity.

### 36. Riemann Zeta and Analytic Continuation

- Source: 3Blue1Brown, [But what is the Riemann zeta function?](https://www.youtube.com/watch?v=sD0NjbwqlYw).
- Trap: Statements like `1 + 2 + 3 + ... = -1/12` sound like illegal arithmetic
  or clickbait.
- Better object: Complex functions as transformations of the plane.
- Unseen action: Replace the divergent series with the unique analytic
  continuation that preserves the transformation's local structure.
- Why it becomes obvious: The original formula names only part of the object.
  Analytic continuation extends the object beyond the region where the original
  naming method works.
- Transfer pattern: When a definition stops working, ask whether it was a local
  chart for a larger object.
- Practice prompt: Visualize a function first where the series converges, then
  ask what rigid constraints continuation imposes elsewhere.

This is a language-trap example: the series notation is not the whole object.

### 37. Holograms as Wavefront Reconstruction

- Source: 3Blue1Brown, [How are holograms possible?](https://www.youtube.com/watch?v=EmKQsSDlaa4).
- Trap: A flat plate somehow stores 3D information.
- Better object: An interference pattern that stores how a wavefront differs
  from a reference wave.
- Unseen action: Stop looking for a tiny picture on the plate; see the plate as
  a recipe for reconstructing outgoing light directions.
- Why it becomes obvious: Depth information lives in phase and direction, not in
  pigment-like local color.
- Transfer pattern: In wave systems, the object may be stored in interference
  relations rather than local marks.
- Practice prompt: Imagine two ripples crossing in water. Ask what information
  the crossing pattern preserves about the sources.

This is useful for signal-processing intuition: representation can store a
process, not an image.

### 38. Light Slowing in Glass as Phase Accumulation

- Source: 3Blue1Brown, [But why would light slow down?](https://www.youtube.com/watch?v=KTzGBJPuJwM).
- Trap: "Light slows in glass" sounds like a primitive fact.
- Better object: Layers of driven charges emitting tiny secondary waves.
- Unseen action: Replace speed change with accumulated phase shift from
  superposition.
- Why it becomes obvious: Many small delayed responses add up to a wave that
  behaves as if it traveled more slowly.
- Transfer pattern: When a medium changes a wave, ask what local responses add
  coherently.
- Practice prompt: Draw one incoming sine wave and one small delayed emitted
  sine wave. Add them and observe the phase shift.

This is a clean example of replacing a named property with the mechanism that
generates it.

## Domain Transfer Notes

### Signal Processing

Good metaphors to reuse:

- Fourier: wind a signal and measure imbalance.
- Laplace: scan for exponential modes.
- Convolution: slice product space by a constraint.
- Holography: store/reconstruct wavefront relations rather than local images.
- Refraction: phase shifts from many local responders.

Agent prompt:

> Given a signal-processing concept, identify the physical action: winding,
> slicing, filtering, projection, resonance, or reconstruction. Avoid naming the
> transform until the action is clear.

### Probability and Statistics

Good metaphors to reuse:

- Probability as area.
- Conditional probability as zooming into a region.
- Odds as a unit where evidence multiplies.
- Entropy as address-space budget.
- Gaussian symmetry as rotational invariance in a higher-dimensional surface.

Agent prompt:

> Convert the probability statement into a population, area, grid, or codebook.
> Then perform the update or average as a visible action.

### Linear Algebra

Good metaphors to reuse:

- Matrix as moving space.
- Determinant as area/volume scaling.
- Dot product as measuring shadow.
- Change of basis as translation between coordinate languages.
- Eigenvector as a direction that keeps its identity under motion.

Agent prompt:

> Before computing with entries, describe what happens to basis vectors, areas,
> directions, and coordinate languages.

### Combinatorics and Number Theory

Good metaphors to reuse:

- Generating function as a container for many choices.
- Roots of unity as rotating sieves.
- Pascal triangle as a map of subset counts.
- Gaussian integers as geometry for integer equations.
- Hamming syndrome as binary address.

Agent prompt:

> Replace casework with an encoding where the desired class is selected by
> symmetry, address, or coefficient extraction.

### Geometry and Topology

Good metaphors to reuse:

- Add an auxiliary object that makes equality visible.
- Track invariants instead of motion.
- Encode all choices as a space.
- Use projections and shadows to compare areas.
- Enlarge objects until you can move around them.

Agent prompt:

> If direct measurement is hard, ask what projection, slice, tangent object, or
> invariant would make the relation visible.

## Ranking for Immediate Reuse

If you need only the strongest examples for a short explainer or agent context,
start here:

1. Gauss sum as two triangles making a rectangle.
2. Matrix as moving space.
3. Fourier transform as winding and center of mass.
4. Colliding blocks as a ray in unfolded configuration space.
5. Roots of unity filter as rotational cancellation.
6. Borsuk-Ulam necklace as a sphere of choices.
7. Gaussian integral as a 2D circularly symmetric surface.
8. Hamming codes as parity checks spelling an address.
9. Bayes as geometry of a restricted region.
10. Determinant as area scaling.

These examples cover the main mental moves: make an object, animate it, add a
dimension, change coordinates, encode choices, track invariants, and use
symmetry to cancel noise.

## Questions to Ask When Stuck

- What am I currently treating as a word that should be an object?
- What is the smallest physical action this symbol is asking me to perform?
- Can I make the object larger, spatial, or tactile?
- Is there a hidden symmetry that only appears after adding a dimension?
- Am I counting directly when I should encode choices?
- Am I following motion when I should track an invariant?
- Is a formula actually a detector?
- Would another coordinate system make the action low-effort?
- What would the explanation look like if I had to teach it without notation?
- Where exactly does my intuition disagree with the formal result?

The dissonance is the useful part. It marks the location where a new unseen
action needs to be invented.
