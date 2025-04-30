export type CheckResult = {
  id: string;
  video_path: string;
  source: string | null;
  url: string | null;
  services: {
    name: string;
    result: "pass" | "risky" | "error";
    details: string;
  }[];
  checked_at: string;
}

export type HistoryPageItem = {
  id: string;
  videoUrl: string;
  source: string | null;
  url: string | null;
  services: {
    name: string;
    result: "pass" | "risky" | "error";
    status: "pass" | "risky" | "error" | "unknown";
    details: any;
  }[];
  checkedAt: string;
}
