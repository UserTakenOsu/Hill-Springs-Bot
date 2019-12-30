const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const client = new Discord.Client();

//Gets id of channel 'general'
const general = client.channels.find(c => c.name === 'general');
const generalId = general ? general.id : null;

//Creates variables with wide enough scope for various reminder purposes.
var remindTime = new Number();
var currentDate = new Date();
var messageDate;

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {

    //Gets id of channel 'daily-fact'
    const dailyFact = client.channels.find(c => c.name === 'daily-fact');
    const dailyFactId = dailyFact ? dailyFact.id : null;


    //Stores date of most recent daily fact message to determine if a reminder is neccessary.
    if (message.channel.id == dailyFactId) {
        messageDate = message.createdAt.getDate();
    }

    //Gets id of channel 'bot-commands'
    const botCommands = client.channels.find(c => c.name === 'bot-commands');
    const botCommandsId = botCommands ? botCommands.id : null;

    //Handles commands only if they are sent in bot-commands.
    if (message.channel.id == botCommandsId) {

        //Exits early if the message does not start with the prefix (;), or if the message was sent by a bot.
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();

        //Handles all commands that are restricted to admins.
        if (message.member.hasPermission("ADMINISTRATOR")) {

            //Sets the 1 hour period that the bot will send a reminder during.
            if (command === 'setTime') {

                //Exits if there isn't an argument for time.
                if (!args.length) {
                    return message.channel.send(`You didn't specify an hour, ${message.author}.`);
                }

                const CST = parseInt(args[0]);

                //Exits if the argument is not a valid integer.
                if (isNaN(CST)) {
                    return message.channel.send(`${message.author}, you did not specify an integer.`);
                } else if (CST < 0 || CST > 23) {
                    return message.channel.send(`${message.author}, you need to input a number between 0 and 23.`);
                }

                //Store CST constant in a variable for reminder usage.
                remindTime = CST;

                //Confimation message.
                return message.channel.send(`I am now set to remind you at some point during hour ${CST}, CST.`);
            }
        }
    }
});

//Executes function every hour
setInterval(function(){
    //Exits early if the current hour is not the same as the reminder hour.
    if(currentDate.getHours() != remindTime) {
        return;
    //Exits early if the last fact's date is the same as the current date.
    } else if (messageDate == currentDate.getDate()) {
        return;
    //Mentions the admins with a reminder if there has not been a fact posted yet.
    } else if (messageDate != currentDate.getDate()) {
        client.channels.get(generalId).send(`@402185630853103617 @631168537137905684 @270616189024206850 @451770115642359808 Don't forget about the daily fact!`);
    }
}, MIN_INTERVAL = 1000 * 60 * 60)

client.login(token);