import { action, makeObservable, observable } from 'mobx';
import {
    TAiNotification,
    TAiStrategy,
    TCopyTrader,
    TMarketAnalytics,
    TMarketAsset,
    TMarketInsight,
    TOpportunity,
    TPerformanceStat,
    TRiskProfile,
    TSentimentItem,
    TSignal,
} from './types';

// ─── Seed Data Helpers ───────────────────────────────────────
const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const BASE_ASSETS: { id: string; name: string; symbol: string }[] = [
    { id: 'vol10', name: 'Volatility 10 (1s)', symbol: 'R_10' },
    { id: 'vol25', name: 'Volatility 25', symbol: 'R_25' },
    { id: 'vol50', name: 'Volatility 50', symbol: 'R_50' },
    { id: 'vol75', name: 'Volatility 75', symbol: 'R_75' },
    { id: 'vol100', name: 'Volatility 100', symbol: 'R_100' },
    { id: 'boom300', name: 'Boom 300', symbol: 'BOOM300' },
    { id: 'crash300', name: 'Crash 300', symbol: 'CRASH300' },
    { id: 'step', name: 'Step Index', symbol: 'STEP_INDEX' },
    { id: 'synfx1', name: 'Synthetic FX EUR/USD', symbol: 'SYNTH_EURUSD' },
];

const STRATEGIES = [
    'Digit Over/Under Loop',
    'Even-Odd Reversal Pattern',
    'Tick Velocity Breakout',
    'Compression Release Play',
    'Momentum Continuation',
    'Digit Bias Exploitation',
    'Entropy Scalp Strategy',
    'Micro-Trend Ride',
];

const ENTRY_TIMINGS = [
    'Immediate — Signal Confirmed',
    'Next 3 ticks — Consolidation Phase',
    'On next digit anomaly',
    'After compression break',
    'On momentum confirmation',
    'Following volatility spike',
];

const STATUSES = [
    'High Digit Probability Loop Detected',
    'Strong Upward Micro-Trend Structuring',
    'Consolidating — Sideways Digit Variance',
    'Momentum Acceleration Confirmed',
    'Reversal Zone Approaching',
    'Entropy Spike — Potential Breakout',
    'Digit Pattern Stabilizing',
    'Low-Noise Precision Window Open',
    'Compression Phase Active',
    'Expansion Breakout Structuring',
];

const INSIGHTS_POOL = [
    { asset: 'Volatility 75', text: 'Momentum acceleration detected on Volatility 75.' },
    { asset: 'Volatility 10 (1s)', text: 'Digit imbalance approaching statistical threshold on V10.' },
    { asset: 'Volatility 50', text: 'Compression phase likely transitioning into breakout on V50.' },
    { asset: 'Volatility 100', text: 'Probability favors higher digit continuation on V100.' },
    { asset: 'Step Index', text: 'Low-noise conditions detected — Step Index precision window open.' },
    { asset: 'Boom 300', text: 'Entry confidence increasing on Boom 300.' },
    { asset: 'Crash 300', text: 'Market stability improving — Crash 300 showing pattern.' },
    { asset: 'Volatility 25', text: 'Potential reversal zone identified on V25.' },
    { asset: 'Volatility 75', text: 'Even-Odd ratio showing significant imbalance — V75.' },
    { asset: 'Volatility 100', text: 'Tick entropy spiking — breakout conditions forming on V100.' },
    { asset: 'Volatility 50', text: 'AI Confidence Index rising — strong signal forming on V50.' },
    { asset: 'Boom 300', text: 'Signal reliability index at 87% — high-quality setup on Boom 300.' },
    { asset: 'Volatility 10 (1s)', text: 'Over/Under consensus shifting — monitor V10 closely.' },
    { asset: 'Step Index', text: 'Max tick velocity recorded — expansion imminent on Step Index.' },
];

