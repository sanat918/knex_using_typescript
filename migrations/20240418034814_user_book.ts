import type { Knex } from "knex";

const user_book = "user_book";
const userTable = "users";
const bookTable = "books";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(user_book);

  await knex.schema.createTable(user_book, (table) => {
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable(userTable)
      .onDelete("CASCADE");
    table
      .integer("book_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable(bookTable)
      .onDelete("CASCADE");
    table.primary(["user_id", "book_id"]);
  });

  // Insert data into the intermediary table to establish relationships
  await knex(user_book).insert([
    { user_id: 1, book_id: 1 }, // John authored Book 1
    { user_id: 2, book_id: 1 }, // Jane co-authored Book 1
    { user_id: 3, book_id: 2 }, // Bob authored Book 2
    { user_id: 4, book_id: 3 }, // Alice authored Book 3
    { user_id: 5, book_id: 4 }, // Tom authored Book 4
    { user_id: 6, book_id: 5 }, // Sara authored Book 5
    { user_id: 7, book_id: 5 }, // Mike co-authored Book 5
    { user_id: 8, book_id: 5 }, // Emily co-authored Book 5
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(user_book);
}
