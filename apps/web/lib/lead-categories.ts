export type LeadClassification = {
  category: string;
  subcategory: string;
  confidence: number;
};

type LeadClassificationInput = {
  platform?: string | null;
  communityName?: string | null;
  authorName?: string | null;
  postText?: string | null;
  postSnippet?: string | null;
  matchedKeywords?: string[] | null;
};

type LeadCategoryDefinition = {
  category: string;
  subcategories: string[];
  aliases?: string[];
};

export const LEAD_CATEGORY_DEFINITIONS: LeadCategoryDefinition[] = [
  {
    category: "Web Development",
    aliases: ["website", "web app", "web developer", "landing page", "api integration", "site speed"],
    subcategories: [
      "Frontend Development", "Backend Development", "Full Stack Development", "WordPress Development", "Shopify Development",
      "Shopify Plus Development", "WooCommerce Development", "Magento Development", "Webflow Development", "Wix Development",
      "Squarespace Development", "Bubble.io Development", "Custom CMS Development", "JAMstack Development", "Progressive Web Apps (PWA)",
      "Landing Pages", "Website Speed Optimization", "Website Maintenance", "Website Migration", "API Development", "API Integration"
    ]
  },
  {
    category: "Mobile App Development",
    aliases: ["mobile app", "app developer", "app store", "play store"],
    subcategories: ["Android Apps", "iOS Apps", "Flutter", "React Native", "Xamarin", "Kotlin", "Swift", "Mobile UI Development", "App Maintenance", "App Store Deployment"]
  },
  {
    category: "Software Development",
    aliases: ["software developer", "custom tool", "internal tool", "extension developer"],
    subcategories: [
      "Desktop Applications", "SaaS Development", "CRM Development", "ERP Development", "POS Systems", "Custom Software",
      "Browser Extensions", "Chrome Extensions", "Automation Software", "AI Software", "Internal Business Tools"
    ]
  },
  {
    category: "AI & Machine Learning",
    aliases: ["artificial intelligence", "chatbot", "llm", "gemini", "openai", "automation with ai"],
    subcategories: [
      "AI Chatbots", "GPT Integration", "Claude Integration", "AI Agents", "RAG Systems", "Machine Learning Models", "NLP",
      "Computer Vision", "Recommendation Systems", "Prompt Engineering", "LLM Fine-tuning", "AI Automation", "AI Voice Agents",
      "AI Customer Support", "AI Workflow Automation"
    ]
  },
  {
    category: "UI/UX Design",
    aliases: ["ui ux", "product design", "interface design"],
    subcategories: ["UX Research", "User Flows", "Wireframing", "Prototyping", "Figma Design", "Mobile UI", "Dashboard Design", "SaaS Design", "Website Design", "Design Systems", "Accessibility Design"]
  },
  {
    category: "Graphic Design",
    aliases: ["graphic designer", "branding", "visual design"],
    subcategories: ["Logo Design", "Brand Identity", "Packaging", "Flyers", "Brochures", "Business Cards", "Posters", "Banner Design", "Social Media Graphics", "Presentation Design", "Infographics", "Ebook Design", "Book Covers"]
  },
  {
    category: "Video & Animation",
    aliases: ["video editor", "animation", "youtube editor", "reels editor"],
    subcategories: ["Video Editing", "Motion Graphics", "2D Animation", "3D Animation", "Whiteboard Animation", "Explainer Videos", "YouTube Editing", "Shorts Editing", "Reels Editing", "TikTok Editing", "Podcast Editing", "VFX", "Color Grading", "Video Ads"]
  },
  {
    category: "3D Design",
    aliases: ["3d artist", "rendering", "cad model"],
    subcategories: ["Product Rendering", "3D Modeling", "Character Design", "Architectural Visualization", "Interior Rendering", "Exterior Rendering", "Blender", "Maya", "Cinema4D", "CAD Modeling"]
  },
  {
    category: "Digital Marketing",
    aliases: ["marketing agency", "growth marketing", "demand gen", "paid ads", "lead gen"],
    subcategories: [
      "SEO", "Local SEO", "Technical SEO", "Programmatic SEO", "PPC", "Google Ads", "Meta Ads", "TikTok Ads", "LinkedIn Ads",
      "Pinterest Ads", "Amazon Ads", "Email Marketing", "SMS Marketing", "Affiliate Marketing", "Influencer Marketing",
      "Marketing Automation", "Lead Generation", "CRO", "Funnel Building", "Analytics", "Tag Manager", "Marketing Strategy"
    ]
  },
  {
    category: "Social Media",
    aliases: ["social media manager", "community manager", "instagram manager"],
    subcategories: ["Social Media Management", "Content Calendar", "Community Management", "Instagram Growth", "LinkedIn Growth", "Facebook Management", "Twitter/X Management", "TikTok Growth", "Pinterest Marketing", "Social Media Advertising"]
  },
  {
    category: "Content Writing",
    aliases: ["writer", "copywriter", "content writer"],
    subcategories: [
      "Blog Writing", "Article Writing", "Website Copywriting", "Landing Page Copy", "Sales Copy", "Email Copywriting", "Technical Writing",
      "Ghostwriting", "White Papers", "Case Studies", "Press Releases", "Product Descriptions", "Script Writing", "Newsletter Writing",
      "Resume Writing", "LinkedIn Profiles"
    ]
  },
  {
    category: "Translation & Localization",
    aliases: ["translator", "localization", "proofreader"],
    subcategories: ["Translation", "Localization", "Proofreading", "Editing", "Transcription", "Subtitling", "Captioning", "Interpretation", "Audio Transcription", "Voice Transcription"]
  },
  {
    category: "Sales",
    aliases: ["sales development", "sales rep", "outreach", "sales calls", "booking meetings"],
    subcategories: [
      "Appointment Setting", "Cold Calling", "Cold Email", "LinkedIn Outreach", "SDR Services", "Lead Qualification", "CRM Management",
      "Sales Funnels", "Sales Consulting", "Prospect List Building", "Telemarketing", "Pipeline Management", "Quote Preparation",
      "Proposal Preparation", "Account Management", "Client Success"
    ]
  },
  {
    category: "Virtual Assistance",
    aliases: ["va", "virtual assistant", "admin assistant", "back office"],
    subcategories: [
      "Executive Assistant", "Administrative Support", "Email Management", "Calendar Management", "Customer Follow-up", "Research",
      "Scheduling", "Personal Assistance", "Administrative Assistant", "Office Assistant", "Operations Assistant", "Project Coordinator",
      "Project Administrator", "Team Assistant", "Back Office Support", "File Organization"
    ]
  },
  {
    category: "Customer Support",
    aliases: ["customer service", "support agent", "help desk"],
    subcategories: ["Live Chat Support", "Email Support", "Phone Support", "Technical Support", "Help Desk", "Customer Success", "Ticket Management", "Order Processing", "Complaint Resolution", "Customer Experience"]
  },
  {
    category: "Business Consulting",
    aliases: ["business consultant", "startup consultant", "growth consultant"],
    subcategories: ["Business Plans", "Startup Consulting", "Operations Consulting", "Process Improvement", "Business Analysis", "Financial Modeling", "Market Research", "Competitive Research", "Growth Strategy"]
  },
  {
    category: "Finance & Accounting",
    aliases: ["accountant", "bookkeeper", "finance"],
    subcategories: ["Bookkeeping", "Payroll", "Tax Preparation", "Financial Analysis", "Budgeting", "Auditing", "Accounting Software Setup", "Accounts Payable", "Accounts Receivable", "Bank Reconciliation", "Invoice Processing", "Billing", "Expense Tracking", "Financial Reporting"]
  },
  {
    category: "Legal",
    aliases: ["legal assistant", "lawyer", "attorney"],
    subcategories: ["Contract Drafting", "NDA Creation", "Terms & Conditions", "Privacy Policies", "Trademark Filing", "Patent Research", "Legal Research", "Compliance", "Contract Review", "Document Review", "Compliance Documentation"]
  },
  {
    category: "Data",
    aliases: ["data analyst", "spreadsheet", "excel work"],
    subcategories: ["Data Entry", "Data Cleaning", "Data Analysis", "Excel", "Google Sheets", "Power BI", "Tableau", "SQL", "Dashboard Creation", "Data Visualization", "Copy Typing", "Data Collection", "Data Mining", "Data Cleansing", "Data Formatting", "Spreadsheet Management", "PDF to Excel", "PDF to Word", "Database Management"]
  },
  {
    category: "Cybersecurity",
    aliases: ["security engineer", "security audit"],
    subcategories: ["Security Audits", "Penetration Testing", "Vulnerability Assessment", "Cloud Security", "Security Compliance", "Incident Response"]
  },
  {
    category: "Cloud & DevOps",
    aliases: ["devops engineer", "cloud engineer", "server admin"],
    subcategories: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "CI/CD", "Jenkins", "GitHub Actions", "Infrastructure as Code", "Server Administration"]
  },
  {
    category: "IT & Networking",
    aliases: ["it support", "network admin", "sysadmin"],
    subcategories: ["System Administration", "Network Administration", "VPN Setup", "Server Migration", "Microsoft 365", "Google Workspace", "Helpdesk"]
  },
  {
    category: "Blockchain & Web3",
    aliases: ["web3", "crypto", "blockchain developer"],
    subcategories: ["Smart Contracts", "Solidity", "NFT Development", "Crypto Wallets", "Token Development", "DeFi", "Web3 Applications"]
  },
  {
    category: "Game Development",
    aliases: ["game developer", "unity developer", "unreal developer"],
    subcategories: ["Unity", "Unreal Engine", "Game Design", "Multiplayer Development", "Mobile Games", "AR/VR Development"]
  },
  {
    category: "Engineering & CAD",
    aliases: ["mechanical engineer", "cad designer"],
    subcategories: ["Mechanical Design", "Electrical Design", "Civil Engineering", "AutoCAD", "SolidWorks", "Revit", "Product Engineering"]
  },
  {
    category: "Architecture & Interior Design",
    aliases: ["architect", "interior designer"],
    subcategories: ["House Plans", "Commercial Design", "Interior Design", "Landscape Design", "BIM Modeling"]
  },
  {
    category: "Audio & Music",
    aliases: ["voiceover", "audio editor", "podcast producer"],
    subcategories: ["Voice Over", "Music Production", "Mixing", "Mastering", "Podcast Production", "Sound Design", "Jingles", "Audiobook Narration"]
  },
  {
    category: "Photography",
    aliases: ["photographer", "photo editor"],
    subcategories: ["Product Photography", "Photo Editing", "Retouching", "Event Photography", "Real Estate Photography"]
  },
  {
    category: "HR & Recruiting",
    aliases: ["recruiter", "talent sourcer", "hr admin"],
    subcategories: ["Talent Acquisition", "Recruitment", "LinkedIn Recruiting", "Interviewing", "HR Consulting", "Employee Training", "Talent Sourcing", "Resume Screening", "Interview Scheduling", "HR Administration", "Employee Onboarding", "Payroll Support", "HR Documentation", "Performance Management"]
  },
  {
    category: "Education & Coaching",
    aliases: ["coach", "tutor", "trainer"],
    subcategories: ["Online Tutoring", "Career Coaching", "Interview Coaching", "Language Teaching", "Course Creation", "Corporate Training"]
  },
  {
    category: "Ecommerce",
    aliases: ["e-commerce", "ecommerce manager", "marketplace manager"],
    subcategories: ["Amazon FBA", "Walmart Marketplace", "Etsy Store Management", "eBay Store Management", "Product Listing", "Inventory Management", "Product Research", "Dropshipping", "Conversion Rate Optimization", "Product Upload", "Product Categorization", "Inventory Updates", "Order Management", "Returns Processing", "Customer Messaging", "Marketplace Management", "Catalog Management"]
  },
  {
    category: "Manufacturing & Product Development",
    aliases: ["product development", "prototype", "sourcing"],
    subcategories: ["Product Design", "Prototype Design", "Sourcing", "Supply Chain Consulting", "Manufacturing Consulting", "Packaging Design"]
  },
  {
    category: "No-Code & Low-Code",
    aliases: ["no code", "low code", "nocode"],
    subcategories: ["Bubble", "Webflow", "Glide", "Softr", "Airtable", "Zapier", "Make", "n8n", "Retool", "Notion Consulting", "Airtable Consulting"]
  },
  {
    category: "Automation",
    aliases: ["workflow automation", "zapier expert", "make.com", "n8n automation"],
    subcategories: ["Workflow Automation", "CRM Automation", "Email Automation", "Marketing Automation", "AI Automation", "Robotic Process Automation (RPA)", "API Automation"]
  },
  {
    category: "QA & Testing",
    aliases: ["qa tester", "software tester", "app testing", "website testing"],
    subcategories: ["Manual Testing", "Automation Testing", "Selenium", "Cypress", "Playwright", "Mobile Testing", "Performance Testing", "Security Testing", "Functional Testing", "Regression Testing", "Website QA", "Mobile App QA", "Software QA", "Bug Reporting", "User Acceptance Testing (UAT)", "Quality Assurance Review"]
  },
  {
    category: "Emerging Services",
    aliases: ["fractional", "revops", "salesops", "creator management"],
    subcategories: ["AI Consulting", "Fractional CTO", "Fractional CMO", "Fractional CFO", "Fractional COO", "Revenue Operations (RevOps)", "Sales Operations (SalesOps)", "Customer Success Operations", "Creator Management", "Podcast Management", "Community Management"]
  },
  {
    category: "Project Management",
    aliases: ["project manager", "scrum master"],
    subcategories: ["Project Management", "Agile Coordination", "Scrum Master", "Task Coordination", "Timeline Management", "Resource Planning", "Risk Management"]
  },
  {
    category: "Healthcare Support",
    aliases: ["medical billing", "medical coding", "medical scribe"],
    subcategories: ["Medical Billing", "Medical Coding", "Medical Transcription", "Medical Scribing", "Healthcare Administration"]
  },
  {
    category: "Review & Moderation",
    aliases: ["content moderation", "review products", "mystery shopping"],
    subcategories: ["Product Reviews", "App Testing", "Website Testing", "Content Moderation", "Image Moderation", "Video Moderation", "Comment Moderation", "Marketplace Listing Review", "Survey Participation", "Feedback Collection", "Mystery Shopping"]
  },
  {
    category: "Common Freelance Tasks",
    aliases: ["freelance task", "simple task", "daily task"],
    subcategories: ["Copy Typing", "Data Entry", "Excel Work", "Google Sheets", "Internet Research", "Email Management", "Calendar Management", "Virtual Assistance", "Customer Support", "Chat Support", "CRM Updates", "Lead Generation", "Appointment Setting", "Product Listing", "PDF Conversion", "Document Formatting", "Presentation Creation", "PowerPoint Design", "Survey Completion", "Quality Checks", "Social Media Posting", "Content Upload", "Recruitment Assistance", "Proofreading"]
  }
];

