-- MoodTune 数据库 Schema
-- 在 Supabase SQL Editor 中运行此脚本

-- 启用 UUID 扩展
create extension if not exists "uuid-ossp";

-- 心情记录表
create table if not exists mood_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text,
  mood_type varchar(20) not null check (mood_type in ('happy', 'calm', 'sad', 'energetic', 'healing')),
  music_url text,
  music_title varchar(255),
  music_artist varchar(255),
  music_cover text,
  ai_analysis jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 用户设置表
create table if not exists user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  ai_provider varchar(20) check (ai_provider in ('openai', 'anthropic', 'zhipu', 'qwen', 'wenxin')),
  ai_api_key text,
  theme varchar(10) default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI 聊天记录表
create table if not exists chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  role varchar(10) not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建索引
create index if not exists mood_entries_user_id_idx on mood_entries(user_id);
create index if not exists mood_entries_created_at_idx on mood_entries(created_at desc);
create index if not exists mood_entries_mood_type_idx on mood_entries(mood_type);
create index if not exists chat_messages_user_id_idx on chat_messages(user_id);

-- 启用 RLS (行级安全)
alter table mood_entries enable row level security;
alter table user_settings enable row level security;
alter table chat_messages enable row level security;

-- RLS 策略：用户只能访问自己的数据
create policy "Users can view own mood entries" on mood_entries
  for select using (auth.uid() = user_id);

create policy "Users can insert own mood entries" on mood_entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update own mood entries" on mood_entries
  for update using (auth.uid() = user_id);

create policy "Users can delete own mood entries" on mood_entries
  for delete using (auth.uid() = user_id);

create policy "Users can view own settings" on user_settings
  for select using (auth.uid() = user_id);

create policy "Users can insert own settings" on user_settings
  for insert with check (auth.uid() = user_id);

create policy "Users can update own settings" on user_settings
  for update using (auth.uid() = user_id);

create policy "Users can view own chat messages" on chat_messages
  for select using (auth.uid() = user_id);

create policy "Users can insert own chat messages" on chat_messages
  for insert with check (auth.uid() = user_id);

-- 自动更新 updated_at 触发器
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_mood_entries_updated_at
  before update on mood_entries
  for each row execute function update_updated_at_column();

create trigger update_user_settings_updated_at
  before update on user_settings
  for each row execute function update_updated_at_column();
