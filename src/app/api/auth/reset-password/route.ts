import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import bcrypt from "bcrypt"

export async function POST(req: Request, res: any) {
  const userEmail: any = req.headers.get("email");
  const user = await prisma.users.findFirst({
    where: {
      email: userEmail,
    },
  });
  const {values} = await req.json();
  if(await bcrypt.compare(values.oldPassword, user?.password || "")) {
    await prisma.users.update({
        where: {
            email: userEmail
        },
        data: {
            password: await bcrypt.hash(values.newPassword, 10)
        }
    });
    return NextResponse.json("password updated successfully", {status: 200})
  } else {
    return NextResponse.json("Something Went Wrong", {status: 404})
  }
}
