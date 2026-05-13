export type ScannerAreaConfig = {
  slug: string;
  title: string;
  subtitle: string;
  plc: string;
  msgType: "RTREQ";
  source: string;
  sorterIds: number[];
  finalSorterIds: number[];
};

export const scannerAreas: ScannerAreaConfig[] = [
  {
    slug: "level-1",
    title: "Pick to Light - Level 1",
    subtitle: "LUM1 / LUM2",
    plc: "PLC_1",
    msgType: "RTREQ",
    source: "Routing",
    sorterIds: [1, 2, 3, 11, 12, 13, 14, 15, 16, 17, 18],
    finalSorterIds: [2, 3, 11, 12, 13, 14, 15, 16, 17, 18],
  },
];

export function getScannerArea(slug: string) {
  return scannerAreas.find((area) => area.slug === slug);
}
