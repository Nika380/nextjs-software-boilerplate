import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { transporter } from "@/config/nodemailer";

export async function POST(req: Request, res: any) {
  const userEmail: any = req.headers.get("email");
  const { values } = await req.json();
  let data = {};
  if (userEmail) {
    const user = await prisma.users.findFirst({
      where: {
        email: userEmail,
      },
    });
    data = { ...data, created_by: user?.user_id, updated_by: user?.user_id };
  }
  try {
    const otp = generateRandomCode();
    data = { ...data, otp_code: otp, status: 1 };
    await prisma.users.update({
      where: {
        email: values.email,
      },
      data: data,
    });
    return NextResponse.json("Success", { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json("Something Went Wrong", { status: 400 });
  }
}

function generateRandomCode() {
  var code = "";
  var possible = "0123456789";

  for (var i = 0; i < 6; i++) {
    code += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return code;
}
