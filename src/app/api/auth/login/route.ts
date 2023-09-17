import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";

const jwtSecret: string = process.env.JWT_SECRET_KEY || "";

export async function POST(req: Request) {
  const { values } = await req.json();
  const user = await prisma.users.findFirst({
    where: {
      email: values.email,
    },
  });
  if (!user) {
    return NextResponse.json("User Not Found", { status: 404 });
  }

  const passwordToCompare = user.password || "";
  if (await bcrypt.compare(values.password, passwordToCompare)) {
    const token = sign({ email: user.email, roleId: user.role_id }, jwtSecret, {
      expiresIn: "30m",
      algorithm: "HS256",
    });
    const refreshToken = sign(
      { email: user.email, roleId: user.role_id },
      jwtSecret,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      }
    );
    const headers: any = [
      ["Set-Cookie", `token=${token}; Path=/; Max-Age=${30 * 60}; HttpOnly`],
      [
        "Set-Cookie",
        `refreshToken=${refreshToken}; Path=/; Max-Age=${
          60 * 60 * 24 * 7
        }; HttpOnly`,
      ],
    ];
    return NextResponse.json({ roleId: user.role_id }, { status: 202, headers });
  } else {
    return NextResponse.json("Password is incorrect", { status: 409 });
  }
}
