const amountMap: { [key: string]: [number, number, number] } = {
  '4k': [64, 64, 0.29],
  '8k': [128, 64, 0.42],
  '16k': [128, 128, 0.48],
  '32k': [256, 128, 0.55],
  '65k': [256, 256, 0.6],
  '131k': [512, 256, 0.85],
  '252k': [512, 512, 1.2],
  '524k': [1024, 512, 1.4],
  '1m': [1024, 1024, 1.6],
  '2m': [2048, 1024, 2],
  '4m': [2048, 2048, 2.5],
};

export const amountList = Object.keys(amountMap);

// Initialize amount - will be updated from query params on client
let amount = '65k';

// Function to update amount from query params (call after hydration)
function updateAmountFromQuery() {
  if (typeof window !== 'undefined') {
    const query = new URLSearchParams(window.location.href.split('?')[1] || '');
    const queryAmount = query.get('amount');
    if (queryAmount && amountMap[queryAmount]) {
      amount = queryAmount;
      updateSettingsFromAmount();
    }
  }
}

function updateSettingsFromAmount() {
  const amountInfo = amountMap[amount];
  settings.simulatorTextureWidth = amountInfo[0];
  settings.simulatorTextureHeight = amountInfo[1];
}

const amountInfo = amountMap[amount];

// Mutable settings object (matching original pattern)
// Use const object with mutable properties instead of export let
export const settings = {
  simulatorTextureWidth: amountInfo[0],
  simulatorTextureHeight: amountInfo[1],
  useStats: false,
  useBillboardParticle: false,
  lightSpeed: 0,
  bloomOpacity: 0.45,
  particlesDropRadius: 20,
  particlesFromY: 300,
  particlesYDynamicRange: 300,
  handBounceRatio: 0.1,
  handForce: 0.015,
  gravity: 10,
  hands: 1,
  fxaa: false,
  motionBlur: true,
  motionBlurPause: false,
  bloom: false,
  vignette: false,
  vignetteMultiplier: 0.8,
};

export const motionBlurQualityMap: { [key: string]: number } = {
  best: 1,
  high: 0.5,
  medium: 1 / 3,
  low: 0.25,
};
export const motionBlurQualityList = Object.keys(motionBlurQualityMap);

// Export function to initialize from query params after hydration
export { updateAmountFromQuery };
