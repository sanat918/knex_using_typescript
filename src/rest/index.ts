import express from "express";
const router = express.Router();
import knex from "../db";

const user_book = "user_book";
const userTable = "users";
const bookTable = "books";

import { validateUserInput } from "../../services/user.validate";
// import { logAPICall, logError } from "../../services/middleware/logsGenerate";

import checkApiKey from "../../src/Auth/authMiddleware";
import requestHandleTimeLimit from "services/middleware/timeLimit";

// Define a function to check API key validity

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     apiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: api-key
 */

/**
 * @openapi
 * /rest/demo/{id}:
 *   get:
 *     description: Demo get endpoint!
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns the record.
 *       404:
 *         description: Not found.
 *     security:
 *       - apiKeyAuth:
 *     securitySchemes:
 *       apiKeyAuth:
 *         type: apiKey
 *         name: api-key
 *         in: header
 */
router.get("/demo/:id", checkApiKey, async (req, res) => {
  // console.log(process.env.SECRET_TOKEN);
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({ error: "ID not provided" });
    }

    const data = await knex(userTable).select().where({ id });

    if (data.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ data });
  } catch (error) {
    // console.error(error); // Log error for debugging
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @openapi
 * /rest/user:
 *   post:
 *     description: Create User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - givenName
 *               - familyName
 *               - gender
 *             properties:
 *               givenName:
 *                 type: string
 *                 minLength: 3     # Minimum length requirement
 *               familyName:
 *                 type: string
 *                 minLength: 3     # Minimum length requirement
 *               gender:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created.
 *       409:
 *         description: User already exists.
 *     security:
 *       - apiKeyAuth:
 *     securitySchemes:
 *       apiKeyAuth:
 *         type: apiKey
 *         name: api-key
 *         in: header
 */
router.post("/user", checkApiKey, validateUserInput, async (req, res, next) => {
  try {
    const { givenName, familyName, gender } = req.body;

    // Check if the user already exists

    const existingUser = await knex(userTable)
      .where({ firstName: givenName, lastName: familyName })
      .first();
    if (existingUser) {
      let log = `${new Date().toISOString()} - ${req.method} - ${req.originalUrl} - ${JSON.stringify(req.body)} - Success (User already exists)\n`;
      console.log(log);
      return res.status(200).json({
        status: 200,
        success: true,
        message: "User already exists",
      });
    }

    // Insert user
    await knex(userTable).insert({
      firstName: givenName,
      lastName: familyName,
      gender: gender,
    });

    let log = `${new Date().toISOString()} - ${req.method} - ${req.originalUrl} - ${JSON.stringify(req.body)} - Success\n`;
    console.log(log);
    return res.status(201).json({
      status: 201,
      success: true,
      message: "User created",
    });
  } catch (error) {
    // console.error(error);
    console.error(
      `${new Date().toISOString()} - Error:"Internal Server Error" - Fail`,
    );
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
});

/**
 * @openapi
 * /rest/user:
 *   get:
 *     description: Get User
 *     parameters:
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *         description: Filter users by gender
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The page number for pagination (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: The maximum number of items to return per page (default is 10)
 *     responses:
 *       200:
 *         description: User detail found.
 *       404:
 *         description: User not found.
 *     security:
 *       - apiKeyAuth:
 *     securitySchemes:
 *       apiKeyAuth:
 *         type: apiKey
 *         name: api-key
 *         in: header
 */
router.get("/user" ,checkApiKey, async (req, res) => {
  try {
    const { gender, page = 1, limit = 10 } = req.query;

    // Building the query based on filters
    let query = knex(userTable).select();
    if (gender) {
      query = query.where("gender", gender);
    }

    // Counting total number of records for pagination
    const totalCount = await query.clone().count().first();

    // Adding pagination
    const offset = (page - 1) * limit;
    query = query.offset(offset).limit(limit);

    // Fetching data
    const data = await query;

    if (data.length > 0) {
      let log = `${new Date().toISOString()} - ${req.method} - ${req.originalUrl}  - Success\n`;
      console.log(log);
      return res.status(200).json({
        status: 200,
        data: data,
        totalCount: totalCount.count,
        message: "User found",
      });
    } else {
      console.error(
        `${new Date().toISOString()} - Error: "User List is empty" - Fail `,
      );
      return res.status(404).json({ message: "User List is Empty" });
    }
  } catch (error) {
    console.error(
      `${new Date().toISOString()} - Error: Internal server error - Fail `,
    );
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
});

/**
 * @openapi
 * /rest/user/{id}:
 *   patch:
 *     description: Update User
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User detail updated.
 *       404:
 *         description: User not found.
 *     security:
 *       - apiKeyAuth:
 *     securitySchemes:
 *       apiKeyAuth:
 *         type: apiKey
 *         name: api-key
 *         in: header
 */
router.patch("/user/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { givenName, familyName, gender } = req.body;

    // Check if any update parameters are provided
    if (!givenName && !familyName && !gender) {
      console.error(
        `${new Date().toISOString()} - Error: Please provide at least one field to update - Fail`,
      );
      return res
        .status(400)
        .json({ error: "Please provide at least one field to update" });
    }

    // Check if user exists
    const user = await knex(userTable).select().where({ id }).first();
    if (!user) {
      console.error(
        `${new Date().toISOString()} - Error: User id is Invalid - Fail`,
      );
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the update is idempotent
    if (
      user.firstName === req.body.givenName &&
      user.lastName === req.body.familyName &&
      user.gender === req.body.gender
    ) {
      return res.status(200).json({
        status: 200,
        message: "User details already up to date",
      });
    }

    // Prepare update parameters
    const updateParams = {};
    if (givenName) {
      updateParams.firstName = givenName;
    }
    if (familyName) {
      updateParams.lastName = familyName;
    }
    if (gender) {
      updateParams.gender = gender;
    }

    // Perform the update
    await knex(userTable).where({ id }).update(updateParams);

    return res.status(200).json({
      status: 200,
      message: "User details updated",
    });
  } catch (error) {
    console.error(
      `${new Date().toISOString()} - Error: Internal server error - Fail`,
      error,
    );
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
});

/**
 * @openapi
 * /rest/user/{id}:
 *   delete:
 *     description: Delete User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted.
 *       404:
 *         description: User not found.
 *     security:
 *       - apiKeyAuth:
 *     securitySchemes:
 *       apiKeyAuth:
 *         type: apiKey
 *         name: api-key
 *         in: header
 */
router.delete("/user/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await knex(userTable).select().where({ id });

    if (data.length === 0) {
      console.error(
        `${new Date().toISOString()} - Error: User is Invalid - Fail `,
      );
      return res.status(404).json({ error: "User not found" });
    }

    await knex(userTable).delete().where({ id });
    let log = `${new Date().toISOString()} - ${req.method} - ${req.originalUrl} - User Deleted - Success\n`;
    console.log(log);
    return res.status(200).json({
      status: 200,
      message: "User deleted",
    });
  } catch (error) {
    console.error(
      `${new Date().toISOString()} - Error: Internal server error - Fail `,
    );
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
});

/**
 * @openapi
 * /rest/authors/{bookId}:
 *   get:
 *     description: Get authors of book!
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of author(s) of the specified book.
 *       404:
 *         description: Not found.
 *       500:
 *         description: Internal Server error
 *     security:
 *       - apiKeyAuth:
 *     securitySchemes:
 *       apiKeyAuth:
 *         type: apiKey
 *         name: api-key
 *         in: header
 */

// Define routes
router.get("/authors/:bookId", checkApiKey, async (req, res) => {
  const bookId = req.params.bookId;
  try {
    const authors = await knex(user_book)
      .select("user_id")
      .from(user_book)
      .where({ book_id: bookId });
    res.json(authors);
  } catch (error) {
    console.log("Before call ", bookId, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @swagger
 *  /rest/books/{userId}:
 *   get:
 *     description: Get book(s) authored by a user.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user.
 *     responses:
 *       '200':
 *         description: A list of book(s) authored by the specified user.
 *       '500':
 *         description: Internal Server Error.
 *     security:
 *       - apiKeyAuth:
 *     securitySchemes:
 *       apiKeyAuth:
 *         type: apiKey
 *         name: api-key
 *         in: header
 */
router.get("/books/:userId", checkApiKey, async (req, res) => {
  const userId = req.params.userId; 
 
  try {
    const books = await knex(user_book)
      .select("book_id")
      .from(user_book)
      .where({ user_id: userId });
    res.json(books);
  } catch (error) {
    console.log("Before call ", userId, error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;






