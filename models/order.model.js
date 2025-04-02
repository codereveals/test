import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    orderId: {
        type: String,
        required: [true, "Provide orderId"],
        unique: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product"
    },
    product_details: {
        name: String,
        image: Array
    },
    paymentId: {
        type: String,
        default: ""
    },
    payment_status: {
        type: String,
        default: ""
    },
    delivery_address: {
        type: mongoose.Schema.Types.ObjectId,
        default: "address"
    },
    subtotal_amount: {
        type: Number,
        default: 0
    },
    total_amount: {
        type: Number,
        default: 0
    },
    invoice_recipt: {
        type: String,
        default: ""
    },


}, { timestamps: true })


const OrderModel = mongoose.model("order", orderSchema)

export default OrderModel