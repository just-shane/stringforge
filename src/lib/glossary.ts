// ─── Glossary & Educational Content ────────────────────────────

export interface GlossaryTerm {
  term: string;
  short: string; // one-line definition
  detailed: string; // full explanation
  category: "bow" | "string" | "arrow" | "tuning" | "physics";
  related: string[]; // related term IDs
}

export const GLOSSARY: GlossaryTerm[] = [
  // ─── Bow Terms ──────────────────────────────────────────────
  {
    term: "Axle-to-Axle (ATA)",
    short: "Distance between the two axle pins on a compound bow",
    detailed: "Measured from the center of one cam axle to the center of the other. Shorter ATA bows (28-32\") are maneuverable in blinds/tree stands. Longer ATA (34-38\") gives more stability and forgiveness for target shooting.",
    category: "bow",
    related: ["Brace Height", "Draw Length"],
  },
  {
    term: "Brace Height",
    short: "Distance from the grip pivot point to the string at rest",
    detailed: "Measured from the deepest part of the grip to the bowstring when the bow is strung but not drawn. Lower brace heights (5-6\") mean longer power strokes and more speed, but less forgiveness — the arrow stays on the string longer, amplifying form errors. Higher brace heights (7-8\") sacrifice speed for forgiveness. Each inch of brace height ≈ 8-10 fps difference.",
    category: "bow",
    related: ["Power Stroke", "IBO Speed"],
  },
  {
    term: "Cam",
    short: "The eccentric wheel(s) on a compound bow that provide mechanical advantage",
    detailed: "Cams are the rotating modules at the tip of compound bow limbs. They convert the linear draw motion into stored energy through their non-circular (eccentric) shape. Types: Single cam — one cam + one idler wheel, smoother but may have nock travel. Binary cam — two slaved cams, reduced nock travel. Hybrid cam — control cable connects cams differently for timing. The cam profile determines the force-draw curve shape.",
    category: "bow",
    related: ["Let-Off", "Draw Cycle", "Force-Draw Curve"],
  },
  {
    term: "Draw Cycle",
    short: "The feel and force profile experienced while pulling the bowstring back",
    detailed: "The complete force experience from brace to full draw. Compounds have a characteristic hump (peak weight) followed by a valley and wall (let-off). Recurves and longbows increase force continuously. A smooth draw cycle has a gradual peak and comfortable valley. An aggressive cycle has a sudden peak but can store more energy. Draw cycle quality is subjective — target archers prefer smooth, hunters often want speed (aggressive).",
    category: "bow",
    related: ["Force-Draw Curve", "Let-Off", "Valley"],
  },
  {
    term: "Draw Length",
    short: "How far back you pull the bowstring, measured in inches",
    detailed: "Your personal draw length is determined by your arm span: (arm span ÷ 2.5). Measured from the nock point to the deepest part of the grip, plus 1.75\" (AMO standard). Critical to set correctly — too short loses energy, too long causes poor form and injury risk. Each inch of draw length ≈ 10 fps and ~2.5 lbs effective draw weight difference.",
    category: "bow",
    related: ["Draw Weight", "Power Stroke"],
  },
  {
    term: "Draw Weight",
    short: "Peak force required to draw the bow, measured in pounds (lbs)",
    detailed: "For compounds, this is the peak weight — the highest force during the draw cycle, which occurs at ~40% of the draw. The holding weight at full draw is much lower due to let-off. For recurves and longbows, draw weight is measured at 28\" draw length — if you draw further, the weight increases. Most hunting compounds are set at 60-70 lbs. Target recurves are typically 30-45 lbs.",
    category: "bow",
    related: ["Let-Off", "Holding Weight", "IBO Speed"],
  },
  {
    term: "IBO Speed",
    short: "Standardized speed rating for compound bows (International Bowhunting Organization)",
    detailed: "Measured under specific conditions: 70 lbs draw weight, 30\" draw length, 350 grain arrow (5 grains per pound). Real-world speeds are typically 20-40 fps slower than IBO ratings due to heavier arrows, shorter draws, accessories, and string weight. A bow rated at 340 IBO might shoot 300 fps with a hunting setup. Useful for comparing bows but not for predicting actual performance.",
    category: "bow",
    related: ["Draw Weight", "Draw Length", "Arrow Weight"],
  },
  {
    term: "Let-Off",
    short: "Percentage of peak weight reduction at full draw on a compound bow",
    detailed: "At full draw, compound cams rotate past center, dramatically reducing the force required to hold. 80% let-off on a 70 lb bow means you hold only 14 lbs at full draw. Modern compounds offer 75-90% let-off. Higher let-off = easier to hold steady = better aim, but slightly less stored energy. Legal maximum for most hunting organizations is 80%. Target bows may go to 90%.",
    category: "bow",
    related: ["Cam", "Holding Weight", "Valley"],
  },
  {
    term: "Power Stroke",
    short: "Effective distance the bowstring pushes the arrow (draw length minus brace height)",
    detailed: "The arrow is only accelerated during the power stroke — from brace height to the nock leaving the string. A 30\" draw with 7\" brace height has a 23\" power stroke. Longer power strokes = more time to accelerate = more speed. This is why low brace height bows are faster. Power stroke × average force = stored energy.",
    category: "bow",
    related: ["Brace Height", "Draw Length", "Stored Energy"],
  },

  // ─── String Terms ──────────────────────────────────────────
  {
    term: "Strand Count",
    short: "Number of individual fiber strands twisted together to form the bowstring",
    detailed: "More strands = stronger and heavier string. Typical compounds use 20-28 strands. The strand count must provide at least 4-5× the bow's draw weight in total tensile strength (safety factor). Higher strand counts increase string mass, which reduces speed (~1.8 fps per 10 grains). Lower counts are lighter/faster but less durable and have more serving wear.",
    category: "string",
    related: ["String Material", "Speed Penalty"],
  },
  {
    term: "String Material",
    short: "The fiber used to make bowstring strands (HMPE, Vectran, Dacron, etc.)",
    detailed: "Modern strings use HMPE (High Modulus Polyethylene) like BCY-X, 452X, or Dyneema. Key properties: stretch (lower = more consistent), creep (permanent elongation over time), density (affects speed), and tensile strength. BCY-X: lowest creep, best performance. Dacron B-50: high stretch, safe for older bows. Fast Flight: ultra-low stretch, high speed but not for all bows.",
    category: "string",
    related: ["Strand Count", "Creep", "Stretch"],
  },
  {
    term: "Creep",
    short: "Permanent, non-recoverable elongation of string material over time",
    detailed: "Measured as % per 1000 shots. BCY-X has ~0.01% creep (excellent). Dacron has ~0.10% (high). Creep causes the string to lengthen, changing brace height, cam timing, and peep rotation. High-creep materials need more frequent tuning. Modern HMPE materials have virtually eliminated creep as a concern for competitive archers.",
    category: "string",
    related: ["String Material", "Stretch", "Brace Height"],
  },
  {
    term: "Stretch",
    short: "Recoverable elongation of the bowstring under load",
    detailed: "Unlike creep, stretch is elastic — the string returns to its original length when force is removed. Some stretch is desirable: it cushions the shock on limbs and reduces vibration. Too much stretch wastes energy (lower efficiency). BCY-X: 0.5% stretch. Dacron: 2.6% stretch. The energy stored in string stretch is not transferred to the arrow — it's a loss.",
    category: "string",
    related: ["String Material", "Creep", "Efficiency"],
  },
  {
    term: "Speed Penalty",
    short: "Arrow speed lost per grain of added string/accessory weight",
    detailed: "Approximately 1.8 fps lost per 10 grains of added weight. This includes string weight, peep, D-loop, silencers, and speed weights. A heavier string stores more kinetic energy during the shot — energy that doesn't go to the arrow. Trade-off: heavier strings are more durable and dampen vibration better.",
    category: "string",
    related: ["Strand Count", "Vibration Reduction"],
  },

  // ─── Arrow Terms ──────────────────────────────────────────
  {
    term: "Spine",
    short: "A measurement of arrow shaft stiffness (lower number = stiffer)",
    detailed: "Static spine: deflection in inches × 1000 when a 1.94 lb weight hangs from the center of a 29\" span. A 300-spine shaft deflects 0.300\". Dynamic spine is the effective stiffness during the shot, affected by shaft length, point weight, cam aggression, and draw weight. Correct spine matching is critical — too stiff or too weak causes erratic flight, poor groups, and potentially dangerous conditions.",
    category: "arrow",
    related: ["Dynamic Spine", "Archer's Paradox", "Point Weight"],
  },
  {
    term: "FOC (Front of Center)",
    short: "How far forward the arrow's balance point is from center, as a percentage",
    detailed: "FOC% = ((Balance Point from Nock ÷ Total Length) - 0.5) × 100. Higher FOC = more weight forward = more stable in flight and better penetration. Target: 7-12% FOC. Hunting: 12-15% optimal. Extreme FOC (>20%): maximum penetration builds for dangerous game. FOC is adjusted by changing point weight, shaft weight distribution, or adding weight wraps.",
    category: "arrow",
    related: ["Point Weight", "Balance Point"],
  },
  {
    term: "Kinetic Energy (KE)",
    short: "Energy carried by the arrow in flight, measured in foot-pounds",
    detailed: "KE = (mass × velocity²) ÷ 450,800 (with mass in grains, velocity in fps). Minimum KE guidelines: Small game 25 ft-lbs, medium game (deer) 40 ft-lbs, large game (elk) 50 ft-lbs, dangerous game (cape buffalo) 65+ ft-lbs. KE decreases with distance due to drag. A 400gr arrow at 280 fps = 69.6 ft-lbs.",
    category: "arrow",
    related: ["Momentum", "Arrow Weight", "Velocity"],
  },
  {
    term: "Momentum",
    short: "Arrow mass × velocity — determines penetration ability",
    detailed: "p = (mass × velocity) ÷ 225,400 (slug·ft/s). While KE measures energy, momentum better predicts penetration — heavier, slower arrows often penetrate better than lighter, faster arrows with the same KE. This is because momentum governs how the arrow pushes through resistance. Minimum momentum for whitetail: ~0.4 slug·ft/s. Elk: ~0.5. Grizzly: ~0.65+.",
    category: "arrow",
    related: ["Kinetic Energy", "Arrow Weight"],
  },
  {
    term: "Grains per Inch (GPI)",
    short: "Weight of arrow shaft material per inch of length",
    detailed: "Determines total shaft weight for a given cut length. Range from ~6 gpi (ultralight target) to 12+ gpi (heavy hunting). Total shaft weight = GPI × cut length. Heavier shafts absorb more energy, are quieter, and penetrate better but fly slower. Common hunting shafts are 8-10 gpi.",
    category: "arrow",
    related: ["Arrow Weight", "Spine"],
  },

  // ─── Tuning Terms ──────────────────────────────────────────
  {
    term: "Paper Tune",
    short: "Shooting through paper at close range to diagnose arrow flight issues",
    detailed: "At 4-6 feet, shoot through a sheet of paper stretched on a frame. A perfect bullet hole means the arrow is flying straight. Tear direction tells you what's wrong: Tail left (RH shooter) = spine too stiff or rest too far left. Tail right = spine too weak or rest too far right. Tail high = nock too high. Tail low = nock too low. Compound tears should be clean; recurve arrows show more paradox.",
    category: "tuning",
    related: ["Bare Shaft Tune", "Spine", "Nock Height"],
  },
  {
    term: "Bare Shaft Tune",
    short: "Comparing fletched vs. unfletched arrow groups to diagnose spine issues",
    detailed: "Shoot 3 fletched and 3 bare shaft arrows at 20 yards. If bare shafts hit left of fletched (RH shooter), spine is too stiff. Right of fletched = too weak. The fletching corrects flight errors, so the bare shaft reveals the true arrow behavior. When both groups are together, your spine is matched. More precise than paper tuning for fine-tuning.",
    category: "tuning",
    related: ["Paper Tune", "Spine", "Dynamic Spine"],
  },
  {
    term: "Walk-Back Tune",
    short: "Shooting at increasing distances to detect centershot alignment errors",
    detailed: "Put a vertical tape line on a target. Aim at the top of the line from 20, 30, 40, 50 yards. If arrow impacts drift left or right of the line, your rest centershot is off. Move rest in the direction the arrows drift. When impacts stack vertically (even if not on the line), centershot is correct. This eliminates left-right error that worsens with distance.",
    category: "tuning",
    related: ["Centershot", "Rest Position"],
  },
  {
    term: "Nock Height",
    short: "Vertical position of the arrow nock on the bowstring relative to center",
    detailed: "Measured from the center of the Berger button hole (or arrow shelf) to the nock point. Standard starting position is 1/8\" to 3/16\" above center. Too high: arrow porpoises (vertical oscillation), tail-low tears. Too low: tail-high tears, nock may contact rest. Fine-tune with paper tuning — adjust in 1/32\" increments until you get a bullet hole.",
    category: "tuning",
    related: ["Paper Tune", "D-Loop"],
  },
  {
    term: "Centershot",
    short: "Horizontal alignment of the arrow rest relative to the bow's centerline",
    detailed: "The arrow rest positions the arrow shaft relative to the riser centerline. Most compounds set the arrow tip to be just outside center (1/16\" to 1/8\" from center toward the shooter). Recurve centershot depends on plunger button pressure. Walk-back tuning is the most reliable method to verify centershot alignment.",
    category: "tuning",
    related: ["Walk-Back Tune", "Rest Position"],
  },

  // ─── Physics Terms ──────────────────────────────────────────
  {
    term: "Standing Wave",
    short: "Vibration pattern where certain points (nodes) remain stationary",
    detailed: "When a bowstring vibrates after release, it forms standing wave patterns. The fundamental mode (1st harmonic) has the string moving as a single arc. Higher modes create additional nodes. Frequency of nth mode: f_n = (n / 2L) × √(T/μ) where L is vibrating length, T is tension, μ is linear mass density. String silencers work by adding mass at antinode positions to dampen specific modes.",
    category: "physics",
    related: ["Harmonic", "Fundamental Frequency", "Node"],
  },
  {
    term: "Fundamental Frequency",
    short: "The lowest vibration frequency of the bowstring (1st harmonic)",
    detailed: "f₁ = (1 / 2L) × √(T/μ). Determined by vibrating string length (L), tension (T), and mass per unit length (μ). Higher tension = higher frequency. Heavier strings = lower frequency. Typical compound bowstring fundamentals range from 80-200 Hz. This is the dominant pitch of the \"twang\" sound you hear. All higher harmonics are integer multiples of this frequency.",
    category: "physics",
    related: ["Standing Wave", "Harmonic", "Tension"],
  },
  {
    term: "Harmonic",
    short: "Integer multiples of the fundamental frequency — the overtones of string vibration",
    detailed: "2nd harmonic = 2×f₁, 3rd = 3×f₁, etc. Each harmonic has a different number of nodes and antinodes. The combination of all harmonics determines the string's vibration character and sound. Speed weights placed at antinodes of a specific harmonic will dampen that mode. Proper weight placement can selectively dampen problematic harmonics while preserving the fundamental.",
    category: "physics",
    related: ["Standing Wave", "Fundamental Frequency"],
  },
  {
    term: "Efficiency",
    short: "Percentage of stored energy that transfers to the arrow",
    detailed: "Bow efficiency = Arrow KE ÷ Stored Energy. Energy losses go to: limb kinetic energy (8-12%), string kinetic energy (2-5%), hysteresis/heat (4-6%), vibration (2-4%), sound (1-2%). Compounds are most efficient (~82%) due to rigid risers and cam leverage. Longbows are least efficient (~65%) due to heavy limb tips and no mechanical advantage. Efficiency improves slightly with heavier arrows (more energy captured, less wasted in vibration).",
    category: "physics",
    related: ["Stored Energy", "Kinetic Energy"],
  },
  {
    term: "Archer's Paradox",
    short: "The arrow flexes around the bow riser during launch, then straightens in flight",
    detailed: "When released, the string pushes the arrow forward, but the arrow is offset from the riser centerline. This causes the shaft to flex laterally. A properly spined arrow will flex around the riser and recover to straight flight within a few yards. This is why spine matching is critical — too stiff or too weak means the arrow doesn't recover properly, causing poor flight and grouping.",
    category: "physics",
    related: ["Spine", "Dynamic Spine"],
  },
  {
    term: "Stored Energy",
    short: "Total energy stored in the bow's limbs at full draw, measured in foot-pounds",
    detailed: "Equal to the area under the force-draw curve: E = ∫F(x)dx from brace height to full draw. More stored energy = more potential arrow speed. Compound bows store the most energy relative to draw weight due to their cam profile (the force-draw \"hump\" adds area). A 70 lb compound at 30\" draw stores ~80-90 ft-lbs. After efficiency losses, ~65-75 ft-lbs reaches the arrow.",
    category: "physics",
    related: ["Efficiency", "Force-Draw Curve", "Kinetic Energy"],
  },
];

