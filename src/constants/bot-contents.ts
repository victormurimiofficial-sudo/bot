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
    SMART_READER: 3,
    SPEEDBOT: 4,
    ANALYSIS_TOOL: 5,
    AUTO_TRADER: 6,
    MANUAL_TRADER: 7,
    BULK_TRADER: 8,
    HEDGING: 9,
    CHART: 10,
    TUTORIAL: 11,
    AI_TRADING: 12,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-dtrader',
    'id-smart-reader',
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
