import type { Match } from "../types.ts";

export const MATCHES: Match[] = [
  // IPL 2024
  {
    id: "ipl24-final",
    tournamentId: "ipl-2024",
    teamA: "kkr",
    teamB: "srh",
    date: "2024-05-26",
    venue: "MA Chidambaram Stadium, Chennai",
    status: "Completed",
    result: "KKR won by 8 wickets",
    scoreA: { runs: 114, wickets: 2, overs: 10.3 },
    scoreB: { runs: 113, wickets: 10, overs: 18.3 }
  },
  {
    id: "ipl24-q1",
    tournamentId: "ipl-2024",
    teamA: "kkr",
    teamB: "srh",
    date: "2024-05-21",
    venue: "Narendra Modi Stadium, Ahmedabad",
    status: "Completed",
    result: "KKR won by 8 wickets",
    scoreA: { runs: 164, wickets: 2, overs: 13.4 },
    scoreB: { runs: 159, wickets: 10, overs: 19.3 }
  },
  {
    id: "ipl24-m1",
    tournamentId: "ipl-2024",
    teamA: "csk",
    teamB: "rcb",
    date: "2024-03-22",
    venue: "MA Chidambaram Stadium, Chennai",
    status: "Completed",
    result: "CSK won by 6 wickets",
    scoreA: { runs: 176, wickets: 4, overs: 18.4 },
    scoreB: { runs: 173, wickets: 6, overs: 20 }
  },

  // T20 WC 2024
  {
    id: "t20wc24-final",
    tournamentId: "t20wc-2024",
    teamA: "ind",
    teamB: "sa",
    date: "2024-06-29",
    venue: "Kensington Oval, Bridgetown, Barbados",
    status: "Completed",
    result: "India won by 7 runs",
    scoreA: { runs: 176, wickets: 7, overs: 20 },
    scoreB: { runs: 169, wickets: 8, overs: 20 }
  },
  {
    id: "t20wc24-sf1",
    tournamentId: "t20wc-2024",
    teamA: "sa",
    teamB: "afg",
    date: "2024-06-26",
    venue: "Brian Lara Stadium, Tarouba, Trinidad",
    status: "Completed",
    result: "South Africa won by 9 wickets",
    scoreA: { runs: 60, wickets: 1, overs: 8.5 },
    scoreB: { runs: 56, wickets: 10, overs: 11.5 }
  },
  {
    id: "t20wc24-sf2",
    tournamentId: "t20wc-2024",
    teamA: "ind",
    teamB: "eng",
    date: "2024-06-27",
    venue: "Providence Stadium, Guyana",
    status: "Completed",
    result: "India won by 68 runs",
    scoreA: { runs: 171, wickets: 7, overs: 20 },
    scoreB: { runs: 103, wickets: 10, overs: 16.4 }
  },

  // WC 2023
  {
    id: "wc23-final",
    tournamentId: "wc-2023",
    teamA: "ind",
    teamB: "aus",
    date: "2023-11-19",
    venue: "Narendra Modi Stadium, Ahmedabad",
    status: "Completed",
    result: "Australia won by 6 wickets",
    scoreA: { runs: 240, wickets: 10, overs: 50 },
    scoreB: { runs: 241, wickets: 4, overs: 43 }
  },
  {
    id: "wc23-sf1",
    tournamentId: "wc-2023",
    teamA: "ind",
    teamB: "nz",
    date: "2023-11-15",
    venue: "Wankhede Stadium, Mumbai",
    status: "Completed",
    result: "India won by 70 runs",
    scoreA: { runs: 397, wickets: 4, overs: 50 },
    scoreB: { runs: 327, wickets: 10, overs: 48.5 }
  },

  // Upcoming
  {
    id: "ct25-m1",
    tournamentId: "ct-2025",
    teamA: "pak",
    teamB: "ind",
    date: "2025-03-01",
    venue: "Gaddafi Stadium, Lahore",
    status: "Upcoming"
  }
];
