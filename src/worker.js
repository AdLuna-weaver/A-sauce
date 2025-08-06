/**
 * Cloudflare Worker Version - Job Application Automation Server
 * HTTP-based API for generating job application materials
 * Specializes in Revenue Operations, Sales Enablement, and GTM roles
 */

// Configuration
const CONFIG = {
  openai: {
    model: 'gpt-4o',
    timeout: 60000
  },
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization']
  }
};

// Jacob's Master Resume Data (same as MCP server)
const JACOB_MASTER_RESUME = `JACOB WEAVER
(727) 385-3772 • weaverj155@gmail.com • linkedin.com/in/jacobweaver155
St. Petersburg, Florida

PROFESSIONAL EXPERIENCE

Upwork | St. Petersburg, Florida
GTM Specialist | May 2025 - Present
• Built and managed team of campaign specialists, overseeing custom Clay table development and management for enterprise-scale cold email campaigns
• Integrated custom GPT APIs within Clay workflows, enabling generation of 10,000+ personalized emails at scale while maintaining message quality and relevance
• Reduced Clay credit costs through strategic implementation of third-party email finder and verification tools, optimizing operational efficiency and budget allocation
• Designed comprehensive specialist onboarding program and standardized operational procedures, accelerating team productivity and ensuring consistent campaign quality

Ingenious Build | St. Petersburg, Florida
Mid-Market Account Executive | September 2024 - March 2025
• Architected persona-driven cold email campaigns targeting five core buyer profiles, achieving 48% average open rate and 10% response rate through segmented messaging strategies
• Designed and A/B tested four distinct value-proposition frameworks per persona, generating 20% increase in discovery meeting bookings and accelerating pipeline velocity
• Executed multi-touch engagement sequences, optimizing messaging cadence and content for maximum conversion impact

Procore Technologies | Tampa, Florida
Senior Account Executive | October 2023 - September 2024
• Generated 3x weekly pipeline growth managing hybrid lead portfolio (30% inbound, 70% outbound) from $3M-$50M annual volume general contractors, consistently surpassing quarterly quotas
• Orchestrated multi-channel engagement campaigns across email, SMS, and in-app messaging, increasing product adoption 25% and improving lead conversion rates
• Executed full-cycle sales methodology from prospecting through contract completion, achieving 32% close rate through strategic solution selling and customer segmentation
• Collaborated cross-functionally with Sales, Marketing, and Business Development teams to optimize Outreach sequences and enhance customer segmentation models

Senior Sales Coach | June 2023 - October 2023
• Developed comprehensive sales coaching framework, improving individual rep performance and increasing team pipeline velocity 30%
• Partnered strategically with Sales Enablement, Marketing, and Product teams to align messaging and enhance GTM execution, directly impacting revenue growth
• Delivered 80+ classroom and virtual training sessions plus 600+ one-on-one coaching touchpoints and 900+ call reviews, reinforcing advanced prospecting techniques and value-selling methodologies
• Integrated Sandler Selling Methodologies into SDR certification curriculum, implementing Pain Funnel and Up-Front Contract techniques to strengthen consultative discovery and boost qualified opportunity generation
• Created comprehensive facilitator guides for cross-functional training delivery, standardizing Salesforce prospecting and cold-email writing curriculum while reducing trainer preparation time

Sales Coach | June 2022 - June 2023
• Trained and onboarded 30+ sales professionals (20 SDRs, 10 Account Executives), conducting 600+ individual coaching sessions and 900+ call reviews to optimize prospecting, objection handling, and deal-closing strategies
• Engineered data-driven coaching methodology based on Sandler Sales principles, optimizing outreach sequences and increasing conversion rates across multiple sales teams
• Designed scalable SDR onboarding programs, reducing ramp time 40% and implementing coaching framework that increased pipeline velocity 30%, contributing to record-breaking quota attainment

Calendly | Tampa, Florida
Strategic Inside Sales Development Representative | November 2021 - June 2022
• Constructed data-driven outbound strategies targeting enterprise accounts, generating $4M in pipeline and $400K in ARR through precise segmentation and account prioritization
• Analyzed CRM and engagement data to optimize outreach timing, messaging, and lead qualification processes, improving conversion rates and accelerating deal velocity
• Executed strategic account mapping and territory planning, identifying high-value prospects and developing targeted engagement sequences

Freedom Boat Club of Tampa Bay | Clearwater, Florida
Director of Sales and Revenue Operations | January 2020 - May 2022
• Directed 10-person sales team while overseeing comprehensive revenue operations and sales strategy execution, contributing to $13M in closed business and $12M in ARR growth
• Implemented revenue operations processes, forecasting methodologies, and performance tracking systems to optimize sales efficiency and predictability
• Managed sales technology stack, CRM optimization, and data analysis to support strategic decision-making and performance improvement initiatives

CORE COMPETENCIES
Revenue Operations: Pipeline Management, Forecasting, CRM Optimization, Sales Analytics, Performance Tracking
Sales Enablement: Training Program Development, Coaching Methodologies, Onboarding Systems, Sales Process Design
Go-to-Market Strategy: Product Launch, Market Segmentation, Multi-Channel Campaigns, Competitive Positioning
Technical Proficiencies: Salesforce, Outreach, HubSpot, Calendly, Clay, Apollo, Smartlead, Million Verifier, Zapmail, GPT API Integration, Email Marketing Platforms, Sales Analytics Tools
Methodologies: Sandler Sales Training, Solution Selling, MEDDIC, Consultative Selling, Account-Based Marketing

ACHIEVEMENTS & CERTIFICATIONS
• Consistently exceeded sales quotas across multiple organizations and roles
• Developed training programs that reduced onboarding time by 40% and increased pipeline velocity by 30%
• Generated over $17M in pipeline and ARR across enterprise and mid-market segments
• Certified in Sandler Sales Methodology and advanced sales coaching techniques`;

