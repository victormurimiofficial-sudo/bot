/**
 * AI Trading Suite — Phase 1–8 Enterprise Feature Expansion
 *
 * Phases:
 *   1. Floating AI Trading Intelligence Assistant (scanner + strategy injection)
 *   2. Market Analytics Center (tick velocity, digit stats, heatmaps)
 *   3. AI Opportunity Ranking Engine
 *   4. Copy Trading Network
 *   5. AI Strategy Marketplace
 *   6. Automated Market Insights
 *   7. Global AI Notification Center
 *   8. Modular, typed, performant architecture (MobX, TypeScript, SCSS, lazy-safe)
 *
 * Integration: render <AiTradingSuite /> anywhere in the app (e.g. app-content.jsx).
 * Everything is self-contained — no changes to existing stores or routes required.
 */

import React, { useEffect } from 'react';
import { aiTradingStore } from './store/ai-trading-store';
import FloatingAssistant from './components/floating-assistant';
import './ai-trading-suite.scss';

/**
 * AiTradingSuite
 *
 * Mount once near the root of the app (inside ThemeProvider / ToastContainer scope).
 * Starts the simulated market data engine on mount and cleans up on unmount.
 */
// Track mount count to guard the singleton against HMR double-dispose
let _mountCount = 0;

const AiTradingSuite: React.FC = () => {
    useEffect(() => {
        _mountCount++;
        return () => {
            _mountCount--;
            // Only dispose when truly unmounted (not during HMR remounts)
            if (_mountCount === 0) {
                aiTradingStore.dispose();
            }
        };
    }, []);

    return <FloatingAssistant />;
};

export default AiTradingSuite;
export { aiTradingStore };
