const validateUserInput = (req, res, next) => {
  const { givenName, familyName, gender } = req.body;

  // Check if required fields are missing
  if (!givenName || !familyName || !gender) {
    console.error(
      `${new Date().toISOString()} - Error:Missing required fields - Fail `,
    );
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (givenName.length <= 2 || familyName.length <= 2) {
    console.error(
      `${new Date().toISOString()} - Error:"givenName and familyName should have more than 2 character" - Fail`,
    );
    return res.status(400).json({
      error: "givenName and familyName should have more than 2 character",
    });
  }

  // Check if gender is valid
  const genderList = ["male", "female", "transgender"];
  if (!genderList.includes(gender.toLowerCase())) {
    console.error(
      `${new Date().toISOString()} - Error:"Please enter a valid gender" - Fail`,
    );
    return res.status(400).json({ error: "Please enter a valid gender" });
  }

  req.body.givenName = givenName
    .charAt(0)
    .toUpperCase()
    .concat(givenName.slice(1).toLowerCase());
  req.body.familyName = familyName
    .charAt(0)
    .toUpperCase()
    .concat(familyName.slice(1).toLowerCase());
  req.body.gender = gender.toLowerCase();

  // If all validations pass, move to the next middleware
  next();
};

export { validateUserInput };
