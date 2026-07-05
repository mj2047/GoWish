import { auth } from "@/auth";
import { HomeContent } from "./HomeContent";

export default async function Home() {
  const session = await auth();

  return <HomeContent isLoggedIn={!!session?.user} />;
}
