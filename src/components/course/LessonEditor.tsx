'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Lesson, LearningOutcome, Activity } from '@/types/course';
import { useCourseStore } from '@/lib/store/courseStore';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrainCircuit, BookOpen, Target, ListChecks, PlusCircle, Sparkles, Loader2, Lightbulb } from 'lucide-react';

interface LessonEditorProps {
  courseId: string;
  moduleId: string;
  lesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
}

// Form validation schema for lesson details
const lessonFormSchema = z.object({
  title: z.string().min(3, { message: 'Lesson title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Lesson description must be at least 10 characters.' }),
  content: z.string().optional(),
});

// Form validation schema for learning outcomes
const outcomeFormSchema = z.object({
  description: z.string().min(5, { message: 'Learning outcome must be at least 5 characters.' }),
});

// Form validation schema for activities
const activityFormSchema = z.object({
  title: z.string().min(3, { message: 'Activity title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Activity description must be at least 10 characters.' }),
  type: z.enum(['quiz', 'assignment', 'discussion']),
  content: z.string().min(1, { message: 'Activity content is required.' }),
});

export default function LessonEditor({ courseId, moduleId, lesson, isOpen, onClose }: LessonEditorProps) {
  const { updateLesson } = useCourseStore();
  const [activeTab, setActiveTab] = useState('content');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isOutcomeDialogOpen, setIsOutcomeDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  
  // Lesson details form
  const lessonForm = useForm<z.infer<typeof lessonFormSchema>>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
    },
  });
  
  // Learning outcome form
  const outcomeForm = useForm<z.infer<typeof outcomeFormSchema>>({
    resolver: zodResolver(outcomeFormSchema),
    defaultValues: {
      description: '',
    },
  });
  
  // Activity form
  const activityForm = useForm<z.infer<typeof activityFormSchema>>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'quiz',
      content: '',
    },
  });
  
  // Save lesson details
  const onSaveLessonDetails = (values: z.infer<typeof lessonFormSchema>) => {
    updateLesson(courseId, moduleId, lesson.id, {
      title: values.title,
      description: values.description,
      content: values.content || '',
    });
  };
  
  // Add learning outcome
  const onAddLearningOutcome = (values: z.infer<typeof outcomeFormSchema>) => {
    const newOutcome: LearningOutcome = {
      id: uuidv4(),
      description: values.description,
    };
    
    const updatedOutcomes = [...lesson.learningOutcomes, newOutcome];
    updateLesson(courseId, moduleId, lesson.id, { learningOutcomes: updatedOutcomes });
    setIsOutcomeDialogOpen(false);
    outcomeForm.reset();
  };
  
  // Add activity
  const onAddActivity = (values: z.infer<typeof activityFormSchema>) => {
    const newActivity: Activity = {
      id: uuidv4(),
      title: values.title,
      description: values.description,
      type: values.type as 'quiz' | 'assignment' | 'discussion',
      content: values.content,
    };
    
    const updatedActivities = [...lesson.activities, newActivity];
    updateLesson(courseId, moduleId, lesson.id, { activities: updatedActivities });
    setIsActivityDialogOpen(false);
    activityForm.reset();
  };
  
  // Remove learning outcome
  const removeOutcome = (outcomeId: string) => {
    const updatedOutcomes = lesson.learningOutcomes.filter(outcome => outcome.id !== outcomeId);
    updateLesson(courseId, moduleId, lesson.id, { learningOutcomes: updatedOutcomes });
  };
  
  // Remove activity
  const removeActivity = (activityId: string) => {
    const updatedActivities = lesson.activities.filter(activity => activity.id !== activityId);
    updateLesson(courseId, moduleId, lesson.id, { activities: updatedActivities });
  };
  
  // Generate lesson content with AI
  const generateContent = async () => {
    setIsGeneratingContent(true);
    
    try {
      // This is where you would connect to an AI service to generate content
      // For this demo, we'll simulate AI generation with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Example AI-generated content
      const aiGeneratedContent = `# ${lesson.title}\n\n## Overview\n${lesson.description}\n\n## Key Concepts\n\n- First important concept relevant to this lesson\n- Second important concept with explanation\n- Third concept with practical applications\n\n## Detailed Content\n\nThis lesson explores the fundamental principles of ${lesson.title}. Students will learn how to apply these concepts in practical scenarios and develop a deeper understanding of the subject matter.\n\n### Section 1: Introduction\n\nThe introduction provides context for why this topic matters and how it connects to the broader course objectives.\n\n### Section 2: Core Principles\n\nThis section breaks down the main ideas into digestible components with examples and illustrations.\n\n### Section 3: Practical Applications\n\nStudents will see real-world examples of how these concepts are applied in professional settings.\n\n## Summary\n\nThis concludes our exploration of ${lesson.title}. The key takeaways include understanding the fundamental concepts, recognizing patterns in application, and being able to implement these ideas in various contexts.`;
      
      // Update form with generated content
      lessonForm.setValue('content', aiGeneratedContent);
      
      // Also update in store
      updateLesson(courseId, moduleId, lesson.id, { content: aiGeneratedContent });
      
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGeneratingContent(false);
    }
  };
  
  // Generate learning outcomes with AI
  const generateLearningOutcomes = async () => {
    setIsGeneratingContent(true);
    
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Example AI-generated learning outcomes
      const aiGeneratedOutcomes = [
        { id: uuidv4(), description: `Explain the core concepts of ${lesson.title} and their significance in the field` },
        { id: uuidv4(), description: "Apply theoretical knowledge to solve practical problems related to the subject" },
        { id: uuidv4(), description: "Evaluate different approaches and select optimal solutions for complex scenarios" },
      ];
      
      // Update learning outcomes in store
      updateLesson(courseId, moduleId, lesson.id, { learningOutcomes: aiGeneratedOutcomes });
      
    } catch (error) {
      console.error('Error generating learning outcomes:', error);
    } finally {
      setIsGeneratingContent(false);
    }
  };
  
  // Generate activities with AI
  const generateActivities = async () => {
    setIsGeneratingContent(true);
    
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 1300));
      
      // Example AI-generated activities
      const aiGeneratedActivities = [
        {
          id: uuidv4(),
          title: `Quiz: ${lesson.title} Fundamentals`,
          description: "Test your understanding of the core concepts covered in this lesson",
          type: "quiz" as const,
          content: "1. What is the primary purpose of this concept?\n2. How would you apply this in a real-world scenario?\n3. What are the limitations of this approach?",
        },
        {
          id: uuidv4(),
          title: "Discussion: Practical Applications",
          description: "Engage with peers to explore real-world applications of these concepts",
          type: "discussion" as const,
          content: "Discuss how the principles covered in this lesson can be applied in your current or future professional context. Share specific examples if possible.",
        },
      ];
      
      // Update activities in store
      updateLesson(courseId, moduleId, lesson.id, { activities: aiGeneratedActivities });
      
    } catch (error) {
      console.error('Error generating activities:', error);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Lesson: {lesson.title}</DialogTitle>
            <DialogDescription>
              Create and organize your lesson content, learning outcomes, and activities
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="content" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Content</span>
              </TabsTrigger>
              <TabsTrigger value="outcomes" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Learning Outcomes</span>
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                <span>Activities</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <Form {...lessonForm}>
                <form onSubmit={lessonForm.handleSubmit(onSaveLessonDetails)} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Lesson Details</h3>
                    <Button
                      type="button"
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
                          <span>Generate with AI</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <FormField
                    control={lessonForm.control}
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
                    control={lessonForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lesson Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={lessonForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lesson Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="min-h-[300px] font-mono text-sm"
                            placeholder="Enter your lesson content here or generate it with AI..."
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          You can use Markdown to format your content. Headers, lists, and basic formatting are supported.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end pt-4">
                    <Button type="submit">
                      Save Content
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
            
            {/* Learning Outcomes Tab */}
            <TabsContent value="outcomes" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Learning Outcomes</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={generateLearningOutcomes}
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
                        <BrainCircuit className="h-4 w-4" />
                        <span>Generate Outcomes</span>
                      </>
                    )}
                  </Button>
                  <Button onClick={() => setIsOutcomeDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Outcome
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {lesson.learningOutcomes.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <Target className="h-12 w-12 text-muted-foreground mb-3" />
                      <h4 className="text-lg font-medium mb-2">No Learning Outcomes Yet</h4>
                      <p className="text-muted-foreground mb-4">
                        Add what students will learn from this lesson
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          onClick={generateLearningOutcomes}
                          disabled={isGeneratingContent}
                        >
                          <BrainCircuit className="mr-2 h-4 w-4" />
                          Generate with AI
                        </Button>
                        <Button onClick={() => setIsOutcomeDialogOpen(true)}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Manually
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  lesson.learningOutcomes.map((outcome) => (
                    <Card key={outcome.id}>
                      <CardContent className="py-3 flex justify-between items-center">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                          <p>{outcome.description}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeOutcome(outcome.id)}
                        >
                          Remove
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            {/* Activities Tab */}
            <TabsContent value="activities" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Activities</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={generateActivities}
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
                        <BrainCircuit className="h-4 w-4" />
                        <span>Generate Activities</span>
                      </>
                    )}
                  </Button>
                  <Button onClick={() => setIsActivityDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Activity
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {lesson.activities.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <ListChecks className="h-12 w-12 text-muted-foreground mb-3" />
                      <h4 className="text-lg font-medium mb-2">No Activities Yet</h4>
                      <p className="text-muted-foreground mb-4">
                        Add interactive activities to engage students
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          onClick={generateActivities}
                          disabled={isGeneratingContent}
                        >
                          <BrainCircuit className="mr-2 h-4 w-4" />
                          Generate with AI
                        </Button>
                        <Button onClick={() => setIsActivityDialogOpen(true)}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Manually
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  lesson.activities.map((activity) => (
                    <Card key={activity.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{activity.title}</CardTitle>
                              <span className="bg-muted px-2 py-0.5 rounded text-xs font-medium capitalize">
                                {activity.type}
                              </span>
                            </div>
                            <CardDescription>{activity.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">
                          {activity.content}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeActivity(activity.id)}
                        >
                          Remove
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* Add Learning Outcome Dialog */}
      <Dialog open={isOutcomeDialogOpen} onOpenChange={setIsOutcomeDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Learning Outcome</DialogTitle>
            <DialogDescription>
              Define what students will learn from this lesson
            </DialogDescription>
          </DialogHeader>
          
          <Form {...outcomeForm}>
            <form onSubmit={outcomeForm.handleSubmit(onAddLearningOutcome)} className="space-y-4 py-4">
              <FormField
                control={outcomeForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Outcome Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Students will be able to..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Start with action verbs like &quot;Explain&quot;, &quot;Apply&quot;, &quot;Analyze&quot;, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsOutcomeDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Outcome
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add Activity Dialog */}
      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
            <DialogDescription>
              Create an interactive activity for students
            </DialogDescription>
          </DialogHeader>
          
          <Form {...activityForm}>
            <form onSubmit={activityForm.handleSubmit(onAddActivity)} className="space-y-4 py-4">
              <FormField
                control={activityForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Quiz: Understanding Key Concepts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={activityForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A short quiz to test understanding of..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={activityForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Type</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="discussion">Discussion</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={activityForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="min-h-[150px]"
                        placeholder="Enter activity content, such as quiz questions, assignment instructions, or discussion prompts..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsActivityDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Activity
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}