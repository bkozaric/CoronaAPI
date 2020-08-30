const Discord = require("discord.js");
const bot = new Discord.Client();
const fetch = require("node-fetch");



const token = "NzA4Nzc3MzM3MjczMDU3MzUx.XrcS2g.j9OrlfAZLiZUxDmexYEFNC8UR2g";

const separators = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

bot.on("ready", async () => {
    console.log("I'm alive ...");
    const response = await fetch("https://www.koronavirus.hr/json/?action=podaci_zadnji");
    response.text().then((data) => {
        const { SlucajeviHrvatska, UmrliHrvatska, IzlijeceniHrvatska, SlucajeviSvijet, UmrliSvijet, IzlijeceniSvijet, Datum } = JSON.parse(data)[0]
        console.log(separators(SlucajeviHrvatska));
        console.log(separators(UmrliHrvatska));
        console.log(separators(IzlijeceniHrvatska));
        console.log(separators(SlucajeviSvijet));
        console.log(separators(UmrliSvijet));
        console.log(separators(IzlijeceniSvijet));

        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(countryName.toUpperCase().replace(/-/g, " "))
            .setAuthor('Podaci za zemlju', 'https://www.worldometers.info/' + flagUrl)
            .addFields(
                { name: 'Ukupno zaraženih: ', value: zarazenih, inline: false },
                { name: 'Trenutno zaraženih: ', value: trenutno, inline: false },
                { name: 'Broj preminulih: ', value: smrti, inline: false },
                { name: 'Broj oporavljenih: ', value: oporavljeni, inline: false },
                { name: 'Novo zaraženih: ', value: novoZarazenih, inline: true },
                { name: 'Novo preminulih: ', value: novoUmrlih, inline: true }
            )
            .setTimestamp()
            .setFooter('CoronaAPI', 'http://icons.iconarchive.com/icons/everaldo/crystal-clear/128/App-virus-detected-2-icon.png');
        /*Object.entries(JSON.parse(data)[0]).map((row) => {
            (row[0].toLowerCase().includes("hrvatska") || row[0].toLowerCase().includes("datum")) && console.log(`${row[0]}: ${row[1]}`)
        });
        */
    });
})

bot.on("message", async (message) => {
    if (message.content = "koliko") {

    }
})


bot.login(token);