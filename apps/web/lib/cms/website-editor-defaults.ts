export type MenuItem = {
  label: string;
  href: string;
  visible?: boolean;
};

export type WebsiteEditorContent = {
  branding: {
    companyName: string;
    shortName: string;
    tagline: string;
    slogan: string;
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    headingFont: string;
    bodyFont: string;
    brandGuidelines: string;
  };
  navigation: {
    headerMenu: MenuItem[];
    footerMenu: MenuItem[];
    ctaLabel: string;
    ctaHref: string;
    stickyHeader: boolean;
    megaMenuEnabled: boolean;
    mobileMenuEnabled: boolean;
    breadcrumbsEnabled: boolean;
  };
  hero: {
    headline: string;
    subheadline: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    backgroundMediaUrl: string;
    illustrationUrl: string;
    animationEnabled: boolean;
    trustBadges: string[];
    clientLogos: string[];
    ratingText: string;
  };
  content: {
    sectionOrder: string[];
    editableSections: Record<string, unknown>;
    aboutUs: string;
    mission: string;
    vision: string;
    companyStory: string;
    teamContent: string;
    terms: string;
    privacyPolicy: string;
    refundPolicy: string;
  };
  media: {
    heroImages: string[];
    serviceImages: string[];
    teamPhotos: string[];
    officePhotos: string[];
    portfolioImages: string[];
    productImages: string[];
    icons: string[];
    backgroundImages: string[];
    testimonialPhotos: string[];
    galleryImages: string[];
    videos: Record<string, string>;
  };
  buttons: {
    borderRadius: string;
    hoverEffect: string;
    animation: string;
    primaryColor: string;
    secondaryColor: string;
  };
  forms: {
    contactSuccessMessage: string;
    contactErrorMessage: string;
    newsletterSuccessMessage: string;
    quoteFormEnabled: boolean;
    bookingFormEnabled: boolean;
    popupFormsEnabled: boolean;
    emailNotificationsTo: string;
    captchaEnabled: boolean;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    googleMapsUrl: string;
    workingHours: string;
    emergencyContact: string;
  };
  socials: Record<string, string>;
  services: {
    serviceList: string[];
    pricingSummary: string;
    features: string[];
    process: string[];
    packages: string[];
    deliverables: string[];
    industriesServed: string[];
  };
  portfolio: {
    projects: unknown[];
    categories: string[];
    caseStudies: unknown[];
  };
  testimonials: {
    items: unknown[];
  };
  team: {
    members: unknown[];
  };
  blog: {
    categories: string[];
    defaultAuthor: string;
    relatedPostsEnabled: boolean;
  };
  footer: {
    copyright: string;
    newsletterText: string;
    certifications: string[];
    paymentIcons: string[];
    legalLinks: MenuItem[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl: string;
    openGraphImage: string;
    twitterCardImage: string;
    schemaMarkup: Record<string, unknown>;
    robots: string;
    sitemapEnabled: boolean;
    redirects: Array<{ from: string; to: string; status: number }>;
  };
  performance: {
    imageCompression: boolean;
    lazyLoading: boolean;
    fontOptimization: boolean;
    caching: boolean;
    cdn: string;
    removeUnusedCode: boolean;
    coreWebVitalsTarget: string;
  };
  responsiveness: {
    desktop: boolean;
    laptop: boolean;
    tablet: boolean;
    mobile: boolean;
    largeMobile: boolean;
    landscapeMode: boolean;
    foldableDevices: boolean;
  };
  animations: {
    scrollAnimations: boolean;
    hoverEffects: boolean;
    buttonAnimation: boolean;
    loadingAnimation: boolean;
    pageTransition: boolean;
    cursorEffects: boolean;
    microInteractions: boolean;
  };
  accessibility: {
    altTextRequired: boolean;
    keyboardNavigation: boolean;
    contrastRatio: string;
    screenReaderSupport: boolean;
    focusStates: boolean;
    ariaLabels: boolean;
    formAccessibility: boolean;
  };
  security: {
    httpsRequired: boolean;
    spamProtection: boolean;
    captcha: boolean;
    inputValidation: boolean;
    securityHeaders: boolean;
    backup: string;
    firewall: string;
  };
  analytics: {
    googleAnalyticsId: string;
    googleTagManagerId: string;
    searchConsole: string;
    metaPixelId: string;
    linkedInInsightTag: string;
    microsoftClarityId: string;
    heatmaps: string;
    conversionTracking: boolean;
    eventTracking: boolean;
  };
  integrations: {
    crm: string;
    emailMarketing: string;
    calendly: string;
    chatWidget: string;
    whatsappChat: string;
    paymentGateway: string;
    liveChat: string;
    zapier: string;
    automationWorkflows: string;
  };
  legal: {
    privacyPolicy: string;
    termsConditions: string;
    cookiePolicy: string;
    gdprCompliance: string;
    ccpaCompliance: string;
    refundPolicy: string;
    shippingPolicy: string;
    disclaimer: string;
  };
  technical: {
    domain: string;
    hosting: string;
    dns: string;
    ssl: string;
    emailSetup: string;
    notFoundPage: string;
    robotsTxt: string;
    sitemap: string;
    environmentNotes: string;
  };
  qa: {
    brokenLinks: string;
    imageErrors: string;
    consoleErrors: string;
    crossBrowserTesting: string;
    mobileTesting: string;
    formTesting: string;
    speedTesting: string;
    seoAudit: string;
    accessibilityAudit: string;
    finalProofreading: string;
  };
};

export const defaultWebsiteEditorContent: WebsiteEditorContent = {
  branding: {
    companyName: "Community Lead Assistant",
    shortName: "Community Lead",
    tagline: "Find high-intent leads inside communities.",
    slogan: "Lead intelligence, not spam automation.",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#2563eb",
    secondaryColor: "#020617",
    accentColor: "#10b981",
    headingFont: "Inter",
    bodyFont: "Inter",
    brandGuidelines: "Premium blue/black SaaS style with clean spacing, high contrast, and manual-outreach safety language."
  },
  navigation: {
    headerMenu: [
      { label: "Features", href: "/features", visible: true },
      { label: "Solutions", href: "/solutions", visible: true },
      { label: "Pricing", href: "/pricing", visible: true },
      { label: "Resources", href: "/resources", visible: true },
      { label: "Blog", href: "/blog", visible: true },
      { label: "Documentation", href: "/docs", visible: true },
      { label: "Extension", href: "/extension", visible: true },
      { label: "Customers", href: "/customers", visible: true }
    ],
    footerMenu: [
      { label: "Privacy Policy", href: "/privacy", visible: true },
      { label: "Terms", href: "/terms", visible: true },
      { label: "Security", href: "/security", visible: true },
      { label: "Contact", href: "/contact", visible: true }
    ],
    ctaLabel: "Start Free Trial",
    ctaHref: "/signup",
    stickyHeader: true,
    megaMenuEnabled: false,
    mobileMenuEnabled: true,
    breadcrumbsEnabled: false
  },
  hero: {
    headline: "Find high-intent leads inside communities.",
    subheadline: "Lead intelligence, not spam automation",
    description: "Community Lead Assistant helps freelancers, agencies, founders, and growth teams scan visible community posts, score buyer intent, generate reviewed outreach drafts, and manage follow-ups from one polished dashboard.",
    primaryCtaLabel: "Start 7-day trial",
    primaryCtaHref: "/signup",
    secondaryCtaLabel: "Download extension",
    secondaryCtaHref: "/download-extension",
    backgroundMediaUrl: "",
    illustrationUrl: "",
    animationEnabled: true,
    trustBadges: ["Manual outreach only", "Visible content scanning", "Workspace sync"],
    clientLogos: ["Freelancers", "Small agencies", "Founder-led teams", "Growth consultants", "SDR teams"],
    ratingText: "Built for safe community lead discovery"
  },
  content: {
    sectionOrder: ["hero", "trusted-by", "preview", "extension", "workflow", "ai", "pricing", "faq", "cta"],
    editableSections: {},
    aboutUs: "Community Lead Assistant is a lead intelligence and manual outreach drafting platform.",
    mission: "Help teams find qualified community leads without spam automation.",
    vision: "Make community lead discovery safer, clearer, and easier for service businesses.",
    companyStory: "Built for freelancers, agencies, founders, and growth teams.",
    teamContent: "",
    terms: "",
    privacyPolicy: "",
    refundPolicy: ""
  },
  media: {
    heroImages: [],
    serviceImages: [],
    teamPhotos: [],
    officePhotos: [],
    portfolioImages: [],
    productImages: [],
    icons: [],
    backgroundImages: [],
    testimonialPhotos: [],
    galleryImages: [],
    videos: {}
  },
  buttons: {
    borderRadius: "12px",
    hoverEffect: "subtle lift",
    animation: "fast ease",
    primaryColor: "#2563eb",
    secondaryColor: "#ffffff"
  },
  forms: {
    contactSuccessMessage: "Thanks, we will reply soon.",
    contactErrorMessage: "Something went wrong. Please try again.",
    newsletterSuccessMessage: "You are subscribed.",
    quoteFormEnabled: false,
    bookingFormEnabled: false,
    popupFormsEnabled: false,
    emailNotificationsTo: "support@communityleadassistant.com",
    captchaEnabled: false
  },
  contact: {
    email: "support@communityleadassistant.com",
    phone: "",
    whatsapp: "",
    address: "",
    googleMapsUrl: "",
    workingHours: "Monday-Friday",
    emergencyContact: ""
  },
  socials: {
    facebook: "",
    instagram: "",
    linkedIn: "",
    x: "",
    youtube: "",
    pinterest: "",
    threads: "",
    github: "",
    discord: "",
    telegram: ""
  },
  services: {
    serviceList: ["Lead discovery", "Lead scoring", "Manual outreach drafts", "Follow-up review queue", "Chrome extension"],
    pricingSummary: "7-day trial, then paid plan.",
    features: ["Visible scanning", "Manual review", "Gemini drafts", "CSV export", "Admin analytics"],
    process: ["Configure", "Scan", "Qualify", "Draft", "Review", "Follow up"],
    packages: ["Starter", "Pro", "Agency"],
    deliverables: ["Saved leads", "Drafts", "Lead activity", "Exports"],
    industriesServed: ["Freelancers", "Agencies", "SaaS", "B2B services"]
  },
  portfolio: { projects: [], categories: [], caseStudies: [] },
  testimonials: { items: [] },
  team: { members: [] },
  blog: { categories: ["Growth", "Sales", "Communities", "Outreach"], defaultAuthor: "Community Lead Assistant", relatedPostsEnabled: true },
  footer: {
    copyright: "Community Lead Assistant. All rights reserved.",
    newsletterText: "Product updates, release notes, and safe community-growth guides.",
    certifications: [],
    paymentIcons: [],
    legalLinks: [
      { label: "Privacy Policy", href: "/privacy", visible: true },
      { label: "Terms", href: "/terms", visible: true },
      { label: "Cookie Policy", href: "/cookie-policy", visible: true },
      { label: "Security", href: "/security", visible: true }
    ]
  },
  seo: {
    metaTitle: "Community Lead Assistant",
    metaDescription: "Find high-intent leads inside communities and draft manual outreach safely.",
    keywords: ["community leads", "lead generation", "manual outreach", "Chrome extension"],
    canonicalUrl: "https://communityleadassistant.com",
    openGraphImage: "",
    twitterCardImage: "",
    schemaMarkup: {},
    robots: "index,follow",
    sitemapEnabled: true,
    redirects: []
  },
  performance: {
    imageCompression: true,
    lazyLoading: true,
    fontOptimization: true,
    caching: true,
    cdn: "Vercel",
    removeUnusedCode: true,
    coreWebVitalsTarget: "Good"
  },
  responsiveness: {
    desktop: true,
    laptop: true,
    tablet: true,
    mobile: true,
    largeMobile: true,
    landscapeMode: true,
    foldableDevices: false
  },
  animations: {
    scrollAnimations: true,
    hoverEffects: true,
    buttonAnimation: true,
    loadingAnimation: true,
    pageTransition: false,
    cursorEffects: false,
    microInteractions: true
  },
  accessibility: {
    altTextRequired: true,
    keyboardNavigation: true,
    contrastRatio: "WCAG AA",
    screenReaderSupport: true,
    focusStates: true,
    ariaLabels: true,
    formAccessibility: true
  },
  security: {
    httpsRequired: true,
    spamProtection: true,
    captcha: false,
    inputValidation: true,
    securityHeaders: true,
    backup: "Supabase backup policy",
    firewall: "Vercel platform protection"
  },
  analytics: {
    googleAnalyticsId: "",
    googleTagManagerId: "",
    searchConsole: "",
    metaPixelId: "",
    linkedInInsightTag: "",
    microsoftClarityId: "",
    heatmaps: "",
    conversionTracking: false,
    eventTracking: true
  },
  integrations: {
    crm: "",
    emailMarketing: "",
    calendly: "",
    chatWidget: "",
    whatsappChat: "",
    paymentGateway: "Stripe ready",
    liveChat: "",
    zapier: "",
    automationWorkflows: ""
  },
  legal: {
    privacyPolicy: "",
    termsConditions: "",
    cookiePolicy: "",
    gdprCompliance: "",
    ccpaCompliance: "",
    refundPolicy: "",
    shippingPolicy: "",
    disclaimer: ""
  },
  technical: {
    domain: "communityleadassistant.com",
    hosting: "Vercel",
    dns: "",
    ssl: "Managed by hosting provider",
    emailSetup: "support@communityleadassistant.com",
    notFoundPage: "/404",
    robotsTxt: "/robots.txt",
    sitemap: "/sitemap.xml",
    environmentNotes: "Use Vercel environment variables for production."
  },
  qa: {
    brokenLinks: "Pending audit",
    imageErrors: "Pending audit",
    consoleErrors: "Pending audit",
    crossBrowserTesting: "Pending audit",
    mobileTesting: "Pending audit",
    formTesting: "Pending audit",
    speedTesting: "Pending audit",
    seoAudit: "Pending audit",
    accessibilityAudit: "Pending audit",
    finalProofreading: "Pending audit"
  }
};

export function mergeWebsiteEditorContent(value: unknown): WebsiteEditorContent {
  return deepMerge(defaultWebsiteEditorContent, value) as WebsiteEditorContent;
}

function deepMerge(base: unknown, value: unknown): unknown {
  if (Array.isArray(base)) return Array.isArray(value) ? value : base;
  if (!base || typeof base !== "object") return value === undefined || value === null || value === "" ? base : value;

  const output: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  const incoming = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  for (const [key, baseValue] of Object.entries(base as Record<string, unknown>)) {
    output[key] = deepMerge(baseValue, incoming[key]);
  }
  for (const [key, incomingValue] of Object.entries(incoming)) {
    if (!(key in output)) output[key] = incomingValue;
  }
  return output;
}
