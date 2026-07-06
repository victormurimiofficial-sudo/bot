import React, { useCallback, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { toast } from 'react-toastify';
import { aiTradingStore } from '../../store/ai-trading-store';
import { TMarketAsset } from '../../store/types';
import CopyTrading from '../copy-trading';
import MarketAnalytics from '../market-analytics';
import MarketInsights from '../market-insights';
import NotificationCenter from '../notification-center';
import OpportunityEngine from '../opportunity-engine';
import PerformanceDashboard from '../performance-dashboard';
import RiskManager from '../risk-manager';
import SentimentFeed from '../sentiment-feed';
import SignalScanner from '../signal-scanner';
import StrategyMarketplace from '../strategy-marketplace';

// ─── Risk Badge ──────────────────────────────────────────────
const RiskBadge: React.FC<{ risk: string }> = ({ risk }) => (
    <span className={`ats-risk-badge ats-risk-badge--${risk.toLowerCase()}`}>{risk}</span>
);

// ─── Trend Icon ──────────────────────────────────────────────
const TrendIcon: React.FC<{ trend: string }> = ({ trend }) => {
    if (trend === 'UP') return <span className='ats-trend ats-trend--up'>▲</span>;
    if (trend === 'DOWN') return <span className='ats-trend ats-trend--down'>▼</span>;
    return <span className='ats-trend ats-trend--sideways'>◆</span>;
};

// ─── Freshness Dot ───────────────────────────────────────────
const FreshnessDot: React.FC<{ freshness: string }> = ({ freshness }) => (
    <span className={`ats-freshness ats-freshness--${freshness.toLowerCase()}`} title={freshness}>
        ●
    </span>
);

// ─── Confidence Bar ──────────────────────────────────────────
const ConfidenceBar: React.FC<{ value: number; color?: string }> = ({ value, color }) => (
    <div className='ats-conf-bar'>
        <div className='ats-conf-bar__fill' style={{ width: `${value}%`, background: color ?? 'var(--ats-accent)' }} />
        <span className='ats-conf-bar__label'>{value}%</span>
    </div>
);

// ─── Asset Row ───────────────────────────────────────────────
const AssetRow: React.FC<{ asset: TMarketAsset }> = observer(({ asset }) => {
    const handleInject = useCallback(() => {
        aiTradingStore.injectStrategy(asset.id);
        toast.success(`✅ AI Strategy Parameters Injected Successfully — ${asset.name}`, {
            position: 'top-right',
            autoClose: 4000,
            hideProgressBar: false,
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
                    <span className='ats-asset-row__health' title='Market Health'>
                        ❤ {asset.marketHealth}%
                    </span>
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
            <button
                className={`ats-inject-btn ${isInjected ? 'ats-inject-btn--active' : ''}`}
                onClick={handleInject}
                aria-label={`Inject strategy for ${asset.name}`}
            >
                {isInjected ? '✓ Strategy Active' : '⚡ Load & Inject Strategy'}
            </button>
        </div>
    );
});

// ─── Scanner Tab ─────────────────────────────────────────────
const ScannerTab: React.FC = observer(() => {
    const { assets } = aiTradingStore;
    return (
        <div className='ats-scanner'>
            <div className='ats-scanner__header'>
                <div className='ats-scanner__title'>
                    <span className='ats-pulse-dot' />
                    AI Market Scan Matrix
                </div>
                <span className='ats-scanner__count'>{assets.length} markets monitored</span>
            </div>
            <div className='ats-scanner__list'>
                {assets.map(asset => (
                    <AssetRow key={asset.id} asset={asset} />
                ))}
            </div>
        </div>
    );
});

// ─── Tab Config ──────────────────────────────────────────────
const TABS = [
    { id: 'scanner', label: '🔬 Scanner', Component: ScannerTab },
    { id: 'signals', label: '📡 Signals', Component: SignalScanner },
    { id: 'analytics', label: '📊 Analytics', Component: MarketAnalytics },
    { id: 'opportunity', label: '🎯 Opportunities', Component: OpportunityEngine },
    { id: 'risk', label: '🛡️ Risk', Component: RiskManager },
    { id: 'performance', label: '📈 Performance', Component: PerformanceDashboard },
    { id: 'sentiment', label: '🧭 Sentiment', Component: SentimentFeed },
    { id: 'copy', label: '🔗 Copy Trade', Component: CopyTrading },
    { id: 'strategies', label: '🧠 Strategies', Component: StrategyMarketplace },
    { id: 'insights', label: '💡 Insights', Component: MarketInsights },
    { id: 'alerts', label: '🔔 Alerts', Component: NotificationCenter },
];

// ─── Floating Assistant ──────────────────────────────────────
const FloatingAssistant: React.FC = observer(() => {
    const { isAssistantOpen, activeTab, unreadCount } = aiTradingStore;
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!isAssistantOpen) return;
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                // Don't close when clicking the toggle button (it has its own handler)
                const btn = document.getElementById('ats-toggle-btn');
                if (btn?.contains(e.target as Node)) return;
                aiTradingStore.setAssistantOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isAssistantOpen]);

    const ActiveComponent = TABS.find(t => t.id === activeTab)?.Component ?? ScannerTab;

    return (
        <div className='ats-floating-root'>
            {/* Expanded Panel */}
            {isAssistantOpen && (
                <div className='ats-panel' ref={panelRef} role='dialog' aria-label='AI Trading Assistant'>
                    {/* Panel Header */}
                    <div className='ats-panel__header'>
                        <div className='ats-panel__brand'>
                            <span className='ats-panel__brain'>🤖</span>
                            <div>
                                <div className='ats-panel__title'>AI Trading Intelligence</div>
                                <div className='ats-panel__subtitle'>
                                    <span className='ats-pulse-dot ats-pulse-dot--sm' />
                                    Live analysis active
                                </div>
                            </div>
                        </div>
                        <button
                            className='ats-panel__close'
                            onClick={() => aiTradingStore.setAssistantOpen(false)}
                            aria-label='Close panel'
                        >
                            ✕
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className='ats-tabs' role='tablist'>
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                role='tab'
                                aria-selected={activeTab === tab.id}
                                className={`ats-tab ${activeTab === tab.id ? 'ats-tab--active' : ''}`}
                                onClick={() => aiTradingStore.setActiveTab(tab.id)}
                            >
                                {tab.label}
                                {tab.id === 'alerts' && unreadCount > 0 && (
                                    <span className='ats-tab__badge'>{unreadCount > 99 ? '99+' : unreadCount}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className='ats-panel__content' role='tabpanel'>
                        <ActiveComponent />
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                id='ats-toggle-btn'
                className={`ats-fab ${isAssistantOpen ? 'ats-fab--open' : ''}`}
                onClick={() => aiTradingStore.toggleAssistant()}
                aria-label='Toggle AI Trading Assistant'
                title='AI Trading Intelligence'
            >
                <span className='ats-fab__icon'>{isAssistantOpen ? '✕' : '🤖'}</span>
                {!isAssistantOpen && unreadCount > 0 && (
                    <span className='ats-fab__badge'>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
                {!isAssistantOpen && <span className='ats-fab__aura' />}
            </button>
        </div>
    );
});

export default FloatingAssistant;
