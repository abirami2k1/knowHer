# knowHer — Cycle Engine: Evidence Review and Consistency Plan

Status: **proposal, 2026-09-17.** Companion to `cycle-engine-plan.md`. It checks each engine rule against the published
research on basal body temperature (BBT) and cervical-mucus ovulation detection, and proposes how to keep the engine
consistent with both that evidence and Sivi's method over time. Precedence stays as the project defines it: Sivi's method
is the product; the evidence tells us where her defaults sit within the literature, where to widen a tolerance, and what
to say honestly. Where the two disagree, the recommendation is to discuss with her, never to silently override.

How to read: every section has **Evidence → What it means for knowHer → Change**, and each change names the
`CYCLE_RULES` key or plan section it touches. §11 consolidates the changes; §12 lists sources.

---

## 0. Summary

Ten findings that matter for the build:

1. **Sivi's coverline is the textbook "three-over-six" rule**, first described by Marshall and Barrett in the late 1960s and
   still the most used BBT rule. Her drawn chart matches it exactly; the engine default is right.
2. **Thresholds vary by school, so they must be config, not code.** TCOYF draws the line 0.1 °F above the six; Sensiplan requires
   the third temperature to be 0.2 °C (0.36 °F) above them and has a fourth-temperature fallback; a 1983 chart study of 8,496
   charts favoured 0.3 °F above a running low average. All are one key away in the plan.
3. **BBT confirms *that* ovulation happened far better than it dates *when*.** The rise is seen in 98 % of ovulatory cycles, but the
   first high temperature often sits more than two days from ultrasound-dated ovulation. Say "around day N", never "on day N".
4. **The mucus peak day is the most precise self-observed marker** (within ±1 day of ovulation in 72 % of cycles, SD 1.6 days).
   It deserves equal billing with temperature, and confirmation after three, not two, non-egg-white days is the published norm.
5. **The luteal phase is not 14 days.** Large datasets put it at 12.4–12.8 days on average with real spread; a 1-year cohort found it
   "not predictably 13–14 days". `defaultLutealAssumption: 14` should become 13, then the user's own confirmed luteal lengths.
6. **Only about 13 % of cycles are 28 days, and ovulation day spans ten days even within 28-day cycles.** Any expected-ovulation
   estimate must be a window and labelled as such. The plan already does this; the numbers say keep it.
7. **"Irregular" has a clinical definition** (FIGO 2018: shortest-to-longest range over 7–9 days depending on age). Use it in place of
   the ad-hoc coefficient-of-variation threshold; the app already collects age band.
8. **Cycles without a detectable shift are common and mostly a data problem, not a body problem.** Copy must separate
   "no ovulation detected", "couldn't tell this cycle", and "still watching", and the engine needs a data-coverage requirement
   before it says the first.
9. **Disturbed readings are handled the same way by every serious method: excluded, never smoothed.** Add a plausibility range
   to catch typos, and nudge users to flag readings taken at a different time.
10. **Most consumer apps get the fertile window wrong, and the effectiveness evidence for method apps is thin.** knowHer's
    "no safe days, retrospective only, rules you can read" stance is exactly what the literature asks for. Publish the rules in
    the Knowledge tab and version them in the data.

---

## 1. The thermal-shift rule: where "three-over-six" comes from and how it varies

**Evidence**

- Marshall's 1968 field trial (502 couples, 8,294 cycles) established BBT charting as a method; Barrett and Marshall (1969) dated
  ovulation from the BBT shift in 1,898 cycles. This is the origin of the "three temperatures above the previous six" rule.
- McCarthy and Rockette (1983) coded several interpretation rules and ran them over 8,496 charts. The best concurrent rule was a
  shift of **at least 0.3 °F above a running low average, sustained three days**; a smoothed-curve method was the best retrospective
  one; both found a shift in over 95 % of complete charts.
- Sensiplan, the method with the strongest effectiveness data, states the closing rule as: **the evening of the third higher
  temperature, all three higher than the previous six readings, the third at least 0.2 °C above them** (Frank-Herrmann 2007).
  Teaching materials add two exceptions: if the third is not 0.2 °C higher, wait for a fourth that is simply above the six; if the
  second or third dips to or below the line, wait for a fourth that is 0.2 °C above it.
