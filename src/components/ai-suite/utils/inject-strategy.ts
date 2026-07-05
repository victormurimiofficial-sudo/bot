/**
 * Injects an AI-recommended strategy target into the live Bot Builder workspace.
 *
 * The Bot Builder is a Blockly workspace exposed globally as
 * `window.Blockly.derivWorkspace`. We locate the mandatory
 * `trade_definition_market` block and update its MARKET / SUBMARKET / SYMBOL
 * dropdowns in dependency order so the dynamic option lists resolve correctly.
 * Optionally the trade-options block's duration and stake are updated too.
 *
 * The operation is best-effort and fully guarded: if the workspace is not yet
 * mounted or a value is not selectable, we fail gracefully so the calling UI can
 * still present its confirmation experience without throwing.
 */

export interface TInjectParams {
    symbol: string;
    market?: string;
    submarket?: string;
    /** Optional numeric duration to set on the trade options block. */
    duration?: number;
    /** Optional numeric stake/amount to set on the trade options block. */
    stake?: number;
}

type TBlocklyField = { setValue?: (v: string) => void };
type TBlocklyBlock = {
    type: string;
    getField?: (name: string) => TBlocklyField | null;
    setFieldValue?: (value: string, name: string) => void;
    getFieldValue?: (name: string) => string;
};
type TBlocklyWorkspace = {
    getAllBlocks: () => TBlocklyBlock[];
};

const getWorkspace = (): TBlocklyWorkspace | null => {
    const blockly = (window as unknown as { Blockly?: { derivWorkspace?: TBlocklyWorkspace } }).Blockly;
    return blockly?.derivWorkspace ?? null;
};

const findBlock = (workspace: TBlocklyWorkspace, type: string): TBlocklyBlock | undefined =>
    workspace.getAllBlocks().find(block => block.type === type);

/** Safely set a field value, tolerating dynamic dropdown validation. */
const safeSetField = (block: TBlocklyBlock | undefined, value: string, field: string): boolean => {
    if (!block?.setFieldValue) return false;
    try {
        block.setFieldValue(value, field);
        return block.getFieldValue?.(field) === value;
    } catch {
        return false;
    }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Attempt to inject the strategy target. Resolves to `true` when the symbol was
 * applied to the workspace, `false` when it could only be partially applied or
 * the workspace was unavailable. Never throws.
 */
export const injectStrategy = async ({
    symbol,
    market = 'synthetic_index',
    submarket = 'random_index',
    duration,
    stake,
}: TInjectParams): Promise<boolean> => {
    try {
        const workspace = getWorkspace();
        if (!workspace) return false;

        const market_block = findBlock(workspace, 'trade_definition_market');
        if (!market_block) return false;

        // Set in dependency order: market -> submarket -> symbol.
        safeSetField(market_block, market, 'MARKET_LIST');
        await delay(60);
        safeSetField(market_block, submarket, 'SUBMARKET_LIST');
        await delay(60);
        const symbol_applied = safeSetField(market_block, symbol, 'SYMBOL_LIST');

        // Best-effort duration/stake update on the trade options block.
        if (typeof duration === 'number' || typeof stake === 'number') {
            const options_block = findBlock(workspace, 'trade_definition_tradeoptions');
            if (options_block) {
                if (typeof duration === 'number') safeSetField(options_block, String(duration), 'DURATION');
                if (typeof stake === 'number') safeSetField(options_block, String(stake), 'AMOUNT');
            }
        }

        return symbol_applied;
    } catch {
        return false;
    }
};
