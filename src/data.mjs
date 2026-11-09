// Site content, taken from the original hamdaz.com pages.
// Only obvious typos were fixed (spacing, "Vodoo" → "Odoo").
// Edit here, then run `node build.mjs` to regenerate the HTML pages.

export const site = {
  name: 'Hamdaz Technologies',
  short: 'Hamdaz',
  url: 'https://hamdaz.com',
  description:
    'Hamdaz redefine excellence in Managed Software Services. With a focus on innovation and efficiency, we offer a comprehensive suite of solutions tailored to meet the diverse needs of businesses across various industries.',
};

// Careers: open roles come live from the Hamdaz ERP (hamdaz-2.0, app/hr/public.py). When HR posts an
// opening there and ticks "publicly listed", it shows on careers.html with no rebuild; its application
// form is the one HR set up in the ERP, and applications go straight back into the ERP.
//   api: the ERP's public address (its PUBLIC_BASE_URL). Only /careers/openings and /apply/<token> are used.
export const careers = {
  api: 'https://hamdaz2-h4ajc0d0a3h9fwfa.centralus-01.azurewebsites.net',
};

export const contact = {
  email: 'hello@hamdaz.com',
  whatsapp: '919207773300',
  whatsappDisplay: '+91 9207773300',
  linkedin: 'https://www.linkedin.com/company/hamdaz-technologies/',
  heading: 'Connect with HAMDAZ – Where Passion Meets Technology, and Your Success is Our Mission!',
  offices: [
    {
      id: 'uae',
      region: 'UAE',
      city: 'Abu Dhabi',
      tz: 'Asia/Dubai',
      tzLabel: 'GST',
      lat: 24.4539,
      lon: 54.3773,
      coords: '24.45° N · 54.38° E',
      entity: 'HAMDAZTECH TECHNOLOGY SERVICES LLC',
      lines: ['PO Box. 5758, Office 22 | 2nd Floor,', 'Millennium Tower, OPP. Hamdan Centre,', 'Hamdan Street, Abu Dhabi, U. A. E.'],
      phones: [
        { label: '+971 23090211', tel: '+97123090211' },
        { label: '+971 26265780', tel: '+97126265780' },
      ],
      map: 'https://www.google.com/maps/search/?api=1&query=Millennium+Tower+Hamdan+Street+Abu+Dhabi',
      postal: { street: 'Office 22, 2nd Floor, Millennium Tower, Hamdan Street', locality: 'Abu Dhabi', region: 'Abu Dhabi', pobox: '5758', country: 'AE' },
    },
    {
      id: 'india',
      region: 'INDIA',
      city: 'India',
      tz: 'Asia/Kolkata',
      tzLabel: 'IST',
      lat: 11.2588,
      lon: 75.7804,
      coords: 'Kerala',
      entity: 'HAMDAZ TECHNOLOGIES LLP',
      lines: ['1st Floor, Raha Lavender,', 'Near East Hill Junction, Kozhikode,', 'Kerala, India 673005'],
      phones: [{ label: '+91 9207773300', tel: '+919207773300' }],
      map: 'https://www.google.com/maps/search/?api=1&query=Raha+Lavender+East+Hill+Kozhikode',
      postal: { street: '1st Floor, Raha Lavender, Near East Hill Junction', locality: 'Kozhikode', region: 'Kerala', code: '673005', country: 'IN' },
    },
  ],
};

// Labelled nodes on the AI chip in the first section (positions are in assets/js/earth.js, ANCHORS).
// side: 'left' puts the label to the left of its node.
export const heroNodes = [
  { id: 'ai', title: 'Generative AI', text: 'Custom GPT · Bots', tag: 'Node 01', side: 'left' },
  { id: 'cloud', title: 'Cloud', text: 'Azure · AWS · GCP · OCI', tag: 'Node 02', side: 'left' },
  { id: 'data', title: 'Data & Analytics', text: 'Predictive insight', tag: 'Node 03' },
  { id: 'security', title: 'Security', text: 'Information security', tag: 'Node 04', side: 'left' },
];

