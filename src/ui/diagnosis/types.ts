export type ResultRow = {
  rating: 'S' | 'A' | 'B' | 'C' | 'D';
  number: number;
  horseName: string;
  reason: string;
};

export type DiagnosisPayload = {
  raceInfo: {
    date: string;
    course: string;
    raceName: string;
    trackType: string;
    distance: string;
    courseDirection: string;
    trackConfig: string | null;
    trackCondition: string;
    expectedPace: string | null;
  };
  entries: Array<{
    frame: number | '';
    number: number | '';
    horseName: string;
    horseCardId: string | null;
    horseInfo: {
      sire: string | null;
      dam: string | null;
      damSire: string | null;
      offspringNames: string[];
    } | null;
    recentRaces: Array<{
      finish: string;
      distance: string;
      track: string;
      pace: string;
      cornerPassage: string;
      raceClass: string;
    }>;
  }>;
};
