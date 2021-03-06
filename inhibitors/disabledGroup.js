const { Inhibitor } = require("klasa");

module.exports = class extends Inhibitor {

    constructor(...args) {
        super(...args, {
            enabled: true,
            spamProtection: false
        });
    }

    async run(msg, cmd) {
        if (!msg.guild.configs.disabledCommandsGroup.includes(cmd.category)) return;
        throw msg.language.get("INHIBITOR_DISABLED_GROUP");
    }

};
