CREATE TABLE "categories"
(
 "id"          SERIAL NOT NULL,
 "name"        varchar(32) NOT NULL UNIQUE,
 "description" TEXT,
 "image_url"    varchar(100),
 CONSTRAINT "PK_categories" PRIMARY KEY ( "id" )
);