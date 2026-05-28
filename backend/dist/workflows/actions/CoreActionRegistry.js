"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreActionRegistry = void 0;
const ActionRegistry_1 = require("./ActionRegistry");
const NotificationAction_1 = require("./NotificationAction");
const IncidentAction_1 = require("./IncidentAction");
const WebhookAction_1 = require("./WebhookAction");
const AIAction_1 = require("./AIAction");
const SummaryAction_1 = require("./SummaryAction");
const AssignUserAction_1 = require("./AssignUserAction");
const CreateChannelMessageAction_1 = require("./CreateChannelMessageAction");
class CoreActionRegistry {
    static instance;
    actionRegistry;
    constructor() {
        this.actionRegistry = ActionRegistry_1.ActionRegistry.getInstance();
    }
    static getInstance() {
        if (!CoreActionRegistry.instance) {
            CoreActionRegistry.instance = new CoreActionRegistry();
        }
        return CoreActionRegistry.instance;
    }
    /**
     * Register all core actions
     */
    registerCoreActions() {
        this.actionRegistry.registerCoreAction('send_notification', new NotificationAction_1.NotificationAction());
        this.actionRegistry.registerCoreAction('create_incident', new IncidentAction_1.IncidentAction());
        this.actionRegistry.registerCoreAction('trigger_webhook', new WebhookAction_1.WebhookAction());
        this.actionRegistry.registerCoreAction('AI_analysis', new AIAction_1.AIAction());
        this.actionRegistry.registerCoreAction('generate_summary', new SummaryAction_1.SummaryAction());
        this.actionRegistry.registerCoreAction('assign_user', new AssignUserAction_1.AssignUserAction());
        this.actionRegistry.registerCoreAction('create_channel_message', new CreateChannelMessageAction_1.CreateChannelMessageAction());
    }
    /**
     * Unregister all core actions
     */
    unregisterCoreActions() {
        this.actionRegistry.unregister('send_notification');
        this.actionRegistry.unregister('create_incident');
        this.actionRegistry.unregister('trigger_webhook');
        this.actionRegistry.unregister('AI_analysis');
        this.actionRegistry.unregister('generate_summary');
        this.actionRegistry.unregister('assign_user');
        this.actionRegistry.unregister('create_channel_message');
    }
}
exports.CoreActionRegistry = CoreActionRegistry;
//# sourceMappingURL=CoreActionRegistry.js.map