export const DEFAULT_LEAD_CLASSIFICATION: LeadClassification = {
  category: "Common Freelance Tasks",
  subcategory: "General Freelance Work",
  confidence: 10
};

export function classifyLead(input: LeadClassificationInput): LeadClassification {
  const text = normalize([
    input.platform,
    input.communityName,
    input.authorName,
    input.postText,
    input.postSnippet,
    ...(input.matchedKeywords || [])
  ].filter(Boolean).join(" "));

  if (!text) return DEFAULT_LEAD_CLASSIFICATION;

  let best: LeadClassification & { score: number } = { ...DEFAULT_LEAD_CLASSIFICATION, score: 0 };

  for (const definition of LEAD_CATEGORY_DEFINITIONS) {
    const categoryScore = scoreTerms(text, [definition.category, ...(definition.aliases || [])]);

    for (const subcategory of definition.subcategories) {
      const subcategoryScore = scoreTerms(text, keywordVariants(subcategory));
      const score = categoryScore + subcategoryScore;
      if (score > best.score) {
        best = {
          category: definition.category,
          subcategory,
          confidence: Math.min(100, Math.max(20, score * 8)),
          score
        };
      }
    }
  }

  return {
    category: best.category,
    subcategory: best.subcategory,
    confidence: Math.min(100, Math.max(DEFAULT_LEAD_CLASSIFICATION.confidence, best.confidence))
  };
}

function keywordVariants(value: string) {
  const normalized = value
    .replace(/\([^)]*\)/g, "")
    .replace(/\//g, " ")
    .replace(/\+/g, " ")
    .trim();

  return Array.from(new Set([
    value,
    normalized,
    normalized.replace(/\bdevelopment\b/gi, "developer"),
    normalized.replace(/\bdesign\b/gi, "designer"),
    normalized.replace(/\bmanagement\b/gi, "manager"),
    normalized.replace(/\boptimization\b/gi, "optimisation")
  ].filter(Boolean)));
}

function scoreTerms(text: string, terms: string[]) {
  return terms.reduce((score, term) => {
    const normalizedTerm = normalize(term);
    if (!normalizedTerm) return score;
    if (!containsTerm(text, normalizedTerm)) return score;
    const wordCount = normalizedTerm.split(" ").filter(Boolean).length;
    return score + Math.max(2, wordCount * 2);
  }, 0);
}

function containsTerm(text: string, term: string) {
  if (term.length <= 3) {
    return new RegExp(`(^|\\s)${escapeRegExp(term)}($|\\s)`, "i").test(text);
  }
  return text.includes(term);
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9+#/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