const NOTIFICATION_TEMPLATES: { type: TAiNotification['type']; title: string; message: string }[] = [
    {
        type: 'OPPORTUNITY',
        title: '🎯 High Probability Opportunity',
        message: 'New high-confidence setup detected across synthetic indices.',
    },
    {
        type: 'STRATEGY_INJECTED',
        title: '✅ Strategy Deployed',
        message: 'AI strategy parameters successfully injected into Bot Builder.',
    },
    {
        type: 'SYNC_ENABLED',
        title: '🔗 Trade Sync Active',
        message: 'Copy trade synchronization established with selected trader.',
    },
    {
        type: 'VOLATILITY_SPIKE',
        title: '⚡ Volatility Spike',
        message: 'Abnormal volatility detected — monitor positions closely.',
    },
    {
        type: 'MOMENTUM_SHIFT',
        title: '📈 Momentum Shift',
        message: 'Market momentum transitioning — new trend forming.',
    },
    {
        type: 'DIGIT_PATTERN',
        title: '🔢 Digit Pattern Change',
        message: 'Statistical digit pattern shift detected in active markets.',
    },
    {
        type: 'CONFIDENCE_UP',
        title: '📊 AI Confidence Increased',
        message: 'Signal quality improving — confidence index elevated.',
    },
    {
        type: 'SIGNAL_INVALID',
        title: '⚠️ Signal Invalidated',
        message: 'Previous signal conditions no longer valid — awaiting new setup.',
    },
    { type: 'MARKET_COOLING', title: '❄️ Market Cooling', message: 'Activity decreasing — standby mode recommended.' },
    {
        type: 'EXECUTION_READY',
        title: '🚀 Execution Ready',
        message: 'All conditions met — strategy cleared for execution.',
    },
];

function buildAsset(base: { id: string; name: string; symbol: string }): TMarketAsset {
    return {
        ...base,
        status: pick(STATUSES),
        trend: pick(['UP', 'DOWN', 'SIDEWAYS'] as const),
        confidence: randInt(55, 97),
        stability: randInt(40, 95),
        risk: pick(['LOW', 'MEDIUM', 'HIGH'] as const),
        opportunityRating: parseFloat(rand(5.5, 9.8).toFixed(1)),
        strategy: pick(STRATEGIES),
        entryTiming: pick(ENTRY_TIMINGS),
        signalFreshness: pick(['FRESH', 'RECENT', 'AGING'] as const),
        strategyConfidence: randInt(60, 98),
        marketHealth: randInt(45, 99),
        lastUpdated: Date.now(),
    };
}

function buildAnalytics(assetId: string): TMarketAnalytics {
    const digitBias = Array.from({ length: 10 }, () => randInt(5, 25));
    return {
        assetId,
        maxTickVelocity: parseFloat(rand(0.8, 4.2).toFixed(3)),
        avgTickVelocity: parseFloat(rand(0.3, 1.8).toFixed(3)),
        compressionIndex: parseFloat(rand(10, 90).toFixed(1)),
        expansionStrength: parseFloat(rand(20, 95).toFixed(1)),
        volatilityMomentum: parseFloat(rand(15, 88).toFixed(1)),
        trendPersistence: parseFloat(rand(30, 97).toFixed(1)),
        momentumAcceleration: parseFloat(rand(-2, 4).toFixed(2)),
        reversalProbability: parseFloat(rand(5, 65).toFixed(1)),
        noiseIndex: parseFloat(rand(5, 55).toFixed(1)),
        digitBias,
        evenOddBalance: parseFloat(rand(35, 65).toFixed(1)),
        overUnderProbability: parseFloat(rand(30, 70).toFixed(1)),
        tickEntropy: parseFloat(rand(0.2, 1.0).toFixed(3)),
        patternStability: parseFloat(rand(40, 98).toFixed(1)),
        sentimentScore: parseFloat(rand(20, 90).toFixed(1)),
        aiConfidenceIndex: parseFloat(rand(55, 99).toFixed(1)),
        liquidityPressure: parseFloat(rand(10, 85).toFixed(1)),
        signalReliability: parseFloat(rand(60, 98).toFixed(1)),
    };
}