// System Prompts (same as MCP server)
const STRENGTHS_ANALYZER_PROMPT = `You are Jacob Weaver's personal career strategist, specializing in Revenue Operations, Sales Enablement, and GTM roles. Your job is to analyze job requirements and identify which of Jacob's strengths and experiences to emphasize most strongly.

JACOB'S COMPLETE BACKGROUND:
${JACOB_MASTER_RESUME}

Your role is to:
1. Match Jacob's experiences to specific job requirements
2. Identify the most relevant achievements to highlight
3. Suggest how to reframe experiences for maximum impact
4. Prioritize skills based on role requirements

Return a JSON response with this exact structure:
{
  "top_5_strengths": [
    {
      "rank": 1,
      "strength": "Sales Enablement & Training Expertise",
      "experience": "Specific experience from resume",
      "alignment": "How it aligns with job requirements",
      "why_critical": "Why this is critical for success"
    }
  ],
  "achievement_prioritization": {
    "primary": "Most important achievement to highlight",
    "secondary": "Second most important achievement", 
    "supporting": "Supporting achievement"
  },
  "experience_reframing": {
    "freedom_boat_club": "How to present for SaaS context",
    "clay_automation": "How to position for traditional RevOps",
    "sales_coaching": "How to frame for enablement positions"
  },
  "skill_alignment": {
    "technical_skills": ["List of technical skills to emphasize"],
    "methodologies": ["Relevant methodologies"],
    "leadership": ["Leadership experiences to highlight"]
  },
  "unique_value_proposition": {
    "differentiation": "What makes Jacob unique",
    "competitive_advantages": ["List of advantages"],
    "positioning_statement": "Clear positioning statement"
  }
}`;

