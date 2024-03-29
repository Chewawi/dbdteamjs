const { Base } = require("./Base");
const Endpoints = require("../rest/Endpoints");
const { resolveImage } = require("../utils/ImageResolver");
const { readOnly } = require("../utils/utils");

/**
 * @extends {Base}
 */
class GuildRole extends Base {
  #data;
  constructor(data, guild, client) {
    super(client);
    this.#data = data;
    this.id = data.id;
    this.guildId = guild?.id || guild;
    if (client.guild && client.guild.cache)
      readOnly(this, "guild", client.guilds.cache.get(guild));
    this.name = data.name;
    this.hoist = !!data.hoist;
    this.icon = null;
    this.position = data.position;
    this.permissions = data.permissions;
    this.managed = !!data.managed;
    this.mentionable = !!data.mentionable;
    this.tags = [];
    this.flags = data.flags;
    this._patch();
  }
  _patch() {
    if ("icon" in this.#data && this.#data.icon) {
      this.icon = this.#data.icon;
    }
    if ("tags" in this.#data && this.#data.tags?.[0]) {
      this.tags = this.#data.tags;
    }
  }

  async delete(reason = null) {
    const response = this.client.rest.request(
      "DELETE",
      Endpoints.GuildRole(this.guildId, this.id),
      true,
      null,
      reason
    );

    return response.error ? false : true;
  }

  async edit(newRole = {}) {
    const reason = newRole?.reason;
    const response = this.client.rest.request(
      "PATCH",
      Endpoints.GuildRole(this.guildId, this.id),
      true,
      newRole,
      null,
      reason
    );

    if (response.error) {
      return response;
    } else {
      return new GuildRole(response.data, this.guildId, this.client);
    }
  }

  async setName(name, reason) {
    const response = await this.edit({ name, reason });

    return response;
  }

  async setPosition(position, reason) {
    const response = await this.edit({ position, reason });

    return response;
  }

  async setColor(color, reason) {
    const response = await this.edit({ color, reason });

    return response;
  }

  async setHoist(hoist, reason) {
    const response = await this.edit({ hoist: !!hoist, reason });

    return response;
  }

  async setIcon(icon, reason) {
    const data = await resolveImage(icon);
    // @ts-ignore
    // ?
    const response = await this.edit({ icon: data.uri, reason });

    return response;
  }

  async setEmoji(unicode_emoji, reason) {
    const response = await this.edit({ unicode_emoji, reason });

    return response;
  }

  async setMentionable(mentionable, reason) {
    const response = await this.edit({ mentionable: !!mentionable, reason });

    return response;
  }
}

module.exports = { GuildRole };
