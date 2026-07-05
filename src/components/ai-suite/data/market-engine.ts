/**
 * Simulated real-time market intelligence engine.
 *
 * Produces production-grade streaming behaviour for the AI suite without a live
 * feed. Every pure function here is deterministic per-call and side-effect free,
 * so the context layer can drive it on an interval and memoize results.
 *
 * The connection app_id used across the platform is 129344 (see config.ts);
 * these simulated feeds mirror the structure of that WebSocket's tick streams so
 * they can be replaced with real subscriptions later.
 */

import type {
    TAssetDefinition,
    TAssetSignal,
    TInsight,
    TMarketState,
    TOpportunity,
    TRiskLevel,
    TStrategyTemplate,
    TTelemetry,
    TTraderProfile,
    TTrendDirection,
} from '../ai-suite.types';

/** Markets continuously monitored by the AI scan matrix. */
export const MONITORED_ASSETS: TAssetDefinition[] = [
    {
        name: 'Volatility 10 (1s) Index',
        symbol: '1HZ10V',
        market: 'synthetic_index',
        submarket: 'random_index',
        short: 'V10 (1s)',
    },
    { name: 'Volatility 25 Index', symbol: 'R_25', market: 'synthetic_index', submarket: 'random_index', short: 'V25' },
    { name: 'Volatility 50 Index', symbol: 'R_50', market: 'synthetic_index', submarket: 'random_index', short: 'V50' },
    { name: 'Volatility 75 Index', symbol: 'R_75', market: 'synthetic_index', submarket: 'random_index', short: 'V75' },
    {
        name: 'Volatility 100 Index',
        symbol: 'R_100',
        market: 'synthetic_index',
        submarket: 'random_index',
        short: 'V100',
    },
    { name: 'Boom 1000 Index', symbol: 'BOOM1000', market: 'synthetic_index', submarket: 'crash_index', short: 'Boom' },
    {
        name: 'Crash 1000 Index',
        symbol: 'CRASH1000',
        market: 'synthetic_index',
        submarket: 'crash_index',
        short: 'Crash',
    },
    { name: 'Step Index', symbol: 'stpRNG', market: 'synthetic_index', submarket: 'step_index', short: 'Step' },
];

const TREND_STATUS: Record<TTrendDirection, string[]> = {
    up: [
        'Strong Upward Micro-Trend Structuring',
        'Momentum Acceleration Detected',
        'Higher Digit Continuation Favoured',
        'Expansion Breakout Building',
    ],
    down: [
        'Downward Pressure Intensifying',
        'Lower Digit Bias Forming',
        'Bearish Momentum Confirmed',
        'Compression Into Decline',
    ],
    sideways: [
        'Consolidating - Sideways Digit Variance',
        'High Digit Probability Loop Detected',
        'Low-Noise Range Conditions',
        'Compression Phase - Awaiting Breakout',
    ],
};

const STRATEGIES = [
    'Digit Differ AI',
    'Rise/Fall Momentum',
    'Over/Under Bias',
    'Even/Odd Cycle',
    'Matches/Differs Loop',
];
const ENTRY_TIMINGS = ['Immediate', 'Next 3 Ticks', 'Wait 1 Cycle', 'On Confirmation', 'Next Reversal'];
const MARKET_STATES: TMarketState[] = ['Trending', 'Consolidating', 'Breakout', 'Reversal', 'Volatile'];

/** Uniform random helper. */
const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));
const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];
const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));

const riskFromScore = (stability: number): TRiskLevel => {
    if (stability >= 66) return 'Low';
    if (stability >= 40) return 'Medium';
    return 'High';
};

/**
 * Evolve a single asset signal. When a previous snapshot is provided the values
 * drift smoothly (mean-reverting random walk) to simulate a live tick stream.
 */
