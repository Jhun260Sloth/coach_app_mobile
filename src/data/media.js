/* =========================================================================
   LOCAL PROFILE & MEDIA ASSETS
   -------------------------------------------------------------------------
   Public assets are deliberately used as first-party prototype content so
   profile cards, galleries and the reels viewer feel populated from launch.
   ========================================================================= */

const asset = (path) => `/${path.replaceAll(" ", "%20")}`;

export const COACH_AVATARS = {
  c1: asset("avatars/avatar (1).webp"),
  c2: asset("avatars/avatar (2).webp"),
  c3: asset("avatars/avatar (3).webp"),
  c4: asset("avatars/avatar (4).webp"),
  c5: asset("avatars/avatar (5).webp"),
  c6: asset("avatars/avatar (6).webp"),
};

export const PROFILE_AVATARS = {
  "new coach": asset("avatar-1.webp"),
  "isla ferguson": COACH_AVATARS.c1,
  "noah kelly": COACH_AVATARS.c2,
  "noah k.": COACH_AVATARS.c2,
  "ruby hendricks": COACH_AVATARS.c3,
  "ruby h.": COACH_AVATARS.c3,
  "marcus ude": COACH_AVATARS.c4,
  "@marcus.boxes": COACH_AVATARS.c4,
  "chloe dawson": COACH_AVATARS.c5,
  "liam o'connor": COACH_AVATARS.c6,
  "liam o.": COACH_AVATARS.c6,
  "sarah lin": asset("avatars/avatar (7).webp"),
  "sarah l.": asset("avatars/avatar (7).webp"),
  "marcus webb": asset("avatars/avatar (8).webp"),
  "marcus w.": asset("avatars/avatar (8).webp"),
  "the chen family (u18)": asset("avatars/avatar (9).webp"),
  "aiden cross": asset("avatars/avatar (10).webp"),
  "aiden c.": asset("avatars/avatar (10).webp"),
  "grace liu": asset("avatars/avatar (11).webp"),
  "grace l.": asset("avatars/avatar (11).webp"),
  "ravi patel": asset("avatars/avatar (12).webp"),
  "ravi p.": asset("avatars/avatar (12).webp"),
  "owen king": asset("avatars/avatar (13).webp"),
  "owen k.": asset("avatars/avatar (13).webp"),
  "the nguyen family (u18)": asset("avatars/avatar (14).webp"),
  "child": asset("avatars/avatar (15).webp"),
  "you": asset("avatars/avatar (16).webp"),
};

const reel = (number) => asset(`reels/coach_reel (${number}).mp4`);
const photo = (number) => asset(`media/coach (${number}).webp`);
const item = (id, type, url, caption, sport) => ({ id, type, url, caption, sport });

const REEL_CAPTIONS = [
  "Technique in motion",
  "Building confident movement",
  "Session highlight",
  "Training with purpose",
  "Game-day preparation",
  "Progress, one session at a time",
  "Focused coaching in action",
  "A stronger way to train",
];

// Keep every public gallery lively but stable: each coach gets two genuine
// session photos plus a different, curated set of four local video reels.
// Video thumbnails render from the clip itself, so preview and playback match.
const coachMedia = (coachId, sport, photoNumbers, reelNumbers) => [
  item(`${coachId}-p1`, "photo", photo(photoNumbers[0]), "Coaching in action", sport),
  item(`${coachId}-p2`, "photo", photo(photoNumbers[1]), "A closer look at training", sport),
  ...reelNumbers.map((number) => item(
    `${coachId}-r${number}`,
    "reel",
    reel(number),
    REEL_CAPTIONS[number - 1],
    sport,
  )),
];

export const DEFAULT_COACH_MEDIA = {
  c1: coachMedia("c1", "Netball", [1, 2], [1, 5, 3, 7]),
  c2: coachMedia("c2", "CrossFit", [3, 4], [2, 6, 4, 8]),
  c3: coachMedia("c3", "Surfing", [5, 6], [3, 7, 1, 5]),
  c4: coachMedia("c4", "Boxing", [7, 8], [4, 8, 2, 6]),
  c5: coachMedia("c5", "Golf", [9, 10], [5, 1, 7, 3]),
  c6: coachMedia("c6", "Cycling", [11, 12], [6, 2, 8, 4]),
};

/** Returns a fresh array so screen actions never mutate the default library. */
export const getCoachMedia = (coachId) => (DEFAULT_COACH_MEDIA[coachId] || []).map((media) => ({ ...media }));
