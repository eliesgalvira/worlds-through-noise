# Product

## Name

Worlds Through Noise

## Slogan

See worlds through noise and hear noise through walls.

## Product

An interactive study companion for a university course on statistical signal processing (PSAVC): random processes, detection, estimation, Wiener filtering, and adaptive filtering.

## Audience

The site's owner (and students like them): can handle the mathematics, but wants to _feel_ what the mathematics is doing before the exam asks for it.

## Teaching Tenet

Teach by example, as defined in `EXAMPLES.md`:

1. Name the **trap** — how the notation misleads before the object exists in the mind.
2. Hand over the **object** — a concrete, manipulable thing (an ensemble to slice, a budget to spend, springs to balance, a bowl to roll down).
3. Make the learner **perform the unseen action** in an interactive figure whose readouts are genuinely computed.
4. Only then show the equation, which should read like a description of what the learner just did.
5. Close with a transfer prompt tied to real past exams.

## Anti-Goals

- No concept exposition without an object and an action.
- No fabricated meters: every displayed number derives from the model or from a real simulation.
- No decorative math, no theorem dumps before interaction.
- No generic SaaS/dashboard aesthetics; no third-party charting libraries.

## Routes

- `/processes` — Tema 1: random processes, autocorrelation, R_x and its eigen-structure.
- `/detection` — Tema 2: Neyman-Pearson, matched filtering, energy detection, MAP/Bayes.
- `/estimation` — Tema 3: bias/variance, CRB, ML, fusion/BLUE, MAP.
- `/wiener` — Tema 4: normal equations, cancellation, prediction.
- `/adaptive` — Tema 5: steepest descent, LMS, misadjustment.

## Unifying Sentence

Characterize the random machine, decide which machine dealt the data, estimate the dial the machine was set to, then build — and finally adapt — the filter that undoes it.