const MATERIALS_ARCHITECT_PROMPT = `You are Jacob Weaver's personal application materials specialist, focusing on Revenue Operations, Sales Enablement, GTM Operations, and SDR Management roles. You create highly customized, ATS-optimized materials that win interviews.

JACOB'S COMPLETE BACKGROUND:
${JACOB_MASTER_RESUME}

Create customized application materials based on the strengths analysis and company research provided. Return a JSON response with this exact structure:

{
  "resume": {
    "header": "JACOB WEAVER contact info",
    "experience": [
      {
        "company": "Company Name",
        "location": "City, State", 
        "title": "Job Title",
        "dates": "Start - End",
        "bullets": ["Bullet point 1", "Bullet point 2"]
      }
    ],
    "core_competencies": ["Competency 1", "Competency 2"],
    "achievements_certifications": ["Achievement 1", "Achievement 2"]
  },
  "cover_letter": "Complete cover letter text with proper formatting and structure",
  "thirty_sixty_ninety_day_plan": "Complete 30/60/90 day plan in structured format with sections: Onboarding & Learning, Team Development & Coaching, Process Optimization, Strategic Alignment & Metrics, Stakeholder Engagement"
}

REQUIREMENTS:
- Maintain 100% factual accuracy of all dates, companies, metrics
- Integrate ATS keywords naturally throughout
- Reference specific company details and recent developments
- Include portfolio link: https://revenue-accelerate-hub.lovable.app
- Follow structured 30/60/90 format with Activity | Description | Frequency | Core Outcome`;

const CONTENT_REFINEMENT_PROMPT = `You are a professional editor specializing in executive-level business communications for Revenue Operations and Sales Enablement roles. You refine application materials for maximum professional impact and ATS optimization.

Your role is to take application materials and elevate them to executive standards while maintaining authenticity and factual accuracy.

REFINEMENT FOCUS:
- Elevate language to executive/leadership level
- Strengthen action verbs and impact statements
- Integrate additional ATS keywords naturally (2-3% density max)
- Enhance company-specific references and alignment
- Perfect grammar, style, and professional presentation
- Ensure consistency across all materials

CRITICAL REQUIREMENTS:
- NEVER alter factual information (dates, companies, metrics, achievements)
- Maintain the structured format provided
- Keep materials authentic to Jacob's experience
- Optimize for both ATS systems and human reviewers

Return the refined materials in the same JSON structure as provided, plus a refinement_summary explaining improvements made.`;

// OpenAI API helper
async function callOpenAI(prompt, temperature = 0.3, env) {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable not set');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: CONFIG.openai.model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: temperature
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// CORS helper
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': CONFIG.cors.origin,
    'Access-Control-Allow-Methods': CONFIG.cors.methods.join(', '),
    'Access-Control-Allow-Headers': CONFIG.cors.headers.join(', '),
    'Content-Type': 'application/json',
  };
}

// Main request handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    // Health check
    if (path === '/health' && request.method === 'GET') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'Job Application Automation Worker',
        timestamp: new Date().toISOString(),
        tools: ['analyze_job_strengths', 'create_application_materials', 'refine_application_materials', 'generate_complete_application']
      }), { headers: corsHeaders() });
    }

    // API endpoints
    if (request.method === 'POST') {
      try {
        const body = await request.json();

        switch (path) {
          case '/analyze_job_strengths':
            return await handleAnalyzeJobStrengths(body, env);
          
          case '/create_application_materials':
            return await handleCreateApplicationMaterials(body, env);
          
          case '/refine_application_materials':
            return await handleRefineApplicationMaterials(body, env);
          
          case '/generate_complete_application':
            return await handleGenerateCompleteApplication(body, env);
          
          default:
            return new Response(JSON.stringify({
              error: 'Not Found',
              message: `Endpoint ${path} not found`,
              available_endpoints: ['/analyze_job_strengths', '/create_application_materials', '/refine_application_materials', '/generate_complete_application']
            }), { 
              status: 404, 
              headers: corsHeaders() 
            });
        }
      } catch (error) {
        console.error('Request error:', error);
        return new Response(JSON.stringify({
          error: 'Bad Request',
          message: error.message
        }), { 
          status: 400, 
          headers: corsHeaders() 
        });
      }
    }

    // Default response
    return new Response(JSON.stringify({
      service: 'Job Application Automation Worker',
      version: '1.0.0',
      description: 'HTTP API for automated job application material generation specializing in Revenue Operations and Sales Enablement roles',
      endpoints: {
        'GET /health': 'Health check',
        'POST /analyze_job_strengths': 'Analyze job requirements and identify top strengths',
        'POST /create_application_materials': 'Generate complete application package',
        'POST /refine_application_materials': 'Refine and polish materials',
        'POST /generate_complete_application': 'End-to-end generation (all steps)'
      },
      author: 'Jacob Weaver',
      portfolio: 'https://revenue-accelerate-hub.lovable.app'
    }), { headers: corsHeaders() });
  }
};

