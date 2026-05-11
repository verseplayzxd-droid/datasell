import AdBanner from './AdBanner';

/**
 * AdZone - Drop-in replacement that now renders real ad banners.
 * Maps the old placeholder props to actual ad network keys.
 */

// Map of ad sizes to their keys
const AD_MAP = {
  '728x90': { key: '137ac60323a46f587ab9c7d2f5bfe5d2', width: 728, height: 90 },
  '300x250': { key: 'a935041c2501b424b15c5b5b6113ae98', width: 300, height: 250 },
  '320x50': { key: '81344be2c74c13c4cc40af361eac118d', width: 320, height: 50 },
  '468x60': { key: '57eb44a0b02710f63520dd7f65f72881', width: 468, height: 60 },
  '160x300': { key: '03636bb437a6a159c1ce8ee22e29393d', width: 160, height: 300 },
  '160x600': { key: '81d579896ec6addd685a03939fa86e5d', width: 160, height: 600 },
};

export default function AdZone({ id, width, height, label, size }) {
  // Try to find a matching ad size
  let adConfig = null;

  if (size && AD_MAP[size]) {
    adConfig = AD_MAP[size];
  } else {
    // Auto-detect from width/height props
    const h = parseInt(height);
    const w = parseInt(width);
    if (h === 90) adConfig = AD_MAP['728x90'];
    else if (h === 250) adConfig = AD_MAP['300x250'];
    else if (h === 50) adConfig = AD_MAP['320x50'];
    else if (h === 60) adConfig = AD_MAP['468x60'];
    else if (h === 300) adConfig = AD_MAP['160x300'];
    else if (h === 600) adConfig = AD_MAP['160x600'];
    else adConfig = AD_MAP['300x250']; // default fallback
  }

  return (
    <div id={id} className="flex items-center justify-center w-full overflow-hidden">
      <AdBanner
        adKey={adConfig.key}
        width={adConfig.width}
        height={adConfig.height}
      />
    </div>
  );
}
