const mongoose = require("mongoose");
const moment = require("moment-timezone");

// Define the schema for the data
const recordSchema = new mongoose.Schema({
    slNo: { type: Number, required: true }, // Serial Number
    name: { type: String, required: true },
    company: { type: String, required: true },
    usn: { type: String, required: true, unique: true,
        validate: {
            validator: function (v) {
                return /^1BY\d{2}[A-Z]{2}\d{3}$/.test(v);
            },
           
        }
    },
    dateUpdated: {
        type: String, // Store as string to keep only the date part
        default: () => moment().tz("Asia/Kolkata").format("YYYY-MM-DD") // Set default as current date in specific timezone
    },
    batch: { type: Number, required: true },
    status: { type: String, required: false },
    email: { type: String, required: true },
    requestUpdate: { type: String, default: "Request Update" }
}, { collection: 'records', timestamps: true });

// Pre-save middleware to generate Sl.No automatically
recordSchema.pre("save", async function (next) {
    if (!this.slNo) {
        const Counter = mongoose.model("Counter", new mongoose.Schema({
            _id: { type: String, required: true },
            seq: { type: Number, default: 0 }
        }));

        const counter = await Counter.findOneAndUpdate(
            { _id: "alumni" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        this.slNo = counter.seq; // Set Sl.No as the incremented value
    }
    next();
});

// Export the model
module.exports = mongoose.model("Record", recordSchema);
