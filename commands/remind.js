import { SlashCommandBuilder } from '@discordjs/builders';
import { client } from "../app.js";

const ONE_MINUTE = 60000;
const FIVE_MINUTES = 300000;
const TEN_MINUTES = FIVE_MINUTES * 2;
const FIFTEEN_MINUTES = FIVE_MINUTES * 3;

const remindCommand = new SlashCommandBuilder()
    .setName("remind")
    .setDescription("A remind command to ping you at a later time.")
    .addStringOption(option => 
        option.setName("content")
            .setDescription("The type of content that pops on timer")
            .addChoices(
                { name: "Core", value: "Core" },
                { name: "Vortex", value: "Vortex" },
                { name: "Chest", value: "Chest" }
            )
    )
    .addStringOption(option => 
        option.setName("location")
            .setDescription("The location of the content")
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
    ).toJSON();

async function handler(interaction) {
    let commandArgs = interaction.options._hoistedOptions;

    let argsMap = {};

    commandArgs.forEach(option => {
        let optionType = option.name;
        argsMap[optionType] = option.value;
    });

    while (argsMap.seconds >= 60) {
        argsMap.seconds -= 60;
        argsMap.minutes++;
    }

    while (argsMap.minutes >= 60) {
        argsMap.minutes -= 60;
        argsMap.hours++;
    }

    if (argsMap.seconds <= 0 && argsMap.minutes <= 0 && argsMap.hours <= 0) {
        await interaction.reply({ content: `Please re-enter this command with time fields filled out!`, ephemeral: true });
        return;
    }

    let timeField = "";

    if (argsMap.hours > 0) {
        timeField += `${argsMap.hours > 9 ? argsMap.hours : `0${argsMap.hours}`}h`;
    }

    if (argsMap.minutes > 0 || argsMap.hours > 0) {
        timeField += `${argsMap.hours > 0 ? ":" : ""}${argsMap.minutes > 9 ? argsMap.minutes : `0${argsMap.minutes}`}m`;
    }

    if (argsMap.seconds > 0 || argsMap.minutes > 0 || argsMap.hours > 0) {
        timeField += `${argsMap.minutes > 0 ? ":" : ""}${argsMap.seconds > 9 ? argsMap.seconds : `0${argsMap.seconds}`}s`;
    }

    let response = `I will remind <@${interaction.user.id}> about the **${argsMap.content} (${argsMap.location})** in **${timeField}**`;

    let delayTime = 0;
    if (argsMap["hours"]) {
        delayTime += (argsMap.hours * 3600000);
    }

    if (argsMap["minutes"]) {
        delayTime += (argsMap.minutes * 60000);
    }

    if (argsMap["seconds"]) {
        delayTime += (argsMap.seconds * 1000);
    }
    
    setTimeout(() => {
        if (argsMap["timeLeft"]) {
            delete argsMap["timeLeft"];
        }
        delayedPing(interaction, argsMap)
    }, delayTime);

    if (delayTime > FIVE_MINUTES) {
        setTimeout(() => {
            argsMap["timeLeft"] = FIVE_MINUTES;
            delayedPing(interaction, argsMap)
        }, (delayTime - FIVE_MINUTES));
    }

    if (delayTime > TEN_MINUTES) {
        setTimeout(() => {
            argsMap["timeLeft"] = TEN_MINUTES;
            delayedPing(interaction, argsMap)
        }, (delayTime - TEN_MINUTES));
    }

    if (delayTime > FIFTEEN_MINUTES) {
        setTimeout(() => {
            argsMap["timeLeft"] = FIFTEEN_MINUTES;
            delayedPing(interaction, argsMap)
        }, (delayTime - FIFTEEN_MINUTES));
    }

    await interaction.reply(response);
}

async function delayedPing(interaction, args) {
    let channel = await client.channels.fetch(interaction.channelId);
    await channel.send(`<@${interaction.user.id}> This is your${args.timeLeft > 0 ? ` **${args.timeLeft / 60000}m**` : ""} reminder about the **${args.content}** in **${args.location}**!`);
}

export { remindCommand, handler };