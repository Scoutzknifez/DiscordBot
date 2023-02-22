import { SlashCommandBuilder } from '@discordjs/builders';
import { client } from "../app.js";

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const FIVE_MINUTES = 5 * ONE_MINUTE;
const TEN_MINUTES = 10 * ONE_MINUTE;

const UPDATE_FREQUENCY = ONE_SECOND * 5;

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
    let channel = await client.channels.fetch(interaction.channelId);

    let argsMap = {
        popTime: Date.now(),
        senderId: interaction.user.id,
        channel
    };

    let seconds = 0;
    let minutes = 0;
    let hours = 0;

    commandArgs.forEach(option => {
        let optionType = option.name;

        if (optionType == "seconds") {
            seconds = option.value;
            argsMap.popTime += seconds * 1000;
        } 
        else if (optionType == "minutes") {
            minutes = option.value;
            argsMap.popTime += minutes * 60000;
        }
        else if (optionType == "hours") {
            hours = option.value;
            argsMap.popTime += hours * 3600000;
        } else {
            argsMap[optionType] = option.value;
        }        
    });

    if (seconds == 0 && minutes == 0 && hours == 0) {
        await interaction.reply({ content: `Please re-enter this command with time fields filled out!`, ephemeral: true });
        return;
    }

    let currentDate = new Date();
    let iso = currentDate.toISOString();

    let currentSmallTime = iso.split('T')[1];
    let currentHourUTC = currentSmallTime.split(':')[0];
    let currentMinuteUTC = currentSmallTime.split(':')[1];

    currentHourUTC = Number(currentHourUTC);
    currentMinuteUTC = Number(currentMinuteUTC);

    currentHourUTC += hours;
    currentMinuteUTC += minutes;

    while (currentMinuteUTC >= 60) {
        currentHourUTC++;
        currentMinuteUTC -= 60;
    }

    while (currentHourUTC >= 24) {
        currentHourUTC -= 24;
    }

    let response = `The **${argsMap.content}** in **${argsMap.location}** pops at **${currentHourUTC < 10 ? `0${currentHourUTC}` : currentHourUTC}:${currentMinuteUTC < 10 ? `0${currentMinuteUTC}` : currentMinuteUTC}**`;
    await interaction.reply(response);

    let updatingMessage = await channel.send(`<@${interaction.user.id}> The **${argsMap.content} (${argsMap.location})** pops in **${createTimeField(argsMap.popTime)}**`);

    setTimeout(() => {
        updateInteraction(updatingMessage, argsMap);
    }, UPDATE_FREQUENCY);

    let currentTime = Date.now();

    if (argsMap.popTime - currentTime <= FIVE_MINUTES) {
        return;
    }

    setTimeout(() => {
        try {
            channel.send(`<@${interaction.user.id}> This is your **5 MINUTE** reminder about the **${argsMap.content}** in **${argsMap.location}**!`);    
        } catch (err) {
            console.log(err);
        }
    }, (argsMap.popTime - currentTime) - FIVE_MINUTES);

    if (argsMap.popTime - currentTime <= TEN_MINUTES) {
        return;
    }

    setTimeout(() => {
        try {
            channel.send(`<@${interaction.user.id}> This is your **10 MINUTE** reminder about the **${argsMap.content}** in **${argsMap.location}**!`);
        } catch (err) {
            console.log(err);
        }
    }, (argsMap.popTime - currentTime) - TEN_MINUTES);
}

async function updateInteraction(updatingMessage, args) {
    if (args.popTime <= Date.now()) {
        try {
            let response = `<@${args.senderId}> The **${args.content}** in **${args.location}** is **LIVE**`;
            updatingMessage.edit(response);
        } catch (err) {
            console.log(err);
            args.channel.send(`<@${args.senderId}> The **${args.content}** in **${args.location}** is **LIVE**`);
        }
        return;
    }

    try {
        let response = `<@${args.senderId}> The **${args.content} (${args.location})** pops in **${createTimeField(args.popTime)}**`;
        updatingMessage.edit(response);
    } catch (err) {
        console.log(err);
    }

    setTimeout(() => {
        updateInteraction(updatingMessage, args);
    }, UPDATE_FREQUENCY);
}

function createTimeField(popTime) {
    let timeTillLive = popTime - Date.now();

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

        if (seconds >= 60) {
            minutes++;
            seconds -= 60;
        }
    }

    if (minutes >= 60) {
        hours++;
        minutes -= 60;
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