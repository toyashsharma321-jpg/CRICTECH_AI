import type { Tournament } from "../types.ts";

export const TOURNAMENTS: Tournament[] = [
  // ICC EVENTS
  {
    id: "wc-2023",
    name: "ICC Cricket World Cup",
    format: "ODI",
    year: 2023,
    teams: ["ind", "aus", "sa", "nz", "pak", "afg", "eng", "ban", "sl", "ned"],
    logo: "https://picsum.photos/seed/wc2023/400/200",
    status: "Completed",
    type: "ICC"
  },
  {
    id: "wc-2019",
    name: "ICC Cricket World Cup",
    format: "ODI",
    year: 2019,
    teams: ["eng", "nz", "ind", "aus"],
    logo: "https://picsum.photos/seed/wc2019/400/200",
    status: "Completed",
    type: "ICC"
  },
  {
    id: "t20wc-2024",
    name: "ICC T20 World Cup",
    format: "T20",
    year: 2024,
    teams: ["ind", "sa", "afg", "eng", "aus", "wi", "usa", "ban"],
    logo: "https://picsum.photos/seed/t20wc2024/400/200",
    status: "Completed",
    type: "ICC"
  },
  {
    id: "t20wc-2022",
    name: "ICC T20 World Cup",
    format: "T20",
    year: 2022,
    teams: ["eng", "pak", "ind", "nz"],
    logo: "https://picsum.photos/seed/t20wc2022/400/200",
    status: "Completed",
    type: "ICC"
  },
  {
    id: "wtc-2023-25",
    name: "ICC World Test Championship",
    format: "Test",
    year: 2025,
    teams: ["ind", "aus", "sa", "nz", "eng", "sl", "pak", "wi", "ban"],
    logo: "https://picsum.photos/seed/wtc25/400/200",
    status: "Ongoing",
    type: "ICC"
  },
  {
    id: "ct-2025",
    name: "ICC Champions Trophy",
    format: "ODI",
    year: 2025,
    teams: ["pak", "ind", "aus", "sa", "nz", "eng", "afg", "ban"],
    logo: "https://picsum.photos/seed/ct25/400/200",
    status: "Upcoming",
    type: "ICC"
  },
  {
    id: "u19wc-2024",
    name: "ICC U19 Cricket World Cup",
    format: "ODI",
    year: 2024,
    teams: ["aus", "ind", "sa", "pak"],
    logo: "https://picsum.photos/seed/u19wc24/400/200",
    status: "Completed",
    type: "ICC"
  },

  // LEAGUES
  {
    id: "ipl-2024",
    name: "Indian Premier League",
    format: "T20",
    year: 2024,
    teams: ["kkr", "srh", "rr", "rcb", "csk", "dc", "lsg", "gt", "pbks", "mi"],
    logo: "https://picsum.photos/seed/ipl2024/400/200",
    status: "Completed",
    type: "League",
    pointsTable: [
      { teamId: "kkr", played: 14, won: 9, lost: 3, nrr: 1.428, points: 20 },
      { teamId: "srh", played: 14, won: 8, lost: 5, nrr: 0.414, points: 17 },
      { teamId: "rr", played: 14, won: 8, lost: 5, nrr: 0.273, points: 17 },
      { teamId: "rcb", played: 14, won: 7, lost: 7, nrr: 0.459, points: 14 },
      { teamId: "csk", played: 14, won: 7, lost: 7, nrr: 0.573, points: 14 }
    ]
  },
  {
    id: "ipl-2023",
    name: "Indian Premier League",
    format: "T20",
    year: 2023,
    teams: ["csk", "gt", "mi", "lsg"],
    logo: "https://picsum.photos/seed/ipl2023/400/200",
    status: "Completed",
    type: "League"
  },
  {
    id: "bbl-13",
    name: "Big Bash League",
    format: "T20",
    year: 2024,
    teams: ["bh", "ss", "ps", "as"],
    logo: "https://picsum.photos/seed/bbl13/400/200",
    status: "Completed",
    type: "League"
  },
  {
    id: "psl-9",
    name: "Pakistan Super League",
    format: "T20",
    year: 2024,
    teams: ["iu", "ms", "pzalmi", "qq"],
    logo: "https://picsum.photos/seed/psl9/400/200",
    status: "Completed",
    type: "League"
  },
  {
    id: "cpl-2024",
    name: "Caribbean Premier League",
    format: "T20",
    year: 2024,
    teams: ["gaw", "slk", "tkr", "br"],
    logo: "https://picsum.photos/seed/cpl24/400/200",
    status: "Ongoing",
    type: "League"
  },
  {
    id: "hundred-2024",
    name: "The Hundred",
    format: "T20",
    year: 2024,
    teams: ["ov", "sb", "ns", "tr"],
    logo: "https://picsum.photos/seed/hundred24/400/200",
    status: "Completed",
    type: "League"
  },
  {
    id: "sa20-2024",
    name: "SA20",
    format: "T20",
    year: 2024,
    teams: ["sec", "dsg", "pr", "jsk"],
    logo: "https://picsum.photos/seed/sa20_24/400/200",
    status: "Completed",
    type: "League"
  },
  {
    id: "ilt20-2024",
    name: "ILT20",
    format: "T20",
    year: 2024,
    teams: ["mi_eme", "dv", "gg", "adkr"],
    logo: "https://picsum.photos/seed/ilt20_24/400/200",
    status: "Completed",
    type: "League"
  }
];
