const { Client, Intents, MessageEmbed} = require('discord.js');
const mysql = require('./MySQL.js');
const wallp = require('./wallpapers.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS,Intents.FLAGS.GUILD_MESSAGES] });

async function reactionCollect(message,interaction,FoldersObjList) {
	//Reacciones que no le sirven los filtros.
	let page = 1;
	await message.react("⏮");
	await message.react("⏪");
	await message.react("⏩");
	await message.react("⏭");
	await message.react("📖");

	fastReverseEmoji = "⏮";
	reverseEmoji = "⏪";
	forwardEmoji = "⏩";
	fastForwardEmoji = "⏭";
	openBookEmoji = "📖";

	const collector = message.createReactionCollector();
	
	collector.on('collect', async (reaction, user) => {

		switch(reaction.emoji.name){

			case fastReverseEmoji:
				if(page > 1) {
					page = 1;
					console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
					console.log("Page: " + page);
					await interaction.editReply({
						content: "Generando embed...",
						embeds: [],
					});

					const forwardEmbed = await generateEmbed(page,FoldersObjList);
					await interaction.editReply({
						content: " ",
						embeds: [forwardEmbed],
					})
					break;
				}else{
					console.log("Entre al return del Fastreverse");
					break;
				}

			case reverseEmoji:
				if(page > 1) {
					page--;
					console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
					console.log("Page: " + page);
					await interaction.editReply({
						content: "Generando embed...",
						embeds: [],
					});

					const forwardEmbed = await generateEmbed(page,FoldersObjList);
					await interaction.editReply({
						content: " ",
						embeds: [forwardEmbed],
					})
					break;
				}else{
					console.log("Entre al return del reverse");
					break;
				}

			case forwardEmoji:
				if(page < FoldersObjList.length) {
					page++;
					console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
					console.log("Page: " + page);
					await interaction.editReply({
						content: "Generando embed...",
						embeds: [],
					});

					const forwardEmbed = await generateEmbed(page,FoldersObjList);
					await interaction.editReply({
						content: " ",
						embeds: [forwardEmbed],
					})
					break;
				}else{
					console.log("Entre al return del forward");
					break;
				}

			case fastForwardEmoji:
				if(page < FoldersObjList.length) {
					page = FoldersObjList.length;
					console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
					console.log("Page: " + page);
					await interaction.editReply({
						content: "Generando embed...",
						embeds: [],
					});

					const forwardEmbed = await generateEmbed(page,FoldersObjList);
					await interaction.editReply({
						content: " ",
						embeds: [forwardEmbed],
					})
					break;
				}else{
					console.log("Entre al return del Fastforward");
					break;
				}

            case openBookEmoji:
                const results = await mysql.wallpapers(FoldersObjList[page-1]);

                if(results !=1){

                    const foldersEmbed = await wallp.generateEmbed(1,results);

                    const followup = await interaction.followUp({content: " ", embeds: [foldersEmbed],}).then(msg => {
                        //msg.edit("Edited the follow up message");
                        reactionCollectFollowUp(msg,results);
                    });
        
                }else{await interaction.followUp({content: "This folder does not have any wallpapers yet.",});}
                break;
			default:
				console.log("El emoji no coincide con ningun comando");
				return;

		}
	});
}

async function reactionCollectFollowUp(message,FoldersObjList) {
	//Reacciones que no le sirven los filtros.
	let page = 1;
	await message.react("⏮");
	await message.react("⏪");
	await message.react("⏩");
	await message.react("⏭");
	await message.react("🍑");
	fastReversePage = "⏮";
	reversePage = "⏪";
	forwardPage = "⏩";
	fastForwardPage = "⏭";

	const collector = message.createReactionCollector();
	
	collector.on('collect', async (reaction, user) => {

		switch(reaction.emoji.name){

			case fastReversePage:
                if (page > 1) {
                    page = 1;
					const foldersEmbed = await wallp.generateEmbed(page,FoldersObjList);
					message.edit({embeds: [foldersEmbed],})
                    break;
                }
                break;

			case reversePage:
                if (page > 1) {
                    page--;
					const foldersEmbed = await wallp.generateEmbed(page,FoldersObjList);
					message.edit({embeds: [foldersEmbed],})
                    break;
                }
                break;

			case forwardPage:
                if (page < FoldersObjList.length) {
                    page++;
					const foldersEmbed = await wallp.generateEmbed(page,FoldersObjList);
					message.edit({embeds: [foldersEmbed],})
                    break;
                }
                break;

			case fastForwardPage:
				if (page < FoldersObjList.length) {
					page = FoldersObjList.length;
					const foldersEmbed = await wallp.generateEmbed(page,FoldersObjList);
					message.edit({embeds: [foldersEmbed],})
					break;
				}
				break;

            default:
                console.log("El emoji no coincide con ningun comando");
                break;
		}
	});
}

async function generateEmbed(page,folderObjList) { //Scheme must be one of ('http', 'https')

	let flag = 0;
	
	let msgEmbed = new MessageEmbed()
	.setTitle(`${folderObjList[page-1].username}'s folder ${folderObjList[page-1].folderName}`)
	.setDescription(`${page}/${folderObjList.length} \nFolderID: ${folderObjList[page-1].folderID} \n${folderObjList[page-1].folderDescription}`)
	.setColor("RED")
	.setImage(folderObjList[page-1].folderCover)
	return msgEmbed;

    
}

module.exports = {
    reactionCollect,
	generateEmbed,
};