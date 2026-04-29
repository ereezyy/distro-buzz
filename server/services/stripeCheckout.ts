import Stripe from "stripe";
import * as db from "../db";
import { subscriptions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export interface CheckoutItem {
  type: "plan" | "feature";
  id: string;
  name: string;
  price: number;
}

export interface CreateCheckoutSessionInput {
  userId: string;
  items: CheckoutItem[];
  successUrl: string;
  cancelUrl: string;
}

export class StripeCheckoutService {
  /**
   * Create a Stripe checkout session for subscription or a la carte features
   */
  async createCheckoutSession(input: CreateCheckoutSessionInput) {
    try {
      const lineItems: any[] = [];

      for (const item of input.items as CheckoutItem[]) {
        if (item.type === "plan") {
          // Map plan IDs to Stripe price IDs
          const priceIdMap: Record<string, string> = {
            starter: process.env.STRIPE_PRICE_STARTER_MONTHLY || "",
            pro: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
            label: process.env.STRIPE_PRICE_LABEL_MONTHLY || "",
          };

          const priceId = priceIdMap[item.id];
          if (!priceId) {
            throw new Error(`Invalid plan ID: ${item.id}`);
          }

          lineItems.push({
            price: priceId,
            quantity: 1,
          });
        } else if (item.type === "feature") {
          // Create one-time purchase for a la carte features
          const priceData: any = {
              currency: "usd",
              product_data: {
                name: item.name,
                description: `Add-on feature for your account`,
              },
              unit_amount: Math.round(item.price * 100), // Convert to cents
              recurring: {
                interval: "month",
                interval_count: 1,
              },
            };

          lineItems.push({
            price_data: priceData,
            quantity: 1,
          });
        }
      }

      if (lineItems.length === 0) {
        throw new Error("No valid items in checkout");
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "subscription",
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        customer_email: undefined, // Will be set from user context in tRPC
        metadata: {
          userId: input.userId,
          itemCount: input.items.length,
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
        clientSecret: session.client_secret,
      };
    } catch (error) {
      console.error("Stripe checkout session creation failed:", error);
      throw new Error(`Failed to create checkout session: ${error}`);
    }
  }

  /**
   * Retrieve subscription details for a user
   */
  async getUserSubscription(userId: string) {
    try {
      const database = await db.getDb();
      if (!database) throw new Error("Database not available");

      const result = await database
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, parseInt(userId)))
        .limit(1);

      const sub = result.length > 0 ? result[0] : null;

      if (!sub || !sub.stripeSubscriptionId) {
        return null;
      }

      const stripeSubscription = await stripe.subscriptions.retrieve(
        sub.stripeSubscriptionId
      );

      return {
        id: stripeSubscription.id,
        status: stripeSubscription.status as string,
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end,
        items: stripeSubscription.items.data.map((item: any) => ({
          priceId: item.price.id,
          productId: item.price.product as string,
        })),
      };
    } catch (error) {
      console.error("Failed to retrieve user subscription:", error);
      throw new Error(`Failed to retrieve subscription: ${error}`);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId: string) {
    try {
      const database = await db.getDb();
      if (!database) throw new Error("Database not available");

      const result = await database
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, parseInt(userId)))
        .limit(1);

      const sub = result.length > 0 ? result[0] : null;

      if (!sub || !sub.stripeSubscriptionId) {
        throw new Error("No active subscription found");
      }

      const cancelled = await stripe.subscriptions.update(
        sub.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
        }
      );

      // Update local database
      await database
        .update(subscriptions)
        .set({
          status: "canceled",
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, parseInt(userId)));

      return {
        subscriptionId: cancelled.id,
        cancelAtPeriodEnd: (cancelled as any).cancel_at_period_end,
        currentPeriodEnd: new Date((cancelled as any).current_period_end * 1000),
      };
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      throw new Error(`Failed to cancel subscription: ${error}`);
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(event: Stripe.Event) {
    try {
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          const userId = subscription.metadata?.userId;

          if (userId) {
            const database = await db.getDb();
            if (database) {
              await database
                .update(subscriptions)
                .set({
                  stripeSubscriptionId: subscription.id,
                  stripeCustomerId: subscription.customer as string,
                  status: subscription.status as any,
                  currentPeriodStart: new Date(
                    (subscription as any).current_period_start * 1000
                  ),
                  currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                  updatedAt: new Date(),
                })
                .where(eq(subscriptions.userId, parseInt(userId)));
            }
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const userId = subscription.metadata?.userId;

          if (userId) {
            const database = await db.getDb();
            if (database) {
              await database
                .update(subscriptions)
                .set({
                  status: "canceled",
                  updatedAt: new Date(),
                })
                .where(eq(subscriptions.userId, parseInt(userId)));
            }
          }
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = event.data.object as Stripe.Invoice;
          console.log(`Payment succeeded for invoice ${invoice.id}`);
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          console.error(`Payment failed for invoice ${invoice.id}`);
          break;
        }
      }

      return { received: true };
    } catch (error) {
      console.error("Webhook event handling failed:", error);
      throw new Error(`Webhook processing failed: ${error}`);
    }
  }
}

export const stripeCheckoutService = new StripeCheckoutService();
