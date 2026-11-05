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
      lines: ['PO Box. 5758, Office 22 | 2nd Floor,', 'Millenium Tower, OPP. Hamdan Centre,', 'Hamdan Street, Abu Dhabi, U. A. E.'],
      phones: [
        { label: '+971 23090211', tel: '+97123090211' },
        { label: '+971 26265780', tel: '+97126265780' },
      ],
      map: 'https://www.google.com/maps/search/?api=1&query=Millenium+Tower+Hamdan+Street+Abu+Dhabi',
      postal: { street: 'Office 22, 2nd Floor, Millenium Tower, Hamdan Street', locality: 'Abu Dhabi', region: 'Abu Dhabi', code: '5758', country: 'AE' },
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
// The 20 services, in the order of the original "What We Do" page.
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
    title: 'Zoho, SAP, Odoo, CRM – Salesforce',
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
];

export const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
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
// Every one of the 20 services appears under at least one goal.
export const needs = [
  { id: 'ai', label: 'Use AI in my business', services: ['generative-ai', 'bot-services', 'data-analytics-predictive-services'] },
  { id: 'automate', label: 'Automate manual work', services: ['business-process-automation-and-digital-transformation-services', 'rpa-robotic-process-automation', 'zoho-sap-vodoo-crm-salesforce'] },
  { id: 'cloud', label: 'Move to the cloud', services: ['cloud-services-migration', 'partner-services-msft-azure-aws-gcp-oci', 'data-center-infrastructure-services'] },
  { id: 'secure', label: 'Secure my systems', services: ['information-security-services', 'managed-services', 'it-ot-services'] },
  { id: 'app', label: 'Build an app', services: ['mobile-app-development', 'bot-services', 'digital-twin'] },
  { id: 'office', label: 'Set up office IT', services: ['network-services-cabling-structured-cabling', 'av-setup-meeting-room-solutions', 'managed-services', 'data-center-infrastructure-services'] },
  { id: 'industry', label: 'Get solutions for my industry', services: ['healthcare-services', 'education-services', 'retail-implementation-services', 'smart-farming'] },
  { id: 'data', label: 'Make sense of my data', services: ['data-analytics-predictive-services', 'digital-twin', 'it-ot-services'] },
];
