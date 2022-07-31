const { Client, Intents, MessageEmbed} = require('discord.js');
const puppeteer = require('puppeteer');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS,Intents.FLAGS.GUILD_MESSAGES] });

async function reactionCollect(message,interaction,wallapaperObjList) {
	//Reacciones que no le sirven los filtros.
	let page = 1;
	await message.react("⏮");
	await message.react("⏪");
	await message.react("⏩");
	await message.react("⏭");
	await message.react("🔜");

	fastReverseEmoji = "⏮";
	reverseEmoji = "⏪";
	forwardEmoji = "⏩";
	fastForwardEmoji = "⏭";
	soonEmoji = "🔜";

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

					const forwardEmbed = await generateEmbed(page,wallapaperObjList);
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

					const forwardEmbed = await generateEmbed(page,wallapaperObjList);
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
				//aun no se como hacer para que solo quien llamo al comando pueda reaccionar para la funcion
				if(page < wallapaperObjList.length) {
					page++;
					console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
					console.log("Page: " + page);
					//await user.reaction.remove(); no se como hacer para que se borre la reaccion del usuario
					//await message.reactions.removeAll();
					await interaction.editReply({
						content: "Generando embed...",
						embeds: [],
					});

					const forwardEmbed = await generateEmbed(page,wallapaperObjList);
					await interaction.editReply({
						content: " ",
						embeds: [forwardEmbed],
					})
					//await message.react("⏩");
					break;
				}else{
					console.log("Entre al return del forward");
					break;
				}

			case fastForwardEmoji:
				if(page < wallapaperObjList.length) {
					page = wallapaperObjList.length;
					console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
					console.log("Page: " + page);
					await interaction.editReply({
						content: "Generando embed...",
						embeds: [],
					});

					const forwardEmbed = await generateEmbed(page,wallapaperObjList);
					await interaction.editReply({
						content: " ",
						embeds: [forwardEmbed],
					})
					break;
				}else{
					console.log("Entre al return del Fastforward");
					break;
				}

			case soonEmoji:
				await interaction.editReply({
					content: "Muy pronto tendremos nuevas funcionalidades en nuestra pagina web!",
				})
				break;


			default:
				console.log("El emoji no coincide con ningun comando");
				return;

		}
	});
}

async function scrapeWorkshop(url) {
	//validar que sea una URL valida
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();
	try {
		await page.goto(url);
		
	} catch (error) {
		console.log("Cant navegato to this url");
		browser.close();
		return 0;
	}

	let obj= await page.evaluate(() =>{
		//sacar datos de la pagina
		const tmp = {};
		tmp.url = document.URL;
		try {
			tmp.title = document.querySelector("#mainContents > div.workshopItemDetailsHeader > div.workshopItemTitle").textContent;
		} catch (error) {
			tmp.title = "Seguramente pusiste otra url de la workshop pedazo de pelotudo."
			
		}
		
		try {
			tmp.imgSrc = document.querySelector('.workshopItemPreviewImageEnlargeable').src;
		} catch (error) {
			tmp.imgSrc = "https://th.bing.com/th/id/R.c62785ab9a617a852a38061aa8beee7b?rik=ciUDzpH0wWwckQ&pid=ImgRaw&r=0";
		}

		//extripar la id
		let text = document.URL;
		const myArray = text.split("https://steamcommunity.com/sharedfiles/filedetails/?id=");
		tmp.id = myArray.slice(1).toString();
		
		return tmp;
	});
	browser.close();
	console.log(obj);
	return obj;
}

async function generateEmbed(page,wallpaperObjList) {
    let msgEmbed = new MessageEmbed()
    .setTitle(`${wallpaperObjList[page-1].title}`)
    .setDescription(`${page}/${wallpaperObjList.length}`)
    .setImage(wallpaperObjList[page-1].img_url)
    .setColor("ORANGE")
    .setURL(wallpaperObjList[page-1].url)

    return msgEmbed;
}

module.exports = {
    reactionCollect,
	generateEmbed,
	scrapeWorkshop,
};