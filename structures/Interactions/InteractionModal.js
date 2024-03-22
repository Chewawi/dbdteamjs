const { Collection } = require("../../Utils/Collection");
const { ComponentInteraction } = require("./ComponentInteraction");

class InteractionModal extends ComponentInteraction {
    constructor(data, client) {
        super(data, client)
        this.inputs = new Collection()
        this.___patch(data)
    }

    ___patch(data) {
        for (var i of data.data.components) {
            for (var x of i.components) {
                if (x.type === 4) {
                    this.inputs.set(x.custom_id, x.value)
                }
            }
        }
    }
}

module.exports = { InteractionModal }