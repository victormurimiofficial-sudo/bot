import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { toast } from 'react-toastify';
import { aiTradingStore } from '../../store/ai-trading-store';
import { TAiStrategy } from '../../store/types';

// ─── Difficulty Badge ─────────────────────────────────────────
const DifficultyBadge: React.FC<{ difficulty: string }> = ({ difficulty }) => (
    <span className={`ats-difficulty ats-difficulty--${difficulty.toLowerCase()}`}>{difficulty}</span>
);

// ─── AI Rating Stars ─────────────────────────────────────────
const AiRating: React.FC<{ rating: number }> = ({ rating }) => {
    const filled = Math.round(rating);
    return (
        <div className='ats-ai-rating' title={`AI Rating: ${rating}/10`}>
            {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className={`ats-ai-rating__star ${i < filled ? 'ats-ai-rating__star--filled' : ''}`}>★</span>
            ))}
            <span className='ats-ai-rating__value'>{rating}/10</span>
        </div>
    );
};

// ─── Strategy Card ────────────────────────────────────────────
const StrategyCard: React.FC<{ strategy: TAiStrategy; deployedId: string | null }> = observer(({ strategy, deployedId }) => {
    const isDeployed = deployedId === strategy.id;
    const [isExpanded, setIsExpanded] = useState(false);

    const handleDeploy = useCallback(() => {
        aiTradingStore.setInjectedAsset(strategy.id);
        toast.success(`🧠 Strategy "${strategy.name}" deployed to Bot Builder!`, {
            position: 'top-right',
            autoClose: 4000,
        });
    }, [strategy.id, strategy.name]);

    return (
        <div className={`ats-strategy-card ${isDeployed ? 'ats-strategy-card--deployed' : ''}`}>
            <div className='ats-strategy-card__header' onClick={() => setIsExpanded(e => !e)}>
                <div className='ats-strategy-card__title-row'>
                    <span className='ats-strategy-card__name'>{strategy.name}</span>
                    <DifficultyBadge difficulty={strategy.difficulty} />
                </div>
                <div className='ats-strategy-card__meta'>
                    <span className={`ats-risk-badge ats-risk-badge--${strategy.riskLevel.toLowerCase()}`}>{strategy.riskLevel} risk</span>
                    <span className='ats-strategy-card__deploys'>🚀 {strategy.deploymentCount.toLocaleString()} deploys</span>
                    <span className='ats-strategy-card__updated'>Updated {strategy.lastUpdated}</span>
                </div>
                <span className='ats-strategy-card__chevron'>{isExpanded ? '▲' : '▼'}</span>
            </div>

            <div className='ats-strategy-card__quick-stats'>
                <div className='ats-strategy-card__stat'>
                    <span className='ats-strategy-card__stat-value ats-value--green'>{strategy.successRate}%</span>
                    <span className='ats-strategy-card__stat-label'>Success Rate</span>
                </div>
                <div className='ats-strategy-card__stat'>
                    <span className='ats-strategy-card__stat-value ats-value--green'>{strategy.estimatedAccuracy}%</span>
                    <span className='ats-strategy-card__stat-label'>Est. Accuracy</span>
                </div>
                <div className='ats-strategy-card__stat'>
                    <span className='ats-strategy-card__stat-value'>${strategy.recommendedCapital.toLocaleString()}</span>
                    <span className='ats-strategy-card__stat-label'>Min Capital</span>
                </div>
                <div className='ats-strategy-card__stat'>
                    <span className='ats-strategy-card__stat-value'>{strategy.expectedFrequency}</span>
                    <span className='ats-strategy-card__stat-label'>Frequency</span>
                </div>
            </div>

            <AiRating rating={strategy.aiRating} />

            {isExpanded && (
                <div className='ats-strategy-card__detail'>
                    <p className='ats-strategy-card__desc'>{strategy.description}</p>
                    <div className='ats-strategy-card__compat'>
                        <span className='ats-label'>Compatible Markets:</span>
                        <div className='ats-strategy-card__markets'>
                            {strategy.marketCompatibility.map(m => (
                                <span key={m} className='ats-market-chip'>{m}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <button
                className={`ats-deploy-btn ${isDeployed ? 'ats-deploy-btn--active' : ''}`}
                onClick={handleDeploy}
            >
                {isDeployed ? '✓ Active in Bot Builder' : '⚡ Deploy to Bot Builder'}
            </button>
        </div>
    );
});

// ─── Strategy Marketplace ─────────────────────────────────────
const StrategyMarketplace: React.FC = observer(() => {
    const { strategies, injectedAssetId } = aiTradingStore;
    const [filter, setFilter] = useState<string>('ALL');
    const difficulties = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

    const filtered = filter === 'ALL' ? strategies : strategies.filter(s => s.difficulty === filter);

    return (
        <div className='ats-strategy-marketplace'>
            <div className='ats-marketplace-header'>
                <div className='ats-marketplace-title'>
                    🧠 AI Strategy Marketplace
                </div>
                <div className='ats-marketplace-subtitle'>
                    {strategies.length} AI-generated strategies available
                </div>
            </div>

            <div className='ats-difficulty-filter'>
                {difficulties.map(d => (
                    <button
                        key={d}
                        className={`ats-filter-btn ${filter === d ? 'ats-filter-btn--active' : ''}`}
                        onClick={() => setFilter(d)}
                    >
                        {d}
                    </button>
                ))}
            </div>

            <div className='ats-strategy-list'>
                {filtered.map(strategy => (
                    <StrategyCard key={strategy.id} strategy={strategy} deployedId={injectedAssetId} />
                ))}
            </div>
        </div>
    );
});

export default StrategyMarketplace;
