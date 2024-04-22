export default function checkApiKey(req, res, next) {
  const apiKey = req.headers["api-key"] as string;
  if (!apiKey || apiKey !== process.env.API_KEY) {
    console.error(
      `${new Date().toISOString()} - Error:"Please Authenticate with valid API key" - Fail`,
    );
    return res
      .status(401)
      .json({ error: "Please Authenticate with valid API key" });
  }
  next();
}
