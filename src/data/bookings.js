/* =========================================================================
   BOOKING, MESSAGING, NOTIFICATION & ADMIN SEED DATA
   ========================================================================= */

export const INITIAL_BOOKINGS = [
  // Pending — awaiting the coach's response
  { id: "b2", coachId: "c2", coachName: "Noah Kelly", clientName: "Sarah Lin", service: "1:1 Programming Session", date: "Fri, 25 Jul", time: "6:00am", mode: "In-person", status: "pending", price: 65, reviewed: false, participants: "You", notes: "Coming back from a shoulder injury — cleared for light training, will bring physio notes." },
  { id: "b5", coachId: "c1", coachName: "Isla Ferguson", clientName: "Sarah Lin", service: "Group Clinic", date: "Fri, 8 Aug", time: "3:00pm", mode: "In-person", status: "pending", price: 42, reviewed: false, participants: "You", notes: "" },
  { id: "b6", coachId: "c5", coachName: "Chloe Dawson", clientName: "Sarah Lin", service: "Virtual Swing Review", date: "Sun, 10 Aug", time: "9:00am", mode: "Virtual", status: "pending", price: 40, reviewed: false, participants: "You", notes: "" },
  { id: "b7", coachId: "c6", coachName: "Liam O'Connor", clientName: "Sarah Lin", service: "Small Group Ride", date: "Thu, 14 Aug", time: "5:30pm", mode: "In-person", status: "pending", price: 42, reviewed: false, participants: "You", notes: "" },

  // Upcoming — confirmed and on the calendar
  { id: "b1", coachId: "c1", coachName: "Isla Ferguson", clientName: "Sarah Lin", service: "1:1 Court Session", date: "Tue, 22 Jul", time: "4:00pm", mode: "In-person", status: "confirmed", price: 72, reviewed: false, participants: "You", notes: "" },
  { id: "b8", coachId: "c3", coachName: "Ruby Hendricks", clientName: "Sarah Lin", service: "1:1 Beach Session", date: "Thu, 6 Aug", time: "7:00am", mode: "In-person", status: "confirmed", price: 65, reviewed: false, participants: "You", notes: "" },
  { id: "b9", coachId: "c4", coachName: "Marcus Ude", clientName: "Sarah Lin", service: "1:1 Pad Session", date: "Sat, 8 Aug", time: "10:00am", mode: "In-person", status: "confirmed", price: 68, reviewed: false, participants: "You", notes: "" },
  { id: "b10", coachId: "c6", coachName: "Liam O'Connor", clientName: "Sarah Lin", service: "Small Group Ride", date: "Wed, 12 Aug", time: "5:00pm", mode: "In-person", status: "confirmed", price: 42, reviewed: false, participants: "You", notes: "" },

  // Completed — past sessions
  { id: "b3", coachId: "c3", coachName: "Ruby Hendricks", clientName: "Sarah Lin", service: "1:1 Beach Session", date: "Sun, 13 Jul", time: "8:00am", mode: "In-person", status: "completed", price: 65, reviewed: false, participants: "You", notes: "" },
  { id: "b4", coachId: "c5", coachName: "Chloe Dawson", clientName: "Sarah Lin", service: "Virtual Swing Review", date: "Wed, 9 Jul", time: "7:00am", mode: "Virtual", status: "completed", price: 40, reviewed: true, participants: "You", notes: "" },
  { id: "b11", coachId: "c1", coachName: "Isla Ferguson", clientName: "Sarah Lin", service: "1:1 Court Session", date: "Thu, 16 Jul", time: "4:00pm", mode: "In-person", status: "completed", price: 72, reviewed: true, participants: "You", notes: "" },
  { id: "b12", coachId: "c2", coachName: "Noah Kelly", clientName: "Sarah Lin", service: "1:1 Programming Session", date: "Tue, 21 Jul", time: "6:00am", mode: "In-person", status: "completed", price: 65, reviewed: false, participants: "You", notes: "" },
  { id: "b13", coachId: "c4", coachName: "Marcus Ude", clientName: "Sarah Lin", service: "1:1 Pad Session", date: "Fri, 24 Jul", time: "5:00pm", mode: "In-person", status: "completed", price: 68, reviewed: false, participants: "You", notes: "" },
  { id: "b14", coachId: "c6", coachName: "Liam O'Connor", clientName: "Sarah Lin", service: "Small Group Ride", date: "Sat, 25 Jul", time: "11:00am", mode: "In-person", status: "completed", price: 42, reviewed: true, participants: "You", notes: "" },
];

