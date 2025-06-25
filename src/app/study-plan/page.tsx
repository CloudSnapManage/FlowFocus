import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BrainCircuit } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function StudyPlanPage() {
  return (
    <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">AI Study Plan Generator</h1>
          <p className="text-muted-foreground">Create a personalized study schedule tailored to your goals.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Describe Your Goal</CardTitle>
                    <CardDescription>Tell our AI what you want to learn, your time constraints, and any other relevant details.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="subject">Subject / Topic</Label>
                        <Input id="subject" placeholder="e.g., Data Structures in Python" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="duration">Study Duration</Label>
                        <Input id="duration" placeholder="e.g., 2 weeks, 1 hour per day" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="details">Additional Details</Label>
                        <Textarea id="details" placeholder="e.g., I'm a beginner, focus on practical examples." />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full">
                        <BrainCircuit className="mr-2 h-4 w-4"/>
                        Generate Plan
                    </Button>
                </CardFooter>
            </Card>
            <Card className="shadow-sm">
                 <CardHeader>
                    <CardTitle>Your Personalized Study Plan</CardTitle>
                    <CardDescription>Here's a schedule generated just for you. You can edit it as needed.</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[300px]">
                    <div className="p-4 bg-muted rounded-md h-full flex items-center justify-center">
                        <p className="text-muted-foreground text-center">Your study plan will appear here...</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full">Export Plan</Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  )
}
