#!/usr/bin/env node

/**
 * MCP Job Application Automation Server
 * Handles end-to-end job application material generation for Jacob Weaver
 * Specializes in Revenue Operations, Sales Enablement, and GTM roles
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import OpenAI from 'openai';

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

// Jacob's Master Resume Data
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

// System Prompts for Each GPT Function
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

class JobApplicationServer {
  constructor() {
    this.server = new Server(
      {
        name: 'job-application-automation',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'analyze_job_strengths',
            description: 'Analyze job requirements and identify Jacob\'s top strengths to emphasize',
            inputSchema: {
              type: 'object',
              properties: {
                company_name: { type: 'string' },
                job_title: { type: 'string' },
                company_research: {
                  type: 'object',
                  properties: {
                    industry: { type: 'string' },
                    employee_count: { type: 'string' },
                    mission_values: { type: 'string' },
                    recent_developments: { type: 'string' },
                    market_position: { type: 'string' },
                    key_challenges: { type: 'string' }
                  },
                  required: ['industry', 'employee_count', 'mission_values', 'recent_developments', 'market_position', 'key_challenges']
                },
                job_requirements: {
                  type: 'array',
                  items: { type: 'string' }
                }
              },
              required: ['company_name', 'job_title', 'company_research', 'job_requirements']
            }
          },
          {
            name: 'create_application_materials',
            description: 'Create customized resume, cover letter, and 30/60/90 day plan',
            inputSchema: {
              type: 'object',
              properties: {
                company_name: { type: 'string' },
                job_title: { type: 'string' },
                strengths_analysis: { type: 'object' },
                company_research: { type: 'object' },
                ats_keywords: {
                  type: 'array',
                  items: { type: 'string' }
                }
              },
              required: ['company_name', 'job_title', 'strengths_analysis', 'company_research', 'ats_keywords']
            }
          },
          {
            name: 'refine_application_materials',
            description: 'Refine and polish application materials for maximum impact',
            inputSchema: {
              type: 'object',
              properties: {
                company_name: { type: 'string' },
                job_title: { type: 'string' },
                original_materials: { type: 'object' },
                ats_keywords: {
                  type: 'array',
                  items: { type: 'string' }
                },
                refinement_focus: {
                  type: 'array',
                  items: { type: 'string' }
                }
              },
              required: ['company_name', 'job_title', 'original_materials', 'ats_keywords', 'refinement_focus']
            }
          },
          {
            name: 'generate_complete_application',
            description: 'End-to-end application generation - runs all 3 steps in sequence',
            inputSchema: {
              type: 'object',
              properties: {
                company_name: { type: 'string' },
                job_title: { type: 'string' },
                company_research: {
                  type: 'object',
                  properties: {
                    industry: { type: 'string' },
                    employee_count: { type: 'string' },
                    mission_values: { type: 'string' },
                    recent_developments: { type: 'string' },
                    market_position: { type: 'string' },
                    key_challenges: { type: 'string' }
                  },
                  required: ['industry', 'employee_count', 'mission_values', 'recent_developments', 'market_position', 'key_challenges']
                },
                job_requirements: {
                  type: 'array',
                  items: { type: 'string' }
                },
                ats_keywords: {
                  type: 'array',
                  items: { type: 'string' }
                }
              },
              required: ['company_name', 'job_title', 'company_research', 'job_requirements', 'ats_keywords']
            }
          }
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_job_strengths':
            return await this.analyzeJobStrengths(args);
          
          case 'create_application_materials':
            return await this.createApplicationMaterials(args);
          
          case 'refine_application_materials':
            return await this.refineApplicationMaterials(args);
          
          case 'generate_complete_application':
            return await this.generateCompleteApplication(args);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        console.error(`Error in ${name}:`, error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error.message}`
        );
      }
    });
  }

  async analyzeJobStrengths(args) {
    const prompt = `${STRENGTHS_ANALYZER_PROMPT}

    Analyze this job opportunity:
    
    COMPANY: ${args.company_name}
    JOB TITLE: ${args.job_title}
    
    COMPANY RESEARCH:
    Industry: ${args.company_research.industry}
    Employee Count: ${args.company_research.employee_count}
    Mission & Values: ${args.company_research.mission_values}
    Recent Developments: ${args.company_research.recent_developments}
    Market Position: ${args.company_research.market_position}
    Key Challenges: ${args.company_research.key_challenges}
    
    JOB REQUIREMENTS:
    ${args.job_requirements.map(req => `- ${req}`).join('\n')}
    
    Provide structured analysis identifying Jacob's top strengths for this specific role.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const analysis = JSON.parse(response.choices[0].message.content);

    return {
      content: [{
        type: 'text',
        text: `Strengths analysis completed for ${args.company_name} ${args.job_title} role.`
      }],
      isError: false,
      _meta: {
        analysis: analysis,
        processing_time: new Date().toISOString()
      }
    };
  }

  async createApplicationMaterials(args) {
    const prompt = `${MATERIALS_ARCHITECT_PROMPT}

    Create customized application materials for:
    
    COMPANY: ${args.company_name}
    JOB TITLE: ${args.job_title}
    
    STRENGTHS ANALYSIS:
    ${JSON.stringify(args.strengths_analysis, null, 2)}
    
    COMPANY RESEARCH:
    ${JSON.stringify(args.company_research, null, 2)}
    
    ATS KEYWORDS TO INTEGRATE:
    ${args.ats_keywords.join(', ')}
    
    Create complete application package with customized resume, personalized cover letter, and strategic 30/60/90 day plan.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.4
    });

    const materials = JSON.parse(response.choices[0].message.content);

    return {
      content: [{
        type: 'text',
        text: `Application materials created for ${args.company_name} ${args.job_title} role.`
      }],
      isError: false,
      _meta: {
        materials: materials,
        processing_time: new Date().toISOString()
      }
    };
  }

  async refineApplicationMaterials(args) {
    const prompt = `${CONTENT_REFINEMENT_PROMPT}

    Refine these application materials for:
    
    COMPANY: ${args.company_name}
    JOB TITLE: ${args.job_title}
    
    ORIGINAL MATERIALS:
    ${JSON.stringify(args.original_materials, null, 2)}
    
    ADDITIONAL ATS KEYWORDS:
    ${args.ats_keywords.join(', ')}
    
    REFINEMENT FOCUS:
    ${args.refinement_focus.join(', ')}
    
    Polish these materials to executive standards while maintaining authenticity and factual accuracy.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const refined = JSON.parse(response.choices[0].message.content);

    return {
      content: [{
        type: 'text',
        text: `Application materials refined for ${args.company_name} ${args.job_title} role.`
      }],
      isError: false,
      _meta: {
        refined_materials: refined,
        processing_time: new Date().toISOString()
      }
    };
  }

  async generateCompleteApplication(args) {
    const startTime = Date.now();
    
    try {
      console.log(`Starting complete application generation for ${args.company_name} - ${args.job_title}`);
      
      // Step 1: Analyze strengths
      console.log('Step 1: Analyzing job strengths...');
      const strengthsResult = await this.analyzeJobStrengths({
        company_name: args.company_name,
        job_title: args.job_title,
        company_research: args.company_research,
        job_requirements: args.job_requirements
      });
      
      const strengthsAnalysis = strengthsResult._meta.analysis;
      
      // Step 2: Create materials
      console.log('Step 2: Creating application materials...');
      const materialsResult = await this.createApplicationMaterials({
        company_name: args.company_name,
        job_title: args.job_title,
        strengths_analysis: strengthsAnalysis,
        company_research: args.company_research,
        ats_keywords: args.ats_keywords
      });
      
      const originalMaterials = materialsResult._meta.materials;
      
      // Step 3: Refine materials
      console.log('Step 3: Refining application materials...');
      const refinedResult = await this.refineApplicationMaterials({
        company_name: args.company_name,
        job_title: args.job_title,
        original_materials: originalMaterials,
        ats_keywords: args.ats_keywords.concat(['systematic training', 'cross-functional collaboration', 'performance metrics']),
        refinement_focus: ['all']
      });
      
      const processingTime = Date.now() - startTime;
      
      return {
        content: [{
          type: 'text',
          text: `Complete application package generated for ${args.company_name} - ${args.job_title} in ${processingTime}ms`
        }],
        isError: false,
        _meta: {
          complete_package: {
            strengths_analysis: strengthsAnalysis,
            final_materials: refinedResult._meta.refined_materials,
            processing_steps: ['strengths_analysis', 'materials_creation', 'content_refinement'],
            total_processing_time_ms: processingTime,
            generated_at: new Date().toISOString()
          }
        }
      };
      
    } catch (error) {
      console.error('Error in complete application generation:', error);
      
      return {
        content: [{
          type: 'text',
          text: `Failed to generate complete application: ${error.message}`
        }],
        isError: true,
        _meta: {
          error: error.message,
          processing_time_ms: Date.now() - startTime
        }
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Job Application Automation MCP server running on stdio');
  }
}

// Start the server
const server = new JobApplicationServer();
server.run().catch(console.error);