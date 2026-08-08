import {
  Users, Dumbbell, Waves, Swords, Flag, Bike,
} from "lucide-react";

/* =========================================================================
   MOCK DATA
   ========================================================================= */
export const CONFIG = { serviceFeeRate: 0.06, commissionRate: 0.15 };


const AVATAR_PALETTE = ["#4d7c0e"];
export function initials(name) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}
export function hashColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

export const SPORT_ICON = {
  "Netball": Users,
  "CrossFit": Dumbbell,
  "Surfing": Waves,
  "Boxing": Swords,
  "Golf": Flag,
  "Cycling": Bike,
};

export const COACHES = [
  {
    id: "c1", name: "Isla Ferguson", sport: "Netball", tags: ["Shooting circle", "Game sense"],
    suburb: "Surry Hills, Sydney", lat: -33.8846, lng: 151.2109, distanceKm: 2.1, rating: 4.9, reviews: 132,
    verified: { identity: true, wwcc: true, quals: true }, instantBook: true,
    experience: "8 yrs coaching", style: "High-energy, drill-based sessions focused on positioning and decision-making.",
    bio: "Former state league goal attack turned full-time coach. I work with players from age 8 through adult club level, building game sense that holds up under pressure.",
    cancellationPolicy: "Moderate — free reschedule up to 24h before session, 50% refund inside 24h.",
    noShowPolicy: "Marked a no-show if you're more than 15 min late with no message. The full session fee is retained.",
    venue: "Fitzroy Netball Courts", travelRadiusKm: 10, willingToTravel: true,
    qualifications: ["Netball Australia Level 2 Coach", "Working with Children Check", "First Aid & CPR Certified"],
    responseTime: "Usually replies within 1 hour", acceptanceRate: 96, repeatClientRate: 68,
    reelsCount: 6,
    packages: [
      { id: "p1", name: "1:1 Court Session", type: "1:1", duration: 60, mode: "In-person", price: 72, maxParticipants: 1, active: true },
      { id: "p2", name: "Junior Group (max 4)", type: "Group", duration: 60, mode: "In-person", price: 30, maxParticipants: 4, active: true },
      { id: "p3", name: "8-Week Term Block", type: "Term", duration: 60, mode: "In-person", price: 500, maxParticipants: 1, active: false },
      { id: "p4", name: "Family Netball Session", type: "Family Sessions", duration: 60, mode: "In-person", price: 90, maxParticipants: 5, active: true },
    ],
    availability: { Mon: ["07:00", "16:00", "17:00"], Wed: ["16:00", "17:00", "18:00"], Fri: ["07:00", "08:00"], Sat: ["09:00", "10:00", "11:00"] },
  },
  {
    id: "c2", name: "Noah Kelly", sport: "CrossFit", tags: ["Metcon programming", "Injury return"],
    suburb: "Chatswood, Sydney", lat: -33.7969, lng: 151.1830, distanceKm: 8.4, rating: 4.8, reviews: 96,
    verified: { identity: true, wwcc: false, quals: true }, instantBook: false,
    experience: "6 yrs coaching", style: "Programming-first — every block is periodised and tracked.",
    bio: "Accredited functional fitness coach working with amateur athletes and everyday members. Specialising in safe return-to-training after injury.",
    cancellationPolicy: "Strict — 50% refund up to 48h before, no refund inside 48h.",
    noShowPolicy: "No-shows without at least 2h notice forfeit the full session fee — no exceptions.",
    venue: "Fremantle Fitness Box", travelRadiusKm: 5, willingToTravel: false,
    qualifications: ["CrossFit Level 2 Trainer", "First Aid & CPR Certified"],
    responseTime: "Usually replies within 3 hours", acceptanceRate: 88, repeatClientRate: 74,
    reelsCount: 11,
    packages: [
      {
        id: "p1", name: "1:1 Programming Session", type: "1:1 Coaching", packageType: "1:1 Coaching",
        sport: "CrossFit", description: "Individually periodised strength-and-conditioning session with technique coaching and load tracking.",
        duration: 45, durationMinutes: 45, mode: "In-person", locationType: "In-person",
        location: "Fremantle Fitness Box", venue: "Fremantle Fitness Box",
        price: 65, maxParticipants: 1, equipment: "Wear flat, closed-toe shoes", active: true,
      },
      {
        id: "p2", name: "Small Group WOD (max 3)", type: "Group Training", packageType: "Group Training",
        sport: "CrossFit", description: "Small-group conditioning session, same programming block for everyone in the group.",
        duration: 60, durationMinutes: 60, mode: "In-person", locationType: "In-person",
        location: "Fremantle Fitness Box", venue: "Fremantle Fitness Box",
        price: 38, maxParticipants: 3, equipment: "", active: false,
      },
    ],
    availability: { Tue: ["06:00", "07:00", "18:00"], Thu: ["06:00", "07:00"], Sat: ["08:00", "09:00"] },
  },
  {
    id: "c3", name: "Ruby Hendricks", sport: "Surfing", tags: ["Beginner coaching", "Wave reading"],
    suburb: "Manly, Sydney", lat: -33.7969, lng: 151.2870, distanceKm: 9.4, rating: 5.0, reviews: 58,
    verified: { identity: true, wwcc: true, quals: true }, instantBook: true,
    experience: "10 yrs coaching", style: "Patient, safety-first, big on ocean awareness before technique.",
    bio: "Ex-competitive longboarder. I coach juniors through adult beginners, with a focus on reading conditions and building confidence in the water.",
    cancellationPolicy: "Flexible — free cancellation up to 12h before session.",
    noShowPolicy: "A no-show forfeits 50% of the session fee. Repeated no-shows may affect future booking requests.",
    venue: "Manly Beach", travelRadiusKm: 8, willingToTravel: true,
    qualifications: ["Surfing Australia Coach Accreditation", "Working with Children Check", "Surf Rescue Certificate"],
    responseTime: "Usually replies within 30 minutes", acceptanceRate: 99, repeatClientRate: 81,
    reelsCount: 4,
    packages: [
      { id: "p1", name: "1:1 Beach Session", type: "1:1", duration: 60, mode: "In-person", price: 65, maxParticipants: 1, active: true },
      { id: "p2", name: "Term Block (10 sessions)", type: "Term", duration: 60, mode: "In-person", price: 580, maxParticipants: 1, active: true },
    ],
    availability: { Mon: ["06:00", "06:45"], Wed: ["06:00", "06:45"], Fri: ["06:00", "06:45"], Sun: ["08:00", "08:45"] },
  },
  {
    id: "c4", name: "Marcus Ude", sport: "Boxing", tags: ["Pad work", "Fitness boxing"],
    suburb: "Glebe, Sydney", lat: -33.8795, lng: 151.1852, distanceKm: 3.4, rating: 4.7, reviews: 74,
    verified: { identity: true, wwcc: true, quals: false }, instantBook: true,
    experience: "5 yrs coaching", style: "Technique-first sessions built around footwork and combinations.",
    bio: "Former amateur boxer now coaching juniors and adult fitness clients. Sessions are filmed so you can see what changed.",
    cancellationPolicy: "Moderate — free reschedule up to 24h before session, 50% refund inside 24h.",
    noShowPolicy: "Marked a no-show if you're more than 15 min late with no message. The full session fee is retained.",
    venue: "South Yarra Boxing Gym", travelRadiusKm: 12, willingToTravel: true,
    qualifications: ["Boxing Australia Level 1 Coach", "Working with Children Check"],
    responseTime: "Usually replies within 2 hours", acceptanceRate: 91, repeatClientRate: 59,
    reelsCount: 9,
    packages: [
      { id: "p1", name: "1:1 Pad Session", type: "1:1", duration: 60, mode: "In-person", price: 68, maxParticipants: 1, active: true },
      { id: "p2", name: "Virtual Technique Review", type: "1:1", duration: 30, mode: "Virtual", price: 32, maxParticipants: 1, active: true },
    ],
    availability: { Tue: ["17:00", "18:00"], Thu: ["17:00", "18:00"], Sun: ["10:00", "11:00", "12:00"] },
  },
  {
    id: "c5", name: "Chloe Dawson", sport: "Golf", tags: ["Short game", "Swing mechanics"],
    suburb: "Redfern, Sydney", lat: -33.8930, lng: 151.2044, distanceKm: 3.1, rating: 4.9, reviews: 210,
    verified: { identity: true, wwcc: false, quals: true }, instantBook: true,
    experience: "9 yrs coaching", style: "Video-led lessons, adaptable to every level from first-timers to club players.",
    bio: "PGA-accredited instructor. I teach 1:1 and small group lessons with a focus on building a repeatable, low-maintenance swing.",
    cancellationPolicy: "Flexible — free cancellation up to 12h before session.",
    noShowPolicy: "A no-show forfeits the full session fee. Please message ahead if you're running late.",
    venue: "Marrickville Golf Club", travelRadiusKm: 6, willingToTravel: false,
    qualifications: ["PGA of Australia Level 2 Coach", "First Aid & CPR Certified"],
    responseTime: "Usually replies within 1 hour", acceptanceRate: 94, repeatClientRate: 77,
    reelsCount: 14,
    packages: [
      { id: "p1", name: "1:1 Lesson", type: "1:1", duration: 60, mode: "In-person", price: 58, maxParticipants: 1, active: true },
      { id: "p2", name: "Virtual Swing Review", type: "1:1", duration: 45, mode: "Virtual", price: 40, maxParticipants: 1, active: true },
      { id: "p3", name: "4-Week Bundle", type: "Term", duration: 60, mode: "In-person", price: 210, maxParticipants: 1, active: true },
    ],
    availability: { Mon: ["07:00", "18:00"], Wed: ["07:00", "18:00"], Fri: ["07:00"], Sat: ["09:00", "10:00"] },
  },
  {
    id: "c6", name: "Liam O'Connor", sport: "Cycling", tags: ["Road racing", "Power training"],
    suburb: "Parramatta, Sydney", lat: -33.8150, lng: 151.0011, distanceKm: 23.9, rating: 4.6, reviews: 41,
    verified: { identity: true, wwcc: true, quals: true }, instantBook: false,
    experience: "4 yrs coaching", style: "Data-driven coaching — training built around power zones and race goals.",
    bio: "Former state road cyclist turned coach. I work with complete beginners through to riders training for their first crit or gran fondo.",
    cancellationPolicy: "Strict — 50% refund up to 48h before, no refund inside 48h.",
    noShowPolicy: "No-shows without notice forfeit the full session fee, as routes and support are pre-arranged.",
    venue: "Brunswick Velodrome", travelRadiusKm: 15, willingToTravel: true,
    qualifications: ["Cycling Australia Coaching Accreditation", "Working with Children Check"],
    responseTime: "Usually replies within 4 hours", acceptanceRate: 85, repeatClientRate: 52,
    reelsCount: 7,
    packages: [
      { id: "p1", name: "1:1 Coaching Session", type: "1:1", duration: 90, mode: "In-person", price: 80, maxParticipants: 1, active: true },
      { id: "p2", name: "Small Group Ride (max 4)", type: "Group", duration: 90, mode: "In-person", price: 42, maxParticipants: 4, active: true },
    ],
    availability: { Tue: ["16:00"], Thu: ["16:00"], Sat: ["10:00", "13:00"] },
  },
];


