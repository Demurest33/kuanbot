const { Client, Intents, MessageEmbed} = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS,Intents.FLAGS.GUILD_MESSAGES] });

async function generateEmbed(user) {
    let foldersList = await createArrayFolders(user.folders);
    let msgEmbed = new MessageEmbed()
    .setTitle(`${user.username}'s profile`)
    .setColor("BLURPLE")
    .setDescription(`UserID: ${user.ID} \nTotal of folders: ${user.folders.length} \nFolders: ${foldersList}`)
    return msgEmbed;
}

async function createArrayFolders(array){
    return new Promise((resolve,reject)=>{
        let tmpArray = [];
        for (let i = 0; i < array.length; i++) {
            tmpArray[i] = array[i].name;
        }
        resolve(tmpArray);
    });
}

module.exports = {
    generateEmbed,
};