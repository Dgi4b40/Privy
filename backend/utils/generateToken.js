import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true, // prevenirea atacurilor XSS tip cross-site scripting
    sameSite: "strict", // prevenirea atacurilor CSFR
    secure: process.env.NODE_ENV !== "development",
  });
};

export default generateTokenAndSetCookie;
