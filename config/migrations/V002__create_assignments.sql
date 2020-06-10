create table assignments
(
    id serial not null,
    person varchar(64) not null,
    score int,
    description varchar(128)
);

create unique index assignments_id_uindex
    on assignments (id);

alter table assignments
    add constraint assignments_pk
        primary key (id);

