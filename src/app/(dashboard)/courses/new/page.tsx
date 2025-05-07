'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCourseStore } from '@/lib/store/courseStore';
import { Course } from '@/types/course';
import { generateCourseIdea } from '@/lib/services/openai';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NewCoursePage() {
  const router = useRouter();
  const { addCourse } = useCourseStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('development');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newCourse: Course = {
        id: uuidv4(),
        title,
        description,
        category,
        coverImage: `/images/${category}.jpg`,
        modules: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addCourse(newCourse);
      
      toast.success('Course created successfully!');
      router.push(`/courses/${newCourse.id}`);
    } catch (error) {
      toast.error('Failed to create course');
      setIsLoading(false);
    }
  };

  const handleGenerateCourseIdea = async () => {
    setIsGenerating(true);
    
    try {
      const courseIdea = await generateCourseIdea(category);
      
      if (courseIdea.title && courseIdea.description) {
        setTitle(courseIdea.title);
        setDescription(courseIdea.description);
        toast.success('Course idea generated!');
      } else {
        toast.error('Failed to generate course idea');
      }
    } catch (error) {
      toast.error('Error generating course idea');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container py-10 bg-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Course</h1>
        
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>
                Provide information about your new course
              </CardDescription>
              <div className="flex justify-end">
                <Button
                  type="button"
                  
                  onClick={handleGenerateCourseIdea}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate Course Idea</span>
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  placeholder="Introduction to Web Development"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea
                  id="description"
                  placeholder="A comprehensive introduction to modern web development..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  
                >
                  <SelectTrigger className='bg-white'>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className='bg-white'>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="health">Health & Fitness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                 
                type="button" 
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !title.trim() || !description.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Course...
                  </>
                ) : (
                  'Create Course'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}