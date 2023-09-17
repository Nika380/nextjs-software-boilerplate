import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { transporter } from "@/config/nodemailer";
import bcrypt from "bcrypt";

export async function POST(req: Request, res: any) {
  const { values } = await req.json();
  const user = await prisma.users.findFirst({
    where: {
      email: values.email,
    },
  });
  if (user?.otp_code === values.otpCode) {
    try {
      const newPassword = await bcrypt.hash(values.newPassword, 10);
      await prisma.users.update({
        where: {
          email: values.email,
        },
        data: {
          otp_code: null,
          password: newPassword,
          updated_at: new Date(),
          updated_by: user?.user_id
        },
      });
      return NextResponse.json("Password Changed Successfully", {
        status: 200,
      });
    } catch (error) {
      console.log(error);
      return NextResponse.json("Something Went Wrong", { status: 400 });
    }
  } else {
    return NextResponse.json("Otp Is Incorrect", { status: 400 });
  }
}
