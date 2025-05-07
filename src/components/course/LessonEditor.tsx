'use client';

import { useState } from 'react';
import { Lesson } from '@/types/course';
import { useCourseStore } from '@/lib/store/courseStore';
import { generateLessonContent, generateLearningOutcomes, generateActivities } from '@/lib/services/openai';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookOpen, Settings, Lightbulb, CirclePlus, List, FileText, Save, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface LessonEditorProps {
  courseId: string;
  moduleId: string;
  lesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
}

// Form validation schema for lesson details
const lessonDetailsSchema = z.object({
  title: z.string().min(3, { message: 'Lesson title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Lesson description must be at least 10 characters.' }),
});

// Form validation schema for lesson content
const lessonContentSchema = z.object({
  content: z.string().min(10, { message: 'Lesson content must be at least 10 characters.' }),
});

export default function LessonEditor({ courseId, moduleId, lesson, isOpen, onClose }: LessonEditorProps) {
  const { updateLesson, getCourse } = useCourseStore();
  const [activeTab, setActiveTab] = useState('details');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isGeneratingOutcomes, setIsGeneratingOutcomes] = useState(false);
  const [isGeneratingActivities, setIsGeneratingActivities] = useState(false);
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>(lesson.learningOutcomes || []);
  const [activities, setActivities] = useState<any[]>(lesson.activities || []);
  
  const course = getCourse(courseId);
  const module = course?.modules.find(m => m.id === moduleId);

  // Lesson details form
  const detailsForm = useForm<z.infer<typeof lessonDetailsSchema>>({
    resolver: zodResolver(lessonDetailsSchema),
    defaultValues: {
      title: lesson.title,
      description: lesson.description,
    },
  });

  // Lesson content form
  const contentForm = useForm<z.infer<typeof lessonContentSchema>>({
    resolver: zodResolver(lessonContentSchema),
    defaultValues: {
      content: lesson.content || '',
    },
  });

  // Save lesson details
  const onSaveLessonDetails = (values: z.infer<typeof lessonDetailsSchema>) => {
    updateLesson(courseId, moduleId, lesson.id, {
      title: values.title,
      description: values.description,
    });
    toast.success('Lesson details saved');
  };

  // Save lesson content
  const onSaveLessonContent = (values: z.infer<typeof lessonContentSchema>) => {
    updateLesson(courseId, moduleId, lesson.id, {
      content: values.content,
    });
    toast.success('Lesson content saved');
  };

  // Generate lesson content with AI
  const generateContent = async () => {
    if (!course || !module) return;
    
    setIsGeneratingContent(true);
    try {
      const lessonContent = await generateLessonContent({
        topic: lesson.title,
        description: lesson.description,
        moduleTitle: module.title,
        level: module.difficulty
      });
      
      if (lessonContent) {
        contentForm.setValue('content', lessonContent);
        updateLesson(courseId, moduleId, lesson.id, {
          content: lessonContent,
        });
        toast.success('Content generated successfully!');
      } else {
        toast.error('Failed to generate content. Please try again.');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Error generating content. Please try again.');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // Generate learning outcomes with AI
  const generateOutcomes = async () => {
    setIsGeneratingOutcomes(true);
    try {
      const outcomes = await generateLearningOutcomes({
        lessonTitle: lesson.title,
        lessonDescription: lesson.description,
        count: 4
      });
      
      if (outcomes && outcomes.length > 0) {
        setLearningOutcomes(outcomes);
        updateLesson(courseId, moduleId, lesson.id, {
          learningOutcomes: outcomes,
        });
        toast.success('Learning outcomes generated successfully!');
      } else {
        toast.error('Failed to generate learning outcomes. Please try again.');
      }
    } catch (error) {
      console.error('Error generating learning outcomes:', error);
      toast.error('Error generating learning outcomes. Please try again.');
    } finally {
      setIsGeneratingOutcomes(false);
    }
  };

  // Generate activities with AI
  const generateLessonActivities = async () => {
    setIsGeneratingActivities(true);
    try {
      const lessonActivities = await generateActivities({
        lessonTitle: lesson.title,
        lessonDescription: lesson.description
      });
      
      if (lessonActivities && lessonActivities.length > 0) {
        setActivities(lessonActivities);
        updateLesson(courseId, moduleId, lesson.id, {
          activities: lessonActivities,
        });
        toast.success('Activities generated successfully!');
      } else {
        toast.error('Failed to generate activities. Please try again.');
      }
    } catch (error) {
      console.error('Error generating activities:', error);
      toast.error('Error generating activities. Please try again.');
    } finally {
      setIsGeneratingActivities(false);
    }
  };

  // Add a learning outcome manually
  const addLearningOutcome = (outcome: string) => {
    if (!outcome.trim()) return;
    const newOutcomes = [...learningOutcomes, outcome];
    setLearningOutcomes(newOutcomes);
    updateLesson(courseId, moduleId, lesson.id, {
      learningOutcomes: newOutcomes,
    });
  };

  // Remove a learning outcome
  const removeLearningOutcome = (index: number) => {
    const newOutcomes = learningOutcomes.filter((_, i) => i !== index);
    setLearningOutcomes(newOutcomes);
    updateLesson(courseId, moduleId, lesson.id, {
      learningOutcomes: newOutcomes,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Lesson</DialogTitle>
          <DialogDescription>
            Manage lesson details, content, and learning materials
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Details</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Content</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>Learning Materials</span>
            </TabsTrigger>
          </TabsList>

          {/* Lesson Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <Form {...detailsForm}>
              <form onSubmit={detailsForm.handleSubmit(onSaveLessonDetails)} className="space-y-4">
                <FormField
                  control={detailsForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={detailsForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Description</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Details
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Lesson Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <div className="flex justify-end mb-2">
              <Button
                onClick={generateContent}
                disabled={isGeneratingContent}
                className="gap-2"
              >
                {isGeneratingContent ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Content with AI</span>
                  </>
                )}
              </Button>
            </div>
            
            <Form {...contentForm}>
              <form onSubmit={contentForm.handleSubmit(onSaveLessonContent)} className="space-y-4">
                <FormField
                  control={contentForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          className="min-h-[300px] font-mono text-sm" 
                          placeholder="# Lesson Content

Start by adding your lesson content here. You can use Markdown formatting:

## Sections
- Bullet points
- **Bold text**
- *Italic text*

```
Code blocks are also supported
```
"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Content
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Learning Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            {/* Learning Outcomes Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Learning Outcomes
                  </h3>
                  <Button
                    size="sm"
                    onClick={generateOutcomes}
                    disabled={isGeneratingOutcomes}
                    className="gap-2"
                  >
                    {isGeneratingOutcomes ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Generate with AI</span>
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {learningOutcomes.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No learning outcomes added yet.</p>
                  ) : (
                    learningOutcomes.map((outcome, index) => (
                      <div key={index} className="flex items-start gap-2 group">
                        <div className="bg-muted rounded-md p-2 flex-1 text-sm">
                          {outcome}
                        </div>
                        <Button
                          
                          size="icon"
                          onClick={() => removeLearningOutcome(index)}
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  <Input
                    placeholder="Add a learning outcome..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addLearningOutcome((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <Button  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add a learning outcome..."]') as HTMLInputElement;
                    addLearningOutcome(input.value);
                    input.value = '';
                  }}>
                    <CirclePlus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activities Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Activities & Assessments
                  </h3>
                  <Button
                    size="sm"
                    onClick={generateLessonActivities}
                    disabled={isGeneratingActivities}
                    className="gap-2"
                  >
                    {isGeneratingActivities ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Generate Activities</span>
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {activities.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No activities added yet.</p>
                  ) : (
                    activities.map((activity, index) => (
                      <Card key={index} className="bg-background">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{activity.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                              <div className="text-sm bg-muted p-3 rounded-md mt-2">
                                {activity.content}
                              </div>
                            </div>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                              {activity.type}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}