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
        'મુખ્ય મેન્ટર & પ્રાઇસ એક્શન ટ્રેડર (10+ Years Exp)',
        'ભારતીય શેર બજારમાં ૧૦+ વર્ષનો અનુભવ ધરાવતા ફૂલ-ટાઇમ ટ્રેડર. ૩૫,૦૦૦થી વધુ ગુજરાતી વિદ્યાર્થીઓને સરળ માતૃભાષામાં નફાકારક પ્રાઇસ એક્શન ટેકનિક શીખવી છે.',
        'પ્રાઇસ એક્શન, કેન્ડલસ્ટિક પેટર્ન, રિસ્ક મેનેજમેન્ટ, સ્વિંગ ટ્રેડિંગ',
        JSON.stringify({ youtube: 'https://youtube.com', telegram: 'https://t.me', instagram: 'https://instagram.com' }),
        now,
        inst2Id, 'જિજ્ઞેશ શાહ (Jignesh Shah)', 'jignesh@tradex.com',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
        'ઓપ્શન્સ ડેટા & એક્સપાયરી સ્પેશિયાલિસ્ટ (8+ Years Exp)',
        'નિફ્ટી અને બેંકનિફ્ટી ઓપ્શન્સ ગ્રીક્સ (Delta/Theta), ઓપન ઇન્ટરેસ્ટ (OI) એનાલિસિસ અને હાઇ-પ્રોબેબિલિટી એક્સપાયરી સેટઅપના નિષ્ણાત.',
        'ઓપ્શન્સ બાઇંગ/સેલિંગ, ઓપ્શન ગ્રીક્સ, નિફ્ટી/બેંકનિફ્ટી, ક્રિપ્ટો ફ્યુચર્સ',
        JSON.stringify({ youtube: 'https://youtube.com', telegram: 'https://t.me' }),
        now
    ]);
    // 3. Categories (Gujarati Trading Pillars)
    const catData = [
        { id: 'cat-stock-basics', name: 'શેર બજાર બેઝિક્સ (Stock Market Basics)', slug: 'stock-basics', description: 'ડીમેટ એકાઉન્ટ, NSE/BSE, ઓર્ડર ટાઇપ્સ અને શરૂઆત કરવાની સાચી રીત.', icon: 'BarChart3', order: 1 },
        { id: 'cat-price-action', name: 'પ્રાઇસ એક્શન અને કેન્ડલસ્ટિક (Price Action)', slug: 'price-action', description: 'કોઈ ઇન્ડિકેટર વગર પ્યોર ચાર્ટ રીડિંગ, સપોર્ટ, રેઝિસ્ટન્સ અને પેટર્ન.', icon: 'TrendingUp', order: 2 },
        { id: 'cat-options-trading', name: 'ઓપ્શન્સ ટ્રેડિંગ માસ્ટરી (Options Trading)', slug: 'options-trading', description: 'નિફ્ટી અને બેંકનિફ્ટીમાં કોલ-પુટ, ગ્રીક્સ અને એક્સપાયરી ડે સેટઅપ.', icon: 'Sparkles', order: 3 },
        { id: 'cat-swing-trading', name: 'સ્વિંગ ટ્રેડિંગ અને વેલ્થ બિલ્ડિંગ (Swing Trading)', slug: 'swing-trading', description: 'મલ્ટીબેગર સ્ટોક્સ શોધવા અને ૧:૩ રિસ્ક-રિવોર્ડ સાથે ટ્રેડિંગ.', icon: 'Briefcase', order: 4 },
        { id: 'cat-crypto-trading', name: 'ક્રિપ્ટોકરન્સી અને બ્લોકચેન (Crypto Trading)', slug: 'crypto-trading', description: 'બિટકોઇન, ઓલ્ટકોઇન્સ, સ્પોટ અને સેફ ફ્યુચર્સ પોઝિશનિંગ.', icon: 'Coins', order: 5 },
        { id: 'cat-psychology-risk', name: 'ટ્રેડિંગ સાયકોલોજી & રિસ્ક મેનેજમેન્ટ (Psychology)', slug: 'psychology-risk', description: 'કેપિટલ પ્રોટેક્શન, સ્ટોપ લોસ ડિસિપ્લિન અને માઇન્ડસેટ માસ્ટરી.', icon: 'ShieldAlert', order: 6 },
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
            title: 'બેઝિક શેર બજાર ફાઉન્ડેશન માસ્ટરક્લાસ (Stock Market Basics for Beginners)',
            slug: 'stock-market-basics-for-beginners-gujarati',
            short_description: 'નવા નિશાળિયાઓ માટે ૧૦૦% સરળ ગુજરાતીમાં શેર બજારનો સંપૂર્ણ કોર્સ. ડીમેટ એકાઉન્ટ ખોલવાથી લઈને પહેલો નફાકારક શેર ખરીદવા સુધીનું લાઈવ ગાઈડન્સ.',
            description: `### ગુજરાતીમાં શીખો શેર બજારનો પાયો
શેર બજારમાં પ્રવેશતા પહેલાં સાચી સમજ હોવી સૌથી જરૂરી છે. આ ફાઉન્ડેશન કોર્સમાં કોઈ અઘરા અંગ્રેજી શબ્દો વગર બિલકુલ શૂન્યથી પ્રેક્ટિકલ નોલેજ આપવામાં આવ્યું છે.

#### આ કોર્સમાં તમે શું શીખશો:
* **શેર બજાર કેવી રીતે કામ કરે છે?**: NSE, BSE, Nifty 50 અને Sensex ની સંપૂર્ણ સમજ.
* **ડીમેટ અને ટ્રેડિંગ એકાઉન્ટ**: Zerodha, AngelOne કે Groww માં એકાઉન્ટ કેવી રીતે ઓપરેટ કરવું.
* **ઓર્ડર ટાઇપ્સ**: માર્કેટ ઓર્ડર, લિમિટ ઓર્ડર, સ્ટોપ લોસ (SL) અને ટાર્ગેટ ઓર્ડર.
* **બેઝિક ચાર્ટ રીડિંગ**: કેન્ડલ્સ કેવી રીતે બને છે અને પ્રાઇસ મોમેન્ટમ કેવી રીતે જોવું.`,
            category_id: 'cat-stock-basics',
            instructor_id: inst1Id,
            thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo1,
            price: 0,
            discount_price: 0,
            difficulty_level: 'Beginner',
            duration: '12.5 કલાક',
            language: 'ગુજરાતી (Gujarati)',
            learning_outcomes: JSON.stringify([
                'ડીમેટ અને ટ્રેડિંગ એકાઉન્ટ ઓપરેટ કરવાની સાચી પદ્ધતિ',
                'શેરની ખરીદ-વેચાણ અને ઓર્ડર ટાઇપ્સનું વ્યવહારુ જ્ઞાન',
                'શેર બજારમાં કેપિટલ ગુમાવ્યા વગર સેફ શરૂઆત',
                'બેઝિક ટ્રેડિંગવ્યૂ (TradingView) ચાર્ટ સેટઅપ'
            ]),
            requirements: JSON.stringify([
                'કોઈ પૂર્વ નાણાકીય કે કોડિંગ અનુભવ જરૂરી નથી',
                'મોબાઈલ ફોન અથવા કમ્પ્યુટર અને ઇન્ટરનેટ કનેક્શન',
                'રોજ ૩૦ મિનિટ પ્રેક્ટિસ કરવાની ધગશ'
            ]),
            target_audience: JSON.stringify([
                'સંપૂર્ણ નવા વિદ્યાર્થીઓ અને હાઉસવાઇફ્સ',
                'નોકરીયાત અને વેપારી મિત્રો જે સાઇડ ઇન્કમ ઇચ્છે છે',
                'શેર બજારને વ્યવસાય તરીકે શરૂ કરવા માંગતા મિત્રો'
            ]),
            tags: JSON.stringify(['શેર બજાર', 'Stock Market', 'Basics', 'Demat Account', 'Beginner Friendly']),
            status: 'published',
            featured: 1,
            popular: 1,
            is_new: 0,
            enrolled_count: 14800,
            rating: 4.95,
            review_count: 840,
            modules: [
                {
                    title: 'મોડ્યુલ ૧: શેર બજાર પરિચય અને ડીમેટ એકાઉન્ટ',
                    description: 'શેર બજારની શરૂઆત અને જરૂરી સાધનો.',
                    lessons: [
                        {
                            title: '૧.૧ શેર બજાર શું છે અને નફો કેવી રીતે થાય છે?',
                            description: 'કંપનીઓ લિસ્ટ કેમ થાય છે અને રિટેલ ટ્રેડર તરીકે આપણી તક શું છે.',
                            video_url: sampleVideo1,
                            video_duration: '18:40',
                            is_preview: 1,
                            resources: [
                                { name: 'Stock-Market-Basics-Gujarati.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', size: '2.1 MB' }
                            ],
                            quizzes: [
                                {
                                    question: 'NSE અને BSE ભારતમાં શું ભૂમિકા ભજવે છે?',
                                    options: [
                                        'તે શેર ખરીદ-વેચાણ માટેના માન્ય સ્ટોક એક્સચેન્જ છે',
                                        'તે સરકારી બેંકો છે',
                                        'તે શેરની કિંમત નક્કી કરતી ખાનગી કંપનીઓ છે',
                                        'તે મ્યુચ્યુઅલ ફંડ એજન્ટ છે'
                                    ],
                                    correct_index: 0,
                                    explanation: 'NSE (National Stock Exchange) અને BSE (Bombay Stock Exchange) ભારતના બે મુખ્ય શેર એક્સચેન્જ છે.'
                                }
                            ]
                        },
                        {
                            title: '૧.૨ ડીમેટ એકાઉન્ટ ઓપરેટિંગ અને બ્રોકરેજ સેટઅપ',
                            description: 'બ્રોકર કેવી રીતે પસંદ કરવો અને ઓર્ડર કેવી રીતે મુકવા.',
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
                    title: 'મોડ્યુલ ૨: પહેલો શેર ખરીદવો અને રિસ્ક મેનેજમેન્ટ',
                    description: 'પ્રાયોગિક ટ્રેડિંગ અને કેપિટલ પ્રોટેક્શન.',
                    lessons: [
                        {
                            title: '૨.૧ માર્કેટ, લિમિટ અને સ્ટોપ લોસ (SL) ઓર્ડર',
                            description: 'ઓર્ડર મુકતી વખતે થતી ભૂલો અને સાચી રીત.',
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
            title: 'પ્યોર પ્રાઇસ એક્શન અને કેન્ડલસ્ટિક સિક્રેટ્સ (Price Action Mastery)',
            slug: 'price-action-and-candlestick-secrets-gujarati',
            short_description: 'કોઈ પણ લેગિંગ ઇન્ડિકેટર વગર પ્યોર ચાર્ટ રીડિંગ. સપોર્ટ-રેઝિસ્ટન્સ, ટ્રેન્ડલાઈન, હેમર, ડોજી અને ફોલ્સ બ્રેકઆઉટ ટ્રેપ પકડવાની માસ્ટરી.',
            description: `### માર્કેટની ભાષા એટલે પ્રાઇસ એક્શન
ઇન્ડિકેટર્સ હંમેશાં ભાવ ચાલ્યા પછી સિગ્નલ આપે છે, જ્યારે પ્રાઇસ એક્શન તમને માર્કેટ ચાલતા પહેલાં સંકેત આપે છે. આ કોર્સમાં અમે તમને મોટા પ્લેયર્સ (FII / DII) કેવી રીતે વિચારે છે અને ચાર્ટ પર ક્યાં ફૂટપ્રિન્ટ્સ છોડે છે તે શીખવીએ છીએ.

#### મુખ્ય આકર્ષણ:
* સપોર્ટ અને રેઝિસ્ટન્સ લાઈન સાચી રીતે ડ્રો કરવાની પદ્ધતિ
* ૭ મોસ્ટ પ્રોફિટેબલ કેન્ડલસ્ટિક પેટર્ન અને ખોટા સિગ્નલથી બચવાના નિયમો
* બ્રેકઆઉટ vs રીટેસ્ટ ટ્રેડિંગ સેટઅપ
* ૧:૨ અને ૧:૩ રિસ્ક-ટુ-રિવોર્ડ રેશિયો સાથે એન્ટ્રી`,
            category_id: 'cat-price-action',
            instructor_id: inst1Id,
            thumbnail: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo2,
            price: 3999,
            discount_price: 1999,
            difficulty_level: 'All Levels',
            duration: '18.0 કલાક',
            language: 'ગુજરાતી (Gujarati)',
            learning_outcomes: JSON.stringify([
                'કોઈ પણ ઇન્ડિકેટર વગર ક્લીન ચાર્ટ એનાલિસિસ',
                'સપોર્ટ, રેઝિસ્ટન્સ અને ડાયનેમિક ટ્રેન્ડલાઈન્સ',
                'હેમર, શૂટિંગ સ્ટાર, એન્ગલ્ફિંગ અને મોર્નિંગ સ્ટાર પેટર્ન',
                'ફેક બ્રેકઆઉટ ટ્રેપ ઓળખીને વિપરીત ટ્રેડ લેવો'
            ]),
            requirements: JSON.stringify([
                'શેર બજારની મૂળભૂત બાબતોની સમજ',
                'TradingView વેબસાઇટનો બેઝિક ઉપયોગ',
                'ચાર્ટ પ્રેક્ટિસ કરવાની તૈયારી'
            ]),
            target_audience: JSON.stringify([
                'ઇન્ટ્રાડે અને સ્વિંગ ટ્રેડર્સ જે લોસ ઘટાડવા માંગે છે',
                'ઇન્ડિકેટર્સના કન્ફ્યુઝનથી કંટાળેલા ટ્રેડર્સ',
                'ચાર્ટ રીડિંગમાં કોન્ફિડન્સ ઇચ્છતા ગુજરાતીઓ'
            ]),
            tags: JSON.stringify(['Price Action', 'Candlestick', 'Support Resistance', 'Chart Reading', 'Intraday']),
            status: 'published',
            featured: 1,
            popular: 1,
            is_new: 0,
            enrolled_count: 9800,
            rating: 4.96,
            review_count: 620,
            modules: [
                {
                    title: 'મોડ્યુલ ૧: માર્કેટ સ્ટ્રક્ચર અને પ્રાઇસ બિહેવિયર',
                    description: 'હાયર હાઈ (HH), હાયર લો (HL) અને ટ્રેન્ડ કન્ફર્મેશન.',
                    lessons: [
                        {
                            title: '૧.૧ સપોર્ટ અને રેઝિસ્ટન્સનું સાચું સાયકોલોજીકલ રહસ્ય',
                            description: 'બાયર્સ અને સેલર્સ વચ્ચેની લડાઈ ચાર્ટ પર કેવી રીતે દેખાય છે.',
                            video_url: sampleVideo2,
                            video_duration: '24:10',
                            is_preview: 1,
                            resources: [
                                { name: 'Price-Action-CheatSheet.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', size: '3.2 MB' }
                            ],
                            quizzes: []
                        },
                        {
                            title: '૧.૨ ટ્રેન્ડલાઈન ડ્રો કરવાની ૧૦૦% સાચી પદ્ધતિ',
                            description: 'ફેક વીક્સ અને બોડી વચ્ચે સાચો ટ્રેન્ડ નક્કી કરવો.',
                            video_url: sampleVideo3,
                            video_duration: '21:40',
                            is_preview: 0,
                            resources: [],
                            quizzes: []
                        }
                    ]
                },
                {
                    title: 'મોડ્યુલ ૨: કેન્ડલસ્ટિક પેટર્ન અને ટ્રેડિંગ એન્ટ્રી',
                    description: 'પ્રાઇસ રિજેક્શન અને મોમેન્ટમ કેન્ડલ્સ.',
                    lessons: [
                        {
                            title: '૨.૧ હેમર અને શૂટિંગ સ્ટાર: ક્યાં ટ્રેડ કરવો અને ક્યાં અવોઇડ કરવો',
                            description: 'સપોર્ટ પર હેમર બનતા જ હાઈ પ્રોબેબિલિટી ટ્રેડ.',
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
            title: 'ઓપ્શન્સ ટ્રેડિંગ અને નિફ્ટી/બેંકનિફ્ટી એક્સપાયરી સ્ટ્રેટેજી (Options Mastery)',
            slug: 'nifty-banknifty-options-trading-mastery-gujarati',
            short_description: 'ઓપ્શન્સ બાઇંગ અને સેલિંગની સંપૂર્ણ પદ્ધતિ. ઓપ્શન ગ્રીક્સ (Delta, Theta, Gamma), સ્ટ્રાઇક સિલેક્શન, ઓપન ઇન્ટરેસ્ટ (OI) અને એક્સપાયરી ડે હીરો-ઝીરો સેટઅપ.',
            description: `### ઓપ્શન્સ ટ્રેડિંગમાં પ્રોફિટેબલ બનવાનો રોડમેપ
મોટાભાગના નવા ટ્રેડર્સ ઓપ્શન્સ બાઇંગમાં થીટા ડીકે (સમયના નુકસાન)ને કારણે કેપિટલ ગુમાવે છે. આ માસ્ટરક્લાસમાં જિજ્ઞેશ શાહ તમને ડેટા-ડ્રિવન ઓપ્શન્સ ટ્રેડિંગ શીખવે છે.

#### આ કોર્સમાં શામેલ છે:
* કૉલ (CE) અને પુટ (PE) ની ગણતરી અને સ્ટ્રાઇક પ્રાઇસ પસંદગી
* ઓપ્શન ગ્રીક્સ: ડેલ્ટા, થીટા ડીકે અને વેગા વોલેટિલિટી
* ઓપન ઇન્ટરેસ્ટ (OI) અને ચેઇન એનાલિસિસથી સપોર્ટ નક્કી કરવો
* ગુરુવાર (એક્સપાયરી) સ્પેશિયલ સેટઅપ્સ અને પ્રીમિયમ ડીકે લાભ`,
            category_id: 'cat-options-trading',
            instructor_id: inst2Id,
            thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo3,
            price: 5999,
            discount_price: 2999,
            difficulty_level: 'Intermediate',
            duration: '22.5 કલાક',
            language: 'ગુજરાતી (Gujarati)',
            learning_outcomes: JSON.stringify([
                'ઓપ્શન્સમાં કોલ અને પુટની સાચી ગણતરી',
                'ઓપ્શન ગ્રીક્સ (Delta/Theta) સમજીને થીટા લોસથી બચવું',
                'નિફ્ટી અને બેંકનિફ્ટીમાં હાઇ-મોમેન્ટમ ઓપ્શન બાઇંગ',
                'ઓપન ઇન્ટરેસ્ટ (OI) અને પીસીઆર (PCR) ડેટા રીડિંગ'
            ]),
            requirements: JSON.stringify([
                'શેર બજાર અને બેઝિક ચાર્ટ્સનું જ્ઞાન',
                'ઓછામાં ઓછું ૩ મહિનાનું માર્કેટ ઓબ્ઝર્વેશન',
                'કડક સ્ટોપ લોસ પાળવાની માનસિકતા'
            ]),
            target_audience: JSON.stringify([
                'નિફ્ટી અને બેંકનિફ્ટીમાં ટ્રેડ કરતા તમામ ટ્રેડર્સ',
                'ઓપ્શન્સમાં વારંવાર પ્રીમિયમ લોસ ભોગવતા લોકો',
                'ડેટા આધારિત ઓપ્શન્સ સ્ટ્રેટેજી શીખવા માંગતા રોકાણકારો'
            ]),
            tags: JSON.stringify(['Options Trading', 'Nifty', 'BankNifty', 'Option Greeks', 'Expiry Strategy']),
            status: 'published',
            featured: 1,
            popular: 1,
            is_new: 1,
            enrolled_count: 11200,
            rating: 4.94,
            review_count: 730,
            modules: [
                {
                    title: 'મોડ્યુલ ૧: ઓપ્શન્સ બેઝિક્સ અને ગ્રીક્સ મિકેનિક્સ',
                    description: 'કોલ, પુટ અને થીટા ટાઇમ ડીકેની ગણતરી.',
                    lessons: [
                        {
                            title: '૧.૧ ઓપ્શન્સ શું છે? પ્રીમિયમ કઈ રીતે વધે-ઘટે છે?',
                            description: 'ઇન્ટ્રિન્સિક વેલ્યુ અને ટાઇમ વેલ્યુ વચ્ચેનો તફાવત.',
                            video_url: sampleVideo3,
                            video_duration: '26:30',
                            is_preview: 1,
                            resources: [
                                { name: 'Option-Greeks-Handbook.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', type: 'pdf', size: '2.8 MB' }
                            ],
                            quizzes: []
                        },
                        {
                            title: '૧.૨ થીટા ડીકે (Theta Decay) થી બચીને સાચી સ્ટ્રાઇક કેમ પસંદ કરવી',
                            description: 'ITM vs ATM vs OTM નો વાસ્તવિક ઉપયોગ.',
                            video_url: sampleVideo1,
                            video_duration: '31:20',
                            is_preview: 0,
                            resources: [],
                            quizzes: []
                        }
                    ]
                },
                {
                    title: 'મોડ્યુલ ૨: નિફ્ટી અને બેંકનિફ્ટી લાઈવ ટ્રેડિંગ સેટઅપ્સ',
                    description: 'એક્સપાયરી સ્પેશિયલ અને બ્રેકઆઉટ ટ્રેડ્સ.',
                    lessons: [
                        {
                            title: '૨.૧ ઓપન ઇન્ટરેસ્ટ (OI) ડેટા વડે ટ્રેન્ડ નક્કી કરવો',
                            description: 'ઓપ્શન ચેઇન રીડ કરીને સપોર્ટ અને રેઝિસ્ટન્સ પકડવું.',
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
            title: 'સ્વિંગ ટ્રેડિંગ અને મલ્ટીબેગર સ્ટોક સિલેક્શન (Swing Trading & Wealth)',
            slug: 'swing-trading-and-multibagger-stocks-gujarati',
            short_description: 'રોજ સ્ક્રીન સામે બેઠા વગર પાર્ટ-ટાઇમ ટ્રેડિંગ. ૧ થી ૪ અઠવાડિયામાં ૧૦% થી ૨૫% વળતર મેળવવા માટેના શ્રેષ્ઠ બ્રેકઆઉટ સ્ટોક્સ પસંદ કરવાની સ્ટ્રેટેજી.',
            description: `### નોકરી અને બિઝનેસ સાથે વેલ્થ બિલ્ડિંગ
સ્વિંગ ટ્રેડિંગ એ એવા લોકો માટે શ્રેષ્ઠ માધ્યમ છે જેઓ દિવસભર સ્ક્રીન સામે બેસી શકતા નથી. અઠવાડિયામાં ફક્ત ૨ કલાકનું એનાલિસિસ કરીને સારા સ્ટોક્સમાં પોઝિશન બનાવવાની ટેકનિક શીખો.`,
            category_id: 'cat-swing-trading',
            instructor_id: inst1Id,
            thumbnail: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo4,
            price: 4999,
            discount_price: 2499,
            difficulty_level: 'Beginner',
            duration: '15.0 કલાક',
            language: 'ગુજરાતી (Gujarati)',
            learning_outcomes: [
                '૨૦ અને ૫૦ મૂવિંગ એવરેજ પુલબેક સેટઅપ',
                'હાઈ વોલ્યુમ બ્રેકઆઉટ સ્ટોક્સ સ્કેનિંગ',
                '૧:૩ રિસ્ક-રિવોર્ડ સાથે પોઝિશન હોલ્ડિંગ',
                'ટ્રેઇલિંગ સ્ટોપ લોસથી મહત્તમ નફો મેળવવો'
            ],
            requirements: [
                'કોઈ પણ વ્યક્તિ શીખી શકે છે',
                'અઠવાડિયે ૨-૩ કલાક ચાર્ટ જોવાની તૈયારી'
            ],
            target_audience: [
                'નોકરીયાત મિત્રો અને વેપારીઓ',
                'લાંબા ગાળાના રોકાણકારો',
                'શાંતિપૂર્ણ ટ્રેડિંગ પસંદ કરતા લોકો'
            ],
            tags: ['Swing Trading', 'Multibagger', 'Breakout Stocks', 'Part-Time Trading'],
            status: 'published',
            featured: 1,
            popular: 0,
            is_new: 0,
            enrolled_count: 6700,
            rating: 4.91,
            review_count: 410,
            modules: [
                {
                    title: 'મોડ્યુલ ૧: સ્વિંગ ટ્રેડિંગ ફંડામેન્ટલ્સ',
                    description: 'સ્ટોક સ્કેનિંગ અને વોલ્યુમ એનાલિસિસ.',
                    lessons: [
                        {
                            title: '૧.૧ સ્વિંગ ટ્રેડિંગના સુવર્ણ નિયમો અને સ્ટોક સ્કેનિંગ',
                            description: 'Chartink જેવા ફ્રી ટૂલ્સથી ૨ મિનિટમાં સારા સ્ટોક્સ શોધવા.',
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
            title: 'ક્રિપ્ટોકરન્સી ટ્રેડિંગ અને ફ્યુચર્સ ગાઇડ (Crypto Trading Essentials)',
            slug: 'crypto-trading-and-futures-guide-gujarati',
            short_description: 'બિટકોઇન, ઇથેરિયમ અને અલ્ટકોઇન્સનું ટેકનિકલ એનાલિસિસ. ૨૪/૭ ગ્લોબલ માર્કેટમાં સેફ સ્પોટ અને ફ્યુચર્સ ટ્રેડિંગના નિયમો.',
            description: `### ગ્લોબલ ક્રિપ્ટો માર્કેટમાં યોગ્ય માર્ગદર્શન
ક્રિપ્ટો માર્કેટમાં હાઈ વોલેટિલિટી હોય છે. જો યોગ્ય રિસ્ક મેનેજમેન્ટ ન હોય તો મોટો લોસ થઈ શકે છે. આ કોર્સમાં અમે સેફ પોઝિશનિંગ અને ગ્લોબલ સેન્ટિમેન્ટ રીડિંગ શીખવીએ છીએ.`,
            category_id: 'cat-crypto-trading',
            instructor_id: inst2Id,
            thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo1,
            price: 2999,
            discount_price: 1499,
            difficulty_level: 'Intermediate',
            duration: '14.0 કલાક',
            language: 'ગુજરાતી (Gujarati)',
            learning_outcomes: [
                'બિટકોઇન અને અલ્ટકોઇન્સ ચાર્ટ એનાલિસિસ',
                'સ્પોટ અને ફ્યુચર્સ ટ્રેડિંગમાં લેવરેજ કંટ્રોલ',
                'ક્રિપ્ટો વોલેટ સિક્યોરિટી અને એક્સચેન્જ સેફ્ટી'
            ],
            requirements: [
                'ઇન્ટરનેટ કનેક્શન અને બેઝિક ડિજિટલ સાક્ષરતા'
            ],
            target_audience: [
                'ક્રિપ્ટોમાં સાચી સમજ સાથે ટ્રેડ કરવા માંગતા મિત્રો'
            ],
            tags: ['Crypto', 'Bitcoin', 'Futures', 'Blockchain'],
            status: 'published',
            featured: 0,
            popular: 0,
            is_new: 1,
            enrolled_count: 4200,
            rating: 4.88,
            review_count: 290,
            modules: [
                {
                    title: 'મોડ્યુલ ૧: ક્રિપ્ટો માર્કેટ સ્ટ્રક્ચર',
                    description: 'બિટકોઇન સાયકલ અને અલ્ટકોઇન સીઝન.',
                    lessons: [
                        {
                            title: '૧.૧ બિટકોઇન સાયકલ અને ગ્લોબલ લિક્વિડિટી',
                            description: 'ક્રિપ્ટોમાં સાચો ટ્રેડ ક્યારે લેવો.',
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
            title: 'ટ્રેડિંગ સાયકોલોજી, રિસ્ક મેનેજમેન્ટ અને સ્ટોપ લોસ રૂલ્સ (Psychology Mastery)',
            slug: 'trading-psychology-risk-management-gujarati',
            short_description: '૯૦% ટ્રેડર્સ સાયકોલોજી અને ડિસિપ્લિનના અભાવે લોસ કરે છે. લોભ, ડર અને રિવિન્જ ટ્રેડિંગ પર નિયંત્રણ મેળવીને પ્રોફેશનલ માઇન્ડસેટ કેળવવાનો ફ્રી માસ્ટરક્લાસ.',
            description: `### ટ્રેડિંગ એ માઇન્ડગેમ છે
જો તમારી પાસે દુનિયાની શ્રેષ્ઠ સ્ટ્રેટેજી હોય પણ સાયકોલોજી નબળી હોય, તો તમે ક્યારેય પ્રોફિટેબલ નહીં બની શકો. આ કોર્સમાં ટ્રેડિંગ જર્નલ બનાવવું, ડેઇલી લોસ લિમિટ સેટ કરવી અને ઇમોશન્સ કંટ્રોલ કરવાની સાયન્ટિફિક પદ્ધતિઓ શીખવવામાં આવે છે.`,
            category_id: 'cat-psychology-risk',
            instructor_id: inst1Id,
            thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
            preview_video_url: sampleVideo2,
            price: 0,
            discount_price: 0,
            difficulty_level: 'All Levels',
            duration: '8.5 કલાક',
            language: 'ગુજરાતી (Gujarati)',
            learning_outcomes: [
                'રિવિન્જ ટ્રેડિંગ અને ઓવર-ટ્રેડિંગ પર ૧૦૦% કાબૂ',
                '૧ દિવસમાં કેટલો લોસ લેવો તેનો ચોક્કસ નિયમ',
                'ટ્રેડિંગ જર્નલ બનાવીને ભૂલો સુધારવાની ટેકનિક',
                'શાંત મનથી ચાર્ટ સામે બેસવાની આદતો'
            ],
            requirements: [
                'ટ્રેડિંગમાં સુધારો કરવાની નિષ્ઠાવાન ઇચ્છા'
            ],
            target_audience: [
                'દરેક ઇન્ટ્રાડે, સ્વિંગ અને ઓપ્શન્સ ટ્રેડર'
            ],
            tags: ['Psychology', 'Risk Management', 'Capital Protection', 'Discipline'],
            status: 'published',
            featured: 1,
            popular: 1,
            is_new: 0,
            enrolled_count: 18500,
            rating: 4.98,
            review_count: 1120,
            modules: [
                {
                    title: 'મોડ્યુલ ૧: ટ્રેડિંગ માઇન્ડસેટ અને કેપિટલ પ્રોટેક્શન',
                    description: 'ડર અને લોભ સામે જીત મેળવવી.',
                    lessons: [
                        {
                            title: '૧.૧ શા માટે ૯૦% ટ્રેડર્સ પૈસા ગુમાવે છે? રિસ્ક મેનેજમેન્ટનો ૧% નિયમ',
                            description: 'કોઈ પણ એક ટ્રેડમાં કેપિટલના ૧% થી વધુ જોખમ ન લેવું.',
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
    ('rev-01', 'crs-trade-01', ?, 5, 'શેર બજારમાં શૂન્યમાંથી શરૂઆત કરવા માટે આનાથી સારો કોર્સ બીજો કોઈ હોઈ ન શકે. ડીમેટ એકાઉન્ટ ઓપરેટ કરવાનું અને ઓર્ડર મુકવાનું બધું સરળ ગુજરાતીમાં શીખવા મળ્યું!', 'approved', '2026-08-25T14:20:00Z', '2026-08-25T14:20:00Z'),
    ('rev-02', 'crs-trade-02', ?, 5, 'ભાવિક સરનું પ્રાઇસ એક્શન ટીચિંગ એકદમ પાવરફુલ છે! સપોર્ટ અને રેઝિસ્ટન્સ હવે ચાર્ટ જોતાં જ ઓળખાઈ જાય છે. અમદાવાદથી આ કોર્સ જોઈને મને ઘણો લાભ થયો છે.', 'approved', '2026-08-28T09:15:00Z', '2026-08-28T09:15:00Z'),
    ('rev-03', 'crs-trade-03', ?, 5, 'નિફ્ટી અને બેંકનિફ્ટીમાં ઓપ્શન્સ ગ્રીક્સ (ડેલ્ટા/થીટા) સમજાવવાની જિજ્ઞેશ સરની રીત અદભુત છે. હવે થીટા ડીકેમાં પ્રીમિયમ લોસ થતો નથી!', 'approved', '2026-09-02T16:45:00Z', '2026-09-02T16:45:00Z')
  `, [studentId, student2Id, studentId]);
    // 7. Site Content & CMS (Gujarati First)
    const heroContent = {
        badge: '🔥 ગુજરાતનું નંબર 1 ટ્રેડિંગ એજ્યુકેશન પ્લેટફોર્મ',
        headline: 'ગુજરાતીમાં શીખો શેર બજાર અને ઓપ્શન્સ ટ્રેડિંગની સાચી રીત',
        subheadline: 'પ્રાઇસ એક્શન, નિફ્ટી-બેંકનિફ્ટી ઓપ્શન્સ, કેન્ડલસ્ટિક પેટર્ન અને ક્રિપ્ટો ટ્રેડિંગ સરળ માતૃભાષામાં. લાઈવ માર્કેટ એનાલિસિસ અને રિસ્ક મેનેજમેન્ટ સાથે પ્રોફેશનલ ટ્રેડર બનો.',
        ctaPrimaryText: 'મફતમાં શીખવાનું શરૂ કરો',
        ctaPrimaryLink: '/courses?price=free',
        ctaSecondaryText: 'બધા કોર્સ જુઓ',
        ctaSecondaryLink: '/courses',
        stats: [
            { label: 'ગુજરાતી વિદ્યાર્થીઓ', value: '૫૦,૦૦૦+' },
            { label: 'કોમ્યુનિટી રેટિંગ', value: '૪.૯/૫' },
            { label: 'પ્રાયોગિક જ્ઞાન', value: '૧૦૦%' },
            { label: 'વોટ્સએપ મેન્ટર સપોર્ટ', value: '૨૪/૭' }
        ]
    };
    const learningBenefits = [
        {
            title: '૧૦૦% સરળ ગુજરાતી ભાષા',
            description: 'અંગ્રેજીના અઘરા શબ્દો વગર માતૃભાષામાં લાઈવ ઉદાહરણો સાથે સંપૂર્ણ શિક્ષણ.',
            icon: 'Target'
        },
        {
            title: 'પ્યોર પ્રાઇસ એક્શન — કોઈ ટીપ્સ નહીં',
            description: 'અમે ટેલિગ્રામ ટીપ્સ નથી આપતા. તમને જાતે ચાર્ટ રીડ કરીને સ્વતંત્ર ટ્રેડર બનાવીએ છીએ.',
            icon: 'Briefcase'
        },
        {
            title: 'કેપિટલ પ્રોટેક્શન પ્રથમ નિયમ',
            description: 'પ્રોફિટ કરતાં પહેલાં કેપિટલ કેવી રીતે બચાવવી અને સ્ટોપ લોસ ક્યાં મુકવો તે શીખવો.',
            icon: 'CheckCircle'
        },
        {
            title: 'લાઈફટાઈમ એક્સેસ અને સર્ટિફિકેટ',
            description: 'ગમે ત્યારે રિવિઝન કરો અને કોર્સ પૂર્ણ કરતાં સત્તાવાર ડિજિટલ સર્ટિફિકેટ મેળવો.',
            icon: 'Award'
        }
    ];
    const whyChooseUs = {
        badge: 'શા માટે TRADEX ACADEMY?',
        title: 'હજારો ગુજરાતીઓ શા માટે અમારા પર ભરોસો મૂકે છે?',
        subtitle: 'અમે માત્ર થિયરી નથી ભણાવતા — લાઈવ માર્કેટમાં ટકી રહેવાની સાચી ટેકનિક શીખવીએ છીએ',
        points: [
            '૧૦૦% સરળ ગુજરાતી ભાષામાં લાઈવ એક્ઝામ્પલ સાથે શિક્ષણ',
            'ખોટા પ્રોમિસ કે ટીપ્સ નહીં - માત્ર વાસ્તવિક પ્રાઇસ એક્શન',
            'કેપિટલ પ્રોટેક્શન અને કડક રિસ્ક-ટુ-રિવોર્ડ રેશિયો',
            'લાઈફટાઈમ કોર્સ એક્સેસ અને ડાઉનલોડેબલ પીડીએફ ચીટશીટ'
        ]
    };
    const testimonials = [
        {
            id: 't-1',
            name: 'પ્રતીક પટેલ',
            role: 'અમદાવાદ • ફૂલ-ટાઇમ ઓપ્શન્સ ટ્રેડર',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
            rating: 5,
            content: 'હું પહેલાં ટેલિગ્રામ ટીપ્સના ચક્કરમાં દર મહિને મોટો લોસ કરતો હતો. TradeX Academy ના પ્રાઇસ એક્શન અને રિસ્ક મેનેજમેન્ટ કોર્સે મારી આંખો ખોલી નાખી. હવે મારી પાસે ચોક્કસ સેટઅપ અને સ્ટોપ લોસ છે.'
        },
        {
            id: 't-2',
            name: 'હર્ષિલ મહેતા',
            role: 'સુરત • ટેક્સટાઇલ બિઝનેસમેન & સ્વિંગ ટ્રેડર',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
            rating: 5,
            content: 'બિઝનેસની સાથે ટ્રેડિંગ કેવી રીતે કરવું તે મને સ્વિંગ ટ્રેડિંગ કોર્સમાં શીખવા મળ્યું. સૌથી મોટી વાત એ છે કે બધું સરળ ગુજરાતીમાં સમજાવ્યું છે. કોઈ અઘરા અંગ્રેજી શબ્દો વગર લાઈવ ચાર્ટ પર પ્રેક્ટિકલ નોલેજ મળ્યું.'
        },
        {
            id: 't-3',
            name: 'નેહા શાહ',
            role: 'વડોદરા • બેંકિંગ પ્રોફેશનલ & ઓપ્શન્સ બાયર',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
            rating: 5,
            content: 'નિફ્ટી અને બેંકનિફ્ટી એક્સપાયરી સ્ટ્રેટેજી કોર્સ અદભુત છે! ઓપ્શન ગ્રીક્સ ડેલ્ટા અને થીટા કેવી રીતે કામ કરે છે તે પહેલીવાર સાચી રીતે સમજાયું. વોટ્સએપ પર જ્યારે પણ શંકા હોય ત્યારે મેન્ટર ટીમ તરફથી તરત જવાબ મળે છે.'
        }
    ];
    const faqs = [
        {
            id: 'faq-1',
            question: 'શું સંપૂર્ણ નવો માણસ (Beginner) પણ આ કોર્સથી શેર બજાર શીખી શકે?',
            answer: 'હા, ચોક્કસ! અમારો "બેઝિક શેર બજાર ફાઉન્ડેશન કોર્સ" બિલકુલ શૂન્યથી શરૂ થાય છે. ડીમેટ એકાઉન્ટ શું છે, શેર કેવી રીતે ખરીદવા-વેચવા, અને રિસ્ક કેવી રીતે કંટ્રોલ કરવું તે બધું સરળ ગુજરાતીમાં શીખવવામાં આવે છે.'
        },
        {
            id: 'faq-2',
            question: 'શું શીખવા માટે મોંઘા લેપટોપની જરૂર છે કે મોબાઈલથી શીખી શકાય?',
            answer: 'તમે કોઈપણ સાધન — તમારા એન્ડ્રોઇડ કે આઈફોન મોબાઈલ, ટેબ્લેટ અથવા લેપટોપ પરથી આરામથી વિડિયો જોઈ શકો છો. અમારું પ્લેટફોર્મ ૧૦૦% મોબાઈલ ફ્રેન્ડલી છે.'
        },
        {
            id: 'faq-3',
            question: 'કોર્સ ખરીદ્યા પછી વિડિયો કેટલા સમય સુધી જોઈ શકાશે?',
            answer: 'તમામ કોર્સમાં લાઈફટાઈમ (આજીવન) અનલિમિટેડ એક્સેસ મળે છે! તમે ગમે ત્યારે, ગમે તેટલી વાર વિડિયો રિવિઝન કરી શકો છો. ભવિષ્યમાં ઉમેરાતા નવા વિડિયો પણ મફત મળશે.'
        },
        {
            id: 'faq-4',
            question: 'જો મને કોઈ સવાલ કે શંકા હોય તો માર્ગદર્શન કેવી રીતે મળશે?',
            answer: 'દરેક વિદ્યાર્થીને અમારો ડેડિકેટેડ વોટ્સએપ મેન્ટર સપોર્ટ મળે છે. તમે તમારા ચાર્ટના સ્ક્રીનશોટ મોકલીને મેન્ટર પાસેથી સીધો પ્રતિસાદ મેળવી શકો છો.'
        },
        {
            id: 'faq-5',
            question: 'શું તમે લાઈવ ટ્રેડિંગ ટીપ્સ કે કોલ્સ આપો છો?',
            answer: 'ના. અમે કોઈ ટીપ્સ આપતા નથી. અમે તમને ૧૦૦% સાચું શિક્ષણ આપીએ છીએ જેથી તમે જાતે ચાર્ટ રીડ કરીને આત્મનિર્ભર બનીને ટ્રેડિંગ કરી શકો.'
        }
    ];
    const siteSettings = {
        platformName: 'TradeX Academy',
        tagline: 'ગુજરાતનું પ્રીમિયર શેર બજાર અને ટ્રેડિંગ શિક્ષણ પ્લેટફોર્મ',
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
        message: '🎉 ગુજરાતીઓ માટે સ્પેશિયલ ઓફર: તમામ કોર્સ પર ફ્લેટ ૫૦% ડિસ્કાઉન્ટ!',
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
