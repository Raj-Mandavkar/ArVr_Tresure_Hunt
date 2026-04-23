export type TreasureStep = {
  id: string; // The expected QR code content
  targetName: string; // Friendly name of the target
  clueToFindThis: string; // The clue shown BEFORE they find this marker
  successMessage: string; // Message shown when they find it
  arObject: 'map' | 'key' | 'chest'; // Which virtual element to show when found
};

export const TREASURE_HUNT_STEPS: TreasureStep[] = [
  {
    id: "START-TH",
    targetName: "Starting Code",
    clueToFindThis: "Find the 'Starting Code' to begin your adventure!",
    successMessage: "Welcome Explorer! Your first real clue awaits.",
    arObject: "map"
  },
  {
    id: "LIBRARY-TH",
    targetName: "The Ancient Library",
    clueToFindThis: "Seek the place where pages whisper and knowledge sleeps...",
    successMessage: "You found the Library! A hidden key drops from an old book.",
    arObject: "key"
  },
  {
    id: "TREASURE-TH",
    targetName: "The Hidden Vault",
    clueToFindThis: "Take the key to the iron gate at the highest point of the map...",
    successMessage: "You've unlocked the ultimate treasure!",
    arObject: "chest"
  }
];
