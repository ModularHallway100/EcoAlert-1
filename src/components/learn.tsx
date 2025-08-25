import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, HeartPulse, Leaf, Siren, ShieldCheck, Car } from "lucide-react"

export function Learn() {
  const pollutionTips = [
    {
      title: "Reduce Vehicle Emissions",
      content: "Walk, bike, carpool, or use public transportation whenever possible. Combine errands to make fewer trips. Keep your car well-maintained to improve fuel efficiency and reduce emissions.",
      icon: Car,
    },
    {
      title: "Conserve Energy",
      content: "Turn off lights and unplug electronics when not in use. Use energy-efficient appliances and switch to LED light bulbs. This reduces the demand on power plants, which are a major source of pollution.",
      icon: Leaf,
    },
    {
      title: "Minimize Waste",
      content: "Follow the 3 R's: Reduce, Reuse, Recycle. Avoid single-use plastics and opt for reusable alternatives. Composting food scraps can also significantly reduce landfill waste and methane emissions.",
      icon: Leaf,
    },
  ];

  const emergencyTips = [
    {
      title: "In Case of Fire",
      content: "If you see a fire, alert others and evacuate immediately. Stay low to the ground to avoid smoke inhalation. Never use an elevator during a fire. Have a designated meeting point outside.",
      icon: Flame,
    },
    {
      title: "If You Suspect a Gas Leak",
      content: "Evacuate the area immediately. Do not use any electronics, light switches, or anything that could create a spark. From a safe distance, call your gas provider or emergency services.",
      icon: Siren,
    },
    {
      title: "Responding to an Accident",
      content: "If you witness an accident, call for emergency help immediately. Do not move injured individuals unless they are in immediate danger. Secure the area if possible to prevent further incidents.",
      icon: Car,
    },
    {
      title: "Handling a Health Emergency",
      content: "Stay calm and assess the situation. Call for medical help and provide clear information about the person's condition and your location. If you are trained, provide first aid until help arrives.",
      icon: HeartPulse,
    },
  ];

  return (
    <div className="space-y-8">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <Leaf className="mr-3 h-7 w-7" />
            Tips for a Greener Planet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {pollutionTips.map((tip, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-lg hover:no-underline">
                  <div className="flex items-center">
                    <tip.icon className="mr-3 h-5 w-5 text-accent" />
                    {tip.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground pl-10">
                  {tip.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive flex items-center">
            <ShieldCheck className="mr-3 h-7 w-7" />
            Emergency Preparedness Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {emergencyTips.map((tip, index) => (
              <AccordionItem value={`item-emergency-${index}`} key={index}>
                <AccordionTrigger className="text-lg hover:no-underline">
                  <div className="flex items-center">
                    <tip.icon className="mr-3 h-5 w-5 text-destructive" />
                    {tip.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground pl-10">
                  {tip.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
