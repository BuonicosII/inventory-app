const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: { type: String, required: true},
    uri: { type: String, required: true}
})

CategorySchema.virtual("url").get(function () {
    return  `/${this.uri}`
})

module.exports = mongoose.model("Category", CategorySchema);