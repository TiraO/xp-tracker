create table user_roles
(
	slack_id varchar not null,
	user_role varchar,
	full_name varchar not null
);

create unique index user_roles_slack_id_uindex
	on user_roles (slack_id);
