CREATE TABLE "roles"
(
 "name"        varchar(32) NOT NULL UNIQUE,
 "description" TEXT
 CONSTRAINT "PK_roles" PRIMARY KEY ( "name" )
);
/* After agents are created execute below when implementing RBAC, branch 9 */
alter table "agents"
	add role varchar(16) default 'agent' not null;

alter table "agents"
	add constraint "FK_roles"
		foreign key ("role") references "roles";

CREATE INDEX "fkIdx_roles" ON "agents"
(
 "role"
);
/* Assign all agents to roles, choose global admin */
UPDATE agents SET role='agent';
UPDATE agents SET role='admin' WHERE ID=<ID>;