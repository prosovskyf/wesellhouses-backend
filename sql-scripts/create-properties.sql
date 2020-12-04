CREATE TABLE "properties"
(
 "id"         SERIAL NOT NULL,
 "title"      varchar(32) NOT NULL,
 "description"   TEXT NOT NULL,
 "created"    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
 "modified"   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
 "image_url"   varchar(60),
 "video_url"    varchar(100),
 "published"  boolean NOT NULL,
 "price"    INT NOT NULL,
 "location" varchar(32),
 "high_priority" boolean DEFAULT false,
 "under_offer" boolean DEFAULT false,
 "agent_id"   int NOT NULL,
 "category_id" int NOT NULL,
 CONSTRAINT "PK_properties" PRIMARY KEY ( "id" ),
 CONSTRAINT "FK_agents" FOREIGN KEY ( "agent_id" ) REFERENCES "agents" ( "id" ),
 CONSTRAINT "FK_categories" FOREIGN KEY ( "category_id" ) REFERENCES "categories" ( "id" )
);

CREATE INDEX "fkIdx_agents" ON "properties"
(
 "agent_id"
);

CREATE INDEX "fkIdx_categories" ON "properties"
(
 "category_id"
);