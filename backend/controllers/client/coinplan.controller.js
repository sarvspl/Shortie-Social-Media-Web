const CoinPlan = require("../../models/coinplan.model");

//import models
const User = require("../../models/user.model");
const History = require("../../models/history.model");

//mongoose
const mongoose = require("mongoose");

//generateHistoryUniqueId
const { generateHistoryUniqueId } = require("../../util/generateHistoryUniqueId");

//get coinPlan
exports.getCoinplan = async (req, res) => {
  try {
    const coinPlan = await CoinPlan.find({ isActive: true }).sort({ coin: 1, amount: 1 }).lean();

    return res.status(200).json({
      status: true,
      message: "Retrive CoinPlan Successfully",
      data: coinPlan,
    });
  } catch {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//when user purchase the coinPlan create coinPlan history by user
exports.createHistory = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.coinPlanId || !req.body.paymentGateway) {
      return res.json({ status: false, message: "Oops ! Invalid details." });
    }

    const uniqueId = generateHistoryUniqueId();
    const userId = new mongoose.Types.ObjectId(req.body.userId);
    const coinPlanId = new mongoose.Types.ObjectId(req.body.coinPlanId);
    const paymentGateWay = req.body.paymentGateway.trim();

    const [user, coinPlan] = await Promise.all([User.findById(userId).select("_id isBlock").lean(), CoinPlan.findById(coinPlanId)]);

    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!coinPlan) {
      return res.status(200).json({ status: false, message: "CoinPlan does not found." });
    }

    await Promise.all([
      User.updateOne(
        { _id: userId },
        {
          $inc: { coin: coinPlan.coin },
        },
      ),
      History.create({
        userId: user._id,
        planId: coinPlan._id,
        coin: coinPlan.coin,
        amount: coinPlan?.amount,
        paymentGateway: paymentGateWay,
        uniqueId: uniqueId,
        type: 2,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "When user purchase the coinPlan created coinPlan history!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//purchase plan through stripe ( web )
exports.executeStripePayment = async (req, res) => {
  try {
    console.log("Stripe Payment API initiated for web:", req.body);

    const { userId, coinPlanId, currency, billing_details, paymentGateway, payment_method_id } = req.body;

    if (!userId || !coinPlanId || !currency || !billing_details || !paymentGateway) {
      return res.status(200).json({ status: false, message: "Invalid request. Required details missing." });
    }

    const userObjId = new mongoose.Types.ObjectId(req.body.userId);
    const coinPlanObjectId = new mongoose.Types.ObjectId(coinPlanId);
    const trimmedGateway = paymentGateway.trim();

    const [orderHistoryUniqueId, user, coinPlan] = await Promise.all([
      generateHistoryUniqueId(),
      User.findOne({ _id: userObjId }).select("_id isBlock").lean(),
      CoinPlan.findOne({ _id: coinPlanObjectId }).lean(),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin." });
    }

    if (!coinPlan) {
      return res.status(200).json({ status: false, message: "Coin plan not found." });
    }

    if (!settingJSON) {
      return res.status(200).json({ status: false, message: "Configuration settings not found." });
    }

    if (!payment_method_id) {
      return res.status(200).json({ status: false, message: "Payment method ID is required." });
    }

    console.log("Received payment_method_id:", payment_method_id);

    const stripe = require("stripe")(settingJSON?.stripeSecretKey);

    const paymentMethod = await stripe.paymentMethods.retrieve(payment_method_id);
    if (!paymentMethod) {
      return res.status(200).json({ status: false, message: "Invalid payment method." });
    }

    const customer = await stripe.customers.create({
      email: billing_details.email,
      name: billing_details.name,
      address: {
        line1: billing_details?.address?.line1,
        line2: billing_details?.address?.line2,
        postal_code: billing_details?.address?.postal_code,
        city: billing_details?.address?.city,
        state: billing_details?.address?.state,
        country: billing_details?.address?.country,
      },
    });

    console.log("Stripe customer created:", customer);

    const finalPrice = coinPlan.amount;
    console.log("finalPrice executeStripePayment", finalPrice);

    if (currency === "inr" && finalPrice < 50) {
      return res.status(200).json({
        status: false,
        message: "Minimum transaction amount should be ₹50.",
      });
    }

    const amount = Math.round(finalPrice * 100);

    let intent = await stripe.paymentIntents.create({
      amount: amount,
      currency,
      customer: customer.id,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      shipping: {
        name: billing_details.name,
        address: {
          line1: billing_details?.address?.line1,
          line2: billing_details?.address?.line2,
          postal_code: billing_details?.address?.postal_code,
          city: billing_details?.address?.city,
          state: billing_details?.address?.state,
          country: billing_details?.address?.country,
        },
      },
      payment_method: payment_method_id,
    });

    console.log("Stripe PaymentIntent created:", intent.id);

    intent = await stripe.paymentIntents.confirm(intent.id);
    console.log("PaymentIntent status after confirmation:", intent.status);

    if (intent.status === "requires_action" && intent.next_action.type === "use_stripe_sdk") {
      return res.status(200).json({
        status: true,
        requires_action: true,
        payment_intent_client_secret: intent.client_secret,
      });
    } else if (intent.status === "succeeded") {
      console.log("Payment successful");

      res.status(200).json({
        status: true,
        message: "Payment successful, coins added to your account.",
        payment_intent_client_secret: intent.client_secret,
      });

      await Promise.all([
        User.updateOne(
          { _id: user?._id, coin: { $gt: 0 } },
          {
            $inc: { coin: coinPlan.coin },
          },
        ),
        History.create({
          userId: user?._id,
          planId: coinPlan?._id,
          coin: coinPlan?.coin,
          amount: coinPlan?.amount,
          paymentGateway: trimmedGateway,
          uniqueId: orderHistoryUniqueId,
          type: 2,
          date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        }),
      ]);
    } else {
      return res.status(200).json({
        status: false,
        message: "Payment failed. Invalid PaymentIntent status.",
      });
    }
  } catch (error) {
    console.error("Error in payment processing:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
