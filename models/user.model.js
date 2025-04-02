import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Provide Name"]
    },
    email: {
        type: String,
        required: [true, "Provide Email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Provide Password"]
    },
    avatar: {
        type: String,
        default: ""
    },
    mobile: {
        type: Number,
        default: null
    },
    verifyEmail: {
        type: Boolean,
        default: false
    },
    last_login_date: {
        type: Date,
        default: ""
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Suspended"],
        default: "Active"
    },
    address_detail: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "address"
    }],
    shopping_cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "cartProduct"
    }],
    order_history: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "order"
    }],

    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    access_token: {
        type: String,
        default: ""
    },
    refresh_token: {
        type: String,
        default: ""
    },

    forgot_password_expiry: {
        type: Date,
        default: null
    },
    role: {
        type: String,
        enum: ["ADMIN", "USER"],
        default: "USER"
    },

}, { timestamps: true })


const UserModel = mongoose.model("User", userSchema)

export default UserModel