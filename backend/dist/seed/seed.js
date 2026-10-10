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
    console.log('Starting Gujarati Trading Education database seeding...');
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
        adminId, 'TradeX Administrator', 'admin@tradex.com', adminPasswordHash,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        'હેડ ઓફ ટ્રેડિંગ એકેડેમી', 'સિલેબસ, મેન્ટર સપોર્ટ અને પ્લેટફોર્મ ઓપરેશન્સનું સંચાલન.',
        now, now,
        studentId, 'પ્રતીક પટેલ (Pratik Patel)', 'student@tradex.com', studentPasswordHash,
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
        'અમદાવાદ • બિગિનર ટ્રેડર', 'પ્રાઇસ એક્શન અને નિફ્ટી ઓપ્શન્સ ટ્રેડિંગ શીખી રહ્યો છું.',
        now, now,
        student2Id, 'હર્ષિલ મહેતા (Harshil Mehta)', 'harshil.mehta@example.com', studentPasswordHash,
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
        'સુરત • સ્વિંગ ટ્રેડર', 'શેર બજારમાં શિસ્તબદ્ધ રોકાણ અને પોર્ટફોલિયો ગ્રોથ.',
        now, now
    ]);
    // 2. Instructors (Bhavik Patel & Jignesh Shah)
    const inst1Id = 'inst-01';
    const inst2Id = 'inst-02';
    (0, database_js_1.execute)(`
    INSERT INTO instructors (id, name, email, avatar, title, bio, expertise, rating, students_count, courses_count, social_links, created_at)
    VALUES
    (?, ?, ?, ?, ?, ?, ?, 4.96, 35000, 4, ?, ?),
    (?, ?, ?, ?, ?, ?, ?, 4.92, 22000, 3, ?, ?)
  `, [
        inst1Id, 'ભાવિક પટેલ (Bhavik Patel)', 'bhavik@tradex.com',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        'Head Mentor & Price Action Trader (10+ Years Exp)',
        'Stock Market માં 10+ Years નો Real Experience ધરાવતા Full-Time Trader. 35,000+ Gujarati Students ને સરળ Gujlish માં Price Action અને Chart Reading શીખવ્યું છે.',
        'Price Action, Technical Analysis, Candlestick Patterns, Risk Management',
        JSON.stringify({ youtube: 'https://youtube.com', telegram: 'https://t.me', instagram: 'https://instagram.com' }),
        now,
        inst2Id, 'જિજ્ઞેશ શાહ (Jignesh Shah)', 'jignesh@tradex.com',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
        'Options Strategist & Data Analyst (8+ Years Exp)',
        'Nifty & BankNifty Options Greeks (Delta/Theta), Open Interest (OI) Data Analysis અને High-Probability Expiry Setups ના Specialist.',
        'Options Buying & Selling, Option Greeks, Nifty/BankNifty, Crypto Futures',
        JSON.stringify({ youtube: 'https://youtube.com', telegram: 'https://t.me' }),
        now
    ]);
    // 3. Categories (Gujlish Trading Pillars)
    const catData = [
        { id: 'cat-stock-basics', name: 'Stock Market Basics', slug: 'stock-basics', description: 'Demat Account, NSE/BSE, Nifty 50 અને Trading શરૂ કરવાની સાચી રીત.', icon: 'BarChart3', order: 1 },
        { id: 'cat-price-action', name: 'Price Action & Technical Analysis', slug: 'price-action', description: 'Indicators વગર Pure Chart Reading, Support, Resistance અને Patterns.', icon: 'TrendingUp', order: 2 },
        { id: 'cat-options-trading', name: 'Options Trading Mastery', slug: 'options-trading', description: 'Nifty અને BankNifty માં Call & Put, Option Greeks અને Expiry Setups.', icon: 'Sparkles', order: 3 },
        { id: 'cat-swing-trading', name: 'Swing Trading & Wealth Building', slug: 'swing-trading', description: 'Multibagger Stocks શોધવા અને 1:3 Risk-to-Reward સાથે Trades.', icon: 'Briefcase', order: 4 },
        { id: 'cat-crypto-trading', name: 'Crypto & Futures Trading', slug: 'crypto-trading', description: 'Bitcoin, Altcoins, Spot અને Safe Futures Trading.', icon: 'Coins', order: 5 },
        { id: 'cat-psychology-risk', name: 'Trading Psychology & Risk Management', slug: 'psychology-risk', description: 'Capital Protection, Stop Loss Discipline અને Trader Mindset.', icon: 'ShieldAlert', order: 6 },
    ];
    for (const c of catData) {
        (0, database_js_1.execute)(`
      INSERT INTO categories (id, name, slug, description, icon, course_count, order_num)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `, [c.id, c.name, c.slug, c.description, c.icon, c.order]);
    }
    // Sample MP4 video streams that play reliably across all browsers & devices
    const sampleVideo1 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    const sampleVideo2 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
    const sampleVideo3 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    const sampleVideo4 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';
    // 4. Gujarati Trading Courses (Prices in Indian Rupees ₹)
    const courses = [
        {
            id: 'crs-trade-01',
            title: 'Stock Market Basics for Beginners (શેર બજાર શીખો સરળ રીતે)',
            slug: 'stock-market-basics-for-beginners-gujarati',
            short_description: 'Stock Market Trading ની શરૂઆત કરો એકદમ શૂન્યથી! Demat Account ખોલવાથી લઈને પહેલો Stock ખરીદવા સુધી step by step live guidance.',
            description: `### Stock Market Trading શીખો સરળ રીતે!
Trading ની શરૂઆત કરો અને market concepts ને step by step સમજો. આ Course માં તમે Demat Account, Chart Reading, Order Types અને Risk Management વિશે સરળ Gujlish માં શીખશો.

#### આ Course માં તમે શું શીખશો:
* **Stock Market Fundamentals**: NSE, BSE, Nifty 50 અને Sensex ની complete સમજ.
* **Demat & Trading Account Setup**: Zerodha, AngelOne કે Groww માં account operate કરવાની સાચી રીત.
* **Order Types**: Market Order, Limit Order, Stop Loss (SL) અને Target Orders.
* **Basic Chart Reading**: Candlesticks કેવી રીતે બને છે અને Price Momentum કેવી રીતે identify કરવું.
* **Risk Management Rules**: Capital safe રાખવાના golden rules.`,
            category_id: 'cat-stock-basics',
            instructor_id: inst1Id,
            thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo1,
            price: 0,
            discount_price: 0,
            difficulty_level: 'Beginner',
            duration: '12.5 Hours',
            language: 'Gujarati + English (Gujlish)',
            learning_outcomes: JSON.stringify([
                'Demat અને Trading Account operate કરવાની સાચી પદ્ધતિ',
                'Stocks ની buying-selling અને Order Types નું practical knowledge',
                'Stock Market માં Capital ગુમાવ્યા વગર safe start',
                'TradingView Charts પર basic analysis અને watchlist setup'
            ]),
            requirements: JSON.stringify([
                'કોઈ previous finance કે trading background જરૂરી નથી',
                'Smartphone અથવા Laptop અને Internet Connection',
                'રોજ 30 minutes practice કરવાની ઈચ્છા'
            ]),
            target_audience: JSON.stringify([
                'Beginners, Students અને Housewives જે trading શીખવા માંગે છે',
                'Job professionals અને Business owners જે side income generate કરવા માંગે છે',
                'Stock Market ને serious career તરીકે શરૂ કરવા માંગતા લોકો'
            ]),
            tags: JSON.stringify(['Stock Market', 'Trading Basics', 'Demat Account', 'Beginner Friendly', 'Gujlish']),
            status: 'published',
            featured: 1,
            popular: 1,
            is_new: 0,
            enrolled_count: 14800,
            rating: 4.95,
            review_count: 840,
            modules: [
                {
                    title: 'Module 1: Stock Market Introduction & Demat Account',
                    description: 'Stock Market ની શરૂઆત અને basic tools.',
                    lessons: [
                        {
                            title: '1.1 Stock Market શું છે અને Profit કેવી રીતે થાય છે?',
                            description: 'Companies list કેમ થાય છે અને Retail Trader તરીકે આપણી opportunity શું છે.',
                            video_url: sampleVideo1,
                            video_duration: '18:40',
                            is_preview: 1,
                            resources: [
                                { name: 'Stock-Market-Basics-Gujlish.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', size: '2.1 MB' }
                            ],
                            quizzes: [
                                {
                                    question: 'NSE અને BSE ભારતમાં શું role play કરે છે?',
                                    options: [
                                        'તે Stocks buying-selling માટેના official stock exchanges છે',
                                        'તે Government Banks છે',
                                        'તે Share price decide કરતી private companies છે',
                                        'તે Mutual Fund distributors છે'
                                    ],
                                    correct_index: 0,
                                    explanation: 'NSE (National Stock Exchange) અને BSE (Bombay Stock Exchange) ભારતના બે મુખ્ય stock exchanges છે.'
                                }
                            ]
                        },
                        {
                            title: '1.2 Demat Account Setup & Brokerage Comparison',
                            description: 'Right Broker પસંદ કરવો અને App માં Watchlist create કરવી.',
                            video_url: sampleVideo2,
                            video_duration: '22:15',
                            is_preview: 0,
                            resources: [
                                { name: 'Demat-Account-Setup-Guide.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', size: '1.4 MB' }
                            ],
                            quizzes: []
                        }
                    ]
                },
                {
                    title: 'Module 2: First Stock Buying & Risk Management',
                    description: 'Practical Trading Execution અને Capital Protection.',
                    lessons: [
                        {
                            title: '2.1 Market, Limit અને Stop Loss (SL) Orders',
                            description: 'Orders place કરતી વખતે થતી common mistakes અને correct way.',
                            video_url: sampleVideo3,
                            video_duration: '25:10',
                            is_preview: 1,
                            resources: [],
                            quizzes: []
                        }
                    ]
                }
            ]
        },
        {
            id: 'crs-trade-02',
            title: 'Pure Price Action & Candlestick Secrets (પ્રાઇસ એક્શન માસ્ટરી)',
            slug: 'price-action-and-candlestick-secrets-gujarati',
            short_description: 'આ Course માં તમે Technical Analysis અને Price Action વિશે શીખશો. Lagging Indicators વગર Support, Resistance, Trendlines અને Breakout Trading ની master strategies.',
            description: `### Price Action Trading શીખો Live Market Logic સાથે!
Indicators હંમેશાં lag કરે છે, જ્યારે Pure Price Action તમને market move થતાં પહેલાં clear signals આપે છે. આ Course માં તમે Big Institutions (FII/DII) ના footprints ઓળખીને confident trades લેતાં શીખશો.

#### આ Course ના Key Highlights:
* Support & Resistance levels accurately draw કરવાની method.
* 7 Most Profitable Candlestick Patterns અને Fake Breakout identification.
* Breakout vs Retest Trading Setups.
* 1:2 & 1:3 Risk-to-Reward Ratio સાથે Perfect Entry & Exit.`,
            category_id: 'cat-price-action',
            instructor_id: inst1Id,
            thumbnail: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo2,
            price: 3999,
            discount_price: 1999,
            difficulty_level: 'All Levels',
            duration: '18.0 Hours',
            language: 'Gujarati + English (Gujlish)',
            learning_outcomes: JSON.stringify([
                'કોઈ પણ Indicators વગર Clean Chart Analysis',
                'Support, Resistance અને Dynamic Trendlines accurately draw કરવી',
                'Hammer, Shooting Star, Engulfing અને Morning Star patterns mastery',
                'Fake Breakout Traps ઓળખીને safe trade લેવો'
            ]),
            requirements: JSON.stringify([
                'Stock Market ની basic understanding',
                'TradingView platform નો basic usage',
                'Daily Charts practice કરવાની willingness'
            ]),
            target_audience: JSON.stringify([
                'Intraday અને Swing Traders જે loss ઘટાડીને consistent બનવા માંગે છે',
                'Indicators ના confusion થી કંટાળેલા traders',
                'Chart Reading માં solid confidence મેળવવા માંગતા Gujarati Traders'
            ]),
            tags: JSON.stringify(['Price Action', 'Candlestick', 'Support Resistance', 'Chart Reading', 'Technical Analysis']),
            status: 'published',
            featured: 1,
            popular: 1,
            is_new: 0,
            enrolled_count: 9800,
            rating: 4.96,
            review_count: 620,
            modules: [
                {
                    title: 'Module 1: Market Structure & Price Behavior',
                    description: 'Higher Highs (HH), Higher Lows (HL) અને Trend Confirmation.',
                    lessons: [
                        {
                            title: '1.1 Support & Resistance પાછળની Buyer-Seller Psychology',
                            description: 'Real Buyers અને Sellers વચ્ચેનું battle chart પર કેવી રીતે identify કરવું.',
                            video_url: sampleVideo2,
                            video_duration: '24:10',
                            is_preview: 1,
                            resources: [
                                { name: 'Price-Action-CheatSheet.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', size: '3.2 MB' }
                            ],
                            quizzes: []
                        },
                        {
                            title: '1.2 Trendline Draw કરવાની 100% Accurate Method',
                            description: 'Fake Wicks અને Body વચ્ચે correct trendlines identify કરવી.',
                            video_url: sampleVideo3,
                            video_duration: '21:40',
                            is_preview: 0,
                            resources: [],
                            quizzes: []
                        }
                    ]
                },
                {
                    title: 'Module 2: Candlestick Patterns & High Probability Entries',
                    description: 'Price Rejection અને Momentum Candlesticks.',
                    lessons: [
                        {
                            title: '2.1 Hammer & Shooting Star: ક્યાં Trade કરવો અને ક્યાં Avoid કરવો',
                            description: 'Major Support પર Hammer બનતા high probability trade setup.',
                            video_url: sampleVideo4,
                            video_duration: '28:50',
                            is_preview: 1,
                            resources: [],
                            quizzes: []
                        }
                    ]
                }
            ]
        },
        {
            id: 'crs-trade-03',
            title: 'Nifty & BankNifty Options Trading Mastery (ઓપ્શન્સ ટ્રેડિંગ)',
            slug: 'nifty-banknifty-options-trading-mastery-gujarati',
            short_description: 'Options Buying અને Selling શીખો Data Logic સાથે! Option Greeks (Delta, Theta), Open Interest (OI) Data Analysis અને Expiry Day Special Setups.',
            description: `### Options Trading માં Consistent Profitable બનવાનો Complete Roadmap!
મોટાભાગના Option Buyers Theta Decay (સમયનો ઘટાડો) ને કારણે Capital lose કરે છે. આ Masterclass માં Mentor Jignesh Shah તમને Data-Driven Options Trading શીખવશે.

#### આ Course માં શું શામેલ છે:
* Call (CE) & Put (PE) selection અને Strike Price પસંદગી (ITM, ATM, OTM).
* Option Greeks Mastery: Delta, Theta Decay અને Vega Volatility.
* Open Interest (OI) અને Option Chain Analysis.
* Thursday Expiry Day Special Setups અને Premium Decay advantages.`,
            category_id: 'cat-options-trading',
            instructor_id: inst2Id,
            thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo3,
            price: 5999,
            discount_price: 2999,
            difficulty_level: 'Intermediate',
            duration: '22.5 Hours',
            language: 'Gujarati + English (Gujlish)',
            learning_outcomes: JSON.stringify([
                'Options માં Call અને Put ની accurate calculation',
                'Option Greeks (Delta/Theta) સમજીને Premium Loss થી બચવું',
                'Nifty & BankNifty માં High-Momentum Option Buying Setups',
                'Open Interest (OI) અને PCR (Put-Call Ratio) Data Reading'
            ]),
            requirements: JSON.stringify([
                'Stock Market અને basic Charts ની understanding',
                'ઓછામાં ઓછું 3 મહિનાનું Market observation',
                'Strict Stop Loss follow કરવાની discipline'
            ]),
            target_audience: JSON.stringify([
                'Nifty અને BankNifty માં trade કરતા તમામ traders',
                'Options માં વારંવાર premium loss ભોગવતા લોકો',
                'Data-driven institutional setups શીખવા માંગતા options traders'
            ]),
            tags: JSON.stringify(['Options Trading', 'Nifty', 'BankNifty', 'Option Greeks', 'Expiry Strategy', 'Gujlish']),
            status: 'published',
            featured: 1,
            popular: 1,
            is_new: 1,
            enrolled_count: 11200,
            rating: 4.94,
            review_count: 730,
            modules: [
                {
                    title: 'Module 1: Options Fundamentals & Greeks Mechanics',
                    description: 'Call, Put અને Theta Time Decay ની complete calculation.',
                    lessons: [
                        {
                            title: '1.1 Options શું છે? Premium કઈ રીતે વધે અને ઘટે છે?',
                            description: 'Intrinsic Value અને Time Value વચ્ચેનો difference.',
                            video_url: sampleVideo3,
                            video_duration: '26:30',
                            is_preview: 1,
                            resources: [
                                { name: 'Option-Greeks-Handbook.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', size: '2.8 MB' }
                            ],
                            quizzes: []
                        },
                        {
                            title: '1.2 Theta Decay થી બચીને Right Strike Price કેવી રીતે select કરવી',
                            description: 'ITM vs ATM vs OTM નો practical usage.',
                            video_url: sampleVideo1,
                            video_duration: '31:20',
                            is_preview: 0,
                            resources: [],
                            quizzes: []
                        }
                    ]
                },
                {
                    title: 'Module 2: Nifty & BankNifty Live Trading Setups',
                    description: 'Expiry Special અને Breakout Momentum Trades.',
                    lessons: [
                        {
                            title: '2.1 Open Interest (OI) Data વડે Trend Direction નક્કી કરવો',
                            description: 'Option Chain read કરીને strong Support અને Resistance identify કરવું.',
                            video_url: sampleVideo4,
                            video_duration: '29:40',
                            is_preview: 1,
                            resources: [],
                            quizzes: []
                        }
                    ]
                }
            ]
        },
        {
            id: 'crs-trade-04',
            title: 'Professional Swing Trading & Wealth Building (સ્વિંગ ટ્રેડિંગ)',
            slug: 'swing-trading-and-multibagger-stocks-gujarati',
            short_description: 'રોજ Screen સામે બેઠા વગર Part-time Trading કરો. 1 થી 4 અઠવાડિયામાં 10% થી 25% returns target કરવા માટે Best Breakout Stocks શોધવાની strategies.',
            description: `### Job અને Business સાથે Wealth Building શીખો!
Swing Trading એ Part-Time Traders માટે Best approach છે. અઠવાડિયે ફક્ત 2 કલાક Chart Analysis કરીને Multibagger Breakout Stocks માં position બનાવવાની strategies શીખો.`,
            category_id: 'cat-swing-trading',
            instructor_id: inst1Id,
            thumbnail: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo4,
            price: 4999,
            discount_price: 2499,
            difficulty_level: 'Beginner',
            duration: '15.0 Hours',
            language: 'Gujarati + English (Gujlish)',
            learning_outcomes: [
                '20 અને 50 Moving Average Pullback Setups',
                'High Volume Breakout Stocks Scanning with Free Scanners',
                '1:3 Risk-to-Reward Ratio સાથે Position Holding',
                'Trailing Stop Loss થી maximum profits lock કરવા'
            ],
            requirements: [
                'કોઈ પણ વ્યક્તિ સરળ રીતે શીખી શકે છે',
                'અઠવાડિયે 2-3 કલાક Charts study કરવાની તૈયારી'
            ],
            target_audience: [
                'Job professionals અને Businessmen જે screen સામે બેસી શકતા નથી',
                'Medium-term investors અને swing traders',
                'Peace of mind સાથે trading કરવા માંગતા Gujarati Investors'
            ],
            tags: ['Swing Trading', 'Multibagger Stocks', 'Breakout Strategy', 'Part-Time Trading'],
            status: 'published',
            featured: 1,
            popular: 0,
            is_new: 0,
            enrolled_count: 6700,
            rating: 4.91,
            review_count: 410,
            modules: [
                {
                    title: 'Module 1: Swing Trading Fundamentals & Stock Screening',
                    description: 'Stock Scanning અને Volume Analysis.',
                    lessons: [
                        {
                            title: '1.1 Swing Trading Rules અને Chartink Scanner Setup',
                            description: 'Free Tools થી 2 minutes માં high quality stocks scan કરવા.',
                            video_url: sampleVideo4,
                            video_duration: '22:10',
                            is_preview: 1,
                            resources: [],
                            quizzes: []
                        }
                    ]
                }
            ]
        },
        {
            id: 'crs-trade-05',
            title: 'Crypto & Futures Trading Masterclass (ક્રિપ્ટો ટ્રેડિંગ)',
            slug: 'crypto-trading-and-futures-guide-gujarati',
            short_description: 'Bitcoin, Ethereum અને Altcoins નું Technical Analysis. 24/7 Global Markets માં Safe Spot અને Futures Trading માં Position Sizing ના rules.',
            description: `### Crypto Markets માં Safe Trading શીખો!
Crypto Market માં High Volatility હોય છે. Proper Risk Management અને Leverage Control વગર trade ન કરવો જોઈએ. આ Course માં Binance અને CoinDCX પર safe execution શીખવવામાં આવે છે.`,
            category_id: 'cat-crypto-trading',
            instructor_id: inst2Id,
            thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo1,
            price: 2999,
            discount_price: 1499,
            difficulty_level: 'Intermediate',
            duration: '14.0 Hours',
            language: 'Gujarati + English (Gujlish)',
            learning_outcomes: [
                'Bitcoin & Altcoins Chart Analysis',
                'Spot vs Futures Trading માં Leverage Management',
                'Crypto Wallet Security અને Safe Exchange Practices'
            ],
            requirements: [
                'Internet connection અને basic digital literacy'
            ],
            target_audience: [
                'Global Crypto Markets માં safely trade કરવા માંગતા લોકો'
            ],
            tags: ['Crypto Trading', 'Bitcoin', 'Futures', 'Blockchain', 'Altcoins'],
            status: 'published',
            featured: 0,
            popular: 0,
            is_new: 1,
            enrolled_count: 4200,
            rating: 4.88,
            review_count: 290,
            modules: [
                {
                    title: 'Module 1: Crypto Market Structure & Spot vs Futures',
                    description: 'Bitcoin Cycle અને Altcoin Seasons.',
                    lessons: [
                        {
                            title: '1.1 Bitcoin Halving Cycles અને Global Liquidity Dynamics',
                            description: 'Crypto માં right entry time કેવી રીતે ઓળખવો.',
                            video_url: sampleVideo1,
                            video_duration: '20:15',
                            is_preview: 1,
                            resources: [],
                            quizzes: []
                        }
                    ]
                }
            ]
        },
        {
            id: 'crs-trade-06',
            title: 'Trading Psychology, Discipline & Risk Management (માઇન્ડસેટ)',
            slug: 'trading-psychology-risk-management-gujarati',
            short_description: '90% Traders Psychology અને Discipline ના અભાવે Loss કરે છે. Greed, Fear અને Revenge Trading પર control મેળવીને Professional Mindset કેળવવાનો 100% Free Course.',
            description: `### Trading is 80% Psychology & 20% Strategy!
દુનિયાની Best Strategy હોય પણ Psychology નબળી હોય તો Profit નથી થતો. આ Course માં Trading Journal બનાવવું, Daily Loss Limit set કરવી અને Emotion Control ના practical rules શીખવવામાં આવે છે.`,
            category_id: 'cat-psychology-risk',
            instructor_id: inst1Id,
            thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo2,
            price: 0,
            discount_price: 0,
            difficulty_level: 'All Levels',
            duration: '8.5 Hours',
            language: 'Gujarati + English (Gujlish)',
            learning_outcomes: [
                'Revenge Trading અને Over-Trading પર 100% control',
                '1 Day માં કેટલો Loss tolerate કરવો તેનો exact rule',
                'Trading Journal maintain કરીને mistakes eliminate કરવાની technique',
                'Calm mind સાથે Charts analyze કરવાની habits'
            ],
            requirements: [
                'Trading discipline સુધારવાની sincere desire'
            ],
            target_audience: [
                'દરેક Intraday, Swing અને Options Trader'
            ],
            tags: ['Psychology', 'Risk Management', 'Capital Protection', 'Discipline', 'Mindset'],
            status: 'published',
            featured: 1,
            popular: 1,
            is_new: 0,
            enrolled_count: 18500,
            rating: 4.98,
            review_count: 1120,
            modules: [
                {
                    title: 'Module 1: Trader Mindset & Capital Protection Rules',
                    description: 'Fear અને Greed સામે victory મેળવવી.',
                    lessons: [
                        {
                            title: '1.1 Why 90% Traders Lose Money? The 1% Risk Rule',
                            description: 'કોઈ પણ Single Trade માં Capital ના 1% થી વધારે risk ન લેવો.',
                            video_url: sampleVideo2,
                            video_duration: '27:40',
                            is_preview: 1,
                            resources: [
                                { name: 'Trading-Psychology-Rulebook.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', size: '1.9 MB' }
                            ],
                            quizzes: []
                        }
                    ]
                }
            ]
        }
    ];
    // Insert Courses, Modules, Lessons
    for (const c of courses) {
        (0, database_js_1.execute)(`
      INSERT INTO courses (
        id, title, slug, short_description, description, category_id,
        instructor_id, thumbnail, preview_video_url, price, discount_price,
        difficulty_level, duration, language, learning_outcomes, requirements,
        target_audience, tags, status, featured, popular, is_new,
        enrolled_count, rating, review_count, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            c.id, c.title, c.slug, c.short_description, c.description, c.category_id,
            c.instructor_id, c.thumbnail, c.preview_video_url, c.price, c.discount_price,
            c.difficulty_level, c.duration, c.language,
            typeof c.learning_outcomes === 'string' ? c.learning_outcomes : JSON.stringify(c.learning_outcomes),
            typeof c.requirements === 'string' ? c.requirements : JSON.stringify(c.requirements),
            typeof c.target_audience === 'string' ? c.target_audience : JSON.stringify(c.target_audience),
            typeof c.tags === 'string' ? c.tags : JSON.stringify(c.tags),
            c.status, c.featured, c.popular, c.is_new, c.enrolled_count, c.rating, c.review_count, now, now
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
                    l.video_duration, l.is_preview, lOrder, JSON.stringify(l.resources || []), JSON.stringify(l.quizzes || []), now
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
    ('cpn-1', 'LAUNCH50', 'percent', 50.0, 0, '2027-12-31', 1000, 142, 1, ?),
    ('cpn-2', 'GUJJUTRADER', 'percent', 30.0, 0, '2027-12-31', 500, 68, 1, ?),
    ('cpn-3', 'FLAT500', 'fixed', 500.0, 1500, '2027-12-31', 300, 29, 1, ?)
  `, [now, now, now]);
    // 6. Pre-seed enrollments for demo student (Pratik Patel)
    const ord1 = 'ord-1001';
    const ord2 = 'ord-1002';
    (0, database_js_1.execute)(`
    INSERT INTO orders (id, order_number, user_id, course_id, amount, discount_amount, coupon_code, payment_method, payment_status, billing_info, transaction_id, created_at)
    VALUES
    (?, 'TRX-2026-8910', ?, 'crs-trade-01', 0.0, 0.0, NULL, 'free', 'completed', ?, 'tx_free_8910', '2026-08-15T10:00:00Z'),
    (?, 'TRX-2026-9432', ?, 'crs-trade-02', 999.0, 1000.0, 'LAUNCH50', 'upi', 'completed', ?, 'tx_upi_9432', '2026-07-20T14:30:00Z')
  `, [
        ord1, studentId, JSON.stringify({ fullName: 'પ્રતીક પટેલ', city: 'અમદાવાદ', email: 'student@tradex.com' }),
        ord2, studentId, JSON.stringify({ fullName: 'પ્રતીક પટેલ', city: 'અમદાવાદ', email: 'student@tradex.com' })
    ]);
    // Enrollments
    (0, database_js_1.execute)(`
    INSERT INTO enrollments (id, user_id, course_id, order_id, enrolled_at, progress_percent, last_lesson_id, completed_at, status)
    VALUES
    ('enr-01', ?, 'crs-trade-01', ?, '2026-08-15T10:05:00Z', 100.0, 'lsn-mod-crs-trade-01-2-1', '2026-08-30T16:00:00Z', 'completed'),
    ('enr-02', ?, 'crs-trade-02', ?, '2026-07-20T14:35:00Z', 50.0, 'lsn-mod-crs-trade-02-1-2', NULL, 'active')
  `, [studentId, ord1, studentId, ord2]);
    // Pre-seed Certificate for Course 1
    (0, database_js_1.execute)(`
    INSERT INTO certificates (id, certificate_code, user_id, course_id, student_name, course_title, instructor_name, issued_at)
    VALUES
    ('cert-101', 'CERT-TRX-2026-78491', ?, 'crs-trade-01', 'પ્રતીક પટેલ (Pratik Patel)', 'બેઝિક શેર બજાર ફાઉન્ડેશન માસ્ટરક્લાસ', 'ભાવિક પટેલ (Bhavik Patel)', '2026-08-30T16:00:00Z')
  `, [studentId]);
    // Wishlist item
    (0, database_js_1.execute)(`
    INSERT INTO wishlist (id, user_id, course_id, created_at)
    VALUES
    ('wsh-1', ?, 'crs-trade-03', ?)
  `, [studentId, now]);
    // Reviews
    (0, database_js_1.execute)(`
    INSERT INTO reviews (id, course_id, user_id, rating, review_text, status, created_at, updated_at)
    VALUES
    ('rev-01', 'crs-trade-01', ?, 5, 'Stock Market માં zero થી start કરવા માટે આનાથી best course બીજો કોઈ હોઈ ન શકે. Demat Account operate કરવાનું અને Orders મૂકવાનું બધું સરળ Gujlish માં clear થઈ ગયું!', 'approved', '2026-08-25T14:20:00Z', '2026-08-25T14:20:00Z'),
    ('rev-02', 'crs-trade-02', ?, 5, 'Bhavik Sir નું Price Action teaching એકદમ powerful છે! Support અને Resistance હવે Chart જોતાં જ identify થઈ જાય છે. Indicators વગર trading કરવાનો confidence આવી ગયો.', 'approved', '2026-08-28T09:15:00Z', '2026-08-28T09:15:00Z'),
    ('rev-03', 'crs-trade-03', ?, 5, 'Nifty & BankNifty માં Option Greeks (Delta/Theta) સમજાવવાની Jignesh Sir ની style mindblowing છે. હવે Theta Decay માં unnecessary premium loss થતો નથી!', 'approved', '2026-09-02T16:45:00Z', '2026-09-02T16:45:00Z')
  `, [studentId, student2Id, studentId]);
    // 7. Site Content & CMS (Gujlish First)
    const heroContent = {
        badge: '🔥 Gujarat નું #1 Trading Education Platform',
        headline: 'Stock Market Trading શીખો સરળ રીતે!',
        subheadline: 'Trading ની શરૂઆત કરો અને market concepts ને step by step સમજો. Technical Analysis, Price Action, Nifty-BankNifty Options અને Crypto Trading હવે શીખો સરળ Gujlish માં. Live Chart Analysis અને Strict Risk Management સાથે Professional Trader બનો.',
        ctaPrimaryText: 'Course શરૂ કરો (Free)',
        ctaPrimaryLink: '/courses?price=free',
        ctaSecondaryText: 'અમારા Trading Courses',
        ctaSecondaryLink: '/courses',
        stats: [
            { label: 'Trained Gujarati Students', value: '50,000+' },
            { label: 'Community Rating', value: '4.9/5' },
            { label: 'Practical Chart Learning', value: '100%' },
            { label: 'WhatsApp Mentor Support', value: '24/7' }
        ]
    };
    const learningBenefits = [
        {
            title: 'સરળ Gujarati + English (Gujlish)',
            description: 'અઘરા terms વગર રોજિંદી Gujlish ભાષામાં practical market concepts શીખો.',
            icon: 'Target'
        },
        {
            title: 'Pure Price Action — No Tips',
            description: 'કોઈ Telegram tips નહિ, તમે જાતે Charts Analyze કરીને confident trade લઈ શકશો.',
            icon: 'Briefcase'
        },
        {
            title: 'Capital Protection First',
            description: 'Profit કરતાં પહેલાં Capital બચાવવી અને Risk Manage કરવો એ અમારો #1 Rule છે.',
            icon: 'CheckCircle'
        },
        {
            title: 'Lifetime Access & Certificates',
            description: 'ગમે ત્યારે revision કરો અને Course complete થતાં verified Digital Certificate મેળવો.',
            icon: 'Award'
        }
    ];
    const whyChooseUs = {
        badge: 'WHY TRADEX ACADEMY',
        title: 'Gujarati Traders શા માટે અમને પસંદ કરે છે?',
        subtitle: 'અમે tips નથી આપતા — Live Market માં Chart Read કરીને Self-Reliant Trader બનતા શીખવીએ છીએ',
        points: [
            'સરળ Gujlish ભાષામાં Live Market Case Studies સાથે practical learning',
            'No fake promises, no tips — ફક્ત proven Price Action & Data setups',
            'Capital Protection અને strict 1:2 Risk-to-Reward Ratio',
            'Lifetime Course Access અને downloadable PDF cheatsheets'
        ]
    };
    const testimonials = [
        {
            id: 't-1',
            name: 'પ્રતીક પટેલ (Pratik Patel)',
            role: 'Ahmedabad • Full-Time Options Trader',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
            rating: 5,
            content: 'હું પહેલાં Telegram Tips ના ચક્કરમાં દર મહિને મોટો Loss કરતો હતો. TradeX Academy ના Price Action અને Risk Management Course એ મારી trading life બદલી નાખી. હવે મારી પાસે proper setup અને defined Stop Loss છે.'
        },
        {
            id: 't-2',
            name: 'હર્ષિલ મહેતા (Harshil Mehta)',
            role: 'Surat • Textile Businessman & Swing Trader',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
            rating: 5,
            content: 'Business ની સાથે Part-time Trading કેવી રીતે કરવું તે મને Swing Trading Course માં શીખવા મળ્યું. સૌથી મોટી વાત એ છે કે બધું સરળ Gujlish માં સમજાવ્યું છે. Live Charts પર 1:3 Risk-to-Reward setups મળ્યા.'
        },
        {
            id: 't-3',
            name: 'નેહા શાહ (Neha Shah)',
            role: 'Vadodara • Banking Professional & Options Trader',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
            rating: 5,
            content: 'Nifty & BankNifty Options Trading Course outstanding છે! Option Greeks Delta અને Theta કેવી રીતે work કરે છે તે પહેલીવાર properly સમજાયું. WhatsApp Mentor Support પણ instantly help કરે છે.'
        }
    ];
    const faqs = [
        {
            id: 'faq-1',
            question: 'શું Complete Beginner પણ આ Course થી Trading શીખી શકે?',
            answer: 'હા, ચોક્કસ! અમારો "Stock Market Basics for Beginners" Course એકદમ zero થી start થાય છે. Demat Account open કરવાથી લઈને First Stock buy કરવો અને Risk Manage કરવો બધું સરળ Gujlish માં શીખવવામાં આવે છે.'
        },
        {
            id: 'faq-2',
            question: 'શું Trading શીખવા માટે Expensive Laptop જરૂરી છે કે Mobile થી શીખી શકાય?',
            answer: 'તમે કોઈપણ device — તમારા Android કે iPhone mobile, Tablet અથવા Laptop પરથી smoothly videos જોઈ શકો છો. અમારું platform 100% Mobile Friendly છે.'
        },
        {
            id: 'faq-3',
            question: 'Course enroll કર્યા પછી Videos કેટલા સમય સુધી જોઈ શકાશે?',
            answer: 'બધા Courses માં Lifetime Unlimited Access મળે છે! તમે ગમે ત્યારે, ગમે તેટલી વાર Videos revise કરી શકો છો. Future updates પણ completely Free મળશે.'
        },
        {
            id: 'faq-4',
            question: 'જો મને કોઈ Doubts કે Queries હોય તો Mentor Support કેવી રીતે મળશે?',
            answer: 'દરેક Student ને અમારો Dedicated WhatsApp Mentor Support મળે છે. તમે તમારા Chart Screenshots send કરીને Mentors પાસેથી direct feedback મેળવી શકો છો.'
        },
        {
            id: 'faq-5',
            question: 'શું તમે Live Trading Tips કે Calls આપો છો?',
            answer: 'ના. અમે કોઈ Telegram tips કે calls આપતા નથી. અમે તમને 100% genuine education આપીએ છીએ જેથી તમે જાતે Charts Analyze કરીને Self-Reliant Trader બની શકો.'
        }
    ];
    const siteSettings = {
        platformName: 'TradeX Academy',
        tagline: 'ગુજરાતનું #1 Trading Education Platform',
        supportEmail: 'support@tradex.com',
        supportPhone: '+91 98765 43210',
        currency: 'INR',
        currencySymbol: '₹',
        enableRegistration: true,
        certificatePrefix: 'CERT-TRX',
        organizationName: 'TradeX Academy Gujarat'
    };
    const promoBanner = {
        isActive: true,
        message: '🎉 Gujarat ના Traders માટે Special Offer: બધા Trading Courses પર Flat 50% OFF!',
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
    console.log('Database seeded successfully with Gujarati Trading Education curriculum!');
}
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
    runSeed().catch(err => {
        console.error('Seed error:', err);
        process.exit(1);
    });
}
