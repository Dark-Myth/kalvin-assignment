'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Course, Module } from '@/types/course';
import { useCourseStore } from '@/lib/store/courseStore';
import { generateModuleContent } from '@/lib/services/openai';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, FileText, GripVertical, ChevronDown, ChevronUp, Pencil, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ModuleEditor from '@/components/course/ModuleEditor';

interface ModuleManagerProps {
  course: Course;
}

// Form validation schema for module creation
const moduleFormSchema = z.object({
  title: z.string().min(3, { message: 'Module title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Module description must be at least 10 characters.' }),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedTime: z.coerce.number().min(1, { message: 'Estimated time must be at least 1 minute.' }),
});

export default function ModuleManager({ course }: ModuleManagerProps) {
  const { addModule, updateModule } = useCourseStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Define form
  const form = useForm<z.infer<typeof moduleFormSchema>>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty: 'beginner',
      estimatedTime: 30,
    },
  });

  // Reset form when dialog opens/closes
  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      form.reset();
    }
  };

  // Form submission handler
  const onSubmit = (values: z.infer<typeof moduleFormSchema>) => {
    const newModule: Module = {
      id: uuidv4(),
      title: values.title,
      description: values.description,
      lessons: [],
      prerequisites: [],
      difficulty: values.difficulty as 'beginner' | 'intermediate' | 'advanced',
      estimatedTime: values.estimatedTime,
      order: course.modules.length,
    };

    addModule(course.id, newModule);
    handleDialogChange(false);
    toast.success('Module created successfully!');
  };

  // Function to handle module creation with AI
  const handleGenerateModule = async () => {
    setIsGenerating(true);

    try {
      const generatedContent = await generateModuleContent({
        topic: course.title,
        description: course.description,
      });

      if (generatedContent && generatedContent.title) {
        form.setValue('title', generatedContent.title);
        form.setValue('description', generatedContent.description || '');
        toast.success('Module content generated successfully!');
      } else {
        toast.error('Failed to generate module content. Please try again.');
      }
    } catch (error) {
      console.error('Error generating module content:', error);
      toast.error('Failed to generate module content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Re-order modules
  const moveModule = (moduleId: string, direction: 'up' | 'down') => {
    const moduleIndex = course.modules.findIndex(m => m.id === moduleId);

    if (
      (direction === 'up' && moduleIndex === 0) ||
      (direction === 'down' && moduleIndex === course.modules.length - 1)
    ) {
      return; // Cannot move further up/down
    }

    const newOrder = [...course.modules].map(m => ({ ...m }));
    const targetIndex = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1;

    // Swap order values
    const temp = newOrder[moduleIndex].order;
    newOrder[moduleIndex].order = newOrder[targetIndex].order;
    newOrder[targetIndex].order = temp;

    // Update each modified module
    newOrder.forEach(module => {
      updateModule(course.id, module.id, { order: module.order });
    });
  };

  // Open module editor
  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
  };

  // Close module editor
  const handleCloseModuleEditor = () => {
    setSelectedModule(null);
  };

  // Sort modules by order
  const sortedModules = [...course.modules].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Modules</h2>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Module
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Module</DialogTitle>
              <DialogDescription>
                Add a new module to organize related lessons in your course.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Module Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduction to the Course" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Module Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="This module covers..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
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

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    
                    onClick={() => handleDialogChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Module</Button>
                  <Button
                    type="button"
                    
                    onClick={handleGenerateModule}
                    disabled={isGenerating}
                    className="gap-2"
                  >
                    {isGenerating ? (
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
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {sortedModules.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Modules Added Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start building your course by adding your first module
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Module
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedModules.map((module, index) => (
            <Card key={module.id}>
              <CardHeader className="border-b">
                <div className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>{module.title}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      
                      onClick={() => moveModule(module.id, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      
                      onClick={() => moveModule(module.id, 'down')}
                      disabled={index === sortedModules.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="ml-7">{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex space-x-4">
                    <div>
                      <span className="font-medium">Difficulty:</span>{' '}
                      <span className="capitalize">{module.difficulty}</span>
                    </div>
                    <div>
                      <span className="font-medium">Est. Time:</span>{' '}
                      <span>{module.estimatedTime} min</span>
                    </div>
                    <div>
                      <span className="font-medium">Lessons:</span>{' '}
                      <span>{module.lessons.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t flex justify-end space-x-2 py-3">
                <Button
                  
                  size="sm"
                  onClick={() => handleEditModule(module)}
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Edit Module
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Module Editor Dialog */}
      {selectedModule && (
        <ModuleEditor
          courseId={course.id}
          module={selectedModule}
          isOpen={!!selectedModule}
          onClose={handleCloseModuleEditor}
        />
      )}
    </div>
  );
}