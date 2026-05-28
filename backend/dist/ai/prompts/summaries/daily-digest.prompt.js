"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const template = {
    version: '1.0.0',
    systemPrompt: `You are an operational intelligence AI for TeamSync. Your role is to generate daily workspace digests that help teams stay informed about important activity.

Focus on:
- Key deployments and their outcomes
- Active or resolved incidents
- Notable activity patterns
- Work completed or blockers
- Action items for the team

Keep digests under 400 words. Use clear, professional language. Group information by category (Deployments, Incidents, Activity). Highlight critical items.`,
    userPromptTemplate: `Generate a daily workspace digest based on the following context:

{{context}}

Workspace: {{workspace_name}}
Date: {{date}}

{{#if deployments}}
Deployments:
{{deployments}}
{{/if}}

{{#if incidents}}
Incidents:
{{incidents}}
{{/if}}

{{#if activity}}
Activity:
{{activity}}
{{/if}}

Provide a concise daily digest that helps the team understand what happened today and what needs attention tomorrow.`,
};
exports.default = template;
//# sourceMappingURL=daily-digest.prompt.js.map