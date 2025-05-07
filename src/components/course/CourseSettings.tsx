'use client';

import { useState } from 'react';
import { Course } from '@/types/course';
import { useCourseStore } from '@/lib/store/courseStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

interface CourseSettingsProps {
  course: Course;
}

export default function CourseSettings({ course }: CourseSettingsProps) {
  const router = useRouter();
  const { updateCourse } = useCourseStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Toggle course publication status
  const togglePublished = () => {
    updateCourse(course.id, {
      published: !course.published,
      updatedAt: new Date().toISOString(),
    });
  };
  
  // Delete course
  const deleteCourse = () => {
    // In a real app we would delete from the store here
    // For this demo we'll just navigate back to the courses page
    setIsDeleteDialogOpen(false);
    router.push('/courses');
  };
  
  // Export course as JSON
  const exportCourse = () => {
    setIsExporting(true);
    
    try {
      // Create a downloadable JSON file
      const courseData = JSON.stringify(course, null, 2);
      const blob = new Blob([courseData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `course-${course.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export course:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="space-y-6 ">
      <Card>
        <CardHeader>
          <CardTitle>Publication Settings</CardTitle>
          <CardDescription>
            Control the visibility and accessibility of your course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="published" className="flex flex-col space-y-1">
              <span>Published Status</span>
              <span className="text-sm font-normal text-muted-foreground">
                {course.published 
                  ? 'Your course is publicly available to students' 
                  : 'Your course is in draft mode and only visible to you'}
              </span>
            </Label>
            <Switch
              id="published"
              checked={course.published}
              onCheckedChange={togglePublished}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Course Management</CardTitle>
          <CardDescription>
            Export course data and manage your course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button 
              className="justify-start"
              onClick={exportCourse}
              disabled={isExporting}
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export Course Data'}
            </Button>
            <p className="text-sm text-muted-foreground pl-1">
              Download a JSON file containing all course data for backup or transfer
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(course.updatedAt).toLocaleDateString()}
          </p>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Delete Course
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this course? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="font-medium">{course.title}</p>
                <p className="text-sm text-muted-foreground">{course.description.substring(0, 100)}...</p>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={deleteCourse}
                >
                  Delete Permanently
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}