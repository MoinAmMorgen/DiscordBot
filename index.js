require('dotenv').config();
const Discord = require('discord.js');
const {GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, StringSelectMenuBuilder} = require('discord.js');
const sql = require('sqlite');
const sql3 = require("sqlite3");
const client = new Discord.Client({


intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers
]

});

client.on('ready', async client => {
    const db = await sql.open({filename: './src/dbs/ticketCount.db', driver: sql3.Database});
    console.log(`${client.user.tag} is now online!`);
    await db.all('DROP TABLE count');
    db.all('CREATE TABLE count (Ticket INTEGER,Creator TEXT,Claimed TEXT,Claimer TEXT)');

})

// *
// *
// *
// * /testing command 
// *
// *
// *

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand() || !interaction.member.client) return;

    if(interaction.commandName === 'testing') {
    const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setCustomId('test1')       
        .setLabel('primary')
        .setStyle(ButtonStyle.Primary),
      
        new ButtonBuilder()
        .setCustomId('test2')
        .setLabel('secondary')
        .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
        .setCustomId('test3')
        .setLabel('danger')
        .setStyle(ButtonStyle.Danger),
    )
      await interaction.reply({content: 'Testing out new things:', components: [row]});
     }

    });
//
// 
// *
// * button interactions
// *
// 
//


client.on('interactionCreate', async interaction => {
        if(!interaction.isButton() || !interaction.isStringSelectMenu() || !interaction.member.client) return;

        if(interaction.customId === 'test1') {
            const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Trying out embeds')
            .setDescription('The title says it');
            interaction.reply({content: `Thanks for testing ${interaction.member.displayName}`, embeds: [embed]});
        }
     });


// *
// *
// *
// * Support-ticket
// *
// *
// *

client.on('ready', async client => {

    const supportChannel = client.channels.cache.find(channel => channel.name === "support-ticket");
    if(!supportChannel) {
        return;
    }
        
        const supportEmbed = new EmbedBuilder()
           .setColor(0x0099FF)
           .setTitle('Support')
           .setDescription('If you have any problems or questions with our service please press the button below')
           .setTimestamp()
           .setFooter({text: 'Ticket System'});
        
           const createTicket = new ActionRowBuilder()
           .addComponents(
            new ButtonBuilder()
           .setCustomId('createTicket')
           .setLabel('Create Ticket!')
           .setStyle(ButtonStyle.Primary),
           )

    async function deleteMessages() {
        
           supportChannel.bulkDelete(100, true);
            }
            deleteMessages();
            
    await supportChannel.send({embeds: [supportEmbed], components: [createTicket]});

})


let count = 0;

client.on('interactionCreate', async interaction => {
    if(!interaction.isButton() || !interaction.member.client) return;

    if(interaction.customId === 'createTicket') {

        const db = await sql.open({filename: './src/dbs/ticketCount.db', driver: sql3.Database});
        const creatorID = interaction.member.id;
        const creatorName = interaction.user.username;
        console.log(creatorID);

        db.all('INSERT or REPLACE INTO count (Creator, Ticket) VALUES (?, ?)', [creatorID, count += 1]);
        let obj = await db.all('SELECT MAX(Ticket) AS LTicket FROM count WHERE Creator = ' + creatorID);

        let stringobj = JSON.stringify(Object.values(obj));
        stringobj = stringobj.replace('[{"LTicket":', '');
        stringobj = stringobj.replace('}]', '');
        console.log(stringobj);

        async function createThread() {
            const thread = await interaction.channel.threads.create({
                name: '#' + stringobj + ' | ' + creatorName,
                type: ChannelType.PrivateThread,
            });
            thread.members.add(interaction.member);
            const adminRole = '1037779614560428052';
            client.guilds.cache.get(interaction.guildId).members.fetch().then(m => {
                m.forEach(m => {
                    if(m.roles.cache.has(adminRole)) {
                        thread.members.add(m);
                    }
                })
            });
        
            const embed = new EmbedBuilder()
            .setTitle('Thanks ' + creatorName  + ' for opening this ticket!')
            .setDescription('A staff member will help you very soon! \n *Please select some overall info about your problem in the _select menu_ below.*')
            .setColor(0x03a1fc)
            .setFooter({text: 'Ticket System'})
            .setTimestamp();
            const menurow = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('about')
                .setPlaceholder('Whats the problem about?')
                .addOptions(
                    {
                        label: '*roles* | server',
                        description: 'Is your problem about the roles of the server?',
                        value: 'roles',
                    },
                    {
                        label: '*channels* | server',
                        description: 'Is your problem about the channels of the server?',
                        value: 'channels',
                    },
                    {
                        label: '*members* | server',
                        description: 'Is your problem about the members of the server?',
                        value: 'members',
                    },
                    {
                        label: '*other* | server',
                        description: 'Is your problem about the something else about the server?',
                        value: 'other',
                    },
                    {
                        label: '*anything else*',
                        description: 'Is your problem about anything else?',
                        value: 'anything else',
                    },
                )
            )
            thread.send({content: '<@&' + adminRole + '>', embeds: [embed], components: [menurow]});
        }
        createThread();
    } 
});

client.on('interactionCreate', async interaction => {
    
    if(!interaction.isStringSelectMenu() || !interaction.member.client) return;

    if(interaction.customId === 'about') {
        const selected = interaction.values[0];
        console.log(selected);

        if(selected === 'roles') {
            interaction.channel.send(`${selected} was selected!`);
        }
    }
});
client.login(process.env.TOKEN);