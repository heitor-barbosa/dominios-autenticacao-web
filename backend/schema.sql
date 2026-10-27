CREATE TABLE IF NOT EXISTS usuarios (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE CHECK (email = lower(btrim(email)) AND email <> ''),
  salt text NOT NULL CHECK (salt ~ '^[0-9a-fA-F]{32}$'),
  hash_senha text NOT NULL CHECK (hash_senha ~ '^[0-9a-fA-F]{128}$')
);
