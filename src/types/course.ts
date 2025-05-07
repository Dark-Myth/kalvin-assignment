export interface LearningOutcome {
  id: string;
  description: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'assignment' | 'discussion';
  content: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  learningOutcomes: LearningOutcome[];
  activities: Activity[];
  order: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  prerequisites: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  createdAt: string;
  updatedAt: string;
  published: boolean;
}