import type { Team } from "../types.ts";

export const TEAMS: Team[] = [
  // International Teams
  {
    id: "ind",
    name: "India",
    shortName: "IND",
    logo: "https://picsum.photos/seed/india_flag/200/200",
    stats: { played: 1050, won: 560, lost: 440, titles: 2 },
    squad: ["ind-1", "ind-2", "ind-3", "ind-4", "ind-5", "ind-6", "ind-7", "ind-8", "ind-9", "ind-10"]
  },
  {
    id: "aus",
    name: "Australia",
    shortName: "AUS",
    logo: "https://picsum.photos/seed/aus_flag/200/200",
    stats: { played: 1100, won: 620, lost: 430, titles: 6 },
    squad: ["aus-1", "aus-2", "aus-3", "aus-4", "aus-5"]
  },
  {
    id: "eng",
    name: "England",
    shortName: "ENG",
    logo: "https://picsum.photos/seed/eng_flag/200/200",
    stats: { played: 1080, won: 540, lost: 490, titles: 1 },
    squad: ["eng-1", "eng-2", "eng-3"]
  },
  {
    id: "pak",
    name: "Pakistan",
    shortName: "PAK",
    logo: "https://picsum.photos/seed/pak_flag/200/200",
    stats: { played: 980, won: 510, lost: 450, titles: 1 },
    squad: ["pak-1", "pak-2", "pak-3"]
  },
  {
    id: "sa",
    name: "South Africa",
    shortName: "SA",
    logo: "https://picsum.photos/seed/sa_flag/200/200",
    stats: { played: 850, won: 480, lost: 350 },
    squad: ["sa-1", "sa-2"]
  },
  {
    id: "nz",
    name: "New Zealand",
    shortName: "NZ",
    logo: "https://picsum.photos/seed/nz_flag/200/200",
    stats: { played: 820, won: 410, lost: 380 },
    squad: ["nz-1", "nz-2"]
  },
  {
    id: "wi",
    name: "West Indies",
    shortName: "WI",
    logo: "https://picsum.photos/seed/wi_flag/200/200",
    stats: { played: 900, won: 450, lost: 400, titles: 2 },
    squad: []
  },
  {
    id: "sl",
    name: "Sri Lanka",
    shortName: "SL",
    logo: "https://picsum.photos/seed/sl_flag/200/200",
    stats: { played: 880, won: 420, lost: 410, titles: 1 },
    squad: []
  },
  {
    id: "afg",
    name: "Afghanistan",
    shortName: "AFG",
    logo: "https://picsum.photos/seed/afg_flag/200/200",
    stats: { played: 250, won: 120, lost: 125 },
    squad: []
  },
  {
    id: "ban",
    name: "Bangladesh",
    shortName: "BAN",
    logo: "https://picsum.photos/seed/ban_flag/200/200",
    stats: { played: 700, won: 280, lost: 400 },
    squad: []
  },

  // IPL Teams
  {
    id: "kkr",
    name: "Kolkata Knight Riders",
    shortName: "KKR",
    logo: "https://picsum.photos/seed/kkr/200/200",
    stats: { played: 252, won: 131, lost: 117, titles: 3 },
    squad: ["kkr-1", "kkr-2", "kkr-3"]
  },
  {
    id: "srh",
    name: "Sunrisers Hyderabad",
    shortName: "SRH",
    logo: "https://picsum.photos/seed/srh/200/200",
    stats: { played: 180, won: 85, lost: 92, titles: 1 },
    squad: ["srh-1", "srh-2"]
  },
  {
    id: "csk",
    name: "Chennai Super Kings",
    shortName: "CSK",
    logo: "https://picsum.photos/seed/csk/200/200",
    stats: { played: 240, won: 135, lost: 100, titles: 5 },
    squad: ["csk-1", "csk-2", "csk-3"]
  },
  {
    id: "mi",
    name: "Mumbai Indians",
    shortName: "MI",
    logo: "https://picsum.photos/seed/mi/200/200",
    stats: { played: 250, won: 140, lost: 105, titles: 5 },
    squad: ["mi-1", "mi-2"]
  },
  {
    id: "rcb",
    name: "Royal Challengers Bengaluru",
    shortName: "RCB",
    logo: "https://picsum.photos/seed/rcb/200/200",
    stats: { played: 253, won: 114, lost: 135 },
    squad: ["rcb-1", "rcb-2"]
  },
  {
    id: "gt",
    name: "Gujarat Titans",
    shortName: "GT",
    logo: "https://picsum.photos/seed/gt/200/200",
    stats: { played: 45, won: 30, lost: 15, titles: 1 },
    squad: []
  },

  // BBL Teams
  {
    id: "bh",
    name: "Brisbane Heat",
    shortName: "BH",
    logo: "https://picsum.photos/seed/heat/200/200",
    stats: { played: 150, won: 75, lost: 72, titles: 2 },
    squad: ["bh-1"]
  },
  {
    id: "ss",
    name: "Sydney Sixers",
    shortName: "SS",
    logo: "https://picsum.photos/seed/sixers/200/200",
    stats: { played: 160, won: 95, lost: 62, titles: 3 },
    squad: ["ss-1"]
  }
];
