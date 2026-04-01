/**
 * Auto-migration: Tạo 4 bảng cho module Classes
 * (lesson_logs để Phase 5 cùng schedules)
 */
export const CLASSES_MIGRATION = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- 1. Bảng Lớp Học chính
    CREATE TABLE IF NOT EXISTS "classes" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        owner_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        thumbnail_url TEXT,
        teaching_model UUID REFERENCES categories(id) ON DELETE SET NULL,
        price DECIMAL(12, 2) DEFAULT 0,
        payment_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        status UUID REFERENCES categories(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_classes_owner ON classes(owner_id);
    CREATE INDEX IF NOT EXISTS idx_classes_category ON classes(class_category_id);

    -- 2. Bảng Giáo viên dạy chung / Trợ giảng
    CREATE TABLE IF NOT EXISTS "teachers_classes" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        teacher_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
        class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(teacher_id, class_id)
    );

    CREATE INDEX IF NOT EXISTS idx_tc_class ON teachers_classes(class_id);
    CREATE INDEX IF NOT EXISTS idx_tc_teacher ON teachers_classes(teacher_id);

    -- 3. Bảng Học sinh trong lớp
    CREATE TABLE IF NOT EXISTS "classes_students" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
        status UUID REFERENCES categories(id) ON DELETE SET NULL,
        startdate TIMESTAMPTZ,
        enddate TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(class_id, student_id)
    );

    CREATE INDEX IF NOT EXISTS idx_cs_class ON classes_students(class_id);
    CREATE INDEX IF NOT EXISTS idx_cs_student ON classes_students(student_id);

    -- 4. Bảng Bài giảng (Lessons)
    CREATE TABLE IF NOT EXISTS "lessons" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        teacher_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_lessons_class ON lessons(class_id);
`;
