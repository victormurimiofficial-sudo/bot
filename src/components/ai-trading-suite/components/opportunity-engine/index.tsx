import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { toast } from 'react-toastify';
import { aiTradingStore } from '../../store/ai-trading-store';
import { TOpportunity } from '../../store/types';

// ─── Readiness Badge ─────────────────────────────────────────
const ReadinessBadge: React.FC<{ readiness: string }> = ({ readiness }) => {
    const map: Record<string, string> = {
        READY: 'ats-readiness-badge--ready',
        PREPARING: 'ats-readiness-badge--preparing',
        STANDBY: 'ats-readiness-badge--standby',
    };
    const icons: Record<string, string> = { READY: '🚀', PREPARING: '⏳', STANDBY: '⏸' };
    return (
        <span className={`ats-readiness-badge ${map[readiness] ?? ''}`}>
            {icons[readiness]} {readiness}
        </span>
    );
};

// ─── Score Ring ───────────────────────────────────────────────
const ScoreRing: React.FC<{ score: number; rank: number }> = ({ score, rank }) => {
    const color = score >= 80 ? 'var(--ats-accent-green)' : score >= 60 ? 'var(--ats-accent)' : 'var(--ats-accent-warn)';
    return (
        <div className='ats-score-ring' style={{ borderColor: color }}>
            <div className='ats-score-ring__rank'>#{rank}</div>
            <div className='ats-score-ring__score' style={{ color }}>{score}</div>
            <div className='ats-score-ring__label'>score</div>
        </div>
    );
};

// ─── Opportunity Card ────────────────────────────────────────
const OpportunityCard: React.FC<{ opp: TOpportunity }> = observer(({ opp }) => {
    const isInjected = aiTradingStore.injectedAssetId === opp.id;

    const handleDeploy = useCallback(() => {
        aiTradingStore.injectStrategy(opp.id);
        toast.success(`🚀 ${opp.market} strategy deployed to Bot Builder!`, {
            position: 'top-right',
            autoClose: 4000,
        });
    }, [opp.id, opp.market]);

    return (
        <div className={`ats-opp-card ${isInjected ? 'ats-opp-card--deployed' : ''}`}>
            <div className='ats-opp-card__left'>
                <ScoreRing score={opp.score} rank={opp.rank} />
            </div>
            <div className='ats-opp-card__body'>
                <div className='ats-opp-card__header'>
                    <span className='ats-opp-card__market'>{opp.market}</span>
                    <ReadinessBadge readiness={opp.executionReadiness} />
                </div>
                <div className='ats-opp-card__grid'>
                    <div className='ats-opp-card__item'>
                        <span className='ats-label'>Strategy</span>
                        <span className='ats-value'>{opp.recommendedStrategy}</span>
                    </div>
                    <div className='ats-opp-card__item'>
                        <span className='ats-label'>Market State</span>
                        <span className={`ats-market-state ats-market-state--${opp.marketState.toLowerCase()}`}>{opp.marketState}</span>
                    </div>
                    <div className='ats-opp-card__item'>
                        <span className='ats-label'>AI Confidence</span>
                        <span className='ats-value ats-value--green'>{opp.aiConfidence}%</span>
                    </div>
                    <div className='ats-opp-card__item'>
                        <span className='ats-label'>Win Probability</span>
                        <span className='ats-value ats-value--green'>{opp.expectedProbability}%</span>
                    </div>
                    <div className='ats-opp-card__item'>
                        <span className='ats-label'>Risk</span>
                        <span className={`ats-risk-badge ats-risk-badge--${opp.expectedRisk.toLowerCase()}`}>{opp.expectedRisk}</span>
                    </div>
                    <div className='ats-opp-card__item'>
                        <span className='ats-label'>Duration</span>
                        <span className='ats-value'>{opp.estimatedDuration}</span>
                    </div>
                    <div className='ats-opp-card__item'>
                        <span className='ats-label'>Entry</span>
                        <span className='ats-value ats-value--entry'>{opp.suggestedEntry}</span>
                    </div>
                    <div className='ats-opp-card__item'>
                        <span className='ats-label'>Exit</span>
                        <span className='ats-value'>{opp.expectedExit}</span>
                    </div>
                </div>
                <button
                    className={`ats-deploy-btn ${isInjected ? 'ats-deploy-btn--active' : ''}`}
                    onClick={handleDeploy}
                >
                    {isInjected ? '✓ Deployed to Bot Builder' : '⚡ Deploy to Bot Builder'}
                </button>
            </div>
        </div>
    );
});

// ─── Opportunity Engine ───────────────────────────────────────
const OpportunityEngine: React.FC = observer(() => {
    const { opportunities } = aiTradingStore;

    return (
        <div className='ats-opportunity-engine'>
            <div className='ats-opp-header'>
                <div className='ats-opp-title'>
                    <span className='ats-pulse-dot' />
                    AI Opportunity Ranking Engine
                </div>
                <div className='ats-opp-subtitle'>
                    {opportunities.length} markets ranked by AI confidence
                </div>
            </div>

            <div className='ats-opp-list'>
                {opportunities.map(opp => (
                    <OpportunityCard key={opp.id} opp={opp} />
                ))}
            </div>
        </div>
    );
});

export default OpportunityEngine;
