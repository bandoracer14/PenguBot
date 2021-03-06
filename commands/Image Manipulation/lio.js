const { Command } = require("klasa");
const fs = require("fs-nextra");
const { Canvas } = require("canvas-constructor");
const { get } = require("snekfetch");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            cooldown: 8,
            aliases: ["lionme"],
            requiredPermissions: ["ATTACH_FILES", "USE_EXTERNAL_EMOJIS", "EMBED_LINKS"],
            description: (msg) => msg.language.get("COMMAND_LIO_DESCRIPTION"),
            extendedHelp: "No extended help available.",
            usage: "[user:user]"
        });
    }

    async run(msg, [user = msg.author]) {
        const lio = await fs.readFile(`${process.cwd()}/assets/manipulation/lio.png`);
        const avi = await get(user.displayAvatarURL({ format: "png", sze: 128 })).then(res => res.body);
        const img = await new Canvas(512, 512)
            .addImage(lio, 0, 0, 512, 512)
            .addImage(avi, 160, 25.5, 250, 250, { type: "round", radius: 120 })
            .toBufferAsync();
        return msg.channel.sendFile(img);
    }

};