- TCOYF (the chart layout Sivi uses) draws the coverline 0.1 °F above the highest of the six preceding temperatures and requires three
  above it. Sivi's sample chart reproduces this exactly (`cycle-engine-plan.md` §1.1).
- A 2022 sensor study defines the rule as three consecutive days at least 0.3 °C above the previous six, assigning ovulation to the
  day before the first high. A 2019 model of 2.7 million app cycles found the typical follicular-to-luteal difference is about
  0.36 °C (0.7 °F) and needed at least 0.15 °C to call a shift (Symul 2019). Natural Cycles instead compares a three-day rolling
  average of valid temperatures against the follicular average and a coverline (Bull 2019).

**What it means for knowHer**

Sivi's default is mainstream. The variation between schools is in the *margin* demanded of the third temperature and in what
happens when the third is weak. Those are exactly the knobs a practitioner tunes, so they belong in `CYCLE_RULES` with Sivi's
values as defaults, and the engine should record which variant produced a result so a chart is explainable later.

**Change**

- Keep `coverlineOffsetF: 0.1`, `coverlineWindow: 6`, `consecutiveRises: 3` as defaults (Sivi, TCOYF).
- Add two *optional* keys, default off, so the Sensiplan variant is one edit away: `thirdRiseMarginF: 0` (Sensiplan: 0.36) and
  `fourthTempFallback: false` (Sensiplan: true). Build them only if Sivi asks (plan §5 already lists them as deliberately unbuilt).
- Add `rulesVersion: '2026.09'` to `CYCLE_RULES` and persist it on the cycle snapshot (see §9), so a later rule change never
  silently rewrites a closed cycle's history.

---

## 2. How precisely BBT dates ovulation

**Evidence**

- Ecochard 2001 (107 women, 326 cycles, ultrasound reference): a BBT rise was observed in **98 %** of ovulatory cycles, but the nadir
  and the rise "often occur more than 2 days" from ultrasound-dated ovulation, making BBT the least precise of the indices studied.
- Guermandi 2001 (101 infertile women, ultrasound reference): BBT agreed with ultrasound in **74 %** of cycles; the nadir "predicted
  ovulation poorly".
- Bauman 1981: six physicians reading 104 charts placed ovulation within ±1 day of the LH peak in only **22 %** of ovulatory cycles
  by consensus, and judged 22 % of ovulatory cycles monophasic.
- Berglund Scherwitzl 2015 (Natural Cycles, 1,501 cycles): the temperature-based ovulation estimate trailed the first positive
  LH test by a mean of **1.9 days**.
- Zhu 2021 (193 cycles, LH reference): a single morning BBT reading sits somewhere on the circadian slope, which is why point
  measurements detect a shift less sensitively than continuous overnight temperature.

**What it means for knowHer**

The engine's job with temperature is to confirm a biphasic pattern, and it does that reliably. The exact ovulation day it names is a
convention (the day before the first high), typically one to three days *after* the event. Presenting it as a point would be false
precision, which the honesty rules forbid. The temperature dip is not a reliable anchor for anything, which supports the plan's
choice to show the dip only as an annotation.

**Change**

- Copy: "ovulation was confirmed around day N" and the chart marks a 2-day band, not a pin. No engine change; `ovulationDay` stays
  the day before the first high because every school and Sivi's luteal count depend on it.
- Keep `dipDay` as a chart annotation with no rule effect (plan §6.4).
- Widen `disagreementToleranceDays` from 2 to **3** (see §3 for the mucus side of the arithmetic).

---

## 3. The cervical-mucus peak day

**Evidence**

- Ecochard 2001: the mucus peak fell within ±1 day of ultrasound ovulation in **72 %** of cycles with SD 1.6 days, the smallest
  spread of any non-invasive index, and the authors call it a better practical marker than the LH peak.
