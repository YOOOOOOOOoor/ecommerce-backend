create database fullstack_project;
CREATE TABLE users(
    id serial primary key,
    name varchar(255) not null,
    email varchar(255) not null,
    password varchar(255) not null,
    role varchar(255) default 'user' not null,
    created_at timestamp default current_timestamp
);
create table products(
    id serial primary key,
    name varchar(255) not null,
    description text,
    price numeric(10, 2) not null,
    image varchar(255) not null,
    category varchar(255) not null,
    seller_id integer references users(id),
    created_at timestamp default current_timestamp
);
create table carts(
    id serial primary key,
    users_id integer references users(id),
    products_id integer references products(id),
    quantity integer default 1,
    status varchar(255) default 'pending',
    unique (users_id, products_id),
    created_at timestamp default current_timestamp
);
create table orders(
    id serial primary key,
    user_id integer references users(id),
    product_id integer references products(id),
    cart_id integer references carts(id),
    quantity integer default 1,
    status varchar(255) default 'pending',
    created_at timestamp default current_timestamp
);