// Tool handlers
async function handleAnalyzeJobStrengths(body, env) {
  const { company_name, job_title, company_research, job_requirements } = body;
  
  if (!company_name || !job_title || !company_research || !job_requirements) {
    throw new Error('Missing required parameters: company_name, job_title, company_research, job_requirements');
  }

  const prompt = `${STRENGTHS_ANALYZER_PROMPT}

  Analyze this job opportunity:
  
  COMPANY: ${company_name}
  JOB TITLE: ${job_title}
  
  COMPANY RESEARCH:
  Industry: ${company_research.industry}
  Employee Count: ${company_research.employee_count}
  Mission & Values: ${company_research.mission_values}
  Recent Developments: ${company_research.recent_developments}
  Market Position: ${company_research.market_position}
  Key Challenges: ${company_research.key_challenges}
  
  JOB REQUIREMENTS:
  ${job_requirements.map(req => `- ${req}`).join('\n')}
  
  Provide structured analysis identifying Jacob's top strengths for this specific role.`;

  const analysis = await callOpenAI(prompt, 0.3, env);

  return new Response(JSON.stringify({
    success: true,
    message: `✅ Strengths analysis completed for ${company_name} ${job_title} role.`,
    data: {
      analysis: analysis,
      top_strengths: analysis.top_5_strengths?.map(s => s.strength) || [],
      processing_time: new Date().toISOString()
    }
  }), { headers: corsHeaders() });
}

async function handleCreateApplicationMaterials(body, env) {
  const { company_name, job_title, strengths_analysis, company_research, ats_keywords } = body;
  
  if (!company_name || !job_title || !strengths_analysis || !company_research || !ats_keywords) {
    throw new Error('Missing required parameters: company_name, job_title, strengths_analysis, company_research, ats_keywords');
  }

  const prompt = `${MATERIALS_ARCHITECT_PROMPT}

  Create customized application materials for:
  
  COMPANY: ${company_name}
  JOB TITLE: ${job_title}
  
  STRENGTHS ANALYSIS:
  ${JSON.stringify(strengths_analysis, null, 2)}
  
  COMPANY RESEARCH:
  ${JSON.stringify(company_research, null, 2)}
  
  ATS KEYWORDS TO INTEGRATE:
  ${ats_keywords.join(', ')}
  
  Create complete application package with customized resume, personalized cover letter, and strategic 30/60/90 day plan.`;

  const materials = await callOpenAI(prompt, 0.4, env);

  return new Response(JSON.stringify({
    success: true,
    message: `✅ Application materials created for ${company_name} ${job_title} role.`,
    data: {
      materials: materials,
      components: ['resume', 'cover_letter', 'thirty_sixty_ninety_day_plan'],
      processing_time: new Date().toISOString()
    }
  }), { headers: corsHeaders() });
}

