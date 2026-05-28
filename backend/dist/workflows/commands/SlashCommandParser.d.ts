export interface ParsedCommand {
    command: string;
    args: Record<string, unknown>;
    raw: string;
}
export declare class SlashCommandParser {
    /**
     * Parse a slash command string
     */
    static parse(commandString: string): ParsedCommand;
    /**
     * Validate command format
     */
    static validate(commandString: string): boolean;
    /**
     * Extract command name only
     */
    static extractCommandName(commandString: string): string;
}
//# sourceMappingURL=SlashCommandParser.d.ts.map