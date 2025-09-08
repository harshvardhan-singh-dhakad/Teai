import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Hobby",
    price: "$19",
    period: "/month",
    description: "For personal projects and testing.",
    features: [
      "2 AI Agents",
      "500 Call Minutes/Month",
      "Basic Analytics",
      "Community Support",
    ],
    cta: "Choose Hobby",
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    description: "For small businesses and startups.",
    features: [
      "10 AI Agents",
      "5,000 Call Minutes/Month",
      "Advanced Analytics",
      "Priority Email Support",
      "API Access",
    ],
    cta: "Choose Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large-scale applications.",
    features: [
      "Unlimited AI Agents",
      "Custom Call Volume",
      "Dedicated Infrastructure",
      "24/7 Enterprise Support",
      "Custom Integrations",
    ],
    cta: "Contact Sales",
  },
]

export default function BillingPage() {
  return (
    <div className="grid gap-6">
       <Card>
            <CardHeader>
                <CardTitle className="font-headline">Billing</CardTitle>
                <CardDescription>Manage your subscription and billing details.</CardDescription>
            </CardHeader>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
            <Card key={plan.name} className={`flex flex-col ${plan.popular ? 'border-primary' : ''}`}>
            <CardHeader>
                {plan.popular && <div className="text-sm font-bold text-primary mb-2">Most Popular</div>}
                <CardTitle className="font-headline">{plan.name}</CardTitle>
                <div className="flex items-baseline">
                <span className="text-4xl font-bold tracking-tighter">{plan.price}</span>
                {plan.period && <span className="text-sm font-medium text-muted-foreground">{plan.period}</span>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <ul className="space-y-2 text-sm">
                {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                    </li>
                ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>{plan.cta}</Button>
            </CardFooter>
            </Card>
        ))}
        </div>
    </div>
  )
}
