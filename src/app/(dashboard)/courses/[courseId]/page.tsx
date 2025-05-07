'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCourseStore } from '@/lib/store/courseStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, Settings, Eye, Share2 } from 'lucide-react';

// Import our course editor components
import CourseOverview from '@/components/course/CourseOverview';
import ModuleManager from '@/components/course/ModuleManager';
import CourseSettings from '@/components/course/CourseSettings';

export default function CourseEditor() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { courses, setCurrentCourse, updateCourse } = useCourseStore();
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
  
  // Handle course publication
  const handlePublish = () => {
    if (!currentCourse) return;
    
    updateCourse(currentCourse.id, {
      published: !currentCourse.published,
      updatedAt: new Date().toISOString()
    });
  };
  
  if (!currentCourse) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-144px)] bg-white">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Course Not Found
            </CardTitle>
            <CardDescription>The course you&#39;re looking for doesn&#39;t exist or has been removed.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-2">
            <Button  onClick={() => window.history.back()} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Course header with improved styling */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-primary">{currentCourse.title}</h1>
          <p className="text-muted-foreground mt-1">
            {currentCourse.published ? (
              <span className="flex items-center text-sm font-medium text-success">
                <span className="inline-block h-2 w-2 rounded-full bg-success mr-1.5"></span>
                Published
              </span>
            ) : (
              <span className="flex items-center text-sm font-medium text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-muted mr-1.5"></span>
                Draft
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button  size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </Button>
          <Button
            
            size="sm"
            className="gap-2"
            onClick={handlePublish}
          >
            <Share2 className="h-4 w-4" />
            <span>{currentCourse.published ? "Unpublish" : "Publish"}</span>
          </Button>
        </div>
      </div>
      
      {/* Course tabs with improved styling */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="border-b">
          <TabsList className="bg-transparent h-12 w-full justify-start rounded-none p-0 mb-[-1px]">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="modules" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4"
            >
              <FileText className="h-4 w-4 mr-2" />
              <span>Modules</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4"
            >
              <Settings className="h-4 w-4 mr-2" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="space-y-8 mt-0">
          <CourseOverview course={currentCourse} />
        </TabsContent>
        
        <TabsContent value="modules" className="space-y-8 mt-0">
          <ModuleManager course={currentCourse} />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-8 mt-0">
          <CourseSettings course={currentCourse} />
        </TabsContent>
      </Tabs>
    </div>
  );
}