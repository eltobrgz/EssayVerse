import { OverallProgressChart, ScoreByTypeChart } from '@/components/progress-charts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProgressPage() {
  return (
     <div className="flex flex-col gap-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Your Progress</h1>
            <p className="text-muted-foreground">Track your improvement and identify areas for growth.</p>
        </div>
        <Tabs defaultValue="overview">
        <TabsList>
            <TabsTrigger value="overview">Overall Progress</TabsTrigger>
            <TabsTrigger value="by_type">Scores by Type</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
            <Card>
            <CardHeader>
                <CardTitle>Average Score Over Time</CardTitle>
                <CardDescription>
                This chart shows the trend of your average scores on all essays submitted.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <OverallProgressChart />
            </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="by_type" className="mt-4">
            <Card>
            <CardHeader>
                <CardTitle>Average Score by Essay Type</CardTitle>
                <CardDescription>
                Compare your performance across different types of essays.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScoreByTypeChart />
            </CardContent>
            </Card>
        </TabsContent>
        </Tabs>
     </div>
  );
}
