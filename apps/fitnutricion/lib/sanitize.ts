import sanitizeHtml from "sanitize-html";

export function cleanHtml(input: string) {
  return sanitizeHtml(input, {
    allowedTags: ["b", "i", "strong", "em", "a", "ul", "ol", "li", "p", "br", "span", "small"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["class"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noreferrer noopener" })
    }
  });
}
