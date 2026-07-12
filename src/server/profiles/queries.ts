import { prisma } from "@/server/db/prisma";
import { serializeProfile } from "@/server/profiles/serialize";

export async function getProfileById(id: string) {
  await ensureProfile(id);
  const profile = await prisma.profile.findUnique({ where: { id } });
  return profile ? serializeProfile(profile) : null;
}

export async function getProfilesByIds(ids: string[]) {
  if (!ids.length) return [];

  const profiles = await prisma.profile.findMany({
    where: { id: { in: ids } },
  });

  return profiles.map(serializeProfile);
}

export async function searchProfiles(query: string, excludeUserId?: string) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const profiles = await prisma.profile.findMany({
    where: {
      displayName: { contains: trimmed, mode: "insensitive" },
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
    take: 6,
  });

  return profiles.map(serializeProfile);
}

export async function ensureProfile(id: string) {
  return prisma.profile.upsert({
    where: { id },
    update: {},
    create: { id },
  });
}
