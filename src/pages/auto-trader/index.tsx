import React, { useState } from 'react';
import './auto-trader.scss';

type Strategy = {
    id: string;
    name: string;
    description: string;
    condition: string;
    tradeSetup: string;
    tag: 'ai' | 'pro' | 'basic';
    accentColor: string;
};

const STRATEGIES: Strategy[] = [
    {
        id: 'over1',
        name: 'Over 1',
        description: 'Trades Over when last digit is ≤ 1',
        condition: 'If the last digit is ≤ 1',
        tradeSetup: 'Over 1',
        tag: 'basic',
        accentColor: '#00c2e0',
    },
    {
        id: 'over1pro',
        name: 'Over 1 Pro',
        description: 'Trades Over when last 2 digits are ≤ 1',
        condition: 'If the last 2 digits are ≤ 1',
        tradeSetup: 'Over 1',
        tag: 'pro',
        accentColor: '#00d26a',
    },
    {
        id: 'under8',
        name: 'Under 8',
        description: 'Trades Under when last digit is ≥ 8',
        condition: 'If the last digit is ≥ 8',
        tradeSetup: 'Under 8',
        tag: 'basic',
        accentColor: '#00c2e0',
    },
    {
        id: 'under8pro',
        name: 'Under 8 Pro',
        description: 'Trades Under when last 2 digits are ≥ 8',
        condition: 'If the last 2 digits are ≥ 8',
        tradeSetup: 'Under 8',
        tag: 'pro',
        accentColor: '#00d26a',
    },
    {
        id: 'even_ai',
        name: 'Even AI',
        description: 'AI-powered Even/Odd with adaptive switching',
        condition: 'AI confidence ≥ 80%',
        tradeSetup: 'Even',
        tag: 'ai',
        accentColor: '#ff6444',
    },
    {
        id: 'matches_ai',
        name: 'Matches AI',
        description: 'Match prediction using neural patterns',
        condition: 'Pattern strength ≥ 75%',
        tradeSetup: 'Matches',
        tag: 'ai',
        accentColor: '#7c3aed',
    },
    {
        id: 'differ_ai',
        name: 'Differ AI',
        description: 'Differ strategy with martingale recovery',
        condition: 'Differ streak ≥ 3',
        tradeSetup: 'Differs',
        tag: 'ai',
        accentColor: '#ff9f1c',
    },
    {
        id: 'over5',
        name: 'Over 5',
        description: 'Over when digit consistently above 5',
        condition: 'If the last digit is ≤ 5',
        tradeSetup: 'Over 5',
        tag: 'basic',
        accentColor: '#00c2e0',
    },
];

const DUAL_EDGE: Strategy[] = [
    {
        id: 'de1',
        name: 'Dual Even/Odd',
        description: 'Simultaneous Even and Odd with hedge',
        condition: 'Net exposure < 20%',
        tradeSetup: 'Even + Odd',
        tag: 'pro',
        accentColor: '#7c3aed',
    },
    {
        id: 'de2',
        name: 'Dual Over/Under',
        description: 'Over 4 and Under 5 simultaneously',
        condition: 'Market stable',
        tradeSetup: 'Over 4 + Under 5',
        tag: 'pro',
        accentColor: '#ff6444',
    },
    {
        id: 'de3',
        name: 'Dual Match/Differ',
        description: 'Match + Differ hedge on volatile markets',
        condition: 'Volatility ≥ 50%',
        tradeSetup: 'Match + Differ',
        tag: 'ai',
        accentColor: '#00d26a',
    },
];

const TAG_COLORS: Record<string, string> = {
    ai: '#ff6444',
    pro: '#00d26a',
    basic: '#00c2e0',
};

