/**
 * Auto-migration: Create profile tables if they don't exist.
 */
export const PROFILES_MIGRATION = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- Teacher Profiles
    CREATE TABLE IF NOT EXISTS "teacher_profiles" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        bio TEXT,
        subjects TEXT,
        experience TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Parent Profiles
    CREATE TABLE IF NOT EXISTS "parent_profiles" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Student Profiles
    CREATE TABLE IF NOT EXISTS "student_profiles" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        parent_id UUID REFERENCES parent_profiles(id) ON DELETE SET NULL,
        school TEXT,
        grade TEXT,
        academic_level UUID REFERENCES categories(id) ON DELETE SET NULL,
        learning_goal TEXT,
        health_notes TEXT,
        nickname TEXT,
        special_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
`;
