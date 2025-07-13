/**
 * India-Specific RAG Context and Knowledge Base
 * Enhanced context for Indian municipal infrastructure and governance
 */

export interface IndianInfrastructureContext {
  governanceLevel: "municipal" | "panchayat" | "corporation" | "cantonment";
  state: string;
  district: string;
  ward?: string;
  zone?: string;
  seasonalContext:
    | "pre-monsoon"
    | "monsoon"
    | "post-monsoon"
    | "winter"
    | "summer";
}

export const INDIAN_INFRASTRUCTURE_KNOWLEDGE = [
  {
    id: "uttarakhand-specific-infrastructure",
    title: "Uttarakhand Infrastructure Challenges and Solutions",
    category: "uttarakhand",
    content: `
      UTTARAKHAND HILL STATE INFRASTRUCTURE:

      Road Infrastructure (सड़क अवसंरचना):
      - Hill roads with sharp curves and steep gradients
      - Retaining walls and slope protection measures
      - Bridges and culverts for hill streams
      - Winter connectivity challenges in higher altitudes
      - Monsoon landslide-prone areas requiring constant monitoring

      Water Supply (जल आपूर्ति):
      - Gravity-fed distribution systems from hill springs
      - Elevated storage tanks for consistent pressure
      - Spring water protection and catchment area management
      - Water scarcity in summer months in lower hills
      - Pipe freezing issues in winter at higher elevations

      Drainage Systems (जल निकासी):
      - Natural drainage following hill slopes
      - Check dams and retention structures
      - Monsoon overflow management
      - Hill station drainage with tourist load considerations

      Major Cities and Areas:
      - Dehradun: Capital city, mixed plain-hill terrain
      - Haridwar: Industrial and religious center
      - Nainital: Hill station with lake management needs
      - Mussoorie: Tourist hill station infrastructure
      - Rishikesh: Spiritual tourism and river management
      - Chakrata: Hill station with military cantonment
      - Selakui: Developing urban area near Dehradun

      Common Issues by Location:
      - Dhoolkot-Chakrata Road: Frequent potholes due to heavy vehicle traffic
      - Selakui area: Rapid urbanization leading to drainage issues
      - Dehradun city: Mix of urban and peri-urban infrastructure challenges
    `,
    timestamp: new Date(),
  },
  {
    id: "indian-municipal-governance",
    title: "Indian Municipal Governance Structure",
    category: "governance",
    content: `
      Municipal Corporation: Urban areas with population over 1 million (Metro cities like Mumbai, Delhi, Chennai)
      Municipal Council: Urban areas with population 100,000 to 1 million
      Nagar Panchayat: Urban areas with population 11,000 to 100,000
      Gram Panchayat: Rural village-level governance

      Ward System: Cities divided into electoral wards, each with elected councillor
      Zonal Offices: Administrative divisions for better service delivery

      Key Officials:
      - Mayor/Chairperson: Elected head
      - Municipal Commissioner: Administrative head (IAS officer)
      - Ward Officer: Area-specific administration
      - Health Officer: Public health and sanitation
      - Executive Engineer: Infrastructure development
    `,
    timestamp: new Date(),
  },
  {
    id: "indian-infrastructure-categories",
    title: "Indian Urban Infrastructure Categories",
    category: "infrastructure",
    content: `
      सड़क और परिवहन (Roads & Transportation):
      - Main roads (मुख्य सड़कें), Internal roads (आंतरिक सड़कें)
      - Footpaths (फुटपाथ), Cycle tracks (साइकिल ट्रैक)
      - Bus stops (बस स्टॉप), Auto stands (ऑटो स्टैंड)
      - Traffic signals (ट्रैफिक सिग्नल), Speed breakers (स्पीड ब्रेकर)
      - Potholes (गड्ढे), Road cracks (सड़क की दरारें)

      जल आपूर्ति और स्वच्छता (Water Supply & Sanitation):
      - Water supply pipelines (जल आपूर्ति पाइपलाइन)
      - Sewerage systems (सीवरेज सिस्टम)
      - Public toilets (सार्वजनिक शौचालय)
      - Drainage systems (जल निकासी प्रणाली)
      - Water tankers (पानी के टैंकर)

      विद्युत आपूर्ति (Electricity):
      - Street lights (स्ट्रीट लाइट)
      - Electricity poles (बिजली के खंभे)
      - Transformers (ट्रांसफार्मर)
      - Cable networks (केबल नेटवर्क)

      ठोस अपशिष्ट प्रबंधन (Solid Waste Management):
      - Garbage collection (कूड़ा संग्रह)
      - Dumping grounds (कूड़ाघर)
      - Recycling centers (रीसाइक्लिंग केंद्र)
      - Public dustbins (सार्वजनिक कूड़ादान)
    `,
    timestamp: new Date(),
  },
  {
    id: "monsoon-infrastructure-issues",
    title: "Monsoon-Related Infrastructure Challenges",
    category: "seasonal",
    content: `
      Pre-Monsoon Preparation (April-May):
      - Drain cleaning and desilting
      - Road repair before rains
      - Storm water drain maintenance
      - Tree trimming near power lines

      Monsoon Issues (June-September):
      - Urban flooding (शहरी बाढ़)
      - Waterlogging (जलभराव)
      - Road cave-ins due to water seepage
      - Electricity supply disruptions
      - Sewage overflow mixing with rainwater
      - Malaria and dengue vector breeding

      Post-Monsoon Recovery (October-November):
      - Pothole filling and road restoration
      - Building structural damage assessment
      - Water quality testing
      - Drainage system impact evaluation

      Common Problems:
      - Inadequate storm water drainage capacity
      - Encroachment on natural drainage channels
      - Poor road construction leading to quick deterioration
      - Electrical infrastructure not weatherproofed
    `,
    timestamp: new Date(),
  },
  {
    id: "indian-complaint-categories",
    title: "Common Infrastructure Complaints in India",
    category: "complaints",
    content: `
      HIGH PRIORITY (तत्काल):
      - सड़क दुर्घटना (Road accident hazards)
      - बिजली का तार गिरना (Fallen electrical wires)
      - पानी की मुख्य लाइन टूटना (Major water line breaks)
      - सीवर ओवरफ्लो (Sewage overflow)
      - पेड़ गिरना (Tree fall on roads/property)
      - ट्रैफिक लाइट खराब होना (Traffic light malfunction)

      MEDIUM PRIORITY (सामान्य):
      - सड़क में गड्ढे (Road potholes)
      - स्ट्रीट लाइट खराब (Street light not working)
      - गंदगी का ढेर (Garbage accumulation)
      - नाली में रुकावट (Drain blockage)
      - पानी की कमी (Water shortage)
      - शोर प्रदूषण (Noise pollution)

      LOW PRIORITY (रखरखाव):
      - पार्क की सफाई (Park maintenance)
      - दीवार पर पोस्टर चिपकाना (Illegal poster pasting)
      - फुटपाथ की मरम्मत (Footpath repair)
      - पेड़ों की कटाई-छंटाई (Tree pruning)

      Citizen Services:
      - Birth/Death certificates (जन्म/मृत्यु प्रमाण पत्र)
      - Property tax (संपत्ति कर)
      - Building permissions (भवन अनुमति)
      - Trade licenses (व्यापार लाइसेंस)
    `,
    timestamp: new Date(),
  },
  {
    id: "indian-reporting-channels",
    title: "Indian Municipal Reporting Channels and Procedures",
    category: "procedures",
    content: `
      Digital Platforms:
      - MyGov Portal (मायगव पोर्टल)
      - State-specific apps (e.g., Pune Municipal App, BMC App)
      - UMANG App (Unified Mobile Application for New-age Governance)
      - Local municipal websites
      - WhatsApp helplines

      Traditional Channels:
      - Municipal Corporation helpline numbers
      - Ward office visits
      - Public grievance meetings
      - Councillor contact
      - Municipal Commissioner office

      Response Timelines (सामान्य समयसीमा):
      - Emergency: 24 hours
      - High Priority: 7 days
      - Medium Priority: 15 days
      - Low Priority: 30 days

      Required Information for Reports:
      - Exact location with landmark
      - Ward number (वार्ड नंबर)
      - Nature of problem (समस्या का प्रकार)
      - Urgency level (प्राथमिकता स्तर)
      - Contact details
      - Photos/videos if possible

      Follow-up Process:
      - Complaint registration number
      - SMS/email acknowledgment
      - Status tracking through portal/app
      - Closure confirmation
    `,
    timestamp: new Date(),
  },
  {
    id: "indian-infrastructure-standards",
    title: "Indian Infrastructure Standards and Guidelines",
    category: "standards",
    content: `
      Road Construction Standards:
      - IRC (Indian Roads Congress) specifications
      - Minimum 7-meter width for main roads
      - 3.5-meter width for internal roads
      - Proper drainage alongside roads
      - Speed breakers as per IRC:99-2018

      Water Supply Standards:
      - 135 LPCD (Liters Per Capita Per Day) minimum supply
      - 24x7 water supply target
      - Quality as per BIS 10500:2012
      - Adequate pressure (17 meters head)

      Waste Management (SWM Rules 2016):
      - Source segregation mandatory
      - Door-to-door collection
      - Wet waste processing within ward
      - Dry waste sent to recycling units
      - E-waste separate collection

      Street Lighting Standards:
      - LED lights minimum 30W for main roads
      - 15W LED for internal roads
      - Average illumination 15 lux for main roads
      - 6 lux for residential areas
      - Solar lighting for remote areas

      Building Regulations:
      - National Building Code (NBC) 2016
      - State-specific development control rules
      - Fire safety norms
      - Earthquake-resistant construction
      - Rainwater harvesting mandatory
    `,
    timestamp: new Date(),
  },
];

