create table questions
(
	id serial,
	question_raw varchar(1024),
	question_html varchar(1024),
	answer_raw varchar(1024),
	answer_html varchar(1024)
);

create unique index questions_id_uindex
	on questions (id);

alter table questions
	add constraint questions_id_pk
		primary key (id);