async function handleRefineApplicationMaterials(body, env) {
  const { company_name, job_title, original_materials, ats_keywords, refinement_focus = ['all'] } = body;
  
  if (!company_name || !job_title || !original_materials || !ats_keywords) {
    throw new Error('Missing required parameters: company_name, job_title, original_materials, ats_keywords');
  }

  const prompt = `${CONTENT_REFINEMENT_PROMPT}

  Refine these application materials for:
  
  COMPANY: ${company_name}
  JOB TITLE: ${job_title}
  
  ORIGINAL MATERIALS:
  ${JSON.stringify(original_materials, null, 2)}
  
  ADDITIONAL ATS KEYWORDS:
  ${ats_keywords.join(', ')}
  
  REFINEMENT FOCUS:
  ${refinement_focus.join(', ')}
  
  Polish these materials to executive standards while maintaining authenticity and factual accuracy.`;

  const refined = await callOpenAI(prompt, 0.2, env);

  return new Response(JSON.stringify({
    success: true,
    message: `✅ Application materials refined for ${company_name} ${job_title} role.`,
    data: {
      refined_materials: refined,
      refinements_applied: ['executive-level language', 'ATS optimization', 'professional presentation'],
      processing_time: new Date().toISOString()
    }
  }), { headers: corsHeaders() });
}

async function handleGenerateCompleteApplication(body, env) {
  const startTime = Date.now();
  const { company_name, job_title, company_research, job_requirements, ats_keywords } = body;
  
  if (!company_name || !job_title || !company_research || !job_requirements || !ats_keywords) {
    throw new Error('Missing required parameters: company_name, job_title, company_research, job_requirements, ats_keywords');
  }

  try {
    // Step 1: Analyze strengths
    const strengthsBody = { company_name, job_title, company_research, job_requirements };
    const strengthsResponse = await handleAnalyzeJobStrengths(strengthsBody, env);
    const strengthsData = await strengthsResponse.json();
    const strengthsAnalysis = strengthsData.data.analysis;

    // Step 2: Create materials
    const materialsBody = { company_name, job_title, strengths_analysis: strengthsAnalysis, company_research, ats_keywords };
    const materialsResponse = await handleCreateApplicationMaterials(materialsBody, env);
    const materialsData = await materialsResponse.json();
    const originalMaterials = materialsData.data.materials;

    // Step 3: Refine materials
    const refinementBody = {
      company_name,
      job_title,
      original_materials: originalMaterials,
      ats_keywords: ats_keywords.concat(['systematic training', 'cross-functional collaboration', 'performance metrics']),
      refinement_focus: ['all']
    };
    const refinedResponse = await handleRefineApplicationMaterials(refinementBody, env);
    const refinedData = await refinedResponse.json();

    const processingTime = Date.now() - startTime;

    // Cache the result if KV is available
    if (env.APPLICATION_CACHE) {
      const cacheKey = `app_${company_name}_${job_title}_${Date.now()}`.replace(/[^a-zA-Z0-9_]/g, '_');
      await env.APPLICATION_CACHE.put(cacheKey, JSON.stringify({
        company_name,
        job_title,
        complete_package: {
          strengths_analysis: strengthsAnalysis,
          final_materials: refinedData.data.refined_materials,
          processing_steps: ['strengths_analysis', 'materials_creation', 'content_refinement'],
          total_processing_time_ms: processingTime,
          generated_at: new Date().toISOString()
        }
      }), { expirationTtl: 86400 }); // 24 hour cache
    }

    return new Response(JSON.stringify({
      success: true,
      message: `🎉 Complete application package generated for ${company_name} - ${job_title}`,
      data: {
        processing_time_ms: processingTime,
        complete_package: {
          strengths_analysis: strengthsAnalysis,
          final_materials: refinedData.data.refined_materials,
          processing_steps: ['strengths_analysis', 'materials_creation', 'content_refinement'],
          total_processing_time_ms: processingTime,
          generated_at: new Date().toISOString()
        },
        package_includes: [
          'Strengths Analysis',
          'Customized Resume',
          'Personalized Cover Letter',
          'Strategic 30/60/90 Day Plan'
        ]
      }
    }), { headers: corsHeaders() });

  } catch (error) {
    console.error('Complete application generation error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Generation Failed',
      message: `❌ Failed to generate complete application: ${error.message}`,
      processing_time_ms: Date.now() - startTime
    }), { 
      status: 500, 
      headers: corsHeaders() 
    });
  }
}