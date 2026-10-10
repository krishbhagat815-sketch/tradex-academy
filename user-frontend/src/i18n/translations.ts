export type Language = 'gu' | 'en';

export interface TranslationDictionary {
  // Navigation & Header
  nav: {
    home: string;
    courses: string;
    freeCourses: string;
    whyUs: string;
    testimonials: string;
    mentors: string;
    verifyCert: string;
    searchPlaceholder: string;
    searchButton: string;
    login: string;
    register: string;
    dashboard: string;
    logout: string;
    wishlist: string;
    cart: string;
    whatsappHelp: string;
    tagline: string;
    langGu: string;
    langEn: string;
  };

  // Promo Banner
  promo: {
    badge: string;
    offerText: string;
    couponText: string;
    cta: string;
  };

  // Hero Section
  hero: {
    badge: string;
    headlinePart1: string;
    headlineHighlight: string;
    headlinePart2: string;
    description: string;
    startLearningFree: string;
    exploreCourses: string;
    chatWhatsApp: string;
    statStudents: string;
    statStudentsLabel: string;
    statRating: string;
    statRatingLabel: string;
    statPractical: string;
    statPracticalLabel: string;
    statSupport: string;
    statSupportLabel: string;
  };

  // Trading Highlights / Pillars
  highlights: {
    sectionBadge: string;
    sectionTitle: string;
    sectionSubtitle: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
    pillar4Title: string;
    pillar4Desc: string;
    pillar5Title: string;
    pillar5Desc: string;
    pillar6Title: string;
    pillar6Desc: string;
  };

  // Courses Section
  courses: {
    badge: string;
    title: string;
    subtitle: string;
    viewAll: string;
    tabAll: string;
    tabFree: string;
    tabPaid: string;
    tabOptions: string;
    tabPriceAction: string;
    tabCrypto: string;
    tabPsychology: string;
    freeBadge: string;
    saleBadge: string;
    lessons: string;
    students: string;
    duration: string;
    viewDetails: string;
    enrollNow: string;
    enrollFree: string;
    alreadyEnrolled: string;
    freePrice: string;
    filterSearch: string;
    filterCategory: string;
    filterLevel: string;
    filterPrice: string;
    filterAll: string;
    filterSort: string;
    sortPopular: string;
    sortHighestRated: string;
    sortNewest: string;
    sortPriceLow: string;
    sortPriceHigh: string;
    noCoursesFound: string;
    resetFilters: string;
    levelBeginner: string;
    levelIntermediate: string;
    levelAdvanced: string;
    levelAll: string;
  };

  // Why Choose Us
  whyUs: {
    badge: string;
    title: string;
    subtitle: string;
    point1Title: string;
    point1Desc: string;
    point2Title: string;
    point2Desc: string;
    point3Title: string;
    point3Desc: string;
    point4Title: string;
    point4Desc: string;
    point5Title: string;
    point5Desc: string;
    point6Title: string;
    point6Desc: string;
  };

  // Mentors / Instructors
  mentors: {
    badge: string;
    title: string;
    subtitle: string;
    experience: string;
    studentsTrained: string;
    coursesCount: string;
    rating: string;
  };

  // Testimonials
  testimonials: {
    badge: string;
    title: string;
    subtitle: string;
  };

  // FAQs
  faqs: {
    badge: string;
    title: string;
    subtitle: string;
    haveQuestions: string;
    whatsappUs: string;
  };

  // WhatsApp Widget
  whatsapp: {
    tooltip: string;
    chatTitle: string;
    chatSubtitle: string;
    onlineNow: string;
    startChat: string;
    defaultMessage: string;
  };

  // Course Details
  courseDetails: {
    overview: string;
    curriculum: string;
    whatYouLearn: string;
    requirements: string;
    targetAudience: string;
    instructor: string;
    reviews: string;
    writeReview: string;
    submitReview: string;
    previewLesson: string;
    lockedLesson: string;
    duration: string;
    lessonsCount: string;
    certificateIncluded: string;
    lifetimeAccess: string;
    mentorSupport: string;
    enrollFreeBtn: string;
    buyCourseBtn: string;
    enrolledAlready: string;
    goToPlayer: string;
    shareCourse: string;
    addToWishlist: string;
    removeFromWishlist: string;
    daysGuarantee: string;
  };

  // Checkout & Payment
  checkout: {
    title: string;
    subtitle: string;
    orderSummary: string;
    originalPrice: string;
    discount: string;
    totalAmount: string;
    couponPlaceholder: string;
    applyCoupon: string;
    couponApplied: string;
    removeCoupon: string;
    billingDetails: string;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    paymentMethod: string;
    upiOption: string;
    cardOption: string;
    netbankingOption: string;
    upiPlaceholder: string;
    payNow: string;
    secureNotice: string;
    orderSuccessTitle: string;
    orderSuccessDesc: string;
    startCourseNow: string;
    viewReceipt: string;
  };

