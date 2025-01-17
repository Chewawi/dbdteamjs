// TODO: find a better name for this.
module.exports.Contexts = {
  Guild: 0,
  Channel: 2,
  DM: 1,
};

module.exports.InteractionTypes = {
  Slash: 1,
  User: 2,
  Message: 3,
};

module.exports.SlashTypes = {
  SubCommand: 1,
  SubCommandGroup: 2,
  String: 3,
  Integer: 4,
  Boolean: 5,
  User: 6,
  Channel: 7,
  Role: 8,
  Mentionable: 9,
  Number: 10,
  Attachment: 11,
};

module.exports.ComponentTypes = {
  ActionRow: 1,
  Button: 2,
  String: 3,
  TextInput: 4,
  User: 5,
  Role: 6,
  Mentionable: 7,
  Channel: 8,
};

module.exports.ButtonStyles = {
  Primary: 1,
  Secondary: 2,
  Success: 3,
  Danger: 4,
  Link: 5,
};