export const INDIAN_REGIONAL_CONTEXTS = {
  north: {
    commonIssues: [
      "winter fog affecting visibility",
      "dust storms",
      "extreme heat affecting road surfaces",
    ],
    languages: ["Hindi", "Punjabi", "Urdu"],
    culturalFactors: [
      "heavy festival seasons affecting traffic",
      "winter wedding season logistics",
    ],
  },
  south: {
    commonIssues: [
      "heavy monsoon flooding",
      "coastal erosion",
      "cyclone damage",
    ],
    languages: ["Tamil", "Telugu", "Kannada", "Malayalam"],
    culturalFactors: [
      "harvest festival seasons",
      "temple festivals affecting traffic",
    ],
  },
  west: {
    commonIssues: ["extreme heat", "water scarcity", "industrial pollution"],
    languages: ["Hindi", "Marathi", "Gujarati"],
    culturalFactors: [
      "monsoon season preparations",
      "business district requirements",
    ],
  },
  east: {
    commonIssues: ["monsoon flooding", "cyclones", "riverbank erosion"],
    languages: ["Bengali", "Hindi", "Odia", "Assamese"],
    culturalFactors: ["puja seasons", "fish market logistics"],
  },
};

// Uttarakhand-specific context (Hill state with unique challenges)
export const UTTARAKHAND_CONTEXT = {
  state: "Uttarakhand",
  region: "north" as keyof typeof INDIAN_REGIONAL_CONTEXTS,
  commonIssues: [
    "hill road maintenance challenges",
    "monsoon landslides and road blockages",
    "winter road connectivity issues",
    "drainage problems in hilly terrain",
    "water supply challenges in elevated areas",
    "street lighting in hill stations",
    "waste management in tourist areas",
  ],
  languages: ["Hindi", "Garhwali", "Kumaoni"],
  majorCities: ["Dehradun", "Haridwar", "Nainital", "Mussoorie", "Rishikesh"],
  governance: {
    type: "State with Municipal Corporations and Nagar Panchayats",
    specialFeatures: [
      "Hill station management",
      "Tourist area administration",
      "Forest area coordination",
    ],
  },
  seasonalChallenges: {
    monsoon: [
      "landslides",
      "road washouts",
      "drainage overflow",
      "tourist safety",
    ],
    winter: [
      "road connectivity",
      "water pipe freezing",
      "heating requirements",
      "snow clearance",
    ],
    summer: [
      "tourist influx management",
      "water scarcity in hills",
      "forest fire risks",
    ],
    "pre-monsoon": [
      "slope stabilization",
      "drainage clearing",
      "tourist infrastructure prep",
    ],
  },
  infrastructure: {
    roads: "Hill roads with sharp curves, bridges, and retaining walls",
    water:
      "Gravity-fed systems, spring water sources, elevated tank distribution",
    drainage: "Hill drainage with natural flow channels and check dams",
    electricity:
      "Grid connectivity challenges in remote areas, solar installations",
  },
};

