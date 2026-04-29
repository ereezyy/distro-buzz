import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, TrendingUp, Package, DollarSign } from "lucide-react";

export default function Merch() {
  const [activeTab, setActiveTab] = useState("products");

  const products = [
    {
      id: 1,
      name: "Artist Logo T-Shirt",
      type: "t_shirt",
      price: 24.99,
      profit: 8.50,
      sales: 142,
      status: "active",
      image: "🎨",
    },
    {
      id: 2,
      name: "Limited Edition Hoodie",
      type: "hoodie",
      price: 49.99,
      profit: 18.75,
      sales: 67,
      status: "active",
      image: "🧥",
    },
    {
      id: 3,
      name: "Vinyl Sticker Pack",
      type: "sticker",
      price: 5.99,
      profit: 2.40,
      sales: 289,
      status: "active",
      image: "🏷️",
    },
    {
      id: 4,
      name: "Artist Poster",
      type: "poster",
      price: 14.99,
      profit: 4.50,
      sales: 45,
      status: "draft",
      image: "📄",
    },
  ];

  const recentOrders = [
    {
      id: 1,
      customer: "John D.",
      product: "Artist Logo T-Shirt",
      amount: 24.99,
      status: "shipped",
      date: "April 26, 2026",
    },
    {
      id: 2,
      customer: "Sarah M.",
      product: "Limited Edition Hoodie",
      amount: 49.99,
      status: "processing",
      date: "April 27, 2026",
    },
    {
      id: 3,
      customer: "Mike L.",
      product: "Vinyl Sticker Pack",
      amount: 5.99,
      status: "delivered",
      date: "April 24, 2026",
    },
  ];

  const stats = [
    { label: "Total Revenue", value: "$4,287.50", icon: DollarSign },
    { label: "Total Profit", value: "$1,542.30", icon: TrendingUp },
    { label: "Items Sold", value: "543", icon: ShoppingCart },
    { label: "Active Products", value: "3", icon: Package },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "shipped":
      case "delivered":
        return "bg-green-500/10 text-green-600 border-green-500/30";
      case "processing":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "draft":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      default:
        return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-foreground">Merch Store</h1>
        <p className="text-muted-foreground mt-2">Print-on-demand products and order management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="glass border-0">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                    <p className="text-2xl font-semibold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <Icon className="w-6 h-6 text-accent opacity-40" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {["products", "orders"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "products" ? "Products" : "Recent Orders"}
          </button>
        ))}
      </div>

      {/* Products */}
      {activeTab === "products" && (
        <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id} className="glass border-0">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                    {product.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{product.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">{product.type.replace("_", " ")}</p>
                      </div>
                      <Badge variant="outline" className={`border ${getStatusColor(product.status)}`}>
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-semibold text-foreground">${product.price}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Your Profit</p>
                        <p className="font-semibold text-green-600">${product.profit}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sold</p>
                        <p className="font-semibold text-foreground">{product.sales}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80 text-xs h-8">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80 text-xs h-8">
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            Create New Product
          </Button>
        </div>
      )}

      {/* Orders */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <Card key={order.id} className="glass border-0">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{order.product}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Customer: {order.customer}</p>
                    <p className="text-xs text-muted-foreground mt-1">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">${order.amount}</p>
                    <Badge variant="outline" className={`border ${getStatusColor(order.status)} mt-2`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Profit Breakdown */}
      <Card className="glass border-0">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-lg">Profit Breakdown</CardTitle>
          <CardDescription>Your earnings by product</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {products
              .filter((p) => p.status === "active")
              .map((product) => {
                const totalProfit = product.profit * product.sales;
                return (
                  <div key={product.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{product.name}</span>
                      <span className="text-sm font-semibold text-green-600">${totalProfit.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${(totalProfit / 2000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
