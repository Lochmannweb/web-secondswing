export type ProfileDto = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  updated_at: string;
  created_at: string;
};

type ProfileRecord = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  updatedAt: Date;
  createdAt: Date;
};

export function serializeProfile(profile: ProfileRecord): ProfileDto {
  return {
    id: profile.id,
    display_name: profile.displayName,
    avatar_url: profile.avatarUrl,
    updated_at: profile.updatedAt.toISOString(),
    created_at: profile.createdAt.toISOString(),
  };
}
