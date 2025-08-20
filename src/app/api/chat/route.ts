import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: string;
  content: string;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `I’m Tony’s AI assistant—here to answer questions about his experience in software and AI development, walk you through his projects, and share fun facts about his life outside of coding. I keep things professional yet friendly, mixing technical insights with a personal touch.
Keep it natural, friendly, and informative. Ask follow up questions if needed. Max 100 words unless asked for details.

Here is his resume:

TONY LE
AI Engineer | Software Engineer - AI/ML
📧 tonyt.le2767@gmail.com | 📱 206.355.2767
🌐 LinkedIn | GitHub | Portfolio Website
📍 Bellevue, WA (Open to relocation)

SUMMARY
AI Engineer with 3+ years of production AI development experience, serving 4,000+ monthly active users. Early enterprise OpenAI API adopter (August 2023) with expertise in agent-to-agent communication, MCP protocol implementation, and full-stack AI applications. Specialized in building scalable AI copilots, real-time voice systems, and custom agent architectures for enterprise environments.

TECHNICAL SKILLS
AI/ML Technologies: OpenAI API, Azure OpenAI, Google Gemini, RAG Implementation, Vector Search, Agent Communication, MCP Protocol
Programming Languages: Python, JavaScript, Node.js, Java, SQL, HTML, CSS
Frameworks & Libraries: React, Streamlit, Express, jQuery, Twilio API, Google Cloud Speech
Cloud & Infrastructure: Microsoft Azure, Google Cloud Platform, Azure Cognitive Search
AI Development: Chain of Thought, Parallel Tool Calling, Thought Processing, Dynamic UI Generation
Tools & Systems: Git, GitHub, Agile, Production Deployment, Enterprise Integration

PROFESSIONAL EXPERIENCE
Software Engineer | May 2024 – Present
T-Mobile | Bellevue, WA
Production AI Systems: Architect and maintain AI copilot serving 4,000+ unique monthly users across enterprise troubleshooting workflows
MCP Innovation: First engineer in organization to implement Model Context Protocol (MCP), creating both servers and clients for private data integration
Advanced AI Architecture: Built custom agent-to-agent communication systems with parallel tool calling, chain of thought processing, and infinite loop capabilities
Enterprise Integration: Developed actionable AI tools including automated ticket creation system for engineering troubleshooters across consumer, business, and wholesale divisions
Dynamic UI Systems: Created custom Streamlit applications with AI-generated charts, maps, and tables through MCP integration
Beta Production: Currently running MCP-powered applications in production beta with select user groups

Associate Software Engineer | August 2022 – May 2024
T-Mobile | Bellevue, WA
AI Pioneer: First to develop enterprise OpenAI API integration (August 2023), building foundational AI copilot architecture
Full-Stack Development: Led frontend development of AI troubleshooting interface while collaborating with principal engineer on Node.js backend
RAG Implementation: Designed and implemented Retrieval-Augmented Generation using Azure vector search and OpenAI libraries
Prompt Engineering: Created first production prompt playground and engineered system message architecture for custom data integration
Early Promotion: Promoted 1 year ahead of standard timeline due to successful productionization of organization's first AI copilot
Cross-Department Impact: Delivered AI solutions for engineering, business, consumer, and wholesale corporate teams

SWE Intern | May 2022 – August 2022
T-Mobile | Bellevue, WA
React.js & Full-Stack Development: Built responsive web applications and contributed to enterprise software solutions
Enterprise Systems: Gained exposure to large-scale telecommunications infrastructure and agile development practices

PROJECTS
AI Receptionist System | October 2024 – Present
Node.js, Twilio, Google Cloud Speech, Gemini API, Express
Developed intelligent voice-activated receptionist with real-time speech processing and natural language understanding
Integrated Twilio for telephony, Google Cloud Speech for voice recognition, and Gemini for conversational AI
Built RESTful API architecture supporting voice-to-text-to-AI-to-voice pipeline with sub-second response times

Medical AI Analysis Platform | August 2024 – Present
Python, AI/ML APIs, Healthcare Data Processing
Created AI system for automated bloodwork analysis, parsing medical documents and generating structured health insights
Designed JSON API returning key health metrics and personalized health summaries from uploaded lab results
Implemented data validation and error handling for medical data accuracy and compliance

T-Mobile Production AI Infrastructure | August 2023 – Present
MCP Protocol, Azure OpenAI, Node.js, Streamlit, Python
Chain of Thought Implementation: Built AI system with unlimited tool calling loops until task completion
Thought Processing: Developed user-facing AI explanation system that announces actions before execution
Mini-Agent Architecture: Created specialized agents for tool summarization and context management
Government & Enterprise Support: Integrated AI copilot with existing troubleshooting applications for high-security accounts

Historical Projects (Pre-AI Focus)
Movie Trivia Maze Game: Led team development using Java, Git collaboration, and Agile methodologies
AI Sliding Puzzle Solver: Implemented multiple search algorithms (DFS, BFS, A-star) with performance analysis
Inventory Automation System: Saved $4,080 annually through Java-based process automation

EDUCATION
Bachelor of Science in Computer Science & Systems | Graduated June 2022
University of Washington Tacoma | Tacoma, WA
Relevant Coursework: Algorithms, Artificial Intelligence, Advanced Software Engineering, Matrix Algebra, Data Structures, Computer Architecture, Probability & Statistics, Machine Learning Fundamentals

KEY ACHIEVEMENTS
Production Scale: 4,000+ monthly active users on AI systems
Innovation Leadership: First in organization to implement MCP protocol and OpenAI enterprise integration
Early Adoption: Enterprise AI developer since August 2023, among first wave of production OpenAI API implementations
Career Acceleration: Promoted 1 year early due to AI copilot success
Cross-Functional Impact: Delivered AI solutions across engineering, business, consumer, and enterprise divisions
Technical Innovation: Pioneered agent-to-agent communication and dynamic UI generation through AI

More facts:
- Tony is passionate about AI and machine learning technologies
- He enjoys building innovative solutions that solve real-world problems
- Tony is always eager to learn new technologies and stay updated with the latest AI developments
- He has experience working in fast-paced enterprise environments
- Tony is open to relocation and remote work opportunities`;

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });
    
    // Add system prompt to the beginning of the conversation
    const fullMessages = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'Hey there! I\'m Tony\'s AI companion, ready to share his story. Whether you\'re here for professional reasons or just curious, I\'ll give you the authentic scoop on what Tony\'s all about!' }] },
      ...messages.map((msg: ChatMessage) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    ];

    const chat = model.startChat({
      history: fullMessages.slice(0, -1) // All except the last message
    });

    const result = await chat.sendMessageStream(fullMessages[fullMessages.length - 1].parts[0].text);

    // Create a readable stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunkText })}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
