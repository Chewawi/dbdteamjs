const { setObj } = require("../../Utils/utils");

class EditMessagePayload {
    #MENTIONS = ["users", "roles", "everyone"]

    /**
     * At least one of the options (content or embeds) must be placed and not undefined
     * @typedef {Object} MessageEditPayloadData
     * @property {string} [content]
     * @property {Array<Object>} [embeds]
     * @property {MentionsData} [mentions]
     * @property {Array<Object>} [components]
     * @property {number} [flags]
     * @property {Array<Object>} [files]
     * @property {Array<Object>} [attachments]
     */

    #Data = {
        content: "",
        embeds: [],
        mentions: {},
        components: [],
        flags: 0,
        files: [],
        attachments: []
    }
    #d;
    #files;
    #f;
    constructor(data = {}, files = []) {
        this.#d = typeof data == "string" ? data : setObj(this.#Data, data, { sticker_ids: "stickers" })
        this.#files = [];
        this.#f = files
        if(typeof this.#d == "string"){ var i = this.#d; this.#d = {}; this.#d.content = i };
        
        if(this.#d?.mentions) {
            if ('parse' in this.#d?.mentions) {
                this.#d.allowed_mentions.parse = this.#MENTIONS.filter(mention => this.#d?.mentions?.parse?.some(allowedMention => mention.toLowerCase() === allowedMention?.toLowerCase()))
            }
            
            if ('users' in this.#d?.mentions) {
                this.#d.allowed_mentions.users = this.#d?.mentions?.users
            }
            
            if ('roles' in this.#d?.mentions) {
                this.#d.allowed_mentions.roles = this.#d?.mentions?.roles
            }
        }

        if (typeof this.#f === "object") {
            for (var i in this.#f) {
                if ('url' in this.#f[i] && 'name' in this.#f[i]) {
                    this.#files.push({ name: this.#f[i].name, url: this.#f[i].url })
                    this.#d.attachments.push({ id: i, filename: this.#f[i].name, description: this.#f[i].description })
                }
            }
        }
        delete this.#d.reply
        delete this.#d.mentions
    }

    get payload() {
        return this.#d
    }

    get files() {
        return this.#files
    }
}

module.exports = { EditMessagePayload }