import { useState } from "react";
import { BookOpen, Clock, Heart, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: 'feeding' | 'sleep' | 'health' | 'development' | 'safety';
  readTime: string;
  image: string;
  content?: string;
}

export default function TipsArticles() {
  const [articles] = useState<Article[]>([
    {
      id: '1',
      title: 'Safe Sleep Guidelines for Your Baby',
      excerpt: 'Learn the latest recommendations for creating a safe sleep environment for your little one.',
      category: 'sleep',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1723990140290-1c7c6fd4bc92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwc2xlZXBpbmclMjBwZWFjZWZ1bGx5fGVufDF8fHx8MTc1OTUwNjYwN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      content: 'Always place babies on their backs to sleep, use a firm sleep surface, and keep the crib free of loose bedding...'
    },
    {
      id: '2',
      title: 'Introducing Solid Foods: A Complete Guide',
      excerpt: 'Everything you need to know about starting your baby on solid foods at 6 months.',
      category: 'feeding',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1623707430616-d9f956bcac2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwZmVlZGluZyUyMGJvdHRsZXxlbnwxfHx8fDE3NTk0MjA5NzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      content: 'Start with single-ingredient foods and watch for allergic reactions. Iron-rich foods are particularly important...'
    },
    {
      id: '3',
      title: 'Understanding Baby Development Milestones',
      excerpt: 'Track your baby\'s growth and development with this comprehensive milestone guide.',
      category: 'development',
      readTime: '10 min read',
      image: 'https://images.unsplash.com/photo-1570657891791-e39a9d185540?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGJhYnklMjBtaWxlc3RvbmV8ZW58MXx8fHwxNzU5NTA2NjA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      content: 'Every baby develops at their own pace, but there are general milestones to look for in motor, cognitive, and social development...'
    },
    {
      id: '4',
      title: 'Baby-Proofing Your Home: Essential Safety Tips',
      excerpt: 'Create a safe environment for your curious baby with these essential safety measures.',
      category: 'safety',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1716929806153-4e3f66242de0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwZ3Jvd3RoJTIwY2hhcnR8ZW58MXx8fHwxNzU5NTA2NjA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      content: 'Install safety gates, secure cabinets, cover electrical outlets, and remove small objects that pose choking hazards...'
    },
    {
      id: '5',
      title: 'Common Baby Health Concerns and When to Call the Doctor',
      excerpt: 'Know when common symptoms require medical attention and when they\'re part of normal development.',
      category: 'health',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1570657891791-e39a9d185540?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGJhYnklMjBtaWxlc3RvbmV8ZW58MXx8fHwxNzU5NTA2NjA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      content: 'Learn to recognize signs of fever, dehydration, and other symptoms that may require medical attention...'
    },
    {
      id: '6',
      title: 'Establishing a Bedtime Routine',
      excerpt: 'Help your baby develop healthy sleep habits with a consistent bedtime routine.',
      category: 'sleep',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1723990140290-1c7c6fd4bc92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwc2xlZXBpbmclMjBwZWFjZWZ1bGx5fGVufDF8fHx8MTc1OTUwNjYwN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      content: 'A consistent bedtime routine helps signal to your baby that it\'s time to sleep. Include calming activities like a warm bath...'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const categories = [
    { id: 'feeding', label: 'Feeding', color: 'bg-green-100 text-green-700' },
    { id: 'sleep', label: 'Sleep', color: 'bg-blue-100 text-blue-700' },
    { id: 'health', label: 'Health', color: 'bg-red-100 text-red-700' },
    { id: 'development', label: 'Development', color: 'bg-purple-100 text-purple-700' },
    { id: 'safety', label: 'Safety', color: 'bg-orange-100 text-orange-700' },
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'bg-gray-100 text-gray-700';
  };

  if (selectedArticle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedArticle(null)}>
            ← Back to Articles
          </Button>
          <Badge className={getCategoryColor(selectedArticle.category)}>
            {selectedArticle.category}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <div className="aspect-video w-full mb-4 overflow-hidden rounded-lg">
              <ImageWithFallback
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardTitle className="text-2xl">{selectedArticle.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selectedArticle.readTime}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-600 mb-6">{selectedArticle.excerpt}</p>
              <div className="space-y-4 text-gray-700">
                <p>{selectedArticle.content}</p>
                
                {selectedArticle.category === 'sleep' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Safe Sleep Checklist:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>✓ Always place baby on their back to sleep</li>
                      <li>✓ Use a firm sleep surface</li>
                      <li>✓ Keep crib free of loose bedding</li>
                      <li>✓ Avoid overheating</li>
                      <li>✓ Share your room, not your bed</li>
                    </ul>
                  </div>
                )}

                {selectedArticle.category === 'feeding' && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">First Foods to Try:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Iron-fortified cereals</li>
                      <li>• Pureed fruits (banana, apple, pear)</li>
                      <li>• Pureed vegetables (sweet potato, carrots)</li>
                      <li>• Soft cooked meats</li>
                      <li>• Well-cooked eggs</li>
                    </ul>
                  </div>
                )}

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 italic">
                    Always consult with your pediatrician for personalized advice regarding your baby's health and development.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl mb-2">Tips & Articles</h1>
        <p className="text-gray-600">Expert advice and helpful tips for caring for your baby</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Article */}
      {!searchTerm && !selectedCategory && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-red-500" />
              <Badge variant="secondary">Featured</Badge>
            </div>
            <CardTitle>Most Popular This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-video overflow-hidden rounded-lg">
                <ImageWithFallback
                  src={articles[0].image}
                  alt={articles[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">{articles[0].title}</h3>
                <p className="text-gray-600 mb-4">{articles[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(articles[0].category)}>
                    {articles[0].category}
                  </Badge>
                  <Button onClick={() => setSelectedArticle(articles[0])}>
                    Read More
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-0">
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <ImageWithFallback
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getCategoryColor(article.category)}>
                    {article.category}
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </span>
                </div>
                <h3 className="font-medium mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{article.excerpt}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedArticle(article)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read Article
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No articles found matching your search criteria.</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Daily Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">💤</span>
                </div>
                <div>
                  <h4 className="font-medium">Sleep Tip</h4>
                  <p className="text-sm text-gray-600">Keep room temperature between 68-70°F for optimal sleep.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🍼</span>
                </div>
                <div>
                  <h4 className="font-medium">Feeding Tip</h4>
                  <p className="text-sm text-gray-600">Watch for hunger cues rather than strict schedules.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🎯</span>
                </div>
                <div>
                  <h4 className="font-medium">Development Tip</h4>
                  <p className="text-sm text-gray-600">Narrate your activities to boost language development.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🛡️</span>
                </div>
                <div>
                  <h4 className="font-medium">Safety Tip</h4>
                  <p className="text-sm text-gray-600">Get down to baby's level to spot potential hazards.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}