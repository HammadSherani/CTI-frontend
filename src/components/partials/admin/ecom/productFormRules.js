/**
 * Media rules and error helpers for the product form.
 * Keep the limits in sync with the backend (src/middleware/productUpload.js).
 */

export const IMAGE_RULES = {
  noun: "image",
  maxCount: 5,
  maxSizeMB: 5,
  extensions: ["jpg", "jpeg", "png", "webp"],
  mimeTypes: ["image/jpeg", "image/jpg", "image/pjpeg", "image/png", "image/webp"],
  accept: ".jpg,.jpeg,.png,.webp",
  hint: "JPG, JPEG, PNG or WEBP — up to 5MB each, maximum 5 images",
};

export function getVideoRules(type) {
  const maxCount = type === "refurbished" ? 2 : 3; // refurbished products accept 2 videos
  return {
    noun: "video",
    maxCount,
    maxSizeMB: 50,
    extensions: ["mp4", "webm", "mov"],
    mimeTypes: ["video/mp4", "video/webm", "video/quicktime"],
    accept: ".mp4,.webm,.mov",
    hint: `MP4, WebM or MOV — up to 50MB each, maximum ${maxCount} videos`,
  };
}

function checkFile(file, rules) {
  const extension = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
  const allowed = rules.extensions.map((e) => e.toUpperCase()).join(", ");

  if (!rules.extensions.includes(extension) || (file.type && !rules.mimeTypes.includes(file.type))) {
    return `"${file.name}" is not a supported ${rules.noun}. Allowed: ${allowed}`;
  }
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > rules.maxSizeMB) {
    return `"${file.name}" is ${sizeMB.toFixed(1)}MB. Maximum ${rules.noun} size is ${rules.maxSizeMB}MB`;
  }
  if (file.size === 0) return `"${file.name}" is empty`;
  return null;
}

/** Validates picked files, registers the good ones in `fileMap` and returns their preview URLs. */
export function pickFiles(picked, rules, currentCount, fileMap) {
  const urls = [];
  const problems = [];

  for (const file of picked) {
    const problem = checkFile(file, rules);
    if (problem) {
      problems.push(problem);
    } else if (currentCount + urls.length >= rules.maxCount) {
      problems.push(`"${file.name}" was not added — maximum ${rules.maxCount} ${rules.noun}s allowed`);
    } else {
      const url = URL.createObjectURL(file);
      fileMap.set(url, file);
      urls.push(url);
    }
  }
  return { urls, problems };
}

/** Turns an axios error into readable messages plus per-field errors. */
export function readApiError(err) {
  const response = err?.response;

  if (!response) {
    const message =
      err?.code === "ECONNABORTED"
        ? "The upload took too long and timed out. Try smaller files or a faster connection."
        : "Could not reach the server. Check your internet connection, make sure the backend is running, and try smaller files.";
    return { messages: [message], fieldErrors: {} };
  }

  const { data, status } = response;
  const fieldErrors = data?.errors && !Array.isArray(data.errors) ? data.errors : {};

  let messages = Array.isArray(data?.errors)
    ? data.errors.map((e) => e?.msg || e?.message || String(e))
    : Object.values(fieldErrors).map(String);

  if (!messages.length) {
    const fallback = {
      401: "Your session has expired. Please log in again.",
      403: "You do not have permission to do this.",
      413: "The upload is too large for the server. Use smaller files.",
    };
    messages = [data?.message || fallback[status] || `Request failed (error ${status}). Please try again.`];
  }
  return { messages: [...new Set(messages)], fieldErrors };
}

/** Field limits. Keep in sync with the backend (src/utils/productLimits.js). */
export const LIMITS = {
  titleMin: 3,
  titleMax: 150,
  shortDescriptionMax: 250,
  descriptionMin: 10,
  descriptionMax: 5000, // visible characters
  descriptionHtmlMax: 20000, // including formatting markup
  modelNumberMax: 50,
  tagsMax: 10,
  tagLengthMax: 30,
  priceMax: 10000000,
  stockMax: 100000,
  warrantyMonthsMax: 120,
};

/** Visible text of the rich-text description (what the character limit applies to). */
export const htmlToText = (html = "") =>
  String(html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, " ")
    .trim();

/** Returns a copy of `list` with the item at `from` moved to position `to`. */
export function moveItem(list, from, to) {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
