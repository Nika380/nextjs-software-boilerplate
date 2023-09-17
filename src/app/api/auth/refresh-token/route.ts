import { NextResponse } from "next/server";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import cookie from "cookie";

const jwtSecret: string = process.env.JWT_SECRET_KEY || "";

export async function POST(req: Request) {
  const cookies = req.headers.get("Cookie") || "";
  const parsedCookies = cookie.parse(cookies);
  const token = parsedCookies.refreshToken;

  if (!token) {
    return NextResponse.json("You Are Signed Out", { status: 400 });
  }

  try {
    const decoded = verify(token, jwtSecret) as JwtPayload;
    const newToken = sign(
      { email: decoded.email, roleId: decoded.roleId },
      jwtSecret,
      {
        expiresIn: "30m",
        algorithm: "HS256",
      }
    );
    const headers = {
      "Set-Cookie": `token=${newToken}; Path=/; Max-Age=${30 * 60}; HttpOnly`,
    };
    return NextResponse.json(
      { roleId: decoded.roleId },
      { status: 202, headers }
    );
  } catch (error) {
    return NextResponse.json("Invalid Token", { status: 400 });
  }
}