export const LANGUAGE_OPTIONS = [
  "English", "Mandarin", "Cantonese", "Vietnamese", "Arabic", "Hindi", "Punjabi",
  "Spanish", "Italian", "Greek", "Korean", "Japanese", "French", "German",
  "Tagalog", "Thai", "Indonesian", "Portuguese", "Turkish", "Auslan",
];

export const GENDER_OPTIONS = ["Male", "Female", "Non-binary"];

export const AU_SUBURBS = [
  { suburb: "Fitzroy", state: "VIC", postcode: "3065" },
  { suburb: "Richmond", state: "VIC", postcode: "3121" },
  { suburb: "St Kilda", state: "VIC", postcode: "3182" },
  { suburb: "Carlton", state: "VIC", postcode: "3053" },
  { suburb: "Brunswick", state: "VIC", postcode: "3056" },
  { suburb: "South Yarra", state: "VIC", postcode: "3141" },
  { suburb: "Bondi", state: "NSW", postcode: "2026" },
  { suburb: "Surry Hills", state: "NSW", postcode: "2010" },
  { suburb: "Newtown", state: "NSW", postcode: "2042" },
  { suburb: "Manly", state: "NSW", postcode: "2095" },
  { suburb: "Parramatta", state: "NSW", postcode: "2150" },
  { suburb: "Sydney", state: "NSW", postcode: "2000" },
  { suburb: "South Brisbane", state: "QLD", postcode: "4101" },
  { suburb: "Fortitude Valley", state: "QLD", postcode: "4006" },
  { suburb: "New Farm", state: "QLD", postcode: "4005" },
  { suburb: "Surfers Paradise", state: "QLD", postcode: "4217" },
  { suburb: "North Adelaide", state: "SA", postcode: "5006" },
  { suburb: "Glenelg", state: "SA", postcode: "5045" },
  { suburb: "Fremantle", state: "WA", postcode: "6160" },
  { suburb: "Subiaco", state: "WA", postcode: "6008" },
  { suburb: "Perth", state: "WA", postcode: "6000" },
  { suburb: "Hobart", state: "TAS", postcode: "7000" },
  { suburb: "North Hobart", state: "TAS", postcode: "7000" },
  { suburb: "Canberra", state: "ACT", postcode: "2600" },
  { suburb: "Braddon", state: "ACT", postcode: "2612" },
  { suburb: "Darwin", state: "NT", postcode: "0800" },
];

