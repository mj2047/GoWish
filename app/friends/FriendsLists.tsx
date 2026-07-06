"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export type FriendUser = {
  username: string;
  name: string;
  profilePhotoUrl: string | null;
};

function UserRow({ user }: { user: FriendUser }) {
  return (
    <Link
      href={`/users/${user.username}`}
      className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/5"
    >
      {user.profilePhotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.profilePhotoUrl}
          alt=""
          className="h-11 w-11 rounded-full object-cover ring-2 ring-white/10"
        />
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-white ring-2 ring-white/10">
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <p className="font-medium">{user.name}</p>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
      </div>
    </Link>
  );
}

function Section({
  title,
  users,
  emptyMessage,
}: {
  title: string;
  users: FriendUser[];
  emptyMessage: string;
}) {
  return (
    <div className="glass flex flex-1 flex-col gap-1 rounded-3xl p-4">
      <h2 className="font-display px-2 pb-2 text-lg font-bold">
        {title} <span className="text-muted-foreground">({users.length})</span>
      </h2>
      {users.length === 0 ? (
        <p className="px-2 py-4 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="flex flex-col gap-1">
          {users.map((user) => (
            <UserRow key={user.username} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FriendsLists({
  followers,
  following,
}: {
  followers: FriendUser[];
  following: FriendUser[];
}) {
  const { t } = useLanguage();

  return (
    <>
      <h1 className="font-display text-3xl font-black tracking-tight">{t("friends.title")}</h1>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Section
          title={t("friends.followers")}
          users={followers}
          emptyMessage={t("friends.noFollowers")}
        />
        <Section
          title={t("friends.following")}
          users={following}
          emptyMessage={t("friends.noFollowing")}
        />
      </div>
    </>
  );
}
