export type Station = {
  id: string;
  name: string;
  country?: string | null;
  language?: string | null;
  genres: string[];
  logo_url?: string | null;
  is_active: boolean;
};
export type StationStream = {
  id: string;
  station_id: string;
  url: string;
  format?: string | null;
  bitrate_kbps?: number | null;
  priority: number;
  is_active: boolean;
};
