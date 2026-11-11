// The Google Ads search campaigns for hamdaz.com: one campaign per service area (src/data.mjs `categories`),
// one ad group per service, each sending people to that service's own page (/service/<slug>/).
// Edit here, then run `node docs/google-ads/build.mjs` to check Google's limits and write the import files.
//
// Google's limits (checked by build.mjs): headline 30 characters, description 90, display path 15 each,
// 3 to 15 headlines and 2 to 4 descriptions per responsive search ad.
// Keep every claim true: nothing here says "free", "best", "No. 1" or "official partner".

export const site = 'https://hamdaz.com/';
export const locations = ['United Arab Emirates'];
export const languages = 'en';

// on every ad (after the service and area lines)
export const shared = {
  headlines: ['Hamdaz Technologies', 'Abu Dhabi Based Team', 'ISO 9001 Certified', 'Request a Proposal Today', 'Talk to Our Engineers'],
  description: 'ISO 9001, 14001 and 45001 certified team in Abu Dhabi. Tell us what you need today.',
};

// searches nobody buying a service makes; added to every campaign as negative phrases
export const negatives = [
  'job', 'jobs', 'career', 'careers', 'vacancy', 'vacancies', 'salary', 'hiring', 'internship', 'resume', 'cv',
  'course', 'courses', 'tutorial', 'certification exam', 'how to', 'diy', 'free', 'download', 'pdf',
  'wikipedia', 'meaning', 'definition', 'what is', 'used', 'second hand', 'olx', 'dubizzle', 'amazon', 'noon',
];

// budget: AED per day. Each campaign starts paused, so nothing spends until you switch it on.
export const campaigns = {
  'elv-security': {
    budget: 50,
    headlines: ['MCC Certified Contractor', 'Design, Supply & Install', 'Support After Handover'],
    description: 'Abu Dhabi MCC certified contractor: site survey, design, installation, handover and AMC.',
  },
  cybersecurity: {
    budget: 45,
    headlines: ['UAE Cybersecurity Experts', 'Assess, Protect, Respond'],
    description: 'Assessments, Zero Trust, ransomware protection and a 24/7 AI-driven SOC for UAE firms.',
  },
  'audio-visual': {
    budget: 40,
    headlines: ['UAE Audio Visual Integrator', 'Design, Supply & Install', 'Programming & Support'],
    description: 'Audio visual design, supply, installation and programming across the UAE, with support.',
  },
  'software-development': {
    budget: 40,
    headlines: ['UAE Software Company', 'Built Around Your Business'],
    description: 'Custom software, ERP, CRM, LMS and mobile apps, built and set up around the way you work.',
  },
  'network-wifi': {
    budget: 30,
    headlines: ['Enterprise Network Experts', 'Survey, Design & Install'],
    description: 'Wired and wireless networks and structured cabling, designed, installed and monitored.',
  },
  'cloud-infrastructure': {
    budget: 30,
    headlines: ['Azure, AWS, GCP & OCI', 'Cloud & Infra Specialists'],
    description: 'Cloud migration and management on Azure, AWS, Google Cloud and Oracle, plus data centres.',
  },
  'ai-data': {
    budget: 25,
    headlines: ['AI Solutions for Business', 'From Idea to Production'],
    description: 'Generative AI, chatbots, analytics and automation that put your business data to work.',
  },
  staffing: {
    budget: 20,
    headlines: ['Skilled Engineers On Site', 'Measured Against SLAs'],
    description: 'Resident IT, AV and security engineers, project teams and outsourced IT operations.',
  },
  industry: {
    budget: 15,
    headlines: ['Technology for Your Sector'],
    description: 'Technology for schools, hospitals, retailers and farms, designed, set up and supported.',
  },
};

