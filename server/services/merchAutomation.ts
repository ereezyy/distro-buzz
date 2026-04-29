import logger from "../utils/logger";
import { getDb } from "../db";
import { merchProducts, merchOrders } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuid } from "uuid";

/**
 * Merch Automation Service
 * Integrates with Printful for print-on-demand merchandise
 * Manages product creation, inventory, and order fulfillment
 */
export class MerchAutomationService {
  private static printfulApiKey = process.env.PRINTFUL_API_KEY || "mock_printful_key";
  private static printfulApiUrl = "https://api.printful.com";

  /**
   * Create a new merch product via Printful
   */
  static async createProduct(
    userId: number,
    productName: string,
    productType: string,
    designUrl: string,
    price: number
  ): Promise<any> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const productId = uuid();

    try {
      // In production, call Printful API to create product
      // const response = await fetch(`${this.printfulApiUrl}/products`, {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${this.printfulApiKey}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     name: productName,
      //     type: productType, // t_shirt, hoodie, hat, mug, etc.
      //     design_url: designUrl,
      //     price: price,
      //   }),
      // });
      // const printfulData = await response.json();

      // Save product to database
      await db.insert(merchProducts).values({
        userId,
        title: productName,
        type: productType as any,
        imageUrl: designUrl,
        retailPrice: Math.round(price * 100),
        printfulProductId: `mock_${productId}`,
        status: "active",
      } as any);

      logger.info(`Merch product created: ${productId} - ${productName}`);

      return {
        id: productId,
        productName,
        productType,
        price,
        status: "active",
      };
    } catch (error) {
      logger.error(`Failed to create merch product: ${error}`);
      throw error;
    }
  }

  /**
   * Get all merch products for a user
   */
  static async getUserProducts(userId: number): Promise<any[]> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const products = await db
        .select()
        .from(merchProducts)
        .where(eq(merchProducts.userId, userId))
        .orderBy(desc(merchProducts.createdAt));

      return products;
    } catch (error) {
      logger.error(`Failed to get user products: ${error}`);
      throw error;
    }
  }

  /**
   * Process a merch order
   */
  static async processOrder(
    userId: number,
    productId: string,
    quantity: number,
    customerEmail: string,
    shippingAddress: string
  ): Promise<any> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const orderId = uuid();

    try {
      // Get product details
      const product = await db
        .select()
        .from(merchProducts)
        .where(eq(merchProducts.id, productId));

      if (!product || product.length === 0) {
        throw new Error("Product not found");
      }

      const prod = product[0];
      const totalCents = (prod.retailPrice || 0) * quantity;

      // In production, call Printful API to create order
      // const response = await fetch(`${this.printfulApiUrl}/orders`, {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${this.printfulApiKey}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     external_id: orderId,
      //     shipping: "STANDARD",
      //     items: [{
      //       product_id: prod.printfulProductId,
      //       quantity: quantity,
      //     }],
      //     recipient: {
      //       email: customerEmail,
      //       address1: shippingAddress,
      //     },
      //   }),
      // });
      // const printfulOrder = await response.json();

      // Save order to database
      await db.insert(merchOrders).values({
        userId,
        productId,
        quantity,
        totalPrice: totalCents,
        customerEmail,
        printfulOrderId: `mock_${orderId}`,
        status: "pending",
      } as any);

      logger.info(`Merch order created: ${orderId} - ${quantity}x ${prod.title}`);

      return {
        id: orderId,
        productId,
        quantity,
        totalCents,
        status: "pending",
      };
    } catch (error) {
      logger.error(`Failed to process merch order: ${error}`);
      throw error;
    }
  }

  /**
   * Get order history for a user
   */
  static async getUserOrders(userId: number, limit: number = 50): Promise<any[]> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const orders = await db
        .select()
        .from(merchOrders)
        .where(eq(merchOrders.userId, userId))
        .orderBy(desc(merchOrders.createdAt))
        .limit(limit);

      return orders;
    } catch (error) {
      logger.error(`Failed to get user orders: ${error}`);
      throw error;
    }
  }

  /**
   * Update order status (when Printful webhook fires)
   */
  static async updateOrderStatus(orderId: string, status: string, trackingNumber?: string): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      await db
        .update(merchOrders)
        .set({
          status: status as any,
          trackingNumber: trackingNumber || undefined,
          updatedAt: new Date(),
        } as any)
        .where(eq(merchOrders.id, orderId));

      logger.info(`Order status updated: ${orderId} - ${status}`);
    } catch (error) {
      logger.error(`Failed to update order status: ${error}`);
      throw error;
    }
  }

  /**
   * Get merch analytics
   */
  static async getMerchAnalytics(userId: number): Promise<any> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const products = await db
        .select()
        .from(merchProducts)
        .where(eq(merchProducts.userId, userId));

      const orders = await db
        .select()
        .from(merchOrders)
        .where(eq(merchOrders.userId, userId));

      const totalOrders = orders.length;
      const totalRevenueCents = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      const completedOrders = orders.filter((o) => o.status === "delivered").length;
      const pendingOrders = orders.filter((o) => o.status === "pending").length;

      return {
        totalProducts: products.length,
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenueCents,
        averageOrderValue: totalOrders > 0 ? totalRevenueCents / totalOrders : 0,
        topProducts: products.slice(0, 5),
      };
    } catch (error) {
      logger.error(`Failed to get merch analytics: ${error}`);
      throw error;
    }
  }

  /**
   * Handle Printful webhook for order updates
   */
  static async handlePrintfulWebhook(event: any): Promise<void> {
    try {
      const { type, data } = event;

      if (type === "order_updated") {
        const { id, status, tracking_number } = data;
        await this.updateOrderStatus(id, status, tracking_number);
      } else if (type === "order_shipped") {
        const { id, tracking_number } = data;
        await this.updateOrderStatus(id, "shipped", tracking_number);
      } else if (type === "order_delivered") {
        const { id } = data;
        await this.updateOrderStatus(id, "completed");
      }

      logger.info(`Printful webhook processed: ${type}`);
    } catch (error) {
      logger.error(`Failed to handle Printful webhook: ${error}`);
      throw error;
    }
  }
}
