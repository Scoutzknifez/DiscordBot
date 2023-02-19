import { SlashCommandBuilder } from '@discordjs/builders';
import { client } from "../app.js";

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const FIVE_MINUTES = 5 * ONE_MINUTE;
const TEN_MINUTES = 10 * ONE_MINUTE;

const remindCommand = new SlashCommandBuilder()
    .setName("remind")
    .setDescription("A remind command to ping you at a later time.")
    .addStringOption(option => 
        option.setName("content")
            .setDescription("The type of content that pops on timer")
            .addChoices(
                { name: "Core", value: "Core" },
                { name: "Vortex", value: "Vortex" },
                { name: "Chest", value: "Chest" },
                { name: "Fiber", value: "Fiber" },
                { name: "Wood", value: "Wood" },
                { name: "Ore", value: "Ore" },
                { name: "Leather", value: "Leather" },
                { name: "Stone", value: "Stone" }
            )
            .setRequired(true)
    )
    .addStringOption(option => 
        option.setName("location")
            .setDescription("The location of the content")
            .setRequired(true)
    )
    .addIntegerOption(option => 
        option.setName("hours")
            .setDescription("The amount of hours until the reminder")
            .setMinValue(0)
            .setMaxValue(23)
    )
    .addIntegerOption(option => 
        option.setName("minutes")
            .setDescription("The amount of minutes until the reminder")
            .setMinValue(0)
            .setMaxValue(999)
    )
    .addIntegerOption(option => 
        option.setName("seconds")
            .setDescription("The amount of seconds until the reminder")
            .setMinValue(0)
            .setMaxValue(999)
    )
    .toJSON();

async function handler(interaction) {
    let commandArgs = interaction.options._hoistedOptions;

    let argsMap = {
        timeUntilPop: 0
    };

    commandArgs.forEach(option => {
        let optionType = option.name;

        if (optionType == "seconds") {
            let seconds = option.value;
            argsMap.timeUntilPop += seconds * 1000;
        } 
        else if (optionType == "minutes") {
            let minutes = option.value;
            argsMap.timeUntilPop += minutes * 60000;
        }
        else if (optionType == "hours") {
            let hours = option.value;
            argsMap.timeUntilPop += hours * 3600000;
        } else {
            argsMap[optionType] = option.value;
        }        
    });

    if (argsMap.timeUntilPop <= 0) {
        await interaction.reply({ content: `Please re-enter this command with time fields filled out!`, ephemeral: true });
        return;
    }

    let timeField = createTimeField(argsMap);
    let response = `<@${interaction.user.id}> The **${argsMap.content} (${argsMap.location})** pops in **${timeField}**`;

    await interaction.reply(response);

    setTimeout(() => {
        argsMap.timeUntilPop -= 1000;
        updateInteraction(interaction, argsMap);
    }, 1000);

    if (argsMap.timeUntilPop < FIVE_MINUTES) {
        return;
    }

    setTimeout(async () => {
        try {
            let channel = await client.channels.fetch(interaction.channelId);
            await channel.send(`<@${interaction.user.id}> This is your **5 MINUTE** reminder about the **${argsMap.content}** in **${argsMap.location}**!`);    
        } catch (err) {
            console.log(err);
        }
    }, argsMap.timeUntilPop - FIVE_MINUTES);

    if (argsMap.timeUntilPop < TEN_MINUTES) {
        return;
    }

    setTimeout(async () => {
        try {
            let channel = await client.channels.fetch(interaction.channelId);
            await channel.send(`<@${interaction.user.id}> This is your **10 MINUTE** reminder about the **${argsMap.content}** in **${argsMap.location}**!`);
        } catch (err) {
            console.log(err);
        }
    }, argsMap.timeUntilPop - TEN_MINUTES);
}

async function updateInteraction(interaction, args) {
    if (args.timeUntilPop <= 0) {
        try {
            let response = `<@${interaction.user.id}> The **${args.content}** in **${args.location}** is **LIVE**`;
            interaction.editReply(response);
        } catch (err) {
            console.log(err);

            let channel = await client.channels.fetch(interaction.channelId);
            await channel.send(`<@${interaction.user.id}> The **${args.content}** in **${args.location}** is **LIVE**`);
        }
        return;
    }

    try {
        let response = `<@${interaction.user.id}> The **${args.content} (${args.location})** pops in **${createTimeField(args)}**`;
        interaction.editReply(response);
    } catch (err) {
        console.log(err);
    } 

    setTimeout(() => {
        args.timeUntilPop -= 1000;
        updateInteraction(interaction, args);
    }, 1000);
}

function createTimeField(argsMap) {
    let timeTillLive = argsMap.timeUntilPop;
    let seconds = 0;
    let minutes = 0;
    let hours = 0;

    while (timeTillLive >= 3600000) {
        hours++;
        timeTillLive -= 3600000; 
    }

    while (timeTillLive >= 60000) {
        minutes++;
        timeTillLive -= 60000; 
    }

    while (timeTillLive > 0) {
        seconds++;
        timeTillLive -= 1000; 
    }

    let timeField = "";

    if (hours > 0) {
        timeField = `${hours}h:${minutes > 9 ? minutes : `0${minutes}`}m:${seconds > 9 ? seconds : `0${seconds}`}s`;
    }
    else if (minutes > 0) {
        timeField = `${minutes}m:${seconds > 9 ? seconds : `0${seconds}`}s`;
    }
    else {
        timeField = `${seconds}s`;
    }

    return timeField;
}

export { remindCommand, handler };