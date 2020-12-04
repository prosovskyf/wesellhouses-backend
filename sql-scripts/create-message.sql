/* Storing message thread info not actual messages */
create table "message"
(
    "id" serial not null
    constraint message_pk primary key,
    "property_id" int not null,
    "subject" text not null,
    "agent_name" varchar(24) not null constraint "FK_agents" references agents("username"),
    "user_name" varchar(24) not null constraint "FK_users" references agents("username"),
    "archived_agent" boolean default false not null,
    "archived_user" boolean default false not null,
    "del_for_user" boolean default false not null,
    "del_for_agent" boolean default false not null,
    "updated_time" timestamptz default current_timestamp not null
);
CREATE INDEX "fkIdx_agents_messages" ON "message"
(
 "agent_name"
);

CREATE INDEX "fkIdx_users_messages" ON "message"
(
 "user_name"
);
