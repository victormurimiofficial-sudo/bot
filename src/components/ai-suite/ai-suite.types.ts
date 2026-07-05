/**
 * Shared type definitions for the Veneefx AI Intelligence & Trading Automation Suite.
 *
 * These types describe the simulated real-time market telemetry that powers the
 * Floating AI Assistant, the Analytics Center, the Opportunity Ranking engine,
 * the Copy Trading Network, the Strategy Marketplace and the Notification Center.
 *
 * All feeds are simulated locally but are structured so they can be swapped for
 * real Deriv WebSocket streams (app_id 129344) without changing consumers.
 */

export type TTrendDirection = 'up' | 'down' | 'sideways';

export type TRiskLevel = 'Low' | 'Medium' | 'High';

export type TMarketState = 'Trending' | 'Consolidating' | 'Breakout' | 'Reversal' | 'Volatile';

/** Static description of a monitored Deriv market. */
export interface TAssetDefinition {
    /** Human readable market name shown in the UI. */
    name: string;
    /** Deriv symbol code, e.g. `1HZ10V`. Used for Bot Builder injection. */
    symbol: string;
    /** Deriv market group, e.g. `synthetic_index`. */
    market: string;
    /** Deriv submarket, e.g. `random_index`. */
    submarket: string;
    /** Short code shown in compact rows. */
    short: string;
}

/** Live, continuously refreshed analytical snapshot for a single asset. */
export interface TAssetSignal extends TAssetDefinition {
    status: string;
    trend: TTrendDirection;
    /** 0-100 AI confidence in the current signal. */
    confidence: number;
    /** 0-100 market stability score. */
    stability: number;
    risk: TRiskLevel;
    /** 0-100 opportunity rating. */
    opportunity: number;
    strategy: string;
    entryTiming: string;
    /** Seconds since the signal last refreshed. */
    freshness: number;
    /** 0-100 overall market health. */
    health: number;
    /** Current simulated tick/spot price. */
    price: number;
    /** Last computed decimal digit (0-9) of the spot price. */
    lastDigit: number;
}

/** Aggregated statistical telemetry for the Analytics Center. */
export interface TTelemetry {
    maxTickVelocity: number;
    avgTickVelocity: number;
    compressionIndex: number;
    expansionStrength: number;
    volatilityMomentum: number;
    trendPersistence: number;
    momentumAcceleration: number;
    reversalProbability: number;
    noiseIndex: number;
    tickEntropy: number;
    patternStability: number;
    sentimentScore: number;
    aiConfidenceIndex: number;
    liquidityPressure: number;
    signalReliability: number;
    evenPct: number;
    oddPct: number;
    overPct: number;
    underPct: number;
    /** Frequency (0-100) for each digit 0-9. */
    digitDistribution: number[];
    highestDigits: number[];
    lowestDigits: number[];
}

/** A single ranked trading opportunity. */
export interface TOpportunity {
    symbol: string;
    name: string;
    score: number;
    confidence: number;
    risk: TRiskLevel;
    duration: string;
    strategy: string;
    probability: number;
    state: TMarketState;
    entryTiming: string;
    exitWindow: string;
    readiness: number;
}

/** An automated market insight commentary entry. */
export interface TInsight {
    id: string;
    message: string;
    timestamp: number;
    tone: 'positive' | 'neutral' | 'warning';
}

export type TNotificationPriority = 'low' | 'medium' | 'high';

/** A platform notification event. */
export interface TAiNotification {
    id: string;
    title: string;
    detail: string;
    priority: TNotificationPriority;
    timestamp: number;
    read: boolean;
}

/** A copy-trading trader profile. */
export interface TTraderProfile {
    id: string;
    name: string;
    avatar: string;
    badge: string;
    style: string;
    winRate: number;
    monthlyReturn: number;
    totalProfit: number;
    drawdown: number;
    riskScore: TRiskLevel;
    followers: number;
    avgDuration: string;
    markets: string;
}

/** A reusable AI strategy marketplace template. */
export interface TStrategyTemplate {
    id: string;
    name: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    successRating: number;
    recommendedCapital: string;
    compatibility: string;
    risk: TRiskLevel;
    frequency: string;
    aiRating: number;
    deployments: number;
    accuracy: number;
    /** Symbol injected into the Bot Builder on deploy. */
    symbol: string;
}
