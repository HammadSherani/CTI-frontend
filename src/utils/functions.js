export function getInitials(name) {
  if (!name) return "";

  return name
    .split(" ")                // split into words
    .map(word => word[0].toUpperCase()) // take first letter of each word
    .join("");                 // join them together
}