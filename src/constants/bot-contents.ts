type TTabsTitle = {
    [key: string]: string | number;
};

type TDashboardTabIndex = {
    [key: string]: number;
};

export const tabs_title: TTabsTitle = Object.freeze({
    WORKSPACE: 'Workspace',
    CHART: 'Chart',
});

export const DBOT_TABS: TDashboardTabIndex = Object.freeze({
    DASHBOARD: 0,
    BOT_BUILDER: 1,
    DTRADER: 2,
    SPEEDBOT: 3,
    ANALYSIS_TOOL: 4,
    AUTO_TRADER: 5,
    MANUAL_TRADER: 6,
    BULK_TRADER: 7,
    HEDGING: 8,
    CHART: 9,
    TUTORIAL: 10,
    AI_TRADING: 11,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-dtrader',
    'id-speedbot',
    'id-analysis-tool',
    'id-auto-trader',
    'id-manual-trader',
    'id-bulk-trader',
    'id-hedging',
    'id-charts',
    'id-tutorials',
    'id-ai-trading',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