/** Recurring weekly availability blocks for the current coach (Noah Kelly). */
export const INITIAL_AVAILABILITY_BLOCKS = [
  { id: "ab1", days: ["Tue", "Thu"], start: "06:00", end: "07:30", packageIds: ["p1"] },
  { id: "ab2", days: ["Tue"], start: "17:30", end: "19:00", packageIds: ["p1", "p2"] },
  { id: "ab3", days: ["Sat"], start: "08:00", end: "10:00", packageIds: ["p2"] },
];

export const COACH_BOOKINGS = [
  // Pending — awaiting the coach's accept/decline
  { id: "cb2", clientName: "Marcus Webb", service: "Junior Group (max 4)", date: "Wed, 23 Jul", time: "5:00pm", mode: "In-person", status: "pending", price: 30, notes: "First session for his son, age 9." },
  { id: "cb3", clientName: "The Chen Family (u18)", service: "1:1 Court Session", date: "Sat, 26 Jul", time: "9:00am", mode: "In-person", status: "pending", price: 72, notes: "Booking for two children, guardian consent provided at checkout." },
  { id: "cb5", clientName: "Aiden Cross", service: "1:1 Court Session", date: "Mon, 28 Jul", time: "6:30am", mode: "In-person", status: "pending", price: 72, notes: "" },
  { id: "cb6", clientName: "Grace Liu", service: "Junior Group (max 4)", date: "Thu, 30 Jul", time: "4:30pm", mode: "In-person", status: "pending", price: 30, notes: "Wants to try group coaching for the first time." },

  // Upcoming — confirmed and on the calendar
  { id: "cb1", clientName: "Sarah Lin", service: "1:1 Court Session", date: "Tue, 22 Jul", time: "4:00pm", mode: "In-person", status: "confirmed", price: 72, notes: "" },
  { id: "cb7", clientName: "Ravi Patel", service: "1:1 Court Session", date: "Tue, 29 Jul", time: "7:00am", mode: "In-person", status: "confirmed", price: 72, notes: "" },
  { id: "cb8", clientName: "Owen King", service: "1:1 Court Session", date: "Fri, 1 Aug", time: "5:30pm", mode: "In-person", status: "confirmed", price: 72, notes: "" },
  { id: "cb9", clientName: "The Nguyen Family (u18)", service: "Junior Group (max 4)", date: "Sun, 3 Aug", time: "10:00am", mode: "In-person", status: "confirmed", price: 30, notes: "" },

  // Completed — past sessions
  { id: "cb4", clientName: "Ravi Patel", service: "8-Week Term Block", date: "Mon, 14 Jul", time: "7:00am", mode: "In-person", status: "completed", price: 500, notes: "" },
  { id: "cb10", clientName: "Sarah Lin", service: "1:1 Court Session", date: "Wed, 9 Jul", time: "4:00pm", mode: "In-person", status: "completed", price: 72, notes: "" },
  { id: "cb11", clientName: "Marcus Webb", service: "Junior Group (max 4)", date: "Thu, 17 Jul", time: "5:00pm", mode: "In-person", status: "completed", price: 30, notes: "" },
  { id: "cb12", clientName: "The Chen Family (u18)", service: "1:1 Court Session", date: "Sun, 20 Jul", time: "9:00am", mode: "In-person", status: "completed", price: 72, notes: "" },
  { id: "cb13", clientName: "Owen King", service: "1:1 Court Session", date: "Mon, 21 Jul", time: "6:00am", mode: "In-person", status: "completed", price: 72, notes: "" },
];

