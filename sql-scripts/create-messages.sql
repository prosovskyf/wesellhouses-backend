/* Storing encrypted messages */
CREATE TABLE "messages"
(
    "id"    SERIAL NOT NULL,
    "date" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "message"   text NOT NULL,
    "message_thread" int not null constraint "FK_message_thread" references message,
    "author"    varchar(24) not null constraint "FK_author" references agents("username"),
 CONSTRAINT "PK_messages" PRIMARY KEY ( "id" )
);
CREATE INDEX "fkIdx_message_thread" ON "messages"
(
 "message_thread"
);
CREATE INDEX "fkIdx_author" ON "messages"
(
 "author"
);