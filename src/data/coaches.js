/* =========================================================================
   COACH PROFILES & SPORT DATA
   ========================================================================= */
import { Users, Dumbbell, Waves, Swords, Flag, Bike } from "lucide-react";
import { COACH_AVATARS } from "./media";

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
    id: "c1", name: "Isla Ferguson", handle: "isla.netball", namePrivacy: "full", avatar: COACH_AVATARS.c1, sport: "Netball", tags: ["Shooting circle", "Game sense"],
    suburb: "Surry Hills, Sydney", lat: -33.8846, lng: 151.2109, distanceKm: 2.1, rating: 4.9, reviews: 132,
    verified: { identity: true, wwcc: true, quals: true }, instantBook: true,
    experience: "8 yrs coaching",
    languages: ["English"],
    bio: "Former state league goal attack turned full-time coach. I work with players from age 8 through adult club level, building game sense that holds up under pressure.",
    noShowPolicy: "Marked a no-show if you're more than 15 min late with no message. The full session fee is retained.",
    venue: "Fitzroy Netball Courts", travelRadiusKm: 10, willingToTravel: true,
    accreditations: ["Netball Australia Level 2 Coach", "Working with Children Check", "First Aid & CPR Certified"],
    responseTime: "Usually replies within 1 hour", acceptanceRate: 96, repeatClientRate: 68,
    reelsCount: 4,
    packages: [
      { id: "p1", name: "1:1 Court Session", type: "1:1", duration: 60, mode: "In-person", price: 72, maxParticipants: 1, active: true },
      { id: "p2", name: "Junior Group (max 4)", type: "Group", duration: 60, mode: "In-person", price: 30, maxParticipants: 4, active: true },
      { id: "p3", name: "8-Week Term Block", type: "Term", duration: 60, mode: "In-person", price: 500, maxParticipants: 1, active: false },
      { id: "p4", name: "Family Netball Session", type: "Family Sessions", duration: 60, mode: "In-person", price: 90, maxParticipants: 5, active: true },
    ],
    availability: { Mon: ["07:00", "16:00", "17:00"], Wed: ["16:00", "17:00", "18:00"], Fri: ["07:00", "08:00"], Sat: ["09:00", "10:00", "11:00"] },
  },
  {
    id: "c2", name: "Noah Kelly", handle: "noah.kelly", namePrivacy: "initial", avatar: COACH_AVATARS.c2, sport: "CrossFit", tags: ["Metcon programming", "Injury return"],
    suburb: "Chatswood, Sydney", lat: -33.7969, lng: 151.1830, distanceKm: 8.4, rating: 4.8, reviews: 96,
    verified: { identity: true, wwcc: false, quals: true }, instantBook: false,
    experience: "6 yrs coaching",
    languages: ["English"],
    bio: "Accredited functional fitness coach working with amateur athletes and everyday members. Specialising in safe return-to-training after injury.",
    noShowPolicy: "No-shows without at least 2h notice forfeit the full session fee — no exceptions.",
    venue: "Fremantle Fitness Box", travelRadiusKm: 5, willingToTravel: false,
    accreditations: ["CrossFit Level 2 Trainer", "First Aid & CPR Certified"],
    responseTime: "Usually replies within 3 hours", acceptanceRate: 88, repeatClientRate: 74,
    reelsCount: 4,
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
    id: "c3", name: "Ruby Hendricks", handle: "ruby.waves", namePrivacy: "initial", avatar: COACH_AVATARS.c3, sport: "Surfing", tags: ["Beginner coaching", "Wave reading"],
    suburb: "Manly, Sydney", lat: -33.7969, lng: 151.2870, distanceKm: 9.4, rating: 5.0, reviews: 58,
    verified: { identity: true, wwcc: true, quals: true }, instantBook: true,
    experience: "10 yrs coaching",
    languages: ["English", "Spanish"],
    bio: "Ex-competitive longboarder. I coach juniors through adult beginners, with a focus on reading conditions and building confidence in the water.",
    noShowPolicy: "A no-show forfeits 50% of the session fee. Repeated no-shows may affect future booking requests.",
    venue: "Manly Beach", travelRadiusKm: 8, willingToTravel: true,
    accreditations: ["Surfing Australia Coach Accreditation", "Working with Children Check", "Surf Rescue Certificate"],
    responseTime: "Usually replies within 30 minutes", acceptanceRate: 99, repeatClientRate: 81,
    reelsCount: 4,
    packages: [
      { id: "p1", name: "1:1 Beach Session", type: "1:1", duration: 60, mode: "In-person", price: 65, maxParticipants: 1, active: true },
      { id: "p2", name: "Term Block (10 sessions)", type: "Term", duration: 60, mode: "In-person", price: 580, maxParticipants: 1, active: true },
    ],
    availability: { Mon: ["06:00", "06:45"], Wed: ["06:00", "06:45"], Fri: ["06:00", "06:45"], Sun: ["08:00", "08:45"] },
  },
  {
    id: "c4", name: "Marcus Ude", handle: "marcus.boxes", namePrivacy: "handle", avatar: COACH_AVATARS.c4, sport: "Boxing", tags: ["Pad work", "Fitness boxing"],
    suburb: "Glebe, Sydney", lat: -33.8795, lng: 151.1852, distanceKm: 3.4, rating: 4.7, reviews: 74,
    verified: { identity: true, wwcc: true, quals: false }, instantBook: true,
    experience: "5 yrs coaching",
    languages: ["English"],
    bio: "Former amateur boxer now coaching juniors and adult fitness clients. Sessions are filmed so you can see what changed.",
    noShowPolicy: "Marked a no-show if you're more than 15 min late with no message. The full session fee is retained.",
    venue: "South Yarra Boxing Gym", travelRadiusKm: 12, willingToTravel: true,
    accreditations: ["Boxing Australia Level 1 Coach", "Working with Children Check"],
    responseTime: "Usually replies within 2 hours", acceptanceRate: 91, repeatClientRate: 59,
    reelsCount: 4,
    packages: [
      { id: "p1", name: "1:1 Pad Session", type: "1:1", duration: 60, mode: "In-person", price: 68, maxParticipants: 1, active: true },
      { id: "p2", name: "Virtual Technique Review", type: "1:1", duration: 30, mode: "Virtual", price: 32, maxParticipants: 1, active: true },
    ],
    availability: { Tue: ["17:00", "18:00"], Thu: ["17:00", "18:00"], Sun: ["10:00", "11:00", "12:00"] },
  },
  {
    id: "c5", name: "Chloe Dawson", handle: "chloe.swing", namePrivacy: "full", avatar: COACH_AVATARS.c5, sport: "Golf", tags: ["Short game", "Swing mechanics"],
    suburb: "Redfern, Sydney", lat: -33.8930, lng: 151.2044, distanceKm: 3.1, rating: 4.9, reviews: 210,
    verified: { identity: true, wwcc: false, quals: true }, instantBook: true,
    experience: "9 yrs coaching",
    languages: ["English"],
    bio: "PGA-accredited instructor. I teach 1:1 and small group lessons with a focus on building a repeatable, low-maintenance swing.",
    noShowPolicy: "A no-show forfeits the full session fee. Please message ahead if you're running late.",
    venue: "Marrickville Golf Club", travelRadiusKm: 6, willingToTravel: false,
    accreditations: ["PGA of Australia Level 2 Coach", "First Aid & CPR Certified"],
    responseTime: "Usually replies within 1 hour", acceptanceRate: 94, repeatClientRate: 77,
    reelsCount: 4,
    packages: [
      { id: "p1", name: "1:1 Lesson", type: "1:1", duration: 60, mode: "In-person", price: 58, maxParticipants: 1, active: true },
      { id: "p2", name: "Virtual Swing Review", type: "1:1", duration: 45, mode: "Virtual", price: 40, maxParticipants: 1, active: true },
      { id: "p3", name: "4-Week Bundle", type: "Term", duration: 60, mode: "In-person", price: 210, maxParticipants: 1, active: true },
    ],
    availability: { Mon: ["07:00", "18:00"], Wed: ["07:00", "18:00"], Fri: ["07:00"], Sat: ["09:00", "10:00"] },
  },
  {
    id: "c6", name: "Liam O'Connor", handle: "liam.rides", namePrivacy: "initial", avatar: COACH_AVATARS.c6, sport: "Cycling", tags: ["Road racing", "Power training"],
    suburb: "Parramatta, Sydney", lat: -33.8150, lng: 151.0011, distanceKm: 23.9, rating: 4.6, reviews: 41,
    verified: { identity: true, wwcc: true, quals: true }, instantBook: false,
    experience: "4 yrs coaching",
    languages: ["English"],
    bio: "Former state road cyclist turned coach. I work with complete beginners through to riders training for their first crit or gran fondo.",
    noShowPolicy: "No-shows without notice forfeit the full session fee, as routes and support are pre-arranged.",
    venue: "Brunswick Velodrome", travelRadiusKm: 15, willingToTravel: true,
    accreditations: ["Cycling Australia Coaching Accreditation", "Working with Children Check"],
    responseTime: "Usually replies within 4 hours", acceptanceRate: 85, repeatClientRate: 52,
    reelsCount: 4,
    packages: [
      { id: "p1", name: "1:1 Coaching Session", type: "1:1", duration: 90, mode: "In-person", price: 80, maxParticipants: 1, active: true },
      { id: "p2", name: "Small Group Ride (max 4)", type: "Group", duration: 90, mode: "In-person", price: 42, maxParticipants: 4, active: true },
    ],
    availability: { Tue: ["16:00"], Thu: ["16:00"], Sat: ["10:00", "13:00"] },
  },
];

export const SPORTS = ["Netball", "CrossFit", "Surfing", "Boxing", "Golf", "Cycling", "Football", "Athletics"];
export const ALL_SUBURBS = [...new Set(COACHES.map((c) => c.suburb))].sort();

/**
 * Suburb → coordinates, derived from the coach directory itself (first coach
 * listed in each suburb). Lets "enter your location manually" resolve a typed
 * suburb to a real point for distance sorting/filtering, without a geocoding API.
 */
export const SUBURB_COORDS = COACHES.reduce((acc, c) => {
  if (!acc[c.suburb]) acc[c.suburb] = { lat: c.lat, lng: c.lng };
  return acc;
}, {});
