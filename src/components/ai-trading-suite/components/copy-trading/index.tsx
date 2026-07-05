import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { toast } from 'react-toastify';
import { aiTradingStore } from '../../store/ai-trading-store';
import { TCopyTrader } from '../../store/types';

// ─── Connection Status ────────────────────────────────────────
const ConnectionStatus: React.FC<{ trader: TCopyTrader }> = ({ trader }) => {
    if (!trader.isConnected) return null;
    const steps = [
        { label: 'Connected', done: ['CONNECTED', 'RECEIVING', 'MIRRORING'].includes(trader.syncStatus) },
        { label: 'Receiving Trades', done: ['RECEIVING', 'MIRRORING'].includes(trader.syncStatus) },
        { label: 'Trade Mirroring Active', done: trader.syncStatus === 'MIRRORING' },
        { label: 'Execution Pipeline Ready', done: trader.syncStatus === 'MIRRORING' },
        { label: 'Synchronization Healthy', done: trader.syncStatus === 'MIRRORING' },
    ];
    return (
        <div className='ats-conn-status'>
            {steps.map((step, i) => (
                <div key={i} className={`ats-conn-status__step ${step.done ? 'ats-conn-status__step--done' : ''}`}>
                    <span className='ats-conn-status__dot'>{step.done ? '✓' : '○'}</span>
                    <span className='ats-conn-status__label'>{step.label}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Avatar ───────────────────────────────────────────────────
const Avatar: React.FC<{ initials: string; color: string }> = ({ initials, color }) => (
    <div className='ats-avatar' style={{ background: color }}>
        {initials}
    </div>
);

// ─── Stat Cell ────────────────────────────────────────────────
const StatCell: React.FC<{ label: string; value: string | number; positive?: boolean; negative?: boolean }> = ({
    label, value, positive, negative,
}) => (
    <div className='ats-stat-cell'>
        <span className='ats-stat-cell__value' style={{
            color: positive ? 'var(--ats-accent-green)' : negative ? 'var(--ats-accent-warn)' : undefined
        }}>
            {value}
        </span>
        <span className='ats-stat-cell__label'>{label}</span>
    </div>
);

// ─── Trader Card ─────────────────────────────────────────────
const TraderCard: React.FC<{ trader: TCopyTrader }> = observer(({ trader }) => {
    const handleToggle = useCallback(() => {
        aiTradingStore.toggleCopyTrader(trader.id);
        if (!trader.isConnected) {
            toast.info(`🔗 Connecting to ${trader.name}...`, { autoClose: 2000 });
            setTimeout(() => {
                toast.success(`✅ Trade Synchronization Enabled — ${trader.name}`, { autoClose: 4000 });
            }, 1800);
        } else {
            toast.info(`⏸ Disconnected from ${trader.name}`, { autoClose: 2500 });
        }
    }, [trader.id, trader.name, trader.isConnected]);

    return (
        <div className={`ats-trader-card ${trader.isConnected ? 'ats-trader-card--connected' : ''}`}>
            <div className='ats-trader-card__header'>
                <Avatar initials={trader.avatarInitials} color={trader.avatarColor} />
                <div className='ats-trader-card__info'>
                    <div className='ats-trader-card__name'>
                        {trader.name}
                        <span className='ats-trader-badge'>{trader.badge}</span>
                    </div>
                    <div className='ats-trader-card__style'>{trader.style}</div>
                    <div className='ats-trader-card__status'>
                        <span className={`ats-status-dot ${trader.isConnected ? 'ats-status-dot--live' : ''}`} />
                        {trader.currentStatus}
                    </div>
                </div>
                <div className='ats-trader-card__latency' title='Latency'>
                    {trader.latency}ms
                </div>
            </div>

            <div className='ats-trader-card__stats'>
                <StatCell label='Win Rate' value={`${trader.winRate}%`} positive />
                <StatCell label='Monthly' value={`+${trader.monthlyReturn}%`} positive />
                <StatCell label='Total Profit' value={`$${trader.totalProfit.toLocaleString()}`} positive />
                <StatCell label='Drawdown' value={`${trader.drawdown}%`} negative />
                <StatCell label='Followers' value={trader.followers.toLocaleString()} />
                <StatCell label='Avg Duration' value={trader.avgTradeDuration} />
            </div>

            <div className='ats-trader-card__markets'>
                <span className='ats-label'>Markets: </span>
                {trader.preferredMarkets.map(m => (
                    <span key={m} className='ats-market-chip'>{m}</span>
                ))}
            </div>

            <div className='ats-trader-card__health'>
                <div className='ats-trader-card__health-bar'>
                    <div
                        className='ats-trader-card__health-fill'
                        style={{ width: `${trader.connectionHealth}%` }}
                    />
                </div>
                <span className='ats-label'>Connection: {trader.connectionHealth}%</span>
            </div>

            <ConnectionStatus trader={trader} />

            <button
                className={`ats-sync-btn ${trader.isConnected ? 'ats-sync-btn--active' : ''}`}
                onClick={handleToggle}
            >
                {trader.isConnected
                    ? `⏸ Disconnect — ${trader.syncStatus === 'MIRRORING' ? 'Mirroring Active' : trader.syncStatus}`
                    : '🔗 Sync Auto-Copy'}
            </button>
        </div>
    );
});

// ─── Copy Trading ─────────────────────────────────────────────
const CopyTrading: React.FC = observer(() => {
    const { copyTraders } = aiTradingStore;
    const activeCount = copyTraders.filter(t => t.isConnected).length;

    return (
        <div className='ats-copy-trading'>
            <div className='ats-copy-header'>
                <div className='ats-copy-title'>
                    <span className='ats-pulse-dot' />
                    Copy Trading Network
                </div>
                <div className='ats-copy-subtitle'>
                    {activeCount > 0
                        ? `${activeCount} active sync${activeCount > 1 ? 's' : ''} — trades mirroring`
                        : 'Select a trader to begin copy trading'}
                </div>
            </div>

            <div className='ats-copy-list'>
                {copyTraders.map(trader => (
                    <TraderCard key={trader.id} trader={trader} />
                ))}
            </div>
        </div>
    );
});

export default CopyTrading;
