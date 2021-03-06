const { Command } = require("klasa");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ["sg"],
            permissionLevel: 10,
            usage: "<game:string> [...]",
            usageDelim: " ",
            description: (msg) => msg.language.get("COMMAND_SG_DESCRIPTION")
        });
    }

    async run(msg, [...game]) {
        this.client.shard.broadcastEval(this.client.user.setPresence({ activity: { name: game.join(" "), status: "online" } })
            .then(msg.sendMessage(`**Playing status has been changed to:** ${game.join(" ")}`))
            .catch(err => { throw err; }));
    }

};
