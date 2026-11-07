// SEO page content for the 'ai-data' and 'cloud-infrastructure' areas and their services.
// Facts come from src/data.mjs and the 2026 company profiles. Plain data, no imports.

export const areas = {
  'ai-data': {
    seoTitle: 'Generative AI, Data and Automation in Abu Dhabi',
    seoDescription: 'Generative AI, AI chatbots, data analytics, RPA, business process automation and digital twins from Hamdaz in Abu Dhabi, built for UAE organisations.',
    h1: 'AI, data and automation services in Abu Dhabi',
    lead: 'We build generative AI tools, chatbots, analytics and automation that put your own data to work, delivered from Abu Dhabi with engineering teams in Kerala, India.',
    intro: [
      'Hamdaz Technologies is a generative AI company in Abu Dhabi that turns business data into working tools. Our AI, data and automation practice covers six services: generative AI, chatbot and bot development, data analytics and predictive services, business process automation, robotic process automation (RPA) and digital twins. We build custom chatbots on OpenAI models, trained on your documents and customer conversations, so answers match your business. We consolidate data from scattered systems into one warehouse, then build dashboards and forecasting models on top. Where people repeat the same steps every day, we map the process and automate it.',
      'The work is delivered by our team in Abu Dhabi, with engineering and delivery teams in Kerala, India. Because we are also an IT, cloud and cybersecurity integrator, the same company can host your models on Microsoft Azure, AWS, Google Cloud or Oracle Cloud, secure the data and support the result after launch. We are vendor-agnostic, so we pick tools that fit the task rather than a fixed product list. Hamdaz is ISO 9001, 14001 and 45001 certified, ICV certified and a registered ADNOC supplier, which helps organisations that score suppliers on In-Country Value.',
    ],
    process: [
      ['Discover', 'We study your data, systems and the decisions or tasks you want to improve.'],
      ['Design', 'We choose models, tools and architecture, and agree with you how success will be measured.'],
      ['Build', 'We build, train and test the chatbot, model, dashboard or automation on your data.'],
      ['Launch', 'We connect it to your channels and systems, train your staff and go live.'],
      ['Improve', 'We monitor performance, retrain models and refine automations as your business changes.'],
    ],
    brands: ['Generative AI', 'OpenAI', 'Microsoft Azure', 'AWS', 'Google Cloud', 'Oracle Cloud', 'Kubernetes', 'Zoho', 'SAP', 'Odoo', 'Salesforce', 'IIoT', 'Blockchain'],
    industries: ['Oil and gas', 'Small and medium enterprises', 'Schools and educational institutions', 'Online education', 'Sports', 'Healthcare', 'Retail', 'Government'],
    faqs: [
      ['Can you build a chatbot trained on our own company data?', 'Yes. We build custom chatbots on ChatGPT and other OpenAI models, fine-tuned with your documents, customer conversations and internal knowledge. The bot learns your industry terms and processes, connects to your website, messaging channels or internal systems, and keeps learning from new interactions. We put data security and compliance controls in place before it goes live.'],
      ['What is the difference between RPA and business process automation?', 'RPA uses software bots to repeat rule-based tasks inside existing applications, such as copying data between systems. Business process automation looks at the whole process first: we map it, remove steps that add no value and then automate what remains. Many projects use both, with RPA handling the screen-level work inside a redesigned process.'],
      ['Do we need a data warehouse before we can use AI or predictive analytics?', 'Not always, but clean, connected data makes every model more reliable. We usually start by consolidating data from your main sources, such as ERP, CRM and spreadsheets, into one place. From there we build dashboards first, then predictive models once the data has enough history and quality to forecast from.'],
      ['Where is our data stored when you build AI solutions?', 'That is your decision. We can host on Microsoft Azure, AWS, Google Cloud or Oracle Cloud, in the location your policies require, or keep data on your own infrastructure. We agree access controls, retention and compliance needs at the design stage, and our cybersecurity team reviews the setup before launch.'],
    ],
  },
  'cloud-infrastructure': {
    seoTitle: 'Cloud Migration and Managed IT Services in Abu Dhabi',
    seoDescription: 'Cloud migration to Azure, AWS, GCP and OCI, data centre services, IT/OT and managed IT services in Abu Dhabi from an ISO-certified UAE system integrator.',
    h1: 'Cloud, data centre and managed IT services in the UAE',
    lead: 'We plan and move workloads to the cloud, build and run data centres, connect IT with operational technology and manage it all day to day, from Abu Dhabi.',
    intro: [
      'Hamdaz Technologies is an Abu Dhabi–based system integrator for cloud and infrastructure. We help organisations decide what belongs in the cloud and what stays on-premises, then move it. Our cloud migration work covers Microsoft Azure, AWS, Google Cloud and Oracle Cloud, including multi-cloud management, serverless design and Kubernetes. On the ground, we design and optimise data centres and server rooms, with virtualisation, converged and hyper-converged platforms such as Nutanix, storage, and backup and disaster recovery. For industrial sites, we connect IT with operational technology through IIoT, SCADA and edge computing.',
      'Once systems are live, our managed services keep them running: service desk, 24x7 NOC, monitoring, patch management and backup. Our IT operations teams already work on client sites for major energy and education organisations. Because IT, AV, ELV and cybersecurity sit under one contract, you deal with one accountable partner instead of several. We are vendor-agnostic and work with Microsoft, Cisco, Dell, HPE, Nutanix, Veeam, Pure Storage, Schneider Electric and Vertiv. Hamdaz is ISO 9001, 14001 and 45001 certified, ICV certified and a registered ADNOC supplier.',
    ],
    process: [
      ['Assess', 'We review your applications, servers, networks and costs to see what should move and what should stay.'],
      ['Plan', 'We choose platforms, design the target architecture and agree a migration order and rollback plan.'],
      ['Build', 'We set up cloud foundations, data centre hardware, backup and security controls before anything moves.'],
      ['Migrate', 'We move workloads in planned waves, test each one and cut over with minimal disruption.'],
      ['Manage', 'Our service desk and 24x7 NOC monitor, patch and support the environment after go-live.'],
    ],
    brands: ['Microsoft Azure', 'AWS', 'Google Cloud', 'Oracle Cloud', 'Kubernetes', 'Cisco', 'Dell', 'HPE', 'Nutanix', 'Veeam', 'Pure Storage', 'Schneider Electric', 'Vertiv', 'SCADA'],
    industries: ['Oil and gas', 'Energy', 'Education', 'Government', 'Healthcare', 'Retail', 'Small and medium enterprises'],
    faqs: [
      ['Which cloud platform should we choose: Azure, AWS, Google Cloud or Oracle Cloud?', 'It depends on your applications, licences, skills and costs. Organisations already invested in Microsoft software often start with Azure; others suit AWS, Google Cloud or Oracle Cloud better. We are vendor-agnostic, so we compare the options against your workloads and budget and recommend one platform or a multi-cloud mix, with a clear reason for each choice.'],
      ['How do you keep our business running during a cloud migration?', 'We migrate in planned waves rather than all at once. Each wave has a test plan, a cut-over window agreed with your team and a rollback route. Backups and disaster recovery are in place before anything moves. Users are told what changes and when, and our support team stays on hand after each cut-over.'],
      ['What do your managed IT services in Abu Dhabi include?', 'Service desk, 24x7 network operations centre (NOC) monitoring, patch management, backup and disaster recovery, and remote and on-site support. We can manage servers, networks, cloud platforms and end-user devices. Our IT operations teams already work on client sites for major energy and education organisations, and we can place engineers on your site where needed.'],
      ['Do you still work with on-premises data centres, or only the cloud?', 'Both. Many organisations keep some systems on-premises for performance, cost or regulation. We design and optimise data centres and server rooms, deploy virtualisation, converged and hyper-converged infrastructure, and connect them to Azure, AWS, Google Cloud or Oracle Cloud where a hybrid model makes sense. Power and cooling come from partners such as Schneider Electric and Vertiv.'],
    ],
  },
};

