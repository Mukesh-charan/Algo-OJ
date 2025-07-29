export interface Submission {
    problemId: string;
    contestId: string;
    points: number;
    status: string;
    submissionTime: string | Date;
    runTime: string;
    userId: string;
    userName: string;
    problemName: string;
    uuid: string;
  }
  
  export interface LeaderboardEntry {
    username: string;
    totalScore: number;
    percentile: number;
  }
  
  export interface Contest {
    id: string;
    problems: string[];
  }
  
  // Calculate leaderboard for a contest
  export function calculateLeaderboard(
    submissions: Submission[],
    contestProblemIds: string[]
  ): LeaderboardEntry[] {
    // Filter submissions for present contest problems
    const filteredSubs = submissions.filter((sub) =>
      contestProblemIds.includes(sub.problemId)
    );
  
    // userId -> problemId -> earliest accepted submission
    const userProblemMap: Record<string, Record<string, Submission>> = {};
    // problemId -> list of accepted submissions for percentile
    const problemSubmissionsMap: Record<string, Submission[]> = {};
  
    // Fill userProblemMap with earliest "Accepted" submissions per user+problem
    for (const sub of filteredSubs) {
      if (sub.status !== "Accepted") continue;
  
      if (!userProblemMap[sub.userId]) userProblemMap[sub.userId] = {};
      const existingSub = userProblemMap[sub.userId][sub.problemId];
  
      const subTime = new Date(sub.submissionTime).getTime();
      const existingTime = existingSub
        ? new Date(existingSub.submissionTime).getTime()
        : Number.POSITIVE_INFINITY;
  
      if (!existingSub || subTime < existingTime) {
        userProblemMap[sub.userId][sub.problemId] = sub;
      }
    }
  
    // Build problemSubmissionsMap from userProblemMap
    for (const userId in userProblemMap) {
      for (const problemId in userProblemMap[userId]) {
        const sub = userProblemMap[userId][problemId];
        if (!problemSubmissionsMap[problemId]) problemSubmissionsMap[problemId] = [];
        problemSubmissionsMap[problemId].push(sub);
      }
    }
  
    // Calculate percentile per problem
    const problemTimePercentiles: Record<string, Record<string, number>> = {};
    for (const problemId in problemSubmissionsMap) {
      const subs = problemSubmissionsMap[problemId];
      const sortedTimes = subs
        .map((s) => new Date(s.submissionTime).getTime())
        .sort((a, b) => a - b);
  
      problemTimePercentiles[problemId] = {};
  
      for (const sub of subs) {
        const t = new Date(sub.submissionTime).getTime();
  
        let percentile = 0;
        if (sortedTimes.length === 1) {
          percentile = 100;
        } else {
          // Find index of this time (first occurrence, ascending)
          const rank = sortedTimes.findIndex((time) => time === t);
          percentile = ((sortedTimes.length - rank - 1) / (sortedTimes.length - 1)) * 100;
        }
  
        problemTimePercentiles[problemId][sub.userId] = parseFloat(percentile.toFixed(2));
      }
    }
  
    // Build leaderboard
    const leaderboard: LeaderboardEntry[] = [];
  
    for (const userId in userProblemMap) {
      const solvedSubs = Object.values(userProblemMap[userId]);
      const totalScore = solvedSubs.reduce((acc, sub) => acc + (sub.points || 0), 0);
      // Use userName from any solved sub, or "Unknown"
      const username = solvedSubs[0]?.userName || "Unknown";
  
      const avgPercentile =
        solvedSubs.length === 0
          ? 0
          : parseFloat(
              (
                solvedSubs.reduce(
                  (acc, sub) => acc + (problemTimePercentiles[sub.problemId]?.[userId] ?? 0),
                  0
                ) / solvedSubs.length
              ).toFixed(2)
            );
  
      leaderboard.push({
        username,
        totalScore,
        percentile: avgPercentile,
      });
    }
  
    leaderboard.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return b.percentile - a.percentile;
    });
  
    return leaderboard;
  }
  
  /**
   * Calculates leaderboards grouped by contest.
   */
  export function calculateLeaderboards(
    submissions: Submission[],
    contests: Contest[]
  ): Record<string, LeaderboardEntry[]> {
    const leaderboards: Record<string, LeaderboardEntry[]> = {};
  
    for (const contest of contests) {
      if (!Array.isArray(contest.problems)) {
        leaderboards[contest.id] = [];
        continue;
      }
      leaderboards[contest.id] = calculateLeaderboard(submissions, contest.problems);
    }
    return leaderboards;
  }
  
  /**
   * Filter submissions by contest ID.
   */
  export function filterSubmissionsByContestId(
    submissions: Submission[],
    contestId: string
  ): Submission[] {
    return submissions.filter((sub) => sub.contestId === contestId);
  }
  