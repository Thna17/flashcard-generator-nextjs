type AuthUserLike = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

const USER_NAME_KEYS = [
  "userName",
  "username",
  "displayName",
  "display_name",
  "full_name",
  "name",
] as const;

function readString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function getPlayerName(user: AuthUserLike | null | undefined) {
  if (!user) return "PLAYER";

  const metadata = user.user_metadata ?? {};
  for (const key of USER_NAME_KEYS) {
    const value = readString(metadata[key]);
    if (value) return value;
  }

  const email = readString(user.email);
  if (email.includes("@")) {
    const [localPart] = email.split("@");
    if (localPart) return localPart;
  }

  return "PLAYER";
}
