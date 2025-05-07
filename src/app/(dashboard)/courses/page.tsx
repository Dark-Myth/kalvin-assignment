"use client";

import Link from 'next/link';
import { useCourseStore } from '@/lib/store/courseStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react'; // We'll need to install lucide-react for icons

export default function CoursesPage() {
  const { courses } = useCourseStore();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">My Courses</h1>
        <Button asChild>
          <Link href="/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Course
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-2">{course.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <span className="text-sm text-muted-foreground">
                {course.modules.length} modules
              </span>
              <Button variant="secondary" asChild size="sm">
                <Link href={`/courses/${course.id}`}>
                  Edit Course
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {courses.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">No courses created yet</p>
              <Button asChild>
                <Link href="/courses/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Course
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}