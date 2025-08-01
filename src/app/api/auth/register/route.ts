import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json(
      { message: "User already exists." },
      { status: 400 }
    );
  }

  const isPasswordValid = (password: string) => {
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,128}$/;
    return strongRegex.test(password);
  };

  if (!isPasswordValid(password)) {
    return NextResponse.json(
      { message: "Password does not meet complexity requirements." },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      onboardingStep: 4, // Assuming the user starts at step 4 after registration
    },
  });
  // console.log("New user created:", user);

  return NextResponse.json({ message: "User created", user }, { status: 201 });
}
