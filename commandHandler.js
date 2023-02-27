import { handler as infoHandler } from "./commands/info.js";
import { handler as remindHandler } from "./commands/remind.js";
import { handler as ctaHandler } from "./commands/cta.js";
import { isProduction } from "./app.js";

async function handleCommand(interaction) {
    // Production commands
    if (interaction.commandName == "info") {
        await infoHandler(interaction);
    }
    else if (interaction.commandName == "remind") {
        await remindHandler(interaction);
    }
    // Development commands
    else if (interaction.commandName == "cta") {
        if (isProduction) {
            return;
        }

        await ctaHandler(interaction);
    }
}

export { handleCommand };