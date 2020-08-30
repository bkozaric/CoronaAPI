const Discord = require("discord.js");
const bot = new Discord.Client();
const request = require('request');
const fs = require("fs");
const textToImage = require('text-to-image');
const hsl = require('hsl-to-hex')

require("dotenv/config")

const token = process.env.TOKEN;

let rawdata = fs.readFileSync('data.json');
let defaultCountryRaw = fs.readFileSync('country.json');

var keyword = JSON.parse(rawdata);

let defaultCountry = JSON.parse(defaultCountryRaw)["default"];

let countries = ["us", "spain", "italy", "uk", "russia", "france", "germany", "brazil", "turkey", "iran", "china", "canada", "peru", "india", "belgium", "netherlands", "saudi-arabia", "mexico", "switzerland", "ecuador",
    "pakistan", "portugal", "chile", "sweden", "ireland", "singapore", "belarus", "qatar", "united-arab-emirates", "israel", "austria", "poland", "japan", "romania", "ukraine", "bangladesh", "indonesia", "south-korea",
    "philippines", "colombia", "denmark", "serbia", "dominican-republic", "south-africa", "egypt", "norway", "czech-republic", "panama", "kuwait", "australia", "malaysia", "morocco", "finland", "argentina", "algeria",
    "kazakhstan", "moldova", "bahrain", "ghana", "nigeria", "afghanistan", "luxembourg", "oman", "hungary", "armenia", "thailand", "greece", "iraq", "azerbaijan", "uzbekistan", "cameroon", "bolivia", "croatia", "bosnia-and-herzegovina",
    "guinea", "bulgaria", "iceland", "honduras", "cuba", "estonia", "cote-d-ivoire", "senegal", "macedonia", "new-zealand", "slovakia", "slovenia", "lithuania", "djibouti", "sudan", "china-hong-kong-sar", "tunisia", "somalia",
    "mayotte", "democratic-republic-of-the-congo", "kyrgyzstan", "latvia", "guatemala", "cyprus", "albania", "sri-lanka", "niger", "lebanon", "maldives", "el-salvador", "costa-rica", "andorra", "burkina-faso", "uruguay", "mali",
    "paraguay", "gabon", "kenya", "guinea-bissau", "san-marino", "georgia", "tajikistan", "channel-islands", "jordan", "tanzania", "jamaica", "malta", "taiwan", "equatorial-guinea", "reunion", "venezuela", "state-of-palestine",
    "mauritius", "isle-of-man", "montenegro", "chad", "sierra-leone", "viet-nam", "benin", "rwanda", "congo", "zambia", "cabo-verde", "ethiopia", "sao-tome-and-principe", "liberia", "madagascar", "faeroe-islands", "martinique",
    "myanmar", "swaziland", "guadeloupe", "togo", "haiti", "gibraltar", "central-african-republic", "brunei-darussalam", "french-guiana", "cambodia", "south-sudan", "bermuda", "trinidad-and-tobago", "uganda", "nepal", "aruba",
    "monaco", "guyana", "bahamas", "mozambique", "barbados", "liechtenstein", "cayman-islands", "sint-maarten", "libya", "french-polynesia", "malawi", "syria", "china-macao-sar", "angola", "mongolia", "saint-martin", "eritrea",
    "zimbabwe", "yemen", "antigua-and-barbuda", "timor-leste", "botswana", "grenada", "gambia", "laos", "belize", "fiji", "new-caledonia", "saint-lucia", "saint-vincent-and-the-grenadines", "nicaragua", "curacao", "dominica",
    "namibia", "burundi", "saint-kitts-and-nevis", "falkland-islands-malvinas", "turks-and-caicos-islands", "holy-see", "comoros", "montserrat", "greenland", "seychelles", "suriname", "mauritania", "papua-new-guinea",
    "british-virgin-islands", "bhutan", "caribbean-netherlands", "saint-barthelemy", "western-sahara", "anguilla", "saint-pierre-and-miquelon"];

function separatori(broj) {
    return broj.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


bot.on("ready", () => {
    bot.user.setActivity("ca!help");

    setInterval(async function () {
        console.log("Updating stats...");

        updateStats(defaultCountry, null, false);

    }, 3600000);
})

var reg = /maincounter-number"(?: style="[^"]+")?>\n<span(?: style="[^"]+")?>([^<]+)<\/span>/gm;
var flagReg = /src="(\/img\/flags\/small\/[^"]+)"/gm;
var regNew = /"news_li"><strong>([0-9,]+) new cases?(?:<\/strong> and <strong>([0-9,]+) new deaths?)?/gm;

