/**
 * Real product photos, keyed by SKU and sourced from Unsplash (verified,
 * license-free CDN URLs). Not every seeded SKU has a confirmed real-world
 * match; anything missing here falls back to the generated placeholder tile
 * in ProductThumbnail, so an unmatched product never breaks the layout.
 */
const UNSPLASH_IDS: Record<string, string> = {
  'ELEC-KBD-001': '1520092352425-9699926a9b0b',
  'ELEC-MON-002': '1708024632566-e5f271f12b83',
  'ELEC-HPH-003': '1761120359417-e7b609cef1ca',
  'ELEC-DOK-004': '1604005366359-2f8f2a044336',
  'ELEC-MOU-005': '1750767303635-4df246680549',
  'ELEC-CAM-006': '1722405375190-8d0b2a765840',
  'ELEC-SSD-007': '1518547606470-00ac2ae882af',
  'ELEC-LMP-008': '1564540574859-0dfb63985953',
  'OFF-PPR-001': '1516409590654-e8d51fc2d25c',
  'OFF-PEN-002': '1557154683-264bf969e849',
  'OFF-STN-003': '1542626991-cbc4e32524cc',
  'OFF-STP-004': '1562966700-49bb28f1c62d',
  'OFF-MRK-005': '1557154683-264bf969e849',
  'FUR-CHR-001': '1688578735352-9a6f2ac3b70a',
  'FUR-CAB-003': '1564878839714-5a11033df53a',
  'FUR-SHF-004': '1554625170-a99bf5e957c9',
  'FUR-TBL-005': '1676277755239-c160872ccca3',
  'FUR-CHR-006': '1688578735352-9a6f2ac3b70a',
}

export function getProductImageUrl(sku: string, width: number): string | null {
  const id = UNSPLASH_IDS[sku]
  if (!id) return null
  return `https://images.unsplash.com/photo-${id}?w=${width}&q=75&auto=format&fit=crop`
}
