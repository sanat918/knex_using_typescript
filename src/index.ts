import express from "express";

import rest from "./rest";
const app: express.Application = express();
import { rateLimit } from 'express-rate-limit'

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)





app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/rest", rest);

// app.use("/graphql", graphql);
app.get("/", function (_req, res) {
  res.json({ data: "Read the README.md!" });
});
// todo - add more routes

export const createApp = (port = 3000) => {
  app.listen(port, function () {
    console.log("Example app listening on port !");
  });
  return app;
};
