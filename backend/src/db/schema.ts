import { getDb, execute } from "./database.js";

export async function initSchema(): Promise<void> {
  await getDb();

  execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      avatar TEXT,
      headline TEXT,
      bio TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      course_count INTEGER DEFAULT 0,
      order_num INTEGER DEFAULT 0
    );
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS instructors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      avatar TEXT,
      title TEXT,
      bio TEXT,
      expertise TEXT,
      rating REAL DEFAULT 4.9,
      students_count INTEGER DEFAULT 0,
      courses_count INTEGER DEFAULT 0,
      social_links TEXT DEFAULT '{}',
      created_at TEXT NOT NULL
    );
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      short_description TEXT,
      description TEXT,
      category_id TEXT,
      instructor_id TEXT,
      thumbnail TEXT,
      preview_video_url TEXT,
      price REAL NOT NULL DEFAULT 0,
      discount_price REAL,
      difficulty_level TEXT NOT NULL DEFAULT 'Beginner',
      duration TEXT DEFAULT '0 hours',
      language TEXT DEFAULT 'English',
      learning_outcomes TEXT DEFAULT '[]',
      requirements TEXT DEFAULT '[]',
      target_audience TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'draft',
      featured INTEGER DEFAULT 0,
      popular INTEGER DEFAULT 0,
      is_new INTEGER DEFAULT 0,
      enrolled_count INTEGER DEFAULT 0,
      rating REAL DEFAULT 5.0,
      review_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      order_num INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      video_url TEXT,
      media_type TEXT DEFAULT 'url',
      media_name TEXT,
      media_size TEXT,
      video_duration TEXT DEFAULT '10:00',
      is_preview INTEGER DEFAULT 0,
      order_num INTEGER DEFAULT 0,
      resources TEXT DEFAULT '[]',
      quizzes TEXT DEFAULT '[]',
      created_at TEXT NOT NULL
    );
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      order_id TEXT,
      enrolled_at TEXT NOT NULL,
      progress_percent REAL DEFAULT 0,
      last_lesson_id TEXT,
      completed_at TEXT,
      status TEXT NOT NULL DEFAULT 'active'
    );
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      completed INTEGER DEFAULT 1,
      completed_at TEXT NOT NULL
    );
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      amount REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      coupon_code TEXT,
      payment_method TEXT DEFAULT 'card',
      payment_status TEXT NOT NULL DEFAULT 'completed',
      billing_info TEXT DEFAULT '{}',
      transaction_id TEXT,
      created_at TEXT NOT NULL
    );
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL DEFAULT 'percent',
      discount_value REAL NOT NULL,
      min_order_amount REAL DEFAULT 0,
      expires_at TEXT,
      usage_limit INTEGER DEFAULT 100,
      used_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      rating INTEGER NOT NULL,
      review_text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'approved',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS wishlist (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      certificate_code TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      course_title TEXT NOT NULL,
      instructor_name TEXT NOT NULL,
      issued_at TEXT NOT NULL
    );
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Indexes for query performance
  execute(
    `CREATE INDEX IF NOT EXISTS idx_courses_category ON courses (category_id);`,
  );
  execute(
    `CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses (instructor_id);`,
  );
  execute(
    `CREATE INDEX IF NOT EXISTS idx_modules_course ON modules (course_id);`,
  );
  execute(
    `CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons (module_id);`,
  );
  execute(
    `CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons (course_id);`,
  );
  execute(
    `CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments (user_id);`,
  );
  execute(
    `CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments (course_id);`,
  );
  execute(
    `CREATE INDEX IF NOT EXISTS idx_progress_user_course ON lesson_progress (user_id, course_id);`,
  );
  execute(
    `CREATE INDEX IF NOT EXISTS idx_reviews_course ON reviews (course_id);`,
  );
  execute(`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);`);

  console.log("Database schema initialized successfully.");
}