function buildOpportunities(assets: TMarketAsset[]): TOpportunity[] {
    return assets
        .map(a => ({
            id: a.id,
            market: a.name,
            symbol: a.symbol,
            score: randInt(50, 99),
            aiConfidence: a.confidence,
            expectedRisk: a.risk,
            estimatedDuration: pick(['1–3 ticks', '5–10 ticks', '15–30 ticks', '1–2 minutes']),
            recommendedStrategy: a.strategy,
            expectedProbability: a.strategyConfidence,
            marketState: pick(['TRENDING', 'RANGING', 'VOLATILE', 'CONSOLIDATING', 'BREAKOUT'] as const),
            suggestedEntry: a.entryTiming,
            expectedExit: pick(['On next pattern break', 'After 5 ticks', 'On digit reversal', 'Target hit']),
            executionReadiness: pick(['READY', 'PREPARING', 'STANDBY'] as const),
            rank: 0,
        }))
        .sort((a, b) => b.score - a.score)
        .map((o, i) => ({ ...o, rank: i + 1 }));
}

const INITIAL_COPY_TRADERS: TCopyTrader[] = [
    {
        id: 'ct1',
        name: 'Alpha Scalper v4',
        style: 'High-Frequency Digit Scalping',
        winRate: 78.4,
        monthlyReturn: 23.7,
        totalProfit: 184320,
        drawdown: 8.2,
        riskScore: 'MEDIUM',
        followers: 2847,
        avgTradeDuration: '2–5 ticks',
        preferredMarkets: ['Volatility 10 (1s)', 'Volatility 25'],
        currentStatus: 'Actively Trading',
        isConnected: false,
        connectionHealth: 99,
        latency: 12,
        syncStatus: 'STANDBY',
        badge: '🏆 Elite',
        avatarInitials: 'AS',
        avatarColor: '#6C5CE7',
    },
    {
        id: 'ct2',
        name: 'Quantum Digit Master',
        style: 'Statistical Arbitrage',
        winRate: 82.1,
        monthlyReturn: 31.2,
        totalProfit: 342100,
        drawdown: 5.9,
        riskScore: 'LOW',
        followers: 5613,
        avgTradeDuration: '10–30 ticks',
        preferredMarkets: ['Volatility 50', 'Volatility 75'],
        currentStatus: 'Scanning Markets',
        isConnected: false,
        connectionHealth: 97,
        latency: 8,
        syncStatus: 'STANDBY',
        badge: '⭐ Verified',
        avatarInitials: 'QM',
        avatarColor: '#00B894',
    },
    {
        id: 'ct3',
        name: 'Elite Momentum Pro',
        style: 'Trend Following',
        winRate: 74.6,
        monthlyReturn: 18.4,
        totalProfit: 97580,
        drawdown: 11.3,
        riskScore: 'MEDIUM',
        followers: 1902,
        avgTradeDuration: '1–3 minutes',
        preferredMarkets: ['Volatility 100', 'Boom 300'],
        currentStatus: 'In Position',
        isConnected: false,
        connectionHealth: 94,
        latency: 21,
        syncStatus: 'STANDBY',
        badge: '🔥 Rising',
        avatarInitials: 'EM',
        avatarColor: '#E17055',
    },
    {
        id: 'ct4',
        name: 'Synthetic Precision AI',
        style: 'AI-Driven Pattern Recognition',
        winRate: 88.3,
        monthlyReturn: 42.1,
        totalProfit: 891200,
        drawdown: 3.1,
        riskScore: 'LOW',
        followers: 12047,
        avgTradeDuration: '5–15 ticks',
        preferredMarkets: ['Step Index', 'Synthetic FX EUR/USD'],
        currentStatus: 'Optimizing Parameters',
        isConnected: false,
        connectionHealth: 100,
        latency: 5,
        syncStatus: 'STANDBY',
        badge: '🤖 AI Pro',
        avatarInitials: 'SP',
        avatarColor: '#0984E3',
    },
    {
        id: 'ct5',
        name: 'Institutional Index Hunter',
        style: 'Volume Profile & Index Correlation',
        winRate: 71.9,
        monthlyReturn: 15.8,
        totalProfit: 62400,
        drawdown: 14.7,
        riskScore: 'HIGH',
        followers: 743,
        avgTradeDuration: '30 ticks – 5 minutes',
        preferredMarkets: ['Crash 300', 'Volatility 100'],
        currentStatus: 'Awaiting Setup',
        isConnected: false,
        connectionHealth: 88,
        latency: 34,
        syncStatus: 'STANDBY',
        badge: '📈 Institutional',
        avatarInitials: 'IH',
        avatarColor: '#FDCB6E',
    },
];

