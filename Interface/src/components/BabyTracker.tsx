import { useState } from "react";
import { Plus, Milk, Clock, Baby, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Activity {
  id: string;
  type: 'feeding' | 'sleep' | 'diaper';
  time: string;
  details: string;
  duration?: string;
}

export default function BabyTracker() {
  const [activities, setActivities] = useState<Activity[]>([
    { id: '1', type: 'feeding', time: '2:30 PM', details: '120ml formula' },
    { id: '2', type: 'sleep', time: '1:00 PM', details: 'Afternoon nap', duration: '45 mins' },
    { id: '3', type: 'diaper', time: '12:45 PM', details: 'Wet diaper' },
    { id: '4', type: 'feeding', time: '11:30 AM', details: '100ml formula' },
  ]);

  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: 'feeding' as Activity['type'],
    time: '',
    details: '',
    duration: ''
  });

  const addActivity = () => {
    if (newActivity.time && newActivity.details) {
      const activity: Activity = {
        id: Date.now().toString(),
        type: newActivity.type,
        time: newActivity.time,
        details: newActivity.details,
        ...(newActivity.duration && { duration: newActivity.duration })
      };
      setActivities([activity, ...activities]);
      setNewActivity({ type: 'feeding', time: '', details: '', duration: '' });
      setIsAddingActivity(false);
    }
  };

  const deleteActivity = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'feeding': return <Milk className="h-4 w-4" />;
      case 'sleep': return <Clock className="h-4 w-4" />;
      case 'diaper': return <Baby className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'feeding': return 'text-green-600 bg-green-50';
      case 'sleep': return 'text-blue-600 bg-blue-50';
      case 'diaper': return 'text-yellow-600 bg-yellow-50';
    }
  };

  const feedingActivities = activities.filter(a => a.type === 'feeding');
  const sleepActivities = activities.filter(a => a.type === 'sleep');
  const diaperActivities = activities.filter(a => a.type === 'diaper');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl mb-2">Baby Tracker</h1>
          <p className="text-gray-600">Track feeding, sleep, and diaper changes</p>
        </div>
        <Dialog open={isAddingActivity} onOpenChange={setIsAddingActivity}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Activity Type</Label>
                <select
                  id="type"
                  value={newActivity.type}
                  onChange={(e) => setNewActivity({...newActivity, type: e.target.value as Activity['type']})}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="feeding">Feeding</option>
                  <option value="sleep">Sleep</option>
                  <option value="diaper">Diaper Change</option>
                </select>
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newActivity.time}
                  onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="details">Details</Label>
                <Input
                  id="details"
                  placeholder={
                    newActivity.type === 'feeding' ? 'e.g., 120ml formula' :
                    newActivity.type === 'sleep' ? 'e.g., Afternoon nap' :
                    'e.g., Wet diaper'
                  }
                  value={newActivity.details}
                  onChange={(e) => setNewActivity({...newActivity, details: e.target.value})}
                />
              </div>
              {newActivity.type === 'sleep' && (
                <div>
                  <Label htmlFor="duration">Duration (optional)</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 45 mins"
                    value={newActivity.duration}
                    onChange={(e) => setNewActivity({...newActivity, duration: e.target.value})}
                  />
                </div>
              )}
              <Button onClick={addActivity} className="w-full">
                Add Activity
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Milk className="h-4 w-4 text-green-600" />
              Today's Feedings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedingActivities.length}</div>
            <p className="text-xs text-muted-foreground">
              Last: {feedingActivities[0]?.time || 'None today'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Sleep Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sleepActivities.length}</div>
            <p className="text-xs text-muted-foreground">
              Last: {sleepActivities[0]?.time || 'None today'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Baby className="h-4 w-4 text-yellow-600" />
              Diaper Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diaperActivities.length}</div>
            <p className="text-xs text-muted-foreground">
              Last: {diaperActivities[0]?.time || 'None today'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="feeding">Feeding</TabsTrigger>
          <TabsTrigger value="sleep">Sleep</TabsTrigger>
          <TabsTrigger value="diaper">Diapers</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ActivityList activities={activities} onDelete={deleteActivity} />
        </TabsContent>

        <TabsContent value="feeding" className="space-y-4">
          <ActivityList activities={feedingActivities} onDelete={deleteActivity} />
        </TabsContent>

        <TabsContent value="sleep" className="space-y-4">
          <ActivityList activities={sleepActivities} onDelete={deleteActivity} />
        </TabsContent>

        <TabsContent value="diaper" className="space-y-4">
          <ActivityList activities={diaperActivities} onDelete={deleteActivity} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ActivityList({ activities, onDelete }: { activities: Activity[], onDelete: (id: string) => void }) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No activities recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${activity.type === 'feeding' ? 'bg-green-100 text-green-600' : activity.type === 'sleep' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {activity.type === 'feeding' ? <Milk className="h-4 w-4" /> : activity.type === 'sleep' ? <Clock className="h-4 w-4" /> : <Baby className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-medium capitalize">{activity.type}</p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  <p className="text-xs text-gray-500">
                    {activity.time}
                    {activity.duration && ` • ${activity.duration}`}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(activity.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}