import { AnalysisResult, AIConfig } from "./types";
import { createAIClient } from "./ai-clients";

const TARGET_ATS_SCORE = 90;
const MAX_ITERATIONS = 5;

export interface IterationUpdate {
  iteration: number;
  maxIterations: number;
  currentScore: number;
  status: 'analyzing' | 'optimizing' | 'complete';
}

export async function analyzeResumeIteratively(
  resumeText: string,
  jobDescription: string,
  onProgress?: (update: IterationUpdate) => void,
  config?: AIConfig
): Promise<AnalysisResult> {
  // Validate config if provided, otherwise check envs via createAIClient validation
  try {
    createAIClient(config);
  } catch (e) {
    console.warn("AI credentials missing. Using MOCK data.");
    return getMockAnalysis();
  }

  let currentResume = resumeText;
  let bestResult: AnalysisResult | null = null;

  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
    onProgress?.({
      iteration,
      maxIterations: MAX_ITERATIONS,
      currentScore: bestResult?.atsScore || 0,
      status: iteration === 1 ? 'analyzing' : 'optimizing'
    });

    const result = await singleAnalysis(currentResume, jobDescription, iteration > 1, config);

    if (!bestResult || result.atsScore > bestResult.atsScore) {
      bestResult = result;
    }

    // If we've reached target score, we're done
    if (result.atsScore >= TARGET_ATS_SCORE) {
      onProgress?.({
        iteration,
        maxIterations: MAX_ITERATIONS,
        currentScore: result.atsScore,
        status: 'complete'
      });
      return result;
    }

    // Use optimized resume for next iteration
    if (result.optimizedResume) {
      currentResume = result.optimizedResume;
    }
  }

  onProgress?.({
    iteration: MAX_ITERATIONS,
    maxIterations: MAX_ITERATIONS,
    currentScore: bestResult?.atsScore || 0,
    status: 'complete'
  });

  return bestResult!;
}

async function singleAnalysis(
  resumeText: string,
  jobDescription: string,
  isOptimization: boolean = false,
  config?: AIConfig
): Promise<AnalysisResult> {
  const client = createAIClient(config);

  const prompt = `
    You are a professional resume writer. Write naturally like a human, not robotic.
    ${isOptimization ? 'Refine further to achieve 90%+ ATS score while keeping natural tone. Make it impactful.' : ''}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    RESUME:
    ${resumeText}
    
    CREATE A PROFESSIONAL, HUMAN-SOUNDING RESUME.
    
    STYLE GUIDE:
    - Write like a thoughtful human, not a keyword-stuffing robot
    - SUMMARY: 3-4 sentences that flow naturally. Show personality.
    - BULLETS: 3-4 per job. Complete thoughts, conversational yet professional.
    - CONTENT LENGTH: Ensure enough depth to fill a full page (approx 400-500 words).
    
    STRICT SECTION ORDER:
    1. HEADER (Name, Contact)
    2. SUMMARY
    3. SKILLS
    4. EXPERIENCE
    5. EDUCATION
    6. LANGUAGES
    7. CERTIFICATIONS
    
    Return JSON:
    {
      "matchPercentage": number,
      "atsScore": number,
      "keywords": { "present": [], "missing": [] },
      "suggestions": {
        "modifications": [{ "id": "m1", "originalText": "", "suggestedText": "", "reason": "" }],
        "restructuring": [{ "id": "r1", "title": "", "description": "", "type": "add" }]
      },
      "optimizedResume": "FULL NAME
email@email.com | +1 (555) 123-4567 | linkedin.com/in/name | City, Country

SUMMARY
[3-4 rich sentences. Must include professional impact and core competencies. Make it sound human.]

SKILLS
Technical: [Skill list]
Cloud & DevOps: [Skill list]
Languages: [Language list with levels]

EXPERIENCE
Job Title | Company Name | City | Month Year - Present
• [Detailed bullet point 1]
• [Detailed bullet point 2]
• [Detailed bullet point 3]
• [Detailed bullet point 4]

Previous Role | Company | City | Month Year - Month Year
• [Detailed bullet point 1]
• [Detailed bullet point 2]
• [Detailed bullet point 3]

EDUCATION
Degree Name | University Name | City | Year

LANGUAGES
English (Native), Spanish (B2)

CERTIFICATIONS
[Cert Name] | [Issuer] | [Year]"
    }
    Return ONLY valid JSON.
  `;

  return await client.generateJSON(prompt);
}