const AI_STRATEGIES: TAiStrategy[] = [
    {
        id: 's1',
        name: 'Digit Precision Loop v3',
        description: 'High-frequency digit prediction exploiting statistical imbalances in tick distributions.',
        difficulty: 'INTERMEDIATE',
        successRate: 79.4,
        recommendedCapital: 500,
        marketCompatibility: ['Volatility 10 (1s)', 'Volatility 25'],
        riskLevel: 'MEDIUM',
        expectedFrequency: '15–30 trades/hour',
        aiRating: 8.7,
        deploymentCount: 14820,
        lastUpdated: '2 days ago',
        estimatedAccuracy: 81.2,
    },
    {
        id: 's2',
        name: 'Momentum Surge Capture',
        description: 'Identifies and rides momentum breakouts following compression phases.',
        difficulty: 'ADVANCED',
        successRate: 83.1,
        recommendedCapital: 1000,
        marketCompatibility: ['Volatility 75', 'Volatility 100'],
        riskLevel: 'HIGH',
        expectedFrequency: '5–10 trades/hour',
        aiRating: 9.2,
        deploymentCount: 8340,
        lastUpdated: '1 day ago',
        estimatedAccuracy: 77.8,
    },
    {
        id: 's3',
        name: 'Even-Odd Arbitrage Matrix',
        description: 'Exploits even/odd digit distribution imbalances with multi-entry confirmation logic.',
        difficulty: 'BEGINNER',
        successRate: 68.9,
        recommendedCapital: 200,
        marketCompatibility: ['Volatility 10 (1s)', 'Volatility 50', 'Step Index'],
        riskLevel: 'LOW',
        expectedFrequency: '20–40 trades/hour',
        aiRating: 7.4,
        deploymentCount: 31200,
        lastUpdated: '5 hours ago',
        estimatedAccuracy: 71.3,
    },
    {
        id: 's4',
        name: 'Entropy Collapse Sniper',
        description: 'Detects tick entropy collapse events — high-precision entry at structural turning points.',
        difficulty: 'EXPERT',
        successRate: 91.2,
        recommendedCapital: 5000,
        marketCompatibility: ['Step Index', 'Synthetic FX EUR/USD'],
        riskLevel: 'MEDIUM',
        expectedFrequency: '2–5 trades/hour',
        aiRating: 9.8,
        deploymentCount: 2108,
        lastUpdated: '12 hours ago',
        estimatedAccuracy: 89.4,
    },
    {
        id: 's5',
        name: 'Volatility Asymmetry Play',
        description: 'Identifies asymmetric volatility conditions and exploits directional bias.',
        difficulty: 'ADVANCED',
        successRate: 76.3,
        recommendedCapital: 2000,
        marketCompatibility: ['Boom 300', 'Crash 300', 'Volatility 100'],
        riskLevel: 'HIGH',
        expectedFrequency: '8–15 trades/hour',
        aiRating: 8.1,
        deploymentCount: 5670,
        lastUpdated: '3 days ago',
        estimatedAccuracy: 74.9,
    },
    {
        id: 's6',
        name: 'Micro-Trend Continuation Alpha',
        description: 'Identifies and trades micro-trends with AI-confirmed momentum persistence signals.',
        difficulty: 'INTERMEDIATE',
        successRate: 72.8,
        recommendedCapital: 750,
        marketCompatibility: ['Volatility 25', 'Volatility 50', 'Volatility 75'],
        riskLevel: 'MEDIUM',
        expectedFrequency: '10–20 trades/hour',
        aiRating: 8.4,
        deploymentCount: 18920,
        lastUpdated: '6 hours ago',
        estimatedAccuracy: 75.1,
    },
];

