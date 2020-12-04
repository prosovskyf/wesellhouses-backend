CREATE TABLE "signup"
(
 "id"        SERIAL NOT NULL,
 "code"      text,
 "code_salt" text,
 CONSTRAINT "PK_signup" PRIMARY KEY ( "id" )
);

INSERT INTO signup(code,code_salt) VALUES('HASH_FROM_SCRIPT','SALT_FROM_SCRIPT');