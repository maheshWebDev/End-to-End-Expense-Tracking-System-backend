const Razorpay = require("razorpay");
const { generateToken } = require("../middleware/jwtMiddleware");
const Order = require("../models/orderModel");
const User = require("../models/userModel");

module.exports.buyPremiumMembership = async (req, res) => {
  try {
    let instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Creating order
    const order = await new Promise((resolve, reject) => {
      instance.orders.create({ amount: 299, currency: "INR" }, (err, order) => {
        if (err) {
          reject(err);
        } else {
          resolve(order);
        }
      });
    });

    // console.log("order", order);

    // Creating order in MongoDB
    const newOrder = await Order.create({
      orderId: order.id,
      status: "pending",
      user: req.userId,
    });

    // console.log(newOrder);
    return res.status(201).json({ order, key_id: instance.key_id });
  } catch (error) {
    console.error("Error creating premium order:", error.message);
    return res
      .status(403)
      .json({ message: "something went wrong", success: false });
  }
};
module.exports.updateMembershipStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { payment_id, order_id } = req.body;

    // Finding order in MongoDB
    const order = await Order.findOne({ orderId: order_id });

    // Updating order status in MongoDB
    await order.updateOne({ paymentId: payment_id, status: "success" });

    // Updating user in MongoDB based on req.userId
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { isPremiumUser: true } },
      { new: true }
    );
    // console.log(updatedUser);
    return res.status(200).json({
      success: true,
      message: "transaction successful",

      token: generateToken({
        userId: updatedUser._id,
        isPremiumUser: updatedUser.isPremiumUser,
      }),
    });
  } catch (error) {
    console.error("Error updating user to premium:", error.message);
    res.status(404).json({ success: false });
  }
};
