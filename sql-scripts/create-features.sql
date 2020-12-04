CREATE TABLE "features"
(
 "id"          SERIAL NOT NULL,
 "feature"        TEXT NOT NULL,
 "property_id" INT NOT NULL,
 CONSTRAINT "PK_features" PRIMARY KEY ( "id" ),
 CONSTRAINT "FK_properties" FOREIGN KEY ( "property_id" ) REFERENCES "properties" ( "id" )
);
CREATE INDEX "fkIdx_properties" ON "features"
(
 "property_id"
);