export const SPORT_OPTIONS_FULL = [
  "Tennis", "Swimming", "Basketball", "Strength & Conditioning", "Football",
  "Yoga", "Rock Climbing", "Athletics", "Netball", "AFL", "Rugby League",
  "Rugby Union", "Cricket", "Golf", "Boxing", "Cycling", "Running",
  "Pilates", "Triathlon", "Surfing", "Volleyball", "Table Tennis",
  "Badminton", "Martial Arts", "CrossFit", "Gymnastics", "Hockey", "Squash",
];

export const COACHING_CATEGORY_OPTIONS = [
  "1-on-1 private coaching", "Small group sessions", "Team coaching",
  "Squad / program training", "Online coaching", "Corporate / school programs",
];

export const SKILL_LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced", "Elite / competitive"];

export const AGE_GROUP_OPTIONS = ["Under 12", "13–17", "18–24", "25–40", "40+"];

export const COACHING_EXPERIENCE_LEVELS = [
  "Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "10+ years",
];

export const COACHING_FORMAT_OPTIONS = ["In person", "Online / virtual", "Hybrid"];

export const ID_TYPE_OPTIONS = ["Driver licence", "Passport", "Proof of age card"];

export const CERTIFICATION_TYPE_OPTIONS = [
  "Coaching accreditation", "First Aid", "CPR", "Sport-specific certification", "Other",
];

