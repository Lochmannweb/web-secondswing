import { prisma } from "@/server/db/prisma";
import { serializeProfile } from "@/server/profiles/serialize";
import { ensureProfile } from "@/server/profiles/queries";

type ProfileUpdate = {
  display_name?: string;
  avatar_url?: string | null;
};

export async function upsertProfile(id: string, updates: ProfileUpdate) {
  await ensureProfile(id);

  const profile = await prisma.profile.update({
    where: { id },
    data: {
      ...(updates.display_name !== undefined ? { displayName: updates.display_name } : {}),
      ...(updates.avatar_url !== undefined ? { avatarUrl: updates.avatar_url } : {}),
    },
  });

  return serializeProfile(profile);
}