- Fehring 2002 (pooled 93 cycles with both markers): **97.8 %** of self-identified peak days fell within ±4 days of estimated
  ovulation, and standardized mucus ratings were highest on the LH-surge day.
- Sensiplan recognises the peak "only on the day following peak, when the secretions have become sticky again", and closes the
  mucus side of the window on the **evening of the third day after peak** (Frank-Herrmann 2007). Billings and TCOYF use the same
  three-day count.
- Symul 2019 modelled "high fertility" mucus as egg-white, watery or stretchable.

**What it means for knowHer**

Sivi's definition (last egg-white day) is the standard one. Her confirmation count is unknown (plan Q5); the published norm is
three days. Peak day (±1.6 days) and the BBT-dated ovulation (one to three days late) can legitimately sit up to three days apart in
an ordinary cycle, so a two-day tolerance would raise "disagreement" flags on normal cycles.

**Change**

- `peakConfirmDays: 3` as the evidence-based default; Sivi may lower it to 2.
- `disagreementToleranceDays: 3`.
- Add `peakMucusTypes: ['eggwhite']` with `'watery'` as an option, so Sivi's answer on lotion-type mucus (her type 2) is config, not code.
- In copy, the peak day is the *primary* dating marker and the temperature shift the *confirmation*: "your mucus peak points to
  day 14; your temperatures confirmed ovulation around day 15–16."

---

## 4. The luteal phase and the "cycle length minus 14" formula

**Evidence**

| Source | Cycles | Luteal length | Notes |
|---|---|---|---|
| Bull 2019 (Natural Cycles) | 612,613 | 12.4 ± 2.4 days | follicular 16.9 ± 5.3 carries the variability; 18 % of cycles under 11 days; only 13 % of cycles are 28 days; per-user cycle SD 2.6 days |
| Soumpasis 2020 (connected LH tests) | 75,981 | 12.77 ± 1.86 days | luteal barely tracks cycle length (r 0.37); within 28-day cycles ovulation spanned 10 days; 12.4 % of women actually had 28-day cycles; 52 % varied by 5+ days |
| Symul 2019 (Kindara, Sympto) | 2.7 M | median 12–13 days | about 20 % at or under 10 days; only ~24 % of ovulations on days 14–15; 90 % between days 10 and 24 |
| Henry, Prior 2024 (1-year cohort, 694 cycles) | 694 | median 10.9 days (QBT dating) | "not predictably 13–14 days"; within-woman variability: cycle 3.1, follicular 5.2, luteal 3.0 days |
| Fehring 2006 (monitor study) | 1,060 | 7–15 days | cycle 28.9 ± 3.4; 95 % of cycles 22–36 days |
| Berglund Scherwitzl 2015 | 1,501 | — | per-user luteal variation averaged 1.25 days: a woman's own luteal length is far steadier than the population's |

**What it means for knowHer**

Subtracting 14 places the expected ovulation day one to two days early for the typical user, and the follicular phase, which is
what the estimate is really guessing, is the noisy part. The one stable number is each woman's *own* luteal length once the engine
has confirmed it a few times. That is exactly the personalisation the evidence supports without any modelling.

**Change**

- `defaultLutealAssumption: 13` (population prior).
- `estimate.ts`: once the user has **two or more** confirmed luteal lengths, use her mean luteal length (clamped to 10–16) instead of
  the prior; report `basis: 'personal' | 'history' | 'self_reported'`.
- Keep the estimate a window (`ovulatoryWindowDays: 2`) and keep it off the History calendar (architecture D4). Copy shows
  "likely between day 13 and 17", never a date.

---

## 5. Regular, irregular and "running long"

**Evidence**

- FIGO 2018 (Munro): normal frequency 24–38 days; **regular** = shortest-to-longest variation of ≤ 9 days at 18–25, ≤ 7 days at
  26–41, ≤ 9 days at 42–45; **irregular** = 10–28 days of variation.
- Bull 2019: per-user cycle-length SD 2.6 ± 2.5 days (CV about 0.09); variability falls with age. Soumpasis 2020: 52 % of women vary by
  5 or more days.

**What it means for knowHer**

