"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlashCommandParser = void 0;
class SlashCommandParser {
    /**
     * Parse a slash command string
     */
    static parse(commandString) {
        const trimmed = commandString.trim();
        const parts = trimmed.split(/\s+/);
        const command = parts[0].replace(/^\//, '');
        const args = {};
        let i = 1;
        while (i < parts.length) {
            const part = parts[i];
            // Handle named arguments (--key value)
            if (part.startsWith('--')) {
                const key = part.substring(2);
                const nextPart = parts[i + 1];
                if (nextPart && !nextPart.startsWith('--')) {
                    // Try to parse as JSON for complex values
                    try {
                        args[key] = JSON.parse(nextPart);
                    }
                    catch {
                        args[key] = nextPart;
                    }
                    i += 2;
                }
                else {
                    args[key] = true;
                    i += 1;
                }
            }
            // Handle quoted strings
            else if (part.startsWith('"') || part.startsWith("'")) {
                const quote = part[0];
                let value = part.substring(1);
                // Check if the quote is closed in the same part
                if (value.endsWith(quote)) {
                    value = value.slice(0, -1);
                    args[`arg${Object.keys(args).length}`] = value;
                    i += 1;
                }
                else {
                    // Multi-part quoted string
                    while (i + 1 < parts.length && !parts[i + 1].endsWith(quote)) {
                        value += ' ' + parts[i + 1];
                        i += 1;
                    }
                    if (i + 1 < parts.length) {
                        value += ' ' + parts[i + 1].slice(0, -1);
                        i += 2;
                    }
                    args[`arg${Object.keys(args).length}`] = value;
                }
            }
            // Handle positional arguments
            else {
                args[`arg${Object.keys(args).length}`] = part;
                i += 1;
            }
        }
        return {
            command,
            args,
            raw: commandString,
        };
    }
    /**
     * Validate command format
     */
    static validate(commandString) {
        const trimmed = commandString.trim();
        return trimmed.startsWith('/');
    }
    /**
     * Extract command name only
     */
    static extractCommandName(commandString) {
        const trimmed = commandString.trim();
        const parts = trimmed.split(/\s+/);
        return parts[0].replace(/^\//, '');
    }
}
exports.SlashCommandParser = SlashCommandParser;
//# sourceMappingURL=SlashCommandParser.js.map