bot.on("message", message => {
    var gid = parseInt(message.guild.id);
    if (message.content == "ca!help") {
        message.channel.send("**Popis naredbi**\n```ca!keyword - prikazuje trenutnu ključnu riječ\nca!keyword <novaKljučnaRiječ> - promjena ključne riječi\nca!country - prikaz države koju pratiš\nca!country <naziv države> - promjena države koju pratiš\nca!countries - prikazuje popis zemalja za koje možeš vidjeti statistiku\n" +
            keyword[gid] + " <naziv države> - prikazuje statistiku za navedenu državu```");
    }
    if (message.content.split(' ')[0] == "ca!keyword" && message.content != "ca!keyword") {
        let oldKeyWord = keyword[gid];
        keyword[gid] = message.content.split(' ')[1];
        message.channel.send("Ključna riječ promjenjena iz *" + oldKeyWord + "* u: **" + keyword[gid] + "**");
        let data = JSON.stringify(keyword);
        fs.writeFileSync('data.json', data);
    }
    else if (message.content == "ca!keyword") {
        message.channel.send("Ključna riječ je: **" + keyword[gid] + "**. Za promjenu ključne riječi upiši\n```\nca!keyword novaKljučnaRiječ```");
    }
    else if (message.content == "ca!country") {
        message.channel.send("Država koju pratim je: **" + defaultCountry.toUpperCase() + "**");
    }
    else if (message.content == "ca!countries") {
        message.channel.send("Popis zemalja možeš pogledati ovdje: <https://pastebin.com/95vxrkwG>");
    }
    else {
        var msgSplit = message.content.split(' ');
        if (msgSplit[0].toLowerCase() == keyword[gid]) {
            if (msgSplit.length != 2) {
                message.channel.send("Komanda neispravno formatirana. Ispravan format komande je: **" + keyword[gid] + "** *imeDrzave*\nZa prikaz popisa svih naredbi i uputa za korištenje bota upiši **ca!help**\nPopis zemalja možeš pogledati ovdje: <https://pastebin.com/95vxrkwG>");
            }
            else {
                if (!countries.includes(msgSplit[1].toLowerCase())) {
                    message.channel.send("Neispravan naziv zemlje. Ovdje pogledaj popis točnih naziva zemalja: <https://pastebin.com/95vxrkwG>");
                }
                else {
                    updateStats(msgSplit[1], message, true);
                }
            }
        }
        else {
            if (msgSplit[0] == "ca!country" && countries.includes(msgSplit[1])) {
                message.channel.send("Od sada pratim državu: **" + msgSplit[1].toUpperCase().replace(/-/g, " ") + "**");
                defaultCountry = msgSplit[1];
                let defaultCountryRawWrite = { "default": defaultCountry };
                let data = JSON.stringify(defaultCountryRawWrite);
                fs.writeFileSync('country.json', data);
            }
        }
    }
})

const sendUpdateMessage = (message) => {
    /*fs.readdir("./", (err, files) => {
        let images = files.filter(file => file.endsWith(".png")).reverse();
        message.channel.send({
            files: [{ attachment: `./${images[images.length - 1]}`, name: 'image.png' }]
        })
    });*/

    message.channel.send({
        files: [{ attachment: `./generated.png`, name: 'image.png' }]
    })


}

const updateStats = (countryName, message, sendMsg) => {
    request('https://www.worldometers.info/coronavirus/country/' + countryName, function (error, response, body) {

        reg.lastIndex = 0;
        flagReg.lastIndex = 0;
        regNew.lastIndex = 0;

        var zarazenih = reg.exec(body)[1];
        var smrti = reg.exec(body)[1];
        var oporavljeni = reg.exec(body)[1];
        //var flagUrl = flagReg.exec(body)[1];
        var trenutno = separatori(parseInt(zarazenih.replace(/,/g, "")) - parseInt(smrti.replace(/,/g, "")) - parseInt(oporavljeni.replace(/,/g, "")));
        var novih = regNew.exec(body);
        var novoZarazenih = novih[1] == null ? "0" : novih[1];
        var novoUmrlih = novih[2] == null ? "0" : novih[2];

        let bgColor = hsl(Math.random() * 360, 35, 32);



        textToImage.generate(`——— ${countryName.toUpperCase().replace(/-/g, " ")} ———\n• Ukupno zaraženih: ${zarazenih}\n• Trenutno zaraženih: ${trenutno}\n• Broj preminulih: ${smrti}\n• Broj oporavljenih: ${oporavljeni}\n• Novo zaraženih: ${novoZarazenih}\n• Novo preminulih: ${novoUmrlih}`,
            {
                debug: true,
                debugFilename: "generated.png",
                maxWidth: 320,
                fontSize: 18,
                fontFamily: 'Arial',
                lineHeight: 30,
                margin: 5,
                bgColor: bgColor,
                textColor: "white"
            }).then(function (dataUri) {
                reg.lastIndex = 0;
                flagReg.lastIndex = 0;
                regNew.lastIndex = 0;

                if (sendMsg) { sendUpdateMessage(message, dataUri); }
            });



    });
}

bot.login(token);