The plan's `irregularCvThreshold: 0.18` corresponds to an SD of about 5 days on a 29-day cycle, so it only flags the very irregular
and it is not a number a clinician or Sivi would recognise. FIGO's range rule is interpretable, age-aware, and the app already stores
`ageBand`. Both are cheap to compute from the same history.

**Change**

- Primary irregularity rule: `irregularRangeDays` by age band (`{ under18: 9, b18_24: 9, b25_34: 7, b35_44: 7, b45_plus: 9 }`),
  applied once `minCyclesForStats: 3` closed cycles exist. Keep CV as a secondary check for 6+ cycles.
- Long-cycle fallback stays `today > mean + 2·SD`; with fewer than 4 cycles use `today > longest + 2` instead of an SD that is not
  meaningful yet.
- Suppress the expected-ovulation window entirely when the FIGO rule says irregular (already the plan's intent; now the threshold is
  defensible).

---

## 6. Cycles with no detectable shift

**Evidence**

- Prior 2015 (HUNT3, 1,545 women, single progesterone): **37 %** of clinically normal-length cycles appeared anovulatory. The authors
  flag single-sample timing and threshold caveats, but conclude anovulation "likely occurs in more than a third" of normal cycles.
- Henry, Prior 2024 (healthy women prescreened for two ovulatory cycles): only **2.6 %** of cycles anovulatory, yet 17 % of women had
  at least one.
- Bull 2019: 665,603 of 1.4 M recorded cycles had no ovulation detected, largely from sparse temperature data; the analysis kept only
  cycles with valid temperatures on at least 50 % of days. Symul 2019: 40 % (Sympto) to 89 % (Kindara) of cycles were unusable for
  ovulation estimation for data reasons.
- McCarthy 1983: with complete readings, a shift is found in over 95 % of charts.

**What it means for knowHer**

A cycle with no visible shift is usually thin data, sometimes a real anovulatory cycle, and either way something that happens to most
women at some point. The engine must not say "no ovulation" when it merely could not see, and the copy must make the ordinary
frequency of both outcomes clear. The plan already separates `low_data`, `shift_pending` and `anovulatory`; it needs a coverage
requirement before the last one.

**Change**

- `isAnovulatory` requires a closed cycle **and** usable readings on at least `minCoverageForVerdict: 0.5` of cycle days **and** at
  least one reading in each third of the cycle. Otherwise the outcome is `low_data` ("we couldn't tell this cycle").
- `minValidTemps` becomes derived, not a knob: a confirmation structurally needs `coverlineWindow + consecutiveRises` (9) usable
  readings, so `low_data` fires below that.
- Copy never uses "anovulatory" to the user; it says "no ovulation was detected this cycle", adds that this is common, and that a
  pattern over several cycles is what matters, which is also Sivi's own framing.

---

## 7. Disturbed readings, measurement time and plausibility

**Evidence**

- Every method excludes disturbed temperatures rather than adjusting them: Sensiplan brackets them out of the six; Natural Cycles
  excludes user-marked "deviating" readings (poor sleep, alcohol) and anything outside 35.0–37.5 °C (Bull 2019).
- Danel 2001: repeated alcohol intake raised night-time core temperature by 0.36 °C in a small crossover study, roughly the size of the
  ovulatory shift itself.
- A single BBT reading sits on the morning circadian rise (Zhu 2021); a 2025 comparison found the size of the detected shift changed
  with measurement time and site. Sivi's own instruction is the same: same time, before rising, mark a different waking time.

**What it means for knowHer**

`excludeDisturbed: true` is the consensus. Two things are missing: a guard against impossible values (a typo like 79.8 would otherwise
become the window maximum and hide a real shift for the rest of the cycle) and help for the user to notice a different waking time.

**Change**

- `plausibleRangeF: [95.0, 100.4]`; readings outside are excluded and flagged `implausible_reading` (new flag; copy asks the user to
  check the entry).
- Task 6 UI, not engine: when `tempTakenAt` differs from the user's usual time by more than `usualTimeToleranceMin: 60`, suggest
  marking the reading as disturbed with reason "different waking time". The usual time is the median of the last 14 logged times,
  computed in the service.
