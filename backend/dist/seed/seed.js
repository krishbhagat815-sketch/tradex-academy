"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeed = runSeed;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_js_1 = require("../db/database.js");
const schema_js_1 = require("../db/schema.js");
async function runSeed() {
    console.log('Starting database seeding...');
    await (0, schema_js_1.initSchema)();
    // Clear existing data for clean idempotent seed
    const tables = [
        'users', 'categories', 'instructors', 'courses', 'modules',
        'lessons', 'enrollments', 'lesson_progress', 'orders', 'coupons',
        'reviews', 'wishlist', 'certificates', 'notes', 'site_content', 'settings'
    ];
    for (const t of tables) {
        (0, database_js_1.execute)(`DELETE FROM ${t};`);
    }
    const salt = bcryptjs_1.default.genSaltSync(10);
    const adminPasswordHash = bcryptjs_1.default.hashSync('Admin@123', salt);
    const studentPasswordHash = bcryptjs_1.default.hashSync('Student@123', salt);
    const now = new Date().toISOString();
    // 1. Create Users
    const adminId = 'usr-admin-101';
    const studentId = 'usr-student-202';
    const student2Id = 'usr-student-203';
    (0, database_js_1.execute)(`
    INSERT INTO users (id, name, email, password, role, avatar, headline, bio, status, created_at, updated_at)
    VALUES 
    (?, ?, ?, ?, 'admin', ?, ?, ?, 'active', ?, ?),
    (?, ?, ?, ?, 'student', ?, ?, ?, 'active', ?, ?),
    (?, ?, ?, ?, 'student', ?, ?, ?, 'active', ?, ?)
  `, [
        adminId, 'Platform Administrator', 'admin@tradex.com', adminPasswordHash,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        'Head of Academic Operations', 'Managing curriculum standards, instructor onboardings, and platform operations.',
        now, now,
        studentId, 'David Miller', 'student@tradex.com', studentPasswordHash,
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
        'Software Engineer & Data Enthusiast', 'Passionate about data systems, financial engineering, and distributed architectures.',
        now, now,
        student2Id, 'Sarah Lin', 'sarah.lin@example.com', studentPasswordHash,
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
        'Frontend Developer', 'Building modern web applications and learning AI engineering.',
        now, now
    ]);
    // 2. Instructors
    const inst1Id = 'inst-01';
    const inst2Id = 'inst-02';
    const inst3Id = 'inst-03';
    const inst4Id = 'inst-04';
    (0, database_js_1.execute)(`
    INSERT INTO instructors (id, name, email, avatar, title, bio, expertise, rating, students_count, courses_count, social_links, created_at)
    VALUES
    (?, ?, ?, ?, ?, ?, ?, 4.95, 24500, 4, ?, ?),
    (?, ?, ?, ?, ?, ?, ?, 4.92, 18900, 3, ?, ?),
    (?, ?, ?, ?, ?, ?, ?, 4.88, 14200, 2, ?, ?),
    (?, ?, ?, ?, ?, ?, ?, 4.91, 16300, 3, ?, ?)
  `, [
        inst1Id, 'Dr. Alex Mercer', 'alex.mercer@tradex.com',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        'Principal AI Scientist & Ex-Google Lead',
        '15+ years in artificial intelligence, deep neural networks, and scalable data pipeline engineering. Led research teams at top tier tech institutes.',
        'Data Science, Python, Deep Learning, ML Engineering',
        JSON.stringify({ linkedin: 'https://linkedin.com', github: 'https://github.com', twitter: 'https://twitter.com' }),
        now,
        inst2Id, 'Sarah Jenkins', 'sarah.jenkins@tradex.com',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
        'Staff Web Architect & Open Source Maintainer',
        'Veteran software engineer specializing in enterprise TypeScript, React ecosystem, distributed services, and microfrontends.',
        'Full-Stack, Next.js, TypeScript, Cloud Architecture',
        JSON.stringify({ linkedin: 'https://linkedin.com', github: 'https://github.com' }),
        now,
        inst3Id, 'Marcus Vance', 'marcus.vance@tradex.com',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
        'Quantitative Portfolio Strategist',
        'Former high-frequency trading analyst. Specializes in statistical arbitrage, algorithmic trading bots, and low-latency order routing systems.',
        'Quant Finance, Python, Algorithmic Trading, Risk Models',
        JSON.stringify({ linkedin: 'https://linkedin.com', website: 'https://tradex.com' }),
        now,
        inst4Id, 'Elena Rostova', 'elena.rostova@tradex.com',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
        'Head of Product Design & Design Systems',
        'Award-winning product designer who has crafted digital experiences for millions of active users. Advocate for clean typography and intuitive interaction design.',
        'UI/UX Design, Design Systems, Figma, User Research',
        JSON.stringify({ dribbble: 'https://dribbble.com', linkedin: 'https://linkedin.com' }),
        now
    ]);
    // 3. Categories
    const catData = [
        { id: 'cat-data-analytics', name: 'Data Science & Analytics', slug: 'data-science-analytics', description: 'Master SQL, Big Data, Business Intelligence, and statistical data modeling.', icon: 'Database', order: 1 },
        { id: 'cat-web-dev', name: 'Full-Stack Web Development', slug: 'web-development', description: 'Build enterprise-grade modern web applications with React, Next.js, Node, and TypeScript.', icon: 'Code', order: 2 },
        { id: 'cat-ai-ml', name: 'AI & Machine Learning', slug: 'ai-machine-learning', description: 'Train neural nets, build LLM agents, RAG systems, and deploy production ML models.', icon: 'Cpu', order: 3 },
        { id: 'cat-trading-finance', name: 'Algorithmic Trading & Finance', slug: 'trading-finance', description: 'Quantitative portfolio models, automated bot execution, and financial risk engineering.', icon: 'TrendingUp', order: 4 },
        { id: 'cat-cloud-devops', name: 'Cloud & DevOps Engineering', slug: 'cloud-devops', description: 'Container orchestration, Kubernetes, CI/CD pipelines, and cloud infrastructure.', icon: 'Cloud', order: 5 },
        { id: 'cat-ui-ux', name: 'UI/UX Design & Product', slug: 'ui-ux-design', description: 'User research, wireframing, high-fidelity Figma design systems, and interaction design.', icon: 'Layout', order: 6 },
    ];
    for (const c of catData) {
        (0, database_js_1.execute)(`
      INSERT INTO categories (id, name, slug, description, icon, course_count, order_num)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `, [c.id, c.name, c.slug, c.description, c.icon, c.order]);
    }
    // Sample MP4 video streams that play reliably in all browsers
    const sampleVideo1 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    const sampleVideo2 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
    const sampleVideo3 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    const sampleVideo4 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';
    // 4. Courses
    const courses = [
        {
            id: 'crs-data-01',
            title: 'Complete Data Analytics & Business Intelligence Masterclass',
            slug: 'complete-data-analytics-bi-masterclass',
            short_description: 'Become a data-driven leader. Master modern SQL, PowerBI, statistical analytics, and predictive business dashboards from scratch.',
            description: `### Transform Your Career with Data
In today's high-velocity tech world, raw data is the new oil, but only actionable analytics creates value. This comprehensive masterclass takes you from foundational querying to architecting enterprise-grade business intelligence ecosystems.

#### What You Will Experience:
* **Real-World Case Studies**: Analyze genuine transactional datasets from global eCommerce platforms, SaaS metrics, and financial reporting.
* **Modern Tooling**: Work with PostgreSQL, PowerBI, Tableau, Python Pandas, and automated executive KPI dashboards.
* **Capstone Portfolio Project**: Deliver an end-to-end data pipeline with real-time stream ingestion and executive visualization.`,
            category_id: 'cat-data-analytics',
            instructor_id: inst1Id,
            thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo1,
            price: 129.99,
            discount_price: 79.99,
            difficulty_level: 'All Levels',
            duration: '24.5 hours',
            language: 'English',
            learning_outcomes: JSON.stringify([
                'Master complex SQL queries, window functions, CTEs, and execution plan optimization',
                'Build interactive executive dashboards in PowerBI and Tableau with custom DAX measures',
                'Apply predictive regression and cohort retention models to real business data',
                'Automate report generation and data hygiene routines with Python scripts',
                'Present high-impact visual narratives directly to C-level stakeholders'
            ]),
            requirements: JSON.stringify([
                'No prior programming experience required; we start from basic principles',
                'A computer with Windows, Mac, or Linux and an internet connection',
                'Willingness to practice hands-on querying on provided datasets'
            ]),
            target_audience: JSON.stringify([
                'Aspiring Data Analysts and Business Intelligence Developers',
                'Product managers and business founders wanting data fluency',
                'Excel power users transitioning into relational databases and BI tools'
            ]),
            tags: JSON.stringify(['Data Analytics', 'SQL', 'PowerBI', 'Tableau', 'Business Intelligence', 'Python']),
            status: 'published',
            featured: 1,
            popular: 1,
            is_new: 0,
            enrolled_count: 3840,
            rating: 4.9,
            review_count: 428,
            modules: [
                {
                    title: 'Module 1: Foundations of Modern Data Analytics',
                    description: 'Understanding data lifecycles, problem framing, and analytical taxonomy.',
                    lessons: [
                        {
                            title: '1.1 The Modern Analytics Landscape',
                            description: 'Explore how top companies structure their data teams and why business intelligence drives 10x ROI.',
                            video_url: sampleVideo1,
                            video_duration: '14:20',
                            is_preview: 1,
                            resources: [
                                { name: 'Analytics-Taxonomy-Guide.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', size: '2.4 MB' },
                                { name: 'Course-Dataset-Pack.zip', url: 'https://example.com/datasets.zip', type: 'zip', size: '14.8 MB' }
                            ],
                            quizzes: [
                                {
                                    question: 'What is the primary difference between descriptive and predictive analytics?',
                                    options: [
                                        'Descriptive explains what happened, while predictive forecasts what will happen',
                                        'Descriptive requires machine learning, while predictive uses basic SQL',
                                        'Descriptive is only for financial data, predictive is for customer data',
                                        'There is no technical difference between the two terms'
                                    ],
                                    correct_index: 0,
                                    explanation: 'Descriptive analytics examines historical data to understand past events, whereas predictive analytics uses statistical models to forecast future trends.'
                                }
                            ]
                        },
                        {
                            title: '1.2 Core Data Architecture & Pipeline Fundamentals',
                            description: 'OLTP vs OLAP databases, data lakes, warehouses, and modern lakehouse architecture.',
                            video_url: sampleVideo2,
                            video_duration: '22:15',
                            is_preview: 0,
                            resources: [
                                { name: 'Architecture-Cheatsheet.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', size: '1.2 MB' }
                            ],
                            quizzes: [
                                {
                                    question: 'Which database type is optimized for heavy analytical aggregations over millions of rows?',
                                    options: ['OLTP', 'OLAP', 'Key-Value Cache', 'Document Store only'],
                                    correct_index: 1,
                                    explanation: 'OLAP (Online Analytical Processing) systems use columnar storage and parallel query execution optimized for aggregation workloads.'
                                }
                            ]
                        },
                        {
                            title: '1.3 Analytical Problem Framing & Actionable KPIs',
                            description: 'Defining North Star metrics, cohort retention, CAC, LTV, and churn modeling.',
                            video_url: sampleVideo3,
                            video_duration: '18:40',
                            is_preview: 0,
                            resources: [
                                { name: 'KPI-Definition-Template.xlsx', url: 'https://example.com/kpi.xlsx', type: 'xlsx', size: '640 KB' }
                            ],
                            quizzes: []
                        }
                    ]
                },
                {
                    title: 'Module 2: Advanced Relational Querying with SQL',
                    description: 'From multi-table joins to advanced window functions and query optimization.',
                    lessons: [
                        {
                            title: '2.1 Window Functions: ROW_NUMBER, RANK, DENSE_RANK, and LEAD/LAG',
                            description: 'Compute running totals, moving averages, and period-over-period growth rates effortlessly.',
                            video_url: sampleVideo4,
                            video_duration: '26:50',
                            is_preview: 1,
                            resources: [
                                { name: 'SQL-Window-Functions-Mastery.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', size: '3.1 MB' }
                            ],
                            quizzes: [
                                {
                                    question: 'Which window function allows you to look ahead to the next row in an ordered partition?',
                                    options: ['LAG()', 'LEAD()', 'FIRST_VALUE()', 'NTH_VALUE()'],
                                    correct_index: 1,
                                    explanation: 'LEAD() fetches data from a subsequent row without requiring self-joins.'
                                }
                            ]
                        },
                        {
                            title: '2.2 Common Table Expressions (CTEs) & Recursive Hierarchies',
                            description: 'Structuring readable, modular SQL queries and traversing organizational hierarchies.',
                            video_url: sampleVideo1,
                            video_duration: '21:10',
                            is_preview: 0,
                            resources: [],
                            quizzes: []
                        },
                        {
                            title: '2.3 SQL Query Performance Tuning & EXPLAIN ANALYZE',
                            description: 'Index strategies, sequential scans vs index scans, and avoiding Cartesian products.',
                            video_url: sampleVideo2,
                            video_duration: '25:35',
                            is_preview: 0,
                            resources: [
                                { name: 'Indexing-Guide.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', size: '1.8 MB' }
                            ],
                            quizzes: []
                        }
                    ]
                },
                {
                    title: 'Module 3: Business Intelligence & Executive Dashboards',
                    description: 'Creating high-impact dashboards with PowerBI and visual storytelling techniques.',
                    lessons: [
                        {
                            title: '3.1 Visual Perception & Dashboard Ergonomics',
                            description: 'Color theory, cognitive load reduction, and designing for executive readability.',
                            video_url: sampleVideo3,
                            video_duration: '19:45',
                            is_preview: 0,
                            resources: [],
                            quizzes: []
                        },
                        {
                            title: '3.2 PowerBI Data Modeling & Star Schema Architecture',
                            description: 'Fact tables, dimension tables, bidirectional filters, and relationship cardinalities.',
                            video_url: sampleVideo4,
                            video_duration: '31:10',
                            is_preview: 0,
                            resources: [],
                            quizzes: []
                        }
                    ]
                }
            ]
        },
        {
            id: 'crs-web-02',
            title: 'Full-Stack Next.js 15, TypeScript & Distributed Cloud Architecture',
            slug: 'fullstack-nextjs-typescript-cloud-architecture',
            short_description: 'Build enterprise production web applications with React Server Components, TypeScript, Tailwind CSS, PostgreSQL, and scalable microservices.',
            description: `### The Complete Guide to Enterprise Full-Stack Engineering
Level up from basic frontend coding to architecting bulletproof production applications. You will learn modern full-stack workflows adopted by top tier tech unicorns.

#### Curriculum Highlights:
* **Server Components & Streaming**: Master the Next.js App Router, Suspense boundaries, and zero-bundle-size server rendering.
* **Type Safety from DB to UI**: Share contracts across backend and client with tRPC, Prisma/Drizzle, and Zod.
* **Authentication & Role-Based Security**: Implement robust session tokens, OAuth2, and RBAC policies.`,
            category_id: 'cat-web-dev',
            instructor_id: inst2Id,
            thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo2,
            price: 149.99,
            discount_price: 89.99,
            difficulty_level: 'Intermediate',
            duration: '32.0 hours',
            language: 'English',
            learning_outcomes: JSON.stringify([
                'Architect end-to-end full-stack applications with Next.js 15 App Router and TypeScript',
                'Implement resilient authentication, JWT tokens, and fine-grained authorization middleware',
                'Optimize Core Web Vitals (LCP, INP, CLS) for sub-second page loads',
                'Deploy production applications with Docker containers on cloud serverless infrastructure',
                'Write robust automated integration and end-to-end tests'
            ]),
            requirements: JSON.stringify([
                'Solid foundation in JavaScript (ES6+) and basic React concepts',
                'Basic familiarity with HTML, CSS, and terminal commands'
            ]),
            target_audience: JSON.stringify([
                'Frontend developers seeking full-stack proficiency',
                'Junior to mid-level engineers aiming for senior tech lead roles',
                'Entrepreneurs building scalable web MVPs and SaaS platforms'
            ]),
            tags: JSON.stringify(['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Docker']),
            status: 'published',
            featured: 1,
            popular: 1,
            is_new: 1,
            enrolled_count: 2950,
            rating: 4.94,
            review_count: 310,
            modules: [
                {
                    title: 'Module 1: Architecture & Modern Next.js 15 Foundations',
                    description: 'App Router architecture, React Server Components vs Client Components.',
                    lessons: [
                        {
                            title: '1.1 Deep Dive: React Server Components vs Client Components',
                            description: 'Learn when to run on the server and when to ship JavaScript to the client.',
                            video_url: sampleVideo2,
                            video_duration: '21:40',
                            is_preview: 1,
                            resources: [
                                { name: 'RSC-Mental-Model.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', size: '1.6 MB' }
                            ],
                            quizzes: []
                        },
                        {
                            title: '1.2 Server Actions, Mutations & Optimistic UI Updates',
                            description: 'Execute mutations directly from forms without writing boilerplate API endpoints.',
                            video_url: sampleVideo3,
                            video_duration: '28:15',
                            is_preview: 0,
                            resources: [],
                            quizzes: []
                        }
                    ]
                },
                {
                    title: 'Module 2: Database Layer, Caching & Scalability',
                    description: 'PostgreSQL connection pooling, caching strategies, and data mutations.',
                    lessons: [
                        {
                            title: '2.1 Connection Pooling and Zero-Latency DB Reads',
                            description: 'How to handle serverless connection bursts without crashing your database.',
                            video_url: sampleVideo4,
                            video_duration: '24:00',
                            is_preview: 0,
                            resources: [],
                            quizzes: []
                        }
                    ]
                }
            ]
        },
        {
            id: 'crs-ai-03',
            title: 'Generative AI Engineering: LLMs, Multi-Agent Systems & RAG',
            slug: 'generative-ai-engineering-llms-rag-agents',
            short_description: 'Build production-grade GenAI applications: fine-tuning, embeddings, vector databases, hybrid search RAG pipelines, and autonomous agent loops.',
            description: `### Master the Frontier of Artificial Intelligence
Generative AI is reshaping every software product. This practical engineering course equips you with the real-world skills to design, build, and deploy production AI agents and enterprise RAG architectures.

#### You Will Build:
* **Production RAG Engine**: Multi-modal document ingestion, semantic chunking, and re-ranking for ultra-low hallucination.
* **Autonomous Agent Teams**: Implement planning, memory systems, reflection, and external tool execution using LangChain and native APIs.
* **Enterprise Guardrails**: Rate limits, output validation with Pydantic, and adversarial prompt defense.`,
            category_id: 'cat-ai-ml',
            instructor_id: inst1Id,
            thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo3,
            price: 169.99,
            discount_price: 99.99,
            difficulty_level: 'Advanced',
            duration: '28.0 hours',
            language: 'English',
            learning_outcomes: JSON.stringify([
                'Build production RAG pipelines with hybrid vector search and cross-encoder re-ranking',
                'Orchestrate autonomous agent systems with memory, self-correction, and tool calling',
                'Evaluate LLM outputs with automated hallucination benchmarks and golden test sets',
                'Fine-tune open-weight models using LoRA and QLoRA on domain datasets',
                'Deploy scalable AI microservices with streaming SSE responses'
            ]),
            requirements: JSON.stringify([
                'Proficiency in Python programming',
                'Basic understanding of REST APIs and web architecture'
            ]),
            target_audience: JSON.stringify([
                'Software engineers wanting to transition into AI Engineering',
                'Data scientists moving from notebooks to production services',
                'CTOs and technical architects designing enterprise AI strategies'
            ]),
            tags: JSON.stringify(['AI', 'Machine Learning', 'LLMs', 'RAG', 'LangChain', 'Python', 'Vector DB']),
            status: 'published',
            featured: 1,
            popular: 1,
            is_new: 1,
            enrolled_count: 2180,
            rating: 4.97,
            review_count: 245,
            modules: [
                {
                    title: 'Module 1: Foundations of Transformers & Large Language Models',
                    description: 'Attention mechanisms, tokenization, context windows, and modern model architectures.',
                    lessons: [
                        {
                            title: '1.1 Transformer Architecture: Self-Attention Explained Mechanistically',
                            description: 'Step-by-step breakdown of query, key, value matrices and positional embeddings.',
                            video_url: sampleVideo3,
                            video_duration: '32:10',
                            is_preview: 1,
                            resources: [
                                { name: 'Transformers-CheatSheet.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', size: '2.9 MB' }
                            ],
                            quizzes: []
                        },
                        {
                            title: '1.2 Prompt Engineering, Structured Outputs & Schema Enforcement',
                            description: 'Guaranteed JSON outputs, constrained decoding, and chain-of-thought prompting.',
                            video_url: sampleVideo4,
                            video_duration: '24:45',
                            is_preview: 0,
                            resources: [],
                            quizzes: []
                        }
                    ]
                },
                {
                    title: 'Module 2: Advanced Retrieval Augmented Generation (RAG)',
                    description: 'Vector databases, dense retrieval, BM25 sparse search, and rerankers.',
                    lessons: [
                        {
                            title: '2.1 Chunking Strategies & Vector Index Tuning (HNSW vs IVFFlat)',
                            description: 'Semantic chunking, parent document retrievers, and latency benchmarks.',
                            video_url: sampleVideo1,
                            video_duration: '27:20',
                            is_preview: 0,
                            resources: [],
                            quizzes: []
                        }
                    ]
                }
            ]
        },
        {
            id: 'crs-trade-04',
            title: 'Algorithmic Trading & Quantitative Portfolio Strategies',
            slug: 'algorithmic-trading-quantitative-portfolio-strategies',
            short_description: 'Master quantitative finance, backtesting with Python, statistical arbitrage, risk models, and automated algorithmic execution bots.',
            description: `### Quantitative Trading from Wall Street to Crypto
Learn the mathematical, statistical, and software engineering principles used by leading quantitative hedge funds to generate alpha and manage multi-asset portfolios.

#### Key Highlights:
* **Mathematical Grounding**: Mean reversion, momentum, statistical arbitrage, and Kalman filters.
* **Vectorized Backtesting Engine**: Build custom backtesters accounting for realistic slippage, exchange fees, and bid-ask spreads.
* **Live Execution**: Connect to interactive brokers and crypto exchange WebSocket feeds for automated order routing.`,
            category_id: 'cat-trading-finance',
            instructor_id: inst3Id,
            thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo4,
            price: 159.99,
            discount_price: 94.99,
            difficulty_level: 'Advanced',
            duration: '26.0 hours',
            language: 'English',
            learning_outcomes: JSON.stringify([
                'Develop and backtest quantitative trading strategies using Python, Pandas, and NumPy',
                'Implement statistical arbitrage, cointegration pairs trading, and trend-following systems',
                'Calculate Value at Risk (VaR), Maximum Drawdown, Sharpe, Sortino, and Calmar ratios',
                'Build automated trading bots with WebSocket order execution and risk kill-switches',
                'Avoid common backtesting pitfalls like lookahead bias and survivorship bias'
            ]),
            requirements: JSON.stringify([
                'Intermediate Python knowledge (NumPy / Pandas)',
                'Basic familiarity with statistics and financial markets'
            ]),
            target_audience: JSON.stringify([
                'Software developers interested in financial markets and quant trading',
                'Finance professionals wanting to automate manual trading workflows',
                'Independent traders seeking systematic, algorithmic discipline'
            ]),
            tags: JSON.stringify(['Algorithmic Trading', 'Finance', 'Python', 'Backtesting', 'Quantitative Analysis']),
            status: 'published',
            featured: 1,
            popular: 0,
            is_new: 1,
            enrolled_count: 1640,
            rating: 4.88,
            review_count: 172,
            modules: [
                {
                    title: 'Module 1: Quantitative Foundations & Market Microstructure',
                    description: 'Limit order books, tick data, bid-ask spread dynamics, and time series modeling.',
                    lessons: [
                        {
                            title: '1.1 Order Book Mechanics & Market Microstructure',
                            description: 'Understanding maker vs taker orders, depth of market, and execution slippage.',
                            video_url: sampleVideo4,
                            video_duration: '22:30',
                            is_preview: 1,
                            resources: [
                                { name: 'Microstructure-Blueprint.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', size: '2.1 MB' }
                            ],
                            quizzes: []
                        },
                        {
                            title: '1.2 Statistical Testing: Cointegration & Stationarity',
                            description: 'Augmented Dickey-Fuller tests, Hurst exponents, and identifying mean-reverting pairs.',
                            video_url: sampleVideo1,
                            video_duration: '29:40',
                            is_preview: 0,
                            resources: [],
                            quizzes: []
                        }
                    ]
                }
            ]
        },
        {
            id: 'crs-uiux-05',
            title: 'UI/UX Design Systems & High-Fidelity Figma Masterclass',
            slug: 'ui-ux-design-systems-figma-masterclass',
            short_description: 'Master modern product design from scratch: user personas, wireframing, scalable Figma design tokens, auto-layout, and interactive micro-animations.',
            description: `### Create World-Class Digital Products
Great design is the competitive moat of modern software. Learn how to transform raw user requirements into polished, intuitive, and conversion-optimized digital products.`,
            category_id: 'cat-ui-ux',
            instructor_id: inst4Id,
            thumbnail: 'https://images.unsplash.com/photo-1581291518655-9523c932deda?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo1,
            price: 119.99,
            discount_price: 69.99,
            difficulty_level: 'Beginner',
            duration: '18.5 hours',
            language: 'English',
            learning_outcomes: JSON.stringify([
                'Design complete web and mobile UI systems in Figma using auto-layout 5.0 and variables',
                'Establish tokenized design systems for typography, elevation, spacing, and brand themes',
                'Conduct usability testing and iterate based on real feedback metrics',
                'Handoff pixel-perfect design specifications to front-end developers with confidence'
            ]),
            requirements: JSON.stringify([
                'No prior design experience necessary',
                'Free Figma account (browser-based or desktop app)'
            ]),
            target_audience: JSON.stringify([
                'Aspiring UI/UX Designers looking to break into the tech industry',
                'Developers wanting to create clean, attractive user interfaces',
                'Product managers who want to build high-fidelity interactive prototypes'
            ]),
            tags: JSON.stringify(['UI/UX', 'Figma', 'Design Systems', 'Product Design', 'Wireframing']),
            status: 'published',
            featured: 0,
            popular: 1,
            is_new: 0,
            enrolled_count: 2410,
            rating: 4.93,
            review_count: 289,
            modules: [
                {
                    title: 'Module 1: User Research & Information Architecture',
                    description: 'Interviews, personas, journey mapping, and wireframing principles.',
                    lessons: [
                        {
                            title: '1.1 The UX Discovery Process',
                            description: 'How to ask the right questions and translate messy problems into clean wireframes.',
                            video_url: sampleVideo1,
                            video_duration: '18:15',
                            is_preview: 1,
                            resources: [
                                { name: 'UX-Research-Kit.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', size: '1.5 MB' }
                            ],
                            quizzes: []
                        }
                    ]
                }
            ]
        },
        {
            id: 'crs-cloud-06',
            title: 'Cloud DevOps Engineering, Kubernetes & GitOps Pipelines',
            slug: 'cloud-devops-kubernetes-gitops-pipelines',
            short_description: 'Master multi-stage Docker builds, Kubernetes cluster management, Helm charts, Terraform infrastructure-as-code, and automated GitOps with ArgoCD.',
            description: `### Industrial-Strength Cloud Automation
Bridge the gap between code and infrastructure. Learn to containerize, orchestrate, monitor, and scale distributed cloud services with zero downtime.`,
            category_id: 'cat-cloud-devops',
            instructor_id: inst2Id,
            thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo2,
            price: 139.99,
            discount_price: 84.99,
            difficulty_level: 'Intermediate',
            duration: '25.0 hours',
            language: 'English',
            learning_outcomes: JSON.stringify([
                'Write lean, secure multi-stage Dockerfiles and manage container registries',
                'Deploy and manage scalable Kubernetes workloads using Ingress, Secrets, and StatefulSets',
                'Package enterprise applications with Helm and implement GitOps using ArgoCD',
                'Provision cloud infrastructure declaratively using Terraform'
            ]),
            requirements: JSON.stringify([
                'Basic familiarity with Linux command line and Git',
                'Basic web server understanding'
            ]),
            target_audience: JSON.stringify([
                'Developers transitioning into DevOps and Cloud Infrastructure roles',
                'System administrators modernizing legacy server environments',
                'Engineers preparing for CKA (Certified Kubernetes Administrator) certifications'
            ]),
            tags: JSON.stringify(['DevOps', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'GitOps']),
            status: 'published',
            featured: 0,
            popular: 0,
            is_new: 1,
            enrolled_count: 1420,
            rating: 4.89,
            review_count: 135,
            modules: [
                {
                    title: 'Module 1: Containerization & Secure Docker Builds',
                    description: 'Layers, caching, non-root users, and minimal Alpine/Distroless bases.',
                    lessons: [
                        {
                            title: '1.1 Deep Dive: Multi-Stage Dockerfile Optimization',
                            description: 'Reduce 1GB image bloat down to 35MB production artifacts.',
                            video_url: sampleVideo2,
                            video_duration: '23:10',
                            is_preview: 1,
                            resources: [
                                { name: 'Docker-Security-Checklist.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', size: '1.3 MB' }
                            ],
                            quizzes: []
                        }
                    ]
                }
            ]
        }
    ];
    // Insert courses, modules, lessons
    for (const c of courses) {
        (0, database_js_1.execute)(`
      INSERT INTO courses (
        id, title, slug, short_description, description, category_id, instructor_id,
        thumbnail, preview_video_url, price, discount_price, difficulty_level, duration,
        language, learning_outcomes, requirements, target_audience, tags, status,
        featured, popular, is_new, enrolled_count, rating, review_count, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            c.id, c.title, c.slug, c.short_description, c.description, c.category_id, c.instructor_id,
            c.thumbnail, c.preview_video_url, c.price, c.discount_price, c.difficulty_level, c.duration,
            c.language, c.learning_outcomes, c.requirements, c.target_audience, c.tags, c.status,
            c.featured, c.popular, c.is_new, c.enrolled_count, c.rating, c.review_count, now, now
        ]);
        let mOrder = 1;
        for (const m of c.modules) {
            const moduleId = `mod-${c.id}-${mOrder}`;
            (0, database_js_1.execute)(`
        INSERT INTO modules (id, course_id, title, description, order_num, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [moduleId, c.id, m.title, m.description, mOrder, now]);
            let lOrder = 1;
            for (const l of m.lessons) {
                const lessonId = `lsn-${moduleId}-${lOrder}`;
                (0, database_js_1.execute)(`
          INSERT INTO lessons (
            id, module_id, course_id, title, description, video_url,
            video_duration, is_preview, order_num, resources, quizzes, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
                    lessonId, moduleId, c.id, l.title, l.description, l.video_url,
                    l.video_duration, l.is_preview, lOrder, JSON.stringify(l.resources), JSON.stringify(l.quizzes), now
                ]);
                lOrder++;
            }
            mOrder++;
        }
    }
    // 5. Active Coupons
    (0, database_js_1.execute)(`
    INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, expires_at, usage_limit, used_count, is_active, created_at)
    VALUES
    ('cpn-1', 'LAUNCH50', 'percent', 50.0, 0, '2027-12-31', 500, 42, 1, ?),
    ('cpn-2', 'EDTECH20', 'percent', 20.0, 0, '2027-12-31', 1000, 118, 1, ?),
    ('cpn-3', 'FLAT30', 'fixed', 30.0, 50, '2027-12-31', 200, 15, 1, ?)
  `, [now, now, now]);
    // 6. Pre-seed enrollments for demo student (David Miller)
    // Let's enroll him in Course 1 ('crs-data-01') with 65% progress,
    // and Course 2 ('crs-web-02') with 100% completed progress + certificate!
    const ord1 = 'ord-1001';
    const ord2 = 'ord-1002';
    (0, database_js_1.execute)(`
    INSERT INTO orders (id, order_number, user_id, course_id, amount, discount_amount, coupon_code, payment_method, payment_status, billing_info, transaction_id, created_at)
    VALUES
    (?, 'TRX-2026-8910', ?, 'crs-data-01', 79.99, 0, NULL, 'card', 'completed', ?, 'tx_mock_8910', '2026-08-15T10:00:00Z'),
    (?, 'TRX-2026-9432', ?, 'crs-web-02', 44.99, 45.0, 'LAUNCH50', 'card', 'completed', ?, 'tx_mock_9432', '2026-07-20T14:30:00Z')
  `, [
        ord1, studentId, JSON.stringify({ fullName: 'David Miller', country: 'United States', email: 'student@tradex.com' }),
        ord2, studentId, JSON.stringify({ fullName: 'David Miller', country: 'United States', email: 'student@tradex.com' })
    ]);
    // Enrollments
    (0, database_js_1.execute)(`
    INSERT INTO enrollments (id, user_id, course_id, order_id, enrolled_at, progress_percent, last_lesson_id, completed_at, status)
    VALUES
    ('enr-01', ?, 'crs-data-01', ?, '2026-08-15T10:05:00Z', 65.0, 'lsn-mod-crs-data-01-2-1', NULL, 'active'),
    ('enr-02', ?, 'crs-web-02', ?, '2026-07-20T14:35:00Z', 100.0, 'lsn-mod-crs-web-02-2-1', '2026-08-30T16:00:00Z', 'completed')
  `, [studentId, ord1, studentId, ord2]);
    // Mark lessons completed for Course 1
    (0, database_js_1.execute)(`
    INSERT INTO lesson_progress (id, user_id, lesson_id, course_id, completed, completed_at)
    VALUES
    ('prg-1', ?, 'lsn-mod-crs-data-01-1-1', 'crs-data-01', 1, '2026-08-16T12:00:00Z'),
    ('prg-2', ?, 'lsn-mod-crs-data-01-1-2', 'crs-data-01', 1, '2026-08-17T14:00:00Z'),
    ('prg-3', ?, 'lsn-mod-crs-data-01-1-3', 'crs-data-01', 1, '2026-08-19T10:00:00Z'),
    ('prg-4', ?, 'lsn-mod-crs-web-02-1-1', 'crs-web-02', 1, '2026-07-25T11:00:00Z'),
    ('prg-5', ?, 'lsn-mod-crs-web-02-1-2', 'crs-web-02', 1, '2026-08-10T16:00:00Z'),
    ('prg-6', ?, 'lsn-mod-crs-web-02-2-1', 'crs-web-02', 1, '2026-08-30T15:50:00Z')
  `, [studentId, studentId, studentId, studentId, studentId, studentId]);
    // Pre-seed Certificate for Course 2
    (0, database_js_1.execute)(`
    INSERT INTO certificates (id, certificate_code, user_id, course_id, student_name, course_title, instructor_name, issued_at)
    VALUES
    ('cert-101', 'CERT-TRX-2026-78491', ?, 'crs-web-02', 'David Miller', 'Full-Stack Next.js 15, TypeScript & Distributed Cloud Architecture', 'Sarah Jenkins', '2026-08-30T16:00:00Z')
  `, [studentId]);
    // Wishlist item
    (0, database_js_1.execute)(`
    INSERT INTO wishlist (id, user_id, course_id, created_at)
    VALUES
    ('wsh-1', ?, 'crs-ai-03', ?)
  `, [studentId, now]);
    // Reviews
    (0, database_js_1.execute)(`
    INSERT INTO reviews (id, course_id, user_id, rating, review_text, status, created_at, updated_at)
    VALUES
    ('rev-01', 'crs-data-01', ?, 5, 'Hands down the most practical data analytics course on the internet. The SQL window functions and real-world datasets helped me land a Senior Analytics role within 2 months!', 'approved', '2026-08-25T14:20:00Z', '2026-08-25T14:20:00Z'),
    ('rev-02', 'crs-data-01', ?, 5, 'Dr. Mercer is an incredible instructor. He explains complex architectures with total clarity and zero fluff. The PowerBI capstone was a huge hit in my interviews.', 'approved', '2026-08-28T09:15:00Z', '2026-08-28T09:15:00Z'),
    ('rev-03', 'crs-web-02', ?, 5, 'Exceptional coverage of Next.js 15 Server Actions and architectural patterns. I refactored my team SaaS platform based on Sarah lessons and cut our page load times in half!', 'approved', '2026-09-02T16:45:00Z', '2026-09-02T16:45:00Z')
  `, [studentId, student2Id, studentId]);
    // 7. Site Content & CMS
    const heroContent = {
        badge: '🚀 NEW: NEXT-GENERATION CAREER ROADMAPS 2026',
        headline: 'Master High-Income Tech Skills with Industry Veterans',
        subheadline: 'Learn data analytics, full-stack engineering, AI agents, and quantitative finance through production-ready projects, guided curriculums, and verifiable certificates.',
        ctaPrimaryText: 'Explore All Courses',
        ctaPrimaryLink: '/courses',
        ctaSecondaryText: 'Start Learning Free',
        ctaSecondaryLink: '/register',
        stats: [
            { label: 'Active Students', value: '45,000+' },
            { label: 'Course Completion Rate', value: '94.8%' },
            { label: 'Instructor Quality Score', value: '4.9/5' },
            { label: 'Global Alumni Network', value: '80+ Countries' }
        ]
    };
    const learningBenefits = [
        {
            title: 'Industry-Standard Curriculums',
            description: 'Built directly around what tier-1 tech firms and modern startups hire for today. Zero obsolete theories.',
            icon: 'Target'
        },
        {
            title: 'Real-World Production Projects',
            description: 'Build genuine GitHub-ready portfolio applications and executive business intelligence pipelines.',
            icon: 'Briefcase'
        },
        {
            title: 'Interactive Knowledge Checkpoints',
            description: 'Quizzes, downloadable code templates, cheat sheets, and hands-on drills embedded into every module.',
            icon: 'CheckCircle'
        },
        {
            title: 'Verifiable Digital Credentials',
            description: 'Earn cryptographic certificate codes that can be shared on LinkedIn or verified by prospective employers.',
            icon: 'Award'
        }
    ];
    const whyChooseUs = {
        badge: 'WHY TRADEX ACADEMY',
        title: 'Engineered for Real-World Career Acceleration',
        subtitle: 'We ditched surface-level tutorials to create deep, production-grade learning journeys with proven outcomes.',
        points: [
            'Taught exclusively by verified staff engineers and lead practitioners',
            'Downloadable source code, datasets, and cheat sheets for every lesson',
            'Lifetime course access including all future updates and expansions',
            'Self-paced learning on any device with resume-where-you-left-off player'
        ]
    };
    const testimonials = [
        {
            id: 't-1',
            name: 'James Rodriguez',
            role: 'Senior Data Analyst @ FinTech Global',
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
            rating: 5,
            content: 'The Data Analytics Masterclass directly helped me transition from a spreadsheet reporting analyst to leading our product analytics team. The course player and curriculum quality are second to none.'
        },
        {
            id: 't-2',
            name: 'Amara Chen',
            role: 'Staff Software Engineer @ CloudScale',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            rating: 5,
            content: 'The Next.js 15 and Distributed Cloud Architecture course gave me the exact mental model needed for enterprise microfrontends. Sarah teaching style is crisp, precise, and delightfully practical.'
        },
        {
            id: 't-3',
            name: 'Liam O’Connor',
            role: 'Quantitative Analyst @ Alpha Capital',
            avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
            rating: 5,
            content: 'Marcus Vance breaks down market microstructure and statistical arbitrage better than most university graduate courses. The backtesting engine we built in class is running live strategies today.'
        }
    ];
    const faqs = [
        {
            id: 'faq-1',
            question: 'Do I get lifetime access to purchased courses?',
            answer: 'Yes! Once you enroll in any course, you retain permanent lifetime access to all current and future lessons, downloadable files, code repositories, and quizzes.'
        },
        {
            id: 'faq-2',
            question: 'Will I receive a completion certificate?',
            answer: 'Absolutely. Upon finishing 100% of a course curriculum, our system generates an official, verifiable digital certificate featuring your name, the instructor signature, and a unique cryptographic verification ID.'
        },
        {
            id: 'faq-3',
            question: 'Can I preview lessons before buying?',
            answer: 'Yes! Every course includes complimentary preview lessons marked in the curriculum list so you can inspect the teaching style and depth before purchasing.'
        },
        {
            id: 'faq-4',
            question: 'Can I apply promotional coupons at checkout?',
            answer: 'Yes. Simply enter your coupon code (such as LAUNCH50 or EDTECH20) at checkout for an instant discount calculation.'
        },
        {
            id: 'faq-5',
            question: 'What if I am a beginner in programming or analytics?',
            answer: 'Each course has a clearly marked difficulty level (Beginner, Intermediate, Advanced, All Levels). Beginner courses require zero prior coding experience and walk you step-by-step from zero.'
        }
    ];
    const siteSettings = {
        platformName: 'TradeX Academy',
        tagline: 'Premier Online Learning & Professional Skill Mastery',
        supportEmail: 'support@tradex.com',
        supportPhone: '+1 (800) 555-0199',
        currency: 'USD',
        currencySymbol: '$',
        enableRegistration: true,
        certificatePrefix: 'CERT-TRX',
        organizationName: 'TradeX Academy Global Educational Institute'
    };
    const promoBanner = {
        isActive: true,
        message: '🎉 Special Launch Offer: Get 50% OFF all courses with coupon code',
        couponCode: 'LAUNCH50',
        link: '/courses'
    };
    (0, database_js_1.execute)(`INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, ?)`, ['hero', JSON.stringify(heroContent), now]);
    (0, database_js_1.execute)(`INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, ?)`, ['learning_benefits', JSON.stringify(learningBenefits), now]);
    (0, database_js_1.execute)(`INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, ?)`, ['why_choose_us', JSON.stringify(whyChooseUs), now]);
    (0, database_js_1.execute)(`INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, ?)`, ['testimonials', JSON.stringify(testimonials), now]);
    (0, database_js_1.execute)(`INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, ?)`, ['faqs', JSON.stringify(faqs), now]);
    (0, database_js_1.execute)(`INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, ?)`, ['promo_banner', JSON.stringify(promoBanner), now]);
    (0, database_js_1.execute)(`INSERT INTO site_content (key, value, updated_at) VALUES (?, ?, ?)`, ['settings', JSON.stringify(siteSettings), now]);
    (0, database_js_1.saveDb)();
    console.log('Database seeded successfully with rich realistic data!');
}
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
    runSeed().catch(err => {
        console.error('Seed error:', err);
        process.exit(1);
    });
}
