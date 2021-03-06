const { Event } = require("klasa");
const { WebhookClient } = require("discord.js");
const moment = require("moment");
const config = require("../config");
const { MessageEmbed } = require("discord.js");

const webhook = new WebhookClient("435500732507226112", config.webhooks.guildEvent);

module.exports = class extends Event {

    async run(guild) {
        // Logging New Guilds
        const gcount = (await this.client.shard.fetchClientValues("guilds.size")).reduce((prev, val) => prev + val, 0);
        const guildlog = new MessageEmbed()
            .setAuthor("Left a Guild - PenguBot", this.client.user.avatarURL())
            .setColor("#d9534f")
            .setTimestamp()
            .setFooter(`Total Guilds Count: ${gcount}`)
            .setDescription(`• **Name (ID):** ${guild.name} (${guild.id})
• **Owner:** ${guild.owner.user.tag} (${guild.owner.user.id})
• **Members / Bots / Total:** ${guild.members.filter(m => !m.user.bot).size} / ${guild.members.filter(m => m.user.bot).size} / ${guild.memberCount}
• **Created At:** ${moment(guild.createdAT).format("dddd, MMMM Do YYYY ")}`);
        if (guild.iconURL()) guildlog.setThumbnail(guild.iconURL());
        webhook.send({ embeds: [guildlog] });
    }

};