// Refine resume based on user feedback
export async function refineResume(
  currentResume: string,
  userFeedback: string,
  jobDescription: string,
  config?: AIConfig
): Promise<AnalysisResult> {
  const client = createAIClient(config);

  const refinePrompt = `
    You are a professional resume writer helping refine a resume based on user feedback.
    
    CURRENT RESUME:
    ${currentResume}
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    USER'S REQUESTED CHANGES:
    ${userFeedback}
    
    Apply the user's requested changes while maintaining:
    - Professional, human-sounding tone
    - ATS-friendly format
    - Categorized skills with language proficiency levels
    - 3-4 bullets per job section
    
    Return the same JSON structure with the updated optimizedResume:
    {
      "matchPercentage": number,
      "atsScore": number,
      "keywords": { "present": [], "missing": [] },
      "suggestions": { "modifications": [], "restructuring": [] },
      "optimizedResume": "The refined resume text with user's changes applied"
    }
  `;

  return await client.generateJSON(refinePrompt);
}

// Generate cover letter
export async function generateCoverLetter(
  resumeText: string,
  jobDescription: string,
  config?: AIConfig,
  companyName?: string
): Promise<string> {
  try {
    const client = createAIClient(config);

    const coverLetterPrompt = `
            You are a professional cover letter writer. Write a fully tailored cover letter.
            
            RESUME:
            ${resumeText}
            
            JOB DESCRIPTION:
            ${jobDescription}
            
            Follow this EXACT structure:
            
            HEADER:
            [Full Name from resume]
            [City, Country]
            [Email]
            [Phone number]
            [Today's Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}]
            
            Hiring Team
            ${companyName || '[Company Name from JD]'}
            [Company Location if mentioned]
            
            Subject: Application for [Exact Job Title from JD]
            
            Dear Hiring Team,
            
            BODY (4 paragraphs, no bullet points, natural professional prose):
            
            Paragraph 1: Explain why this role makes sense now given your background. Connect the role's focus areas to what you do well.
            
            Paragraph 2: Describe core experience and strengths that match the role. Focus on real work: tools, domains, systems, impact.
            
            Paragraph 3: Show business mindset. Explain how you work with stakeholders, interpret results, improve processes.
            
            Paragraph 4: Explain why this company specifically. Focus on where you add value from day one.
            
            CLOSING:
            Thank you for considering my application. I look forward to discussing how I can contribute to your team.
            
            Regards,
            [Full Name]
            
            STYLE:
            - Sound like a thoughtful professional, not AI
            - STRICTLY NO EM-DASHES (use commas or standard hyphens if needed, but prefer clean sentences)
            - NO GENERIC FLUFF ("excited", "passionate", "fast-paced", "synergy", "uniquely qualified")
            - NO ROBOTIC SENTENCE STRUCTURES (e.g., "I am writing to express my interest...")
            - Calm confidence, concrete examples
            - Keep under 400 words
            
            Return ONLY the cover letter text, no JSON wrapper.
        `;

    return await client.generateText(coverLetterPrompt);
  } catch (e) {
    console.warn("Error generating cover letter, using mock", e);
    return getMockCoverLetter();
  }
}

// Keep original function for backwards compatibility
export async function analyzeResume(resumeText: string, jobDescription: string, config?: AIConfig): Promise<AnalysisResult> {
  return analyzeResumeIteratively(resumeText, jobDescription, undefined, config);
}

