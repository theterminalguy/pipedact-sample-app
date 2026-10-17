// Adversarial: Malformed source code with invalid syntax, unclosed braces, and truncated tokens
import { Request from "express"; // syntax error

function brokenHandler(req: Request {
  const secretKey = "unclosed string literal;
  console.log(
  // missing closing parentheses and braces
