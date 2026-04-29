import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, ShoppingCart, Lock } from "lucide-react";

export default function Checkout() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<string[]>([]);

  const features = [
    {
      id: "voice_outreach",
      name: "Voice Outreach",
      description: "AI phone calls to venues and bookers",
      price: 99,
      included: ["Unlimited calls", "Call transcription", "Follow-up tracking"],
    },
    {
      id: "gig_discovery",
      name: "Gig Discovery Syndicate",
      description: "Scan 8 gig sources simultaneously",
      price: 149,
      included: ["8 source integration", "AI ranking", "Weekly digest"],
    },
    {
      id: "merch_automation",
      name: "Merch Automation",
      description: "Print-on-demand store management",
      price: 79,
      included: ["Unlimited products", "Order fulfillment", "Profit tracking"],
    },
    {
      id: "legal_protection",
      name: "Legal Protection",
      description: "DMCA, copyright, and contract tools",
      price: 129,
      included: ["DMCA filing", "Copyright registration", "Contract templates"],
    },
    {
      id: "ai_agent",
      name: "AI Talent Agent",
      description: "Full AI agent with Groq/Grok",
      price: 199,
      included: ["Chat interface", "Task automation", "Negotiation drafts"],
    },
  ];

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: 199,
      description: "Perfect for emerging artists",
      features: ["Voice Outreach", "Gig Discovery", "Basic Analytics"],
    },
    {
      id: "pro",
      name: "Professional",
      price: 449,
      description: "For serious musicians",
      features: ["All Starter features", "Merch Automation", "Legal Protection", "Priority support"],
    },
    {
      id: "label",
      name: "Label",
      price: 799,
      description: "For labels and management",
      features: ["All Professional features", "AI Talent Agent", "Multi-artist", "API access"],
    },
  ];

  const toggleCart = (id: string) => {
    setCartItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const cartTotal = cartItems.reduce((sum, id) => {
    const feature = features.find((f) => f.id === id);
    return sum + (feature?.price || 0);
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-foreground">Pricing & Checkout</h1>
        <p className="text-muted-foreground mt-2">Choose your plan or build custom</p>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`glass border-0 cursor-pointer transition-all ${
                selectedPlan === plan.id ? "ring-2 ring-accent" : ""
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className={`w-full ${
                    selectedPlan === plan.id
                      ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                      : "border-border text-foreground hover:bg-secondary"
                  }`}
                  variant={selectedPlan === plan.id ? "default" : "outline"}
                >
                  {selectedPlan === plan.id ? "Selected" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* A La Carte Features */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">A La Carte Features</h2>
        <div className="space-y-3">
          {features.map((feature) => (
            <Card
              key={feature.id}
              className="glass border-0 cursor-pointer hover-lift"
              onClick={() => toggleCart(feature.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          cartItems.includes(feature.id)
                            ? "bg-accent border-accent"
                            : "border-border"
                        }`}
                      >
                        {cartItems.includes(feature.id) && (
                          <Check className="w-3 h-3 text-accent-foreground" />
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground">{feature.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {feature.included.map((item, idx) => (
                        <Badge key={idx} variant="outline" className="border-border text-xs text-muted-foreground">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-2xl font-bold text-accent">${feature.price}</p>
                    <p className="text-xs text-muted-foreground">/month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      <Card className="glass border-0">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {cartItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No items selected</p>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {cartItems.map((id) => {
                  const feature = features.find((f) => f.id === id);
                  return (
                    <div key={id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{feature?.name}</span>
                      <span className="text-foreground font-medium">${feature?.price}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-accent">${cartTotal}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">/month, billed monthly</p>
              </div>
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Lock className="w-4 h-4 mr-2" />
                Proceed to Payment
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="glass border-0">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">Yes, cancel your subscription anytime with no penalties.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Do you offer a free trial?</h4>
            <p className="text-sm text-muted-foreground">Yes, 14-day free trial on all plans. No credit card required.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Can I upgrade or downgrade?</h4>
            <p className="text-sm text-muted-foreground">Yes, change your plan anytime. We'll prorate your billing.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
