export function formatISODate(isoString: string) {
  const date = new Date(isoString);

  const day = date.toLocaleDateString("en-US", { weekday: "long" });
  const dayNum = date.toLocaleDateString("en-US", { day: "2-digit" });
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day}, ${dayNum} ${month} ${year}`;
}
