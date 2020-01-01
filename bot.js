const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const client = new Discord.Client();
const fs = require('fs');
client.time = require('./time.json');


//Creates variables with wide enough scope for various reminder purposes.
var remindTime = new Number();
var messageDate;
var reminder = client.time.time;

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', message => {

    //Grabs id's of the guild and some of it's channels for use in creating the reminder.
    const guild = message.guild.id;

    const general = message.guild.channels.find(channel => channel.name === 'general').id;
    const botCommands = message.guild.channels.find(channel => channel.name === 'bot-commands').id;
    const dailyFact = message.guild.channels.find(channel => channel.name === 'daily-fact').id;

    //stores the general channel's id as a global variable for use in the actual reminder.
    global.general = general;

    //Exits early if message is in general. This allows the bot to still talk in general for the reminder, while also not responding to commands in general. Basically server QOL.
    if (message.channel.id == general) {
        return;

    //Continues if message channel is not general.
    } else if (message.channel.id != general) {

        //Stores date of most recent daily fact message to determine if a reminder is neccessary.
        if (message.channel.id == dailyFact) {
            messageDate = message.createdAt.getDate();
        }

        //Handles commands only if they are sent in bot-commands.
        if (message.channel.id == botCommands) {

            //Exits early if the message does not start with the prefix (;), or if the message was sent by a bot.
            if (!message.content.startsWith(prefix) || message.author.bot) return;

            const args = message.content.slice(prefix.length).split(/ +/);
            const command = args.shift().toLowerCase();

            //Handles all commands that are restricted to admins.
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                return message.channel.send(`${message.author}, you do not have permission to use my commands.`);
            } else if (message.member.hasPermission("ADMINISTRATOR")) {

                //Sets the 1 hour period that the bot will send a reminder during.
                if (command === 'reminder') {

                    //Exits if there isn't an argument for time.
                    if (!args.length) {
                        return message.channel.send(`You didn't specify an hour, ${message.author}.`);
                    }

                    const remindTime = parseInt(args[0]);

                    //Exits if the argument is not a valid integer.
                    if (isNaN(remindTime)) {
                        return message.channel.send(`${message.author}, you did not specify an integer.`);
                    } else if (remindTime < 0 || remindTime > 23) {
                        return message.channel.send(`${message.author}, you need to input a number between 0 and 23.`);
                    } else {
                        client.time = {
                            time: remindTime
                        }
                        fs.writeFile('./time.json', JSON.stringify(client.time, null, 4), err => {
                            if(err) throw err;
                        });
                    }

                    //Logic for morning and afternoon confirmations.
                    if (remindTime == 0) {
                        return message.channel.send(`I will now send a reminder at 12 AM Central.`);
                    } else if (0 < remindTime && remindTime < 12) {
                        return message.channel.send(`I will now send a reminder at ${remindTime} AM Central.`);
                    } else if (remindTime == 12) {
                        return message.channel.send(`I will now send a reminder at 12 PM Central.`);
                    } else if (12 < remindTime) {
                        return message.channel.send(`I will now send a reminder at ${remindTime - 12} PM Central.`)
                    }
                } else if (command === 'help') {
                    const embed = new Discord.RichEmbed()
                        .setColor('#0099ff')
                        .setTitle('List Of Commands')
                        .addField(';reminder [value]', 'Sets the reminder to be sent at whatever [value] is. [value] can be any number from 0 to 23, with 0 being midnight and 23 being 11pm. All times are in US Central.')
                        .addField(';values', 'Lists various stored vlaues for debugging purposes.')
                        .addField(';help', 'What you are reading right now!')
                    return message.channel.send(embed);
                } else if (command === 'values') {
                    return channel.message.send(`**Last Daily Fact message date:** ${messageDate}. \nCurrent date: ${date.getDate()} \nReminder time: ${remindTime} \nStored time: ${reminder}`)
                }
            }
        }
    }
});

//Executes function every hour
setInterval(function(){
    var date = new Date();
    
    //Exits if the last daily fact was posted today.
    if (date.getDate() != messageDate) {
        return;
    
    //Only sends the reminder if the current hour is the hour specified by the admins AND if the time is on the exact hour right now.
    } else if (date.getHours() == reminder) {
        if (date.getMinutes() == 0) {
            return client.channels.get(global.general).send(`@402185630853103617 @631168537137905684 @270616189024206850 @451770115642359808 Don't forget about the daily fact!`);
        }
    }
}, 60000);

client.login(token);