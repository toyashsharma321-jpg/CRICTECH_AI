export interface Delivery {
  id: string;
  startTime: number; // seconds in the video
  timestamp: number;
  speed: number;
  type: 'Short' | 'Full' | 'Yorker' | 'Good Length';
  outcome: 'Dot' | 'Single' | 'Four' | 'Six' | 'Wicket';
  trajectory: { x: number; y: number }[];
  trajectory3D: { x: number; y: number; z: number }[];
  bouncePoint?: { x: number; y: number };
  hitPoint?: { x: number; y: number };
  isWide: boolean;
  isNoBall: boolean;
  movement: { swing: number; spin: number };
  events: {
    release: number; // seconds relative to delivery start
    bounce: number;
    impact: number;
  };
  batsmanAnalysis: {
    style: string;
    shotType: 'Front Foot' | 'Back Foot' | 'Step Out' | 'None';
    goodShotArea: string;
    hittingArea: string;
    weakArea: string;
  };
  batsman?: {
    id: string;
    name: string;
    img: string;
  };
}

export interface AnalysisResults {
  deliveries: Delivery[];
  summary: {
    totalDeliveries: number;
    avgSpeed: number;
    topSpeed: number;
    weakness: string;
    insights: string[];
    overCount: number;
    currentOverBalls: number;
  };
}

export interface Player {
  id: string;
  name: string;
  team: string;
  role: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';
  battingStyle: 'Right-handed' | 'Left-handed';
  bowlingStyle?: string;
  stats: {
    matches: number;
    runs?: number;
    wickets?: number;
    avg?: number;
    sr?: number;
    econ?: number;
  };
  img: string;
  isFeatured?: boolean;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  shortName: string;
  stats: {
    played: number;
    won: number;
    lost: number;
    titles?: number;
  };
  squad: string[]; // Array of player IDs
}

export interface Tournament {
  id: string;
  name: string;
  format: 'T20' | 'ODI' | 'Test';
  year: number;
  teams: string[]; // Array of team IDs
  logo: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  type: 'ICC' | 'League';
  pointsTable?: {
    teamId: string;
    played: number;
    won: number;
    lost: number;
    nrr: number;
    points: number;
  }[];
}

export interface Match {
  id: string;
  tournamentId: string;
  teamA: string; // Team ID
  teamB: string; // Team ID
  date: string;
  venue: string;
  status: 'Upcoming' | 'Live' | 'Completed';
  result?: string;
  scoreA?: {
    runs: number;
    wickets: number;
    overs: number;
  };
  scoreB?: {
    runs: number;
    wickets: number;
    overs: number;
  };
}
