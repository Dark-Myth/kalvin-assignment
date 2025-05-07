'use client';

import Link from 'next/link';
import { useCourseStore } from '@/lib/store/courseStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent,  CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, BookOpen, Clock, Calendar, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function CoursesPage() {
  const { courses } = useCourseStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter courses based on search query
  const filteredCourses = searchQuery 
    ? courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courses;
    
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };
  
  // Calculate total lessons in a course
  const getTotalLessons = (course) => {
    return course.modules.reduce((total, module) => total + module.lessons.length, 0);
  };

  return (
    <div className="space-y-8">
      {/* Page Header with improved design */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Courses</h1>
          <p className="text-muted-foreground mt-1">Manage and create your educational courses</p>
        </div>
        <Button asChild>
          <Link href="/courses/new" className="gap-2 blackspace-nowrap">
            <PlusCircle className="h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button  size="icon" className="h-10 w-10 shrink-0">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Course Cards Grid with improved layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden flex flex-col">
              <CardHeader className="pb-3 pt-6">
                <div className="flex justify-between">
                  <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                  {course.published ? (
                    <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      Draft
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-4 flex-1">
                <p className="text-muted-foreground line-clamp-2 text-sm">{course.description}</p>
                
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-4">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{course.modules.length} modules</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Updated {formatDate(course.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{getTotalLessons(course)} lessons</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t p-4 pt-3 bg-muted/40">
                <Button asChild size="sm">
                  <Link href={`/courses/${course.id}`}>
                    Edit Course
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : searchQuery ? (
          <div className="col-span-full">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <Search className="h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">No matching courses found</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  We couldn&#39;t find any courses matching &quot;{searchQuery}&quot;. Try different keywords or create a new course.
                </p>
                <div className="flex gap-4">
                  <Button  onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                  <Button asChild>
                    <Link href="/courses/new">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Course
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="col-span-full">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses created yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Get started by creating your first course. You can organize content into modules and lessons.
                </p>
                <Button asChild>
                  <Link href="/courses/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Course
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}