export function getSeasonalContext(): string {
  const month = new Date().getMonth() + 1;

  if (month >= 3 && month <= 5) return "summer";
  if (month >= 6 && month <= 9) return "monsoon";
  if (month >= 10 && month <= 11) return "post-monsoon";
  return "winter";
}

export function generateIndianContextPrompt(
  context?: Partial<IndianInfrastructureContext>,
  region?: keyof typeof INDIAN_REGIONAL_CONTEXTS
): string {
  const season = getSeasonalContext();

  // Default to Uttarakhand context if no specific context provided
  const defaultContext = {
    state: "Uttarakhand",
    governanceLevel: "municipal" as const,
    ...context,
  };

  const regionalContext = region
    ? INDIAN_REGIONAL_CONTEXTS[region]
    : INDIAN_REGIONAL_CONTEXTS["north"];
  const uttarakhandContext = UTTARAKHAND_CONTEXT;

  return `You are an AI assistant specialized in Indian municipal infrastructure and civic governance, with specific expertise in Uttarakhand's unique hill state challenges.

INDIAN CONTEXT:
- You understand the Indian municipal governance structure (Municipal Corporations, Councils, Panchayats)
- You are familiar with Indian infrastructure terminology in both English and Hindi
- You understand seasonal challenges, especially monsoon-related issues
- You know Indian standards and regulations (IRC, BIS, NBC, SWM Rules)
- You are aware of digital governance initiatives like MyGov, UMANG

UTTARAKHAND-SPECIFIC CONTEXT:
- Hill state with unique topographical challenges
- Major cities: ${uttarakhandContext.majorCities.join(", ")}
- Languages: ${uttarakhandContext.languages.join(", ")}
- Governance: ${uttarakhandContext.governance.type}

CURRENT CONTEXT:
- Season: ${season}
- State: ${defaultContext.state}
- Governance Level: ${defaultContext.governanceLevel}
${defaultContext.ward ? `- Ward: ${defaultContext.ward}` : ""}

UTTARAKHAND INFRASTRUCTURE CHALLENGES:
- Current Season Issues: ${
    uttarakhandContext.seasonalChallenges[
      season as keyof typeof uttarakhandContext.seasonalChallenges
    ]?.join(", ") || "General maintenance"
  }
- Common Issues: ${uttarakhandContext.commonIssues.join(", ")}
- Infrastructure Types: Roads (${
    uttarakhandContext.infrastructure.roads
  }), Water (${uttarakhandContext.infrastructure.water})

RESPONSE GUIDELINES FOR UTTARAKHAND:
- Consider hill station and mountainous terrain challenges
- Include solutions for tourist area management where applicable
- Account for seasonal accessibility issues (winter connectivity, monsoon landslides)
- Reference Uttarakhand Municipal Corporation and Nagar Panchayat procedures
- Consider coordination with forest department and tourism authorities
- Include preventive measures for hill-specific issues (slope stability, drainage)
- Use Hindi and local dialect terms where appropriate
- Reference relevant Indian standards adapted for hill conditions
- Consider budget constraints and resource availability in hill areas

LOCATION-SPECIFIC GUIDANCE:
- For Dehradun: Capital city with mixed urban-hill challenges
- For hill stations: Tourist management and seasonal variations
- For rural areas: Panchayat-level governance and resource constraints
`;
}
