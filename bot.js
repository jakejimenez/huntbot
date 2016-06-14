// Requirements
const Discord = require('discord.io');
const productHuntAPI = require('producthunt');
const fs = require('fs');

// Import the config.json file, and parse the data.
var content = fs.readFileSync("./config/config.json");
var configContent = JSON.parse(content);

// Assign the content to some variables.
var commandPrefix = configContent.prefix;
var adminUsers = configContent.admin;

// Create a new instance of the Discord client.
var bot = new Discord.Client({
    autorun: true,
    token: "#"
});

// Create a new instance of the ProductHunt api.
var productHunt = new productHuntAPI({
    client_id: "#", // Client ID
    client_secret: "#", // Client Secret
    grant_type: "client_credentials" // Grant Type
});

// Log some inital strings to show the bot is online.
bot.on('ready', function() {
    console.log(bot.username + " - (" + bot.id + ")");
    console.log("HuntBot is Online");
});

// The only listener for the bot, don't want to cause a memory leak. ( ͡° ͜ʖ ͡°)
// Commands
bot.on('message', function(user, userID, channelID, message, rawEvent) {
    // Misc Commands
    // Test responsiveness of bot.
    if (message === commandPrefix + "ping") {
        bot.sendMessage({
            to: channelID,
            message: "pong"
        });
    }

    if (message === commandPrefix + "help") {
        bot.sendMessage({
            to: channelID,
            message: '' + commandPrefix + 'ping - Test responsiveness of bot.\n' + commandPrefix + 'todaystech - PM\'s latest tech hunts.\n' + commandPrefix + 'collections {1-20} - PM\'s latest collections on PH.\n'
        });
    }

    // ProductHunt Commands
    // Get todays tech posts on ProductHunt.
    if (message === commandPrefix + "todaystech") {
        // Let the user know the hunts will take a while.
        bot.sendMessage({
            to: channelID,
            message: "Today's ProductHunt's will be sent to your DM's shortly " + user,
            typing: true
        });

        // Get posts for tech.
        productHunt.posts.index({
            search: {
                category: 'tech'
            }
        }, function(err, res) {
            for (var i = 0; i < 10; i++) {
                var resultJson = JSON.parse(res.body);
                var name = resultJson.posts[i].name;
                var tagline = resultJson.posts[i].tagline;
                var discussUrl = resultJson.posts[i].discussion_url;
                bot.sendMessage({
                    to: userID,
                    message: name + " " + '"' + tagline + '"' + " " + discussUrl + '\n' + '\n',
                    typing: true
                });
            }
        });
    }

    // Get the latest collections on ProductHunt.
    if (message.includes(commandPrefix + 'collections')) {

        // Deconstruct message and find value for search results.
        var collectionMessage = message.split(' ');
        var searchValue;
        if (collectionMessage[1] !== "0") {
            if (isNaN(collectionMessage[1]) === false && collectionMessage[1] <= 20) {
                var searchValue = collectionMessage[1];
                // Get collections.
                productHunt.collections.index({},
                    function(err, res) {
                        for (var i = 0; i < searchValue; i++) {
                            var resultJson = JSON.parse(res.body);
                            var name = resultJson.collections[i].name;
                            var collectionUrl = resultJson.collections[i].collection_url;
                            bot.sendMessage({
                                to: userID,
                                message: name + " " + " " + collectionUrl + '\n' + '\n',
                                typing: true
                            });
                        }
                    });

                // Let the user know the hunts will take a while.
                bot.sendMessage({
                    to: channelID,
                    message: "The ProductHunt collections will be sent to your DM's shortly " + user,
                    typing: true
                });
            } else if (isNaN(collectionMessage[1])) {
                bot.sendMessage({
                    to: channelID,
                    message: "You have not typed a number, please try again with a value of 1-20 | @" + user,
                    typing: true
                });
            } else {
                bot.sendMessage({
                    to: channelID,
                    message: "Oops you broke something. Let me get my admin.",
                    typing: true
                });
            }
        } else {
            bot.sendMessage({
                to: channelID,
                message: "You have not typed a valid number, please try again with a value of 1-20 | @" + user,
                typing: true
            });
        }
    }

    // Admin Commands
    // Stop the bot.
    if (message === commandPrefix + "sudo_shutdown" && userID === adminUsers[0]) {
      bot.sendMessage({
        to: channelID,
        message: "Bot is shutting down...",
        typing: true
      });
      console.log(Date.now());
      bot.disconnect()
    } else if (userID !== adminUsers[0]) {
      bot.sendMessage({
        to: channelID,
        message: "You silly goon, are aren't an admin.",
        typing: true
      });
    }

});
