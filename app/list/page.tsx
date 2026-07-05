import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemList } from "./ItemList";
import { ShareLinkBar } from "./ShareLinkBar";
import { ListPageHeader } from "./ListPageHeader";

export default async function ListPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [user, items] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { publicShareSlug: true },
    }),
    prisma.wishlistItem.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // The owner's view never reflects claim status — always render as a plain list.
  const ownerView = items.map((item) => ({
    id: item.id,
    title: item.title,
    imageUrl: item.imageUrl,
    price: item.price,
    sourceUrl: item.sourceUrl,
  }));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <ListPageHeader />
      <ShareLinkBar slug={user.publicShareSlug} />
      <ItemList initialItems={ownerView} />
    </main>
  );
}
