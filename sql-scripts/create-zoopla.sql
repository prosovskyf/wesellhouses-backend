create table zoopla
(
	postcode varchar(10) not null,
	average_sold_price_1year int,
	average_sold_price_3year int,
	average_sold_price_5year int,
	average_sold_price_7year int,
	number_of_sales_1year int,
	number_of_sales_3year int,
	number_of_sales_7year int,
	number_of_sales_5year int,
	county text,
	turnover float
);

create unique index zoopla_postcode_uindex
	on zoopla (postcode);

alter table zoopla
	add constraint zoopla_pk
		primary key (postcode);
