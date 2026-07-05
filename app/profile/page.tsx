import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-16">
      <ProfileForm
        name={user.name}
        username={user.username}
        profilePhotoUrl={user.profilePhotoUrl}
        publicShareSlug={user.publicShareSlug}
      />
    </main>
  );
}