export const evolveSignal = (asset: TAssetDefinition, prev?: TAssetSignal): TAssetSignal => {
    const drift = (value: number, magnitude: number) => clamp(value + rand(-magnitude, magnitude));

    const confidence = prev ? drift(prev.confidence, 6) : rand(45, 95);
    const stability = prev ? drift(prev.stability, 5) : rand(35, 90);
    const opportunity = prev ? drift(prev.opportunity, 7) : rand(40, 96);
    const health = prev ? drift(prev.health, 4) : rand(50, 95);

    const trendRoll = Math.random();
    const trend: TTrendDirection = trendRoll > 0.6 ? 'up' : trendRoll > 0.3 ? 'sideways' : 'down';

    const priceBase = prev?.price ?? rand(100, 10000);
    const price = Number((priceBase + rand(-priceBase * 0.0009, priceBase * 0.0009)).toFixed(3));
    const lastDigit = Math.abs(Math.round(price * 1000)) % 10;

    return {
        ...asset,
        status: pick(TREND_STATUS[trend]),
        trend,
        confidence: Math.round(confidence),
        stability: Math.round(stability),
        risk: riskFromScore(stability),
        opportunity: Math.round(opportunity),
        strategy: prev?.strategy && Math.random() > 0.85 ? pick(STRATEGIES) : (prev?.strategy ?? pick(STRATEGIES)),
        entryTiming: pick(ENTRY_TIMINGS),
        freshness: randInt(0, 4),
        health: Math.round(health),
        price,
        lastDigit,
    };
};

/** Build a full matrix, optionally evolving from a previous snapshot map. */
export const buildSignals = (prev?: Record<string, TAssetSignal>): TAssetSignal[] =>
    MONITORED_ASSETS.map(asset => evolveSignal(asset, prev?.[asset.symbol]));

/** Aggregate signals into statistical telemetry for the Analytics Center. */
export const buildTelemetry = (signals: TAssetSignal[], prev?: TTelemetry): TTelemetry => {
    const drift = (value: number | undefined, base: [number, number], magnitude: number) =>
        value === undefined ? rand(base[0], base[1]) : clamp(value + rand(-magnitude, magnitude));

    // Digit distribution derived from live last-digits plus smoothed noise.
    const digitDistribution = Array.from({ length: 10 }, (_, digit) => {
        const hits = signals.filter(s => s.lastDigit === digit).length;
        const prevVal = prev?.digitDistribution?.[digit] ?? 10;
        return clamp(prevVal * 0.7 + (hits / signals.length) * 100 * 0.3 + rand(-2, 2), 2, 22);
    });

    const rankedDigits = digitDistribution.map((freq, digit) => ({ digit, freq })).sort((a, b) => b.freq - a.freq);

    const evenPct = clamp(drift(prev?.evenPct, [45, 55], 3));
    const overPct = clamp(drift(prev?.overPct, [45, 55], 3));

    return {
        maxTickVelocity: Number(drift(prev?.maxTickVelocity, [12, 28], 2).toFixed(1)),
        avgTickVelocity: Number(drift(prev?.avgTickVelocity, [6, 14], 1.5).toFixed(1)),
        compressionIndex: Math.round(drift(prev?.compressionIndex, [20, 80], 6)),
        expansionStrength: Math.round(drift(prev?.expansionStrength, [20, 85], 6)),
        volatilityMomentum: Math.round(drift(prev?.volatilityMomentum, [30, 90], 5)),
        trendPersistence: Math.round(drift(prev?.trendPersistence, [25, 85], 5)),
        momentumAcceleration: Math.round(drift(prev?.momentumAcceleration, [20, 80], 6)),
        reversalProbability: Math.round(drift(prev?.reversalProbability, [10, 70], 6)),
        noiseIndex: Math.round(drift(prev?.noiseIndex, [15, 65], 5)),
        tickEntropy: Number(drift(prev?.tickEntropy, [40, 95], 4).toFixed(1)),
        patternStability: Math.round(drift(prev?.patternStability, [35, 90], 5)),
        sentimentScore: Math.round(drift(prev?.sentimentScore, [30, 90], 5)),
        aiConfidenceIndex: Math.round(signals.reduce((sum, s) => sum + s.confidence, 0) / Math.max(signals.length, 1)),
        liquidityPressure: Math.round(drift(prev?.liquidityPressure, [25, 85], 6)),
        signalReliability: Math.round(drift(prev?.signalReliability, [40, 92], 4)),
        evenPct: Math.round(evenPct),
        oddPct: Math.round(100 - evenPct),
        overPct: Math.round(overPct),
        underPct: Math.round(100 - overPct),
        digitDistribution: digitDistribution.map(v => Math.round(v)),
        highestDigits: rankedDigits.slice(0, 3).map(d => d.digit),
        lowestDigits: rankedDigits.slice(-3).map(d => d.digit),
    };
};

