'use client';

import { useState } from 'react';
import { Course } from '@/types/course';
import { useCourseStore } from '@/lib/store/courseStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save } from 'lucide-react';

interface CourseOverviewProps {
  course: Course;
}

// Form validation schema
const formSchema = z.object({
  title: z.string().min(3, {
    message: 'Course title must be at least 3 characters.',
  }),
  description: z.string().min(10, {
    message: 'Course description must be at least 10 characters.',
  }),
});

export default function CourseOverview({ course }: CourseOverviewProps) {
  const { updateCourse } = useCourseStore();
  const [isSaving, setIsSaving] = useState(false);

  // Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: course.title,
      description: course.description,
    },
  });

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    
    try {
      // Update course in store
      updateCourse(course.id, {
        title: values.title,
        description: values.description,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to update course:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>Edit the basic information about your course</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      The main title displayed for your course.
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
                    <FormLabel>Course Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A detailed description of what students will learn in this course.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Course Statistics</CardTitle>
          <CardDescription>Overview of your course content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Modules</div>
              <div className="text-2xl font-bold">{course.modules.length}</div>
            </div>
            
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Lessons</div>
              <div className="text-2xl font-bold">
                {course.modules.reduce((acc, module) => acc + module.lessons.length, 0)}
              </div>
            </div>
            
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">Status</div>
              <div className="text-2xl font-bold">
                {course.published ? 'Published' : 'Draft'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}