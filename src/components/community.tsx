
"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { MessageSquareWarning, Recycle, Trash2, MapPin, Clock } from "lucide-react";

const reportSchema = z.object({
  reportType: z.string({
    required_error: "Please select a report type.",
  }),
  location: z.string().min(5, {
    message: "Location description must be at least 5 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(500, {
    message: "Description must not be longer than 500 characters.",
  }),
});

// Mock data for recent reports
const recentReports = [
  {
    id: 1,
    type: "Illegal Dumping",
    location: "Behind the old warehouse on 5th St.",
    description: "Someone has dumped a large amount of construction debris, including old mattresses and drywall.",
    time: "2 hours ago",
    icon: Trash2
  },
  {
    id: 2,
    type: "Strange Odor",
    location: "Near the riverbank by the park.",
    description: "There's a strong chemical smell that seems to be coming from the water. It's been noticeable for the past day.",
    time: "1 day ago",
    icon: MessageSquareWarning
  },
  {
    id: 3,
    type: "Overflowing Bins",
    location: "Downtown plaza recycling bins.",
    description: "All the public recycling bins are overflowing, and trash is starting to accumulate around them.",
    time: "3 days ago",
    icon: Recycle
  },
];

export function Community() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      location: "",
      description: "",
    },
  });

  function onSubmit(data: z.infer<typeof reportSchema>) {
    console.log("Community Report Submitted:", data);
    // In a real app, you would send this data to your backend API.
    toast({
      title: "Report Submitted!",
      description: "Thank you for helping keep our community clean and safe.",
    });
    form.reset();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <Card className="lg:col-span-1 shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Report an Incident</CardTitle>
          <CardDescription>
            Spotted an environmental issue? Let us know. Your report helps everyone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Incident</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an incident type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="illegal-dumping">Illegal Dumping</SelectItem>
                        <SelectItem value="strange-odor">Strange Odor</SelectItem>
                        <SelectItem value="water-discoloration">Water Discoloration</SelectItem>
                        <SelectItem value="overflowing-bins">Overflowing Public Bins</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Corner of Main St. & Park Ave." {...field} />
                    </FormControl>
                    <FormDescription>
                      Be as specific as possible.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us more about what you saw."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Submit Report</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2 shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Recent Community Reports</CardTitle>
          <CardDescription>
            Latest environmental incidents reported by users in the area.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recentReports.map((report, index) => (
              <div key={report.id}>
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-secondary rounded-full">
                    <report.icon className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{report.type}</h3>
                    <p className="text-muted-foreground mt-1">{report.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground space-x-4 mt-2">
                        <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1.5" />
                            <span>{report.location}</span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1.5" />
                            <span>{report.time}</span>
                        </div>
                    </div>
                  </div>
                </div>
                {index < recentReports.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