- Keep the plan's rule that a disturbed reading breaks a run and leaves the window, and that a window with fewer than six readings
  after exclusions yields `reduced` confidence.

---

## 8. How much data before the engine speaks

**Evidence**

- Symul 2019 required at least 8 observation days per cycle; Bull 2019 required valid temperatures on at least 50 % of days.
- Sivi's workbook: chart at least one full cycle before reading anything; look for a pattern, not daily temperatures.

**Change**

- First-cycle copy: the tracker shows the chart but leads with "your first full cycle is a baseline". No predictions on the dashboard until
  one cycle is closed (the plan's `expectedOvulation` already needs history or a self-reported average; make the self-reported path
  say "based on what you told us").
- Coverage rules from §6 apply to every verdict, not only anovulation.

---

## 9. Apps, transparency and the honesty rules

**Evidence**

- Setton 2016: of 20 websites and 33 apps given a standard 28-day cycle, **one website and three apps** predicted the fertile window
  correctly. Duane 2016: most fertility apps are not built on an evidence-based method; only some categories had an accurate app.
- Peragallo Urrutia 2018 (53 studies): the effectiveness evidence for each fertility-awareness method is "small and of low to moderate
  quality"; among moderate-quality studies typical-use pregnancy rates for symptothermal methods ranged 11–33 per 100 woman-years.
  Sensiplan's own cohort: 0.4–0.6 with perfect use, 1.8 typical (Frank-Herrmann 2007). Marshall 1968: BBT alone, post-ovulatory
  intercourse only, 6.6 per 100 woman-years.
- Privacy International's app audits found most period apps sharing sensitive data with third parties.

**What it means for knowHer**

The project's rules (no safe-day signal, retrospective confirmation, deterministic explainable rules, no health data in URLs or logs)
are the correct response to this literature. Two additions make the stance visible to users and auditable over time.

**Change**

- Publish "How knowHer reads your chart" as a Knowledge article authored by Sivi: the six-and-three rule in plain words, why the app
  waits, what "confidence" means. Content, not a new feature.
- Persist `rulesVersion` on every closed-cycle snapshot (`Cycle.rulesVersion String?`, a one-column migration in Task 7). When the
  version changes, closed cycles are recomputed only on the user's request or when their logs are edited, and Trends can show which
  cycles were assessed under which rules. Founder decision, since it touches the schema.

---

## 10. Validating the engine beyond Sivi's fixtures

- **Sivi's fixtures** remain the ground truth for *her method* (plan §8).
- **Synthetic cycles** drawn from the published distributions (follicular 16.9 ± 5.3, luteal 12.4 ± 2.4, shift ≈ 0.65 °F, day-to-day
  noise 0.1–0.2 °F, 10–30 % missing days, occasional disturbed spikes) give thousands of cases for property tests: detection rate with
  complete data should exceed 95 % (McCarthy 1983), and the named ovulation day should land one to three days after the simulated one.
- **Marquette's 2012 dataset** (per-cycle summaries: cycle length, estimated ovulation day, luteal length; anonymised, CSV, reuse
  consented) validates `estimate.ts`: how far "cycle length minus 13" and the personal luteal estimate miss the recorded ovulation day.
  It has no daily readings, so it cannot test the coverline rule.
- **WAVES (Science Advances, 2026)** describes an open-source tool over 5,674 cycles of daily BBT and mucus. If its data are
  obtainable, run the engine over them and report detection rate and day offset against the tool's own estimates. Check access
  terms first; do not assume the data are public.