  // Student Dashboard
  dashboard: {
    welcome: string;
    tabEnrolled: string;
    tabWishlist: string;
    tabOrders: string;
    tabCertificates: string;
    tabSettings: string;
    statsEnrolled: string;
    statsCompleted: string;
    statsCertificates: string;
    continueLearning: string;
    progress: string;
    lastAccessed: string;
    noCoursesYet: string;
    exploreCoursesBtn: string;
    downloadCert: string;
    orderNumber: string;
    date: string;
    amount: string;
    status: string;
  };

  // Auth (Login / Register)
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    emailLabel: string;
    passwordLabel: string;
    nameLabel: string;
    phoneLabel: string;
    forgotPassword: string;
    loginBtn: string;
    registerBtn: string;
    noAccount: string;
    haveAccount: string;
    fillDemoStudent: string;
    restrictedNotice: string;
  };

  // Footer
  footer: {
    about: string;
    aboutDesc: string;
    quickLinks: string;
    coursesHeading: string;
    contactHeading: string;
    sebiDisclaimerTitle: string;
    sebiDisclaimer: string;
    copyright: string;
    privacyPolicy: string;
    termsConditions: string;
    refundPolicy: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  gu: {
    nav: {
      home: 'હોમ',
      courses: 'તમામ કોર્સ',
      freeCourses: 'મફત શિક્ષણ',
      whyUs: 'શા માટે અમે',
      testimonials: 'વિદ્યાર્થીઓનો પ્રતિસાદ',
      mentors: 'મેન્ટર્સ',
      verifyCert: 'સર્ટિફિકેટ વેરિફિકેશન',
      searchPlaceholder: 'શોધો: શેર બજાર, ઓપ્શન્સ, પ્રાઇસ એક્શન, ક્રિપ્ટો...',
      searchButton: 'શોધો',
      login: 'લોગિન',
      register: 'શરૂ કરો (ફ્રી)',
      dashboard: 'મારું ડેશબોર્ડ',
      logout: 'લૉગ આઉટ',
      wishlist: 'વિશલિસ્ટ',
      cart: 'કાર્ટ',
      whatsappHelp: 'વોટ્સએપ હેલ્પ',
      tagline: 'ગુજરાતનું પ્રીમિયર ટ્રેડિંગ એકેડેમી',
      langGu: 'ગુજરાતી',
      langEn: 'English'
    },
    promo: {
      badge: '🎉 સ્પેશિયલ ઓફર',
      offerText: 'ગુજરાતના ટ્રેડર્સ માટે તમામ કોર્સ પર ફ્લેટ ૫૦% ડિસ્કાઉન્ટ!',
      couponText: 'કુપન કોડ વાપરો:',
      cta: 'હમણાં લાભ લો'
    },
    hero: {
      badge: '🔥 ગુજરાતનું નંબર 1 ટ્રેડિંગ એજ્યુકેશન પ્લેટફોર્મ',
      headlinePart1: 'ગુજરાતીમાં શીખો',
      headlineHighlight: 'શેર બજાર અને ઓપ્શન્સ ટ્રેડિંગ',
      headlinePart2: 'ની સાચી રીત',
      description: 'પ્રાઇસ એક્શન, નિફ્ટી-બેંકનિફ્ટી ઓપ્શન્સ, કેન્ડલસ્ટિક પેટર્ન અને ક્રિપ્ટો ટ્રેડિંગ હવે તમારી પોતાની માતૃભાષામાં. કોઈ ખોટા પ્રોમિસ નહીં — ફક્ત પ્રૂવન સ્ટ્રેટેજી, લાઈવ માર્કેટ ચાર્ટ અને કડક રિસ્ક મેનેજમેન્ટ.',
      startLearningFree: 'મફતમાં શીખવાનું શરૂ કરો',
      exploreCourses: 'બધા કોર્સ જુઓ',
      chatWhatsApp: 'વોટ્સએપ પર પૂછો',
      statStudents: '૫૦,૦૦૦+',
      statStudentsLabel: 'ગુજરાતી વિદ્યાર્થીઓ',
      statRating: '૪.૯/૫',
      statRatingLabel: 'વિદ્યાર્થી રેટિંગ',
      statPractical: '૧૦૦%',
      statPracticalLabel: 'પ્રાયોગિક જ્ઞાન',
      statSupport: '૨૪/૭',
      statSupportLabel: 'વોટ્સએપ મેન્ટર સપોર્ટ'
    },
    highlights: {
      sectionBadge: 'કોર્સના મુખ્ય વિષયો',
      sectionTitle: 'શેર બજારના ૬ પાયાના સ્તંભો',
      sectionSubtitle: 'ઝીરોથી લઈને પ્રોફેશનલ ટ્રેડર બનવા સુધીનું સંપૂર્ણ સ્ટેપ-બાય-સ્ટેપ માર્ગદર્શન',
      pillar1Title: 'શેર બજાર બેઝિક્સ',
      pillar1Desc: 'ડીમેટ એકાઉન્ટ, NSE/BSE, ઓર્ડર ટાઇપ્સ, નિફ્ટી ૫૦ અને રોકાણની સાચી શરૂઆત.',
      pillar2Title: 'પ્યોર પ્રાઇસ એક્શન',
      pillar2Desc: 'કોઈ લેગિંગ ઇન્ડિકેટર વગર સપોર્ટ, રેઝિસ્ટન્સ, ટ્રેન્ડલાઈન અને માર્કેટ સ્ટ્રક્ચર.',
      pillar3Title: 'ઓપ્શન્સ ટ્રેડિંગ માસ્ટરી',
      pillar3Desc: 'નિફ્ટી અને બેંકનિફ્ટીમાં કોલ-પુટ (CE/PE), ગ્રીક્સ (Delta/Theta) અને એક્સપાયરી સેટઅપ.',
      pillar4Title: 'કેન્ડલસ્ટિક પેટર્ન સિક્રેટ્સ',
      pillar4Desc: 'હેમર, ડોજી, એન્ગલ્ફિંગ, મોર્નિંગ સ્ટાર અને ફોલ્સ બ્રેકઆઉટથી બચવાના નિયમો.',
      pillar5Title: 'ક્રિપ્ટો અને ફ્યુચર્સ',
      pillar5Desc: 'બિટકોઇન, અલ્ટકોઇન્સ, સ્પોટ અને ફ્યુચર્સ ટ્રેડિંગમાં સેફ પોઝિશનિંગ.',
      pillar6Title: 'રિસ્ક મેનેજમેન્ટ અને સાયકોલોજી',
      pillar6Desc: 'કેપિટલ પ્રોટેક્શન, ૧:૨ રિસ્ક-રિવોર્ડ, પોઝિશન સાઇઝિંગ અને લોસ કંટ્રોલ માઇન્ડસેટ.'
    },
    courses: {
      badge: 'શ્રેષ્ઠ ટ્રેડિંગ કોર્સ',
      title: 'તમારી ટ્રેડિંગ જર્ની પસંદ કરો',
      subtitle: 'સરળ ગુજરાતી ભાષામાં વ્યવહારુ અને પ્રેક્ટિકલ વિડિયો ક્લાસિસ',
      viewAll: 'તમામ કોર્સ જુઓ',
      tabAll: 'બધા કોર્સ',
      tabFree: 'મફત કોર્સ (FREE)',
      tabPaid: 'પ્રીમિયમ કોર્સ',
      tabOptions: 'ઓપ્શન્સ ટ્રેડિંગ',
      tabPriceAction: 'પ્રાઇસ એક્શન',
      tabCrypto: 'ક્રિપ્ટો',
      tabPsychology: 'સાયકોલોજી',
      freeBadge: 'મફત',
      saleBadge: 'ઓફર',
      lessons: 'લેસન',
      students: 'વિદ્યાર્થીઓ',
      duration: 'કલાક',
      viewDetails: 'વિગત જુઓ',
      enrollNow: 'હમણાં ખરીદો',
      enrollFree: 'મફતમાં એનરોલ કરો',
      alreadyEnrolled: 'શીખવાનું ચાલુ રાખો',
      freePrice: 'મફત (₹૦)',
      filterSearch: 'કોર્સ શોધો...',
      filterCategory: 'કેટેગરી',
      filterLevel: 'લેવલ',
      filterPrice: 'કિંમત',
      filterAll: 'બધા',
      filterSort: 'ક્રમ ગોઠવો',
      sortPopular: 'સૌથી લોકપ્રિય',
      sortHighestRated: 'સૌથી વધુ રેટિંગ',
      sortNewest: 'નવા કોર્સ',
      sortPriceLow: 'કિંમત: ઓછીથી વધુ',
      sortPriceHigh: 'કિંમત: વધુથી ઓછી',
      noCoursesFound: 'કોઈ કોર્સ મળ્યા નથી. કૃપા કરીને અન્ય ફિલ્ટર પસંદ કરો.',
      resetFilters: 'ફિલ્ટર્સ રીસેટ કરો',
      levelBeginner: 'બિગિનર (શરૂઆત કરનાર)',
      levelIntermediate: 'ઇન્ટરમીડિયેટ',
      levelAdvanced: 'એડવાન્સ',
      levelAll: 'તમામ લેવલ'
    },
    whyUs: {
      badge: 'શા માટે TRADEX ACADEMY?',
      title: 'હજારો ગુજરાતીઓ શા માટે અમારા પર ભરોસો મૂકે છે?',
      subtitle: 'અમે માત્ર થિયરી નથી ભણાવતા — લાઈવ માર્કેટમાં ટકી રહેવાની સાચી ટેકનિક શીખવીએ છીએ',
      point1Title: '૧૦૦% સરળ ગુજરાતી ભાષા',
      point1Desc: 'અંગ્રેજીના અઘરા શબ્દો વગર આપણી માતૃભાષામાં સરળ ઉદાહરણો સાથે શીખો.',
      point2Title: 'કોઈ ટીપ્સ નહીં — સાચી આવડત',
      point2Desc: 'અમે ટેલિગ્રામ ટીપ્સ નથી આપતા, તમને જાતે ચાર્ટ રીડ કરીને નિર્ણય લેતા શીખવીએ છીએ.',
      point3Title: 'કેપિટલ પ્રોટેક્શન પ્રથમ',
      point3Desc: 'પ્રોફિટ કરતાં પહેલાં કેપિટલ કેવી રીતે બચાવવી તે અમારો પ્રથમ નિયમ છે.',
      point4Title: 'ડાઉનલોડેબલ સ્ટડી મટીરિયલ',
      point4Desc: 'દરેક લેસન સાથે ગુજરાતી પીડીએફ ચીટશીટ્સ અને ટ્રેડિંગ ચેકલિસ્ટ મફત.',
      point5Title: 'લાઈફટાઈમ કોર્સ એક્સેસ',
      point5Desc: 'એકવાર જોડાઓ અને ગમે ત્યારે, ગમે તેટલી વાર વિડિયો રિવિઝન કરો.',
      point6Title: 'ડેડિકેટેડ વોટ્સએપ સપોર્ટ',
      point6Desc: 'કોઈ પણ શંકા કે મુશ્કેલી હોય ત્યારે સીધો મેન્ટર સંપર્ક ઉપલબ્ધ.'
    },
    mentors: {
      badge: 'અમારા નિષ્ણાતો',
      title: 'અનુભવી ટ્રેડર્સ પાસેથી સીધું શીખો',
      subtitle: 'વર્ષોનો માર્કેટ અનુભવ અને હજારો વિદ્યાર્થીઓને સફળ બનાવવાનો ટ્રેક રેકોર્ડ',
      experience: 'વર્ષનો ટ્રેડિંગ અનુભવ',
      studentsTrained: 'ટ્રેઇન્ડ વિદ્યાર્થીઓ',
      coursesCount: 'કોર્સ',
      rating: 'સરેરાશ રેટિંગ'
    },
    testimonials: {
      badge: 'વિદ્યાર્થીઓના અનુભવો',
      title: 'ગુજરાતના સફળ ટ્રેડર્સ શું કહે છે?',
      subtitle: 'અમદાવાદ, સુરત, રાજકોટ અને વડોદરાના વિદ્યાર્થીઓના સાચા અભિપ્રાયો'
    },
    faqs: {
      badge: 'વારંવાર પૂછાતા પ્રશ્નો',
      title: 'તમારા પ્રશ્નો, અમારા જવાબો',
      subtitle: 'કોર્સમાં જોડાતા પહેલાં જે પ્રશ્નો મનમાં હોય તેના સ્પષ્ટ જવાબો',
      haveQuestions: 'બીજો કોઈ સવાલ છે?',
      whatsappUs: 'વોટ્સએપ પર સીધો સંપર્ક કરો'
    },
    whatsapp: {
      tooltip: 'વોટ્સએપ પર વાત કરો',
      chatTitle: 'TradeX Academy સપોર્ટ',
      chatSubtitle: 'ઓનલાઈન - સામાન્ય રીતે ૫ મિનિટમાં જવાબ',
      onlineNow: 'હમણાં ઓનલાઈન',
      startChat: 'વોટ્સએપ ખોલો',
      defaultMessage: 'નમસ્તે TradeX Academy, મારે શેર બજારના કોર્સ વિશે માહિતી મેળવવી છે.'
    },
    courseDetails: {
      overview: 'કોર્સ પરિચય',
      curriculum: 'અભ્યાસક્રમ (Curriculum)',
      whatYouLearn: 'તમે શું શીખશો',
      requirements: 'જરૂરિયાતો',
      targetAudience: 'કોના માટે છે આ કોર્સ?',
      instructor: 'મેન્ટર પરિચય',
      reviews: 'વિદ્યાર્થીઓના રિવ્યુ',
      writeReview: 'તમારો રિવ્યુ આપો',
      submitReview: 'રિવ્યુ સબમિટ કરો',
      previewLesson: 'ફ્રી પ્રિવ્યુ',
      lockedLesson: 'એનરોલ કર્યા પછી ખુલશે',
      duration: 'કુલ સમયગાળો',
      lessonsCount: 'કુલ લેસન',
      certificateIncluded: 'ડિજિટલ સર્ટિફિકેટ શામેલ',
      lifetimeAccess: 'લાઈફટાઈમ અનલિમિટેડ એક્સેસ',
      mentorSupport: 'વોટ્સએપ મેન્ટર સપોર્ટ',
      enrollFreeBtn: 'મફતમાં એનરોલ કરો (Enroll Free)',
      buyCourseBtn: 'હમણાં ખરીદો (Buy Now)',
      enrolledAlready: 'તમે આ કોર્સમાં જોડાયેલા છો',
      goToPlayer: 'ક્લાસરૂમ ખોલો',
      shareCourse: 'શેર કરો',
      addToWishlist: 'વિશલિસ્ટમાં ઉમેરો',
      removeFromWishlist: 'વિશલિસ્ટમાંથી દૂર કરો',
      daysGuarantee: '૧૦૦% સંતોષની ગેરંટી'
    },
    checkout: {
      title: 'સુરક્ષિત ચેકઆઉટ',
      subtitle: 'તમારી ટ્રેડિંગ સફર શરૂ કરવા માટે વિગતો ભરો',
      orderSummary: 'ઓર્ડર સમરી',
      originalPrice: 'મૂળ કિંમત',
      discount: 'ડિસ્કાઉન્ટ',
      totalAmount: 'ચૂકવવાપાત્ર રકમ',
      couponPlaceholder: 'કુપન કોડ દાખલ કરો (દા.ત. LAUNCH50)',
      applyCoupon: 'લાગુ કરો',
      couponApplied: 'કુપન સફળતાપૂર્વક લાગુ થઈ!',
      removeCoupon: 'દૂર કરો',
      billingDetails: 'તમારી વિગતો',
      fullName: 'પૂરું નામ',
      email: 'ઇમેઇલ એડ્રેસ',
      phone: 'મોબાઈલ નંબર',
      city: 'શહેર (દા.ત. અમદાવાદ, સુરત)',
      paymentMethod: 'ચુકવણી પદ્ધતિ પસંદ કરો',
      upiOption: 'UPI / GPay / PhonePe / Paytm',
      cardOption: 'ડેબિટ / ક્રેડિટ કાર્ડ',
      netbankingOption: 'નેટ બેંકિંગ',
      upiPlaceholder: 'તમારો UPI ID દાખલ કરો (દા.ત. name@okhdfcbank)',
      payNow: 'ચુકવણી કરો અને તરત એક્સેસ મેળવો',
      secureNotice: '🔒 ૨૫૬-બીટ SSL સુરક્ષિત ચુકવણી. પેમેન્ટ પછી તરત તમામ વિડિયો અનલોક થશે.',
      orderSuccessTitle: 'અભિનંદન! તમારો ઓર્ડર સફળ રહ્યો 🎉',
      orderSuccessDesc: 'તમારું એડમિશન કન્ફર્મ થઈ ગયું છે. હવે તમે કોર્સ વિડિયો જોઈ શકો છો.',
      startCourseNow: 'તરત શીખવાનું શરૂ કરો',
      viewReceipt: 'રસીદ જુઓ'
    },
    dashboard: {
      welcome: 'સ્વાગત છે,',
      tabEnrolled: 'મારા કોર્સ',
      tabWishlist: 'વિશલિસ્ટ',
      tabOrders: 'ઓર્ડર હિસ્ટ્રી',
      tabCertificates: 'સર્ટિફિકેટ્સ',
      tabSettings: 'પ્રોફાઇલ સેટિંગ્સ',
      statsEnrolled: 'જોડાયેલા કોર્સ',
      statsCompleted: 'પૂર્ણ કરેલા કોર્સ',
      statsCertificates: 'સર્ટિફિકેટ્સ',
      continueLearning: 'શીખવાનું ચાલુ રાખો',
      progress: 'પ્રગતિ',
      lastAccessed: 'છેલ્લે જોયેલું',
      noCoursesYet: 'તમે હજુ સુધી કોઈ કોર્સમાં જોડાયા નથી.',
      exploreCoursesBtn: 'કોર્સ શોધો અને શરૂ કરો',
      downloadCert: 'સર્ટિફિકેટ ડાઉનલોડ કરો',
      orderNumber: 'ઓર્ડર નંબર',
      date: 'તારીખ',
      amount: 'રકમ',
      status: 'સ્થિતિ'
    },
    auth: {
      loginTitle: 'વિદ્યાર્થી લોગિન',
      loginSubtitle: 'તમારા TradeX એકાઉન્ટમાં પ્રવેશ કરો',
      registerTitle: 'નવું એકાઉન્ટ બનાવો',
      registerSubtitle: 'આજે જ મફતમાં રજીસ્ટર કરો અને શીખવાનું શરૂ કરો',
      emailLabel: 'ઇમેઇલ એડ્રેસ',
      passwordLabel: 'પાસવર્ડ',
      nameLabel: 'પૂરું નામ',
      phoneLabel: 'મોબાઈલ નંબર (વોટ્સએપ)',
      forgotPassword: 'પાસવર્ડ ભૂલી ગયા?',
      loginBtn: 'સાઇન ઇન કરો',
      registerBtn: 'એકાઉન્ટ બનાવો',
      noAccount: 'એકાઉન્ટ નથી? અહીં રજીસ્ટર કરો',
      haveAccount: 'પહેલેથી એકાઉન્ટ છે? લોગિન કરો',
      fillDemoStudent: 'ડેમો સ્ટુડન્ટથી લોગિન કરો',
      restrictedNotice: 'તમારો ડેટા સુરક્ષિત અને એન્ક્રિપ્ટેડ છે.'
    },
    footer: {
      about: 'TradeX Academy વિશે',
      aboutDesc: 'TradeX Academy એ ગુજરાતનું અગ્રણી ટ્રેડિંગ એજ્યુકેશન પ્લેટફોર્મ છે જે શેર બજાર, ઓપ્શન્સ, પ્રાઇસ એક્શન અને ક્રિપ્ટોકરન્સીમાં વ્યવહારુ અને પ્રામાણિક શિક્ષણ પૂરું પાડે છે.',
      quickLinks: 'ઝડપી લિંક્સ',
      coursesHeading: 'મુખ્ય કોર્સ',
      contactHeading: 'સંપર્ક અને સપોર્ટ',
      sebiDisclaimerTitle: '⚠️ શૈક્ષણિક સાવચેતી (SEBI Disclaimer):',
      sebiDisclaimer: 'TradeX Academy ફક્ત શૈક્ષણિક હેતુ માટે શિક્ષણ પૂરું પાડે છે. અમે કોઈ ટીપ્સ, કોલ્સ કે સલાહ આપતા નથી. શેર બજારમાં રોકાણ અને ટ્રેડિંગ જોખમ આધીન છે. ટ્રેડિંગ કરતાં પહેલાં તમારા સેબી-રજિસ્ટર્ડ નાણાકીય સલાહકારની સલાહ લો.',
      copyright: '© ૨૦૨૬ TradeX Academy. સર્વાધિકાર સુરક્ષિત.',
      privacyPolicy: 'પ્રાઇવસી પોલિસી',
      termsConditions: 'નિયમો અને શરતો',
      refundPolicy: 'રિફંડ પોલિસી'
    }
  },
  en: {
    nav: {
      home: 'Home',
      courses: 'All Courses',
      freeCourses: 'Free Learning',
      whyUs: 'Why Us',
      testimonials: 'Testimonials',
      mentors: 'Mentors',
      verifyCert: 'Verify Certificate',
      searchPlaceholder: 'Search: Stock Market, Options, Price Action, Crypto...',
      searchButton: 'Search',
      login: 'Login',
      register: 'Get Started (Free)',
      dashboard: 'My Dashboard',
      logout: 'Log Out',
      wishlist: 'Wishlist',
      cart: 'Cart',
      whatsappHelp: 'WhatsApp Help',
      tagline: "Gujarat's Premier Trading Academy",
      langGu: 'ગુજરાતી',
      langEn: 'English'
    },
    promo: {
      badge: '🎉 SPECIAL LAUNCH OFFER',
      offerText: 'Flat 50% OFF on all courses for Gujarati traders!',
      couponText: 'Use Coupon Code:',
      cta: 'Claim Offer'
    },
    hero: {
      badge: "🔥 Gujarat's #1 Trading Education Platform",
      headlinePart1: 'Master',
      headlineHighlight: 'Stock Market & Options Trading',
      headlinePart2: 'the Right Way',
      description: 'Learn price action, Nifty/BankNifty options, candlestick patterns, and crypto trading in your own mother tongue. No false promises — only proven strategies, live market charts, and disciplined risk management.',
      startLearningFree: 'Start Learning Free',
      exploreCourses: 'Explore All Courses',
      chatWhatsApp: 'Chat on WhatsApp',
      statStudents: '50,000+',
      statStudentsLabel: 'Active Gujarati Learners',
      statRating: '4.9/5',
      statRatingLabel: 'Student Community Rating',
      statPractical: '100%',
      statPracticalLabel: 'Practical Knowledge',
      statSupport: '24/7',
      statSupportLabel: 'WhatsApp Mentor Support'
    },
    highlights: {
      sectionBadge: 'Core Curriculum',
      sectionTitle: '6 Pillars of Professional Trading',
      sectionSubtitle: 'Step-by-step structured guidance from complete beginner to consistent profitability',
      pillar1Title: 'Stock Market Basics',
      pillar1Desc: 'Demat account setup, NSE/BSE, order types, Nifty 50, and safe initial positioning.',
      pillar2Title: 'Pure Price Action',
      pillar2Desc: 'No lagging indicators. Master market structure, support/resistance, and trendlines.',
      pillar3Title: 'Options Trading Mastery',
      pillar3Desc: 'Call & Put (CE/PE), option Greeks (Delta/Theta), strike selection, and expiry day setups.',
      pillar4Title: 'Candlestick Patterns',
      pillar4Desc: 'Hammer, Doji, Engulfing, Morning Star, and rules to avoid false breakout traps.',
      pillar5Title: 'Crypto & Futures',
      pillar5Desc: 'Bitcoin, Altcoins, spot vs futures trading, and safe risk-managed positioning.',
      pillar6Title: 'Risk Management & Psychology',
      pillar6Desc: 'Capital protection, 1:2 risk-to-reward ratio, position sizing, and loss control mindset.'
    },
    courses: {
      badge: 'TOP RATED COURSES',
      title: 'Choose Your Trading Path',
      subtitle: 'Hands-on practical video classes taught in clear Gujarati and English',
      viewAll: 'View All Courses',
      tabAll: 'All Courses',
      tabFree: 'Free Courses (₹0)',
      tabPaid: 'Premium Masterclasses',
      tabOptions: 'Options Trading',
      tabPriceAction: 'Price Action',
      tabCrypto: 'Crypto',
      tabPsychology: 'Psychology',
      freeBadge: 'FREE',
      saleBadge: 'SALE',
      lessons: 'lessons',
      students: 'students',
      duration: 'hours',
      viewDetails: 'View Details',
      enrollNow: 'Enroll Now',
      enrollFree: 'Enroll for Free',
      alreadyEnrolled: 'Continue Learning',
      freePrice: 'Free (₹0)',
      filterSearch: 'Search courses...',
      filterCategory: 'Category',
      filterLevel: 'Level',
      filterPrice: 'Price',
      filterAll: 'All',
      filterSort: 'Sort By',
      sortPopular: 'Most Popular',
      sortHighestRated: 'Highest Rated',
      sortNewest: 'Newest',
      sortPriceLow: 'Price: Low to High',
      sortPriceHigh: 'Price: High to Low',
      noCoursesFound: 'No courses found matching your criteria. Try adjusting your filters.',
      resetFilters: 'Reset Filters',
      levelBeginner: 'Beginner',
      levelIntermediate: 'Intermediate',
      levelAdvanced: 'Advanced',
      levelAll: 'All Levels'
    },
    whyUs: {
      badge: 'WHY TRADEX ACADEMY?',
      title: 'Why Thousands of Traders Trust Us',
      subtitle: 'We don’t sell tips or quick riches — we build disciplined, skilled traders for life',
      point1Title: 'Simple Mother-Tongue Learning',
      point1Desc: 'Learn without confusing English financial jargon, with relatable everyday examples.',
      point2Title: 'No Tips — Pure Skill',
      point2Desc: 'We reject gambling telegram channels. We train you to read live charts independently.',
      point3Title: 'Capital Protection First',
      point3Desc: 'Rule #1 of trading is keeping your capital safe before chasing profits.',
      point4Title: 'Downloadable Study Material',
      point4Desc: 'Free downloadable Gujarati and English cheat sheets, checklists, and rulebooks.',
      point5Title: 'Lifetime Course Access',
      point5Desc: 'Enroll once and re-watch lesson videos anytime at your own pace from mobile or PC.',
      point6Title: 'Dedicated WhatsApp Support',
      point6Desc: 'Direct mentor access whenever you encounter a question or market doubt.'
    },
    mentors: {
      badge: 'OUR MENTORS',
      title: 'Learn Directly from Experienced Traders',
      subtitle: 'Decades of market battle testing and a proven record of mentoring thousands of traders',
      experience: 'Years Trading Experience',
      studentsTrained: 'Traders Mentored',
      coursesCount: 'Courses',
      rating: 'Average Rating'
    },
    testimonials: {
      badge: 'STUDENT REVIEWS',
      title: 'What Gujarati Traders Say About Us',
      subtitle: 'Genuine reviews from traders in Ahmedabad, Surat, Rajkot, and Vadodara'
    },
    faqs: {
      badge: 'FREQUENTLY ASKED QUESTIONS',
      title: 'Common Questions Answered',
      subtitle: 'Everything you need to know before joining our trading academy',
      haveQuestions: 'Have more questions?',
      whatsappUs: 'Chat with our mentor on WhatsApp'
    },
    whatsapp: {
      tooltip: 'Chat on WhatsApp',
      chatTitle: 'TradeX Academy Support',
      chatSubtitle: 'Online - Usually replies within 5 mins',
      onlineNow: 'Online Now',
      startChat: 'Open WhatsApp Chat',
      defaultMessage: 'Hello TradeX Academy, I want to know more about your stock market courses.'
    },
    courseDetails: {
      overview: 'Course Overview',
      curriculum: 'Curriculum',
      whatYouLearn: 'What You Will Learn',
      requirements: 'Requirements',
      targetAudience: 'Who Is This Course For?',
      instructor: 'About the Mentor',
      reviews: 'Student Reviews',
      writeReview: 'Write a Review',
      submitReview: 'Submit Review',
      previewLesson: 'Free Preview',
      lockedLesson: 'Unlocks after enrollment',
      duration: 'Total Duration',
      lessonsCount: 'Total Lessons',
      certificateIncluded: 'Verifiable Digital Certificate',
      lifetimeAccess: 'Lifetime Unlimited Access',
      mentorSupport: 'WhatsApp Mentor Support',
      enrollFreeBtn: 'Enroll for Free',
      buyCourseBtn: 'Enroll Now (Buy)',
      enrolledAlready: 'You are enrolled in this course',
      goToPlayer: 'Go to Classroom',
      shareCourse: 'Share',
      addToWishlist: 'Add to Wishlist',
      removeFromWishlist: 'Remove from Wishlist',
      daysGuarantee: '100% Satisfaction Guarantee'
    },
    checkout: {
      title: 'Secure Checkout',
      subtitle: 'Complete your registration to unlock your trading course instantly',
      orderSummary: 'Order Summary',
      originalPrice: 'Original Price',
      discount: 'Discount',
      totalAmount: 'Total Payable',
      couponPlaceholder: 'Enter coupon code (e.g. LAUNCH50)',
      applyCoupon: 'Apply',
      couponApplied: 'Coupon applied successfully!',
      removeCoupon: 'Remove',
      billingDetails: 'Billing Information',
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Mobile Number (WhatsApp)',
      city: 'City (e.g. Ahmedabad, Surat)',
      paymentMethod: 'Select Payment Method',
      upiOption: 'UPI / GPay / PhonePe / Paytm',
      cardOption: 'Debit / Credit Card',
      netbankingOption: 'Net Banking',
      upiPlaceholder: 'Enter UPI ID (e.g. name@okhdfcbank)',
      payNow: 'Complete Payment & Get Access',
      secureNotice: '🔒 256-bit SSL encrypted checkout. Lessons unlock immediately upon confirmation.',
      orderSuccessTitle: 'Congratulations! Your Order is Confirmed 🎉',
      orderSuccessDesc: 'Your enrollment has been activated. You can now access all course lessons.',
      startCourseNow: 'Start Learning Now',
      viewReceipt: 'View Receipt'
    },
    dashboard: {
      welcome: 'Welcome,',
      tabEnrolled: 'My Courses',
      tabWishlist: 'Wishlist',
      tabOrders: 'Order History',
      tabCertificates: 'Certificates',
      tabSettings: 'Profile Settings',
      statsEnrolled: 'Enrolled Courses',
      statsCompleted: 'Completed Courses',
      statsCertificates: 'Certificates Earned',
      continueLearning: 'Continue Learning',
      progress: 'Progress',
      lastAccessed: 'Last Accessed',
      noCoursesYet: 'You are not enrolled in any courses yet.',
      exploreCoursesBtn: 'Explore Courses & Start Free',
      downloadCert: 'Download Certificate',
      orderNumber: 'Order #',
      date: 'Date',
      amount: 'Amount',
      status: 'Status'
    },
    auth: {
      loginTitle: 'Student Login',
      loginSubtitle: 'Log in to continue your trading journey',
      registerTitle: 'Create an Account',
      registerSubtitle: 'Join thousands of traders learning in Gujarati',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      nameLabel: 'Full Name',
      phoneLabel: 'Mobile Number (WhatsApp)',
      forgotPassword: 'Forgot Password?',
      loginBtn: 'Sign In',
      registerBtn: 'Create Account',
      noAccount: "Don't have an account? Register here",
      haveAccount: 'Already have an account? Log in',
      fillDemoStudent: 'Fill Demo Student Credentials',
      restrictedNotice: 'Your credentials and learning progress are securely encrypted.'
    },
    footer: {
      about: 'About TradeX Academy',
      aboutDesc: 'TradeX Academy is Gujarat’s premier trading education platform dedicated to empowering traders with practical, honest, and high-discipline education in stock markets, options, price action, and crypto.',
      quickLinks: 'Quick Links',
      coursesHeading: 'Featured Courses',
      contactHeading: 'Contact & Support',
      sebiDisclaimerTitle: '⚠️ Regulatory Disclaimer (SEBI Compliance):',
      sebiDisclaimer: 'TradeX Academy is an educational platform designed strictly for skill development. We do not provide trading tips, stock recommendations, or financial advisory services. Trading and investments in securities markets are subject to market risks. Please consult a SEBI-registered financial advisor before trading.',
      copyright: '© 2026 TradeX Academy. All rights reserved.',
      privacyPolicy: 'Privacy Policy',
      termsConditions: 'Terms & Conditions',
      refundPolicy: 'Refund Policy'
    }
  }
};