export const waLink = (text) =>
  `https://wa.me/${contact.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

// The four hero slides from the original homepage slider
export const heroSlides = [
  { title: 'Delivering the Digital Future', text: 'Pioneering Tomorrow: Unleashing the Power of AI for a Bold Future' },
  { title: 'TechCraft Innovations', text: 'Spearheading Intelligent Solutions with Cutting-Edge Technologies' },
  { title: 'Streamlined Excellence', text: 'AI Software Services, Expertly Managed for Optimal Performance' },
  { title: 'Join the Hamdaz Team', text: 'Elevate your career with innovation – Join our dynamic team!' },
];

export const helpCta = {
  title: 'How can we help your Business?',
  text: 'We can provide the best quality service with the most competitive rates',
  button: 'Contact Now',
};

export const whoWeAre = {
  eyebrow: 'Who We Are',
  title: 'HAMDAZ Technologies',
  text:
    "Welcome to Hamdaz, where we redefine excellence in Managed Software Services. With a focus on innovation and efficiency, we offer a comprehensive suite of solutions tailored to meet the diverse needs of businesses across various industries. From cutting-edge Generative AI and Cloud Services to robust Information Security, our consultancy is committed to delivering transformative results. Whether you seek expertise in Smart Farming, Retail Implementation, Healthcare, or Business Process Automation, we harness the latest technologies to drive digital evolution. At Hamdaz, we don't just provide services; we craft intelligent solutions that propel your business forward in the dynamic landscape of technology and software.",
};

export const about = {
  title: 'Welcome to HAMDAZ Technologies',
  intro:
    'At HAMDAZ, we are driven by a team of technology enthusiasts with a wealth of experience. Our passion for innovation propels us forward as we embark on this exciting venture.',
  whoWeAre:
    'We are a dynamic team of professionals who share a common goal – harnessing the power of technology to create impactful solutions. Our journey is fueled by a collective passion for pushing boundaries and redefining possibilities.',
  points: [
    ['Our Expertise', 'In a rapidly evolving technological landscape, we stand out for our commitment to staying ahead of the curve. Our team is not only well-versed in current industry trends but is also dedicated to anticipating and adapting to the innovations of tomorrow.'],
    ['What Sets Us Apart', 'With a wealth of experience in the tech industry, our team brings a diverse set of skills and knowledge to the table. From seasoned developers to visionary leaders, each member contributes to our shared vision of delivering excellence.'],
    ['Why Choose Us', 'Choosing HAMDAZ means aligning with a team that is not just passionate about technology, but also dedicated to understanding your unique needs. We pride ourselves on delivering tailor-made solutions that drive success for your business.'],
  ],
  closing: 'Welcome to the future with HAMDAZ - where technology meets passion, and possibilities are limitless',
};

// ---------------------------------------------------------------------------
// The services: the original 20 from the "What We Do" page (in its order), then the AV, ELV, cybersecurity,
// networking and staffing services from the 2026 company profiles.
// `slug` matches the old URL (/service/<slug>/) so redirects keep working.
// ---------------------------------------------------------------------------
export const services = [
  {
    slug: 'generative-ai',
    title: 'Generative AI',
    summary: 'In the realm of Generative AI, our consultancy specializes in harnessing cutting-edge technologies to create intelligent and innovative solutions.',
    intro: 'In the realm of Generative AI, our consultancy specializes in harnessing cutting-edge technologies to create intelligent and innovative solutions. Our services include:',
    items: [
      ['AI-driven Content Creation', 'Utilizing Generative AI to produce creative and personalized content.'],
      ['Automated Design Generation', 'Implementing AI algorithms to generate designs and prototypes.'],
      ['Chatbot Development', 'Creating advanced conversational agents for enhanced customer interaction.'],
      ['Deepfake Detection Services', 'Implementing solutions to identify and mitigate deepfake threats.'],
      ['Latest Technologies', "Leveraging OpenAI's GPT-4 for advanced natural language processing."],
    ],
    cta: 'Unlock Infinite Possibilities with AI Mastery: Explore Managed Services Now!',
  },
  {
    slug: 'data-analytics-predictive-services',
    title: 'Data Analytics & Predictive Services',
    summary: 'Our consultancy excels in Data Analytics and Predictive Services, providing insights for informed decision-making.',
    intro: 'Our consultancy excels in Data Analytics and Predictive Services, providing insights for informed decision-making:',
    items: [
      ['Data Warehousing and Integration', 'Consolidating and integrating data from various sources.'],
      ['Data Visualization', 'Creating interactive and insightful visual representations of data.'],
      ['Predictive Analytics Modeling', 'Using statistical algorithms for forecasting future trends.'],
      ['Big Data Processing', 'Handling and analyzing large volumes of data for actionable insights.'],
      ['Latest Technologies', 'Incorporating machine learning algorithms for advanced predictive analytics.'],
    ],
  },
  {
    slug: 'business-process-automation-and-digital-transformation-services',
    title: 'Business Process Automation and Digital Transformation Services',
    summary: 'Our consultancy focuses on driving business efficiency and innovation.',
    intro: 'Our consultancy focuses on driving business efficiency and innovation through:',
    items: [
      ['Business Process Mapping and Analysis', 'Identifying areas for automation and improvement.'],
      ['Change Management', 'Facilitating a smooth transition to automated processes.'],
      ['Integration of Emerging Technologies', 'Leveraging AI, IoT, and other technologies for digital transformation.'],
      ['Continuous Improvement', 'Implementing strategies for ongoing process optimization.'],
      ['Latest Technologies', 'Utilizing blockchain for transparent and secure digital transactions.'],
    ],
  },
  {
    slug: 'data-center-infrastructure-services',
    title: 'Data Center/Infrastructure Services',
    summary: 'Our consultancy excels in providing robust Data Center and Infrastructure Services, ensuring reliability and scalability.',
    intro: 'Our consultancy excels in providing robust Data Center and Infrastructure Services, ensuring reliability and scalability. Key offerings include:',
    items: [
      ['Data Center Design and Optimization', 'Designing and optimizing data center layouts.'],
      ['Server Virtualization', 'Implementing virtualization technologies for efficient resource utilization.'],
      ['IT Infrastructure Monitoring', 'Utilizing advanced tools for real-time monitoring.'],
      ['Edge Computing Solutions', 'Deploying infrastructure at the network edge for low-latency applications.'],
      ['Latest Technologies', 'Implementing hyper-converged infrastructure (HCI) for streamlined operations.'],
    ],
  },
  {
    slug: 'cloud-services-migration',
    title: 'Cloud Services & Migration',
    summary: 'Our consultancy excels in Cloud Services and Migration, ensuring seamless transitions and optimized cloud environments.',
    intro: 'Our consultancy excels in Cloud Services and Migration, ensuring seamless transitions and optimized cloud environments. Our key services encompass:',
    items: [
      ['Cloud Strategy Consulting', 'Developing customized cloud adoption strategies for businesses.'],
      ['Cloud Migration Services', 'Efficiently moving applications and data to cloud platforms.'],
      ['Multi-Cloud Management', 'Optimizing operations across multiple cloud providers.'],
      ['Serverless Architecture Implementation', 'Leveraging AWS Lambda, Azure Functions, etc.'],
      ['Latest Technologies', 'Integrating Kubernetes for container orchestration.'],
    ],
    cta: 'Unlock Infinite Possibilities with Cloud Services & Migration: Explore Managed Services Now!',
  },
  {
    slug: 'partner-services-msft-azure-aws-gcp-oci',
    title: 'Partner Services – MSFT Azure, AWS, GCP, OCI',
    summary: 'Specializing in partner services, our consultancy ensures optimal utilization of cloud platforms.',
    intro: 'Specializing in partner services, our consultancy ensures optimal utilization of cloud platforms. Our key focus areas include:',
    items: [
      ['Cloud Consultation and Adoption Planning', 'Assisting clients in selecting and adopting the right cloud platform.'],
      ['Migration and Integration Services', 'Seamless transition of applications and data to cloud environments.'],
      ['Cost Optimization', 'Implementing strategies to optimize cloud infrastructure costs.'],
      ['Managed Services for Cloud Platforms', 'Ongoing support and maintenance for cloud-based systems.'],
      ['Latest Technologies', 'Integration of serverless computing and AI services from cloud providers.'],
    ],
  },
  {
    slug: 'digital-twin',
    title: 'Digital Twin',
    summary: 'Specializing in Digital Twin technology, our consultancy creates digital replicas of physical entities.',
    intro: 'Specializing in Digital Twin technology, our consultancy creates digital replicas of physical entities for:',
    items: [
      ['IoT Integration', 'Connecting physical entities to the digital twin for real-time monitoring.'],
      ['Simulation and Modeling', 'Using digital twins for scenario analysis and optimization.'],
      ['Predictive Maintenance', 'Utilizing digital twins to predict and prevent equipment failures.'],
      ['Supply Chain Optimization', 'Applying digital twins for efficient supply chain management.'],
      ['Latest Technologies', 'Integrating edge computing for real-time updates in digital twin models.'],
    ],
  },
  {
    slug: 'rpa-robotic-process-automation',
    title: 'RPA (Robotic Process Automation)',
    summary: 'Specializing in Robotic Process Automation, our consultancy streamlines business processes.',
    intro: 'Specializing in Robotic Process Automation, our consultancy streamlines business processes through:',
    items: [
      ['Process Automation Assessment', 'Identifying and prioritizing processes for automation.'],
      ['RPA Tool Selection and Implementation', 'Choosing and integrating the right RPA tools for specific tasks.'],
      ['Workflow Integration', 'Integrating automated processes with existing business workflows.'],
      ['Bot Monitoring and Maintenance', 'Ensuring the efficient operation and upkeep of automated bots.'],
      ['Latest Technologies', 'Incorporating AI-driven RPA for enhanced decision-making capabilities.'],
    ],
  },
  {
    slug: 'mobile-app-development',
    title: 'Mobile App Development',
    summary: 'Our consultancy excels in Mobile App Development, providing services that cater to diverse business needs.',
    intro: 'Our consultancy excels in Mobile App Development, providing services that cater to diverse business needs:',
    items: [
      ['Native and Cross-Platform App Development', 'Creating apps for various platforms and devices.'],
      ['User Interface (UI) and User Experience (UX) Design', 'Ensuring a seamless and engaging app experience.'],
      ['Enterprise Mobile Solutions', 'Developing apps for internal business processes and employee productivity.'],
      ['Mobile App Security', 'Implementing robust security measures to protect user data.'],
      ['Latest Technologies', 'Utilizing Flutter and React Native for efficient cross-platform development.'],
    ],
  },
  {
    slug: 'education-services',
    title: 'Education Services',
    summary: 'Our consultancy offers Education Services, leveraging technology for enhanced learning experiences.',
    intro: 'Our consultancy offers Education Services, leveraging technology for enhanced learning experiences:',
    items: [
      ['Learning Management System (LMS) Integration', 'Facilitating online course delivery and management.'],
      ['Virtual Classroom Solutions', 'Providing technology for interactive and remote learning.'],
      ['Student Information System (SIS) Implementation', 'Streamlining administrative processes in educational institutions.'],
      ['E-learning Content Development', 'Creating engaging and interactive digital learning materials.'],
      ['Latest Technologies', 'Incorporating Augmented Reality (AR) for immersive educational experiences.'],
    ],
  },
  {
    slug: 'healthcare-services',
    title: 'Healthcare Services',
    summary: 'In the healthcare sector, our consultancy focuses on providing technology-driven solutions.',
    intro: 'In the healthcare sector, our consultancy focuses on providing technology-driven solutions, including:',
    items: [
      ['Electronic Health Record (EHR) Implementation', 'Streamlining patient data management.'],
      ['Telemedicine Integration', 'Facilitating remote patient consultations and monitoring.'],
      ['Healthcare Analytics', 'Utilizing data analytics for insights into patient care and operational efficiency.'],
      ['Cybersecurity for Healthcare', 'Ensuring the security and privacy of sensitive health information.'],
      ['Latest Technologies', 'Implementation of AI for medical imaging and diagnostics.'],
    ],
  },
  {
    slug: 'retail-implementation-services',
    title: 'Retail Implementation Services',
    summary: 'Our consultancy specializes in providing Retail Implementation Services.',
    intro: 'Our consultancy specializes in providing Retail Implementation Services, including:',
    items: [
      ['Point of Sale (POS) System Integration', 'Seamless integration of POS systems for efficient transactions.'],
      ['Inventory Management Solutions', 'Implementing technology for real-time tracking and optimization.'],
      ['E-commerce Platform Integration', 'Facilitating the integration of online and offline retail channels.'],
      ['Customer Loyalty Programs', 'Designing and implementing loyalty programs for enhanced customer engagement.'],
      ['Latest Technologies', 'Incorporating RFID technology for advanced inventory tracking.'],
    ],
  },
  {
    slug: 'smart-farming',
    title: 'Smart Farming',
    summary: 'In the realm of agriculture technology, our consultancy focuses on Smart Farming solutions.',
    intro: 'In the realm of agriculture technology, our consultancy focuses on Smart Farming solutions, including:',
    items: [
      ['Precision Agriculture', 'Using IoT and data analytics for optimized crop management.'],
      ['Automated Irrigation Systems', 'Implementing technology for efficient water usage.'],
      ['Crop Monitoring with Drones', 'Utilizing drones for real-time crop health assessments.'],
      ['Weather Data Integration', 'Incorporating weather forecasts for informed decision-making.'],
      ['Latest Technologies', 'Implementing AI for crop yield prediction and disease detection.'],
    ],
  },
  {
    slug: 'bot-services',
    title: 'Bot Services',
    summary: 'In the domain of Bot Services, our consultancy focuses on creating intelligent conversational agents and virtual assistants.',
    intro: 'In the domain of Bot Services, our consultancy focuses on creating intelligent conversational agents and virtual assistants:',
    items: [
      ['Chatbot Development', 'Creating conversational bots for customer support and engagement.'],
      ['Voice-enabled Bots', 'Implementing bots that respond to voice commands for enhanced user interaction.'],
      ['Multi-Channel Bot Integration', 'Ensuring bots are accessible across various communication channels.'],
      ['Bot Analytics and Insights', 'Utilizing data to optimize bot performance and user experience.'],
      ['Latest Technologies', 'Implementing advanced Natural Language Processing (NLP) for more human-like interactions.'],
    ],
  },
  {
    slug: 'it-ot-services',
    title: 'IT/OT Services',
    summary: 'In the domain of IT/OT (Information Technology/Operational Technology) convergence, our services connect and optimize industrial operations.',
    intro: 'In the domain of IT/OT (Information Technology/Operational Technology) convergence, our services include:',
    items: [
      ['Industrial IoT (IIoT) Implementation', 'Connecting and optimizing industrial processes through IoT.'],
      ['Cyber-Physical System Integration', 'Integrating digital and physical systems for efficient operations.'],
      ['SCADA System Deployment', 'Implementing Supervisory Control and Data Acquisition systems for real-time monitoring.'],
      ['Legacy System Modernization', 'Upgrading older operational technology for improved efficiency.'],
      ['Latest Technologies', 'Integration of edge computing for real-time data processing in industrial environments.'],
    ],
  },
  {
    slug: 'zoho-sap-vodoo-crm-salesforce',
    title: 'CRM: Salesforce, Zoho, SAP & Odoo',
    summary: 'Specializing in Customer Relationship Management (CRM) solutions.',
    intro: 'Specializing in Customer Relationship Management (CRM) solutions, our consultancy provides:',
    items: [
      ['CRM Implementation and Customization', 'Tailoring CRM systems to meet specific business requirements.'],
      ['Data Migration and Integration', 'Seamless transfer of data from legacy systems to modern CRM platforms.'],
      ['User Training and Support', 'Ensuring effective use of CRM tools across the organization.'],
      ['Automation of Sales Processes', 'Implementing workflow automation for increased efficiency.'],
      ['Latest Technologies', 'Integration of AI for predictive analytics and customer insights.'],
    ],
  },
  // Software development (added 2026-11): custom software, ERP and LMS beside mobile apps and CRM
  {
    slug: 'custom-software-web-development',
    title: 'Custom Software & Web Development',
    summary: 'Business software, web portals and integrations built around the way your organisation works.',
    intro: 'When off-the-shelf software does not fit, we design and build it around your processes:',
    items: [
      ['Custom Business Applications', 'Web-based systems for approvals, operations, field work and reporting.'],
      ['Web Portals and Websites', 'Customer, supplier and employee portals, and fast, secure company websites.'],
      ['Integrations and APIs', 'Connecting your ERP, CRM, HR and finance systems so data stays in step.'],
      ['Cloud-Ready Architecture', 'Applications built to run on Azure, AWS, Google Cloud or Oracle Cloud.'],
      ['Support and Enhancement', 'Hosting, monitoring, fixes and new features after go-live.'],
    ],
  },
  {
    slug: 'erp-solutions',
    title: 'ERP Implementation: SAP, Odoo & Zoho',
    summary: 'ERP systems for finance, inventory, procurement, sales and HR, set up and supported end to end.',
    intro: 'We implement and support ERP systems that bring your core operations onto one platform:',
    items: [
      ['ERP Selection and Planning', 'Choosing between SAP, Odoo and Zoho based on your processes, size and budget.'],
      ['Implementation and Configuration', 'Finance, inventory, procurement, sales, HR and payroll modules set up for you.'],
      ['Customisation and Integration', 'Workflows, reports and connections to your existing systems and apps.'],
      ['Data Migration and Training', 'Moving records from legacy systems and spreadsheets, and training your users.'],
      ['Support and Upgrades', 'Help desk, enhancements and version upgrades after go-live.'],
    ],
  },
  {
    slug: 'lms-elearning-platforms',
    title: 'LMS & e-Learning Platforms',
    summary: 'Learning management systems for schools, universities and corporate training, set up and supported.',
    intro: 'We deliver learning management systems that make teaching and training easier to run:',
    items: [
      ['LMS Implementation', 'Setting up and configuring a learning management system for your institution or team.'],
      ['Courses and Content', 'Course structures, assessments, certificates and interactive content.'],
      ['Integrations and Single Sign-On', 'Connecting the LMS to student information, HR systems and Microsoft 365 or Google accounts.'],
      ['Virtual Classrooms and Hybrid Learning', 'Live classes, recordings and classroom technology that work with the LMS.'],
      ['Reports, Hosting and Support', 'Progress analytics, secure hosting and support for staff and learners.'],
    ],
  },
  {
    slug: 'av-setup-meeting-room-solutions',
    title: 'AV Setup, Meeting Room Solutions',
    summary: 'Specializing in Audio-Visual (AV) solutions, our consultancy enhances collaboration and communication.',
    intro: 'Specializing in Audio-Visual (AV) solutions, our consultancy enhances collaboration and communication with services such as:',
    items: [
      ['AV System Design and Installation', 'Tailoring audio-visual setups to meet specific business needs.'],
      ['Unified Communication Integration', 'Integrating communication tools for seamless collaboration.'],
      ['Smart Meeting Room Solutions', 'Implementing IoT and automation for efficient meeting room management.'],
      ['Video Conferencing Solutions', 'Leveraging the latest technologies for high-quality virtual meetings.'],
      ['Latest Technologies', 'Integration of AI for voice recognition and transcription in meetings.'],
    ],
  },
  {
    slug: 'managed-services',
    title: 'Managed Services',
    summary: 'Our Managed Services offering ensures the smooth operation of IT systems and applications.',
    intro: 'Our Managed Services offering ensures the smooth operation of IT systems and applications. Key services include:',
    items: [
      ['Proactive Monitoring and Maintenance', 'Continuous monitoring to identify and address issues before they impact operations.'],
      ['Remote IT Support', 'Providing efficient support services for remote and distributed teams.'],
      ['Patch Management', 'Ensuring that systems are up-to-date with the latest security patches.'],
      ['Backup and Disaster Recovery', 'Implementing robust strategies to safeguard data.'],
      ['Latest Technologies', 'Incorporating AI-driven automation for predictive maintenance.'],
    ],
  },
  {
    slug: 'information-security-services',
    title: 'Information Security Services',
    summary: 'Specializing in Information Security, we offer comprehensive solutions to safeguard sensitive data and ensure regulatory compliance.',
    intro: 'Specializing in Information Security, we offer comprehensive solutions to safeguard sensitive data and ensure regulatory compliance. Our services include:',
    items: [
      ['Penetration Testing', 'Identifying and addressing vulnerabilities in IT systems.'],
      ['Incident Response and Forensics', 'Swift response to security incidents and forensic investigations.'],
      ['Identity and Access Management (IAM)', 'Implementing robust access control systems.'],
      ['Blockchain Security', 'Securing transactions and data on blockchain networks.'],
      ['Latest Technologies', 'Implementing AI-driven cyber security solutions for threat detection.'],
    ],
  },
  {
    slug: 'network-services-cabling-structured-cabling',
    title: 'Network Services Cabling/Structured Cabling',
    summary: 'With expertise in Network Services and Structured Cabling, we ensure a reliable and efficient network infrastructure.',
    intro: 'With expertise in Network Services and Structured Cabling, we ensure a reliable and efficient network infrastructure. Our services encompass:',
    items: [
      ['Network Design and Installation', 'Planning and implementing network architectures.'],
      ['Fiber Optic Cabling', 'Deploying high-speed and reliable fiber optic cabling solutions.'],
      ['Wireless Networking', 'Implementing Wi-Fi and other wireless connectivity solutions.'],
      ['Network Performance Optimization', 'Identifying and resolving bottlenecks for enhanced performance.'],
      ['Latest Technologies', 'Implementing Power over Ethernet (PoE) for efficient device connectivity.'],
    ],
  },
  // ---- Audio Visual (from the Hamdaz AV company profile, 2026) ----
  {
    slug: 'meeting-rooms-video-conferencing',
    title: 'Meeting Rooms & Video Conferencing',
    summary: 'Huddle spaces to executive boardrooms, with certified Microsoft Teams, Zoom, Webex and Google Meet room systems.',
    intro: 'We design, supply, install and program collaboration rooms on your platform, so every room works on day one and keeps working:',
    items: [
      ['Meeting & Boardrooms', 'Huddle spaces to executive boardrooms, designed to room standards.'],
      ['Video Conferencing Rooms', 'Certified Microsoft Teams, Zoom, Cisco Webex and Google Meet room systems.'],
      ['Wireless Presentation', 'BYOD and BYOM so any laptop can share and join in seconds.'],
      ['Control Programming', 'Crestron, Extron, AMX and Q-SYS user interfaces built in-house.'],
      ['Room Standards', 'Focus rooms to town halls, standardised so every space works the same way.'],
    ],
  },
  {
    slug: 'video-walls-digital-signage',
    title: 'LED Video Walls & Digital Signage',
    summary: 'Fine-pitch LED and LCD video walls, digital signage and command-centre displays, supplied, mounted and calibrated.',
    intro: 'Commercial-grade screens for every space, from a lobby sign to a 24/7 operations wall:',
    items: [
      ['LED & LCD Video Walls', 'Fine-pitch LED, LCD walls and processing for any scale.'],
      ['Digital Signage', 'Screens, players and content platforms managed centrally.'],
      ['Command & Control Centres', 'Operator video walls, KVM and 24/7-rated displays.'],
      ['Media Servers & Projection', 'Multi-display playback, edge blending and projection mapping.'],
      ['Interactive Displays', 'Touch screens, interactive whiteboards and presentation systems.'],
    ],
  },
  {
    slug: 'pro-audio-pa-systems',
    title: 'Pro Audio, PA & Background Music',
    summary: 'Speech, music, paging and voice evacuation systems, tuned for every room, hall and venue.',
    intro: 'Clear sound for meetings, learning and venues, designed, installed and tuned by our own engineers:',
    items: [
      ['Conference Audio', 'Ceiling microphones, DSP and conference systems for clear meetings.'],
      ['PA & Voice Evacuation', 'Paging and voice alarm systems for buildings and campuses.'],
      ['Background Music', 'Zoned BGM, sports screens and venue AV for hospitality and F&B.'],
      ['Classrooms & Auditoriums', 'Lecture capture, voice lift, projection and hybrid learning.'],
      ['Testing & Commissioning', 'Acoustic tuning, signal verification and SAT sign-off.'],
    ],
  },
  {
    slug: 'immersive-smart-spaces',
    title: 'Immersive & Smart Spaces',
    summary: 'AR, VR and mixed reality, holographic and interactive displays, stage lighting and building automation.',
    intro: 'Experience technology that brings spaces to life, and one-touch control behind it:',
    items: [
      ['AR, VR & Mixed Reality', 'Headsets, training simulators and custom 3D content for immersive experiences.'],
      ['Holographic & Interactive', 'Holographic displays, touch tables and gesture-driven interactive walls.'],
      ['Stage & Architectural Lighting', 'Theatrical, event and architectural lighting with DMX control.'],
      ['Home & Building Automation', 'One-touch control of AV, lighting, shades and climate.'],
      ['Large Venues & Outdoor', 'Arenas, halls, event spaces and weather-rated AV.'],
    ],
  },
  // ---- ELV & Security Systems (from the Hamdaz ELV company profile, 2026) ----
  {
    slug: 'cctv-video-surveillance',
    title: 'CCTV & Video Surveillance',
    summary: 'MCC-compliant CCTV, from coverage design to recording, analytics and control-room monitoring.',
    intro: 'As an Abu Dhabi Monitoring & Control Centre (MCC) certified contractor, we design, install and hand over every CCTV system to MCC requirements:',
    items: [
      ['IP Surveillance', 'Fixed, PTZ, fisheye and multi-sensor cameras, indoor and outdoor rated.'],
      ['Recording & Storage', 'NVR and server recording sized to the required retention period.'],
      ['Video Analytics', 'Line crossing, intrusion, people counting, face and ANPR analytics.'],
      ['Monitoring Rooms', 'VMS clients, operator desks and video walls for live control.'],
      ['Analogue-to-IP Upgrades', 'Migrate legacy systems to compliant IP platforms in phases.'],
    ],
  },
  {
    slug: 'access-control-gate-barriers',
    title: 'Access Control & Gate Barriers',
    summary: 'Card, mobile and biometric access for people, and barriers, gates and bollards for vehicles.',
    intro: 'Control who, and what, gets in, from the front door to the perimeter gate:',
    items: [
      ['Card, Mobile & Biometric Access', 'Secure credentials, fingerprint and face recognition with central user management.'],
      ['Turnstiles & Speed Gates', 'Lobby and staff-entrance flow control.'],
      ['Boom Barriers & Automatic Gates', 'Fast-cycle barriers and sliding or swing gates for car parks and compounds.'],
      ['Road Blockers & Bollards', 'Hostile-vehicle mitigation for critical sites.'],
      ['Visitor Management & Time Attendance', 'Pre-registration, badges, host notifications and attendance data linked to HR.'],
    ],
  },
  {
    slug: 'anpr-intercom-car-parks',
    title: 'ANPR, Intercom & Car Parks',
    summary: 'Number-plate recognition, long-range UHF, IP video intercom and parking management.',
    intro: 'Hands-free vehicle entry and clear communication at every gate and door:',
    items: [
      ['ANPR Cameras & Software', 'Arabic and English plate reading with whitelist and blacklist control.'],
      ['Long-range UHF Tags', 'Hands-free access for staff and fleet vehicles.'],
      ['IP Video Intercom', 'SIP door stations and indoor monitors for villas, towers and offices.'],
      ['Help Points & SOS Stations', 'Emergency call points for car parks, campuses and public areas.'],
      ['Parking Management', 'Ticketing, guidance and occupancy counts.'],
    ],
  },
  {
    slug: 'data-centre-power-cooling',
    title: 'Data Centre Build, Power & Cooling',
    summary: 'Server rooms and data centres with racks, containment, UPS, precision cooling and monitoring.',
    intro: 'Data centres that stay up, designed and built around your IT load:',
    items: [
      ['Server Rooms & Data Centres', 'Design and build of new server rooms and data centre upgrades.'],
      ['Racks & Containment', 'Server and network racks with hot and cold aisle containment.'],
      ['UPS & Power', 'UPS systems, PDUs, batteries and power distribution with backup.'],
      ['Precision Cooling', 'In-row and room cooling sized to the IT load.'],
      ['Monitoring & Fire Suppression', 'Temperature, leak, power and door sensors with alerts, and clean-agent suppression.'],
    ],
  },
  // ---- Cybersecurity (from the Hamdaz Cybersecurity profile, 2026) ----
  {
    slug: 'managed-ai-secops',
    title: 'Managed AI SecOps (24/7 SOC)',
    summary: 'AI-native detection, decision and response around the clock, with human expertise in the loop.',
    intro: 'Security operations at machine speed: a multilayered, 24/7 managed SOC and NOC:',
    items: [
      ['24/7 Managed Detection & Response', 'MXDR and EDR with real-time threat detection and rapid response.'],
      ['Identity Threat Detection (ITDR)', 'Spotting and stopping attacks on identities and access.'],
      ['Threat Intelligence', 'AI-native threat intelligence and IOC correlation, always on.'],
      ['Managed NOC', '24/7 network operations, monitoring and management.'],
      ['Anti-Ransomware 24/7', 'Ransomware detection and recovery for your crown-jewel systems.'],
    ],
  },
  {
    slug: 'cyber-assessment-audit',
    title: 'Cybersecurity Assessment & Audit',
    summary: 'Risk and gap analysis against ISO/IEC 27001 and NIST CSF 2.0, penetration testing and a board-ready roadmap.',
    intro: 'An independent view of your security posture and a prioritised plan to improve it:',
    items: [
      ['Risk Assessment & Gap Analysis', 'Aligned to ISO/IEC 27001, NIST CSF 2.0, UAE IA, ADHICS and PCI DSS.'],
      ['Penetration Testing', 'VAPT, DAST and SAST, including autonomous AI penetration testing.'],
      ['Ransomware Readiness', 'Backup resilience and RPO / RTO testing.'],
      ['Cloud Security Posture', 'Cloud configuration review and posture assessment.'],
      ['Virtual Leadership', 'vCISO, vDPO and vAIO advisory, GRC and compliance readiness.'],
    ],
  },
  {
    slug: 'zero-trust-identity-data-security',
    title: 'Zero Trust, Identity & Data Security',
    summary: 'Zero Trust, SASE, identity, data loss prevention, email and web application security.',
    intro: 'Solutions across the CIA triad, from the data centre to the end user:',
    items: [
      ['Zero Trust, SASE & SSE', 'Secure access for users and sites wherever they work.'],
      ['IAM, PAM & MFA', 'Identity and privileged access management with multi-factor authentication.'],
      ['DLP & DSPM', 'Discover, classify and protect sensitive data.'],
      ['Email Security & Awareness', 'Email protection, DMARC and security awareness training.'],
      ['WAAP & Next-Gen Firewalls', 'Web application and API protection, and managed perimeter security.'],
    ],
  },
  {
    slug: 'ransomware-resilience',
    title: 'Ransomware Resilience & Recovery',
    summary: 'Close the gap between endpoint controls and backups, with recovery assurance behind it.',
    intro: 'Prevention is necessary but no longer sufficient. Resilience is what protects the business:',
    items: [
      ['Prevention Before Execution', 'Pre-execution engine and ransomware heuristics behind your endpoint controls.'],
      ['Stop Encryption & Exfiltration', 'Behavioural modelling, backup protection and data exfiltration prevention.'],
      ['Decryption & Recovery', 'Recover without paying a ransom, with expert responders on call.'],
      ['Backup, HA & Disaster Recovery', 'Immutable backup, high availability and business continuity.'],
      ['Incident Response & Forensics', 'Containment, threat eviction and digital forensics.'],
    ],
  },
  // ---- Networking & Wi-Fi ----
  {
    slug: 'enterprise-networking-wifi',
    title: 'Enterprise Networking & Wi-Fi',
    summary: 'Wired and wireless networks that are fast, secure and monitored, from campus to branch.',
    intro: 'The network backbone every system depends on, designed, built and supported:',
    items: [
      ['Wi-Fi Design & Surveys', 'Coverage planning, site surveys and high-density wireless.'],
      ['Routing & Switching', 'Campus, data centre and branch networks, PoE included.'],
      ['Network Security', 'Next-generation firewalls, NAC and secure SD-WAN.'],
      ['Network Monitoring', '24/7 NOC monitoring and management.'],
      ['Upgrades & Migration', 'Phased refresh of legacy networks with minimal downtime.'],
    ],
  },
  // ---- Staffing & Outsourcing ----
  {
    slug: 'it-staffing-resident-engineers',
    title: 'IT Staffing & Resident Engineers',
    summary: 'Skilled IT, AV and security engineers placed on your site, for daily operations, projects and events.',
    intro: 'The right people where you need them, backed by our engineering teams in Abu Dhabi and India:',
    items: [
      ['Resident Engineers', 'On-site IT, AV and security engineers for daily operations.'],
      ['IT Operations Teams', 'Teams embedded on client sites, as we run today for energy and education organisations.'],
      ['Project Staffing', 'Engineers and project managers for fixed-term rollouts.'],
      ['Event Engineers', 'AV technicians for live events and conferences.'],
      ['Offshore Delivery', 'Engineering and delivery teams in Kerala, India, working with your team.'],
    ],
  },
  {
    slug: 'it-outsourcing-managed-operations',
    title: 'IT Outsourcing & Managed Operations',
    summary: 'Hand us the day-to-day: service desk, 24/7 monitoring and support contracts, measured against SLAs.',
    intro: 'Run IT as a service, with one accountable partner and clear reporting:',
    items: [
      ['Service Desk', 'User support with defined response times and escalation.'],
      ['24/7 NOC Services', 'Round-the-clock monitoring and triage.'],
      ['Management & Monitoring', 'Proactive device monitoring, alerts and remote fixes.'],
      ['AMC & SLA Support', 'Preventive visits and guaranteed response times.'],
      ['Monthly Service Reviews', 'KPI and SLA performance, open actions and change requests.'],
    ],
  },
];

// Service categories (the services page sections and the Services menu), in display order. Every service
// belongs to exactly one category.
export const categories = [
  { id: 'ai-data', title: 'AI, Data & Automation', short: 'AI & Data', icon: 'sparkles', text: 'Generative AI, chatbots, analytics and automation that put your data to work.', services: ['generative-ai', 'bot-services', 'data-analytics-predictive-services', 'business-process-automation-and-digital-transformation-services', 'rpa-robotic-process-automation', 'digital-twin'] },
  { id: 'cybersecurity', title: 'Cybersecurity', short: 'Cybersecurity', icon: 'shield-check', text: 'Beyond defence, there is resilience: assessment, solutions and 24/7 AI-driven security operations.', services: ['managed-ai-secops', 'cyber-assessment-audit', 'zero-trust-identity-data-security', 'ransomware-resilience', 'information-security-services'] },
  { id: 'cloud-infrastructure', title: 'Cloud & Infrastructure', short: 'Cloud & Infra', icon: 'cloud-upload', text: 'Cloud migration and management on Azure, AWS, GCP and OCI, data centres and managed services.', services: ['cloud-services-migration', 'partner-services-msft-azure-aws-gcp-oci', 'data-center-infrastructure-services', 'managed-services', 'it-ot-services'] },
  { id: 'elv-security', title: 'ELV & Security Systems', short: 'ELV & Security', icon: 'cctv', text: 'MCC-certified CCTV, access control, gate barriers, ANPR, intercom and data centre infrastructure.', services: ['cctv-video-surveillance', 'access-control-gate-barriers', 'anpr-intercom-car-parks', 'data-centre-power-cooling'] },
  { id: 'audio-visual', title: 'Audio Visual', short: 'Audio Visual', icon: 'monitor-play', text: 'Design, supply, installation, programming and support of AV and collaboration systems across the UAE.', services: ['meeting-rooms-video-conferencing', 'video-walls-digital-signage', 'pro-audio-pa-systems', 'immersive-smart-spaces', 'av-setup-meeting-room-solutions'] },
  { id: 'network-wifi', title: 'Networking & Wi-Fi', short: 'Networking & Wi-Fi', icon: 'wifi', text: 'Enterprise wired and wireless networks, structured cabling and fibre.', services: ['enterprise-networking-wifi', 'network-services-cabling-structured-cabling'] },
  { id: 'software-development', title: 'Software Development', short: 'Software', icon: 'blocks', text: 'Custom software, ERP, LMS, CRM and mobile apps, built and set up around the way you work.', services: ['custom-software-web-development', 'erp-solutions', 'lms-elearning-platforms', 'zoho-sap-vodoo-crm-salesforce', 'mobile-app-development'] },
  { id: 'industry', title: 'Industry Solutions', short: 'Industries', icon: 'building-2', text: 'Technology shaped for education, healthcare, retail and agriculture.', services: ['education-services', 'healthcare-services', 'retail-implementation-services', 'smart-farming'] },
  { id: 'staffing', title: 'Staffing & Outsourcing', short: 'Staffing', icon: 'users', text: 'Resident engineers, project teams and outsourced IT operations.', services: ['it-staffing-resident-engineers', 'it-outsourcing-managed-operations'] },
];

export const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
// each service's area, and the page addresses (relative to the site root; build.mjs adjusts them on nested pages)
export const categoryOf = Object.fromEntries(categories.flatMap((c) => c.services.map((slug) => [slug, c])));
export const svcUrl = (slug) => `service/${slug}/`;
export const areaUrl = (id) => `services/${id}/`;
export const defaultServiceCta = 'Unlock Infinite Possibilities with Our Services : Explore Managed Services Now!';

// "Our Managed Services" on the original homepage
export const featuredServices = [
  'generative-ai',
  'data-analytics-predictive-services',
  'business-process-automation-and-digital-transformation-services',
  'data-center-infrastructure-services',
  'cloud-services-migration',
  'partner-services-msft-azure-aws-gcp-oci',
];

// ---------------------------------------------------------------------------
// "Hamdaz Solutions: Discover Our Range of AI Products" (old /product/<slug>/ pages)
// ---------------------------------------------------------------------------
export const products = {
  eyebrow: 'Hamdaz Solutions',
  title: 'Discover Our Range of AI Products',
  intro:
    'At HAMDAZ, we are committed to pushing the boundaries of what AI can achieve across diverse industries. Explore our range of products and embark on a journey of innovation and transformation in collaboration with our advanced AI solutions.',
};

export const industries = [
  {
    slug: 'oil-and-gas-industry',
    title: 'Oil and Gas Industry',
    hero: 'Unlock the future of oil and gas with our tailored AI solutions',
    desc: 'Transform your operations with our AI solutions designed for the unique challenges of the oil and gas sector. From predictive maintenance to real-time monitoring, our products optimize efficiency, enhance safety, and maximize the potential of your resources in this dynamic industry.',
  },
  {
    slug: 'small-and-medium-enterprises-smes',
    title: 'Small and Medium Enterprises (SMEs)',
    hero: 'Supercharge Your Business Now! Unleash AI Excellence Tailored for SMEs',
    desc: "Empower your business with our AI-driven products crafted for the specific needs of small and medium enterprises. Whether it's automating processes, gaining insights from data, or enhancing customer experiences, our solutions are designed to fuel the growth and success of your business in a competitive market.",
  },
  {
    slug: 'schools-and-educational-institutions',
    title: 'Schools and Educational Institutions',
    hero: 'Empower Your School with Cutting-Edge AI Solutions for Seamless Learning and Innovation.',
    desc: "Revolutionize the educational experience with our suite of AI products tailored for schools. From smart administrative tools to interactive learning platforms, we're committed to empowering educators, students, and administrators alike. Embrace the future of education with technology that fosters growth and innovation.",
  },
  {
    slug: 'online-education',
    title: 'Online Education',
    hero: 'Transform Learning Today! Embrace the Future.',
    desc: 'Redefine online learning experiences with our AI products crafted for the digital education landscape. Personalized learning paths, intelligent analytics, and interactive content creation are just a glimpse of what our solutions offer. Embrace the future of education technology with tools that engage, inspire, and empower learners.',
  },
  {
    slug: 'sports',
    title: 'Sports',
    hero: "Transform Sports Organizations with our Advanced AI Solutions. Unleash Your Team's Full Potential Now!",
    desc: 'Elevate sports performance with our AI products designed for athletes, coaches, and sports organizations. From performance analysis to injury prevention, our solutions leverage cutting-edge technology to enhance training programs and optimize game strategies. Unleash the full potential of your team with our sports-focused AI innovations.',
  },
];

export const gpt = {
  title: 'Harness the Power of AI with Custom ChatGPT Solutions for Your Business',
  intro:
    'In the ever-evolving digital landscape, staying ahead means leveraging cutting-edge technology tailored to your unique business needs. Our specialized service in developing advanced chatbots using ChatGPT, customized with your own data, offers a transformative solution for enterprises looking to enhance customer interaction and streamline operations.',
  subtitle: 'Customized AI for Your Unique Enterprise Needs',
  items: [
    ['Data-Driven Insights', 'We begin by immersing ourselves in your world, gathering and analyzing your enterprise data – from customer interactions to internal documents. This ensures that the chatbot is not just smart but also aligned with your specific business context.'],
    ['Tailored ChatGPT Training', "Leveraging the robust foundation of ChatGPT, we fine-tune the model with your unique dataset. This bespoke approach ensures that the chatbot is attuned to your industry's jargon, customer queries, and business processes, making it incredibly efficient and context-aware."],
    ['Seamless Integration', "Our solution is designed to seamlessly integrate into your existing digital ecosystem. Whether it's customer service, sales, or internal support, our chatbots enhance user experience and operational efficiency."],
    ['Continuous Learning and Adaptation', 'The world of business is dynamic, and so are our chatbot solutions. Equipped with the ability to learn from ongoing interactions, they continuously evolve, staying relevant and up-to-date with your business needs.'],
    ['Security and Compliance', 'We prioritize the security of your data and ensure that our solutions are compliant with industry standards, providing you with a safe and reliable AI tool.'],
  ],
  closingTitle: 'Empower Your Business with Intelligent Conversations',
  closing:
    'Our custom ChatGPT-based chatbots are more than just tools; they are intelligent partners that understand your business and elevate your customer and employee interactions. Embrace the future with a solution that speaks the language of your business and transforms the way you communicate.',
};

// Technologies named in the service descriptions above
export const technologies = ['Generative AI', 'OpenAI', 'Microsoft Azure', 'AWS', 'Google Cloud', 'Oracle Cloud', 'Kubernetes', 'Zoho', 'SAP', 'Odoo', 'Salesforce', 'Flutter', 'React Native', 'SCADA', 'IIoT', 'Blockchain'];

// Home "find the right service" guide: a visitor's goal mapped to the services that fit it.
// Every service appears under at least one goal.
export const needs = [
  { id: 'ai', label: 'Use AI in my business', services: ['generative-ai', 'bot-services', 'data-analytics-predictive-services'] },
  { id: 'automate', label: 'Automate manual work', services: ['business-process-automation-and-digital-transformation-services', 'rpa-robotic-process-automation', 'erp-solutions', 'zoho-sap-vodoo-crm-salesforce'] },
  { id: 'cloud', label: 'Move to the cloud', services: ['cloud-services-migration', 'partner-services-msft-azure-aws-gcp-oci', 'data-center-infrastructure-services'] },
  { id: 'secure', label: 'Secure my systems', services: ['managed-ai-secops', 'cyber-assessment-audit', 'zero-trust-identity-data-security', 'ransomware-resilience', 'information-security-services'] },
  { id: 'building', label: 'Secure my building or site', services: ['cctv-video-surveillance', 'access-control-gate-barriers', 'anpr-intercom-car-parks', 'data-centre-power-cooling'] },
  { id: 'rooms', label: 'Set up meeting rooms and AV', services: ['meeting-rooms-video-conferencing', 'video-walls-digital-signage', 'pro-audio-pa-systems', 'immersive-smart-spaces'] },
  { id: 'people', label: 'Get engineers or outsource IT', services: ['it-staffing-resident-engineers', 'it-outsourcing-managed-operations', 'managed-services'] },
  { id: 'app', label: 'Build an app or software', services: ['custom-software-web-development', 'mobile-app-development', 'lms-elearning-platforms', 'erp-solutions', 'bot-services'] },
  { id: 'office', label: 'Set up office IT', services: ['enterprise-networking-wifi', 'network-services-cabling-structured-cabling', 'av-setup-meeting-room-solutions', 'managed-services', 'data-center-infrastructure-services'] },
  { id: 'industry', label: 'Get solutions for my industry', services: ['healthcare-services', 'education-services', 'retail-implementation-services', 'smart-farming'] },
  { id: 'data', label: 'Make sense of my data', services: ['data-analytics-predictive-services', 'digital-twin', 'it-ot-services'] },
];

// Selected clients (from the 2026 ELV & Security company profile) and technology partners (from the AV,
// ELV and Cybersecurity profiles), shown as moving rows on the home page. Names only, no logos: add logo
// files to assets/img/logos/ to show marks instead.
export const clients = [
  'ADNOC', 'Mohamed Bin Zayed University', 'Tawazun Industrial Park', 'Liwa University', 'Fatima College of Health Sciences',
  'American International School', 'Al Jazira Institute', 'Donaldson', 'Al Lul Transport & General Contracting',
];
// Partner logos in assets/img/logos/: [file, width ÷ height, mark]. From Simple Icons (CC0) and Wikimedia Commons;
// swap in the official files from each partner portal when you have them. mark: the file is only the brand's
// symbol, so its name shows beside it. A partner without a logo here shows as its name.
export const partnerLogos = {
  Microsoft: ['microsoft.svg', 4.37], Cisco: ['cisco.svg', 1.86], Fortinet: ['fortinet.svg', 1.39, true],
  'Palo Alto Networks': ['paloaltonetworks.svg', 1.39, true], 'Check Point': ['checkpoint.png', 2.22], CrowdStrike: ['crowdstrike.svg', 5.17],
  Netskope: ['netskope.svg', 5.87], Proofpoint: ['proofpoint.svg', 4.94], Qualys: ['qualys.svg', 0.84, true], Rubrik: ['rubrik.svg', 3.33],
  Veeam: ['veeam.svg', 5.1], Nutanix: ['nutanix.svg', 1.42, true], 'Pure Storage': ['purestorage.svg', 5.23], Secureworks: ['secureworks.svg', 6.86],
  'HPE Aruba': ['hpearuba.svg', 4.14], Dell: ['dell.svg', 1.0], 'Schneider Electric': ['schneiderelectric.svg', 1.03, true], Vertiv: ['vertiv.svg', 3.76],
  'Bose Professional': ['bose.svg', 7.4], Sennheiser: ['sennheiser.svg', 1.32, true], Samsung: ['samsung.svg', 5.9], LG: ['lg.svg', 2.21],
  Hikvision: ['hikvision.svg', 6.95], Axis: ['axis.svg', 2.68], 'Hanwha Vision': ['hanwhavision.svg', 1.27],
  Crestron: ['crestron.png', 8.83], Yealink: ['yealink.png', 4.74], Milestone: ['milestone.png', 1.15], Kramer: ['kramer.png', 3.27],
};
export const partners = {
  'IT, cloud & cybersecurity': ['Microsoft', 'Cisco', 'Fortinet', 'Palo Alto Networks', 'Check Point', 'CrowdStrike', 'Netskope', 'Proofpoint', 'Qualys', 'Rubrik', 'Veeam', 'Nutanix', 'Pure Storage', 'Halcyon', 'Secureworks', 'HPE Aruba', 'Dell', 'Schneider Electric', 'Vertiv'],
  'AV, ELV & security systems': ['Extron', 'Crestron', 'Q-SYS', 'Kramer', 'Barco', 'Shure', 'Sennheiser', 'Biamp', 'Bose Professional', 'Yealink', 'Logitech', 'Samsung', 'LG', 'Hikvision', 'Axis', 'Hanwha Vision', 'Milestone', 'Genetec', 'HID', 'Suprema', 'FAAC'],
};