export const SPORTS = ["Netball", "CrossFit", "Surfing", "Boxing", "Golf", "Cycling", "Football", "Athletics"];
export const ALL_SUBURBS = [...new Set(COACHES.map((c) => c.suburb))].sort();


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

// Chat history keyed by booking id, used for the coach → client enquiry thread
// shown on a pending booking's detail screen before the coach decides.
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

// Extra profile context shown to a coach before they accept/decline a booking.
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

// Recurring weekly availability for the current coach (Noah Kelly),
// expressed as exact time blocks with the packages bookable during each one.
// Package ids reference COACHES[1].packages.
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

/* Notifications shown in the client Discover tab's bottom sheet */
export const CLIENT_NOTIFICATIONS = [
  {
    id: "n1", type: "booking", title: "Booking confirmed", body: "Your session with Isla Ferguson is confirmed for Tue, 4:00pm.",
    time: "9:41am", unread: true, coachId: "c1", coachName: "Isla Ferguson",
  },
  {
    id: "n2", type: "message", title: "New message from Noah Kelly", body: "Do you have any morning slots next week?",
    time: "Yesterday", unread: true, coachName: "Noah Kelly",
  },
  {
    id: "n3", type: "review", title: "How was your session?", body: "Leave a quick review for Ruby Hendricks to help other clients.",
    time: "2 days ago", unread: true, coachName: "Ruby Hendricks",
  },
  {
    id: "n4", type: "availability", title: "New availability", body: "Chloe Dawson, one of your favorites, just opened up new slots this week.",
    time: "3 days ago", unread: false, coachId: "c5", coachName: "Chloe Dawson",
  },
  {
    id: "n5", type: "promo", title: "10% off your next booking", body: "Use code WELCOME10 at checkout before it expires.",
    time: "5 days ago", unread: false,
  },
];

/* Coach's own verification documents — surfaced on the coach dashboard as they approach expiry */
export const COACH_VERIFICATION_DOCS = [
  { key: "wwcc", label: "Working with Children Check", expiresOn: "24 Aug 2026", daysLeft: 18 },
  { key: "quals", label: "Coaching qualification renewal", expiresOn: "30 Sep 2026", daysLeft: 55 },
];

/* Notifications shown in the coach dashboard's bottom sheet */
export const COACH_NOTIFICATIONS = [
  {
    id: "cn1", type: "message", title: "New message from Marcus Webb", body: "Do you run sessions on weekends?",
    time: "Yesterday", unread: true, threadId: "ct2", clientName: "Marcus Webb",
  },
  {
    id: "cn2", type: "verification", title: "Working with Children Check expiring soon",
    body: "Your WWCC expires in 18 days — renew it to keep accepting under-18 bookings.",
    time: "Today", unread: true,
  },
  {
    id: "cn3", type: "booking", title: "New booking request", body: "Marcus Webb requested a 1:1 Programming Session for Sat, 9:00am.",
    time: "2 hours ago", unread: true,
  },
  {
    id: "cn4", type: "review", title: "New 5-star review", body: "Sarah L. left you a review after your last session.",
    time: "3 days ago", unread: false,
  },
];

/* Shared admin mock records */
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