'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('hourly_aggregations', function(table) {
      table.increments();
      table.datetime('start_time').notNullable();
      table.tinyint('action').notNullable();
      table.integer('total').unsigned().notNullable().defaultTo(0);
      table.integer('successful').unsigned().notNullable().defaultTo(0);
      table.integer('failed').unsigned().notNullable().defaultTo(0);
      table.integer('ios').unsigned().notNullable().defaultTo(0);
      table.integer('android').unsigned().notNullable().defaultTo(0);
      table.unique(['action','start_time']);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('hourly_aggregations')
  ]);
};
