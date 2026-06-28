import { fsdDays } from "./fsd";
import { dsDays } from "./ds";

export const getPathDays = (track) => {

  const normalizedTrack = track
    ?.toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z-]/g, "");

  const pathMap = {
    // FSD
    fsd: fsdDays,
    "full-stack": fsdDays,

    // DS
    ds: dsDays,
    "data-science": dsDays,
    "datascience": dsDays,

    // AI (placeholder)
    ai: dsDays,
    "ai-ml": dsDays,

    // Cyber
    cyber: fsdDays,
    cybersecurity: fsdDays
  };

  if (!pathMap[normalizedTrack]) {
    console.error("❌ Invalid track:", {
      original: track,
      normalized: normalizedTrack
    });
    return {}; // ❗ Don't silently fallback
  }

  const result = pathMap[normalizedTrack];

  console.log("✅ Path Loaded:", {
    track,
      normalizedTrack,
      daysCount: Object.keys(result).length
  });

  return result;
};