function getMockAnalysis(): AnalysisResult {
  return {
    matchPercentage: 75,
    atsScore: 80,
    keywords: {
      present: ["React", "TypeScript", "Node.js", "CSS"],
      missing: ["Azure", "Docker", "Kubernetes"]
    },
    suggestions: {
      modifications: [
        {
          id: "m1",
          originalText: "I worked on many projects using React.",
          suggestedText: "Led development of multiple high-impact web applications using React, resulting in a 20% increase in user engagement.",
          reason: "Use action verbs and quantify results to make the bullet point stronger."
        }
      ],
      restructuring: [
        {
          id: "r1",
          title: "Skills Section",
          description: "Move the Skills section to the top of the resume for better visibility.",
          type: "reorder"
        }
      ]
    },
    optimizedResume: `JOHN DOE
john.doe@email.com | +1 (555) 123-4567 | linkedin.com/in/johndoe | San Francisco, CA

SUMMARY
I'm a software engineer with over 5 years of experience building web applications that people actually enjoy using. My expertise spans the full stack, from crafting responsive React frontends to designing robust Node.js backends. I genuinely love solving complex problems and take pride in writing clean, maintainable code. Throughout my career, I've had the privilege of leading teams and mentoring developers, and I'm always excited to tackle new challenges in cloud technologies like Azure and Kubernetes.

SKILLS
Technical: React, TypeScript, JavaScript, Node.js, Python, PostgreSQL, MongoDB, REST APIs, GraphQL
Cloud & DevOps: Azure, Docker, Kubernetes, CI/CD, Terraform, AWS
Languages: English (Native), Spanish (B1)

EXPERIENCE

Senior Software Engineer | Tech Company | San Francisco | Jan 2020 - Present
• Built and launched a new React-based platform that our users genuinely loved, leading to a 25% boost in engagement
• Designed and implemented our CI/CD pipeline using Docker and Azure, which cut our deployment time by more than half
• Took the lead on mentoring five junior developers, helping them grow while establishing code review practices that improved our overall code quality
• Collaborated closely with product and design teams to deliver features that actually solved user problems

Software Engineer | Startup Inc | San Francisco | Jun 2018 - Dec 2019
• Shipped three production applications using React and TypeScript, moving fast without breaking things
• Set up our Kubernetes infrastructure from scratch, achieving 99.9% uptime that our customers could rely on
• Worked with the team to integrate Docker into our workflow, making local development much smoother

EDUCATION
BS Computer Science | Stanford University | 2018

CERTIFICATIONS
AWS Certified Solutions Architect | Amazon Web Services | 2022
`
  };
}

function getMockCoverLetter(): string {
  return `John Doe
San Francisco, CA
john.doe@email.com
+1 (555) 123-4567
${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

Hiring Team
Tech Company
San Francisco, CA

Subject: Application for Senior Software Engineer

Dear Hiring Team,

After five years of building web applications that solve real problems, I came across your Senior Software Engineer opening and recognized an opportunity that genuinely fits where I am in my career. The role's emphasis on full-stack development and cloud infrastructure aligns directly with the work I've been doing and the direction I want to grow.

My experience centers on building scalable applications using React, TypeScript, and Node.js. At my current company, I led the development of a customer-facing platform that serves over 50,000 users daily. I've also designed and implemented CI/CD pipelines using Docker and Azure, which reduced our deployment time by 60% and significantly improved our team's velocity.

Beyond the technical work, I've learned that good engineering is about understanding the business context. I regularly collaborate with product managers and stakeholders to ensure what we build actually solves user problems. I ask questions about metrics, challenge assumptions when data suggests we should, and focus on delivering measurable value rather than just shipping features.

What draws me to your company is the scale of the challenges you're tackling and the emphasis on engineering excellence I've seen in your job description. I'm confident I can contribute meaningfully from day one while continuing to grow alongside your team.

Thank you for considering my application. I look forward to discussing how I can contribute to your team.

Regards,
John Doe`;
}
