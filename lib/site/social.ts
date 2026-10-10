/**
 * Starflames' social profiles (footer.md §2.5, §10). A link renders only when its
 * URL is set, so both are hidden until the user provides them
 * [confirm with user: Instagram and Pinterest profile URLs]. Setting them here is
 * the whole change. Never put a placeholder here: the /dev/footer preview has its
 * own (app/dev/footer/preview-data.tsx).
 */
export type SocialLinks = {
  instagram: string | null;
  pinterest: string | null;
};

export const SOCIAL_LINKS: SocialLinks = {
  instagram: null,
  pinterest: null,
};
