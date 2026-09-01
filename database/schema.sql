-- ==========================================
-- REYAN PWA MESSAGING APP - SUPABASE SQL SCHEMA
-- Database Engine: PostgreSQL 15+
-- ==========================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------
-- 1. PROFILES TABLE
-- Stores core user identity and presence
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    about TEXT DEFAULT 'Hey there! I am using Reyan.',
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ------------------------------------------
-- 2. CHATS TABLE
-- Defines 1-to-1 direct chats and group chats
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('DIRECT', 'GROUP')),
    name VARCHAR(100), -- Null for DIRECT chats, populated for GROUP
    description TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chats_type ON chats(type);

-- ------------------------------------------
-- 3. CHAT_MEMBERS TABLE
-- Maps users to chats with roles and preferences
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS chat_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'MEMBER')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    muted BOOLEAN DEFAULT FALSE,
    archived BOOLEAN DEFAULT FALSE,
    pinned BOOLEAN DEFAULT FALSE,
    UNIQUE(chat_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_members_chat ON chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members(user_id);

-- ------------------------------------------
-- 4. MESSAGES TABLE
-- Stores message content and media references
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL DEFAULT 'TEXT' CHECK (message_type IN ('TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'VOICE', 'SYSTEM')),
    content TEXT,
    media_url TEXT,
    media_filename VARCHAR(255),
    media_size BIGINT,
    reply_to_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    edited BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- ------------------------------------------
-- 5. MESSAGE_STATUS TABLE
-- Tracks per-recipient message status (SENT, DELIVERED, READ)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS message_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'SENT' CHECK (status IN ('SENT', 'DELIVERED', 'READ')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_status_msg_user ON message_status(message_id, user_id);

-- ------------------------------------------
-- 6. BLOCKED_USERS TABLE
-- Tracks block relationships between users
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);

-- ------------------------------------------
-- 7. USER_SETTINGS TABLE
-- Stores user privacy, notification, and theme preferences
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    last_seen_visibility VARCHAR(20) DEFAULT 'EVERYONE' CHECK (last_seen_visibility IN ('EVERYONE', 'CONTACTS', 'NOBODY')),
    online_visibility VARCHAR(20) DEFAULT 'EVERYONE' CHECK (online_visibility IN ('EVERYONE', 'MATCH_LAST_SEEN')),
    profile_photo_visibility VARCHAR(20) DEFAULT 'EVERYONE' CHECK (profile_photo_visibility IN ('EVERYONE', 'CONTACTS', 'NOBODY')),
    about_visibility VARCHAR(20) DEFAULT 'EVERYONE' CHECK (about_visibility IN ('EVERYONE', 'CONTACTS', 'NOBODY')),
    read_receipts BOOLEAN DEFAULT TRUE,
    typing_indicator BOOLEAN DEFAULT TRUE,
    notification_enabled BOOLEAN DEFAULT TRUE,
    dark_mode VARCHAR(20) DEFAULT 'SYSTEM' CHECK (dark_mode IN ('LIGHT', 'DARK', 'SYSTEM'))
);

-- ------------------------------------------
-- 8. DEVICE_TOKENS TABLE
-- Stores Web Push / FCM tokens for background notifications
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS device_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    fcm_token TEXT NOT NULL,
    device_type VARCHAR(50) DEFAULT 'WEB_PWA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, fcm_token)
);

-- ------------------------------------------
-- 9. STARRED_MESSAGES TABLE
-- Bookmarked messages per user
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS starred_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, message_id)
);

-- ------------------------------------------
-- 10. REFRESH_TOKENS TABLE
-- Persisted JWT Refresh Tokens
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- ==========================================
-- SUPABASE STORAGE BUCKET SETUP INSTRUCTIONS
-- ==========================================
-- Execute the following in Supabase SQL Editor or Dashboard:
-- 
-- INSERT INTO storage.buckets (id, name, public) VALUES 
-- ('avatars', 'avatars', true),
-- ('chat-media', 'chat-media', true),
-- ('documents', 'documents', true)
-- ON CONFLICT (id) DO NOTHING;
-- 
-- Storage policies are controlled by Spring Boot backend using Supabase Service Role Key or public reads.