const AutoTrader: React.FC = () => {
    const [mainTab, setMainTab] = useState<'ai_robots' | 'dual_edge'>('ai_robots');
    const [comboTab, setComboTab] = useState<'solo' | 'combo'>('solo');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeBots, setActiveBots] = useState<Set<string>>(new Set());

    const strategies = mainTab === 'ai_robots' ? STRATEGIES : DUAL_EDGE;

    const toggleBot = (id: string) => {
        setActiveBots(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <div className='auto-trader'>
            {/* Main tabs */}
            <div className='auto-trader__main-tabs'>
                {[
                    { id: 'ai_robots', label: 'AI Robots' },
                    { id: 'dual_edge', label: 'Dual Edge' },
                ].map(t => (
                    <button
                        key={t.id}
                        className={`auto-trader__main-tab ${mainTab === t.id ? 'auto-trader__main-tab--active' : ''}`}
                        onClick={() => setMainTab(t.id as typeof mainTab)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Solo/Combo sub-tabs */}
            {mainTab === 'ai_robots' && (
                <div className='auto-trader__sub-tabs'>
                    {[
                        { id: 'solo', label: 'Solo' },
                        { id: 'combo', label: 'Combo' },
                    ].map(t => (
                        <button
                            key={t.id}
                            className={`auto-trader__sub-tab ${comboTab === t.id ? 'auto-trader__sub-tab--active' : ''}`}
                            onClick={() => setComboTab(t.id as typeof comboTab)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Strategy cards */}
            <div className='auto-trader__cards'>
                {strategies.map(s => {
                    const isActive = activeBots.has(s.id);
                    const isExpanded = expandedId === s.id;
                    return (
                        <div
                            key={s.id}
                            className={`auto-trader__card ${isActive ? 'auto-trader__card--running' : ''}`}
                            style={{ borderColor: isActive ? s.accentColor : 'rgba(255,255,255,0.08)' }}
                        >
                            <div className='auto-trader__card-header'>
                                <div className='auto-trader__card-title-row'>
                                    <span className='auto-trader__card-name'>{s.name}</span>
                                    <span
                                        className='auto-trader__card-tag'
                                        style={{
                                            background: TAG_COLORS[s.tag] + '20',
                                            color: TAG_COLORS[s.tag],
                                            border: `1px solid ${TAG_COLORS[s.tag]}40`,
                                        }}
                                    >
                                        {s.tag.toUpperCase()}
                                    </span>
                                </div>
                                {isActive && <span className='auto-trader__running-badge'>● Running</span>}
                            </div>

                            <div className='auto-trader__card-body'>
                                <div className='auto-trader__card-field'>
                                    <span className='auto-trader__card-field-label'>Condition</span>
                                    <span className='auto-trader__card-field-val'>{s.condition}</span>
                                </div>
                                <div className='auto-trader__card-chip'>{s.tradeSetup}</div>
                            </div>

                            {isExpanded && (
                                <div className='auto-trader__card-detail'>
                                    <div className='auto-trader__card-field'>
                                        <span className='auto-trader__card-field-label'>Trade Setup</span>
                                        <span className='auto-trader__card-field-val'>{s.tradeSetup}</span>
                                    </div>
                                    <div className='auto-trader__card-field'>
                                        <span className='auto-trader__card-field-label'>Description</span>
                                        <span className='auto-trader__card-field-val'>{s.description}</span>
                                    </div>
                                </div>
                            )}

                            <div className='auto-trader__card-footer'>
                                <button
                                    className='auto-trader__expand-btn'
                                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                                >
                                    {isExpanded ? '▴ Less' : '▾ Details'}
                                </button>
                                <button
                                    className={`auto-trader__open-btn ${isActive ? 'auto-trader__open-btn--stop' : ''}`}
                                    style={
                                        isActive
                                            ? {}
                                            : {
                                                  background: s.accentColor + '20',
                                                  borderColor: s.accentColor + '60',
                                                  color: s.accentColor,
                                              }
                                    }
                                    onClick={() => toggleBot(s.id)}
                                >
                                    {isActive ? '■ Stop bot' : 'Open bot'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Active bots summary */}
            {activeBots.size > 0 && (
                <div className='auto-trader__active-summary'>
                    <span className='auto-trader__active-dot'>●</span>
                    <span>
                        {activeBots.size} bot{activeBots.size > 1 ? 's' : ''} running: {[...activeBots].join(', ')}
                    </span>
                </div>
            )}
        </div>
    );
};

export default AutoTrader;
