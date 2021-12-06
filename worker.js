const Queue = require("bull");
const throng = require("throng");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const workers = process.env.WEB_CONCURRENCY || 2;

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

function start() {
  const logUsageQueue = new Queue("logUsuageQueue", REDIS_URL);

  logUsageQueue.process(async (job) => {
    const { subscriptionItemId } = job.data;

    try {
      await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
        quantity: 1,
      });
    } catch (err) {
      console.error(err);
    }
  });
}

throng({ workers, start });