export const services = {
  'generative-ai': {
    seoTitle: 'Generative AI Services and Custom GPT in Abu Dhabi',
    seoDescription: 'Hamdaz is a generative AI company in Abu Dhabi building custom GPT chatbots, AI content and design tools, and deepfake detection for UAE organisations.',
    h1: 'Generative AI services for UAE organisations',
    lead: 'Custom GPT chatbots, AI-assisted content and design, and deepfake detection, built on your own data by a generative AI company in Abu Dhabi.',
    overview: [
      'Generative AI creates new text, images and designs from patterns it has learned. For a business, the value comes from pointing it at your own data. Hamdaz builds generative AI tools for organisations that want faster content, better customer conversations and fewer repetitive writing tasks. Our work covers AI-driven content creation, automated design and prototype generation, chatbot development and deepfake detection. We use OpenAI GPT models for natural language processing, and fine-tune them with your documents, product information and customer queries, so the output reflects your business rather than general internet text.',
      'We start by gathering and reviewing the data the model will learn from, then train, test and connect it to the systems your teams already use, such as your website, CRM or internal portals. Security and compliance are set at the start, not added later, and models keep learning from new interactions after launch. Because Hamdaz also delivers cloud, data and cybersecurity services, one team can host the solution on Microsoft Azure or another cloud and support it over time. Deepfake detection adds a defensive side, helping you spot manipulated media before it causes harm.',
    ],
    benefits: [
      ['Trained on your data', 'Answers and content reflect your products, terms and processes, not generic text.'],
      ['Faster content and design', 'Produce first drafts of copy, personalised content and design prototypes with less manual effort.'],
      ['Protection against deepfakes', 'Detect manipulated audio, images and video aimed at your brand or people.'],
    ],
    faqs: [
      ['Which AI models do you use for generative AI projects?', 'We mainly work with OpenAI GPT models, including GPT-4, for natural language tasks, and choose other models where a task needs them. Models can run through Microsoft Azure or other cloud platforms. We pick the model based on the task, data sensitivity and running cost, and we explain the choice before we build.'],
      ['Can generative AI be used safely with confidential company data?', 'Yes, with the right controls. Before training starts, we agree which data the model may use, where it is hosted and who can access it. Data stays within the cloud tenancy or infrastructure you approve. Our cybersecurity team reviews access, logging and retention, so the solution meets your internal policies and industry standards.'],
      ['What does a first generative AI project usually look like?', 'Most clients start with one clear use case, such as a chatbot answering questions from internal documents or a tool that drafts product content. We prove it on a sample of your data, measure the results with your team, then extend it to more users, channels or tasks once it delivers.'],
    ],
  },
  'bot-services': {
    seoTitle: 'AI Chatbot and Voice Bot Development in the UAE',
    seoDescription: 'AI chatbot development in the UAE: customer support bots, voice-enabled bots and multi-channel virtual assistants with NLP and analytics, built by Hamdaz.',
    h1: 'AI chatbots and virtual assistants',
    lead: 'Conversational bots for customer support, sales and internal help desks, on the channels your customers and staff already use.',
    overview: [
      'A chatbot answers questions, completes simple tasks and hands complex cases to a person. Hamdaz offers AI chatbot development in the UAE for organisations that handle large volumes of repeat questions, from customer support teams to schools, clinics and retailers. We build text chatbots, voice-enabled bots that respond to spoken commands, and virtual assistants for internal help desks. Natural language processing (NLP) lets the bot understand how people actually phrase their questions, so conversations feel closer to talking with a member of staff than working through a menu.',
      'Bots are trained on your own content, including FAQs, policies and past customer conversations, using ChatGPT and other OpenAI models where they fit. We connect them across channels, such as your website, messaging apps and internal systems, so people get the same answer wherever they ask. After launch, bot analytics show which questions come in, where the bot struggles and where people drop off. We use that data to retrain and improve the bot, and we monitor it as part of an ongoing support plan.',
    ],
    benefits: [
      ['Answers at any hour', 'Customers and staff get consistent replies outside office hours, without waiting in a queue.'],
      ['One bot, many channels', 'The same assistant works on your website, messaging apps and internal systems.'],
      ['Improves with use', 'Analytics show where the bot struggles, so we can retrain it on real conversations.'],
    ],
    faqs: [
      ['Can a chatbot hand a conversation over to a human agent?', 'Yes. We set rules for when the bot passes a conversation to a person, such as a complaint, a payment issue or a question it cannot answer with confidence. The agent sees the conversation so far, so the customer does not have to repeat themselves. Handover routes connect to your existing support tools where possible.'],
      ['What is a voice-enabled bot?', 'A voice-enabled bot responds to spoken commands rather than typed messages. It can answer phone enquiries, guide callers to the right team or let staff query systems hands-free. It uses the same natural language processing as a text chatbot, so one knowledge base can sit behind both your voice and chat channels.'],
      ['How do you measure whether a chatbot is working?', 'Bot analytics track the questions asked, how many are resolved without a person, where users drop off and which answers get poor feedback. We review these with you after launch and use them to retrain the bot, add missing content and adjust handover rules, so performance improves over time.'],
    ],
  },
  'data-analytics-predictive-services': {
    seoTitle: 'Data Analytics and Predictive Services in Abu Dhabi',
    seoDescription: 'Data analytics services in Abu Dhabi: data warehousing, integration, dashboards, big data processing and machine learning forecasts from Hamdaz.',
    h1: 'Data analytics and predictive services',
    lead: 'We bring your data together, show it clearly and use machine learning to forecast what is likely to happen next.',
    overview: [
      'Most organisations hold useful data across ERP, CRM, spreadsheets and operational systems, but cannot see it in one place. Hamdaz provides data analytics services that fix this. We build data warehouses that consolidate and integrate data from different sources, then create interactive dashboards and visual reports that managers can read at a glance. For larger volumes, we set up big data processing that turns raw records into usable insight. The service suits SMEs that have outgrown spreadsheets, as well as larger organisations in energy, education, healthcare and retail that need one version of the truth.',
      'Once the data is reliable, we add predictive analytics. Statistical models and machine learning algorithms forecast trends such as demand or equipment failure, so decisions rest on evidence rather than instinct. We work on the cloud platform you prefer, including Microsoft Azure, AWS, Google Cloud and Oracle Cloud, and connect to business systems such as SAP, Zoho, Odoo and Salesforce. Our team in Abu Dhabi works with engineers in Kerala, India, to build, test and maintain the data pipelines, and we keep the models accurate as your data changes over time.',
    ],
    benefits: [
      ['One view of your data', 'Data from separate systems is consolidated into one warehouse you can trust.'],
      ['Clear dashboards', 'Interactive visuals show managers what is happening without waiting for manual reports.'],
      ['Forecasts you can act on', 'Machine learning models predict trends, so you can plan stock, staff and maintenance earlier.'],
    ],
    faqs: [
      ['Which systems can you pull data from?', 'Most business systems with a database, API or export, including ERP and CRM platforms such as SAP, Zoho, Odoo and Salesforce, plus spreadsheets, operational systems and IoT sensors. We map each source during discovery, agree how often the data should refresh, and build integration pipelines that clean and combine it in the warehouse.'],
      ['What is the difference between data analytics and predictive analytics?', 'Data analytics explains what has happened and what is happening now, through reports and dashboards. Predictive analytics uses statistical models and machine learning to estimate what is likely to happen next, such as demand or equipment failure. We usually build the first before the second, because forecasts are only as good as the historical data behind them.'],
      ['Do we need our own data team to use your analytics?', 'No. We design dashboards for the people who will use them, not for data specialists, and train your staff to read and filter them. We can maintain the warehouse, pipelines and models for you under a support agreement, or hand them over to an internal team with full documentation once they are ready.'],
    ],
  },
  'business-process-automation-and-digital-transformation-services': {
    seoTitle: 'Business Process Automation Services in Abu Dhabi',
    seoDescription: 'Business process automation and digital transformation in Abu Dhabi: process mapping, change management, and AI, IoT and blockchain integration from Hamdaz.',
    h1: 'Business process automation and digital transformation',
    lead: 'We map how work really gets done, remove the friction and automate what remains, with the change management to make it stick.',
    overview: [
      'Business process automation replaces manual, paper-based or repetitive steps with digital workflows. Digital transformation goes further, using new technology to change how an organisation operates and serves its customers. Hamdaz helps organisations do both, starting with business process mapping and analysis. We document each process as it runs today, find delays, duplicate data entry and manual approvals, and identify where automation will pay back. The service suits SMEs replacing spreadsheets and email chains, and larger organisations in government, energy, education and healthcare that are modernising older processes.',
      'Automation only works if people use it, so change management is part of every project. We plan the transition with your teams, train users and phase changes in. Where it fits, we integrate emerging technologies: AI for decisions and document handling, IoT for data from equipment and sites, and blockchain for transparent, secure digital transactions. We connect automated workflows to systems such as SAP, Zoho, Odoo and Salesforce. After go-live, we track results and keep improving the process, because a workflow that suits you today will need adjusting as the business grows.',
    ],
    benefits: [
      ['Fewer manual steps', 'Automated workflows cut duplicate data entry, paper forms and approval chasing.'],
      ['Changes that stick', 'Change management and training help teams adopt new processes rather than work around them.'],
      ['Continuous improvement', 'We measure results after launch and keep optimising the process as needs change.'],
    ],
    faqs: [
      ['Where should we start with business process automation?', 'Start with processes that are high in volume, rule-based and painful today, such as invoice approval, staff onboarding or service requests. We map these first and rank them by effort and benefit. Automating one or two well-chosen processes builds confidence and gives you a pattern to follow for the rest.'],
      ['Will automation replace our staff?', 'Automation removes repetitive tasks, not the need for people. Staff spend less time on data entry and chasing approvals, and more time on work that needs judgement and customer contact. Our change management work involves your teams early, explains what changes for each role and trains people on the new workflows.'],
      ['How does blockchain fit into digital transformation?', 'Blockchain keeps a shared, tamper-resistant record of transactions. It suits processes where several parties need to trust the same data, such as supply chain records or document verification. We only recommend it where that shared trust adds value; for most internal workflows, a standard database and workflow tool does the job well.'],
    ],
  },
  'rpa-robotic-process-automation': {
    seoTitle: 'RPA (Robotic Process Automation) Services in the UAE',
    seoDescription: 'RPA services in the UAE: automation assessment, RPA tool selection and implementation, workflow integration, bot monitoring and AI-driven RPA from Hamdaz.',
    h1: 'RPA (robotic process automation)',
    lead: 'Software bots that handle repetitive, rule-based tasks across your existing applications, so your people can focus on work that needs judgement.',
    overview: [
      'Robotic process automation (RPA) uses software bots to carry out tasks a person would otherwise do on screen: copying data between systems, filling in forms, reconciling records and producing routine reports. It works with your existing applications, so you can automate without replacing core systems. Hamdaz offers RPA for finance, HR, operations and customer service teams in organisations of every size. We begin with a process automation assessment that identifies and prioritises the tasks best suited to bots, based on their volume, their rules and the effort they consume today.',
      'We are vendor-agnostic, so we select the RPA tool that fits your processes, systems and budget, then implement the bots and integrate them with your existing business workflows. Bots need care after launch: applications change, screens move and rules are updated. Our bot monitoring and maintenance service keeps them running and fixes issues before they stall work. Where tasks need more than fixed rules, such as reading documents or classifying requests, we add AI-driven RPA for better decision-making. RPA often sits inside a wider business process automation programme, which we also deliver.',
    ],
    benefits: [
      ['Fewer errors', 'Bots follow the same rules every time, reducing mistakes in repetitive data work.'],
      ['No system replacement', 'Bots work through existing applications, so you automate without rebuilding core systems.'],
      ['Bots kept healthy', 'Monitoring and maintenance keep automations running as your applications and rules change.'],
    ],
    faqs: [
      ['Which tasks are best suited to RPA?', 'Tasks that are repetitive, high in volume, rule-based and use structured digital data. Examples include moving data between systems, processing standard forms, reconciling records and producing routine reports. Tasks that need judgement or handle unstructured documents may need AI-driven RPA. Our process automation assessment scores each candidate, so you start with the ones that return most.'],
      ['Which RPA platform do you use?', 'We are vendor-agnostic and do not push a single platform. During tool selection we compare options against your processes, the applications the bots must work with, your licensing model and your in-house skills. We then implement the chosen tool and document the bots, so your team can understand and manage them.'],
      ['What happens when an application the bot uses changes?', 'A change to a screen, field or login can stop a bot. Our bot monitoring and maintenance service watches bots in operation, alerts us when one fails and fixes it. We also ask to be told about planned system changes, so bots can be updated and tested before the change goes live.'],
    ],
  },
  'digital-twin': {
    seoTitle: 'Digital Twin Solutions for UAE Industry and Assets',
    seoDescription: 'Digital twin solutions in the UAE: IoT integration, simulation and modelling, predictive maintenance and supply chain optimisation, with edge computing.',
    h1: 'Digital twin solutions',
    lead: 'A live digital replica of your equipment, sites or supply chain, fed by real data, for monitoring, testing scenarios and preventing failures.',
    overview: [
      'A digital twin is a digital replica of a physical asset, process or system, kept up to date by data from sensors and operational systems. It lets you watch what is happening in real time, test changes safely and spot problems before they cause downtime. Hamdaz builds digital twins for organisations with valuable physical assets, including oil and gas and energy operators, industrial sites, facilities and logistics teams. We connect physical equipment to the twin through IoT integration, so the model reflects actual conditions on site rather than the original design drawings.',
      'With a live model in place, we use simulation and modelling to run scenarios and find the best settings before you change anything on site. Predictive maintenance uses the twin to forecast equipment failures, so repairs are planned rather than reactive. For supply chains, a twin shows how stock, transport and demand interact and where to optimise. We integrate edge computing so data is processed close to the equipment and the twin updates in real time. Our IT/OT, data analytics and cloud teams work together, so sensors, networks, models and dashboards come from one partner.',
    ],
    benefits: [
      ['Fewer unplanned failures', 'Predictive maintenance flags equipment problems early, so repairs happen on your schedule.'],
      ['Test before you change', 'Simulate new settings, layouts or demand scenarios without risk to live operations.'],
      ['Real-time visibility', 'IoT and edge computing keep the twin updated with what is happening now.'],
    ],
    faqs: [
      ['What do we need in place to build a digital twin?', 'You need data from the asset or process, usually from sensors, control systems such as SCADA, or maintenance records. If sensors are missing, we can add IoT devices and connect them. During discovery we assess what data exists and tell you what is needed for the twin to be useful, before any modelling starts.'],
      ['Is a digital twin only for large industrial operators?', 'No. Large energy and industrial sites have a lot to gain, but twins also help with buildings, facilities and supply chains. The scope can start small, such as one critical machine or one warehouse, and grow once the value is proven. We size the first twin around a clear problem, such as reducing breakdowns.'],
      ['How does a digital twin support predictive maintenance?', 'The twin combines live sensor data with the history of how the equipment has behaved. Analytics and machine learning models spot patterns that come before a failure, such as rising vibration or temperature. Maintenance teams get an early warning and can plan the repair, order parts and avoid an unplanned stop.'],
    ],
  },
  'cloud-services-migration': {
    seoTitle: 'Cloud Migration and Cloud Services in Abu Dhabi, UAE',
    seoDescription: 'Cloud migration UAE services from Hamdaz: cloud strategy, migration to Azure, AWS, GCP and OCI, multi-cloud management, serverless design and Kubernetes.',
    h1: 'Cloud services and cloud migration',
    lead: 'A clear cloud strategy, a planned move of your applications and data, and well-run cloud environments on the platforms that suit you.',
    overview: [
      'Cloud migration moves applications, data and infrastructure from on-premises servers to cloud platforms. Done well, it reduces hardware upkeep and makes it easier to scale. Done badly, it moves old problems onto a new bill. Hamdaz provides cloud migration services in the UAE for organisations of every size, starting with cloud strategy consulting. We review your applications, dependencies, security requirements and costs, then build a customised adoption plan that sets out what should move, in what order, and to which platform: Microsoft Azure, AWS, Google Cloud or Oracle Cloud.',
      'We then move applications and data in planned stages, with testing and backups at each step. Many organisations use more than one provider, so our multi-cloud management optimises operations across them. Where new services are built, we design serverless architectures using tools such as AWS Lambda and Azure Functions, and use Kubernetes for container orchestration. Our team in Abu Dhabi works with engineers in Kerala, India. After migration, our managed services team can monitor, patch and back up the environment, and our cybersecurity team secures it, so one partner stays accountable.',
    ],
    benefits: [
      ['A plan before the move', 'Cloud strategy consulting sets out what moves, where it goes and in what order.'],
      ['Lower-risk migration', 'Staged moves with testing and backups protect day-to-day operations.'],
      ['Modern architecture', 'Serverless and Kubernetes designs help new applications scale and stay easier to run.'],
    ],
    faqs: [
      ['Should every application move to the cloud?', 'No. Some applications run better on-premises because of latency, licensing, cost or regulation. Our cloud strategy work sorts applications into those to move as they are, those to modernise during the move, those to replace with software-as-a-service and those to keep in your data centre. Many clients end up with a hybrid model.'],
      ['What is serverless architecture and when does it make sense?', 'Serverless means your code runs on services such as AWS Lambda or Azure Functions, and the cloud provider manages the servers. You pay when the code runs. It suits event-driven tasks, APIs and workloads with uneven demand. For steady, long-running systems, containers on Kubernetes or virtual machines can be a better fit.'],
      ['Can you manage our cloud after migration?', 'Yes. Our managed services team can monitor your cloud environment, apply patches, run backups and handle support requests, with multi-cloud management where you use more than one provider. We also review usage and costs, so resources match what you actually need. You can hand us the whole environment or only parts of it.'],
    ],
  },
  'partner-services-msft-azure-aws-gcp-oci': {
    seoTitle: 'Microsoft Azure, AWS, GCP and OCI Partner Services',
    seoDescription: 'Microsoft Azure partner services, plus AWS, Google Cloud and Oracle Cloud: adoption planning, migration, cost optimisation and managed cloud from Abu Dhabi.',
    h1: 'Partner services for Microsoft Azure, AWS, GCP and OCI',
    lead: 'Help choosing, adopting and running Microsoft Azure, AWS, Google Cloud and Oracle Cloud, with an eye on cost from day one.',
    overview: [
      'Public cloud platforms offer hundreds of services, and choosing well takes experience. Hamdaz provides partner services across Microsoft Azure, AWS, Google Cloud Platform (GCP) and Oracle Cloud Infrastructure (OCI) for organisations that want to use these platforms properly rather than simply rent servers on them. We start with cloud consultation and adoption planning: understanding your workloads, licences, skills and compliance needs, then recommending the platform, or combination of platforms, that fits. Because we work across all four, our advice is based on your requirements rather than a single vendor’s priorities.',
      'We then handle migration and integration, moving applications and data to the chosen platform and connecting them to the systems that stay on-premises. Cost optimisation is ongoing work: we right-size resources, remove idle services and use the pricing options each provider offers. Our managed services for cloud platforms provide continuing support and maintenance, so your environment stays patched, monitored and backed up. We also integrate the AI services and serverless computing each provider offers, which links this service with our generative AI and data analytics work for clients who want both.',
    ],
    benefits: [
      ['Independent platform advice', 'We work across Azure, AWS, GCP and OCI, so recommendations follow your needs.'],
      ['Controlled cloud spend', 'Right-sizing and removing idle resources keep monthly bills in line with actual use.'],
      ['Support after go-live', 'Managed services keep cloud platforms monitored, patched and backed up.'],
    ],
    faqs: [
      ['Why use a partner instead of buying directly from Microsoft, AWS, Google or Oracle?', 'A partner helps you design, migrate, secure and run your cloud, not just pay for it. We assess your needs, configure the platform properly, integrate it with your other systems and support it afterwards. Because we work across four providers, we can also compare options objectively and manage a multi-cloud setup as one environment.'],
      ['How do you reduce cloud costs?', 'We review what you are running against what you actually use. Typical steps include right-sizing over-provisioned resources, switching off idle services, scheduling non-production environments and choosing suitable pricing options from each provider. We report on spend regularly so costs stay visible, and adjust as your usage changes.'],
      ['Can you add AI services from the cloud providers to our applications?', 'Yes. Microsoft Azure, AWS, Google Cloud and Oracle Cloud each offer AI and machine learning services, alongside serverless computing. We integrate these into your applications and workflows, for example to add language processing, document handling or predictive models, and connect them with our generative AI and data analytics services.'],
    ],
  },
  'data-center-infrastructure-services': {
    seoTitle: 'Data Centre and Infrastructure Services in Abu Dhabi',
    seoDescription: 'Data centre services in Abu Dhabi: design and optimisation, server virtualisation, hyper-converged infrastructure, monitoring and edge computing from Hamdaz.',
    h1: 'Data centre and infrastructure services',
    lead: 'Reliable, scalable data centres and server rooms, designed, built, virtualised and monitored by one Abu Dhabi system integrator.',
    overview: [
      'Your data centre or server room runs the systems your organisation depends on, so it must be reliable and ready to grow. Hamdaz provides data centre services in Abu Dhabi for organisations that keep critical systems on-premises or in hybrid setups. We design and optimise data centre layouts, then deliver the infrastructure inside them: servers, storage and SAN switches, converged and hyper-converged platforms such as Nutanix, and server, desktop, application and storage virtualisation for better use of hardware. Backup and disaster recovery, on-premises or in the cloud, protect the data and support business continuity.',
      'Once the environment is running, IT infrastructure monitoring tools give real-time visibility of performance and faults. For sites that need low latency, we deploy edge computing so processing happens close to where data is created. We are vendor-agnostic and work with Dell, HPE, Nutanix, Pure Storage, Veeam and Cisco, and with Schneider Electric and Vertiv for power and cooling. Because IT, ELV and cybersecurity come under one contract, the same partner can handle racks, power, cooling, access control, networks and security. Hamdaz is ISO 9001, 14001 and 45001 certified.',
    ],
    benefits: [
      ['Better use of hardware', 'Virtualisation and hyper-converged infrastructure run more workloads on fewer servers.'],
      ['Faults caught early', 'Real-time monitoring flags problems before they affect users.'],
      ['One accountable partner', 'Infrastructure, power, cooling and security delivered under one contract.'],
    ],
    faqs: [
      ['What is hyper-converged infrastructure and is it right for us?', 'Hyper-converged infrastructure (HCI) combines compute, storage and networking in one software-managed platform, such as Nutanix. It is simpler to manage and expand than separate servers, storage arrays and SAN switches. It suits many virtualised workloads, while some high-performance or specialist systems still run better on converged or traditional designs. We assess your workloads and recommend accordingly.'],
      ['Can you upgrade an existing server room rather than build a new one?', 'Yes. Many projects start with an existing room. We review the layout, racks, power, cooling, cabling and the systems inside, then plan upgrades in stages to keep services running. Typical work includes consolidating servers through virtualisation, refreshing storage, improving backup and adding monitoring.'],
      ['What is edge computing used for?', 'Edge computing processes data near where it is produced, such as a plant, a remote site or a building, rather than sending everything to a central data centre or cloud. It suits applications that need low latency or must keep working when links are slow, including industrial monitoring, video analytics and digital twins.'],
    ],
  },
  'managed-services': {
    seoTitle: 'Managed IT Services in Abu Dhabi with a 24x7 NOC',
    seoDescription: 'Managed IT services in Abu Dhabi: proactive monitoring, a 24x7 NOC, service desk, remote support, patch management and backup and disaster recovery.',
    h1: 'Managed IT services in Abu Dhabi',
    lead: 'Proactive monitoring, a responsive service desk, patching and backup, so your IT systems and applications keep running smoothly.',
    overview: [
      'Managed IT services hand the daily running of your IT to a specialist partner, so problems are found and fixed before they disrupt work. Hamdaz offers managed IT services in Abu Dhabi for organisations that lack the in-house team to cover every system around the clock, or want their own staff on projects rather than routine support. The service includes a service desk, a 24x7 network operations centre (NOC), proactive monitoring and maintenance, remote IT support for distributed teams, patch management to keep systems current with security updates, and backup and disaster recovery to protect data.',
      'We already run IT operations with teams working on client sites for major energy and education organisations, so we understand both remote and on-site support. Monitoring covers servers, networks, storage, cloud platforms and applications, and we add AI-driven automation for predictive maintenance, spotting patterns that come before failures. We are vendor-agnostic and support equipment and software from Microsoft, Cisco, Dell, HPE, Nutanix and Veeam. Because IT, AV, ELV and cybersecurity sit under one contract, you can bring several suppliers under one accountable partner. Hamdaz is ISO 9001 certified for quality management.',
    ],
    benefits: [
      ['Problems fixed earlier', 'Proactive monitoring and a 24x7 NOC catch issues before users notice them.'],
      ['Systems kept current', 'Patch management applies security updates on a planned, tested schedule.'],
      ['Data protected', 'Backup and disaster recovery keep your data recoverable when things go wrong.'],
    ],
    faqs: [
      ['Can you support our IT staff rather than replace them?', 'Yes. Many clients use a co-managed model. Your team keeps ownership of systems and priorities, while we cover monitoring, patching, backup and out-of-hours support, or take on specific areas such as networks or servers. We agree responsibilities and escalation routes at the start, so nothing falls between the two teams.'],
      ['Do you provide on-site support as well as remote support?', 'Yes. Most issues are resolved remotely through our service desk and monitoring tools, which is faster for everyone. Where a problem needs hands on equipment, engineers attend on site. We also have IT operations teams working on client sites for major energy and education organisations, and can place resident engineers where a site needs one.'],
      ['How is service quality measured?', 'We agree service levels at the start, such as response and resolution targets for each priority. Tickets, alerts and actions are logged, and we report on performance, recurring issues and planned work. Regular reviews show you what we have done, what we recommend next and where your environment carries risk.'],
    ],
  },
  'it-ot-services': {
    seoTitle: 'IT/OT Convergence Services for Industry in the UAE',
    seoDescription: 'IT/OT services in the UAE: Industrial IoT, cyber-physical integration, SCADA deployment, legacy OT modernisation and edge computing for industrial sites.',
    h1: 'IT/OT convergence services',
    lead: 'We connect operational technology on the plant floor with enterprise IT, so industrial data reaches the people and systems that need it.',
    overview: [
      'Operational technology (OT) runs physical processes: pumps, valves, production lines and building systems. Information technology (IT) runs the business. For years the two were kept apart, which left plant data out of reach of planners and analysts. IT/OT convergence connects them securely. Hamdaz provides IT/OT services for oil and gas, energy and other industrial operators in the UAE. We implement Industrial IoT (IIoT) to connect and optimise industrial processes, and integrate cyber-physical systems so digital and physical systems work together as one operation rather than as separate islands.',
      'We deploy SCADA (supervisory control and data acquisition) systems for real-time monitoring and control, and modernise legacy operational technology that has become hard to maintain or secure. Edge computing processes data close to the equipment, so decisions can be made in real time even when links to the data centre are limited. Hamdaz is a registered ADNOC supplier, ICV certified and ISO 45001 certified for occupational health and safety, which matters on industrial sites. Our cybersecurity, data analytics and digital twin teams build on the same connections, turning OT data into monitoring, forecasts and maintenance plans.',
    ],
    benefits: [
      ['Plant data within reach', 'Operational data flows securely to dashboards, analytics and planning systems.'],
      ['Real-time control', 'SCADA and edge computing give operators live visibility and faster responses.'],
      ['Longer life for legacy OT', 'Modernisation keeps older equipment productive while improving efficiency and security.'],
    ],
    faqs: [
      ['Does connecting OT to IT increase cyber risk?', 'It can if done carelessly, which is why we design security in from the start. We segment networks, control which systems can talk to each other, monitor traffic and secure remote access. Our cybersecurity team works alongside the IT/OT engineers, so integration and protection are planned together rather than added afterwards.'],
      ['Can you work with our existing SCADA and control systems?', 'Yes. Most projects start with equipment already in place. We assess your current SCADA, controllers and sensors, then decide whether to integrate, extend or modernise them. Legacy system modernisation upgrades older operational technology in stages, so production keeps running while improvements are made.'],
      ['What is the role of edge computing in IT/OT?', 'Edge computing processes data at or near the industrial site instead of sending it all to a central system. It cuts delay for time-critical decisions, reduces the data sent over long links and keeps local monitoring working if a connection drops. Edge data can still feed central analytics, cloud platforms and digital twins.'],
    ],
  },
};

export const articles = [];