export const REVIEWS = [
  { id: "r1", name: "Sarah L.", rating: 5, text: "Isla spotted a positioning issue in my first session that nobody else had picked up on. Genuinely improved my game.", verified: true, date: "3 weeks ago" },
  { id: "r2", name: "Priya D.", rating: 5, text: "Great with my two kids — patient but pushes them just enough.", verified: true, date: "1 month ago" },
  { id: "r3", name: "Owen K.", rating: 4, text: "Solid technical feedback, sessions run a little over time but worth it.", verified: true, date: "2 months ago" },
];

export const THREADS = [
  { id: "t1", withName: "Isla Ferguson", withRole: "coach", context: "Booking · Tue 4:00pm", lastMsg: "Sounds great, see you at the courts!", time: "9:41am", unread: 0 },
  { id: "t2", withName: "Noah Kelly", withRole: "coach", context: "Enquiry", lastMsg: "Do you have any morning slots next week?", time: "Yesterday", unread: 2 },
  { id: "t3", withName: "Ruby Hendricks", withRole: "coach", context: "Booking · Sun 8:00am", lastMsg: "I've sent through the drill sheet, take a look 🙂", time: "Mon", unread: 0 },
];
export const COACH_THREADS = [
  { id: "ct1", withName: "Sarah Lin", withRole: "client", context: "Booking · Tue 4:00pm", lastMsg: "Sounds great, see you at the courts!", time: "9:41am", unread: 0 },
  { id: "ct2", withName: "Marcus Webb", withRole: "client", context: "Enquiry", lastMsg: "Do you run sessions on weekends?", time: "Yesterday", unread: 1 },
  { id: "ct3", withName: "The Chen Family", withRole: "client", context: "Booking · Sat 9:00am", lastMsg: "Perfect, thank you for confirming!", time: "Mon", unread: 0 },
];

export const CHAT_MESSAGES = [
  { id: 1, from: "them", text: "Hi! Looking forward to Tuesday's session.", time: "9:12am" },
  { id: 2, from: "me", text: "Me too — should I bring my own gear?", time: "9:15am" },
  { id: 3, from: "them", text: "Either is fine, I've got spares on hand.", time: "9:20am" },
  { id: 4, from: "them", text: "Sounds great, see you at the courts!", time: "9:41am" },
];

export const BOOKING_ENQUIRY_MESSAGES = {
  cb2: [
    { id: 1, from: "them", text: "Hi! Is 5pm still free for a junior group session on Wednesday?", time: "10:02am" },
    { id: 2, from: "me", text: "Yep, that slot's open — how many kids will be joining?", time: "10:10am" },
    { id: 3, from: "them", text: "Just my son this time, he's 9 and new to netball.", time: "10:12am" },
  ],
  cb3: [
    { id: 1, from: "them", text: "Hi Isla, we'd like to book for both our kids (u18) Saturday morning.", time: "Yesterday" },
  ],
};

