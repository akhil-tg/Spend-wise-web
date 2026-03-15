-- Create users table
create table users (
  uid text primary key,
  email text,
  display_name text,
  full_name text,
  avatar text,
  age int,
  date_of_birth text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create transactions table
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  type text not null,
  category text not null,
  date text not null,
  amount_eur decimal not null,
  amount_inr decimal not null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table users enable row level security;
alter table transactions enable row level security;

-- Allow users to only see their own data
create policy "Users can see own data" on users for select using (uid = (auth.uid())::text);
create policy "Users can insert own data" on users for insert with check (uid = (auth.uid())::text);
create policy "Users can update own data" on users for update using (uid = (auth.uid())::text);

create policy "Users can see own transactions" on transactions for select using (user_id = (auth.uid())::text);
create policy "Users can insert own transactions" on transactions for insert with check (user_id = (auth.uid())::text);
create policy "Users can update own transactions" on transactions for update using (user_id = (auth.uid())::text);
create policy "Users can delete own transactions" on transactions for delete using (user_id = (auth.uid())::text);