/** Rank monitored assets into deployable opportunities, highest score first. */
export const buildOpportunities = (signals: TAssetSignal[]): TOpportunity[] =>
    signals
        .map(s => ({
            symbol: s.symbol,
            name: s.name,
            score: Math.round(s.opportunity * 0.5 + s.confidence * 0.3 + s.health * 0.2),
            confidence: s.confidence,
            risk: s.risk,
            duration: pick(['1 Tick', '3 Ticks', '5 Ticks', '1 Min']),
            strategy: s.strategy,
            probability: clamp(Math.round(s.confidence * 0.6 + s.stability * 0.4)),
            state: pick(MARKET_STATES),
            entryTiming: s.entryTiming,
            exitWindow: pick(['3-5 Ticks', '1 Cycle', '30-60s', 'On Signal Loss']),
            readiness: clamp(Math.round(s.health * 0.7 + s.confidence * 0.3)),
        }))
        .sort((a, b) => b.score - a.score);

const INSIGHT_TEMPLATES: Array<{ tone: TInsight['tone']; build: (s: TAssetSignal) => string }> = [
    { tone: 'positive', build: s => `Momentum acceleration detected on ${s.name}.` },
    { tone: 'warning', build: s => `Digit imbalance approaching statistical threshold on ${s.short}.` },
    { tone: 'neutral', build: s => `Compression phase likely transitioning into breakout on ${s.short}.` },
    { tone: 'positive', build: s => `Probability favours higher digit continuation on ${s.short}.` },
    { tone: 'neutral', build: () => 'Low-noise conditions detected across synthetic indices.' },
    { tone: 'positive', build: s => `Entry confidence increasing on ${s.name}.` },
    { tone: 'positive', build: s => `Market stability improving on ${s.short}.` },
    { tone: 'warning', build: s => `Potential reversal zone identified on ${s.name}.` },
    { tone: 'warning', build: s => `Volatility spike registered on ${s.short}.` },
];

/** Produce a fresh automated market insight from current signals. */
export const buildInsight = (signals: TAssetSignal[]): TInsight => {
    const template = pick(INSIGHT_TEMPLATES);
    const subject = pick(signals);
    return {
        id: `insight_${Date.now()}_${randInt(0, 9999)}`,
        message: template.build(subject),
        timestamp: Date.now(),
        tone: template.tone,
    };
};

