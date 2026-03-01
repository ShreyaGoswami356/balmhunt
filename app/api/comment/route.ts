import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CommentBody = {
  productId?: string;
  content?: string;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const body = (await request.json()) as CommentBody;
  const productId = body.productId?.trim();
  const content = body.content?.trim();

  if (!productId || !content) {
    return NextResponse.json({ error: "Missing comment fields." }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: {
      user_id: session.user.id,
      product_id: productId,
      content,
    },
    include: {
      user: { select: { id: true, name: true, role: true } },
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
