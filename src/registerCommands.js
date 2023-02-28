require('dotenv').config();
const {REST, Routes} = require('discord.js');

const commands = [
    {
        name: 'testing',
        description: 'Slash command for testing!'
        
    },
];

const rest = new REST({ version: '10'}).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Trying to register slash commands ... | Please be patient!');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), 
            { body: commands }
        )

        console.log('Succesfully registered slahs commands');
    } catch (error) {
        console.log(error);
    }
})();