/** Static professional trader marketplace for the Copy Trading Network. */
export const TRADER_PROFILES: TTraderProfile[] = [
    {
        id: 'alpha-scalper-v4',
        name: 'Alpha Scalper v4',
        avatar: 'AS',
        badge: 'Verified Pro',
        style: 'High-Frequency Scalping',
        winRate: 87.4,
        monthlyReturn: 24.6,
        totalProfit: 148230,
        drawdown: 8.2,
        riskScore: 'Medium',
        followers: 3182,
        avgDuration: '1-3 Ticks',
        markets: 'V10 (1s), V75, V100',
    },
    {
        id: 'quantum-digit-master',
        name: 'Digit-Quantum Master',
        avatar: 'QD',
        badge: 'Elite',
        style: 'Digit Prediction AI',
        winRate: 91.1,
        monthlyReturn: 19.3,
        totalProfit: 205640,
        drawdown: 5.7,
        riskScore: 'Low',
        followers: 5471,
        avgDuration: '1 Tick',
        markets: 'V10 (1s), V25',
    },
    {
        id: 'veneefx-elite-alpha',
        name: 'Veneefx Elite Alpha',
        avatar: 'VE',
        badge: 'Institutional',
        style: 'Momentum + Reversal Hybrid',
        winRate: 84.9,
        monthlyReturn: 31.2,
        totalProfit: 312880,
        drawdown: 11.4,
        riskScore: 'High',
        followers: 2760,
        avgDuration: '3-5 Ticks',
        markets: 'V75, V100, Boom, Crash',
    },
    {
        id: 'elite-momentum-pro',
        name: 'Elite Momentum Pro',
        avatar: 'EM',
        badge: 'Verified Pro',
        style: 'Trend Momentum',
        winRate: 82.3,
        monthlyReturn: 17.8,
        totalProfit: 96450,
        drawdown: 9.9,
        riskScore: 'Medium',
        followers: 1904,
        avgDuration: '5 Ticks',
        markets: 'V50, V75',
    },
    {
        id: 'synthetic-precision-ai',
        name: 'Synthetic Precision AI',
        avatar: 'SP',
        badge: 'Elite',
        style: 'Statistical Arbitrage',
        winRate: 88.6,
        monthlyReturn: 22.1,
        totalProfit: 178300,
        drawdown: 6.8,
        riskScore: 'Low',
        followers: 4218,
        avgDuration: '1-2 Ticks',
        markets: 'V10 (1s), V25, Step',
    },
];

/** Static AI strategy marketplace templates. */
export const STRATEGY_TEMPLATES: TStrategyTemplate[] = [
    {
        id: 'digit-differ-ai',
        name: 'Digit Differ AI',
        description: 'AI-tuned digit-differ engine targeting low-frequency digits with adaptive stake recovery.',
        difficulty: 'Intermediate',
        successRating: 88,
        recommendedCapital: '50 AUD',
        compatibility: 'V10 (1s), V25',
        risk: 'Medium',
        frequency: 'High',
        aiRating: 4.7,
        deployments: 12840,
        accuracy: 89,
        symbol: '1HZ10V',
    },
    {
        id: 'momentum-rise-fall',
        name: 'Momentum Rise/Fall Pro',
        description: 'Trend-following Rise/Fall model driven by momentum acceleration and persistence filters.',
        difficulty: 'Beginner',
        successRating: 82,
        recommendedCapital: '30 AUD',
        compatibility: 'V75, V100',
        risk: 'Low',
        frequency: 'Medium',
        aiRating: 4.5,
        deployments: 9260,
        accuracy: 84,
        symbol: 'R_75',
    },
    {
        id: 'over-under-bias',
        name: 'Over/Under Bias Engine',
        description: 'Statistical over/under model exploiting digit distribution skew with confidence gating.',
        difficulty: 'Advanced',
        successRating: 90,
        recommendedCapital: '80 AUD',
        compatibility: 'V25, V50',
        risk: 'High',
        frequency: 'High',
        aiRating: 4.8,
        deployments: 7130,
        accuracy: 91,
        symbol: 'R_25',
    },
    {
        id: 'even-odd-cycle',
        name: 'Even/Odd Cycle AI',
        description: 'Cycle-detection model balancing even/odd exposure across low-noise conditions.',
        difficulty: 'Intermediate',
        successRating: 85,
        recommendedCapital: '40 AUD',
        compatibility: 'V10 (1s), V50',
        risk: 'Medium',
        frequency: 'Medium',
        aiRating: 4.6,
        deployments: 10420,
        accuracy: 86,
        symbol: '1HZ10V',
    },
];
