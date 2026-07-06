import React from 'react';
import { observer } from 'mobx-react-lite';
import { aiTradingStore } from '../../store/ai-trading-store';

// Mini SVG equity curve
const EquityCurve: React.FC<{ points: number[] }> = ({ points }) => {
    if (points.length < 2) return null;
    const W = 280,
        H = 60,
        pad = 4;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (W - pad * 2));
    const ys = points.map(v => H - pad - ((v - min) / range) * (H - pad * 2));
    const pathD = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
    const fillD = `${pathD} L${xs[xs.length - 1].toFixed(1)},${H} L${xs[0].toFixed(1)},${H} Z`;
    const last = points[points.length - 1];
    const first = points[0];
    const isUp = last >= first;
    const stroke = isUp ? '#00b894' : '#e17055';
    const fillTop = isUp ? 'rgba(0,184,148,0.25)' : 'rgba(225,112,85,0.25)';

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className='ats-pd-curve' preserveAspectRatio='none'>
            <defs>
                <linearGradient id='curveGrad' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor={fillTop} />
                    <stop offset='100%' stopColor='rgba(0,0,0,0)' />
                </linearGradient>
            </defs>
            <path d={fillD} fill='url(#curveGrad)' />
            <path d={pathD} fill='none' stroke={stroke} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
    );
};

// Donut chart for win/loss
const WinLossDonut: React.FC<{ winRate: number }> = ({ winRate }) => {
    const R = 28,
        C = 2 * Math.PI * R;
    const winArc = (winRate / 100) * C;
    return (
        <svg viewBox='0 0 72 72' className='ats-pd-donut'>
            <circle cx='36' cy='36' r={R} fill='none' stroke='rgba(255,255,255,0.08)' strokeWidth='8' />
            <circle
                cx='36'
                cy='36'
                r={R}
                fill='none'
                stroke='#00b894'
                strokeWidth='8'
                strokeDasharray={`${winArc} ${C}`}
                strokeLinecap='round'
                transform='rotate(-90 36 36)'
            />
            <circle
                cx='36'
                cy='36'
                r={R}
                fill='none'
                stroke='#e17055'
                strokeWidth='8'
                strokeDasharray={`${C - winArc} ${C}`}
                strokeDashoffset={-winArc}
                strokeLinecap='round'
                transform='rotate(-90 36 36)'
            />
            <text x='36' y='40' textAnchor='middle' className='ats-pd-donut__text'>
                {winRate.toFixed(0)}%
            </text>
        </svg>
    );
};

const MetricCard: React.FC<{ label: string; value: string; sub?: string; accent?: string }> = ({
    label,
    value,
    sub,
    accent,
}) => (
    <div className='ats-pd-metric'>
        <div className='ats-pd-metric__label'>{label}</div>
        <div className='ats-pd-metric__value' style={accent ? { color: accent } : undefined}>
            {value}
        </div>
        {sub && <div className='ats-pd-metric__sub'>{sub}</div>}
    </div>
);

const pnlColor = (v: number) => (v >= 0 ? '#00b894' : '#e17055');
const pnlSign = (v: number) => (v >= 0 ? '+' : '');

const PerformanceDashboard: React.FC = observer(() => {
    const p = aiTradingStore.performance;

    return (
        <div className='ats-performance'>
            <div className='ats-pd__header'>
                <span className='ats-pulse-dot' />
                <span className='ats-pd__title'>Performance Dashboard</span>
                <span className='ats-pd__trades'>{p.totalTrades} trades tracked</span>
            </div>

            {/* P&L Row */}
            <div className='ats-pd-pnl'>
                <div className='ats-pd-pnl__item'>
                    <span className='ats-pd-pnl__label'>Total P&L</span>
                    <span className='ats-pd-pnl__value' style={{ color: pnlColor(p.totalPnL) }}>
                        {pnlSign(p.totalPnL)}${p.totalPnL.toFixed(2)}
                    </span>
                </div>
                <div className='ats-pd-pnl__item'>
                    <span className='ats-pd-pnl__label'>Today</span>
                    <span className='ats-pd-pnl__value' style={{ color: pnlColor(p.todayPnL) }}>
                        {pnlSign(p.todayPnL)}${p.todayPnL.toFixed(2)}
                    </span>
                </div>
                <div className='ats-pd-pnl__item'>
                    <span className='ats-pd-pnl__label'>This Week</span>
                    <span className='ats-pd-pnl__value' style={{ color: pnlColor(p.weekPnL) }}>
                        {pnlSign(p.weekPnL)}${p.weekPnL.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Equity Curve */}
            <div className='ats-pd-curve-wrap'>
                <div className='ats-pd-curve-label'>Equity Curve (24 sessions)</div>
                <EquityCurve points={p.equityCurve} />
            </div>

            {/* Win/Loss donut + stats */}
            <div className='ats-pd-winloss'>
                <div className='ats-pd-winloss__donut'>
                    <WinLossDonut winRate={p.winRate} />
                    <div className='ats-pd-winloss__legend'>
                        <span className='ats-pd-winloss__win'>▲ Win {p.winRate.toFixed(1)}%</span>
                        <span className='ats-pd-winloss__loss'>▼ Loss {p.lossRate.toFixed(1)}%</span>
                    </div>
                </div>
                <div className='ats-pd-winloss__stats'>
                    <MetricCard label='Avg Win' value={`$${p.avgWin.toFixed(2)}`} accent='#00b894' />
                    <MetricCard label='Avg Loss' value={`$${p.avgLoss.toFixed(2)}`} accent='#e17055' />
                    <MetricCard label='Best Trade' value={`$${p.bestTrade.toFixed(2)}`} accent='#00cec9' />
                    <MetricCard label='Worst' value={`$${p.worstTrade.toFixed(2)}`} accent='#e17055' />
                </div>
            </div>

            {/* Risk metrics */}
            <div className='ats-pd-risk-row'>
                <MetricCard label='Sharpe Ratio' value={p.sharpeRatio.toFixed(2)} sub='Risk-adjusted return' />
                <MetricCard label='Max Drawdown' value={`${p.maxDrawdown.toFixed(1)}%`} accent='#fdcb6e' />
                <MetricCard label='Profit Factor' value={p.profitFactor.toFixed(2)} sub='Win/loss ratio' />
            </div>

            {/* Streak */}
            <div className='ats-pd-streak'>
                <div className='ats-pd-streak__item ats-pd-streak__item--wins'>🔥 {p.consecutiveWins} Win Streak</div>
                <div className='ats-pd-streak__item ats-pd-streak__item--loss'>
                    ❄️ {p.consecutiveLosses} Loss Streak
                </div>
            </div>
        </div>
    );
});

export default PerformanceDashboard;
