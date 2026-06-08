# Worlds Through Noise

Worlds Through Noise teaches inference in audiovisual signal processing by giving learners direct control over noisy observations and the hidden quantities that generate them.

## Language

**Hidden Quantity**:
The unknown reality that inference tries to recover from noisy observations.
_Avoid_: Cause, truth, source when used as broad umbrella terms

**Hidden World**:
A discrete possible reality in a detection problem, usually named **H0** or **H1**.
_Avoid_: Class, label, option

**Hidden Parameter**:
A fixed unknown value in an estimation problem, usually named **theta**.
_Avoid_: Dial when used outside explanatory copy

**Hidden State**:
A time-evolving unknown value in a filtering problem.
_Avoid_: Parameter when time evolution is essential

**Noisy Mechanism**:
The physical, statistical, or sensor process that corrupts a hidden quantity into an observation.
_Avoid_: Noise when referring to the whole observation pipeline

**Observation**:
The data visible to the learner after a hidden quantity passes through a noisy mechanism.
_Avoid_: Trace when mathematical precision is needed

**Inference**:
The act of using observations to choose a hidden world or estimate a hidden parameter.
_Avoid_: Guess, prediction when the lesson is about present evidence

## Relationships

- A **Hidden Quantity** passes through a **Noisy Mechanism** to produce one or more **Observations**
- **Detection** infers a **Hidden World** from **Observations**
- **Estimation** infers a **Hidden Parameter** from **Observations**
- **Filtering** will infer a **Hidden State** from time-indexed **Observations**

## Example Dialogue

> **Dev:** "In the Doppler module, is the learner estimating the blood-flow frequency?"
> **Domain expert:** "Not in detection. They choose between two **Hidden Worlds**, static cells or moving cells. Estimation modules infer a **Hidden Parameter**."

## Flagged Ambiguities

- "hidden cause" is acceptable product copy, but the canonical umbrella term is **Hidden Quantity**.