// ─── Risk Seed ────────────────────────────────────────────────
function buildRiskProfile(): TRiskProfile {
    const balance = parseFloat(rand(500, 10000).toFixed(2));
    const riskPct = parseFloat(rand(1, 5).toFixed(1));
    return {
        riskPerTrade: riskPct,
        maxDailyLoss: parseFloat(rand(5, 15).toFixed(1)),
        currentExposure: parseFloat(rand(0, 20).toFixed(1)),
        dailyLossUsed: parseFloat(rand(0, 60).toFixed(1)),
        balanceEstimate: balance,
        recommendedStake: parseFloat(((balance * riskPct) / 100).toFixed(2)),
        maxPositions: randInt(3, 10),
        currentPositions: randInt(0, 3),
        riskRewardRatio: parseFloat(rand(1.2, 3.5).toFixed(2)),
        stopLossLevel: parseFloat(rand(2, 10).toFixed(1)),
        takeProfitLevel: parseFloat(rand(4, 25).toFixed(1)),
    };
}

// ─── Signal Seed ─────────────────────────────────────────────
function buildSignals(): TSignal[] {
    return BASE_ASSETS.map((a, i) => ({
        id: `sig-${a.id}`,
        market: a.name,
        symbol: a.symbol,
        type: pick(['BUY', 'SELL', 'NEUTRAL'] as const),
        strength: randInt(40, 99),
        confidence: randInt(50, 97),
        strategy: pick(STRATEGIES),
        timeframe: pick(['1 tick', '5 ticks', '10 ticks', '30 ticks', '1 min']),
        expiresIn: randInt(15, 120),
        triggered: i < 3,
    }));
}

// ─── Performance Seed ────────────────────────────────────────
function buildPerformance(): TPerformanceStat {
    const wins = randInt(120, 800);
    const losses = randInt(40, 300);
    const total = wins + losses;
    const avgWin = parseFloat(rand(4, 18).toFixed(2));
    const avgLoss = parseFloat(rand(2, 8).toFixed(2));
    const curve: number[] = [];
    let equity = 1000;
    for (let i = 0; i < 24; i++) {
        equity += rand(-30, 45);
        curve.push(parseFloat(equity.toFixed(2)));
    }
    return {
        totalTrades: total,
        winRate: parseFloat(((wins / total) * 100).toFixed(1)),
        lossRate: parseFloat(((losses / total) * 100).toFixed(1)),
        totalPnL: parseFloat(rand(200, 4800).toFixed(2)),
        todayPnL: parseFloat(rand(-80, 220).toFixed(2)),
        weekPnL: parseFloat(rand(-100, 600).toFixed(2)),
        sharpeRatio: parseFloat(rand(0.8, 3.2).toFixed(2)),
        maxDrawdown: parseFloat(rand(3, 18).toFixed(1)),
        profitFactor: parseFloat(rand(1.1, 3.4).toFixed(2)),
        avgWin,
        avgLoss,
        consecutiveWins: randInt(1, 12),
        consecutiveLosses: randInt(1, 5),
        bestTrade: parseFloat(rand(20, 120).toFixed(2)),
        worstTrade: parseFloat(rand(-50, -5).toFixed(2)),
        equityCurve: curve,
    };
}

// ─── Sentiment Seed ───────────────────────────────────────────
const SENTIMENT_HEADLINES = [
    { h: 'Synthetic indices show extreme volatility accumulation', tags: ['volatility', 'technical'] },
    { h: 'Digit pattern analysts report unusual even/odd imbalance', tags: ['digits', 'pattern'] },
    { h: 'AI models detect high-probability momentum continuation', tags: ['ai', 'momentum'] },
    { h: 'Compression phase ending on major Volatility indices', tags: ['breakout', 'volatility'] },
    { h: 'Boom 300 signals spike following tick entropy collapse', tags: ['boom', 'entropy'] },
    { h: 'Crash 300 traders report elevated precision opportunities', tags: ['crash', 'precision'] },
    { h: 'Step Index shows record low noise — ideal for scalping', tags: ['step', 'scalping'] },
    { h: 'Machine learning models raise confidence on V75 setup', tags: ['ai', 'v75'] },
    { h: 'Market microstructure shifting across synthetic space', tags: ['microstructure'] },
    { h: 'Risk sentiment improving — traders rotating into V100', tags: ['risk', 'v100'] },
];
function labelFromScore(score: number): TSentimentItem['label'] {
    if (score < -60) return 'EXTREME_FEAR';
    if (score < -20) return 'FEAR';
    if (score < 20) return 'NEUTRAL';
    if (score < 60) return 'GREED';
    return 'EXTREME_GREED';
}
function buildSentiment(): TSentimentItem[] {
    return BASE_ASSETS.slice(0, 7).map((a, i) => {
        const score = parseFloat(rand(-80, 80).toFixed(1));
        const src = SENTIMENT_HEADLINES[i % SENTIMENT_HEADLINES.length];
        return {
            id: `sent-${a.id}`,
            market: a.name,
            score,
            label: labelFromScore(score),
            headline: src.h,
            source: pick(['AI Model', 'Pattern Engine', 'Quant Desk', 'Signal Hub']),
            timestamp: Date.now() - i * 60000,
            tags: src.tags,
        };
    });
}

