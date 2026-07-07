import React, { useState } from 'react';
import { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { toast } from 'react-toastify';
import CopyTrading from '../../components/ai-trading-suite/components/copy-trading';
import MarketAnalytics from '../../components/ai-trading-suite/components/market-analytics';
import MarketInsights from '../../components/ai-trading-suite/components/market-insights';
import NotificationCenter from '../../components/ai-trading-suite/components/notification-center';
import OpportunityEngine from '../../components/ai-trading-suite/components/opportunity-engine';
import PerformanceDashboard from '../../components/ai-trading-suite/components/performance-dashboard';
import RiskManager from '../../components/ai-trading-suite/components/risk-manager';
import SentimentFeed from '../../components/ai-trading-suite/components/sentiment-feed';
import SignalScanner from '../../components/ai-trading-suite/components/signal-scanner';
import StrategyMarketplace from '../../components/ai-trading-suite/components/strategy-marketplace';
import { aiTradingStore } from '../../components/ai-trading-suite/store/ai-trading-store';
import { TMarketAsset } from '../../components/ai-trading-suite/store/types';
import './ai-trading.scss';

// ─── Reusable sub-components (same logic as floating-assistant) ──
const RiskBadge: React.FC<{ risk: string }> = ({ risk }) => (
    <span className={`ats-risk-badge ats-risk-badge--${risk.toLowerCase()}`}>{risk}</span>
);

const TrendIcon: React.FC<{ trend: string }> = ({ trend }) => {
    if (trend === 'UP') return <span className='ats-trend ats-trend--up'>▲</span>;
    if (trend === 'DOWN') return <span className='ats-trend ats-trend--down'>▼</span>;
    return <span className='ats-trend ats-trend--sideways'>◆</span>;
};

const FreshnessDot: React.FC<{ freshness: string }> = ({ freshness }) => (
    <span className={`ats-freshness ats-freshness--${freshness.toLowerCase()}`} title={freshness}>
        ●
    </span>
);

const ConfidenceBar: React.FC<{ value: number; color?: string }> = ({ value, color }) => (
    <div className='ats-conf-bar'>
        <div className='ats-conf-bar__track'>
            <div
                className='ats-conf-bar__fill'
                style={{ width: `${value}%`, background: color ?? 'var(--ats-accent)' }}
            />
        </div>
        <span className='ats-conf-bar__label'>{value}%</span>
    </div>
);

const AssetRow: React.FC<{ asset: TMarketAsset }> = observer(({ asset }) => {
    const handleInject = useCallback(() => {
        aiTradingStore.injectStrategy(asset.id);
        toast.success(`✅ AI Strategy Injected — ${asset.name}`, {
            position: 'top-right',
            autoClose: 4000,
            className: 'ats-toast-success',
        });
    }, [asset.id, asset.name]);

    const isInjected = aiTradingStore.injectedAssetId === asset.id;

    return (
        <div className={`ats-asset-row ${isInjected ? 'ats-asset-row--injected' : ''}`}>
            <div className='ats-asset-row__header'>
                <div className='ats-asset-row__name'>
                    <FreshnessDot freshness={asset.signalFreshness} />
                    <span className='ats-asset-row__title'>{asset.name}</span>
                    <TrendIcon trend={asset.trend} />
                </div>
                <div className='ats-asset-row__badges'>
                    <RiskBadge risk={asset.risk} />
                    <span className='ats-asset-row__health'>❤ {asset.marketHealth}%</span>
                </div>
            </div>
            <div className='ats-asset-row__status'>{asset.status}</div>
            <div className='ats-asset-row__metrics'>
                <div className='ats-asset-row__metric'>
                    <span className='ats-label'>AI Confidence</span>
                    <ConfidenceBar value={asset.confidence} />
                </div>
                <div className='ats-asset-row__metric'>
                    <span className='ats-label'>Strategy</span>
                    <span className='ats-value'>{asset.strategy}</span>
                </div>
                <div className='ats-asset-row__metric'>
                    <span className='ats-label'>Entry</span>
                    <span className='ats-value ats-value--entry'>{asset.entryTiming}</span>
                </div>
                <div className='ats-asset-row__metric'>
                    <span className='ats-label'>Opportunity</span>
                    <span className='ats-value ats-value--score'>{asset.opportunityRating}/10</span>
                </div>
            </div>
            <button className={`ats-inject-btn ${isInjected ? 'ats-inject-btn--active' : ''}`} onClick={handleInject}>
                {isInjected ? '✓ Strategy Active' : '⚡ Load & Inject Strategy'}
            </button>
        </div>
    );
});

// ─── Scanner (all markets) ─────────────────────────────────────
const ScannerTab: React.FC = observer(() => {
    const { assets } = aiTradingStore;
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState<'confidence' | 'opportunity' | 'health'>('confidence');

    const filtered = assets
        .filter(a => {
            if (filter === 'all') return true;
            if (filter === 'high') return a.risk === 'HIGH' || a.risk === 'EXTREME';
            if (filter === 'low') return a.risk === 'LOW';
            if (filter === 'up') return a.trend === 'UP';
            if (filter === 'down') return a.trend === 'DOWN';
            return true;
        })
        .sort((a, b) => {
            if (sort === 'confidence') return b.confidence - a.confidence;
            if (sort === 'opportunity') return b.opportunityRating - a.opportunityRating;
            if (sort === 'health') return b.marketHealth - a.marketHealth;
            return 0;
        });

    return (
        <div className='ai-trading-scanner'>
            <div className='ai-trading-scanner__toolbar'>
                <div className='ai-trading-scanner__header'>
                    <span className='ats-pulse-dot' />
                    <span className='ai-trading-scanner__title'>AI Market Scan Matrix</span>
                    <span className='ai-trading-scanner__count'>{assets.length} markets monitored</span>
                </div>
                <div className='ai-trading-scanner__controls'>
                    <div className='ai-trading-scanner__filter-group'>
                        <span className='ai-trading-scanner__control-label'>Filter:</span>
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'high', label: '🔥 High Risk' },
                            { id: 'low', label: '🟢 Low Risk' },
                            { id: 'up', label: '▲ Uptrend' },
                            { id: 'down', label: '▼ Downtrend' },
                        ].map(f => (
                            <button
                                key={f.id}
                                className={`ai-trading-scanner__filter-btn ${filter === f.id ? 'ai-trading-scanner__filter-btn--active' : ''}`}
                                onClick={() => setFilter(f.id)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className='ai-trading-scanner__filter-group'>
                        <span className='ai-trading-scanner__control-label'>Sort by:</span>
                        {[
                            { id: 'confidence' as const, label: 'Confidence' },
                            { id: 'opportunity' as const, label: 'Opportunity' },
                            { id: 'health' as const, label: 'Health' },
                        ].map(s => (
                            <button
                                key={s.id}
                                className={`ai-trading-scanner__filter-btn ${sort === s.id ? 'ai-trading-scanner__filter-btn--active' : ''}`}
                                onClick={() => setSort(s.id)}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className='ai-trading-scanner__grid'>
                {filtered.map(asset => (
                    <AssetRow key={asset.id} asset={asset} />
                ))}
            </div>
        </div>
    );
});

// ─── Tab Config ────────────────────────────────────────────────
const TABS = [
    { id: 'scanner', label: '🔬 Scanner', Component: ScannerTab },
    { id: 'signals', label: '📡 Signals', Component: SignalScanner },
    { id: 'analytics', label: '📊 Analytics', Component: MarketAnalytics },
    { id: 'opportunity', label: '🎯 Opportunities', Component: OpportunityEngine },
    { id: 'risk', label: '🛡️ Risk Manager', Component: RiskManager },
    { id: 'performance', label: '📈 Performance', Component: PerformanceDashboard },
    { id: 'sentiment', label: '🧭 Sentiment', Component: SentimentFeed },
    { id: 'copy', label: '🔗 Copy Trade', Component: CopyTrading },
    { id: 'strategies', label: '🧠 Strategies', Component: StrategyMarketplace },
    { id: 'insights', label: '💡 Insights', Component: MarketInsights },
    { id: 'alerts', label: '🔔 Alerts', Component: NotificationCenter },
];

// ─── AI Trading Page ───────────────────────────────────────────
const AiTradingPage: React.FC = observer(() => {
    const [activeTab, setActiveTab] = useState('scanner');
    const { unreadCount } = aiTradingStore;

    const ActiveComponent = TABS.find(t => t.id === activeTab)?.Component ?? ScannerTab;

    return (
        <div className='ai-trading-page'>
            {/* Page Header */}
            <div className='ai-trading-page__header'>
                <div className='ai-trading-page__brand'>
                    <span className='ai-trading-page__icon'>🤖</span>
                    <div>
                        <div className='ai-trading-page__title'>AI Trading Intelligence Suite</div>
                        <div className='ai-trading-page__subtitle'>
                            <span className='ats-pulse-dot ats-pulse-dot--sm' />
                            Live analysis active · {TABS.length} modules · {aiTradingStore.assets.length} markets
                            tracked
                        </div>
                    </div>
                </div>
                <div className='ai-trading-page__header-stats'>
                    <div className='ai-trading-page__header-stat'>
                        <span className='ai-trading-page__header-stat-label'>High Confidence</span>
                        <span className='ai-trading-page__header-stat-val' style={{ color: '#00d26a' }}>
                            {aiTradingStore.assets.filter(a => a.confidence >= 75).length}
                        </span>
                    </div>
                    <div className='ai-trading-page__header-stat'>
                        <span className='ai-trading-page__header-stat-label'>Active Signals</span>
                        <span className='ai-trading-page__header-stat-val' style={{ color: '#00c9b7' }}>
                            {aiTradingStore.signals.filter(s => !s.triggered).length}
                        </span>
                    </div>
                    <div className='ai-trading-page__header-stat'>
                        <span className='ai-trading-page__header-stat-label'>Unread Alerts</span>
                        <span className='ai-trading-page__header-stat-val' style={{ color: '#f6c90e' }}>
                            {unreadCount}
                        </span>
                    </div>
                    <div className='ai-trading-page__header-stat'>
                        <span className='ai-trading-page__header-stat-label'>Markets Up</span>
                        <span className='ai-trading-page__header-stat-val' style={{ color: '#00d26a' }}>
                            {aiTradingStore.assets.filter(a => a.trend === 'UP').length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tab Bar */}
            <div className='ai-trading-page__tabbar' role='tablist'>
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        role='tab'
                        aria-selected={activeTab === tab.id}
                        className={`ai-trading-page__tab ${activeTab === tab.id ? 'ai-trading-page__tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                        {tab.id === 'alerts' && unreadCount > 0 && (
                            <span className='ai-trading-page__tab-badge'>{unreadCount > 99 ? '99+' : unreadCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className='ai-trading-page__content' role='tabpanel'>
                <ActiveComponent />
            </div>
        </div>
    );
});

export default AiTradingPage;
