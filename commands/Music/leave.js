const { Command } = require("klasa");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            cooldown: 10,
            aliases: ["forceleave", "leave"],
            permissionLevel: 0,
            requiredPermissions: ["USE_EXTERNAL_EMOJIS"],
            description: (msg) => msg.language.get("COMMAND_LEAVE_DESCRIPTION"),
            extendedHelp: "No extended help available."
        });
    }

    async run(msg) {
        const queue = this.client.queue.get(msg.guild.id);
        const player = this.client.lavalink.get(msg.guild.id);
        if (!msg.member.voiceChannel) return msg.sendMessage("<:penguError:435712890884849664> You're currently not in a voice channel.");
        if (!queue || !player) return msg.sendMessage("<:penguError:435712890884849664> ***There's currently no music playing!***");

        if (await msg.hasAtLeastPermissionLevel(3) || queue.vc.members.size <= 3) {
            try {
                this.client.queue.delete(msg.guild.id);
                await msg.sendMessage("<:penguSuccess:435712876506775553> ***Queue cleared, leaving voice channel.***");
                return this.client.lavalink.leave(msg.guild.id);
            } catch (e) {
                await msg.sendMessage("<:penguSuccess:435712876506775553> ***Leaving voice channel.***");
                return this.client.lavalink.leave(msg.guild.id);
            }
        } else {
            return msg.sendMessage("<:penguError:435712890884849664> ***There are members in the VC right now, use skip instead!***");
        }
    }

};
