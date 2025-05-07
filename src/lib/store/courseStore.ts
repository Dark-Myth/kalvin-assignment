import { create } from 'zustand';
import { Course, Module, Lesson } from '@/types/course';

interface CourseStore {
  courses: Course[];
  currentCourse: Course | null;
  setCurrentCourse: (course: Course | null) => void;
  addCourse: (course: Course) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  addModule: (courseId: string, module: Module) => void;
  updateModule: (courseId: string, moduleId: string, updates: Partial<Module>) => void;
  addLesson: (courseId: string, moduleId: string, lesson: Lesson) => void;
  updateLesson: (courseId: string, moduleId: string, lessonId: string, updates: Partial<Lesson>) => void;
}

export const useCourseStore = create<CourseStore>((set) => ({
  courses: [],
  currentCourse: null,
  setCurrentCourse: (course) => set({ currentCourse: course }),
  addCourse: (course) => 
    set((state) => ({ courses: [...state.courses, course] })),
  updateCourse: (courseId, updates) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === courseId ? { ...course, ...updates } : course
      ),
    })),
  addModule: (courseId, module) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === courseId
          ? { ...course, modules: [...course.modules, module] }
          : course
      ),
    })),
  updateModule: (courseId, moduleId, updates) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              modules: course.modules.map((module) =>
                module.id === moduleId ? { ...module, ...updates } : module
              ),
            }
          : course
      ),
    })),
  addLesson: (courseId, moduleId, lesson) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              modules: course.modules.map((module) =>
                module.id === moduleId
                  ? { ...module, lessons: [...module.lessons, lesson] }
                  : module
              ),
            }
          : course
      ),
    })),
  updateLesson: (courseId, moduleId, lessonId, updates) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              modules: course.modules.map((module) =>
                module.id === moduleId
                  ? {
                      ...module,
                      lessons: module.lessons.map((lesson) =>
                        lesson.id === lessonId
                          ? { ...lesson, ...updates }
                          : lesson
                      ),
                    }
                  : module
              ),
            }
          : course
      ),
    })),
}));