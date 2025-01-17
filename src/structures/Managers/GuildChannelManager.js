const { readOnly, typeChannel } = require("../../utils/utils");
const { Collection } = require("../../utils/Collection");
const Endpoints = require("../../rest/Endpoints");

class GuildChannelManager {
  constructor(guildId, client) {
    readOnly(this, "client", client);
    readOnly(this, "guildId", guildId);
    this.cache = new Collection();
    this._fetchAllChannels();
  }

  async _fetchAllChannels() {
    try {
      var allChannels = await this.client.rest.request(
        "GET",
        Endpoints.GuildChannels(this.guildId),
        true
      );
      var _return = new Collection();
      allChannels = allChannels.data;

      for (var i of allChannels) {
        var guild =
          this.client.channels.cache.get(i.id).guild ||
          this.cache.get(i.id).guild;
        i.guild = guild;
        this.client.channels.cache.set(i.id, typeChannel(i, this.client));
        this.cache.set(i.id, typeChannel(i, this.client));
        _return.set(i.id, typeChannel(i, this.client));
      }

      return _return;
    } catch (err) {
      console.log(err);
    }
  }

  async fetch(id) {
    if (!id || id?.length >= 17 || id?.length <= 18) {
      var res = await this._fetchAllChannels();

      return res;
    } else {
      var channel = await this.client.rest.request(
        "GET",
        Endpoints.CHANNEL(id),
        true
      );

      channel = channel.data;
      this.cache.set(channel.id, channel);
      this.client.channels.cache.set(channel.id, channel);
      return channel;
    }
  }
}

module.exports = { GuildChannelManager };