// ─── MobX Store ───────────────────────────────────────────────
export class AiTradingStore {
    assets: TMarketAsset[] = BASE_ASSETS.map(buildAsset);
    analytics: Map<string, TMarketAnalytics> = new Map(BASE_ASSETS.map(a => [a.id, buildAnalytics(a.id)]));
    opportunities: TOpportunity[] = [];
    copyTraders: TCopyTrader[] = INITIAL_COPY_TRADERS;
    strategies: TAiStrategy[] = AI_STRATEGIES;
    insights: TMarketInsight[] = [];
    notifications: TAiNotification[] = [];
    riskProfile: TRiskProfile = buildRiskProfile();
    signals: TSignal[] = buildSignals();
    performance: TPerformanceStat = buildPerformance();
    sentiment: TSentimentItem[] = buildSentiment();
    isAssistantOpen = false;
    activeTab = 'scanner';
    selectedAnalyticsAsset = 'vol10';
    injectedAssetId: string | null = null;

    private _intervals: ReturnType<typeof setInterval>[] = [];

    constructor() {
        makeObservable(this, {
            assets: observable,
            analytics: observable,
            opportunities: observable,
            copyTraders: observable,
            strategies: observable,
            insights: observable,
            notifications: observable,
            riskProfile: observable,
            signals: observable,
            performance: observable,
            sentiment: observable,
            isAssistantOpen: observable,
            activeTab: observable,
            selectedAnalyticsAsset: observable,
            injectedAssetId: observable,
            setAssistantOpen: action.bound,
            toggleAssistant: action.bound,
            setActiveTab: action.bound,
            setSelectedAnalyticsAsset: action.bound,
            setInjectedAsset: action.bound,
            injectStrategy: action.bound,
            toggleCopyTrader: action.bound,
            markAllNotificationsRead: action.bound,
            markNotificationRead: action.bound,
            updateRiskPerTrade: action.bound,
            updateMaxDailyLoss: action.bound,
        });
        this.opportunities = buildOpportunities(this.assets);
        this._seedInsights();
        this._startSimulation();
    }

    private _seedInsights() {
        const now = Date.now();
        this.insights = INSIGHTS_POOL.slice(0, 6).map((p, i) => ({
            id: `insight-${i}`,
            text: p.text,
            asset: p.asset,
            priority: pick(['HIGH', 'MEDIUM', 'LOW'] as const),
            timestamp: now - i * 18000,
        }));
    }

    private _tickAssets = action(() => {
        this.assets = this.assets.map(asset => {
            if (Math.random() <= 0.45) return asset;
            return {
                ...asset,
                confidence: Math.min(99, Math.max(51, asset.confidence + randInt(-4, 4))),
                stability: Math.min(99, Math.max(35, asset.stability + randInt(-5, 5))),
                strategyConfidence: Math.min(99, Math.max(55, asset.strategyConfidence + randInt(-3, 3))),
                marketHealth: Math.min(99, Math.max(40, asset.marketHealth + randInt(-4, 4))),
                opportunityRating: parseFloat(
                    Math.min(9.9, Math.max(4.5, asset.opportunityRating + rand(-0.3, 0.3))).toFixed(1)
                ),
                signalFreshness:
                    Math.random() > 0.8 ? pick(['FRESH', 'RECENT', 'AGING'] as const) : asset.signalFreshness,
                status: Math.random() > 0.85 ? pick(STATUSES) : asset.status,
                trend: Math.random() > 0.9 ? pick(['UP', 'DOWN', 'SIDEWAYS'] as const) : asset.trend,
                lastUpdated: Date.now(),
            };
        });
        this.opportunities = buildOpportunities(this.assets);
    });

