const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const PlantSchema = new Schema({
    name: { type: String, required: true},
    description: { type: String, required: true},
    inStock: {type: Number, required: true},
    price: {type: Number, required: true},
    category: [{type: Schema.Types.ObjectId, ref: "Category", required: true}],
    uri: { type: String, required: true}
})

PlantSchema.virtual("url").get(function () {
    return  `/${this.category[0].uri}/${this.uri}`
})

module.exports = mongoose.model("Plant", PlantSchema);