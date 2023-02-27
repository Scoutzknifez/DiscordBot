import { config } from 'dotenv';
import { 
    Client, 
    GatewayIntentBits, 
    Routes, 
    Events, 
    Partials, 
    REST 
} from 'discord.js';

// Commands
import { handleCommand } from "./commandHandler.js";
import { infoCommand } from './commands/info.js';
import { remindCommand } from './commands/remind.js';
import { ctaCommand } from "./commands/cta.js";

// Others
import { lastMessageSentIsCrucial, loadJson } from './utility.js';
import { logger } from "./Logger.js";

// Load the .env file and set variables to values
config();
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// Allows slash commands to be sent up
const rest = new REST({ version: '10' }).setToken(TOKEN);

// Bot wide
let isLoggedIn = false;
let isProduction = true; // Start out as true to safeguard

// Rate Limit
let isRateLimited = false;
let rateLimitResetTime = 0;

// All active slash commands
const commands = [
    infoCommand,
    remindCommand,
];

const developmentCommands = [
    ctaCommand
];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Message,
        Partials.Reaction
    ],
    rest: {
        rejectOnRateLimit: (rateLimitInfo) => {
            if (!isLoggedIn) {
                return false;
            }

            isRateLimited = true;
            let currentTime = Date.now();
            rateLimitResetTime = currentTime + rateLimitInfo.timeToReset;

            return !lastMessageSentIsCrucial;
        }
    }
});

client.on(Events.ClientReady, async () => {
    let promises = [];

    if (!isProduction) {
        developmentCommands.forEach(command => {
            commands.push(command);
        });
    }

    client.guilds.cache.map(guild => {
        console.log(`Sending up slash command information to ${guild.id}...`);
        promises.push(
            rest.put(Routes.applicationGuildCommands(CLIENT_ID, guild.id), {
                body: commands
            })
        );
    });

    await Promise.all(promises);

    console.log("The bot is ready...");
});

client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
    // Check if the member wasn't boosting before, but is now.
    if (!oldMember.premiumSince && newMember.premiumSince) {
        // Member started boosting.
        console.log(`${newMember.displayName} started boosting this server!`);
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    await handleCommand(interaction);
});

async function handleApplicationConfiguration() {
    // Start importing the application configuration file
    console.log("Loading bot configuration...");
    let applicationConfiguration = await loadJson('./config.json');

    if (applicationConfiguration == null) {
        console.log("Could not load the bot configuration file!");
        return;
    }
    
    let configurations = applicationConfiguration.default;
    isProduction = configurations.isProduction;

    console.log(`Starting bot in ${isProduction ? "PRODUCTION" : "DEVELOPMENT"} environment...`);
}

async function main() {
    try {
        await handleApplicationConfiguration();

        logger.log("Bot is logging in...");
        await client.login(TOKEN);
        logger.log("Bot is logged in!");
    } catch (err) {
        console.log(err);
    }
}

main();

process.on('uncaughtException', (err) => {
    if (err.timeToReset) {
        logger.log("Caught a RateLimitError...");
        return;
    }

    console.log(err);
    process.exit();
});

export { client, isProduction, isRateLimited, rateLimitResetTime };