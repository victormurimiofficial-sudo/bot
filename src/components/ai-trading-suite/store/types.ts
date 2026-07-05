// ============================================================
// AI Trading Suite — Shared TypeScript Types
// ============================================================

export type TrendDirection = 'UP' | 'DOWN' | 'SIDEWAYS';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
export type MarketState = 'TRENDING' | 'RANGING' | 'VOLATILE' | 'CONSOLIDATING' | 'BREAKOUT';
export type SignalFreshness = 'FRESH' | 'RECENT' | 'AGING';
export type ExecutionReadiness = 'READY' | 'PREPARING' | 'STANDBY';
export type CopyStatus = 'CONNECTED' | 'RECEIVING' | 'MIRRORING' | 'STANDBY' | 'DISCONNECTED';
export type NotificationPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type NotificationType =
    | 'OPPORTUNITY'
    | 'STRATEGY_INJECTED'
    | 'SYNC_ENABLED'
    | 'VOLATILITY_SPIKE'
    | 'MOMENTUM_SHIFT'
    | 'DIGIT_PATTERN'
    | 'CONFIDENCE_UP'
    | 'SIGNAL_INVALID'
    | 'MARKET_COOLING'
    | 'EXECUTION_READY';

// ─── Market Asset ────────────────────────────────────────────
export interface TMarketAsset {
    id: string;
    name: string;
    symbol: string;
    status: string;
    trend: TrendDirection;
    confidence: number;       // 0-100
    stability: number;        // 0-100
    risk: RiskLevel;
    opportunityRating: number; // 0-10
    strategy: string;
    entryTiming: string;
    signalFreshness: SignalFreshness;
    strategyConfidence: number; // 0-100
    marketHealth: number;       // 0-100
    lastUpdated: number;
}

// ─── Market Analytics ────────────────────────────────────────
export interface TMarketAnalytics {
    assetId: string;
    maxTickVelocity: number;
    avgTickVelocity: number;
    compressionIndex: number;
    expansionStrength: number;
    volatilityMomentum: number;
    trendPersistence: number;
    momentumAcceleration: number;
    reversalProbability: number;
    noiseIndex: number;
    digitBias: number[];        // 0-9 frequency
    evenOddBalance: number;     // 0-100 (50 = balanced)
    overUnderProbability: number; // 0-100
    tickEntropy: number;
    patternStability: number;
    sentimentScore: number;
    aiConfidenceIndex: number;
    liquidityPressure: number;
    signalReliability: number;
}

// ─── Opportunity ─────────────────────────────────────────────
export interface TOpportunity {
    id: string;
    market: string;
    symbol: string;
    score: number;             // 0-100
    aiConfidence: number;      // 0-100
    expectedRisk: RiskLevel;
    estimatedDuration: string;
    recommendedStrategy: string;
    expectedProbability: number; // 0-100
    marketState: MarketState;
    suggestedEntry: string;
    expectedExit: string;
    executionReadiness: ExecutionReadiness;
    rank: number;
}

// ─── Copy Trader ─────────────────────────────────────────────
export interface TCopyTrader {
    id: string;
    name: string;
    style: string;
    winRate: number;           // 0-100
    monthlyReturn: number;     // percentage
    totalProfit: number;       // USD
    drawdown: number;          // percentage
    riskScore: RiskLevel;
    followers: number;
    avgTradeDuration: string;
    preferredMarkets: string[];
    currentStatus: string;
    isConnected: boolean;
    connectionHealth: number;  // 0-100
    latency: number;           // ms
    syncStatus: CopyStatus;
    badge: string;
    avatarInitials: string;
    avatarColor: string;
}

// ─── AI Strategy ─────────────────────────────────────────────
export interface TAiStrategy {
    id: string;
    name: string;
    description: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    successRate: number;       // 0-100
    recommendedCapital: number;
    marketCompatibility: string[];
    riskLevel: RiskLevel;
    expectedFrequency: string;
    aiRating: number;          // 0-10
    deploymentCount: number;
    lastUpdated: string;
    estimatedAccuracy: number; // 0-100
}

// ─── Market Insight ──────────────────────────────────────────
export interface TMarketInsight {
    id: string;
    text: string;
    timestamp: number;
    asset: string;
    priority: NotificationPriority;
}

// ─── Notification ────────────────────────────────────────────
export interface TAiNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    priority: NotificationPriority;
    timestamp: number;
    read: boolean;
}
