import { useState } from "react";
import { CheckCircle, Circle, Star, Calendar, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Milestone {
  id: string;
  title: string;
  description: string;
  ageRange: string;
  category: 'motor' | 'cognitive' | 'social' | 'language';
  completed: boolean;
  completedDate?: string;
  notes?: string;
}

export default function Milestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      title: 'Sits without support',
      description: 'Baby can sit up independently for several minutes',
      ageRange: '6-8 months',
      category: 'motor',
      completed: true,
      completedDate: '2024-04-15',
      notes: 'Emma started sitting on her own at 7 months!'
    },
    {
      id: '2',
      title: 'Crawls forward',
      description: 'Baby moves forward on hands and knees',
      ageRange: '7-10 months',
      category: 'motor',
      completed: true,
      completedDate: '2024-05-20'
    },
    {
      id: '3',
      title: 'Says first words',
      description: 'Baby says "mama", "dada", or other first words',
      ageRange: '8-12 months',
      category: 'language',
      completed: false
    },
    {
      id: '4',
      title: 'Pulls to standing',
      description: 'Baby pulls themselves up to standing position',
      ageRange: '8-12 months',
      category: 'motor',
      completed: false
    },
    {
      id: '5',
      title: 'Shows stranger anxiety',
      description: 'Baby becomes wary of unfamiliar people',
      ageRange: '6-12 months',
      category: 'social',
      completed: true,
      completedDate: '2024-05-01'
    },
    {
      id: '6',
      title: 'Plays peek-a-boo',
      description: 'Baby enjoys and participates in peek-a-boo games',
      ageRange: '6-9 months',
      category: 'cognitive',
      completed: true,
      completedDate: '2024-04-30'
    }
  ]);

  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    ageRange: '',
    category: 'motor' as Milestone['category']
  });

  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [milestoneNotes, setMilestoneNotes] = useState('');

  const toggleMilestone = (id: string) => {
    setMilestones(milestones.map(milestone => {
      if (milestone.id === id) {
        const updated = {
          ...milestone,
          completed: !milestone.completed,
          completedDate: !milestone.completed ? new Date().toISOString().split('T')[0] : undefined,
          notes: !milestone.completed ? milestoneNotes : milestone.notes
        };
        if (!milestone.completed) {
          setSelectedMilestone(updated);
        }
        return updated;
      }
      return milestone;
    }));
    setMilestoneNotes('');
    setSelectedMilestone(null);
  };

  const addMilestone = () => {
    if (newMilestone.title && newMilestone.description && newMilestone.ageRange) {
      const milestone: Milestone = {
        id: Date.now().toString(),
        ...newMilestone,
        completed: false
      };
      setMilestones([...milestones, milestone]);
      setNewMilestone({ title: '', description: '', ageRange: '', category: 'motor' });
      setIsAddingMilestone(false);
    }
  };

  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;
  const progressPercentage = (completedMilestones / totalMilestones) * 100;

  const getCategoryColor = (category: Milestone['category']) => {
    switch (category) {
      case 'motor': return 'bg-blue-100 text-blue-700';
      case 'cognitive': return 'bg-purple-100 text-purple-700';
      case 'social': return 'bg-green-100 text-green-700';
      case 'language': return 'bg-orange-100 text-orange-700';
    }
  };

  const getCategoryIcon = (category: Milestone['category']) => {
    switch (category) {
      case 'motor': return '🤸';
      case 'cognitive': return '🧠';
      case 'social': return '👥';
      case 'language': return '💬';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl mb-2">Development Milestones</h1>
          <p className="text-gray-600">Track your baby's important developmental achievements</p>
        </div>
        <Dialog open={isAddingMilestone} onOpenChange={setIsAddingMilestone}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Milestone</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Milestone Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Takes first steps"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the milestone..."
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="ageRange">Age Range</Label>
                <Input
                  id="ageRange"
                  placeholder="e.g., 9-15 months"
                  value={newMilestone.ageRange}
                  onChange={(e) => setNewMilestone({...newMilestone, ageRange: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={newMilestone.category}
                  onChange={(e) => setNewMilestone({...newMilestone, category: e.target.value as Milestone['category']})}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="motor">Motor Skills</option>
                  <option value="cognitive">Cognitive</option>
                  <option value="social">Social</option>
                  <option value="language">Language</option>
                </select>
              </div>
              <Button onClick={addMilestone} className="w-full">
                Add Milestone
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Milestone Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Completed Milestones</span>
              <span>{completedMilestones} of {totalMilestones}</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {['motor', 'cognitive', 'social', 'language'].map((category) => {
                const categoryMilestones = milestones.filter(m => m.category === category);
                const completed = categoryMilestones.filter(m => m.completed).length;
                return (
                  <div key={category} className="text-center">
                    <div className="text-2xl mb-1">{getCategoryIcon(category as Milestone['category'])}</div>
                    <div className="text-sm font-medium capitalize">{category}</div>
                    <div className="text-xs text-gray-500">{completed}/{categoryMilestones.length}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestone List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {milestones.map((milestone) => (
          <Card key={milestone.id} className={`transition-all hover:shadow-md ${milestone.completed ? 'border-green-200 bg-green-50/50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <button 
                      onClick={() => toggleMilestone(milestone.id)}
                      className="text-xl hover:scale-110 transition-transform"
                    >
                      {milestone.completed ? 
                        <CheckCircle className="h-6 w-6 text-green-500" /> : 
                        <Circle className="h-6 w-6 text-gray-400" />
                      }
                    </button>
                    <h3 className={`font-medium ${milestone.completed ? 'line-through text-gray-500' : ''}`}>
                      {milestone.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={getCategoryColor(milestone.category)}>
                      {getCategoryIcon(milestone.category)} {milestone.category}
                    </Badge>
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {milestone.ageRange}
                    </Badge>
                  </div>

                  {milestone.completed && milestone.completedDate && (
                    <div className="text-xs text-green-600 mb-2">
                      ✅ Completed on {new Date(milestone.completedDate).toLocaleDateString()}
                    </div>
                  )}

                  {milestone.notes && (
                    <div className="text-xs text-gray-600 italic bg-gray-50 p-2 rounded">
                      "{milestone.notes}"
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Milestone Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Milestone Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Encouraging Development</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Provide plenty of tummy time for motor skills</li>
                <li>• Read books together daily for language development</li>
                <li>• Play interactive games like peek-a-boo</li>
                <li>• Encourage exploration in a safe environment</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">When to Consult Your Pediatrician</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Baby misses multiple milestones</li>
                <li>• Regression in previously achieved skills</li>
                <li>• Concerns about hearing or vision</li>
                <li>• Any developmental worries you have</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Remember:</strong> Every baby develops at their own pace. These milestones are general guidelines. 
              Some babies may achieve them earlier or later, and that's perfectly normal!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}