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
      home: 'Home',
      courses: 'Trading Courses',
      freeCourses: 'Free Courses',
      whyUs: 'Why Choose Us',
      testimonials: 'Student Reviews',
      mentors: 'Mentors',
      verifyCert: 'Certificate Verify',
      searchPlaceholder: 'Search કરો: Stock Market, Options, Price Action, Crypto...',
      searchButton: 'Search',
      login: 'Login કરો',
      register: 'Account બનાવો',
      dashboard: 'Student Dashboard',
      logout: 'Logout કરો',
      wishlist: 'Wishlist',
      cart: 'Cart',
      whatsappHelp: 'WhatsApp Support',
      tagline: 'ગુજરાતનું #1 Trading Education Platform',
      langGu: 'ગુજરાતી (Gujlish)',
      langEn: 'English'
    },
    promo: {
      badge: '🎉 SPECIAL OFFER',
      offerText: 'Gujarat ના Traders માટે બધા Trading Courses પર Flat 50% OFF!',
      couponText: 'Coupon Code વાપરો:',
      cta: 'Offer Claim કરો'
    },
    hero: {
      badge: '🔥 Gujarat નું #1 Trading Education Platform',
      headlinePart1: 'Stock Market Trading',
      headlineHighlight: 'શીખો સરળ રીતે!',
      headlinePart2: 'Live Market Logic સાથે',
      description: 'Trading ની શરૂઆત કરો અને market concepts ને step by step સમજો. Technical Analysis, Price Action, Nifty-BankNifty Options અને Crypto Trading હવે શીખો સરળ Gujlish માં. No fake promises — ફક્ત proven strategies, live chart analysis અને strict Risk Management.',
      startLearningFree: 'Course શરૂ કરો (Free)',
      exploreCourses: 'અમારા Trading Courses',
      chatWhatsApp: 'WhatsApp પર Chat કરો',
      statStudents: '50,000+',
      statStudentsLabel: 'Trained Gujarati Students',
      statRating: '4.9/5',
      statRatingLabel: 'Student Rating',
      statPractical: '100%',
      statPracticalLabel: 'Practical Chart Learning',
      statSupport: '24/7',
      statSupportLabel: 'WhatsApp Mentor Support'
    },
    highlights: {
      sectionBadge: 'CORE TOPICS',
      sectionTitle: 'Stock Market Trading ના 6 Core Pillars',
      sectionSubtitle: 'Zero થી લઈને Professional Trader બનવા સુધીનું Complete Step-by-Step Guidance',
      pillar1Title: 'Stock Market Basics',
      pillar1Desc: 'Demat Account, NSE/BSE, Nifty 50, Sensex અને Order Types ની complete સમજ.',
      pillar2Title: 'Pure Price Action',
      pillar2Desc: 'Lagging Indicators વગર Support, Resistance, Trendlines અને Market Structure reading.',
      pillar3Title: 'Options Trading Mastery',
      pillar3Desc: 'Nifty અને BankNifty માં Call & Put (CE/PE), Option Greeks (Delta/Theta) અને Expiry Setups.',
      pillar4Title: 'Candlestick Patterns Secrets',
      pillar4Desc: 'Hammer, Doji, Engulfing, Morning Star અને Fake Breakout ઓળખવાની strategies.',
      pillar5Title: 'Crypto & Futures Trading',
      pillar5Desc: 'Bitcoin, Altcoins, Spot અને safe Futures Trading માં position sizing.',
      pillar6Title: 'Risk Management & Psychology',
      pillar6Desc: 'Capital Protection, Stop Loss discipline, 1:2 Risk-to-Reward અને Trader Mindset.'
    },
    courses: {
      badge: 'TRADING COURSES',
      title: 'અમારા Trading Courses',
      subtitle: 'આ Courses માં તમે Technical Analysis, Price Action અને Options Trading સરળ રીતે શીખશો',
      viewAll: 'બધા Courses જુઓ',
      tabAll: 'All Courses',
      tabFree: 'Free Courses (મફત)',
      tabPaid: 'Premium Courses',
      tabOptions: 'Options Trading',
      tabPriceAction: 'Price Action',
      tabCrypto: 'Crypto Trading',
      tabPsychology: 'Trading Psychology',
      freeBadge: 'FREE (મફત)',
      saleBadge: 'OFFER',
      lessons: 'Lessons',
      students: 'Students',
      duration: 'Hours',
      viewDetails: 'Course Details જુઓ',
      enrollNow: 'હવે Enroll કરો',
      enrollFree: 'Free માં Enroll કરો',
      alreadyEnrolled: 'Course શરૂ કરો',
      freePrice: 'FREE (મફત)',
      filterSearch: 'Course search કરો...',
      filterCategory: 'Category',
      filterLevel: 'Level',
      filterPrice: 'Price',
      filterAll: 'All',
      filterSort: 'Sort By',
      sortPopular: 'Most Popular',
      sortHighestRated: 'Highest Rated',
      sortNewest: 'Newest Courses',
      sortPriceLow: 'Price: Low to High',
      sortPriceHigh: 'Price: High to Low',
      noCoursesFound: 'કોઈ Courses મળ્યા નથી. કૃપા કરીને બીજા Filters try કરો.',
      resetFilters: 'Filters Reset કરો',
      levelBeginner: 'Beginner (શરૂઆત કરનાર)',
      levelIntermediate: 'Intermediate',
      levelAdvanced: 'Advanced',
      levelAll: 'All Levels'
    },
    whyUs: {
      badge: 'WHY THE SAFE TRADING',
      title: 'Gujarati Traders શા માટે અમને પસંદ કરે છે?',
      subtitle: 'અમે tips નથી આપતા — Live Market માં Chart Read કરીને Self-Reliant Trader બનતા શીખવીએ છીએ',
      point1Title: 'સરળ Gujarati + English (Gujlish)',
      point1Desc: 'અઘરા terms વગર રોજિંદી Gujlish ભાષામાં practical market concepts શીખો.',
      point2Title: 'No Calls, No Tips — Pure Learning',
      point2Desc: 'કોઈ Telegram tips નહિ, તમે જાતે Charts Analyze કરીને confident trade લઈ શકશો.',
      point3Title: 'Capital Protection First',
      point3Desc: 'Profit કરતાં પહેલાં Capital બચાવવી અને Risk Manage કરવો એ અમારો #1 Rule છે.',
      point4Title: 'Downloadable Resources',
      point4Desc: 'દરેક Lesson સાથે PDF Cheatsheets, Trading Checklists અને Chart Pattern guides.',
      point5Title: 'Lifetime Course Access',
      point5Desc: 'એકવાર Enroll કરો અને ગમે ત્યારે, ગમે તેટલી વાર Videos revise કરો.',
      point6Title: 'Direct WhatsApp Support',
      point6Desc: 'Live doubts કે analysis queries માટે Mentors સાથે direct WhatsApp support.'
    },
    mentors: {
      badge: 'TRADING MENTORS',
      title: 'અનુભવી Trading Mentors પાસેથી શીખો',
      subtitle: 'વર્ષોનો Real Market Experience અને હજારો Gujarati Traders ને Guide કરવાનો Proven Record',
      experience: 'Years Trading Experience',
      studentsTrained: 'Students Trained',
      coursesCount: 'Courses',
      rating: 'Average Rating'
    },
    testimonials: {
      badge: 'STUDENT REVIEWS',
      title: 'સફળ Gujarati Traders શું કહે છે?',
      subtitle: 'Ahmedabad, Surat, Rajkot અને Vadodara ના Students ના Real Reviews'
    },
    faqs: {
      badge: 'FAQS',
      title: 'વારંવાર પૂછાતા Trading Questions',
      subtitle: 'Course માં Enroll કરતા પહેલાં સામાન્ય પ્રશ્નોના સરળ જવાબો',
      haveQuestions: 'બીજો કોઈ સવાલ છે?',
      whatsappUs: 'WhatsApp પર અમારો સંપર્ક કરો'
    },
    whatsapp: {
      tooltip: 'WhatsApp પર Chat કરો',
      chatTitle: 'The Safe Trading Support',
      chatSubtitle: 'Online - સામાન્ય રીતે 5 મિનિટમાં Reply',
      onlineNow: 'Online Now',
      startChat: 'WhatsApp Open કરો',
      defaultMessage: 'નમસ્તે The Safe Trading, મારે Trading Courses વિશે માહિતી જોઈએ છે.'
    },
    courseDetails: {
      overview: 'Course Overview',
      curriculum: 'Course Curriculum & Lessons',
      whatYouLearn: 'આ Course માં તમે શું શીખશો?',
      requirements: 'Course Requirements',
      targetAudience: 'આ Course કોના માટે છે?',
      instructor: 'Mentor Profile',
      reviews: 'Student Reviews & Ratings',
      writeReview: 'તમારો Review લખો',
      submitReview: 'Review Submit કરો',
      previewLesson: 'Free Preview',
      lockedLesson: 'Enroll કર્યા પછી Unlock થશે',
      duration: 'Total Duration',
      lessonsCount: 'Total Lessons',
      certificateIncluded: 'Verified Certificate of Completion',
      lifetimeAccess: 'Lifetime Unlimited Access',
      mentorSupport: 'WhatsApp Mentor Support',
      enrollFreeBtn: 'Free માં Enroll કરો (Start Course)',
      buyCourseBtn: 'હવે Enroll કરો (Buy Now)',
      enrolledAlready: 'તમે આ Course માં Enroll થયેલા છો',
      goToPlayer: 'Course શરૂ કરો',
      shareCourse: 'Share કરો',
      addToWishlist: 'Wishlist માં Add કરો',
      removeFromWishlist: 'Wishlist માંથી Remove કરો',
      daysGuarantee: '100% Satisfaction Guarantee'
    },
    checkout: {
      title: 'Secure Checkout & Payment',
      subtitle: 'તમારી Trading Journey શરૂ કરવા માટે Details ભરો',
      orderSummary: 'Order Summary',
      originalPrice: 'Original Price',
      discount: 'Discount',
      totalAmount: 'Total Payable Amount',
      couponPlaceholder: 'Coupon Code enter કરો (e.g. LAUNCH50)',
      applyCoupon: 'Apply કરો',
      couponApplied: 'Coupon successfully apply થઈ ગઈ! 🎉',
      removeCoupon: 'Remove કરો',
      billingDetails: 'Billing Information',
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Mobile / WhatsApp Number',
      city: 'City (e.g. Ahmedabad, Surat, Rajkot)',
      paymentMethod: 'Payment Method પસંદ કરો',
      upiOption: 'UPI (Google Pay / PhonePe / Paytm / BHIM)',
      cardOption: 'Debit / Credit Card',
      netbankingOption: 'Net Banking',
      upiPlaceholder: 'તમારો UPI ID enter કરો (e.g. username@okhdfcbank)',
      payNow: 'Payment કરો અને Course Unlock કરો',
      secureNotice: '🔒 256-bit SSL Secure Payment. Payment પછી instantly Course access મળશે.',
      orderSuccessTitle: 'તમારું Enrollment સફળતાપૂર્વક થઈ ગયું છે! 🎉',
      orderSuccessDesc: 'તમારો Order confirm થઈ ગયો છે. હવે તમે Course Videos જોવાનું શરૂ કરી શકો છો.',
      startCourseNow: 'Course શરૂ કરો',
      viewReceipt: 'Order Receipt જુઓ'
    },
    dashboard: {
      welcome: 'Welcome,',
      tabEnrolled: 'તમારા Courses',
      tabWishlist: 'Wishlist',
      tabOrders: 'Order History',
      tabCertificates: 'Certificates',
      tabSettings: 'Profile Settings',
      statsEnrolled: 'Enrolled Courses',
      statsCompleted: 'Completed Courses',
      statsCertificates: 'Earned Certificates',
      continueLearning: 'Course શરૂ કરો',
      progress: 'Progress',
      lastAccessed: 'Last Accessed',
      noCoursesYet: 'તમે હજુ સુધી કોઈ Course માં Enroll નથી કર્યું.',
      exploreCoursesBtn: 'Trading Courses Explore કરો',
      downloadCert: 'Certificate Download કરો',
      orderNumber: 'Order Number',
      date: 'Date',
      amount: 'Amount',
      status: 'Status'
    },
    auth: {
      loginTitle: 'Student Login',
      loginSubtitle: 'તમારા The Safe Trading Account માં Login કરો',
      registerTitle: 'તમારું Account બનાવો',
      registerSubtitle: 'આજે જ Free Register કરો અને Trading શીખવાનું શરૂ કરો',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      nameLabel: 'Full Name',
      phoneLabel: 'Mobile Number (WhatsApp)',
      forgotPassword: 'Password ભૂલી ગયા છો?',
      loginBtn: 'Login કરો',
      registerBtn: 'તમારું Account બનાવો',
      noAccount: 'Account નથી? નવું Account બનાવો',
      haveAccount: 'પહેલેથી Account છે? Login કરો',
      fillDemoStudent: 'Demo Student Data Autofill કરો',
      restrictedNotice: 'તમારો Data 100% સુરક્ષિત અને Encrypted છે.'
    },
    footer: {
      about: 'The Safe Trading વિશે',
      aboutDesc: 'The Safe Trading એ Gujarat નું premier Trading Education Platform છે, જ્યાં Stock Market, Options Trading, Price Action અને Crypto Trading સરળ Gujlish ભાષામાં શીખવવામાં આવે છે.',
      quickLinks: 'Quick Links',
      coursesHeading: 'Trading Courses',
      contactHeading: 'અમારો સંપર્ક કરો (Contact Us)',
      sebiDisclaimerTitle: '⚠️ Regulatory Notice (SEBI Disclaimer):',
      sebiDisclaimer: 'The Safe Trading ફક્ત Educational Purpose માટે Trading Knowledge પૂરું પાડે છે. અમે કોઈ Stock Tips, Calls કે Advisory Services આપતા નથી. Stock Market માં Investment અને Trading Market Risk ને આધીન છે. કોઈ પણ Trade લેતા પહેલા તમારા SEBI-Registered Financial Advisor ની સલાહ લો.',
      copyright: '© 2026 The Safe Trading. All Rights Reserved.',
      privacyPolicy: 'Privacy Policy',
      termsConditions: 'Terms & Conditions',
      refundPolicy: 'Refund Policy'
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
      badge: 'WHY THE SAFE TRADING?',
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
      chatTitle: 'The Safe Trading Support',
      chatSubtitle: 'Online - Usually replies within 5 mins',
      onlineNow: 'Online Now',
      startChat: 'Open WhatsApp Chat',
      defaultMessage: 'Hello The Safe Trading, I want to know more about your stock market courses.'
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
      about: 'About The Safe Trading',
      aboutDesc: 'The Safe Trading is Gujarat’s premier trading education platform dedicated to empowering traders with practical, honest, and high-discipline education in stock markets, options, price action, and crypto.',
      quickLinks: 'Quick Links',
      coursesHeading: 'Featured Courses',
      contactHeading: 'Contact & Support',
      sebiDisclaimerTitle: '⚠️ Regulatory Disclaimer (SEBI Compliance):',
      sebiDisclaimer: 'The Safe Trading is an educational platform designed strictly for skill development. We do not provide trading tips, stock recommendations, or financial advisory services. Trading and investments in securities markets are subject to market risks. Please consult a SEBI-registered financial advisor before trading.',
      copyright: '© 2026 The Safe Trading. All rights reserved.',
      privacyPolicy: 'Privacy Policy',
      termsConditions: 'Terms & Conditions',
      refundPolicy: 'Refund Policy'
    }
  }
};
