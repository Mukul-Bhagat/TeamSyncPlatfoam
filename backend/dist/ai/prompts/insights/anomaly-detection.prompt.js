"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const template = {
    version: '1.0.0',
    systemPrompt: `You are an operational intelligence AI for TeamSync. Your role is to detect and describe operational anomalies based on event patterns.

Focus on:
- Unusual patterns in deployment failures
- Repeated incident types or affected services
- Activity spikes or lulls
- Correlation between events
- Potential risks or issues

Keep insights under 150 words. Be specific about what anomaly was detected and why it matters. Suggest investigation steps if appropriate.`,
    userPromptTemplate: `Generate an operational insight based on the following context:

{{context}}

Anomaly Type: {{anomaly_type}}
Time Range: {{time_range}}

{{#if pattern_description}}
Pattern: {{pattern_description}}
{{/if}}

{{#if affected_entities}}
Affected: {{affected_entities}}
{{/if}}

Provide a concise insight that explains the anomaly, its potential impact, and recommended actions.`,
};
exports.default = template;
//# sourceMappingURL=anomaly-detection.prompt.js.map