    private _tickAnalytics = action(() => {
        const newMap = new Map<string, TMarketAnalytics>();
        this.analytics.forEach((v, k) => {
            newMap.set(k, {
                ...v,
                maxTickVelocity: parseFloat(Math.max(0.1, v.maxTickVelocity + rand(-0.15, 0.15)).toFixed(3)),
                avgTickVelocity: parseFloat(Math.max(0.05, v.avgTickVelocity + rand(-0.08, 0.08)).toFixed(3)),
                compressionIndex: parseFloat(Math.min(99, Math.max(1, v.compressionIndex + rand(-2, 2))).toFixed(1)),
                expansionStrength: parseFloat(Math.min(99, Math.max(1, v.expansionStrength + rand(-3, 3))).toFixed(1)),
                volatilityMomentum: parseFloat(
                    Math.min(99, Math.max(1, v.volatilityMomentum + rand(-3, 3))).toFixed(1)
                ),
                evenOddBalance: parseFloat(Math.min(75, Math.max(25, v.evenOddBalance + rand(-1.5, 1.5))).toFixed(1)),
                overUnderProbability: parseFloat(
                    Math.min(75, Math.max(25, v.overUnderProbability + rand(-1.5, 1.5))).toFixed(1)
                ),
                aiConfidenceIndex: parseFloat(Math.min(99, Math.max(50, v.aiConfidenceIndex + rand(-1, 1))).toFixed(1)),
                sentimentScore: parseFloat(Math.min(99, Math.max(10, v.sentimentScore + rand(-2, 2))).toFixed(1)),
                digitBias: v.digitBias.map(d => Math.min(30, Math.max(3, d + randInt(-2, 2)))),
            });
        });
        this.analytics = newMap;
    });

    private _tickInsights = action(() => {
        if (Math.random() > 0.4) return;
        const src = pick(INSIGHTS_POOL);
        const newInsight: TMarketInsight = {
            id: `insight-${Date.now()}`,
            text: src.text,
            asset: src.asset,
            priority: pick(['HIGH', 'MEDIUM', 'LOW'] as const),
            timestamp: Date.now(),
        };
        this.insights = [newInsight, ...this.insights].slice(0, 30);
    });

    private _tickNotifications = action(() => {
        if (Math.random() > 0.25) return;
        const tpl = pick(NOTIFICATION_TEMPLATES);
        const notification: TAiNotification = {
            id: `notif-${Date.now()}`,
            type: tpl.type,
            title: tpl.title,
            message: tpl.message,
            priority: pick(['HIGH', 'MEDIUM', 'LOW'] as const),
            timestamp: Date.now(),
            read: false,
        };
        this.notifications = [notification, ...this.notifications].slice(0, 50);
    });

    private _progressCopyTrader = action((traderId: string, status: 'RECEIVING' | 'MIRRORING') => {
        this.copyTraders = this.copyTraders.map(t =>
            t.id === traderId && t.isConnected ? { ...t, syncStatus: status } : t
        );
    });

    private _tickSignals = action(() => {
        this.signals = this.signals.map(s => ({
            ...s,
            strength: Math.min(99, Math.max(30, s.strength + randInt(-5, 5))),
            confidence: Math.min(99, Math.max(45, s.confidence + randInt(-3, 3))),
            expiresIn: Math.max(0, s.expiresIn - 2),
            type: Math.random() > 0.92 ? pick(['BUY', 'SELL', 'NEUTRAL'] as const) : s.type,
        }));
    });

