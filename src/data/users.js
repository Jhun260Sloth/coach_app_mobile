/* =========================================================================
   USER IDENTITY SEED DATA
   -------------------------------------------------------------------------
   Mock identity directory for the prototype — the current signed-in client,
   the coach-side client roster, and the registry of taken @handles used for
   the unique-username availability check.
   ========================================================================= */
import { COACHES } from "./coaches";

/** The signed-in client — replaces the "Sarah Lin" strings scattered around. */
export const CURRENT_CLIENT = {
  id: "u-client",
  firstName: "Sarah",
  lastName: "Lin",
  email: "sarah.lin@email.com",
  handle: "sarahlin",
  namePrivacy: "initial",
};

/** Client roster seen from the coach side (used for handle lookups). */
export const MOCK_CLIENTS = [
  { id: "mc1", name: "Marcus Webb", handle: "marcusw", namePrivacy: "initial" },
  { id: "mc2", name: "The Chen Family (u18)", handle: "thechens", namePrivacy: "initial" },
  { id: "mc3", name: "Aiden Cross", handle: "aidenruns", namePrivacy: "initial" },
  { id: "mc4", name: "Grace Liu", handle: "graceliu", namePrivacy: "initial" },
  { id: "mc5", name: "Sarah Lin", handle: "sarahlin", namePrivacy: "initial" },
  { id: "mc6", name: "Ravi Patel", handle: "ravip", namePrivacy: "initial" },
  { id: "mc7", name: "Owen King", handle: "owenk", namePrivacy: "initial" },
  { id: "mc8", name: "The Nguyen Family (u18)", handle: "nguyenfam", namePrivacy: "initial" },
];

export const TAKEN_HANDLES = [
  ...COACHES.filter((c) => c.handle).map((c) => c.handle.toLowerCase()),
  ...MOCK_CLIENTS.map((c) => c.handle.toLowerCase()),
  CURRENT_CLIENT.handle,
  "priyad",
];

/** Unique-handle check (case-insensitive). `exclude` = own handles to skip. */
export function isHandleTaken(handle, exclude = []) {
  const h = String(handle || "").trim().toLowerCase();
  if (!h) return false;
  const excludes = exclude.map((e) => String(e).toLowerCase());
  return !excludes.includes(h) && TAKEN_HANDLES.includes(h);
}

/** Client identity metadata for a booking/thread's plain client name. */
export function clientMetaFor(name) {
  const m = MOCK_CLIENTS.find((c) => c.name === name);
  return {
    clientHandle: m?.handle,
    clientPrivacy: m?.namePrivacy || "initial",
  };
}

/** Attach handle/privacy metadata to a booking record if missing. */
export function withClientMeta(booking) {
  if (!booking || booking.clientHandle) return booking;
  return { ...booking, ...clientMetaFor(booking.clientName) };
}
