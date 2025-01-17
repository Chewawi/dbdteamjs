const { readOnly, getAllStamps, setObj } = require("../utils/utils");
const { Base } = require("./Base");
const { MemberRolesManager } = require("./Managers/RolesManager");
const Endpoints = require("../rest/Endpoints");
const { User } = require("./User");
const { PermissionsBitField } = require("../types/PermissionsBitFields");
const { MemberEditPayload } = require("./Payloads/MemberEditPayload");

/**
 * @typedef {import('./Guild.js').Guild} Guild
 * @typedef {import("./Payloads/MemberEditPayload").MemberEditPayloadData} MemberEditPayloadData
 */

class Member extends Base {
  #DATE;
  #PREMIUM;
  #TIMEOUTED;
  #client;
  #d;
  /**
   * Represents a GuildMember
   * @param {Object} data - The member payload
   * @param {Guild} guild - The guild where the member is it
   * @param {?} client - The Client
   */
  constructor(data, guild, client) {
    super(client);
    this.#d = data;
    this.#client = client;
    this.#DATE = new Date(data.joined_at);
    this.#PREMIUM = new Date(data.premium_since);
    this.#TIMEOUTED = new Date(data.communication_disabled_until);
    /**
     * The ID of the User
     * @type {number}
     */
    this.id = data.id;
    /**
     * The Guild where the member is it
     * @type {Guild}
     * @readonly
     */
    this.guild = guild;
    readOnly(this, "guild", guild);

    /**
     * All stamps related to when the user joined
     * @type {object}
     */
    this.joined = getAllStamps(this.getCreatedAt);
    /**
     * Represents the user
     * @type {User}
     * @readonly
     */
    this.user = this.author;
    readOnly(this, "author", this.author);

    /**
     * If the member is muted
     * @type {boolean}
     */
    this.isMuted = data.mute;

    /**
     * If the member is deafened
     * @type {boolean}
     */
    this.isDeafened = data.deaf;

    /**
     * The member is flags
     * @type {boolean}
     */
    this.flags = data.flags;

    /**
     * The member permissions
     * @type {Object}
     */
    this.permissions = data.permissions;

    /**
     * The member role ids
     * @type {number[]}
     * @readonly
     */
    this.roleIds = data.roles;
    readOnly(this, "roleIds", data.roles);

    /**
     * The member roles
     * @type {MemberRolesManager}
     */
    this.roles = new MemberRolesManager(this.guild, data, this.#client);

    /**
     * The presence of the Member.
     * @type {object | null}
     */
    this.presence = null;

    this._patch(data);
  }
  /**
   * Represents the user
   * @type {User}
   * @returns {User}
   */
  get author() {
    var x;
    if (this.id !== this.#client.user.id) {
      if (this.#client.users.cache.get(this.id)) {
        x = this.#client.users.cache.get(this.id);
      } else {
        var user = this.#d.user;
        if (!user) {
          user = this.#d.author;
        }
        this.#client.users.cache.set(this.id, new User(user, this.#client));
        x = this.#client.users.cache.get(this.id);
      }
    } else {
      x = this.#client.user;
    }
    return x;
  }

  _patch(data) {
    if ("nick" in data && data.nick !== null && data.nick !== undefined) {
      /**
       * The nickname of the GuildMember
       * @type {string|undefined}
       */
      this.nick = data.nick;
    }
    if ("avatar" in data && data.avatar !== null && data.avatar !== undefined) {
      /**
       * The avatar of the GuildMember
       * @type {string|undefined}
       */
      this.avatar = data.avatar;
    }
    if (
      "premium_since" in data &&
      data.premium_since !== null &&
      data.premium_since !== undefined
    ) {
      /**
       * The information stamps whether the guild member has boosted the server.
       * @type {Object|undefined}
       */
      this.premiumSince = getAllStamps(this.#PREMIUM);
    }
    if ("pending" in data) {
      /**
       * If the user is pending
       * @type {boolean}
       */
      this.pending = data.pending;
    }
    if ("permissions" in data && !data.permissions) {
      /**
       * The permissions of the member
       * @type {Object}
       */
      this.permissions = data.permissions;
    }
    if ("communication_disabled_until" in data) {
      /**
       * The stamp if the GuildMember is timed out.
       * @type {Object}
       */
      this.communicationDisabledUntil = getAllStamps(this.#TIMEOUTED);

      /**
       * The stamp if the GuildMember is timed out.
       * @type {Object}
       */
      this.timeoutUntil = this.communicationDisabledUntil;

      /**
       * If the GuildMember is timed out.
       * @type {boolean}
       */
      this.communicationDisabled = data.communication_disabled_until
        ? true
        : false;
      /**
       * If the GuildMember is timed out.
       * @type {boolean}
       */
      this.timeouted = this.communicationDisabled;
    }

    if (this.id === this.#client.user.id) {
      this.edit;
      this.kick;
      this.ban;
      /**
       * Only if the GuildMember is the Client.
       * @function
       * @returns {Promise<Object>}
       */
      this.leave = async () => {
        const response = await this.#client.rest.request(
          "DELETE",
          Endpoints.UserGuild(this.guild.id),
          true
        );

        return response;
      };
    }
  }

  /**
   * If the GuildMember is kickable by the Client
   * @type {boolean}
   * @returns {boolean}
   */

  get kickable() {
    var _p = 0;
    var _h =
      this.roles.cache.toJSON().sort((a, b) => b.position - a.position)?.[0]
        ?.position || 0;
    const c = this.guild.members.me;
    var _h1 =
      c.roles.cache.toJSON().sort((a, b) => b.position - a.position)?.[0]
        ?.position || 0;
    for (var perms of c.roles.cache.toJSON()) {
      _p |= perms.permissions;
    }

    const conditions = {
      kick:
        _p & PermissionsBitField.Roles.KickMembers ||
        _p & PermissionsBitField.Roles.Administrator,
      client: this.id !== this.#client.user.id,
      owner: this.id.toString() !== this.guild.ownerId,
      highest: _h <= _h1,
    };

    var expression =
      !!conditions.kick &&
      conditions.client &&
      conditions.owner &&
      conditions.highest;

    return expression;
  }

  /**
   * If the GuildMember is banneable by the Client
   * @type {boolean}
   * @returns {boolean}
   */

  get banneable() {
    var _p = 0;
    var _h =
      this.roles.cache.toJSON().sort((a, b) => b.position - a.position)?.[0]
        ?.position || 0;
    const c = this.guild.members.me;
    var _h1 =
      c.roles.cache.toJSON().sort((a, b) => b.position - a.position)?.[0]
        ?.position || 0;
    for (var perms of c.roles.cache.toJSON()) {
      _p |= perms.permissions;
    }

    const conditions = {
      ban:
        _p & PermissionsBitField.Roles.BanMembers ||
        _p & PermissionsBitField.Roles.Administrator,
      client: this.id !== this.#client.user.id,
      owner: this.id.toString() !== this.guild.ownerId,
      highest: _h <= _h1,
    };

    var expression =
      !!conditions.ban &&
      conditions.client &&
      conditions.owner &&
      conditions.highest;

    return expression;
  }

  /**
   * Changes the nickname of the GuildMember
   *
   * @param {MemberEditPayloadData} obj -
   * @returns {Promise<boolean>}
   * @async
   */

  async edit(obj) {
    var payload = new MemberEditPayload(obj);

    var reason = payload.payload.reason;

    delete payload.payload.reason;

    var response = await this.#client.rest.request(
      "PATCH",
      Endpoints.GuildMember(this.guild.id, this.id),
      true,
      { data: payload.payload },
      reason
    );

    if (response.error) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Edits the GuildMember nickname
   *
   * @param {string} nickname - The new nickname for the GuildMember
   * @param {string} reason - The reason
   * @returns {Promise<Object>}
   * @async
   */

  async changeNickname(nickname, reason) {
    reason = reason?.trim();
    var response = await this.#client.rest.request(
      "PATCH",
      Endpoints.GuildMember(this.guild.id, this.id),
      true,
      { data: { roles: this.roles, flags: this.flags, nick: nickname } },
      reason
    );

    return response;
  }

  /**
   * Kick the GuildMember from the server
   * @param {string} reason - The reason
   * @returns {Promise<Object>}
   * @async
   */

  async kick(reason) {
    reason = reason?.trim();

    var response = await this.#client.rest.request(
      "DELETE",
      Endpoints.GuildMember(this.guild.id, this.id),
      true,
      {},
      reason
    );

    return response;
  }

  /**
   * Ban the GuildMember from the server
   *
   * @typedef {Object} MemberBanOptions
   * @property {string} [reason] - The reason
   * @property {number} [delete_message_seconds]
   *
   * @param {MemberBanOptions} obj - The options to ban a member
   *
   * @returns {Promise<Object>}
   * @async
   */

  async ban(obj) {
    const banObj = {
      delete_message_seconds: 0,
      reason: null,
    };

    /** @type {MemberBanOptions} */
    var data = setObj(banObj, obj, {
      delete_message_seconds: "deleteMessageSeconds",
    });

    var response = await this.#client.rest.request(
      "PUT",
      Endpoints.GuildBan(this.guild.id, this.id),
      true,
      {},
      data.reason
    );

    return response;
  }

  /**
   * Returns the mention of the GuildMember
   * @returns {string}
   */
  toString() {
    return `<@${this.id}>`;
  }
}

export { Member };