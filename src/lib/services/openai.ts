import OpenAI from 'openai';

// Initialize the OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey:  process.env.OPENAI_API_KEY || '', // Ensure this is set in your environment
  dangerouslyAllowBrowser: true // This allows client-side usage, consider server-side implementation for production
});

// Types for AI content generation
export type ContentGenerationParams = {
  topic: string;
  description?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  model?: string; // Add model parameter to support different models based on category
};

export type LessonGenerationParams = ContentGenerationParams & {
  moduleTitle: string;
};

export type OutcomesGenerationParams = {
  lessonTitle: string;
  lessonDescription: string;
  count?: number;
};

export type ActivityGenerationParams = {
  lessonTitle: string;
  lessonDescription: string;
  activityType?: 'quiz' | 'assignment' | 'discussion';
};

/**
 * Generate course details using the OpenAI API
 */
export async function generateCourseIdea(category?: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert course creator. Generate a compelling course title and description for an educational platform."
        },
        {
          role: "user",
          content: `Generate a course title and description ${category ? `for the ${category} category` : ''}. Make it specific, marketable, and concise. Format as JSON with fields 'title' and 'description'.`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(completion.choices[0].message.content || '{"title":"","description":""}');
  } catch (error) {
    console.error('Error generating course idea:', error);
    throw new Error('Failed to generate course idea');
  }
}

/**
 * Generate module content using the OpenAI API
 */
export async function generateModuleContent(params: ContentGenerationParams) {
  try {
    const { topic, description = '', level = 'intermediate' } = params;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert curriculum designer specializing in creating well-structured educational modules."
        },
        {
          role: "user",
          content: `Generate a module for a course about "${topic}". ${description ? 'The course is about: ' + description : ''}
          The module should be appropriate for ${level} level students.
          Format the response as JSON with the following fields:
          {
            "title": "Module title",
            "description": "Detailed module description",
            "estimatedTime": Number of minutes to complete,
            "prerequisites": ["prerequisite 1", "prerequisite 2"],
            "difficulty": "${level}",
            "suggestedLessons": [
              {"title": "Lesson title 1", "description": "Brief lesson description"},
              {"title": "Lesson title 2", "description": "Brief lesson description"}
            ]
          }`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Error generating module content:', error);
    throw new Error('Failed to generate module content');
  }
}

/**
 * Generate lesson content using the OpenAI API
 */
export async function generateLessonContent(params: LessonGenerationParams) {
  try {
    const { moduleTitle, topic, description = '', level = 'intermediate' } = params;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert educational content creator specializing in creating engaging, informative lesson content."
        },
        {
          role: "user",
          content: `Generate detailed lesson content for a lesson on "${topic}" within the module "${moduleTitle}". 
          ${description ? 'The broader course is about: ' + description : ''}
          The content should be appropriate for ${level} level students.
          Format the content in markdown with proper headings, bullet points, and code examples if relevant.
          Include the following sections:
          - Introduction and overview
          - Key concepts
          - Detailed explanations
          - Practical examples
          - Summary and key takeaways`
        }
      ]
    });
    
    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating lesson content:', error);
    throw new Error('Failed to generate lesson content');
  }
}

/**
 * Generate learning outcomes for a lesson
 */
export async function generateLearningOutcomes(params: OutcomesGenerationParams) {
  try {
    const { lessonTitle, lessonDescription, count = 3 } = params;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert in educational design who creates measurable learning outcomes."
        },
        {
          role: "user",
          content: `Generate ${count} learning outcomes for a lesson titled "${lessonTitle}".
          Lesson description: ${lessonDescription}
          Each outcome should:
          - Start with an action verb (e.g., explain, analyze, apply)
          - Be specific and measurable
          - Focus on what learners will be able to do after the lesson
          
          Format the response as JSON array of outcomes:
          [
            "First learning outcome",
            "Second learning outcome",
            ...
          ]`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(completion.choices[0].message.content || '{"outcomes":[]}');
    return result.outcomes || [];
  } catch (error) {
    console.error('Error generating learning outcomes:', error);
    throw new Error('Failed to generate learning outcomes');
  }
}

/**
 * Generate activities for a lesson
 */
export async function generateActivities(params: ActivityGenerationParams) {
  try {
    const { lessonTitle, lessonDescription, activityType } = params;
    
    let prompt = `Generate engaging learning activities for a lesson titled "${lessonTitle}".
    Lesson description: ${lessonDescription}`;
    
    if (activityType) {
      prompt += `\nFocus on creating ${activityType} activities.`;
    } else {
      prompt += "\nInclude a mix of quiz questions, assignments, and discussion prompts.";
    }
    
    prompt += `\nFormat the response as a JSON object with these fields:
    {
      "activities": [
        {
          "title": "Activity title",
          "description": "Brief description of the activity",
          "type": "quiz|assignment|discussion",
          "content": "Detailed content of the activity (questions for quiz, instructions for assignments, prompts for discussions)"
        },
        ...
      ]
    }`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert in creating engaging educational activities that reinforce learning."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(completion.choices[0].message.content || '{"activities":[]}');
    return result.activities || [];
  } catch (error) {
    console.error('Error generating activities:', error);
    throw new Error('Failed to generate activities');
  }
}