// one ad group per service. keywords: each runs as a phrase match; the first three also as exact match.
export const adGroups = {
  /* ---------------- ELV & Security */
  'cctv-video-surveillance': {
    path: ['cctv', 'abu-dhabi'],
    keywords: ['cctv installation abu dhabi', 'cctv company abu dhabi', 'mcc approved cctv', 'cctv installation uae', 'mcc cctv contractor', 'ip camera installation', 'cctv system for office', 'video surveillance company uae', 'cctv maintenance abu dhabi', 'cctv upgrade'],
    headlines: ['CCTV Installation Abu Dhabi', 'MCC Approved CCTV Systems', 'IP Cameras & Video Analytics', 'CCTV Design to Handover', 'Analogue to IP Upgrades', 'Control Room & Video Walls'],
    descriptions: ['MCC-compliant CCTV for offices, sites and facilities: coverage design, cameras, NVR, VMS.', 'Upgrade old analogue CCTV to compliant IP systems in phases, with minimal downtime.'],
  },
  'access-control-gate-barriers': {
    path: ['access-control', 'abu-dhabi'],
    keywords: ['access control system abu dhabi', 'access control installation uae', 'boom barrier abu dhabi', 'biometric access control', 'turnstile supplier uae', 'automatic gate installation', 'road blocker uae', 'time attendance system uae', 'visitor management system'],
    headlines: ['Access Control Systems', 'Biometric & Card Access', 'Turnstiles & Speed Gates', 'Boom Barriers & Gates', 'Road Blockers & Bollards', 'Time Attendance Systems'],
    descriptions: ['Card, mobile and biometric access control, turnstiles and visitor management for any site.', 'Boom barriers, automatic gates, road blockers and bollards, installed and serviced.'],
  },
  'anpr-intercom-car-parks': {
    path: ['anpr', 'parking'],
    keywords: ['anpr system abu dhabi', 'anpr camera uae', 'parking management system uae', 'number plate recognition system', 'car park system abu dhabi', 'video intercom installation', 'ip intercom system', 'uhf vehicle access', 'long range rfid parking'],
    headlines: ['ANPR Cameras & Software', 'Parking Management Systems', 'IP Video Intercom Systems', 'Long-Range UHF Vehicle Tags', 'Help Points & SOS Stations'],
    descriptions: ['Number-plate recognition, UHF tags and parking management for car parks and gated sites.', 'IP video intercom, help points and SOS stations, integrated with your access control.'],
  },
  'data-centre-power-cooling': {
    path: ['data-centre', 'build'],
    keywords: ['server room installation abu dhabi', 'data centre build uae', 'precision cooling uae', 'server room design', 'ups installation abu dhabi', 'data center containment', 'server rack installation', 'data centre fire suppression'],
    headlines: ['Server Room & Data Centre', 'UPS & Power Solutions', 'Precision Cooling Systems', 'Racks & Aisle Containment', 'Monitoring & Fire Suppression'],
    descriptions: ['Server rooms and data centres built end to end: racks, UPS, cooling and monitoring.', 'Power and cooling designed for uptime, with monitoring and room to grow.'],
  },

  /* ---------------- Cybersecurity */
  'managed-ai-secops': {
    path: ['managed-soc', '24-7'],
    keywords: ['managed soc uae', 'soc as a service', 'managed detection and response', '24/7 soc abu dhabi', 'mdr services uae', 'managed security services uae', 'security operations center uae', 'managed noc'],
    headlines: ['24/7 Managed SOC', 'Managed Detection & Response', 'AI-Driven Security Ops', 'Identity Threat Detection', 'Experts in the Loop 24/7'],
    descriptions: ['AI-native detection and response around the clock, with human experts in the loop.', 'Managed SOC, MDR, identity threat detection and anti-ransomware cover, 24/7.'],
  },
  'cyber-assessment-audit': {
    path: ['assessment', 'pen-testing'],
    keywords: ['penetration testing uae', 'cybersecurity assessment uae', 'iso 27001 gap analysis', 'penetration testing abu dhabi', 'cyber risk assessment', 'security audit company uae', 'nist csf assessment', 'vapt services uae'],
    headlines: ['Cybersecurity Assessment', 'Penetration Testing UAE', 'ISO 27001 Gap Analysis', 'NIST CSF 2.0 Assessment', 'Board-Ready Security Plan'],
    descriptions: ['Risk and gap analysis against ISO/IEC 27001 and NIST CSF 2.0, with penetration testing.', 'Get a clear, prioritised roadmap your board can act on, not just a list of findings.'],
  },
  'zero-trust-identity-data-security': {
    path: ['zero-trust', 'identity'],
    keywords: ['zero trust security uae', 'sase solutions uae', 'identity and access management uae', 'pam solution uae', 'mfa implementation', 'dlp solution uae', 'email security uae', 'next generation firewall abu dhabi', 'waf solution'],
    headlines: ['Zero Trust & SASE', 'IAM, PAM & MFA', 'Data Loss Prevention', 'Email Security', 'Next-Gen Firewalls', 'Protect Identity & Data'],
    descriptions: ['Zero Trust, SASE, identity, data loss prevention, email and web application security.', 'Protect users, data and apps wherever they work, designed, deployed and supported.'],
  },
  'ransomware-resilience': {
    path: ['ransomware', 'recovery'],
    keywords: ['ransomware protection uae', 'ransomware recovery', 'backup and disaster recovery uae', 'ransomware resilience', 'incident response uae', 'digital forensics uae', 'anti ransomware solution', 'ransomware attack help'],
    headlines: ['Ransomware Protection', 'Ransomware Recovery', 'Backup & Disaster Recovery', 'Incident Response & Forensics', 'Stop Encryption Early'],
    descriptions: ['Close the gap between endpoint controls and backups, with recovery assurance behind it.', 'Prevention, backup, disaster recovery and incident response from one UAE team.'],
  },
  'information-security-services': {
    path: ['cybersecurity', 'uae'],
    keywords: ['cybersecurity company abu dhabi', 'cyber security company uae', 'information security company uae', 'information security services abu dhabi', 'cybersecurity services uae', 'it security company abu dhabi', 'security consulting uae'],
    headlines: ['Cybersecurity Company UAE', 'Information Security Experts', 'Protect Sensitive Data', 'Compliance & Data Protection', 'Incident Response & IAM'],
    descriptions: ['Information security that protects sensitive data and supports regulatory compliance.', 'Penetration testing, incident response, forensics and identity and access management.'],
  },

  /* ---------------- Audio Visual */
  'meeting-rooms-video-conferencing': {
    path: ['meeting-rooms', 'uae'],
    keywords: ['meeting room solutions abu dhabi', 'video conferencing system uae', 'microsoft teams rooms uae', 'boardroom av solutions', 'zoom rooms installation', 'conference room setup abu dhabi', 'huddle room solutions', 'wireless presentation system'],
    headlines: ['Meeting Room Solutions', 'Video Conferencing Rooms', 'Microsoft Teams Rooms', 'Boardroom AV Design', 'Huddle to Boardroom', 'Wireless Presentation'],
    descriptions: ['Huddle rooms to boardrooms with certified Teams, Zoom, Webex and Google Meet room systems.', 'Cameras, audio, displays and one-touch control, set to a standard for every room.'],
  },
  'video-walls-digital-signage': {
    path: ['video-walls', 'signage'],
    keywords: ['led video wall uae', 'digital signage abu dhabi', 'video wall abu dhabi', 'digital signage company uae', 'led screen installation abu dhabi', 'command centre video wall', 'interactive display uae', 'lcd video wall'],
    headlines: ['LED Video Walls UAE', 'Digital Signage Solutions', 'Command Centre Displays', 'Fine-Pitch LED Screens', 'Interactive Displays', 'Supplied, Mounted, Calibrated'],
    descriptions: ['Fine-pitch LED and LCD video walls for lobbies, retail and control rooms, calibrated.', 'Digital signage for one screen or a whole network, supplied, installed and supported.'],
  },
  'pro-audio-pa-systems': {
    path: ['pa-systems', 'audio'],
    keywords: ['pa system installation uae', 'pa system abu dhabi', 'voice evacuation system uae', 'background music system', 'conference audio system', 'auditorium sound system', 'public address system installation', 'classroom audio system'],
    headlines: ['PA System Installation', 'Voice Evacuation Systems', 'Background Music Systems', 'Auditorium Sound Systems', 'Conference Room Audio', 'Tested & Commissioned'],
    descriptions: ['Speech, music, paging and voice evacuation systems, tuned for every room, hall and venue.', 'Clear conference and classroom audio, with testing and commissioning on every install.'],
  },
  'immersive-smart-spaces': {
    path: ['immersive', 'spaces'],
    keywords: ['ar vr company abu dhabi', 'vr solutions uae', 'holographic display uae', 'interactive experience centre', 'stage lighting installation uae', 'building automation abu dhabi', 'smart building solutions uae', 'immersive room'],
    headlines: ['Immersive & Smart Spaces', 'AR, VR & Mixed Reality', 'Holographic Displays', 'Stage & Architectural Light', 'Building Automation'],
    descriptions: ['AR, VR, holographic and interactive displays for experience centres, venues and events.', 'Stage and architectural lighting and building automation, designed and programmed.'],
  },
  'av-setup-meeting-room-solutions': {
    path: ['av', 'abu-dhabi'],
    keywords: ['av company abu dhabi', 'audio visual company uae', 'av installation abu dhabi', 'av integrator uae', 'audio visual solutions abu dhabi', 'av system design', 'smart meeting room', 'unified communications integration'],
    headlines: ['AV Company in Abu Dhabi', 'Audio Visual Integrator', 'AV System Design & Install', 'Smart Meeting Rooms', 'Unified Communications'],
    descriptions: ['Audio visual design and installation for offices, campuses and venues across the UAE.', 'Smart meeting rooms and unified communications that just work, with support after.'],
  },

  /* ---------------- Networking & Wi-Fi */
  'enterprise-networking-wifi': {
    path: ['wifi', 'networking'],
    keywords: ['wifi installation abu dhabi', 'enterprise networking uae', 'wireless network installation uae', 'office wifi solution', 'wifi survey', 'network switching and routing', 'network security abu dhabi', 'network upgrade'],
    headlines: ['Enterprise Wi-Fi Installation', 'Wi-Fi Surveys & Design', 'Routing & Switching', 'Network Security & Monitoring', 'Campus to Branch Networks'],
    descriptions: ['Wired and wireless networks that are fast, secure and monitored, from campus to branch.', 'Wi-Fi surveys and design first, then installation, migration and upgrades.'],
  },
  'network-services-cabling-structured-cabling': {
    path: ['cabling', 'fibre'],
    keywords: ['structured cabling abu dhabi', 'structured cabling uae', 'fiber optic cabling uae', 'network cabling company', 'cat6 cabling installation', 'data cabling abu dhabi', 'fibre optic installation abu dhabi', 'network installation company uae'],
    headlines: ['Structured Cabling UAE', 'Fibre Optic Cabling', 'Data Cabling Abu Dhabi', 'Network Design & Install', 'Network Performance Tuning'],
    descriptions: ['Structured copper and fibre cabling designed and installed for a reliable network.', 'Network design, installation and optimisation for offices, buildings and campuses.'],
  },

  /* ---------------- Cloud & Infrastructure */
  'cloud-services-migration': {
    path: ['cloud', 'migration'],
    keywords: ['cloud migration services uae', 'cloud migration abu dhabi', 'cloud consulting uae', 'multi cloud management', 'cloud strategy consulting', 'move to cloud', 'serverless architecture', 'cloud services company uae'],
    headlines: ['Cloud Migration Services', 'Cloud Strategy Consulting', 'Multi-Cloud Management', 'Seamless Cloud Moves', 'Serverless Architecture'],
    descriptions: ['Plan, migrate and run your workloads in the cloud, with seamless transitions.', 'Cloud strategy, migration and multi-cloud management for UAE organisations.'],
  },
  'partner-services-msft-azure-aws-gcp-oci': {
    path: ['cloud', 'azure-aws'],
    keywords: ['azure consulting abu dhabi', 'aws consulting uae', 'microsoft azure partner uae', 'aws partner uae', 'google cloud partner uae', 'oracle cloud partner uae', 'oci partner', 'cloud cost optimization'],
    headlines: ['Azure, AWS, GCP & OCI', 'Cloud Cost Optimisation', 'Cloud Adoption Planning', 'Managed Cloud Services', 'Azure & AWS Consulting'],
    descriptions: ['Get more from Azure, AWS, Google Cloud and Oracle: adoption, migration and cost control.', 'Managed services for your cloud platforms, so your team can focus on the business.'],
  },
  'data-center-infrastructure-services': {
    path: ['infrastructure', 'data-center'],
    keywords: ['it infrastructure services abu dhabi', 'data center services uae', 'it infrastructure company uae', 'server virtualization', 'data center design', 'edge computing solutions', 'infrastructure monitoring', 'hyperconverged infrastructure'],
    headlines: ['IT Infrastructure Services', 'Data Center Design', 'Server Virtualisation', 'Infrastructure Monitoring', 'Edge Computing Solutions'],
    descriptions: ['Data centre design, server virtualisation and infrastructure monitoring built for uptime.', 'Reliable, scalable IT infrastructure from core to edge, with monitoring and support.'],
  },
  'managed-services': {
    path: ['managed-it', 'support'],
    keywords: ['managed it services abu dhabi', 'managed it services uae', 'it support company abu dhabi', 'it support uae', 'remote it support', 'patch management services', 'it maintenance contract', 'managed service provider uae'],
    headlines: ['Managed IT Services', 'IT Support Abu Dhabi', 'Proactive Monitoring', 'Patch & Backup Management', 'Remote IT Support'],
    descriptions: ['Proactive monitoring, maintenance, patching and remote support for your IT systems.', 'Managed IT with backup and disaster recovery, built around how your business runs.'],
  },
  'it-ot-services': {
    path: ['it-ot', 'industrial'],
    keywords: ['scada system integration uae', 'industrial iot uae', 'it ot convergence', 'iiot solutions uae', 'scada company abu dhabi', 'legacy system modernization', 'cyber physical systems'],
    headlines: ['IT/OT Convergence', 'Industrial IoT Solutions', 'SCADA Deployment', 'Legacy System Modernisation', 'Connected Operations'],
    descriptions: ['Connect and optimise industrial operations with IIoT, SCADA and cyber-physical systems.', 'Modernise legacy systems in step with operations, with minimal disruption.'],
  },

  /* ---------------- Software Development */
  'custom-software-web-development': {
    path: ['software', 'web'],
    keywords: ['software company abu dhabi', 'custom software development uae', 'web development company abu dhabi', 'software development company uae', 'web portal development', 'business application development', 'api integration services'],
    headlines: ['Custom Software Development', 'Web Portals & Websites', 'Integrations & APIs', 'Built Around Your Workflow', 'Support & Enhancement'],
    descriptions: ['Business software, web portals and integrations built around the way you work.', 'Cloud-ready applications, with support and enhancements long after go-live.'],
  },
  'erp-solutions': {
    path: ['erp', 'implementation'],
    keywords: ['erp implementation uae', 'odoo implementation uae', 'erp software abu dhabi', 'sap implementation uae', 'zoho erp', 'erp consultant abu dhabi', 'erp company uae', 'odoo partner abu dhabi'],
    headlines: ['ERP Implementation UAE', 'SAP, Odoo & Zoho ERP', 'Finance, Stock, Sales & HR', 'Data Migration & Training', 'Support & Upgrades'],
    descriptions: ['ERP for finance, inventory, procurement, sales and HR, set up and supported end to end.', 'From ERP selection to data migration, training and upgrades, one team throughout.'],
  },
  'lms-elearning-platforms': {
    path: ['lms', 'elearning'],
    keywords: ['lms implementation uae', 'learning management system uae', 'lms for schools uae', 'corporate lms uae', 'elearning platform development', 'virtual classroom solution', 'lms company abu dhabi'],
    headlines: ['LMS Implementation', 'e-Learning Platforms', 'LMS for Schools & Unis', 'Corporate Training LMS', 'SSO & Integrations', 'Virtual Classrooms'],
    descriptions: ['Learning management systems for schools, universities and corporate training.', 'Set-up, courses, single sign-on, virtual classrooms, reports and hosting, all supported.'],
  },
  'zoho-sap-vodoo-crm-salesforce': {
    path: ['crm', 'implementation'],
    keywords: ['crm implementation uae', 'zoho crm implementation', 'salesforce consultant uae', 'zoho crm partner uae', 'crm software abu dhabi', 'odoo crm', 'sap crm', 'crm customization'],
    headlines: ['CRM Implementation UAE', 'Salesforce, Zoho & Odoo', 'CRM Customisation', 'Sales Process Automation', 'Data Migration & Training'],
    descriptions: ['CRM set up, customised and integrated around your sales process, with your data moved.', 'Salesforce, Zoho, SAP and Odoo CRM, with user training and support after go-live.'],
  },
  'mobile-app-development': {
    path: ['apps', 'mobile'],
    keywords: ['mobile app development abu dhabi', 'mobile app development uae', 'app development company uae', 'app developers abu dhabi', 'ios app development', 'android app development', 'flutter app development', 'enterprise mobile apps'],
    headlines: ['Mobile App Development', 'iOS & Android Apps', 'Cross-Platform Apps', 'UI & UX Design', 'Enterprise Mobile Apps', 'Secure by Design'],
    descriptions: ['Native and cross-platform apps for iOS and Android, from UX design to launch.', 'Enterprise mobile solutions with security built in, plus support after release.'],
  },

  /* ---------------- AI, Data & Automation */
  'generative-ai': {
    path: ['ai', 'generative-ai'],
    keywords: ['generative ai company uae', 'ai company abu dhabi', 'ai consulting abu dhabi', 'generative ai solutions', 'custom gpt for business', 'ai development company uae', 'llm solutions', 'deepfake detection'],
    headlines: ['Generative AI Solutions', 'AI Consulting Abu Dhabi', 'Custom GPT for Your Business', 'AI Content & Design Tools', 'Deepfake Detection'],
    descriptions: ['Generative AI for content, design and assistants, built around your business data.', 'From first use case to production, plus deepfake detection to keep you protected.'],
  },
  'bot-services': {
    path: ['chatbots', 'ai'],
    keywords: ['chatbot development uae', 'ai chatbot for business', 'chatbot company abu dhabi', 'whatsapp chatbot uae', 'voice bot development', 'virtual assistant development', 'customer service chatbot'],
    headlines: ['AI Chatbot Development', 'Voice-Enabled Bots', 'Web & WhatsApp Chatbots', 'Virtual Assistants', 'Bot Analytics & Insights'],
    descriptions: ['Chatbots and virtual assistants that answer customers on web, mobile and messaging.', 'Voice-enabled bots, multi-channel integration and analytics that show what works.'],
  },
  'data-analytics-predictive-services': {
    path: ['analytics', 'data'],
    keywords: ['data analytics company uae', 'business intelligence abu dhabi', 'predictive analytics', 'data warehouse solutions', 'big data analytics uae', 'data visualization services'],
    headlines: ['Data Analytics Services', 'Predictive Analytics', 'Dashboards & Visualisation', 'Data Warehousing', 'Big Data Processing'],
    descriptions: ['Turn your data into decisions with warehousing, dashboards and predictive models.', 'Data integration, visualisation and big data processing for informed decisions.'],
  },
  'business-process-automation-and-digital-transformation-services': {
    path: ['automation', 'digital'],
    keywords: ['digital transformation company uae', 'business process automation uae', 'digital transformation abu dhabi', 'workflow automation', 'process improvement consulting', 'business process mapping', 'change management consulting'],
    headlines: ['Business Process Automation', 'Digital Transformation UAE', 'Process Mapping & Analysis', 'Change Management', 'Continuous Improvement'],
    descriptions: ['Map, automate and improve business processes to cut manual work and drive efficiency.', 'Digital transformation with change management, so new ways of working stick.'],
  },
  'rpa-robotic-process-automation': {
    path: ['rpa', 'automation'],
    keywords: ['rpa services uae', 'robotic process automation uae', 'rpa company abu dhabi', 'rpa implementation', 'rpa bot maintenance'],
    headlines: ['RPA Implementation', 'Robotic Process Automation', 'Automation Assessment', 'RPA Tool Selection', 'Bot Monitoring & Upkeep'],
    descriptions: ['Find the processes worth automating, pick the right RPA tool, then build and run the bots.', 'Workflow integration plus ongoing bot monitoring and maintenance after go-live.'],
  },
  'digital-twin': {
    path: ['digital-twin', 'iot'],
    keywords: ['digital twin company uae', 'digital twin solutions', 'digital twin abu dhabi', 'predictive maintenance solutions', 'iot simulation', 'supply chain digital twin'],
    headlines: ['Digital Twin Solutions', 'Predictive Maintenance', 'IoT Integration', 'Simulation & Modelling', 'Supply Chain Optimisation'],
    descriptions: ['Digital replicas of assets and operations, fed by IoT data, for simulation and planning.', 'Predict maintenance needs and optimise your supply chain with a live digital twin.'],
  },

  /* ---------------- Industry Solutions */
  'education-services': {
    path: ['education', 'schools'],
    keywords: ['school it solutions uae', 'education technology uae', 'student information system uae', 'sis implementation', 'virtual classroom solutions', 'edtech company abu dhabi', 'e learning content development'],
    headlines: ['Technology for Schools', 'Student Information Systems', 'Virtual Classroom Solutions', 'LMS Integration', 'e-Learning Content'],
    descriptions: ['LMS, student information systems and virtual classrooms for schools and universities.', 'e-Learning content development and integrations that make learning easier to run.'],
  },
  'healthcare-services': {
    path: ['healthcare', 'it'],
    keywords: ['healthcare it solutions uae', 'ehr implementation uae', 'emr system abu dhabi', 'telemedicine solutions uae', 'healthcare analytics', 'hospital it services', 'healthcare cybersecurity'],
    headlines: ['Healthcare IT Solutions', 'EHR Implementation', 'Telemedicine Integration', 'Healthcare Analytics', 'Healthcare Cybersecurity'],
    descriptions: ['Electronic health records, telemedicine and analytics for clinics and hospitals.', 'Keep patient data secure with cybersecurity built for healthcare providers.'],
  },
  'retail-implementation-services': {
    path: ['retail', 'pos'],
    keywords: ['retail pos system uae', 'retail technology solutions uae', 'inventory management system uae', 'pos integration', 'ecommerce integration uae', 'loyalty program software'],
    headlines: ['Retail Technology Solutions', 'POS System Integration', 'Inventory Management', 'E-commerce Integration', 'Customer Loyalty Programs'],
    descriptions: ['POS, inventory and e-commerce integration so stores and online sales work as one.', 'Customer loyalty programmes and retail systems, implemented and supported.'],
  },
  'smart-farming': {
    path: ['smart-farming', 'agritech'],
    keywords: ['smart farming uae', 'agritech solutions uae', 'automated irrigation system uae', 'precision agriculture uae', 'smart irrigation abu dhabi', 'agriculture drones uae', 'farm monitoring system'],
    headlines: ['Smart Farming Solutions', 'Precision Agriculture', 'Automated Irrigation', 'Crop Monitoring by Drone', 'Weather Data Integration'],
    descriptions: ['Precision agriculture, automated irrigation and drone crop monitoring for UAE farms.', 'Use weather and field data to save water and grow more with less effort.'],
  },

  /* ---------------- Staffing & Outsourcing */
  'it-staffing-resident-engineers': {
    path: ['staffing', 'engineers'],
    keywords: ['it staffing company uae', 'it manpower supply abu dhabi', 'resident engineer services', 'it manpower outsourcing uae', 'onsite it engineer', 'it contract staffing uae', 'av technician hire', 'event av engineers'],
    headlines: ['IT Staffing Services UAE', 'Resident Engineers On Site', 'IT Manpower Supply', 'Project & Event Engineers', 'IT, AV & Security Engineers'],
    descriptions: ['Skilled IT, AV and security engineers placed on your site for operations and projects.', 'Resident engineers, project teams, event engineers and offshore delivery from India.'],
  },
  'it-outsourcing-managed-operations': {
    path: ['outsourcing', 'it-amc'],
    keywords: ['it outsourcing uae', 'it amc abu dhabi', 'it outsourcing abu dhabi', 'outsourced service desk', 'it amc uae', '24/7 noc services', 'it support contract uae', 'managed it operations'],
    headlines: ['IT Outsourcing UAE', 'Service Desk Outsourcing', 'IT AMC & SLA Support', '24/7 NOC Monitoring', 'Monthly Service Reviews'],
    descriptions: ['Hand us the day-to-day: service desk, 24/7 monitoring and support contracts.', 'Every contract measured against SLAs, with monthly service reviews you can act on.'],
  },
};
