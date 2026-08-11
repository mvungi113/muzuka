export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function uniqueSlug(
  base: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = slugify(base);
  let counter = 1;
  while (await checkExists(slug)) {
    slug = `${slugify(base)}-${counter}`;
    counter++;
  }
  return slug;
}
