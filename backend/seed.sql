-- Usuário fictício de demonstração: usuario@exemplo.com / SenhaTeste123!
INSERT INTO usuarios (id, email, salt, hash_senha)
VALUES ('1', 'usuario@exemplo.com', '1a8b7a615e6a2be755f00ede2309b4dd', 'f55bf517893b8457a9d7a14930ffd99329467eaaafcc5be29216eefa8ce42f182347d21551face56bf2b5b6ddd4e7c485f7d0fdfb30150b93403118c0765a7ac')
ON CONFLICT (id) DO NOTHING;
