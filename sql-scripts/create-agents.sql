CREATE TABLE "agents"
(
 "id"             SERIAL NOT NULL,
 "firstname"      varchar(32),
 "lastname"       varchar(64),
 "username"       varchar(24) NOT NULL UNIQUE,
 "about"          TEXT,
 "phone" varchar(15),
 "dateregistered" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
 "password"       varchar(255) NOT NULL,
 "passwordsalt"   varchar(255),
 "email"          varchar(64) NOT NULL UNIQUE,
 "picture_url"      varchar(100),
 "verified"      boolean NOT NULL DEFAULT false,
 "verify_token"  TEXT,
 "verify_token_expire" TIMESTAMP,
 CONSTRAINT "PK_agents" PRIMARY KEY ( "id" )
);