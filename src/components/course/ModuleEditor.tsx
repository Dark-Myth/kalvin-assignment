'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Module, Lesson } from '@/types/course';
import { useCourseStore } from '@/lib/store/courseStore';
import { generateLessonContent } from '@/lib/services/openai';
import { Dialog, DialogContent, DialogDescription,  DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { PlusCircle, BookOpen, Settings, Lightbulb, GripVertical, ChevronUp, ChevronDown, Pencil, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import LessonEditor from '@/components/course/LessonEditor';

interface ModuleEditorProps {
  courseId: string;
  module: Module;
  isOpen: boolean;
  onClose: () => void;
}

// Form validation schema for module editing
const moduleFormSchema = z.object({
  title: z.string().min(3, { message: 'Module title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Module description must be at least 10 characters.' }),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedTime: z.coerce.number().min(1, { message: 'Estimated time must be at least 1 minute.' }),
});

// Form validation schema for creating lessons
const lessonFormSchema = z.object({
  title: z.string().min(3, { message: 'Lesson title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Lesson description must be at least 10 characters.' }),
});

export default function ModuleEditor({ courseId, module, isOpen, onClose }: ModuleEditorProps) {
  const { updateModule, addLesson, updateLesson } = useCourseStore();
  const [activeTab, setActiveTab] = useState('details');
  const [isNewLessonDialogOpen, setIsNewLessonDialogOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);

  // Module edit form
  const moduleForm = useForm<z.infer<typeof moduleFormSchema>>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: module.title,
      description: module.description,
      difficulty: module.difficulty,
      estimatedTime: module.estimatedTime,
    },
  });

  // Lesson creation form
  const lessonForm = useForm<z.infer<typeof lessonFormSchema>>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  // Save module details
  const onSaveModuleDetails = (values: z.infer<typeof moduleFormSchema>) => {
    updateModule(courseId, module.id, {
      title: values.title,
      description: values.description,
      difficulty: values.difficulty,
      estimatedTime: values.estimatedTime,
    });
  };

  // Create new lesson
  const onCreateLesson = (values: z.infer<typeof lessonFormSchema>) => {
    const newLesson: Lesson = {
      id: uuidv4(),
      title: values.title,
      description: values.description,
      content: '',
      learningOutcomes: [],
      activities: [],
      order: module.lessons.length,
    };

    addLesson(courseId, module.id, newLesson);
    setIsNewLessonDialogOpen(false);
    lessonForm.reset();
  };

  // Generate lesson using AI
  const onGenerateLesson = async () => {
    setIsGeneratingLesson(true);
    try {
      const generatedLesson = await generateLessonContent(module.title);
      const newLesson: Lesson = {
        id: uuidv4(),
        title: generatedLesson.title,
        description: generatedLesson.description,
        content: generatedLesson.content,
        learningOutcomes: generatedLesson.learningOutcomes,
        activities: generatedLesson.activities,
        order: module.lessons.length,
      };

      addLesson(courseId, module.id, newLesson);
      toast.success('Lesson generated successfully!');
    } catch (error) {
      toast.error('Failed to generate lesson. Please try again.');
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  // Reorder lessons
  const moveLesson = (lessonId: string, direction: 'up' | 'down') => {
    const lessonIndex = module.lessons.findIndex(l => l.id === lessonId);

    if (
      (direction === 'up' && lessonIndex === 0) ||
      (direction === 'down' && lessonIndex === module.lessons.length - 1)
    ) {
      return; // Cannot move further up/down
    }

    const newOrder = [...module.lessons].map(l => ({ ...l }));
    const targetIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;

    // Swap order values
    const temp = newOrder[lessonIndex].order;
    newOrder[lessonIndex].order = newOrder[targetIndex].order;
    newOrder[targetIndex].order = temp;

    // Update each modified lesson
    newOrder.forEach(lesson => {
      updateLesson(courseId, module.id, lesson.id, { order: lesson.order });
    });
  };

  // Edit lesson
  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  // Close lesson editor
  const handleCloseLessonEditor = () => {
    setSelectedLesson(null);
  };

  // Sort lessons by order
  const sortedLessons = [...module.lessons].sort((a, b) => a.order - b.order);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Module</DialogTitle>
            <DialogDescription>
              Manage module details and organize lessons within this module
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Module Details</span>
              </TabsTrigger>
              <TabsTrigger value="lessons" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Lessons</span>
              </TabsTrigger>
            </TabsList>

            {/* Module Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <Form {...moduleForm}>
                <form onSubmit={moduleForm.handleSubmit(onSaveModuleDetails)} className="space-y-4">
                  <FormField
                    control={moduleForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Module Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={moduleForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Module Description</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-[100px]" {...field} />
                        </FormControl>
                        <FormDescription>
                          Provide a clear overview of what this module covers
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={moduleForm.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={moduleForm.control}
                      name="estimatedTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Time (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* Lessons Tab */}
            <TabsContent value="lessons" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Module Lessons</h3>
                <div className="flex space-x-2">
                  <Button onClick={() => setIsNewLessonDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Lesson
                  </Button>
                  <Button onClick={onGenerateLesson} disabled={isGeneratingLesson}>
                    {isGeneratingLesson ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate Lesson
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {sortedLessons.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <Lightbulb className="h-12 w-12 text-muted-foreground mb-3" />
                      <h4 className="text-lg font-medium mb-2">No Lessons Yet</h4>
                      <p className="text-muted-foreground mb-4">Add your first lesson to this module</p>
                      <Button onClick={() => setIsNewLessonDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Lesson
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  sortedLessons.map((lesson, index) => (
                    <Card key={lesson.id} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-base">{lesson.title}</CardTitle>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="icon"
                              
                              className="h-8 w-8"
                              onClick={() => moveLesson(lesson.id, 'up')}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              
                              className="h-8 w-8"
                              onClick={() => moveLesson(lesson.id, 'down')}
                              disabled={index === sortedLessons.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="ml-6 truncate">{lesson.description}</CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <div className="flex justify-end w-full">
                          <Button
                            size="sm"
                            
                            onClick={() => handleEditLesson(lesson)}
                            className="text-xs"
                          >
                            <Pencil className="mr-1 h-3 w-3" />
                            Edit Lesson
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Create New Lesson Dialog */}
      <Dialog open={isNewLessonDialogOpen} onOpenChange={setIsNewLessonDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Lesson</DialogTitle>
            <DialogDescription>Add a lesson to the &quot;{module.title}&quot; module</DialogDescription>
          </DialogHeader>

          <Form {...lessonForm}>
            <form onSubmit={lessonForm.handleSubmit(onCreateLesson)} className="space-y-4 py-4">
              <FormField
                control={lessonForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduction to the Topic" {...field} />
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
                      <Textarea placeholder="This lesson will cover..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button"  onClick={() => setIsNewLessonDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Lesson</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Lesson Editor Dialog */}
      {selectedLesson && (
        <LessonEditor
          courseId={courseId}
          moduleId={module.id}
          lesson={selectedLesson}
          isOpen={!!selectedLesson}
          onClose={handleCloseLessonEditor}
        />
      )}
    </>
  );
}