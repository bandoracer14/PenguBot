const { Command } = require("klasa");
const { MessageEmbed } = require("discord.js");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ["text"],
            cooldown: 8,
            permissionLevel: 0,
            aliases: ["musicplay"],
            requiredPermissions: ["USE_EXTERNAL_EMOJIS", "EMBED_LINKS", "ATTACH_FILES"],
            description: (msg) => msg.language.get("COMMAND_PLAY_DESCRIPTION"),
            usage: "<song:string>",
            extendedHelp: "No extended help available."
        });
        this.Music = true;
    }

    async run(msg, [song]) {
        const { voiceChannel } = msg.member;
        this.resolvePermissions(msg, voiceChannel);
        const { music } = msg.guild;
        music.textChannel = msg.channel;

        const songs = await this.client.lavalink.resolveTracks(song);
        return this.handle(msg, songs);
    }

    async handle(msg, songs) {
        const musicInterface = msg.guild.music;
        if (!musicInterface.playing) await this.handleSongs(msg, songs, true);
        if (musicInterface.playing) return this.handleSongs(msg, songs, false);

        try {
            await musicInterface.join(msg.member.voiceChannel);
            return this.play(musicInterface);
        } catch (error) {
            this.client.console.error(error);
            return musicInterface.textChannel.send(`Voice Channel Error: ${error}`).then(() => musicInterface.destroy());
        }
    }

    async handleSongs(msg, songs, first = false) {
        const { music } = msg.guild;
        if (songs.isPlaylist) {
            for (const song of songs) music().add(song, msg.member);
            if (first === false) return msg.send(`Added **${songs.length}** songs to the queue based of your playlist.`);
        }
        const addedSong = music().add(songs[0], msg.member);
        if (first === false) return msg.send({ embed: await this.queueEmbed(addedSong) });
        return null;
    }

    async play(musicInterface) {
        const song = musicInterface.queue[0];

        if (!song) {
            return musicInterface.textChannel.send({ embed: await this.stopEmbed() }).then(() => musicInterface.destroy());
        }

        await this.delayer(500);

        musicInterface.play(song.track);

        musicInterface.on("end", async end => {
            if (end.reason === "REPLACED") {
                return musicInterface.textChannel.send({ embed: await this.playEmbed(song) });
            }
            if (end.reason === "FINISHED") {
                setTimeout(async () => {
                    if (musicInterface.queue.length === 0) {
                        await musicInterface.textChannel.send({ embed: await this.stopEmbed() });
                        return await musicInterface.destroy();
                    } else {
                        await musicInterface.queue.shift();
                        await this.play(musicInterface);
                        return musicInterface.textChannel.send({ embed: await this.playEmbed(song) });
                    }
                }, 500);
            }
        });
        return musicInterface.textChannel.send({ embed: await this.playEmbed(song) });
    }

    resolvePermissions(msg, voiceChannel) {
        const permissions = voiceChannel.permissionsFor(msg.guild.me);

        if (permissions.has("CONNECT") === false) throw "It seems I can't join the party since I lack the CONNECT permission";
        if (permissions.has("SPEAK") === false) throw "Well, well, well, it seems I can connect, but can't speak. Could you fix that please?";
    }

    async playEmbed(song) {
        return new MessageEmbed()
            .setTitle("⏯ | Now Playing - PenguBot")
            .setTimestamp()
            .setFooter("© PenguBot.cc")
            .setColor("#5cb85c")
            .setDescription([`• **Song:** ${song.trackTitle}`,
                `• **Author:** ${song.author}`,
                `• **Length:** ${song.stream === true ? "Live Stream" : song.trackFriendlyDuration}`,
                `• **Requested By:** ${song.requester.tag}`,
                `• **Link:** ${song.trackURL}`]);
    }

    async queueEmbed(song) {
        return new MessageEmbed()
            .setTitle("🗒 | Song Queued - PenguBot")
            .setTimestamp()
            .setFooter("© PenguBot.cc")
            .setColor("#eedc2f")
            .setDescription([`• **Song:** ${song.trackTitle}`,
                `• **Author:** ${song.author}`,
                `• **Length:** ${song.stream === true ? "Live Stream" : song.trackFriendlyDuration}`,
                `• **Requested By:** ${song.requester.tag}`,
                `• **Link:** ${song.trackURL}`]);
    }

    async stopEmbed() {
        return new MessageEmbed()
            .setTitle("⏹ | Queue Finished - PenguBot")
            .setTimestamp()
            .setFooter("© PenguBot.cc")
            .setColor("#d9534f")
            .setDescription([`• **Party Over:** All the songs from the queue have finished playing. Leaving voice channel.`,
                `• **Support:** If you enjoyed PenguBot and it's features, please consider becoming a Patron at: https://www.Patreon.com/PenguBot`]);
    }

};
