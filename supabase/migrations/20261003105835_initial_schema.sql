create table public.certificates (
  id uuid default gen_random_uuid() primary key,
  "credentialId" text unique not null,
  "recipientName" text not null,
  "certificateType" text not null,
  "eventName" text not null,
  "issueDate" text not null,
  "issuedBy" text not null,
  "organization" text not null,
  status text not null default 'Valid',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.certificates disable row level security;
