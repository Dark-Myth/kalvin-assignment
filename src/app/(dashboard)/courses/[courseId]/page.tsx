'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCourseStore } from '@/lib/store/courseStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, Settings } from 'lucide-react';

// Import our course editor components
import CourseOverview from '@/components/course/CourseOverview';
import ModuleManager from '@/components/course/ModuleManager';
import CourseSettings from '@/components/course/CourseSettings';

export default function CourseEditor() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { courses, setCurrentCourse } = useCourseStore();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Find the current course based on the URL parameter
  const currentCourse = courses.find(course => course.id === courseId);
  
  // Set the current course in the store when component mounts
  useEffect(() => {
    if (currentCourse) {
      setCurrentCourse(currentCourse);
    }
    
    // Clean up when unmounting
    return () => setCurrentCourse(null);
  }, [currentCourse, setCurrentCourse]);
  
  if (!currentCourse) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Course Not Found</CardTitle>
          <CardDescription>The course you&#39;re looking for doesn&#39;t exist.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{currentCourse.title}</h1>
        <div className="flex space-x-2">
          <Button variant="outline">Preview</Button>
          <Button>Publish</Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Modules</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <CourseOverview course={currentCourse} />
        </TabsContent>
        
        <TabsContent value="modules" className="space-y-6">
          <ModuleManager course={currentCourse} />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <CourseSettings course={currentCourse} />
        </TabsContent>
      </Tabs>
    </div>
  );
}