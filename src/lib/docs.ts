// ─── Documentation Content ──────────────────────────────────────
// Each section has both an "engineer" and "regular" explanation.
// Engineer mode shows formulas, derivations, and references.
// Regular mode explains the same concept in plain language.

export interface DocSection {
  id: string;
  title: string;
  category: string;
  engineer: string;
  regular: string;
}

export const DOC_CATEGORIES = [
  "Bow Mechanics",
  "String Physics",
  "Arrow Dynamics",
  "Ballistics",
  "Tuning Concepts",
] as const;

export const DOCS: DocSection[] = [
  // ═══════════════════════════════════════════════════════════════
  // BOW MECHANICS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "force-draw",
    title: "Force-Draw Curves",
    category: "Bow Mechanics",
    engineer: `The force-draw curve F(x) describes the force required to hold the string at displacement x from brace height to full draw. Stored energy is the integral:

  E_stored = ∫[brace to full draw] F(x) dx

We compute this numerically using the trapezoidal rule over 100 steps. Each bow type has a distinct F(x):

• Longbow: F(x) = k·x (Hookean spring, linear)
• Recurve: F(x) ≈ F_peak · (x/x_max)^0.7 (supra-linear early, flattening)
• Compound: Peak at ~15-40% draw → plateau → let-off valley at ~70-85% → wall
  The let-off region is where the cam "rolls over" and the archer holds only 10-35% of peak weight.
• Crossbow: Similar to compound but shorter power stroke (10-14" typical vs 23-30" for vertical bows)

The power stroke = draw length − brace height. A 30" draw with 7" brace gives a 23" power stroke. All stored energy comes from this region — force before brace height is structural preload and does not accelerate the arrow.

Units: Force in lbs, displacement in inches → E_stored in inch-lbs, converted to ft-lbs (÷12).`,

    regular: `When you pull back a bowstring, it gets harder to pull the further back you go. A force-draw curve is just a graph of "how hard am I pulling" vs "how far back have I pulled."

Different bows feel very different:
• A longbow gets steadily harder — like stretching a rubber band.
• A recurve starts hard, then the increase slows down near full draw.
• A compound is unique — it gets really hard early (the "peak"), then suddenly gets easy to hold (the "valley"). That easy-to-hold feeling is called "let-off." A 70 lb bow with 80% let-off means you're only holding 14 lbs at full draw.

Why does this matter? The energy stored in the bow is basically the area under this curve. More area = more energy = faster arrow. Compounds store the most energy because they maintain high force through most of the draw, even though they're easy to hold at full draw.

The "power stroke" is the distance from where your string sits at rest (brace height) to full draw. Longer power stroke = more time to push the arrow = more speed.`,
  },

  {
    id: "bow-efficiency",
    title: "Bow Efficiency & Energy Transfer",
    category: "Bow Mechanics",
    engineer: `Bow efficiency η is the ratio of arrow kinetic energy to stored potential energy:

  η = KE_arrow / E_stored

Typical values:
• Compound: η ≈ 0.80–0.85
• Recurve: η ≈ 0.70–0.78
• Longbow: η ≈ 0.60–0.70
• Crossbow: η ≈ 0.75–0.80

Energy losses are modeled as fixed fractions of E_stored:
• Limb kinetic energy: 5–12% (limbs must decelerate after release)
• String/cable KE: 2–5% (string has mass and must also decelerate)
• Hysteresis: 3–6% (internal friction in limb materials, manifests as heat)
• Vibration: 2–5% (residual oscillation after arrow leaves)
• Sound: 1–2% (acoustic radiation)

The virtual mass concept accounts for the string's contribution to the effective projectile mass:

  m_virtual = m_arrow + m_string/3

The 1/3 factor comes from the string's velocity distribution — the midpoint moves at arrow speed while the endpoints are stationary, giving an average of ~1/3 of the string mass effectively "riding" with the arrow.

Arrow velocity:
  v = √(2 · η · E_stored / m_virtual)

This is converted from m/s to fps (×3.28084) for display.`,

    regular: `Not all the energy you put into drawing the bow goes into the arrow. Some is "wasted" — but it's important to understand where it goes:

• Arrow (~80% on a compound): This is what you want! The arrow flies away carrying most of the energy.
• Limb movement (~8%): The bow's limbs are heavy and moving fast. After the arrow leaves, they have to stop — that takes energy.
• String vibration (~3%): The string keeps vibrating after the shot. That energy has to come from somewhere.
• Heat (~4%): Bending the limbs repeatedly generates a tiny amount of heat (like bending a paperclip back and forth).
• Sound and vibration (~4%): The "thwack" you hear and the kick you feel in your hand — that's energy too.

Compounds are the most efficient because their cam system maintains force through most of the draw. Longbows are least efficient because their simple design means more energy stays in the limbs.

The simulator also accounts for your string's weight. A heavier string "steals" speed from the arrow because the string has to accelerate along with the arrow. That's why lighter string materials (like BCY-X) are popular — less string weight means more speed.`,
  },

  {
    id: "let-off",
    title: "Compound Let-Off & Cam Systems",
    category: "Bow Mechanics",
    engineer: `Let-off is the percentage reduction in holding weight at full draw compared to peak draw weight:

  Holding weight = Peak weight × (1 − let-off)

For a 70 lb bow with 80% let-off: Holding weight = 70 × 0.20 = 14 lbs.

The cam profile determines the shape of the force-draw curve. Our model uses a piecewise function:

  0–15% draw: Linear ramp to peak (F = d / 0.15)
  15–40% draw: Peak plateau (F = 1.0)
  40–70% draw: Let-off slope (F drops from 1.0 toward valley)
  70–85% draw: Valley (F ≈ 0.25–0.40)
  85–100% draw: Wall (slight increase, hard stop)

Real cam systems (single, dual, hybrid, binary) produce slightly different curves, but all share these basic regions. The "wall" is the draw stop — a mechanical limit that prevents over-drawing.

Key insight: Despite holding only 14 lbs at full draw, the stored energy is determined by the full curve — the area under the peak/plateau region dominates. This is why compounds are so efficient: maximum energy storage with comfortable holding.`,

    regular: `If you've ever held a compound bow at full draw, you know it suddenly gets much easier to hold once you're all the way back. That's "let-off."

A 70 lb bow with 80% let-off means:
• You pull through 70 lbs of peak weight during the draw
• But at full draw, you're only holding 14 lbs
• This lets you aim comfortably without shaking

The "cam" is the wheel-shaped device at each end of the bow. As you draw, the cam rotates and changes the mechanical advantage. Think of it like a bicycle gear that shifts during your draw:
• Early draw: hard gear (building up energy fast)
• Full draw: easy gear (comfortable to hold)

The "wall" is the hard stop you feel at full draw — it's a physical stop on the cam that prevents you from pulling further. A solid wall helps with consistent shooting.

Even though you're only holding 14 lbs, the bow still stored 70+ ft-lbs of energy during the draw. All that energy goes into the arrow when you release.`,
  },

  {
    id: "brace-height",
    title: "Brace Height",
    category: "Bow Mechanics",
    engineer: `Brace height is the perpendicular distance from the string at rest to the deepest part of the grip (pivot point). It determines:

1. Power stroke length: PS = Draw Length − Brace Height
   Lower brace height = longer power stroke = more stored energy = higher arrow speed.

2. Speed effect: Empirically, each 1" decrease in brace height adds approximately 7–10 fps. We model this as:
   Δv ≈ 8.5 fps/inch × (Reference_BH − Actual_BH)
   Reference brace height is 7.0" for compounds.

3. Forgiveness tradeoff: Lower brace height means the arrow stays on the string longer during the power stroke. This amplifies the effect of any torque or form errors at release — the string has more time to push the arrow offline.

4. Vibrating length: Brace height affects the free vibrating span of the string:
   L_vib = 2 × √((L_string/2)² − BH²)
   Higher brace height = shorter vibrating length = higher fundamental frequency.

Typical ranges:
• Compound: 6.0–7.5" (speed bows use 6", forgiving bows use 7"+)
• Recurve: 7.5–9.5" (depends on bow length)
• Longbow: 6.5–8.0"`,

    regular: `Brace height is the distance from the string to the grip when the bow is at rest (not drawn). It's one of the most important measurements on your bow.

Think of it like this: the arrow rides on the string from the moment you release until it leaves. A lower brace height means the arrow stays on the string for a longer "ride" — which means:

• More speed — the string pushes the arrow for a longer distance
• Less forgiveness — any small mistake in your release gets amplified because the string has more time to push the arrow off-course

A higher brace height is the opposite:
• Less speed — shorter push
• More forgiveness — mistakes have less time to affect the arrow

That's why target archers often use a higher brace height (they need consistency) while speed-focused hunters go lower (they want maximum velocity).

Most compound bows are set between 6" and 7.5". Each inch of brace height change is roughly 8-10 fps of arrow speed.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // STRING PHYSICS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "string-vibration",
    title: "String Vibration & Harmonics",
    category: "String Physics",
    engineer: `A bowstring vibrates as a standing wave after release. The fundamental frequency is:

  f₁ = (1 / 2L) × √(T / μ)

Where:
• L = vibrating length (m) — the free span between cam contact points
• T = tension (N) — string tension converted from lbs (×4.44822)
• μ = effective linear mass density (kg/m) — total mass (string + weights) ÷ string length

Higher harmonics: fₙ = n × f₁ for mode n = 1, 2, 3, ... 8

Harmonic amplitudes follow 1/n without weights (each higher mode carries less energy). Weights modify amplitudes through node proximity damping:

  For weight at position p (0–1 along string):
  Node proximity = |sin(n·π·p)|
  Damping factor = 1 − (m_weight / m_total) × node_proximity × 3
  Amplitude_n *= max(0.01, damping_factor)

A weight at position p = 1/(2n) sits at an antinode of mode n and maximally damps it. For example:
• p = 0.25 or 0.75 → antinode of mode 2 (damps 2nd harmonic)
• p = 0.33 or 0.67 → antinode of mode 3 (damps 3rd harmonic)
• p = 0.50 → antinode of all odd modes (damps 1st, 3rd, 5th, 7th)

The damping coefficient is weighted by the mass ratio — heavier weights damp more effectively.`,

    regular: `After you shoot, the bowstring vibrates back and forth — like a guitar string. These vibrations cause:
• Hand shock (that jolt you feel in the grip)
• Noise (the "twang" sound)
• Inconsistent arrow flight (if the arrow is still on the string during vibration)

The string doesn't just vibrate in one simple pattern. It vibrates in multiple "modes" simultaneously:
• Mode 1 (fundamental): The whole string swings back and forth like a jump rope
• Mode 2: The string has a still point in the middle and vibrates in two halves
• Mode 3: Two still points, three vibrating sections
• And so on...

Speed weights work by being placed at specific spots along the string. When a weight sits at the point of maximum movement for a particular mode, it absorbs that mode's energy. That's why:

• Weights at 25% and 75% are popular — they sit at the maximum-movement points of Mode 2, which is usually the biggest troublemaker.
• A weight at 50% (center) affects the fundamental mode most, but also costs the most speed.
• Weights near the cams (0% or 100%) do almost nothing because the string barely moves there.`,
  },

  {
    id: "string-materials",
    title: "String Materials",
    category: "String Physics",
    engineer: `String material properties affect performance through several mechanisms:

Density (g/m per strand): Determines string mass → affects frequency and arrow speed.
  Higher density = heavier string = lower frequency, more speed penalty.

Elastic Modulus (GPa): Resistance to elastic deformation.
  Higher modulus = less stretch = more efficient energy transfer.
  Energy stored in string stretch is not transferred to the arrow.

Stretch % (recoverable elongation under load):
  This is elastic deformation — the string returns to original length when unloaded.
  More stretch = more energy absorbed by the string = less arrow speed.

Creep Rate (%/1000 shots, permanent deformation):
  Creep is permanent elongation — the string gets longer over time.
  Creep increases brace height (string gets longer → limbs relax → brace drops)
  which changes tune and reduces speed.
  Modern HMPE materials (BCY-X, 452X) have near-zero creep.
  Dacron has significant creep — traditional bows must be re-tuned frequently.

Tensile Strength (lbs/strand): Determines strand count requirements.
  Safety factor ≈ 4.5× draw weight. Required strands = (draw_weight × 4.5) / strength_per_strand.

Material comparison:
  BCY-X: Highest density but best modulus/lowest stretch. Premium compound string.
  Fast Flight: Lightest, highest modulus. Maximum speed. Not safe for traditional bows without reinforced limb tips.
  Dacron B-50: High stretch, high creep. Required for older bows — the stretch acts as a shock absorber protecting wooden limbs.
  8125: Budget option, decent performance, moderate creep.`,

    regular: `The material your bowstring is made from matters more than most people think. Here's what to know:

Stretch: When you shoot, the string stretches slightly before it pushes the arrow. Energy that goes into stretching the string is energy that DOESN'T go into the arrow. Less stretch = faster arrow.
• BCY-X: 0.5% stretch (best for speed)
• Dacron: 2.6% stretch (slowest, but safest for old bows)

Creep: Over hundreds of shots, some materials permanently stretch. This means your brace height slowly changes and your bow goes out of tune.
• BCY-X: Almost zero creep (stays consistent)
• Dacron: Noticeable creep (need to re-tune regularly)

Weight: Lighter string = faster arrow. The string has to accelerate along with the arrow, so every grain of string weight costs you speed.

Why not just use the fastest material? Two reasons:
1. Safety: Fast Flight and similar modern materials are very stiff and can damage older bows with wooden or non-reinforced limb tips. Dacron's stretch acts like a shock absorber.
2. Cost and durability: Premium materials cost more and some are less forgiving of serving separation.

For modern compounds: BCY-X or 452X are the go-to choices.
For traditional bows: Dacron B-50 unless your limb tips are reinforced.`,
  },

  {
    id: "speed-weights",
    title: "Speed Weights & Vibration Dampening",
    category: "String Physics",
    engineer: `Speed weights (string silencers, dampeners) serve to absorb vibrational energy from the string after release.

Speed penalty: Each 10 grains of added weight reduces arrow speed by approximately 1.8 fps.
  Δv = −(m_weight_grains / 10) × 1.8 fps

This is an empirical constant derived from the virtual mass relationship — adding mass to the string increases m_virtual, reducing velocity:
  v = √(2·η·E / m_virtual)
  m_virtual = m_arrow + (m_string + m_weights)/3

Vibration reduction effectiveness is modeled as:
  VR = Σ (mass_i / 50) × sin(π × position_i / 100) × 25
  Capped at 95%.

The sin(π·p) factor captures the antinode of the fundamental mode — center placement maximizes fundamental damping. Higher modes have different antinode patterns.

Optimal placement strategies:
• 25%/75% pair: Targets mode 2 (most common hand-shock frequency). Best balance of vibration reduction and speed retention.
• 33%/67% pair: Targets mode 3. Slightly less effective but lower speed penalty (further from center = less string mass contribution).
• 50% single: Maximum fundamental damping but highest speed cost.

Material comparison:
• Brass: 8.5 g/cc density. Affordable, easy to tune, slightly larger for same mass.
• Tungsten: 19.3 g/cc density. Compact, less wind drag, more expensive. Same mass in smaller package = less aerodynamic disruption.`,

    regular: `Speed weights are small metal pieces clamped onto your bowstring. They seem counterintuitive — adding weight to your string makes your arrow slower, so why do it?

The answer is vibration. After you release an arrow, the string vibrates violently. This causes:
• Hand shock — that unpleasant jolt through the bow to your hand
• Noise — a loud "twang" that can spook game
• Wear — excessive vibration damages your bow over time

Speed weights absorb this vibration energy. Think of them like shock absorbers on a car — they sacrifice a little performance for a much smoother ride.

The tradeoff: Every 10 grains of weight costs you about 1.8 fps of arrow speed. Two 15-grain weights = 30 grains = about 5.4 fps lost.

Where to put them:
• 25% and 75% from the cam — This is the most popular position. It targets the "second harmonic" which is the main source of hand shock.
• Closer to center = more dampening but more speed loss
• Closer to the cams = less effect (the string barely moves near the cams)

Brass vs. Tungsten:
• Brass is cheaper and works great
• Tungsten is twice as dense, so the same weight is physically smaller — less wind resistance during the shot. It's the premium option.`,
  },

  {
    id: "strand-count",
    title: "Strand Count",
    category: "String Physics",
    engineer: `The number of strands in a bowstring must balance strength, weight, and performance:

Safety requirement: Total string strength must exceed peak draw weight by a factor of ~4.5×.
  Min strands = ceil(Draw Weight × 4.5 / Tensile Strength per strand)

For 70 lb compound with BCY-X (90 lbs/strand): 70 × 4.5 / 90 = 3.5 → 4 strands minimum.
In practice, 20-28 strands are used — the excess provides:
• Durability margin (individual strand failure tolerance)
• Consistent nock fit on the center serving
• Proper cam track engagement

Performance effects:
• More strands → heavier string → lower frequency, more speed loss
• Fewer strands → lighter string → higher frequency, faster but less durable
• String mass scales linearly with strand count: m = density × strands × length

Recommended ranges by bow type:
• Compound: 20-28 strands (24 is most common for modern compounds)
• Recurve <30 lbs: 14 strands; 32-38 lbs: 16; 38+ lbs: 18-20
• Longbow: 12-18 strands (often uses Dacron, needs more strands for equivalent strength)
• Crossbow: 22-32 strands (higher forces require more material)

Nock fit: The center serving diameter (which depends on strand count) must match the arrow nock's throat. Too few strands = nock is loose and inconsistent. Too many = nock is too tight and may not release cleanly.`,

    regular: `Your bowstring is made of many individual strands twisted together — typically 20-28 for a compound bow. The number matters:

More strands = heavier, stronger string
• Pro: More durable, better nock fit, longer lasting
• Con: Heavier string = slightly slower arrow

Fewer strands = lighter, faster string
• Pro: More arrow speed
• Con: Less durable, may not fit nock properly

The simulator recommends a strand count based on your bow type and draw weight. The recommendation ensures:
1. Your string is strong enough (at least 4.5× your draw weight in total strength)
2. The nock fit will be correct for your arrows
3. You're not carrying unnecessary weight

If the simulator shows your strand count in yellow, you're outside the recommended range — either too few (safety concern) or too many (unnecessary weight).

Most compound archers use 24 strands with a modern material like BCY-X. This gives a good balance of speed, durability, and nock fit.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // ARROW DYNAMICS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "arrow-weight",
    title: "Arrow Weight & Components",
    category: "Arrow Dynamics",
    engineer: `Total arrow weight is the sum of all components in grains (1 grain = 0.0648 grams):

  m_total = m_shaft + m_point + m_insert + m_nock + m_fletching + m_wrap

Shaft weight = GPI (grains per inch) × cut length. GPI is published by the manufacturer and varies with spine and material.

Grains-per-pound (GPP) is a key metric: GPP = m_total / Draw Weight.
• Minimum safe: 5 GPP (below this risks dry-fire damage)
• Target/3D: 5-7 GPP (fast, flat trajectory)
• Hunting: 7-10 GPP (balance of speed and penetration)
• Heavy hunting: 10-15 GPP (maximum penetration, momentum-focused)

Arrow speed relationship (from energy conservation):
  v = √(2·η·E_stored / (m_arrow + m_string/3))

Heavier arrows are slower but carry more momentum:
  KE = m·v²/2 → KE scales with v²
  p = m·v → momentum scales linearly with both m and v

For penetration, momentum matters more than KE because the resisting force (friction in tissue/target) is approximately constant, making penetration depth proportional to momentum.`,

    regular: `An arrow is made of several parts, each with its own weight measured in "grains" (a very small unit — there are 7,000 grains in a pound):

• Shaft: The main tube. Heavier shafts are more durable and quieter in flight.
• Point/Insert: The tip. Heavier points improve accuracy and penetration but slow the arrow down.
• Nock: The clip at the back that snaps onto the string. Usually 8-12 grains.
• Fletching: The vanes or feathers that stabilize the arrow. Usually 20-35 grains total.
• Wrap: Optional decorative/protective wrap where the fletching attaches. 5-10 grains.

A typical hunting arrow weighs 350-450 grains. A target arrow might be 280-350 grains.

The big tradeoff is speed vs. hitting power:
• Light arrow = fast, flat trajectory, but less energy on impact
• Heavy arrow = slower, more arc, but hits harder and penetrates deeper

For hunting, most experts recommend at least 7 grains per pound of draw weight. So a 70 lb bow should shoot at least a 490 grain arrow for hunting (though many use lighter for non-dangerous game).`,
  },

  {
    id: "foc",
    title: "FOC (Front of Center)",
    category: "Arrow Dynamics",
    engineer: `FOC quantifies how front-heavy an arrow is:

  FOC% = ((Balance Point / Arrow Length) − 0.5) × 100

Where Balance Point is measured from the nock end. A perfectly balanced arrow has FOC = 0%.

The simulator computes the balance point from component moments measured from the nock:

  Balance = Σ(m_i × d_i) / Σ(m_i)

Where d_i is the distance from nock to each component's center of mass:
• Nock: d = 0 (at nock)
• Fletching: d = fletchingLength/2 (near nock)
• Wrap: d = fletchingLength (just ahead of fletching)
• Shaft: d = shaftLength/2 (center of shaft)
• Point: d = shaftLength (at tip)

FOC ratings:
• <7%: Low — reduced stability, less forgiving
• 7-12%: Optimal for target archery (flat trajectory, minimal wind drift)
• 10-15%: Optimal for hunting (good penetration, stable flight)
• 15-30%: High FOC (excellent penetration, popular in African dangerous game hunting)
• >30%: Extreme (specialized applications, significant trajectory arc)

Physics: Higher FOC moves the aerodynamic center of pressure behind the center of mass, increasing restoring torque during flight. This improves stability but increases drag-induced pitch moment, causing more drop at distance.`,

    regular: `FOC stands for "Front of Center" — it measures how front-heavy your arrow is.

If you balance an arrow on your finger, the balance point is NOT at the center — it's forward of center because the point is heavier than the nock. FOC tells you how far forward that balance point is, as a percentage.

Why it matters:
• More front-heavy (higher FOC) = the arrow flies more stably and penetrates better
• Less front-heavy (lower FOC) = flatter trajectory but less stable in wind

Think of it like a dart — darts are very front-heavy so they fly point-first and stick into the board. An arrow with low FOC is like trying to throw a dart backwards — it wobbles.

Good ranges:
• Target shooting: 7-12% (you want flat trajectory)
• Hunting: 10-15% (you need penetration)
• Dangerous game: 15-30% (maximum penetration is critical)

To increase FOC: add a heavier point, use lighter nocks/vanes, or both.
To decrease FOC: lighter point, heavier vanes.

The simulator calculates FOC from all your arrow components and tells you whether you're in a good range for your application.`,
  },

  {
    id: "spine",
    title: "Arrow Spine & Dynamic Spine",
    category: "Arrow Dynamics",
    engineer: `Static spine is measured by the AMO/ATA standard: hang a 1.94 lb (880g) weight from the center of a 29" shaft span and measure deflection in inches.

  Spine rating = deflection × 1000

So a ".300 spine" shaft deflects 0.300" — lower numbers are stiffer.

Industry standard sizes: 250, 300, 340, 350, 400, 500, 600, 700, 800, 1000.

Dynamic spine is the effective stiffness during the shot, which differs from static spine due to:

1. Shaft length: Each inch shorter than 29" stiffens by ~3-5 spine points.
   Each inch longer weakens by ~3-5 spine points.
   Our model: Δspine = (length − 29) × 4

2. Point weight: Heavier points act as a lever, weakening effective spine.
   Each 25gr over 100gr ≈ +10-15 spine points (weaker).
   Our model: Δspine = ((point − 100) / 25) × 12

3. Cam aggression: Compound cams apply force faster, effectively stiffening the required spine.
   Compound: ×0.95 (stiffer requirement)
   Longbow: ×1.05 (more forgiving)

Spine recommendation from draw weight (compound baseline):
  ≥70 lbs → 300 spine, ≥60 → 340, ≥50 → 400, ≥40 → 500, ≥30 → 600, <30 → 700

Adjusted for draw length (longer draw = more energy = stiffer needed) and bow type (recurve/longbow need weaker spine due to different release mechanics).

Mismatched spine causes the arrow to flex excessively (too weak) or insufficiently (too stiff) during the Archer's Paradox, resulting in erratic flight and poor groups.`,

    regular: `"Spine" is how stiff an arrow shaft is. It's one of the most important things to get right — the wrong spine means inaccurate arrows, no matter how good your shooting form is.

How it's measured: A 29" shaft is supported at both ends, and a weight is hung from the middle. How much it bends determines the spine number. A "300 spine" bends less than a "500 spine" — lower numbers = stiffer.

Why spine matters: When you release a bowstring, it doesn't push the arrow perfectly straight. The arrow actually bends and flexes around the bow (this is called the Archer's Paradox). The right amount of flex allows the arrow to clear the bow cleanly. Too stiff or too weak, and the arrow hits the bow or flies erratically.

What affects the "right" spine:
• Draw weight: More powerful bows need stiffer arrows (lower spine number)
• Arrow length: Shorter arrows act stiffer; longer arrows act weaker
• Point weight: A heavier point makes the arrow act weaker (like adding weight to the end of a diving board)
• Bow type: Compounds need stiffer arrows than recurves at the same draw weight

The simulator shows you:
• Static spine: What the manufacturer rates the shaft
• Dynamic spine: The effective stiffness based on YOUR specific setup
• Recommended spine: What you should be shooting
• Match: Whether your setup is "Matched," "Too stiff," or "Too weak"

If your match says "Too weak" or "Too stiff," try a different shaft or adjust your point weight.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // BALLISTICS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "trajectory",
    title: "Arrow Trajectory & Drag",
    category: "Ballistics",
    engineer: `Arrow trajectory is computed via Euler method numerical integration with timestep dt = 0.0005s:

  At each step:
  speed = √(vx² + vy²)
  F_drag = 0.5 × Cd × ρ × A × speed²
  ax = −F_drag × (vx/speed) / m
  ay = −g − F_drag × (vy/speed) / m

  vx += ax × dt
  vy += ay × dt
  x += vx × dt
  y += vy × dt

Constants:
• Cd = 1.8 (drag coefficient for fletched arrow, empirical range 1.5-2.0)
• ρ = 1.225 kg/m³ (air density at sea level, 15°C)
• A = π × (diameter/2)² (frontal cross-section area)
• g = 9.80665 m/s²

The arrow is launched horizontally (0° elevation) for simplicity — this models a "level shot" and drop values represent the arrow falling below the aim point.

Wind drift is modeled as a constant lateral acceleration:
  F_wind = 0.5 × Cd × ρ × A × v_wind² × 0.3
  a_lateral = F_wind / m
  drift = 0.5 × a_lateral × t²

The 0.3 coefficient accounts for the arrow's aerodynamic shape (elongated body has lower lateral Cd than frontal Cd).

Trajectory data is sampled at 10-yard intervals and includes: drop (inches), velocity (fps), KE (ft-lbs), momentum (slug·ft/s), and flight time (seconds).`,

    regular: `When an arrow flies through the air, three things happen:
1. Gravity pulls it down (making it arc)
2. Air resistance slows it down
3. Wind pushes it sideways

The simulator calculates all of this to show you:
• How much your arrow drops at different distances (e.g., at 40 yards, a typical arrow drops about 14-18 inches below where you aimed)
• How fast your arrow is going at each distance
• How much energy it has left at each distance
• How much wind will push it off course

Why does this matter?
• If you know your arrow drops 15" at 40 yards, you know how high to aim (or what sight pin to use)
• If your arrow only has 35 ft-lbs of energy at 60 yards, it might not have enough punch for ethical hunting
• If 10 mph wind drifts your arrow 6" at 30 yards, you need to aim 6" into the wind

The "effective range" shown in the simulator is where your arrow still has at least 40 ft-lbs of kinetic energy — generally considered the minimum for deer-sized game. The "max range" is where it drops below 25 ft-lbs.

Faster, heavier arrows resist wind better and retain energy longer — but they also have more arc. It's always a tradeoff.`,
  },

  {
    id: "ke-momentum",
    title: "Kinetic Energy & Momentum",
    category: "Ballistics",
    engineer: `Two key terminal performance metrics in archery:

Kinetic Energy:
  KE = (m × v²) / 450,800  [ft-lbs]

Where m is in grains, v in fps. The 450,800 constant converts grain·fps² to ft-lbs:
  450,800 = 7000 grains/lb × 2 × 32.174 ft/s² (gravity)

Momentum:
  p = (m × v) / 225,400  [slug·ft/s]

The 225,400 constant converts grain·fps to slug·ft/s.

KE vs. Momentum for penetration:
KE determines the total work an arrow can do: KE = F × d (force × distance).
However, penetration in biological tissue is better predicted by momentum because:
• Tissue resistance is approximately constant force (friction/compression)
• Penetration depth d = p / F_resist (momentum ÷ resisting force)
• A slow heavy arrow and fast light arrow with equal KE will NOT penetrate equally — the heavy arrow has more momentum and penetrates deeper.

Example at equal KE (65 ft-lbs):
• 300 gr @ 312 fps: KE=65, p=0.415 slug·ft/s
• 500 gr @ 242 fps: KE=65, p=0.537 slug·ft/s
The 500 gr arrow has 29% more momentum and will penetrate significantly deeper.

Minimum recommendations (North American game):
• Small game: 25 ft-lbs KE
• Deer/antelope: 40-45 ft-lbs KE, 0.35+ slug·ft/s momentum
• Elk/moose: 50-65 ft-lbs KE, 0.45+ slug·ft/s momentum
• Dangerous game: 65+ ft-lbs KE, 0.60+ slug·ft/s momentum`,

    regular: `When your arrow hits a target, two things determine how effective it is:

Kinetic Energy (KE) — Think of this as "total energy available." It's how much work the arrow can do. Higher KE = more power.

Momentum — Think of this as "pushing power." It's how hard the arrow pushes through the target. Higher momentum = deeper penetration.

Here's the key insight: KE and momentum favor different arrow setups.

A light, fast arrow has high KE but relatively low momentum.
A heavy, slow arrow might have the same KE but significantly more momentum.

For target archery: KE is what matters — you just need to stick in the target.
For hunting: Momentum is what matters — you need the arrow to penetrate deep enough to reach vital organs.

That's why many experienced hunters choose heavier arrows even though they're slower — the extra momentum means better penetration, especially on larger game.

Minimum energy guidelines:
• Deer: ~40-45 ft-lbs (most setups easily exceed this)
• Elk/moose: ~50-65 ft-lbs
• At longer distances, energy drops due to air resistance — the simulator shows you exactly how much energy you have left at each distance.`,
  },

  // ═══════════════════════════════════════════════════════════════
  // TUNING CONCEPTS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "balance-point",
    title: "String Balance Point",
    category: "Tuning Concepts",
    engineer: `The string balance point is the weighted centroid of all attached weights:

  BP = Σ(m_i × p_i) / Σ(m_i)

Where p_i is the position (0-100%) and m_i is the mass of weight i. With no weights, BP defaults to 50% (center).

An unbalanced string (BP ≠ 50%) causes:
• Asymmetric vibration patterns after release
• Uneven cam timing (compound bows)
• Nock travel deviation (the nock doesn't travel in a straight line)

Tolerance: BP within 47-53% is generally considered acceptable ("CENTERED" in the UI). Deviations beyond this threshold are flagged as "CAM-BIASED" (<50%) or "NOCK-BIASED" (>50%).

For compound bows, slight asymmetry may be intentional — some archers place weights asymmetrically to fine-tune cam timing or to compensate for cable guard deflection.`,

    regular: `When you put speed weights on your bowstring, you want them balanced — equal weight on both sides of the center.

If your weights are unbalanced, the string vibrates unevenly after the shot, which can:
• Make your bow louder on one side
• Cause inconsistent arrow flight
• Put uneven stress on your cams

The simulator shows your balance point as a percentage. 50% means perfectly centered. The further from 50%, the more unbalanced your setup is.

A common balanced setup: Two identical weights at 25% and 75% — perfectly mirrored, perfectly balanced.

If you see "CAM-BIASED" or "NOCK-BIASED" in the stats, try adjusting your weights to bring the balance closer to 50%.`,
  },

  {
    id: "speed-vs-silence",
    title: "Speed vs. Silence Tradeoff",
    category: "Tuning Concepts",
    engineer: `The fundamental optimization problem in bowstring setup is:

  Maximize: Vibration Reduction (noise, hand shock)
  Subject to: Speed Penalty ≤ acceptable threshold

Each added weight provides diminishing returns on vibration reduction while linearly increasing speed penalty:

  Speed cost: Δv = −1.8 × (m_total_grains / 10) fps [linear]
  Vibe reduction: VR = Σ sin(π·p_i) × (m_i/50) × 25 [saturates at 95%]

Optimal strategy depends on use case:
• 3D/target: Minimize added weight. Speed matters, noise less so. 0-10 grains total.
• Hunting: 15-30 grains typical. The 5-8 fps loss is acceptable for significantly reduced noise.
• Comfort: 30-50 grains. Prioritize hand shock reduction, speed secondary.

The Pareto frontier of this optimization typically shows:
• First 15 grains: Large vibration improvement, small speed cost
• 15-30 grains: Moderate improvement, moderate cost
• 30+ grains: Diminishing returns on vibration, continued linear speed cost`,

    regular: `Every archer faces the same question: "How much speed am I willing to give up for a quieter, smoother-shooting bow?"

Here's the tradeoff:
• No weights: Maximum speed, but the bow vibrates hard and is loud
• Light weights (10-15 gr): Small speed loss (~2-3 fps), noticeable vibration improvement
• Medium weights (20-30 gr): Moderate speed loss (~4-5 fps), significant improvement
• Heavy weights (40+ gr): Larger speed loss (~7+ fps), but the bow is whisper-quiet

For most hunters, 20-30 grains of total weight is the sweet spot. You lose 4-5 fps (which makes virtually no difference on game) but gain a much quieter, more pleasant-shooting bow. A quiet bow is important for hunting because:
• Game animals react to sound — a quieter bow means less "string jumping" (the animal ducking at the sound before the arrow arrives)
• Less hand shock means more comfortable practice sessions
• Less vibration means longer bow and accessory life

For target archers, speed matters more and noise matters less, so lighter weights (or none) are common.`,
  },
];
