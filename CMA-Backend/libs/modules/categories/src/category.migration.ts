/**
 * Auto-migration: Tạo bảng categories nếu chưa tồn tại.
 */
export const CATEGORIES_MIGRATION = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    DROP TABLE IF EXISTS "categories" CASCADE;

    CREATE TABLE "categories" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(type, name)
    );

    -- Index cho truy vấn theo type (dùng rất nhiều)
    CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
`;

/**
 * Seed dữ liệu mặc định cho categories
 */
export const CATEGORIES_SEED = `
    INSERT INTO "categories" (type, name, description) VALUES
        -- Class Categories
        ('class_category', 'Toán', 'Môn Toán học'),
        ('class_category', 'Lý', 'Môn Vật lý'),
        ('class_category', 'Hóa', 'Môn Hóa học'),
        ('class_category', 'Anh', 'Tiếng Anh'),
        ('class_category', 'Văn', 'Ngữ Văn'),
        ('class_category', 'STEM', 'Khoa học & Công nghệ'),

        -- Teaching Models
        ('teaching_model', 'online', 'Học trực tuyến'),
        ('teaching_model', 'offline', 'Học tại trung tâm'),
        ('teaching_model', 'hybrid', 'Kết hợp online + offline'),

        -- Payment Categories
        ('payment', 'per_session', 'Thanh toán theo buổi'),
        ('payment', 'monthly', 'Thanh toán theo tháng'),
        ('payment', 'package', 'Thanh toán trọn gói'),

        -- Status (dùng chung)
        ('status', 'active', 'Đang hoạt động'),
        ('status', 'inactive', 'Tạm ngưng'),
        ('status', 'pending', 'Chờ duyệt'),
        ('status', 'completed', 'Hoàn thành'),
        ('status', 'cancelled', 'Đã hủy'),

        -- Enrollment Status
        ('enrollment_status', 'enrolled', 'Đang học'),
        ('enrollment_status', 'dropped', 'Đã nghỉ'),
        ('enrollment_status', 'completed', 'Hoàn thành khóa'),

        -- Question Types
        ('question_type', 'multiple_choice', 'Trắc nghiệm'),
        ('question_type', 'true_false', 'Đúng/Sai'),
        ('question_type', 'short_answer', 'Tự luận ngắn'),
        ('question_type', 'essay', 'Tự luận dài'),

        -- Schedule Types
        ('schedule_type', 'class_session', 'Buổi học'),
        ('schedule_type', 'exam', 'Kiểm tra'),
        ('schedule_type', 'meeting', 'Họp'),
        ('schedule_type', 'personal', 'Cá nhân'),

        -- Task Priorities
        ('task_priority', 'low', 'Thấp'),
        ('task_priority', 'medium', 'Trung bình'),
        ('task_priority', 'high', 'Cao'),
        ('task_priority', 'urgent', 'Khẩn cấp'),

        -- Task Types
        ('task_type', 'homework', 'Bài tập về nhà'),
        ('task_type', 'preparation', 'Chuẩn bị bài'),
        ('task_type', 'admin', 'Hành chính'),

        -- Academic Levels
        ('academic_level', 'grade_1', 'Lớp 1'),
        ('academic_level', 'grade_2', 'Lớp 2'),
        ('academic_level', 'grade_3', 'Lớp 3'),
        ('academic_level', 'grade_4', 'Lớp 4'),
        ('academic_level', 'grade_5', 'Lớp 5'),
        ('academic_level', 'grade_6', 'Lớp 6'),
        ('academic_level', 'grade_7', 'Lớp 7'),
        ('academic_level', 'grade_8', 'Lớp 8'),
        ('academic_level', 'grade_9', 'Lớp 9'),
        ('academic_level', 'grade_10', 'Lớp 10'),
        ('academic_level', 'grade_11', 'Lớp 11'),
        ('academic_level', 'grade_12', 'Lớp 12'),
        ('academic_level', 'university', 'Đại học')
    ON CONFLICT DO NOTHING;
`;