// Get all terms in a category
export function getTermsByCategory(category: GlossaryTerm["category"]): GlossaryTerm[] {
  return GLOSSARY.filter((t) => t.category === category);
}

// Search terms
export function searchGlossary(query: string): GlossaryTerm[] {
  const q = query.toLowerCase();
  return GLOSSARY.filter(
    (t) =>
      t.term.toLowerCase().includes(q) ||
      t.short.toLowerCase().includes(q) ||
      t.detailed.toLowerCase().includes(q),
  );
}

// ─── Beginner Setup Wizard ─────────────────────────────────────
export interface WizardStep {
  id: string;
  title: string;
  description: string;
}

export interface WizardRecommendation {
  bowType: string;
  drawWeight: number;
  drawLength: number;
  arrowSpine: number;
  arrowWeight: string;
  shaftId: string;
  pointWeight: number;
  explanation: string;
}

export function getWizardRecommendation(
  purpose: "hunting" | "target" | "3d" | "recreational",
  experience: "beginner" | "intermediate" | "advanced",
  armSpan: number, // inches
  gender: "male" | "female" | "other",
  targetAnimal?: "small" | "medium" | "large",
): WizardRecommendation {
  // Estimate draw length from arm span
  const drawLength = Math.round(armSpan / 2.5);

  // Base draw weight by experience & gender
  let drawWeight: number;
  if (experience === "beginner") {
    drawWeight = gender === "female" ? 35 : 45;
  } else if (experience === "intermediate") {
    drawWeight = gender === "female" ? 45 : 55;
  } else {
    drawWeight = gender === "female" ? 55 : 70;
  }

  // Adjust for purpose
  if (purpose === "hunting") {
    drawWeight = Math.max(drawWeight, 45); // minimum for ethical hunting
    if (targetAnimal === "large") drawWeight = Math.max(drawWeight, 55);
  } else if (purpose === "target") {
    drawWeight = Math.min(drawWeight, 55); // don't over-bow for target
  }

  // Determine bow type
  let bowType = "Compound";
  if (purpose === "target" && experience === "advanced") bowType = "Recurve or Compound";
  if (purpose === "recreational" && experience === "beginner") bowType = "Compound (adjustable)";

  // Arrow spine recommendation
  let arrowSpine: number;
  if (drawWeight >= 70) arrowSpine = 300;
  else if (drawWeight >= 60) arrowSpine = 340;
  else if (drawWeight >= 50) arrowSpine = 400;
  else if (drawWeight >= 40) arrowSpine = 500;
  else arrowSpine = 600;

  // Adjust spine for draw length
  if (drawLength > 29) arrowSpine -= Math.round((drawLength - 29) * 15);
  if (drawLength < 27) arrowSpine += Math.round((27 - drawLength) * 15);

  // Snap to standard
  const standards = [250, 300, 340, 350, 400, 500, 600, 700];
  arrowSpine = standards.reduce((prev, curr) =>
    Math.abs(curr - arrowSpine) < Math.abs(prev - arrowSpine) ? curr : prev,
  );

  // Point weight
  let pointWeight = 100;
  if (purpose === "hunting") {
    pointWeight = targetAnimal === "large" ? 175 : 125;
  }

  // Arrow weight descriptor
  let arrowWeight: string;
  if (purpose === "hunting" && targetAnimal === "large") arrowWeight = "Heavy (500+ grains)";
  else if (purpose === "hunting") arrowWeight = "Medium-heavy (400-500 grains)";
  else if (purpose === "target") arrowWeight = "Medium (350-400 grains)";
  else arrowWeight = "Medium (350-450 grains)";

  // Find matching shaft
  const shaftOptions: Record<number, string> = {
    250: "easton-axis-300",
    300: "easton-axis-300",
    340: "easton-fmj-340",
    350: "victory-vap-350",
    400: "easton-axis-400",
    500: "easton-axis-500",
    600: "gt-hunter-500",
    700: "gt-hunter-500",
  };
  const shaftId = shaftOptions[arrowSpine] ?? "easton-axis-400";

  // Build explanation
  const explanation = [
    `Based on your ${armSpan}" arm span, your estimated draw length is ${drawLength}".`,
    `For ${purpose}${targetAnimal ? ` (${targetAnimal} game)` : ""} at the ${experience} level,`,
    `we recommend ${drawWeight} lbs draw weight with a ${bowType}.`,
    `A ${arrowSpine}-spine shaft with ${pointWeight}gr points will be well-matched.`,
    purpose === "hunting"
      ? `This setup delivers enough kinetic energy for ethical ${targetAnimal ?? "medium"} game harvests at typical hunting distances.`
      : `This setup gives good accuracy and consistent arrow flight for ${purpose} shooting.`,
  ].join(" ");

  return {
    bowType,
    drawWeight,
    drawLength,
    arrowSpine,
    arrowWeight,
    shaftId,
    pointWeight,
    explanation,
  };
}