- **Symul 2019** data are not public (available from the authors with Sympto and Kindara's permission); the analysis code is.
  Worth a request only if knowHer ever moves beyond rules, which is out of scope.

None of this replaces the Sivi gate (4.4.0). It answers a different question: does the engine behave sensibly on cycles nobody
hand-checked.

---

## 11. Consolidated changes

| Key or area | Plan default | Recommended | Why (source) | Decides |
|---|---|---|---|---|
| `coverlineOffsetF`, `coverlineWindow`, `consecutiveRises` | 0.1, 6, 3 | keep | Sivi's chart = TCOYF = Marshall/Barrett rule | — |
| `thirdRiseMarginF`, `fourthTempFallback` | not built | keys exist, off | Sensiplan variant (Frank-Herrmann 2007) | Sivi |
| `peakConfirmDays` | 2 | **3** | Sensiplan, Billings, TCOYF all count three | Sivi |
| `peakMucusTypes` | egg-white only | key, egg-white default | Symul treats watery as fertile; Sivi's type 2 question | Sivi |
| `disagreementToleranceDays` | 2 | **3** | peak SD 1.6 d + BBT lag 1–3 d (Ecochard, Berglund Scherwitzl) | Sivi |
| `defaultLutealAssumption` | 14 | **13**, then personal mean after 2 confirmed cycles | Bull, Soumpasis, Henry/Prior | founder |
| `irregularCvThreshold` | 0.18 | FIGO range rule by age band; CV secondary | Munro 2018 | founder |
| long-cycle fallback | mean + 2·SD | same; `longest + 2` under 4 cycles | small-n statistics | founder |
| `minValidTemps` | 4 | derived (9) | structural | — |
| `minCoverageForVerdict` | — | **0.5** of cycle days | Bull 2019 inclusion rule | founder |
| `plausibleRangeF` + `implausible_reading` | — | [95.0, 100.4] | Natural Cycles range filter | founder |
| `rulesVersion` on snapshots | — | add (schema column) | auditability | founder |
| Ovulation day wording | day N | "around day N", 2-day band | Ecochard, Guermandi, Bauman | Sivi (copy) |
| Anovulatory wording | — | "no ovulation detected", common, pattern over cycles | Prior 2015, Henry 2024 | Sivi (copy) |
| Different-waking-time nudge | — | Task 6 UI, ±60 min | Sivi's instruction; circadian evidence | founder |
| Knowledge article on the rules | — | Sivi authors | Setton, Duane: transparency gap | Sivi |

Questions this adds to the Sivi session (plan §11): whether she uses the Sensiplan fourth-temperature exception; whether she counts
three days after peak; whether lotion-type mucus ever counts as peak; and whether she is comfortable with "around day N" wording.

### Keeping it consistent over time

1. Every key in `rules.ts` carries a one-line comment naming its source (Sivi, or a paper from §12). A key with no source is a smell.
2. A rule change ships as one commit: the key, the fixture that proves the new behaviour, the evidence note, and a `rulesVersion` bump.
3. Where the evidence is silent, Sivi's method wins. Where it contradicts her method, the change is discussed with her and recorded
   here with the outcome, whichever way it goes.
4. This file is re-checked against new literature once a year or whenever a rule is questioned; the summary in §0 is rewritten each time.

---

## 12. Sources

- Marshall J. A field trial of the basal-body-temperature method of regulating births. Lancet 1968. https://pubmed.ncbi.nlm.nih.gov/4172715/
- Barrett JC, Marshall J. The risk of conception on different days of the menstrual cycle. Population Studies 1969. https://pubmed.ncbi.nlm.nih.gov/22073960/
- McCarthy JJ, Rockette HE. A comparison of methods to interpret the basal body temperature graph. Fertil Steril 1983. https://pubmed.ncbi.nlm.nih.gov/6840307/
- Frank-Herrmann P et al. The effectiveness of a fertility awareness based method to avoid pregnancy in relation to a couple's sexual behaviour during the fertile time. Hum Reprod 2007. https://academic.oup.com/humrep/article/22/5/1310/2914315
- Sensiplan temperature exceptions as taught: https://daysy.me/us/en/learn-more/natural-family-planning/nfp-rules/ and https://www.tempdrop.com/blogs/resources/sensiplan-fertility-awareness-method-overview
- Ecochard R et al. Chronological aspects of ultrasonic, hormonal, and other indirect indices of ovulation. BJOG 2001. https://pubmed.ncbi.nlm.nih.gov/11510707/
- Guermandi E et al. Reliability of ovulation tests in infertile women. Obstet Gynecol 2001. https://pubmed.ncbi.nlm.nih.gov/11152915/
- Bauman JE. Basal body temperature: unreliable method of ovulation detection. Fertil Steril 1981. https://pubmed.ncbi.nlm.nih.gov/7308516/
- Fehring RJ. Accuracy of the peak day of cervical mucus as a biological marker of fertility. Contraception 2002. https://pubmed.ncbi.nlm.nih.gov/12413617/
- Fehring RJ, Schneider M, Raviele K. Variability in the phases of the menstrual cycle. JOGNN 2006. https://www.jognn.org/article/S0884-2175(15)34376-8/abstract
- Bull JR et al. Real-world menstrual cycle characteristics of more than 600,000 menstrual cycles. npj Digit Med 2019. https://www.nature.com/articles/s41746-019-0152-7
- Soumpasis I, Grace B, Johnson S. Real-life insights on menstrual cycles and ovulation using big data. Hum Reprod Open 2020. https://academic.oup.com/hropen/article/2020/2/hoaa011/5820371
- Henry S, Shirin S, Goshtasebi A, Prior JC. Prospective 1-year assessment of within-woman variability of follicular and luteal phase lengths. Hum Reprod 2024. https://academic.oup.com/humrep/article/39/11/2565/7775370
- Prior JC et al. Ovulation prevalence in women with spontaneous normal-length menstrual cycles (HUNT3). PLoS ONE 2015. https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0134473
- Symul L et al. Assessment of menstrual health status and evolution through mobile apps for fertility awareness. npj Digit Med 2019. https://www.nature.com/articles/s41746-019-0139-4
- Berglund Scherwitzl E et al. Identification and prediction of the fertile window using NaturalCycles. Eur J Contracept Reprod Health Care 2015. https://pubmed.ncbi.nlm.nih.gov/25592280/
- Munro MG et al. The two FIGO systems for normal and abnormal uterine bleeding symptoms: 2018 revisions. Int J Gynecol Obstet 2018. https://obgyn.onlinelibrary.wiley.com/doi/10.1002/ijgo.12666
- Setton R et al. The accuracy of web sites and cellular phone applications in predicting the fertile window. Obstet Gynecol 2016. https://pubmed.ncbi.nlm.nih.gov/27275788/
- Duane M et al. The performance of fertility awareness-based method apps marketed to avoid pregnancy. JABFM 2016. https://pubmed.ncbi.nlm.nih.gov/27390383/
- Peragallo Urrutia R et al. Effectiveness of fertility awareness-based methods for pregnancy prevention: a systematic review. Obstet Gynecol 2018. https://pubmed.ncbi.nlm.nih.gov/30095777/
- Zhu TY et al. The accuracy of wrist skin temperature in detecting ovulation compared to basal body temperature. J Med Internet Res 2021. https://pubmed.ncbi.nlm.nih.gov/34100763/
- Danel T et al. The effect of alcohol consumption on the circadian control of human core body temperature is time dependent. Am J Physiol 2001. https://pubmed.ncbi.nlm.nih.gov/11404278/
- Skin-worn sensor vs BBT algorithm, with the three-over-six definition. Front Bioeng Biotechnol 2022. https://www.frontiersin.org/journals/bioengineering-and-biotechnology/articles/10.3389/fbioe.2022.807139/full
- Optimizing basal body temperature measurement for cycle diagnostics (measurement time and site). Front Sports Act Living 2025. https://pubmed.ncbi.nlm.nih.gov/41624353/
- WAVES: Identifying menstrual metrics as personal health markers across 5674 cycles. Science Advances 2026. https://www.science.org/doi/10.1126/sciadv.aeb1175
- Fehring RJ. Menstrual Cycle Data (per-cycle, anonymised, CSV). Marquette University. https://epublications.marquette.edu/data_nfp/7/
- Privacy International. No Body's Business But Mine: how menstruation apps are sharing your data. 2019. https://privacyinternational.org/long-read/3196/no-bodys-business-mine-how-menstruations-apps-are-sharing-your-data
