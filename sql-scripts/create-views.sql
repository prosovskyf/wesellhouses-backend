CREATE TABLE "views"
(
"id"  bigint,
"views"  bigint DEFAULT 0,
CONSTRAINT "PK_views" PRIMARY KEY ( "id" ),
CONSTRAINT "FK_properties" FOREIGN KEY ( "id" ) REFERENCES "properties" ( "id" )
);
CREATE INDEX "fkIdx_properties_views" ON "views"
(
   "id"
);