export const CLIENT_PROFILES = {
  "Sarah Lin": { memberSince: "Jan 2025", totalSessions: 14, homeSuburb: "Bondi, Sydney", notes: "Regular client — usually books weekly sessions.", verifiedPayment: true },
  "Marcus Webb": { memberSince: "Jun 2026", totalSessions: 1, homeSuburb: "Fitzroy, Melbourne", notes: "First-time booking with you. New to CoachLink.", verifiedPayment: true },
  "The Chen Family (u18)": { memberSince: "Mar 2026", totalSessions: 5, homeSuburb: "Bondi, Sydney", notes: "Books for two children (ages 10 & 13). Guardian consent on file.", verifiedPayment: true },
  "Ravi Patel": { memberSince: "Sep 2024", totalSessions: 22, homeSuburb: "Parramatta, Sydney", notes: "Long-term client, term-block subscriber.", verifiedPayment: true },
  "Aiden Cross": { memberSince: "Jul 2026", totalSessions: 0, homeSuburb: "Bondi, Sydney", notes: "First-time booking with you. New to CoachLink.", verifiedPayment: true },
  "Grace Liu": { memberSince: "May 2026", totalSessions: 2, homeSuburb: "Randwick, Sydney", notes: "Prefers group sessions over 1:1.", verifiedPayment: true },
  "Owen King": { memberSince: "Feb 2026", totalSessions: 8, homeSuburb: "Bondi, Sydney", notes: "Regular client — books most weeks.", verifiedPayment: true },
  "The Nguyen Family (u18)": { memberSince: "Jun 2026", totalSessions: 3, homeSuburb: "Bondi, Sydney", notes: "Books for one child (age 11). Guardian consent on file.", verifiedPayment: true },
};

export const FAQS = {
  client: [
    { q: "How do I book a session?", a: "Search for a coach, open their profile, choose a package, then pick a time. Coaches with Instant Book confirm automatically — others review your request first." },
    { q: "When am I charged?", a: "Your card is charged at the time of booking. Funds are held securely and released to the coach once the session is marked complete." },
    { q: "What if I need to cancel?", a: "Open the booking from your dashboard and select Cancel or Reschedule. Refunds follow the individual coach's cancellation policy, shown at checkout." },
    { q: "How do refunds work?", a: "Approved refunds are returned to your original payment method within 5–10 business days." },
    { q: "Is my payment information secure?", a: "Yes — CoachLink never stores full card details. Payments are processed through an encrypted, PCI-compliant provider." },
  ],
  coach: [
    { q: "How do I get verified?", a: "Submit an identity document and, if you coach under-18s, a Working with Children Check. Most reviews complete within 2 business days." },
    { q: "When do I get paid?", a: "Payouts release automatically once a client confirms a session is complete, minus CoachLink's commission. Funds typically land in 2–3 business days." },
    { q: "Can I set my own cancellation policy?", a: "Yes — choose Flexible, Moderate or Strict from your Services tab. This is shown to clients before they book." },
    { q: "How does Instant Book differ from Request to Book?", a: "Instant Book confirms matching client requests automatically. Request to Book lets you review and accept each one." },
  ],
};

export const CLIENT_NOTIFICATIONS = [
  { id: "n1", type: "booking", title: "Booking confirmed", body: "Your session with Isla Ferguson is confirmed for Tue, 4:00pm.", time: "9:41am", unread: true, coachId: "c1", coachName: "Isla Ferguson" },
  { id: "n2", type: "message", title: "New message from Noah Kelly", body: "Do you have any morning slots next week?", time: "Yesterday", unread: true, coachName: "Noah Kelly" },
  { id: "n3", type: "review", title: "How was your session?", body: "Leave a quick review for Ruby Hendricks to help other clients.", time: "2 days ago", unread: true, coachName: "Ruby Hendricks" },
  { id: "n4", type: "availability", title: "New availability", body: "Chloe Dawson, one of your favorites, just opened up new slots this week.", time: "3 days ago", unread: false, coachId: "c5", coachName: "Chloe Dawson" },
  { id: "n5", type: "promo", title: "10% off your next booking", body: "Use code WELCOME10 at checkout before it expires.", time: "5 days ago", unread: false },
];

export const COACH_VERIFICATION_DOCS = [
  { key: "wwcc", label: "Working with Children Check", expiresOn: "24 Aug 2026", daysLeft: 18 },
  { key: "quals", label: "Coaching qualification renewal", expiresOn: "30 Sep 2026", daysLeft: 55 },
];