    private _tickPerformance = action(() => {
        const p = this.performance;
        const newPoint = parseFloat(
            Math.max(500, (p.equityCurve[p.equityCurve.length - 1] ?? 1000) + rand(-25, 40)).toFixed(2)
        );
        const newCurve = [...p.equityCurve.slice(-23), newPoint];
        this.performance = {
            ...p,
            todayPnL: parseFloat((p.todayPnL + rand(-5, 12)).toFixed(2)),
            weekPnL: parseFloat((p.weekPnL + rand(-3, 8)).toFixed(2)),
            totalPnL: parseFloat((p.totalPnL + rand(0, 8)).toFixed(2)),
            equityCurve: newCurve,
        };
    });

    private _tickSentiment = action(() => {
        this.sentiment = this.sentiment.map(s => {
            const newScore = parseFloat(Math.min(100, Math.max(-100, s.score + rand(-5, 5))).toFixed(1));
            return { ...s, score: newScore, label: labelFromScore(newScore) };
        });
    });

    private _tickRisk = action(() => {
        const r = this.riskProfile;
        this.riskProfile = {
            ...r,
            currentExposure: parseFloat(Math.min(40, Math.max(0, r.currentExposure + rand(-2, 2))).toFixed(1)),
            dailyLossUsed: parseFloat(Math.min(100, Math.max(0, r.dailyLossUsed + rand(-0.5, 1))).toFixed(1)),
            currentPositions: Math.min(r.maxPositions, Math.max(0, r.currentPositions + randInt(-1, 1))),
        };
    });

    private _startSimulation() {
        this._intervals.push(setInterval(this._tickAssets, 2500));
        this._intervals.push(setInterval(this._tickAnalytics, 1800));
        this._intervals.push(setInterval(this._tickInsights, 4000));
        this._intervals.push(setInterval(this._tickNotifications, 8000));
        this._intervals.push(setInterval(this._tickSignals, 3000));
        this._intervals.push(setInterval(this._tickPerformance, 5000));
        this._intervals.push(setInterval(this._tickSentiment, 6000));
        this._intervals.push(setInterval(this._tickRisk, 4000));
    }

    dispose() {
        this._intervals.forEach(clearInterval);
        this._intervals = [];
    }

    setAssistantOpen(open: boolean) {
        this.isAssistantOpen = open;
    }
    toggleAssistant() {
        this.isAssistantOpen = !this.isAssistantOpen;
    }
    setActiveTab(tab: string) {
        this.activeTab = tab;
    }
    setSelectedAnalyticsAsset(id: string) {
        this.selectedAnalyticsAsset = id;
    }
    setInjectedAsset(id: string | null) {
        this.injectedAssetId = id;
    }

    injectStrategy(assetId: string) {
        this.injectedAssetId = assetId;
    }

    updateRiskPerTrade(value: number) {
        const clamped = Math.min(10, Math.max(0.1, value));
        this.riskProfile = {
            ...this.riskProfile,
            riskPerTrade: clamped,
            recommendedStake: parseFloat(((this.riskProfile.balanceEstimate * clamped) / 100).toFixed(2)),
        };
    }

    updateMaxDailyLoss(value: number) {
        this.riskProfile = { ...this.riskProfile, maxDailyLoss: Math.min(30, Math.max(1, value)) };
    }

    toggleCopyTrader(traderId: string) {
        const trader = this.copyTraders.find(t => t.id === traderId);
        const connecting = trader ? !trader.isConnected : false;
        this.copyTraders = this.copyTraders.map(t => {
            if (t.id !== traderId) return t;
            return { ...t, isConnected: connecting, syncStatus: connecting ? 'CONNECTED' : 'STANDBY' };
        });
        if (connecting) {
            setTimeout(() => this._progressCopyTrader(traderId, 'RECEIVING'), 800);
            setTimeout(() => this._progressCopyTrader(traderId, 'MIRRORING'), 1800);
        }
    }

    markAllNotificationsRead() {
        this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    }

    markNotificationRead(id: string) {
        this.notifications = this.notifications.map(n => (n.id === id ? { ...n, read: true } : n));
    }

    get unreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }
}

// Singleton — one instance per app session
export const aiTradingStore = new AiTradingStore();
