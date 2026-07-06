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
    confidence: number; // 0-100
    stability: number; // 0-100
    risk: RiskLevel;
    opportunityRating: number; // 0-10
    strategy: string;
    entryTiming: string;
    signalFreshness: SignalFreshness;
    strategyConfidence: number; // 0-100
    marketHealth: number; // 0-100
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
    digitBias: number[]; // 0-9 frequency
    evenOddBalance: number; // 0-100 (50 = balanced)
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
    score: number; // 0-100
    aiConfidence: number; // 0-100
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
    winRate: number; // 0-100
    monthlyReturn: number; // percentage
    totalProfit: number; // USD
    drawdown: number; // percentage
    riskScore: RiskLevel;
    followers: number;
    avgTradeDuration: string;
    preferredMarkets: string[];
    currentStatus: string;
    isConnected: boolean;
    connectionHealth: number; // 0-100
    latency: number; // ms
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
    successRate: number; // 0-100
    recommendedCapital: number;
    marketCompatibility: string[];
    riskLevel: RiskLevel;
    expectedFrequency: string;
    aiRating: number; // 0-10
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

// ─── Risk Manager ────────────────────────────────────────────
export interface TRiskProfile {
    riskPerTrade: number; // % of balance
    maxDailyLoss: number; // % of balance
    currentExposure: number; // % of balance currently deployed
    dailyLossUsed: number; // % of daily limit consumed
    balanceEstimate: number; // USD
    recommendedStake: number; // USD per trade
    maxPositions: number;
    currentPositions: number;
    riskRewardRatio: number;
    stopLossLevel: number; // %
    takeProfitLevel: number; // %
}

// ─── Signal Scanner ──────────────────────────────────────────
export interface TSignal {
    id: string;
    market: string;
    symbol: string;
    type: 'BUY' | 'SELL' | 'NEUTRAL';
    strength: number; // 0-100
    confidence: number; // 0-100
    strategy: string;
    timeframe: string;
    expiresIn: number; // seconds remaining
    triggered: boolean;
}

// ─── Performance Dashboard ───────────────────────────────────
export interface TPerformanceStat {
    totalTrades: number;
    winRate: number;
    lossRate: number;
    totalPnL: number;
    todayPnL: number;
    weekPnL: number;
    sharpeRatio: number;
    maxDrawdown: number;
    profitFactor: number;
    avgWin: number;
    avgLoss: number;
    consecutiveWins: number;
    consecutiveLosses: number;
    bestTrade: number;
    worstTrade: number;
    equityCurve: number[]; // last 24 equity points
}

// ─── Sentiment Feed ──────────────────────────────────────────
export type SentimentLabel = 'EXTREME_FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME_GREED';

export interface TSentimentItem {
    id: string;
    market: string;
    score: number; // -100 to +100
    label: SentimentLabel;
    headline: string;
    source: string;
    timestamp: number;
    tags: string[];
}