export const COACH_NOTIFICATIONS = [
  { id: "cn1", type: "message", title: "New message from Marcus Webb", body: "Do you run sessions on weekends?", time: "Yesterday", unread: true, threadId: "ct2", clientName: "Marcus Webb" },
  { id: "cn2", type: "verification", title: "Working with Children Check expiring soon", body: "Your WWCC expires in 18 days — renew it to keep accepting under-18 bookings.", time: "Today", unread: true },
  { id: "cn3", type: "booking", title: "New booking request", body: "Marcus Webb requested a 1:1 Programming Session for Sat, 9:00am.", time: "2 hours ago", unread: true },
  { id: "cn4", type: "review", title: "New 5-star review", body: "Sarah L. left you a review after your last session.", time: "3 days ago", unread: false },
];

export const ADMIN_VERIFICATION_QUEUE = [
  {
    id: "v1", name: "Ravi Patel", sport: "Boxing", type: "Identity + WWCC",
    suburb: "Parramatta, Sydney", experience: "6 yrs coaching",
    documents: [
      { key: "id", label: "Identity document", detail: "Driver's licence — front & back, uploaded" },
      { key: "wwcc", label: "Working with Children Check", detail: "NSW WWCC, valid to 2028" },
    ],
    submittedByUser: false,
  },
  {
    id: "v2", name: "Nina Torres", sport: "Cycling", type: "Qualifications",
    suburb: "Geelong, Melbourne", experience: "3 yrs coaching",
    documents: [
      { key: "quals", label: "Coaching qualifications", detail: "Cycling Australia Level 2 certificate" },
    ],
    submittedByUser: false,
  },
];

export const ADMIN_DISPUTES = [
  {
    id: "d1", booking: "#4821", issue: "No-show claim", parties: "Sarah Lin vs. Noah Kelly",
    service: "1:1 Programming Session", date: "Fri, 18 Jul", amount: 65,
    filedBy: "Sarah Lin", summary: "Client says the coach didn't show up for the scheduled session and is requesting a full refund.",
    evidence: [
      { type: "Screenshot", label: "Location check-in showing client at the gym at session time" },
      { type: "Message log", label: "Chat thread with no response from coach after 4:10pm" },
    ],
    messages: [
      { from: "Sarah Lin", text: "I was at the gym at 6am but Noah never turned up.", time: "Fri, 6:20am" },
      { from: "Noah Kelly", text: "I'm so sorry — I had a family emergency and couldn't get to my phone in time.", time: "Fri, 9:02am" },
      { from: "CoachLink Support", text: "Thanks both — reviewing the booking and check-in logs now.", time: "Fri, 11:40am" },
    ],
  },
  {
    id: "d2", booking: "#4790", issue: "Refund request", parties: "Marcus Webb vs. Isla Ferguson",
    service: "Junior Group (max 4)", date: "Wed, 16 Jul", amount: 30,
    filedBy: "Marcus Webb", summary: "Client says the group session was cut short by 20 minutes and is asking for a partial refund.",
    evidence: [
      { type: "Message log", label: "Coach confirms session ended early due to court closure" },
    ],
    messages: [
      { from: "Marcus Webb", text: "The session ended 20 minutes early because the court closed for maintenance.", time: "Wed, 5:45pm" },
      { from: "Isla Ferguson", text: "That's right, the venue closed the courts early without much notice.", time: "Wed, 6:10pm" },
    ],
  },
];

export const ADMIN_FLAGGED = [
  { id: "f1", type: "Review", reason: "Reported as spam", content: "\"Best coach!! visit my site...\"" },
  { id: "f2", type: "Reel", reason: "Reported: inappropriate", content: "Uploaded 2 days ago" },
];

export const ADMIN_RECENT_BOOKINGS = [
  { id: "ab1", client: "Sarah Lin", coach: "Isla Ferguson", amount: 72, status: "confirmed" },
  { id: "ab2", client: "Marcus Webb", coach: "Noah Kelly", amount: 65, status: "pending" },
  { id: "ab3", client: "The Chen Family", coach: "Isla Ferguson", amount: 72, status: "completed" },
  { id: "ab4", client: "Owen Kelly", coach: "Ruby Hendricks", amount: 65, status: "completed" },
];
