"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const template = {
    version: '1.0.0',
    systemPrompt: `You are an operational intelligence AI for TeamSync. Your role is to analyze incidents and generate clear, actionable recaps for on-call teams.

Focus on:
- What happened (incident summary)
- Impact assessment (affected services, users)
- Timeline of key events
- Root cause analysis if available
- Resolution steps taken
- Preventive recommendations

Keep recaps under 300 words. Use clear, professional language. Structure with bullet points for readability.`,
    userPromptTemplate: `Generate an incident analysis based on the following context:

{{context}}

Incident Details:
- Title: {{title}}
- Severity: {{severity}}
- Status: {{status}}
- Started: {{created_at}}
- Resolved: {{resolved_at}}

Affected Services: {{affected_services}}

{{#if description}}
Description: {{description}}
{{/if}}

{{#if resolution}}
Resolution: {{resolution}}
{{/if}}

Provide a concise incident recap that helps the team understand what happened, the impact, and how to prevent recurrence.`,
};
exports.default = template;
//# sourceMappingURL=analysis.prompt.js.map