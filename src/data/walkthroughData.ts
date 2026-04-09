// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import type { WalkthroughChapter } from "../lib/encyclopedia-schema";

// Factual game progression data: gym order, story milestones, key battles, and recommended levels.

export const walkthroughs: Record<string, WalkthroughChapter[]> = {
  "game:red-blue": [
    {
      title: "Kanto Gym Challenge",
      steps: [
        { title: "Pallet Town to Pewter City", summary: "Receive your starter from Professor Oak, travel through Route 1, and reach Viridian City. Head north through Viridian Forest to Pewter City.", recommendedLevel: 12, keyBattles: ["Rival battle (Route 22)"], tips: ["Catch a Pikachu in Viridian Forest for an advantage against Misty later", "Butterfree learns Confusion early and helps against Brock if you chose Charmander"] },
        { title: "Gym 1: Brock (Rock)", summary: "Pewter City Gym. Brock uses Geodude (Lv12) and Onix (Lv14). Water and Grass moves are super effective.", recommendedLevel: 14, keyBattles: ["Brock (Boulder Badge)"], tips: ["Squirtle or Bulbasaur make this fight straightforward", "Butterfree's Confusion works well here"] },
        { title: "Mt. Moon to Cerulean City", summary: "Travel through Route 3 and Mt. Moon. Battle Team Rocket for the first time. Arrive in Cerulean City.", recommendedLevel: 18, keyBattles: ["Team Rocket Grunt (Mt. Moon)", "Rival battle (Cerulean City)"] },
        { title: "Gym 2: Misty (Water)", summary: "Cerulean City Gym. Misty uses Staryu (Lv18) and Starmie (Lv21). Electric and Grass moves are super effective.", recommendedLevel: 21, keyBattles: ["Misty (Cascade Badge)"], tips: ["Pikachu from Viridian Forest or Bulbasaur handle this well", "Starmie is very fast; be prepared for its BubbleBeam"] },
        { title: "S.S. Anne and Vermilion City", summary: "Travel south through Routes 5-6 to Vermilion City. Board the S.S. Anne, defeat the rival, and obtain HM01 Cut from the Captain.", recommendedLevel: 24, keyBattles: ["Rival battle (S.S. Anne)"] },
        { title: "Gym 3: Lt. Surge (Electric)", summary: "Vermilion City Gym. Solve the trash can switch puzzle. Lt. Surge uses Voltorb (Lv21), Pikachu (Lv18), and Raichu (Lv24). Ground moves are super effective.", recommendedLevel: 25, keyBattles: ["Lt. Surge (Thunder Badge)"], tips: ["Diglett from Diglett's Cave (Route 11) makes this trivial"] },
        { title: "Rock Tunnel to Lavender Town", summary: "Travel east through Route 9 and Rock Tunnel (bring Flash). Arrive in Lavender Town, but you cannot clear Pokemon Tower yet.", recommendedLevel: 28 },
        { title: "Celadon City", summary: "Head west to Celadon City. Obtain the Silph Scope by infiltrating the Rocket Game Corner hideout.", recommendedLevel: 30, keyBattles: ["Giovanni (Rocket Hideout)"], tips: ["Buy drinks from the rooftop vending machine to pass Saffron City guards", "Get Eevee from the back entrance of Celadon Mansion"] },
        { title: "Gym 4: Erika (Grass)", summary: "Celadon City Gym. Erika uses Victreebel (Lv29), Tangela (Lv24), and Vileplume (Lv29). Fire, Ice, and Flying moves are super effective.", recommendedLevel: 30, keyBattles: ["Erika (Rainbow Badge)"] },
        { title: "Pokemon Tower", summary: "Return to Lavender Town with the Silph Scope. Climb Pokemon Tower, defeat the Marowak ghost and Team Rocket. Rescue Mr. Fuji and receive the Poke Flute.", recommendedLevel: 32, keyBattles: ["Rival battle (Pokemon Tower)", "Marowak ghost"] },
        { title: "Gym 5: Koga (Poison)", summary: "Fuchsia City Gym. Navigate the invisible walls. Koga uses Koffing (Lv37), Muk (Lv39), Koffing (Lv37), and Weezing (Lv43). Psychic and Ground moves are super effective.", recommendedLevel: 40, keyBattles: ["Koga (Soul Badge)"], tips: ["Bring Antidotes or a Psychic-type to avoid Toxic stalling"] },
        { title: "Silph Co.", summary: "Clear the Silph Co. building in Saffron City. Battle Giovanni again and your rival. Receive the Master Ball from the Silph Co. President.", recommendedLevel: 38, keyBattles: ["Rival battle (Silph Co.)", "Giovanni (Silph Co.)"] },
        { title: "Gym 6: Sabrina (Psychic)", summary: "Saffron City Gym. Navigate the warp tile puzzle. Sabrina uses Kadabra (Lv38), Mr. Mime (Lv37), Venomoth (Lv38), and Alakazam (Lv43). Bug moves work, but Psychic is dominant in Gen 1.", recommendedLevel: 43, keyBattles: ["Sabrina (Marsh Badge)"], tips: ["In Gen 1, Ghost moves don't work well against Psychic due to a bug; use high-Attack Pokemon instead"] },
        { title: "Gym 7: Blaine (Fire)", summary: "Cinnabar Island Gym. Answer quiz questions to skip trainer battles. Blaine uses Growlithe (Lv42), Ponyta (Lv40), Rapidash (Lv42), and Arcanine (Lv47). Water and Ground moves are super effective.", recommendedLevel: 45, keyBattles: ["Blaine (Volcano Badge)"], tips: ["Surf user handles this gym easily"] },
        { title: "Gym 8: Giovanni (Ground)", summary: "Viridian City Gym. Giovanni uses Rhyhorn (Lv45), Dugtrio (Lv42), Nidoqueen (Lv44), Nidoking (Lv45), and Rhydon (Lv50). Water and Grass moves are super effective.", recommendedLevel: 48, keyBattles: ["Giovanni (Earth Badge)"], tips: ["Water moves wreck this team; Surf and Ice Beam coverage is ideal"] },
      ],
    },
    {
      title: "Pokemon League",
      steps: [
        { title: "Victory Road", summary: "Navigate Victory Road's strength puzzles. The cave is full of strong wild Pokemon and trainers.", recommendedLevel: 50, tips: ["Stock up on Revives and Full Restores at the Indigo Plateau Poke Mart"] },
        { title: "Elite Four: Lorelei (Ice)", summary: "Lorelei leads with Dewgong (Lv54) and features Cloyster, Slowbro, Jynx, and Lapras. Electric and Fighting moves help.", recommendedLevel: 55, keyBattles: ["Lorelei"] },
        { title: "Elite Four: Bruno (Fighting)", summary: "Bruno uses two Onix, Hitmonchan, Hitmonlee, and Machamp. Psychic and Water moves dominate.", recommendedLevel: 55, keyBattles: ["Bruno"] },
        { title: "Elite Four: Agatha (Ghost)", summary: "Agatha uses Gengar (x2), Golbat, Haunter, and Arbok. Psychic moves are the best counter.", recommendedLevel: 56, keyBattles: ["Agatha"] },
        { title: "Elite Four: Lance (Dragon)", summary: "Lance features Gyarados, two Dragonair, Aerodactyl, and Dragonite. Ice moves are extremely effective.", recommendedLevel: 58, keyBattles: ["Lance"] },
        { title: "Champion: Rival", summary: "Your rival's team depends on your starter choice. His ace is the starter with a type advantage over yours at Lv65.", recommendedLevel: 60, keyBattles: ["Champion"], tips: ["Bring a diverse team with Ice, Electric, Water, and Psychic coverage"] },
      ],
    },
  ],

  "game:gold-silver": [
    {
      title: "Johto Gym Challenge",
      steps: [
        { title: "New Bark Town to Violet City", summary: "Receive your starter from Professor Elm. Complete the errand to Mr. Pokemon's house and encounter your rival. Travel through Route 29-31 to Violet City.", recommendedLevel: 10, keyBattles: ["Rival battle (Cherrygrove City)"], tips: ["Cyndaquil has the easiest early game; Totodile is strong overall", "Catch a Mareep on Route 32 for Electric coverage"] },
        { title: "Gym 1: Falkner (Flying)", summary: "Violet City Gym. Falkner uses Pidgey (Lv7) and Pidgeotto (Lv9). Electric and Rock moves are super effective.", recommendedLevel: 12, keyBattles: ["Falkner (Zephyr Badge)"], tips: ["Geodude from Dark Cave or Mareep from Route 32 help here"] },
        { title: "Gym 2: Bugsy (Bug)", summary: "Azalea Town Gym. First clear the Slowpoke Well of Team Rocket. Bugsy uses Metapod (Lv14), Kakuna (Lv14), and Scyther (Lv16). Fire and Rock moves are super effective.", recommendedLevel: 17, keyBattles: ["Team Rocket (Slowpoke Well)", "Bugsy (Hive Badge)"], tips: ["Scyther's Fury Cutter gets stronger each turn; don't let it stack"] },
        { title: "Gym 3: Whitney (Normal)", summary: "Goldenrod City Gym. Whitney uses Clefairy (Lv18) and Miltank (Lv20). Miltank's Rollout is devastating. Fighting moves are super effective.", recommendedLevel: 22, keyBattles: ["Whitney (Plain Badge)"], tips: ["Trade Drowzee for Machop in Goldenrod Department Store", "Geodude resists Rollout well", "Female Pokemon avoid Miltank's Attract"] },
        { title: "Gym 4: Morty (Ghost)", summary: "Ecruteak City Gym. Navigate the dark floor. Morty uses Gastly (Lv21), Haunter (Lv21), Gengar (Lv25), and Haunter (Lv23). Normal and Fighting moves don't work.", recommendedLevel: 26, keyBattles: ["Rival battle (Burned Tower)", "Morty (Fog Badge)"], tips: ["A Normal-type with Foresight, or a Dark-type Pokemon, makes this easier"] },
        { title: "Gym 5: Chuck (Fighting)", summary: "Cianwood City Gym. Surf west from Olivine City. Chuck uses Primeape (Lv27) and Poliwrath (Lv30). Psychic and Flying moves are super effective.", recommendedLevel: 30, keyBattles: ["Chuck (Storm Badge)"], tips: ["Get the SecretPotion from the pharmacy for Olivine's Ampharos"] },
        { title: "Gym 6: Jasmine (Steel)", summary: "Olivine City Gym. Deliver the SecretPotion to the Lighthouse Ampharos first. Jasmine uses two Magnemite (Lv30) and Steelix (Lv35). Fire and Ground moves are super effective.", recommendedLevel: 33, keyBattles: ["Jasmine (Mineral Badge)"], tips: ["Steelix is bulky; Fire Punch or Earthquake work well"] },
        { title: "Gym 7: Pryce (Ice)", summary: "Mahogany Town Gym. First clear the Team Rocket HQ at the Lake of Rage. Pryce uses Seel (Lv27), Dewgong (Lv29), and Piloswine (Lv31). Fire and Fighting moves are super effective.", recommendedLevel: 33, keyBattles: ["Red Gyarados (Lake of Rage)", "Team Rocket HQ", "Pryce (Glacier Badge)"] },
        { title: "Radio Tower Takeover", summary: "Team Rocket takes over the Goldenrod Radio Tower. Infiltrate the tower and underground warehouse to defeat Team Rocket's leadership.", recommendedLevel: 35, keyBattles: ["Team Rocket Executives", "Rival battle (Goldenrod Underground)"] },
        { title: "Gym 8: Clair (Dragon)", summary: "Blackthorn City Gym. Navigate the lava floor puzzle. Clair uses three Dragonair (Lv37-37) and Kingdra (Lv40). Ice moves are key, but Kingdra only has Dragon weakness.", recommendedLevel: 40, keyBattles: ["Clair (Rising Badge)"], tips: ["After winning, you must pass the Dragon's Den shrine test before receiving the badge"] },
      ],
    },
    {
      title: "Pokemon League",
      steps: [
        { title: "Victory Road", summary: "Navigate Victory Road east of New Bark Town via Route 26-27.", recommendedLevel: 42 },
        { title: "Elite Four: Will (Psychic)", summary: "Will uses Xatu (Lv40, Lv42), Exeggutor (Lv41), Slowbro (Lv41), and Jynx (Lv41). Dark and Bug moves help.", recommendedLevel: 43, keyBattles: ["Will"] },
        { title: "Elite Four: Koga (Poison)", summary: "Koga uses Ariados (Lv40), Forretress (Lv43), Muk (Lv42), Venomoth (Lv41), and Crobat (Lv44). Psychic and Ground moves work.", recommendedLevel: 44, keyBattles: ["Koga"] },
        { title: "Elite Four: Bruno (Fighting)", summary: "Bruno uses Hitmontop (Lv42), Hitmonlee (Lv42), Hitmonchan (Lv42), Onix (Lv43), and Machamp (Lv46). Psychic and Flying moves dominate.", recommendedLevel: 45, keyBattles: ["Bruno"] },
        { title: "Elite Four: Karen (Dark)", summary: "Karen uses Umbreon (Lv42), Vileplume (Lv42), Gengar (Lv45), Murkrow (Lv44), and Houndoom (Lv47). Fighting and Bug moves are useful.", recommendedLevel: 47, keyBattles: ["Karen"] },
        { title: "Champion: Lance", summary: "Lance uses three Dragonite (Lv47, Lv47, Lv50), Gyarados (Lv44), Charizard (Lv46), and Aerodactyl (Lv46). Ice moves are essential.", recommendedLevel: 50, keyBattles: ["Champion Lance"], tips: ["Ice Beam or Blizzard can sweep most of his team"] },
      ],
    },
    {
      title: "Kanto Postgame",
      steps: [
        { title: "Kanto Gym Leaders", summary: "Travel to Kanto and defeat all 8 Kanto Gym Leaders: Lt. Surge, Sabrina, Erika, Janine, Misty, Brock, Blaine, and Blue. Their teams are in the Lv42-58 range.", recommendedLevel: 55, keyBattles: ["Lt. Surge", "Sabrina", "Erika", "Janine", "Misty", "Brock", "Blaine", "Blue"] },
        { title: "Mt. Silver: Red", summary: "After collecting all 16 badges, gain access to Mt. Silver. Battle the original protagonist Red at the summit. His team includes Pikachu (Lv81), Espeon (Lv73), Snorlax (Lv75), Venusaur (Lv77), Charizard (Lv77), and Blastoise (Lv77).", recommendedLevel: 70, keyBattles: ["Red"], tips: ["This is the hardest battle in the game; bring your best team with diverse coverage", "Sandstorm or Hail can chip away at his bulky Pokemon"] },
      ],
    },
  ],

  "game:ruby-sapphire": [
    {
      title: "Hoenn Gym Challenge",
      steps: [
        { title: "Littleroot Town to Rustboro City", summary: "Save Professor Birch and receive your starter. Help Wally catch a Ralts. Travel through Petalburg Woods to Rustboro City.", recommendedLevel: 14, keyBattles: ["Rival battle (Route 103)"], tips: ["Mudkip has the best overall matchup against Hoenn's gyms", "Catch Taillow or Wingull early for Fly utility"] },
        { title: "Gym 1: Roxanne (Rock)", summary: "Rustboro City Gym. Roxanne uses Geodude (Lv12) and Nosepass (Lv15). Water, Grass, and Fighting are super effective.", recommendedLevel: 15, keyBattles: ["Roxanne (Stone Badge)"] },
        { title: "Gym 2: Brawly (Fighting)", summary: "Dewford Town Gym. Dark gym with limited visibility. Brawly uses Machop (Lv16) and Makuhita (Lv19). Flying and Psychic moves work.", recommendedLevel: 19, keyBattles: ["Brawly (Knuckle Badge)"] },
        { title: "Gym 3: Wattson (Electric)", summary: "Mauville City Gym. Wattson uses Voltorb (Lv20), Electrike (Lv20), Magneton (Lv22), and Manectric (Lv24). Ground moves are super effective.", recommendedLevel: 24, keyBattles: ["Wattson (Dynamo Badge)"], tips: ["Marshtomp (Ground/Water) makes this trivial"] },
        { title: "Gym 4: Flannery (Fire)", summary: "Lavaridge Town Gym. Navigate the hot springs trapdoors. Flannery uses Numel (Lv24), Slugma (Lv24), Camerupt (Lv26), and Torkoal (Lv29). Water and Ground moves are super effective.", recommendedLevel: 29, keyBattles: ["Flannery (Heat Badge)"] },
        { title: "Gym 5: Norman (Normal)", summary: "Petalburg City Gym. Your father's gym. Norman uses Spinda (Lv27), Vigoroth (Lv27), Linoone (Lv29), and Slaking (Lv31). Fighting moves are super effective.", recommendedLevel: 31, keyBattles: ["Norman (Balance Badge)"], tips: ["Slaking has Truant ability; attack on its loafing turns", "Receive HM03 Surf after winning"] },
        { title: "Gym 6: Winona (Flying)", summary: "Fortree City Gym. Use the Devon Scope to clear the invisible Kecleon. Winona uses Swablu (Lv29), Tropius (Lv29), Pelipper (Lv30), Skarmory (Lv31), and Altaria (Lv33). Electric and Ice moves are super effective.", recommendedLevel: 33, keyBattles: ["Winona (Feather Badge)"] },
        { title: "Gym 7: Tate & Liza (Psychic)", summary: "Mossdeep City Gym. Double battle. Tate & Liza use Claydol (Lv41) and Xatu (Lv41) in RS. Dark and Ghost moves are effective.", recommendedLevel: 42, keyBattles: ["Tate & Liza (Mind Badge)"], tips: ["This is a Double Battle; bring Pokemon that complement each other"] },
        { title: "Team Aqua/Magma Climax", summary: "Depending on your version, stop Team Aqua (Sapphire) or Team Magma (Ruby) from awakening Kyogre/Groudon. Encounter the legendary at the Cave of Origin in Sootopolis City.", recommendedLevel: 45, keyBattles: ["Team Leader (Seafloor Cavern)", "Kyogre/Groudon (Cave of Origin)"] },
        { title: "Gym 8: Wallace/Juan (Water)", summary: "Sootopolis City Gym. Navigate the ice floor puzzle. The leader uses Water-types around Lv40-46. Electric and Grass moves are super effective.", recommendedLevel: 46, keyBattles: ["Wallace (Rain Badge)"], tips: ["Ludicolo or Manectric are great counters"] },
      ],
    },
    {
      title: "Pokemon League",
      steps: [
        { title: "Victory Road", summary: "Navigate Victory Road from Ever Grande City. Use Waterfall, Strength, and Flash.", recommendedLevel: 48 },
        { title: "Elite Four: Sidney (Dark)", summary: "Sidney uses Mightyena (Lv46), Shiftry (Lv48), Cacturne (Lv46), Crawdaunt (Lv48), and Absol (Lv49). Fighting and Bug moves work.", recommendedLevel: 50, keyBattles: ["Sidney"] },
        { title: "Elite Four: Phoebe (Ghost)", summary: "Phoebe uses two Dusclops (Lv48, Lv51), two Banette (Lv49), and Sableye (Lv50). Dark moves are best.", recommendedLevel: 51, keyBattles: ["Phoebe"] },
        { title: "Elite Four: Glacia (Ice)", summary: "Glacia uses two Glalie (Lv50, Lv52), two Sealeo (Lv50), and Walrein (Lv53). Fire, Fighting, and Rock moves work.", recommendedLevel: 53, keyBattles: ["Glacia"] },
        { title: "Elite Four: Drake (Dragon)", summary: "Drake uses Shelgon (Lv52), Altaria (Lv54), Flygon (Lv53), Flygon (Lv53), and Salamence (Lv55). Ice moves are essential.", recommendedLevel: 55, keyBattles: ["Drake"] },
        { title: "Champion: Steven/Wallace", summary: "Steven (Ruby/Sapphire) uses a Steel-heavy team anchored by Metagross (Lv58). Bring Fire, Ground, and Water coverage.", recommendedLevel: 58, keyBattles: ["Champion"], tips: ["Steven's Metagross is extremely bulky; Earthquake or Fire Blast are your best options"] },
      ],
    },
  ],

  "game:diamond-pearl": [
    {
      title: "Sinnoh Gym Challenge",
      steps: [
        { title: "Twinleaf Town to Oreburgh City", summary: "Receive your starter from Professor Rowan at Lake Verity. Travel through Jubilife City and Route 203 to Oreburgh City.", recommendedLevel: 14, keyBattles: ["Rival battle (Route 203)"], tips: ["Chimchar is the only Fire-type line available until postgame without trading", "Starly evolves into the excellent Staraptor"] },
        { title: "Gym 1: Roark (Rock)", summary: "Oreburgh City Gym. Roark uses Geodude (Lv12), Onix (Lv12), and Cranidos (Lv14). Water, Grass, and Fighting are super effective.", recommendedLevel: 15, keyBattles: ["Roark (Coal Badge)"], tips: ["Cranidos hits hard but is fragile; use a Fighting or Water move"] },
        { title: "Gym 2: Gardenia (Grass)", summary: "Eterna City Gym. Clear the Team Galactic Eterna Building first. Gardenia uses Turtwig (Lv19), Cherrim (Lv19), and Roserade (Lv22). Fire, Ice, and Flying are super effective.", recommendedLevel: 22, keyBattles: ["Jupiter (Galactic Eterna Building)", "Gardenia (Forest Badge)"] },
        { title: "Gym 3: Maylene (Fighting)", summary: "Veilstone City Gym. Push-puzzle gym. Maylene uses Meditite (Lv27), Machoke (Lv27), and Lucario (Lv30). Flying and Psychic moves work.", recommendedLevel: 30, keyBattles: ["Maylene (Cobble Badge)"] },
        { title: "Gym 4: Crasher Wake (Water)", summary: "Pastoria City Gym. Water-level puzzle. Crasher Wake uses Gyarados (Lv27), Quagsire (Lv27), and Floatzel (Lv30). Electric and Grass moves are super effective.", recommendedLevel: 31, keyBattles: ["Crasher Wake (Fen Badge)"] },
        { title: "Gym 5: Fantina (Ghost)", summary: "Hearthome City Gym. Math-door puzzle. Fantina uses Drifblim (Lv32), Gengar (Lv34), and Mismagius (Lv36). Dark moves work well.", recommendedLevel: 36, keyBattles: ["Fantina (Relic Badge)"] },
        { title: "Gym 6: Byron (Steel)", summary: "Canalave City Gym. Platform-elevator puzzle. Byron uses Magneton (Lv36), Steelix (Lv36), and Bastiodon (Lv39). Fire, Ground, and Fighting are effective.", recommendedLevel: 39, keyBattles: ["Rival battle (Canalave City)", "Byron (Mine Badge)"] },
        { title: "Team Galactic Climax", summary: "Travel to Lakes Valor, Verity, and Acuity. Storm Team Galactic's HQ in Veilstone City. Confront Cyrus at Spear Pillar atop Mt. Coronet.", recommendedLevel: 45, keyBattles: ["Saturn (Lake Valor)", "Cyrus (Galactic HQ)", "Cyrus (Spear Pillar)", "Dialga/Palkia (Spear Pillar)"] },
        { title: "Gym 7: Candice (Ice)", summary: "Snowpoint City Gym. Snowball-sliding puzzle. Candice uses Sneasel (Lv38), Piloswine (Lv38), Abomasnow (Lv40), and Froslass (Lv42). Fire and Fighting moves are super effective.", recommendedLevel: 42, keyBattles: ["Candice (Icicle Badge)"] },
        { title: "Gym 8: Volkner (Electric)", summary: "Sunyshore City Gym. Gear-rotating puzzle. Volkner uses Raichu (Lv46), Ambipom (Lv47), Octillery (Lv47), and Luxray (Lv49). Ground moves are super effective.", recommendedLevel: 49, keyBattles: ["Volkner (Beacon Badge)"], tips: ["Volkner's team is diverse; Ground-type is still the best counter for his core"] },
      ],
    },
    {
      title: "Pokemon League",
      steps: [
        { title: "Victory Road", summary: "Navigate Victory Road from Route 223. Use Waterfall, Strength, Rock Smash, and Defog.", recommendedLevel: 50 },
        { title: "Elite Four: Aaron (Bug)", summary: "Aaron uses Dustox (Lv53), Beautifly (Lv53), Vespiquen (Lv54), Heracross (Lv54), and Drapion (Lv57). Fire and Flying moves work for most; Drapion is Dark/Poison.", recommendedLevel: 55, keyBattles: ["Aaron"] },
        { title: "Elite Four: Bertha (Ground)", summary: "Bertha uses Quagsire (Lv55), Sudowoodo (Lv56), Golem (Lv56), Whiscash (Lv55), and Hippowdon (Lv59). Water and Grass moves are effective.", recommendedLevel: 57, keyBattles: ["Bertha"] },
        { title: "Elite Four: Flint (Fire)", summary: "Flint uses Rapidash (Lv58), Steelix (Lv57), Drifblim (Lv58), Lopunny (Lv57), and Infernape (Lv61). Water and Ground moves work.", recommendedLevel: 59, keyBattles: ["Flint"] },
        { title: "Elite Four: Lucian (Psychic)", summary: "Lucian uses Mr. Mime (Lv59), Espeon (Lv58), Bronzong (Lv58), Alakazam (Lv60), and Gallade (Lv63). Dark and Ghost moves work.", recommendedLevel: 61, keyBattles: ["Lucian"] },
        { title: "Champion: Cynthia", summary: "Cynthia uses Spiritomb (Lv61), Roserade (Lv60), Gastrodon (Lv60), Lucario (Lv63), Milotic (Lv63), and Garchomp (Lv66). Her Garchomp is infamously dangerous.", recommendedLevel: 65, keyBattles: ["Champion Cynthia"], tips: ["Ice Beam is critical for Garchomp; Garchomp outspeeds most Pokemon", "Spiritomb has no weaknesses in Gen 4"] },
      ],
    },
  ],

  "game:black-white": [
    {
      title: "Unova Gym Challenge",
      steps: [
        { title: "Nuvema Town to Striaton City", summary: "Receive your starter from Professor Juniper. Your gym matchup depends on your starter: Cilan (Grass), Chili (Fire), or Cress (Water) will counter you.", recommendedLevel: 14, keyBattles: ["N battle (Accumula Town)", "Rival battles"], tips: ["The elemental monkey given in the Dreamyard counters your gym disadvantage"] },
        { title: "Gym 1: Striaton Trio (Grass/Fire/Water)", summary: "Striaton City Gym. Triple Gym Leaders. You face the one with a type advantage over your starter. They use Lillipup and their elemental monkey at Lv14.", recommendedLevel: 15, keyBattles: ["Cilan/Chili/Cress (Trio Badge)"] },
        { title: "Gym 2: Lenora (Normal)", summary: "Nacrene City Gym. Library quiz gym. Lenora uses Herdier (Lv18) and Watchog (Lv20). Fighting moves are super effective.", recommendedLevel: 20, keyBattles: ["N (Nacrene City)", "Lenora (Basic Badge)"], tips: ["Watchog's Retaliate does double damage the turn after Herdier faints"] },
        { title: "Gym 3: Burgh (Bug)", summary: "Castelia City Gym. Honey-wall maze. Burgh uses Whirlipede (Lv21), Dwebble (Lv21), and Leavanny (Lv23). Fire and Flying moves are super effective.", recommendedLevel: 23, keyBattles: ["Burgh (Insect Badge)"] },
        { title: "Gym 4: Elesa (Electric)", summary: "Nimbasa City Gym. Roller coaster gym. Elesa uses Emolga (Lv25), Emolga (Lv25), and Zebstrika (Lv27). Ground for Zebstrika; Emolga has Volt Switch and is part Flying.", recommendedLevel: 27, keyBattles: ["N (Nimbasa City)", "Elesa (Bolt Badge)"], tips: ["Emolga's Flying typing makes it immune to Ground; use Rock or Ice moves"] },
        { title: "Gym 5: Clay (Ground)", summary: "Driftveil City Gym. Elevator mine gym. Clay uses Krokorok (Lv29), Palpitoad (Lv29), and Excadrill (Lv31). Water and Grass moves are super effective.", recommendedLevel: 31, keyBattles: ["Clay (Quake Badge)"] },
        { title: "Gym 6: Skyla (Flying)", summary: "Mistralton City Gym. Cannon launch gym. Skyla uses Swoobat (Lv33), Unfezant (Lv33), and Swanna (Lv35). Electric and Rock moves work.", recommendedLevel: 35, keyBattles: ["Skyla (Jet Badge)"] },
        { title: "Gym 7: Brycen (Ice)", summary: "Icirrus City Gym. Ice-sliding puzzle. Brycen uses Vanillish (Lv37), Cryogonal (Lv37), and Beartic (Lv39). Fire and Fighting moves are super effective.", recommendedLevel: 39, keyBattles: ["Brycen (Freeze Badge)"] },
        { title: "Gym 8: Drayden/Iris (Dragon)", summary: "Opelucid City Gym. Dragon-statue platforming. The leader uses Fraxure (Lv41), Druddigon (Lv41), and Haxorus (Lv43). Ice moves are essential.", recommendedLevel: 43, keyBattles: ["Drayden/Iris (Legend Badge)"], tips: ["Haxorus has very high Attack; don't let it set up"] },
      ],
    },
    {
      title: "Team Plasma & Pokemon League",
      steps: [
        { title: "N's Castle", summary: "After Victory Road, Team Plasma's castle rises around the Pokemon League. Battle the Seven Sages, encounter your version's legendary (Reshiram/Zekrom), and face N.", recommendedLevel: 48, keyBattles: ["N (Legendary battle)", "Ghetsis"], tips: ["You must catch your version's legendary to proceed; bring plenty of Ultra Balls", "Ghetsis's Hydreigon is the real final boss at Lv54"] },
        { title: "Elite Four: Shauntal (Ghost)", summary: "Shauntal uses Cofagrigus (Lv48), Jellicent (Lv48), Golurk (Lv48), and Chandelure (Lv50). Dark moves work well.", recommendedLevel: 50, keyBattles: ["Shauntal"] },
        { title: "Elite Four: Grimsley (Dark)", summary: "Grimsley uses Scrafty (Lv48), Krookodile (Lv48), Liepard (Lv48), and Bisharp (Lv50). Fighting moves dominate.", recommendedLevel: 50, keyBattles: ["Grimsley"] },
        { title: "Elite Four: Caitlin (Psychic)", summary: "Caitlin uses Reuniclus (Lv48), Musharna (Lv48), Sigilyph (Lv48), and Gothitelle (Lv50). Dark and Bug moves work.", recommendedLevel: 50, keyBattles: ["Caitlin"] },
        { title: "Elite Four: Marshal (Fighting)", summary: "Marshal uses Throh (Lv48), Sawk (Lv48), Conkeldurr (Lv48), and Mienshao (Lv50). Psychic and Flying moves work.", recommendedLevel: 50, keyBattles: ["Marshal"] },
      ],
    },
  ],

  "game:x-y": [
    {
      title: "Kalos Gym Challenge",
      steps: [
        { title: "Vaniville Town to Santalune City", summary: "Receive your starter from your friends. Choose a Kanto starter from Professor Sycamore in Lumiose City. Travel to Santalune City.", recommendedLevel: 12, tips: ["You get both a Kalos and Kanto starter early on", "Froakie evolves into the popular Greninja"] },
        { title: "Gym 1: Viola (Bug)", summary: "Santalune City Gym. Photo studio web gym. Viola uses Surskit (Lv10) and Vivillon (Lv12). Fire, Flying, and Rock moves work.", recommendedLevel: 13, keyBattles: ["Viola (Bug Badge)"] },
        { title: "Gym 2: Grant (Rock)", summary: "Cyllage City Gym. Rock climbing wall gym. Grant uses Amaura (Lv25) and Tyrunt (Lv25). Water, Grass, Fighting, and Steel moves work.", recommendedLevel: 25, keyBattles: ["Grant (Cliff Badge)"] },
        { title: "Gym 3: Korrina (Fighting)", summary: "Shalour City Gym. Roller skating gym. Korrina uses Mienfoo (Lv29), Machoke (Lv28), and Hawlucha (Lv32). Psychic, Flying, and Fairy moves work.", recommendedLevel: 32, keyBattles: ["Korrina (Rumble Badge)", "Korrina (Mega Lucario battle)"], tips: ["After the gym you receive Mega Evolution and a Lucario with Lucarionite"] },
        { title: "Gym 4: Ramos (Grass)", summary: "Coumarine City Gym. Vine-swinging gym. Ramos uses Jumpluff (Lv30), Weepinbell (Lv31), and Gogoat (Lv34). Fire, Ice, and Flying moves work.", recommendedLevel: 34, keyBattles: ["Ramos (Plant Badge)"] },
        { title: "Gym 5: Clemont (Electric)", summary: "Lumiose City Gym. Quiz gym in Prism Tower. Clemont uses Emolga (Lv35), Magneton (Lv35), and Heliolisk (Lv37). Ground moves are super effective.", recommendedLevel: 37, keyBattles: ["Clemont (Voltage Badge)"] },
        { title: "Gym 6: Valerie (Fairy)", summary: "Laverre City Gym. Dollhouse gym. Valerie uses Mawile (Lv38), Mr. Mime (Lv39), and Sylveon (Lv42). Poison and Steel moves are super effective.", recommendedLevel: 42, keyBattles: ["Valerie (Fairy Badge)"] },
        { title: "Team Flare & Legendary", summary: "Team Flare activates the ultimate weapon in Geosenge Town. Infiltrate their base, battle their leader Lysandre, and encounter Xerneas/Yveltal.", recommendedLevel: 47, keyBattles: ["Lysandre (Flare HQ)", "Xerneas/Yveltal", "Lysandre (Final)"] },
        { title: "Gym 7: Olympia (Psychic)", summary: "Anistar City Gym. Cosmic sphere platforming. Olympia uses Sigilyph (Lv44), Slowking (Lv45), and Meowstic (Lv48). Dark, Bug, and Ghost moves work.", recommendedLevel: 48, keyBattles: ["Olympia (Psychic Badge)"] },
        { title: "Gym 8: Wulfric (Ice)", summary: "Snowbelle City Gym. Ice-rotating floor puzzle. Wulfric uses Abomasnow (Lv56), Cryogonal (Lv55), and Avalugg (Lv59). Fire, Fighting, and Steel moves work.", recommendedLevel: 57, keyBattles: ["Wulfric (Iceberg Badge)"] },
      ],
    },
    {
      title: "Pokemon League",
      steps: [
        { title: "Victory Road", summary: "Navigate Victory Road from Route 21. Several puzzles involving Strength and Waterfall.", recommendedLevel: 58 },
        { title: "Elite Four: Malva (Fire)", summary: "Malva uses Pyroar (Lv63), Torkoal (Lv63), Chandelure (Lv63), and Talonflame (Lv65). Water, Ground, and Rock moves work.", recommendedLevel: 63, keyBattles: ["Malva"] },
        { title: "Elite Four: Siebold (Water)", summary: "Siebold uses Clawitzer (Lv63), Gyarados (Lv63), Starmie (Lv63), and Barbaracle (Lv65). Electric and Grass moves work.", recommendedLevel: 64, keyBattles: ["Siebold"] },
        { title: "Elite Four: Wikstrom (Steel)", summary: "Wikstrom uses Klefki (Lv63), Probopass (Lv63), Scizor (Lv63), and Aegislash (Lv65). Fire, Ground, and Fighting moves work.", recommendedLevel: 64, keyBattles: ["Wikstrom"] },
        { title: "Elite Four: Drasna (Dragon)", summary: "Drasna uses Dragalge (Lv63), Druddigon (Lv63), Altaria (Lv63), and Noivern (Lv65). Ice, Dragon, and Fairy moves work.", recommendedLevel: 65, keyBattles: ["Drasna"] },
        { title: "Champion: Diantha", summary: "Diantha uses Hawlucha (Lv64), Tyrantrum (Lv65), Aurorus (Lv65), Gourgeist (Lv65), Goodra (Lv66), and Mega Gardevoir (Lv68). Steel and Poison moves help against her Gardevoir.", recommendedLevel: 68, keyBattles: ["Champion Diantha"], tips: ["Mega Gardevoir is her ace; Poison or Steel moves are key"] },
      ],
    },
  ],

  "game:sword-shield": [
    {
      title: "Galar Gym Challenge",
      steps: [
        { title: "Postwick to Turffield", summary: "Receive your starter from Leon. Obtain your Dynamax Band in the Slumbering Weald. Endorse for the Gym Challenge in Motostoke.", recommendedLevel: 20, keyBattles: ["Hop battles"], tips: ["Sobble evolves into the fast special attacker Inteleon", "Catch a Rookidee early; Corviknight is excellent"] },
        { title: "Gym 1: Milo (Grass)", summary: "Turffield Stadium. Herd Wooloo challenge. Milo uses Gossifleur (Lv19) and Dynamax Eldegoss (Lv20). Fire, Ice, and Flying moves work.", recommendedLevel: 20, keyBattles: ["Milo (Grass Badge)"] },
        { title: "Gym 2: Nessa (Water)", summary: "Hulbury Stadium. Water puzzle. Nessa uses Goldeen (Lv22), Arrokuda (Lv23), and Dynamax Drednaw (Lv24). Electric and Grass moves work.", recommendedLevel: 24, keyBattles: ["Nessa (Water Badge)"] },
        { title: "Gym 3: Kabu (Fire)", summary: "Motostoke Stadium. Catch Pokemon challenge. Kabu uses Ninetales (Lv25), Arcanine (Lv25), and Gigantamax Centiskorch (Lv27). Water, Ground, and Rock moves work.", recommendedLevel: 27, keyBattles: ["Kabu (Fire Badge)"] },
        { title: "Gym 4: Bea/Allister (Fighting/Ghost)", summary: "Stow-on-Side Stadium. Bea (Sword) uses Fighting-types; Allister (Shield) uses Ghost-types. Both ace Pokemon Dynamax around Lv36.", recommendedLevel: 36, keyBattles: ["Bea/Allister (Badge 4)"] },
        { title: "Gym 5: Opal (Fairy)", summary: "Ballonlea Stadium. Quiz challenge with stat boosts/drops. Opal uses Weezing-Galar (Lv36), Mawile (Lv36), Togekiss (Lv37), and Gigantamax Alcremie (Lv38). Poison and Steel moves work.", recommendedLevel: 38, keyBattles: ["Opal (Fairy Badge)"], tips: ["Answer her quiz questions with 'purple' themed answers for stat boosts"] },
        { title: "Gym 6: Gordie/Melony (Rock/Ice)", summary: "Circhester Stadium. Gordie (Sword) uses Rock-types; Melony (Shield) uses Ice-types. Both Dynamax their ace around Lv42.", recommendedLevel: 42, keyBattles: ["Gordie/Melony (Badge 6)"] },
        { title: "Gym 7: Piers (Dark)", summary: "Spikemuth. No stadium; a street battle gauntlet. Piers uses Scrafty (Lv44), Malamar (Lv45), Skuntank (Lv45), and Obstagoon (Lv46). Fighting, Bug, and Fairy moves work.", recommendedLevel: 46, keyBattles: ["Piers (Dark Badge)"], tips: ["No Dynamax in this gym"] },
        { title: "Gym 8: Raihan (Dragon)", summary: "Hammerlocke Stadium. Double battle format. Raihan uses Gigalith (Lv46), Flygon (Lv47), Sandaconda (Lv46), and Gigantamax Duraludon (Lv48). Ice, Fairy, and Fighting moves work.", recommendedLevel: 48, keyBattles: ["Raihan (Dragon Badge)"], tips: ["Raihan sets up Sandstorm and Stealth Rock; bring weather counters"] },
      ],
    },
    {
      title: "Championship & Postgame",
      steps: [
        { title: "Darkest Day", summary: "The Darkest Day event begins in Hammerlocke. Battle Dynamaxed Pokemon across the region with Hop. Confront Chairman Rose and Eternatus.", recommendedLevel: 58, keyBattles: ["Rose (Energy Plant)", "Eternatus"] },
        { title: "Champion Cup: Marnie", summary: "Marnie uses Liepard (Lv47), Toxicroak (Lv47), Scrafty (Lv47), Morpeko (Lv48), and Grimmsnarl (Lv49). Fighting and Fairy moves work.", recommendedLevel: 50, keyBattles: ["Marnie"] },
        { title: "Champion Cup: Hop", summary: "Hop's team mirrors yours with type advantages. His ace Dynamaxes. Bring diverse coverage.", recommendedLevel: 50, keyBattles: ["Hop"] },
        { title: "Champion: Leon", summary: "Leon uses Aegislash (Lv62), Dragapult (Lv62), Haxorus (Lv63), and a Gigantamax Charizard (Lv65) along with two team members based on your starter. The undefeated champion.", recommendedLevel: 65, keyBattles: ["Champion Leon"], tips: ["Save your Dynamax for Charizard; Rock moves deal 4x damage to it", "Leon's AI is surprisingly good at switching and coverage moves"] },
      ],
    },
  ],

  "game:scarlet-violet": [
    {
      title: "Victory Road",
      steps: [
        { title: "Mesagoza and Getting Started", summary: "Attend the academy in Mesagoza and receive your Legendary mount (Koraidon/Miraidon). Three story paths unlock: Victory Road, Path of Legends, and Starfall Street.", recommendedLevel: 15, tips: ["This is an open-world game; you can tackle gyms in any order", "The recommended order by level is listed below"] },
        { title: "Gym 1: Katy (Bug)", summary: "Cortondo Gym. Olive roll challenge. Katy uses Nymble (Lv14) and Teddiursa (Lv15) that Terastallizes to Bug type. Fire, Flying, and Rock moves work.", recommendedLevel: 15, keyBattles: ["Katy (Bug Badge)"] },
        { title: "Gym 2: Brassius (Grass)", summary: "Artazon Gym. Sunflora hide-and-seek. Brassius uses Petilil (Lv16), Smoliv (Lv16), and Sudowoodo (Lv17) that Terastallizes to Grass type. Fire, Ice, and Flying moves work.", recommendedLevel: 17, keyBattles: ["Brassius (Grass Badge)"] },
        { title: "Gym 3: Iono (Electric)", summary: "Levincia Gym. Where's the Pokemonstream challenge. Iono uses Wattrel (Lv23), Bellibolt (Lv23), Luxio (Lv23), and Mismagius (Lv24) that Terastallizes to Electric. Ground moves are super effective.", recommendedLevel: 24, keyBattles: ["Iono (Electric Badge)"] },
        { title: "Gym 4: Kofu (Water)", summary: "Cascarrafa Gym. Auction shopping challenge. Kofu uses Veluza (Lv29), Wugtrio (Lv29), and Crabominable (Lv30) that Terastallizes to Water. Electric and Grass moves work.", recommendedLevel: 30, keyBattles: ["Kofu (Water Badge)"] },
        { title: "Gym 5: Larry (Normal)", summary: "Medali Gym. Secret menu order challenge. Larry uses Komala (Lv35), Dudunsparce (Lv35), and Staraptor (Lv36) that Terastallizes to Normal. Fighting moves are super effective.", recommendedLevel: 36, keyBattles: ["Larry (Normal Badge)"], tips: ["Larry returns later as an Elite Four member with a different type"] },
        { title: "Gym 6: Ryme (Ghost)", summary: "Montenevera Gym. Rap battle double battles. Ryme uses Banette (Lv41), Mimikyu (Lv41), Houndstone (Lv41), and Toxtricity (Lv42) that Terastallizes to Ghost. Dark moves work well.", recommendedLevel: 42, keyBattles: ["Ryme (Ghost Badge)"] },
        { title: "Gym 7: Tulip (Psychic)", summary: "Alfornada Gym. Emotional battle challenge. Tulip uses Farigiraf (Lv44), Gardevoir (Lv44), Espathra (Lv44), and Florges (Lv45) that Terastallizes to Psychic. Dark, Bug, and Ghost moves work.", recommendedLevel: 45, keyBattles: ["Tulip (Psychic Badge)"] },
        { title: "Gym 8: Grusha (Ice)", summary: "Glaseado Gym. Snow slope challenge. Grusha uses Frosmoth (Lv47), Beartic (Lv47), Cetitan (Lv47), and Altaria (Lv48) that Terastallizes to Ice. Fire, Fighting, and Steel moves work.", recommendedLevel: 48, keyBattles: ["Grusha (Ice Badge)"] },
      ],
    },
    {
      title: "Pokemon League",
      steps: [
        { title: "Elite Four: Rika (Ground)", summary: "Rika uses Whiscash (Lv57), Camerupt (Lv57), Donphan (Lv57), Dugtrio (Lv57), and Clodsire (Lv58) Terastallized to Ground. Water, Grass, and Ice moves work.", recommendedLevel: 58, keyBattles: ["Rika"] },
        { title: "Elite Four: Poppy (Steel)", summary: "Poppy uses Copperajah (Lv58), Magnezone (Lv58), Bronzong (Lv58), Corviknight (Lv58), and Tinkaton (Lv59) Terastallized to Steel. Fire, Ground, and Fighting work.", recommendedLevel: 59, keyBattles: ["Poppy"] },
        { title: "Elite Four: Larry (Flying)", summary: "Larry returns with Tropius (Lv59), Staraptor (Lv59), Oricorio (Lv59), Altaria (Lv59), and Flamigo (Lv60) Terastallized to Flying. Electric, Ice, and Rock moves work.", recommendedLevel: 60, keyBattles: ["Larry"] },
        { title: "Elite Four: Hassel (Dragon)", summary: "Hassel uses Noivern (Lv60), Haxorus (Lv60), Dragalge (Lv60), Flapple (Lv60), and Baxcalibur (Lv61) Terastallized to Dragon. Ice, Dragon, and Fairy moves work.", recommendedLevel: 61, keyBattles: ["Hassel"] },
        { title: "Champion: Geeta & Nemona", summary: "Top Champion Geeta uses a varied team around Lv61-62 including Espathra, Gogoat, Veluza, Avalugg, Kingambit, and Glimmora. After becoming Champion, battle your rival Nemona at full strength.", recommendedLevel: 65, keyBattles: ["Top Champion Geeta", "Nemona (Champion battle)"], tips: ["Nemona's battle after Geeta is the true climax of Victory Road"] },
      ],
    },
    {
      title: "Path of Legends",
      steps: [
        { title: "Stony Cliff Titan (Klawf)", summary: "A giant Klawf on the Stony Cliff. Defeat it to unlock the Dash ability for your mount.", recommendedLevel: 16, keyBattles: ["Klawf Titan"] },
        { title: "Open Sky Titan (Bombirdier)", summary: "A giant Bombirdier in West Province. Defeat it to unlock swimming for your mount.", recommendedLevel: 20, keyBattles: ["Bombirdier Titan"] },
        { title: "Lurking Steel Titan (Orthworm)", summary: "A giant Orthworm in East Province. Defeat it to unlock the high jump for your mount.", recommendedLevel: 29, keyBattles: ["Orthworm Titan"] },
        { title: "Quaking Earth Titan (Great Tusk/Iron Treads)", summary: "Version-exclusive titan in Asado Desert. Defeat it to unlock gliding for your mount.", recommendedLevel: 45, keyBattles: ["Great Tusk/Iron Treads Titan"] },
        { title: "False Dragon Titan (Dondozo & Tatsugiri)", summary: "A giant Dondozo in Casseroya Lake. Defeat it to unlock climbing for your mount.", recommendedLevel: 56, keyBattles: ["Dondozo & Tatsugiri Titan"] },
      ],
    },
    {
      title: "Starfall Street",
      steps: [
        { title: "Dark Crew: Giacomo", summary: "Team Star's Dark-type base. Defeat 30 Pokemon in the Star Barrage, then battle Giacomo's Pawniard (Lv21) and Revavroom (Lv20).", recommendedLevel: 21, keyBattles: ["Giacomo (Dark Crew)"] },
        { title: "Fire Crew: Mela", summary: "Team Star's Fire-type base. Mela's ace is a Fire Revavroom (Lv27).", recommendedLevel: 27, keyBattles: ["Mela (Fire Crew)"] },
        { title: "Poison Crew: Atticus", summary: "Team Star's Poison-type base. Atticus's ace is a Poison Revavroom (Lv33).", recommendedLevel: 33, keyBattles: ["Atticus (Poison Crew)"] },
        { title: "Fairy Crew: Ortega", summary: "Team Star's Fairy-type base. Ortega's ace is a Fairy Revavroom (Lv50).", recommendedLevel: 50, keyBattles: ["Ortega (Fairy Crew)"] },
        { title: "Fighting Crew: Eri", summary: "Team Star's Fighting-type base. Eri's ace is a Fighting Revavroom (Lv56).", recommendedLevel: 56, keyBattles: ["Eri (Fighting Crew)"] },
      ],
    },
  ],

  "game:yellow": [
    {
      title: "Kanto Gym Challenge",
      steps: [
        { title: "Pallet Town to Pewter City", summary: "Receive Pikachu from Professor Oak. Your rival gets Eevee. Travel through Viridian Forest to Pewter City.", recommendedLevel: 12, keyBattles: ["Rival battle (Route 22)"], tips: ["Pikachu cannot damage Brock's Rock-types easily; catch a Mankey on Route 22 or Nidoran on Route 22 and teach it Double Kick", "Butterfree with Confusion also works against Brock"] },
        { title: "Gym 1: Brock (Rock)", summary: "Pewter City Gym. Brock uses Geodude (Lv12) and Onix (Lv14). Water and Grass moves are super effective.", recommendedLevel: 14, keyBattles: ["Brock (Boulder Badge)"], tips: ["Pikachu's Electric moves are useless here; use a Fighting or Grass-type"] },
        { title: "Gym 2: Misty (Water)", summary: "Cerulean City Gym. Misty uses Staryu (Lv18) and Starmie (Lv21). Pikachu handles this gym well.", recommendedLevel: 21, keyBattles: ["Rival battle (Cerulean City)", "Misty (Cascade Badge)"], tips: ["Pikachu's Thunderbolt destroys both of Misty's Pokemon"] },
        { title: "S.S. Anne and Vermilion City", summary: "Board the S.S. Anne, defeat your rival, and obtain HM01 Cut.", recommendedLevel: 24, keyBattles: ["Rival battle (S.S. Anne)"] },
        { title: "Gym 3: Lt. Surge (Electric)", summary: "Vermilion City Gym. Lt. Surge uses Voltorb (Lv21), Pikachu (Lv18), and Raichu (Lv24). Ground moves are super effective.", recommendedLevel: 25, keyBattles: ["Lt. Surge (Thunder Badge)"], tips: ["Diglett from Diglett's Cave makes this straightforward"] },
        { title: "Rock Tunnel to Celadon City", summary: "Navigate Rock Tunnel and head west to Celadon City. Infiltrate the Rocket Game Corner hideout.", recommendedLevel: 30, keyBattles: ["Giovanni (Rocket Hideout)"], tips: ["In Yellow, you can get Bulbasaur, Charmander, and Squirtle as gifts from NPCs throughout the game"] },
        { title: "Gym 4: Erika (Grass)", summary: "Celadon City Gym. Erika uses Victreebel (Lv29), Tangela (Lv24), and Vileplume (Lv29). Fire, Ice, and Flying moves work.", recommendedLevel: 30, keyBattles: ["Erika (Rainbow Badge)"] },
        { title: "Pokemon Tower and Fuchsia City", summary: "Clear Pokemon Tower with the Silph Scope. Head south to Fuchsia City.", recommendedLevel: 35, keyBattles: ["Rival battle (Pokemon Tower)", "Marowak ghost"] },
        { title: "Gym 5: Koga (Poison)", summary: "Fuchsia City Gym. Koga uses Venonat (Lv44), Venonat (Lv46), Venonat (Lv48), and Venomoth (Lv50). Psychic moves dominate.", recommendedLevel: 45, keyBattles: ["Koga (Soul Badge)"] },
        { title: "Silph Co. and Saffron City", summary: "Clear Silph Co., defeat Giovanni and your rival. Receive the Master Ball.", recommendedLevel: 40, keyBattles: ["Rival battle (Silph Co.)", "Giovanni (Silph Co.)"] },
        { title: "Gym 6: Sabrina (Psychic)", summary: "Saffron City Gym. Sabrina uses Abra (Lv50), Kadabra (Lv50), and Alakazam (Lv50). Bug-type moves and high Attack help.", recommendedLevel: 48, keyBattles: ["Sabrina (Marsh Badge)"] },
        { title: "Gym 7: Blaine (Fire)", summary: "Cinnabar Island Gym. Blaine uses Ninetales (Lv48), Rapidash (Lv50), and Arcanine (Lv54). Water and Ground moves work.", recommendedLevel: 50, keyBattles: ["Blaine (Volcano Badge)"] },
        { title: "Gym 8: Giovanni (Ground)", summary: "Viridian City Gym. Giovanni uses Persian (Lv53), Dugtrio (Lv53), Nidoqueen (Lv53), Nidoking (Lv55), and Rhydon (Lv55).", recommendedLevel: 52, keyBattles: ["Giovanni (Earth Badge)"] },
      ],
    },
    {
      title: "Pokemon League",
      steps: [
        { title: "Victory Road", summary: "Navigate the strength puzzles. Stock up on healing items at Indigo Plateau.", recommendedLevel: 52, tips: ["Pikachu should be around Lv50+ for the Elite Four"] },
        { title: "Elite Four: Lorelei (Ice)", summary: "Lorelei uses Dewgong (Lv54), Cloyster (Lv53), Slowbro (Lv54), Jynx (Lv56), and Lapras (Lv56). Electric and Fighting help.", recommendedLevel: 55, keyBattles: ["Lorelei"] },
        { title: "Elite Four: Bruno (Fighting)", summary: "Bruno uses Onix (Lv53), Hitmonchan (Lv55), Hitmonlee (Lv55), Onix (Lv56), and Machamp (Lv58). Psychic and Water dominate.", recommendedLevel: 56, keyBattles: ["Bruno"] },
        { title: "Elite Four: Agatha (Ghost)", summary: "Agatha uses Gengar (Lv56), Golbat (Lv56), Haunter (Lv55), Arbok (Lv58), and Gengar (Lv60). Psychic moves work best.", recommendedLevel: 58, keyBattles: ["Agatha"] },
        { title: "Elite Four: Lance (Dragon)", summary: "Lance uses Gyarados (Lv58), Dragonair (Lv56), Dragonair (Lv56), Aerodactyl (Lv60), and Dragonite (Lv62). Ice moves dominate.", recommendedLevel: 60, keyBattles: ["Lance"] },
        { title: "Champion: Rival", summary: "Your rival's team is built around Eevee's evolution (Jolteon, Flareon, or Vaporeon at Lv65) plus five other Pokemon.", recommendedLevel: 62, keyBattles: ["Champion"], tips: ["The rival's Eevee evolution depends on your battle record against him in earlier fights"] },
      ],
    },
  ],

  "game:crystal": [
    {
      title: "Johto Gym Challenge",
      steps: [
        { title: "New Bark Town to Violet City", summary: "Choose your starter from Professor Elm. Crystal adds the choice of playing as a female trainer. Travel to Violet City.", recommendedLevel: 10, keyBattles: ["Rival battle (Cherrygrove City)"], tips: ["Crystal adds Suicune as a roaming encounter throughout the story"] },
        { title: "Gym 1: Falkner (Flying)", summary: "Violet City Gym. Falkner uses Pidgey (Lv7) and Pidgeotto (Lv9). Electric and Rock moves help.", recommendedLevel: 12, keyBattles: ["Falkner (Zephyr Badge)"] },
        { title: "Gym 2: Bugsy (Bug)", summary: "Azalea Town Gym. Clear Team Rocket from Slowpoke Well first. Bugsy's ace is Scyther (Lv16).", recommendedLevel: 17, keyBattles: ["Team Rocket (Slowpoke Well)", "Bugsy (Hive Badge)"] },
        { title: "Gym 3: Whitney (Normal)", summary: "Goldenrod City Gym. Whitney's Miltank (Lv20) with Rollout is the toughest early fight. Fighting types help.", recommendedLevel: 22, keyBattles: ["Whitney (Plain Badge)"], tips: ["Female Pokemon avoid Attract", "Geodude resists Rollout"] },
        { title: "Gym 4: Morty (Ghost)", summary: "Ecruteak City Gym. Navigate the dark floor. Morty's ace is Gengar (Lv25).", recommendedLevel: 26, keyBattles: ["Rival battle (Burned Tower)", "Morty (Fog Badge)"] },
        { title: "Gym 5: Chuck (Fighting)", summary: "Cianwood City Gym. Chuck uses Primeape (Lv27) and Poliwrath (Lv30). Flying and Psychic moves help.", recommendedLevel: 30, keyBattles: ["Chuck (Storm Badge)"] },
        { title: "Gym 6: Jasmine (Steel)", summary: "Olivine City Gym. First heal Amphy in the Lighthouse. Jasmine uses two Magnemite and Steelix (Lv35). Fire and Ground help.", recommendedLevel: 33, keyBattles: ["Jasmine (Mineral Badge)"] },
        { title: "Gym 7: Pryce (Ice)", summary: "Mahogany Town Gym. Clear the Rocket hideout beneath the Lake of Rage first. Pryce's ace is Piloswine (Lv34).", recommendedLevel: 34, keyBattles: ["Red Gyarados", "Team Rocket (Radio Tower)", "Pryce (Glacier Badge)"] },
        { title: "Gym 8: Clair (Dragon)", summary: "Blackthorn City Gym. Clair uses three Dragonair and Kingdra (Lv40). Ice moves work on Dragonair; Kingdra is tough.", recommendedLevel: 40, keyBattles: ["Clair (Rising Badge)"], tips: ["After winning, complete the Dragon's Den shrine challenge to receive the badge"] },
      ],
    },
    {
      title: "Pokemon League",
      steps: [
        { title: "Victory Road", summary: "Navigate Victory Road to reach the Indigo Plateau.", recommendedLevel: 42 },
        { title: "Elite Four: Will (Psychic)", summary: "Will uses Xatu (Lv40), Jynx (Lv41), Exeggutor (Lv41), Slowbro (Lv41), and Xatu (Lv42). Dark and Bug moves help.", recommendedLevel: 43, keyBattles: ["Will"] },
        { title: "Elite Four: Koga (Poison)", summary: "Koga uses Ariados (Lv40), Forretress (Lv43), Muk (Lv42), Venomoth (Lv41), and Crobat (Lv44). Psychic and Ground work.", recommendedLevel: 44, keyBattles: ["Koga"] },
        { title: "Elite Four: Bruno (Fighting)", summary: "Bruno uses Hitmontop (Lv42), Hitmonlee (Lv42), Hitmonchan (Lv42), Onix (Lv43), and Machamp (Lv46). Psychic and Flying.", recommendedLevel: 45, keyBattles: ["Bruno"] },
        { title: "Elite Four: Karen (Dark)", summary: "Karen uses Umbreon (Lv42), Vileplume (Lv42), Gengar (Lv45), Murkrow (Lv44), and Houndoom (Lv47). Fighting and Bug help.", recommendedLevel: 46, keyBattles: ["Karen"] },
        { title: "Champion: Lance", summary: "Lance uses Gyarados (Lv44), three Dragonite (Lv47, 47, 50), Charizard (Lv46), and Aerodactyl (Lv46). Ice moves dominate.", recommendedLevel: 48, keyBattles: ["Champion Lance"], tips: ["Ice Beam or Blizzard can sweep most of Lance's team"] },
      ],
    },
    {
      title: "Kanto Postgame",
      steps: [
        { title: "Kanto Gym Rush", summary: "Travel through all 8 Kanto gyms. Leaders have teams in the Lv42-56 range. The gyms can be tackled in mostly any order.", recommendedLevel: 50, keyBattles: ["Brock", "Misty", "Lt. Surge", "Erika", "Janine", "Sabrina", "Blaine", "Blue"] },
        { title: "Suicune Encounter", summary: "Crystal features a dedicated Suicune storyline. After tracking it across Johto and Kanto, battle it at the Tin Tower.", recommendedLevel: 40, keyBattles: ["Suicune (Lv40)"], tips: ["Save before the encounter; Suicune is a one-time battle"] },
        { title: "Mt. Silver: Red", summary: "With all 16 badges, enter Mt. Silver and challenge Red. His team includes Pikachu (Lv81), Espeon (Lv73), Snorlax (Lv75), Venusaur (Lv77), Charizard (Lv77), and Blastoise (Lv77).", recommendedLevel: 70, keyBattles: ["Red"], tips: ["This is the hardest battle in the game; bring a full team of Lv70+ Pokemon"] },
      ],
    },
  ],

  "game:emerald": [
    {
      title: "Hoenn Gym Challenge",
      steps: [
        { title: "Littleroot to Rustboro City", summary: "Choose your starter from Professor Birch. Travel through Routes 101-104 and Petalburg Woods to Rustboro.", recommendedLevel: 14, keyBattles: ["Rival battle (Route 103)"], tips: ["Emerald's early routes have slightly different wild Pokemon than Ruby/Sapphire"] },
        { title: "Gym 1: Roxanne (Rock)", summary: "Rustboro City Gym. Roxanne uses Geodude (Lv12), Geodude (Lv12), and Nosepass (Lv15). Water and Grass work.", recommendedLevel: 15, keyBattles: ["Roxanne (Stone Badge)"] },
        { title: "Gym 2: Brawly (Fighting)", summary: "Dewford Town Gym. Navigate the dark gym. Brawly uses Machop (Lv16), Meditite (Lv16), and Makuhita (Lv19). Flying and Psychic.", recommendedLevel: 19, keyBattles: ["Brawly (Knuckle Badge)"] },
        { title: "Gym 3: Wattson (Electric)", summary: "Mauville City Gym. Wattson uses Voltorb (Lv20), Electrike (Lv20), Magneton (Lv22), and Manectric (Lv24). Ground is key.", recommendedLevel: 24, keyBattles: ["Wattson (Dynamo Badge)"] },
        { title: "Gym 4: Flannery (Fire)", summary: "Lavaridge Town Gym. Navigate the hot spring tile puzzle. Flannery's ace is Torkoal (Lv29). Water and Ground.", recommendedLevel: 29, keyBattles: ["Flannery (Heat Badge)"] },
        { title: "Gym 5: Norman (Normal)", summary: "Petalburg City Gym. Your father Norman uses Spinda (Lv27), Vigoroth (Lv27), Linoone (Lv29), and Slaking (Lv31). Fighting.", recommendedLevel: 31, keyBattles: ["Norman (Balance Badge)"], tips: ["Slaking loafs every other turn; use Protect or a high-Defense Pokemon to exploit this"] },
        { title: "Gym 6: Winona (Flying)", summary: "Fortree City Gym. Winona uses Swablu (Lv29), Tropius (Lv29), Pelipper (Lv30), Skarmory (Lv31), and Altaria (Lv33). Ice and Electric.", recommendedLevel: 33, keyBattles: ["Winona (Feather Badge)"] },
        { title: "Gym 7: Tate & Liza (Psychic)", summary: "Mossdeep City Gym. Double battle with Claydol (Lv41), Xatu (Lv41), Lunatone (Lv42), and Solrock (Lv42). Dark and Water.", recommendedLevel: 42, keyBattles: ["Tate & Liza (Mind Badge)"] },
        { title: "Team Aqua and Team Magma Climax", summary: "Both teams awaken Groudon and Kyogre, causing catastrophic weather. Travel to the Sky Pillar to awaken Rayquaza and calm the crisis.", recommendedLevel: 42, keyBattles: ["Maxie (Team Magma)", "Archie (Team Aqua)"], tips: ["Emerald features both teams as antagonists, unlike Ruby/Sapphire where only one team is villainous"] },
        { title: "Gym 8: Juan (Water)", summary: "Sootopolis City Gym. Juan replaces Wallace as gym leader in Emerald. Uses Luvdisc (Lv41), Whiscash (Lv41), Sealeo (Lv43), Crawdaunt (Lv43), and Kingdra (Lv46). Grass and Electric.", recommendedLevel: 44, keyBattles: ["Juan (Rain Badge)"] },
      ],
    },
    {
      title: "Pokemon League",
      steps: [
        { title: "Victory Road", summary: "Navigate Victory Road's waterfall and strength puzzles.", recommendedLevel: 46 },
        { title: "Elite Four: Sidney (Dark)", summary: "Sidney uses Mightyena (Lv46), Shiftry (Lv48), Cacturne (Lv46), Crawdaunt (Lv48), and Absol (Lv49). Fighting and Bug.", recommendedLevel: 48, keyBattles: ["Sidney"] },
        { title: "Elite Four: Phoebe (Ghost)", summary: "Phoebe uses two Dusclops (Lv48, 51), two Banette (Lv49, 49), and Sableye (Lv50). Dark moves work.", recommendedLevel: 49, keyBattles: ["Phoebe"] },
        { title: "Elite Four: Glacia (Ice)", summary: "Glacia uses two Glalie (Lv50, 52), two Sealeo (Lv50, 52), and Walrein (Lv53). Fighting and Fire.", recommendedLevel: 51, keyBattles: ["Glacia"] },
        { title: "Elite Four: Drake (Dragon)", summary: "Drake uses Shelgon (Lv52), Altaria (Lv54), Flygon (Lv53), Flygon (Lv53), and Salamence (Lv55). Ice moves dominate.", recommendedLevel: 53, keyBattles: ["Drake"] },
        { title: "Champion: Wallace", summary: "Wallace uses Wailord (Lv57), Tentacruel (Lv55), Ludicolo (Lv56), Whiscash (Lv56), Gyarados (Lv56), and Milotic (Lv58). Electric and Grass.", recommendedLevel: 56, keyBattles: ["Champion Wallace"], tips: ["Wallace replaces Steven as champion in Emerald; Steven can be fought at Meteor Falls postgame"] },
      ],
    },
  ],

  "game:firered-leafgreen": [
    {
      title: "Kanto Gym Challenge",
      steps: [
        { title: "Pallet Town to Pewter City", summary: "Choose Bulbasaur, Charmander, or Squirtle. Travel through Viridian Forest to Pewter City.", recommendedLevel: 12, keyBattles: ["Rival battle (Route 22)"] },
        { title: "Gym 1: Brock (Rock)", summary: "Pewter City Gym. Brock uses Geodude (Lv12) and Onix (Lv14). Water and Grass are super effective.", recommendedLevel: 14, keyBattles: ["Brock (Boulder Badge)"] },
        { title: "Gym 2: Misty (Water)", summary: "Cerulean City Gym. Misty uses Staryu (Lv18) and Starmie (Lv21). Electric and Grass.", recommendedLevel: 21, keyBattles: ["Misty (Cascade Badge)"] },
        { title: "Gym 3: Lt. Surge (Electric)", summary: "Vermilion City Gym. Lt. Surge uses Voltorb (Lv21), Pikachu (Lv18), and Raichu (Lv24). Ground.", recommendedLevel: 25, keyBattles: ["Lt. Surge (Thunder Badge)"] },
        { title: "Gym 4: Erika (Grass)", summary: "Celadon City Gym. Erika uses Victreebel (Lv29), Tangela (Lv24), and Vileplume (Lv29). Fire and Flying.", recommendedLevel: 30, keyBattles: ["Erika (Rainbow Badge)"] },
        { title: "Gym 5: Koga (Poison)", summary: "Fuchsia City Gym. Koga uses Koffing (Lv37), Muk (Lv39), Koffing (Lv37), and Weezing (Lv43). Psychic and Ground.", recommendedLevel: 40, keyBattles: ["Koga (Soul Badge)"] },
        { title: "Gym 6: Sabrina (Psychic)", summary: "Saffron City Gym. Sabrina uses Kadabra (Lv38), Mr. Mime (Lv37), Venomoth (Lv38), and Alakazam (Lv43). Bug and Dark.", recommendedLevel: 43, keyBattles: ["Sabrina (Marsh Badge)"], tips: ["Unlike Gen 1, Ghost and Dark moves now properly hit Psychic-types in FRLG"] },
        { title: "Gym 7: Blaine (Fire)", summary: "Cinnabar Island Gym. Blaine uses Growlithe (Lv42), Ponyta (Lv40), Rapidash (Lv42), and Arcanine (Lv47). Water and Ground.", recommendedLevel: 45, keyBattles: ["Blaine (Volcano Badge)"] },
        { title: "Gym 8: Giovanni (Ground)", summary: "Viridian City Gym. Giovanni uses Rhyhorn (Lv45), Dugtrio (Lv42), Nidoqueen (Lv44), Nidoking (Lv45), and Rhydon (Lv50).", recommendedLevel: 48, keyBattles: ["Giovanni (Earth Badge)"] },
      ],
    },
    {
      title: "Pokemon League",
      steps: [
        { title: "Victory Road", summary: "Navigate Victory Road's strength puzzles to reach Indigo Plateau.", recommendedLevel: 50 },
        { title: "Elite Four and Champion", summary: "Face Lorelei (Ice), Bruno (Fighting), Agatha (Ghost), Lance (Dragon), and Champion Rival. Teams mirror Red/Blue with updated movesets.", recommendedLevel: 58, keyBattles: ["Lorelei", "Bruno", "Agatha", "Lance", "Champion"], tips: ["After becoming Champion, the Sevii Islands postgame unlocks with new areas and Pokemon from Johto and Hoenn"] },
      ],
    },
  ],

  "game:platinum": [
    {
      title: "Sinnoh Gym Challenge",
      steps: [
        { title: "Twinleaf to Jubilife City", summary: "Choose Turtwig, Chimchar, or Piplup from Professor Rowan. Travel through Route 201-202 to Jubilife City.", recommendedLevel: 10, keyBattles: ["Rival battle (Route 203)"], tips: ["Platinum fixes Sinnoh's Fire-type shortage; Houndoom and Flareon are available before the E4"] },
        { title: "Gym 1: Roark (Rock)", summary: "Oreburgh City Gym. Roark uses Geodude (Lv12), Onix (Lv12), and Cranidos (Lv14). Water and Grass.", recommendedLevel: 14, keyBattles: ["Roark (Coal Badge)"] },
        { title: "Gym 2: Gardenia (Grass)", summary: "Eterna City Gym. Gardenia uses Turtwig (Lv20), Cherrim (Lv20), and Roserade (Lv22). Fire and Flying.", recommendedLevel: 22, keyBattles: ["Gardenia (Forest Badge)"] },
        { title: "Gym 3: Maylene (Fighting)", summary: "Veilstone City Gym. Maylene uses Meditite (Lv28), Machoke (Lv29), and Lucario (Lv32). Flying and Psychic.", recommendedLevel: 30, keyBattles: ["Maylene (Cobble Badge)"] },
        { title: "Gym 4: Crasher Wake (Water)", summary: "Pastoria City Gym. Crasher Wake uses Gyarados (Lv33), Quagsire (Lv34), and Floatzel (Lv37). Electric and Grass.", recommendedLevel: 35, keyBattles: ["Crasher Wake (Fen Badge)"] },
        { title: "Gym 5: Fantina (Ghost)", summary: "Hearthome City Gym. Fantina uses Duskull (Lv32), Haunter (Lv36), and Mismagius (Lv38). Dark moves.", recommendedLevel: 36, keyBattles: ["Fantina (Relic Badge)"], tips: ["In Platinum, Fantina is fought as the 5th gym instead of 3rd"] },
        { title: "Gym 6: Byron (Steel)", summary: "Canalave City Gym. Byron uses Magneton (Lv37), Steelix (Lv38), and Bastiodon (Lv41). Fire and Fighting.", recommendedLevel: 39, keyBattles: ["Byron (Mine Badge)"] },
        { title: "Gym 7: Candice (Ice)", summary: "Snowpoint City Gym. Candice uses Sneasel (Lv40), Piloswine (Lv40), Abomasnow (Lv42), and Froslass (Lv44). Fire and Fighting.", recommendedLevel: 42, keyBattles: ["Candice (Icicle Badge)"] },
        { title: "Distortion World", summary: "Team Galactic summons Giratina at Spear Pillar. Enter the Distortion World to stop Cyrus and encounter Giratina in its Origin Forme.", recommendedLevel: 47, keyBattles: ["Cyrus (Distortion World)", "Giratina (Lv47)"], tips: ["Save before Giratina; this is the only way to catch it in Origin Forme"] },
        { title: "Gym 8: Volkner (Electric)", summary: "Sunyshore City Gym. Volkner uses Jolteon (Lv46), Raichu (Lv46), Luxray (Lv48), and Electivire (Lv50). Ground.", recommendedLevel: 48, keyBattles: ["Volkner (Beacon Badge)"] },
      ],
    },
    {
      title: "Pokemon League",
      steps: [
        { title: "Victory Road", summary: "Navigate the cave to the Pokemon League. Platinum's Victory Road is redesigned from Diamond/Pearl.", recommendedLevel: 50 },
        { title: "Elite Four: Aaron (Bug)", summary: "Aaron uses Yanmega (Lv49), Scizor (Lv49), Vespiquen (Lv50), Heracross (Lv51), and Drapion (Lv53). Fire and Flying.", recommendedLevel: 51, keyBattles: ["Aaron"] },
        { title: "Elite Four: Bertha (Ground)", summary: "Bertha uses Whiscash (Lv50), Gliscor (Lv53), Golem (Lv52), Rhyperior (Lv52), and Hippowdon (Lv55). Water and Grass.", recommendedLevel: 53, keyBattles: ["Bertha"] },
        { title: "Elite Four: Flint (Fire)", summary: "Flint uses Houndoom (Lv52), Flareon (Lv55), Rapidash (Lv53), Infernape (Lv55), and Magmortar (Lv57). Water and Ground.", recommendedLevel: 55, keyBattles: ["Flint"] },
        { title: "Elite Four: Lucian (Psychic)", summary: "Lucian uses Mr. Mime (Lv53), Espeon (Lv55), Bronzong (Lv54), Alakazam (Lv56), and Gallade (Lv59). Dark and Bug.", recommendedLevel: 57, keyBattles: ["Lucian"] },
        { title: "Champion: Cynthia", summary: "Cynthia uses Spiritomb (Lv58), Roserade (Lv58), Togekiss (Lv60), Lucario (Lv60), Milotic (Lv58), and Garchomp (Lv62). Ice moves for Garchomp are essential.", recommendedLevel: 60, keyBattles: ["Champion Cynthia"], tips: ["Garchomp is extremely fast and powerful; an Ice Beam or Ice Shard user is almost mandatory"] },
      ],
    },
  ],

  "game:heartgold-soulsilver": [
    {
      title: "Johto Gym Challenge",
      steps: [
        { title: "New Bark Town to Violet City", summary: "Choose your starter from Professor Elm. Your lead Pokemon follows you in the overworld. Travel to Violet City.", recommendedLevel: 10, keyBattles: ["Rival battle (Cherrygrove City)"], tips: ["The lead Pokemon following feature lets you check friendship and find hidden items"] },
        { title: "Gym 1: Falkner (Flying)", summary: "Violet City Gym. Falkner uses Pidgey (Lv9) and Pidgeotto (Lv13). Electric and Rock.", recommendedLevel: 13, keyBattles: ["Falkner (Zephyr Badge)"] },
        { title: "Gym 2: Bugsy (Bug)", summary: "Azalea Town Gym. Clear Team Rocket from Slowpoke Well. Bugsy's Scyther (Lv17) uses U-turn.", recommendedLevel: 18, keyBattles: ["Team Rocket (Slowpoke Well)", "Bugsy (Hive Badge)"] },
        { title: "Gym 3: Whitney (Normal)", summary: "Goldenrod City Gym. Whitney's Miltank (Lv19) with Rollout and Milk Drink is devastating.", recommendedLevel: 22, keyBattles: ["Whitney (Plain Badge)"], tips: ["The Machop trade in the department store is still available and very helpful"] },
        { title: "Gym 4: Morty (Ghost)", summary: "Ecruteak City Gym. Morty's ace is Gengar (Lv25). Normal and Fighting moves won't work.", recommendedLevel: 26, keyBattles: ["Rival battle (Burned Tower)", "Morty (Fog Badge)"] },
        { title: "Gym 5: Chuck (Fighting)", summary: "Cianwood City Gym. Chuck uses Primeape (Lv29) and Poliwrath (Lv33). Flying and Psychic.", recommendedLevel: 31, keyBattles: ["Chuck (Storm Badge)"] },
        { title: "Gym 6: Jasmine (Steel)", summary: "Olivine City Gym. Heal Amphy first. Jasmine uses two Magnemite and Steelix (Lv35).", recommendedLevel: 34, keyBattles: ["Jasmine (Mineral Badge)"] },
        { title: "Gym 7: Pryce (Ice)", summary: "Mahogany Town Gym. Clear the Rocket HQ first. Pryce's ace is Piloswine (Lv34).", recommendedLevel: 34, keyBattles: ["Red Gyarados", "Team Rocket (Radio Tower)", "Pryce (Glacier Badge)"] },
        { title: "Gym 8: Clair (Dragon)", summary: "Blackthorn City Gym. Clair uses three Dragonair and Kingdra (Lv41). Complete Dragon's Den after winning.", recommendedLevel: 40, keyBattles: ["Clair (Rising Badge)"] },
      ],
    },
    {
      title: "Pokemon League",
      steps: [
        { title: "Victory Road and Elite Four", summary: "Navigate Victory Road. Face Will (Psychic), Koga (Poison), Bruno (Fighting), Karen (Dark), and Champion Lance with his three Dragonite.", recommendedLevel: 48, keyBattles: ["Will", "Koga", "Bruno", "Karen", "Champion Lance"], tips: ["Lance's Dragonite are all weak to Ice; bring Ice Beam coverage"] },
      ],
    },
    {
      title: "Kanto Postgame",
      steps: [
        { title: "Kanto Gyms", summary: "Challenge all 8 Kanto gym leaders with updated teams. Leaders include Brock, Misty, Lt. Surge, Erika, Janine, Sabrina, Blaine, and Blue.", recommendedLevel: 55, keyBattles: ["Brock", "Misty", "Lt. Surge", "Erika", "Janine", "Sabrina", "Blaine", "Blue (Viridian Gym)"] },
        { title: "Mt. Silver: Red", summary: "With all 16 badges, challenge Red on Mt. Silver. His Pikachu is Lv88 and his team includes all three Kanto starters at Lv84.", recommendedLevel: 75, keyBattles: ["Red"], tips: ["Red's team is the highest-level trainer battle in any main series game at this point"] },
      ],
    },
  ],

  "game:black-2-white-2": [
    {
      title: "Unova Gym Challenge",
      steps: [
        { title: "Aspertia City to Virbank City", summary: "Receive your starter (Snivy, Tepig, or Oshawott) from Bianca. Travel to Virbank City.", recommendedLevel: 12, keyBattles: ["Rival Hugh battle"], tips: ["B2W2 features a new protagonist and starts in southwest Unova"] },
        { title: "Gym 1: Cheren (Normal)", summary: "Aspertia City Gym. Cheren uses Patrat (Lv11) and Lillipup (Lv13). Fighting.", recommendedLevel: 13, keyBattles: ["Cheren (Basic Badge)"] },
        { title: "Gym 2: Roxie (Poison)", summary: "Virbank City Gym. Roxie uses Koffing (Lv16) and Whirlipede (Lv18). Psychic and Ground.", recommendedLevel: 18, keyBattles: ["Roxie (Toxic Badge)"] },
        { title: "Gym 3: Burgh (Bug)", summary: "Castelia City Gym. Burgh uses Swadloon (Lv22), Dwebble (Lv22), and Leavanny (Lv24). Fire and Flying.", recommendedLevel: 24, keyBattles: ["Burgh (Insect Badge)"] },
        { title: "Gym 4: Elesa (Electric)", summary: "Nimbasa City Gym. Walk the fashion runway. Elesa uses Emolga (Lv28), Flaaffy (Lv28), and Zebstrika (Lv30). Ground.", recommendedLevel: 30, keyBattles: ["Elesa (Bolt Badge)"] },
        { title: "Gym 5: Clay (Ground)", summary: "Driftveil City Gym. Clay uses Krokorok (Lv31), Sandslash (Lv31), and Excadrill (Lv33). Water and Grass.", recommendedLevel: 33, keyBattles: ["Clay (Quake Badge)"] },
        { title: "Gym 6: Skyla (Flying)", summary: "Mistralton City Gym. Fly through cannons. Skyla uses Swoobat (Lv37), Skarmory (Lv37), and Swanna (Lv39). Electric and Ice.", recommendedLevel: 39, keyBattles: ["Skyla (Jet Badge)"] },
        { title: "Gym 7: Drayden (Dragon)", summary: "Opelucid City Gym. Drayden uses Druddigon (Lv46), Flygon (Lv46), and Haxorus (Lv48). Ice and Dragon.", recommendedLevel: 48, keyBattles: ["Drayden (Legend Badge)"] },
        { title: "Gym 8: Marlon (Water)", summary: "Humilau City Gym. Marlon uses Carracosta (Lv49), Wailord (Lv49), and Jellicent (Lv51). Electric and Grass.", recommendedLevel: 51, keyBattles: ["Marlon (Wave Badge)"] },
      ],
    },
    {
      title: "Team Plasma & Pokemon League",
      steps: [
        { title: "Giant Chasm and Team Plasma", summary: "Confront Team Plasma at the Giant Chasm. Battle Ghetsis and encounter Black/White Kyurem.", recommendedLevel: 50, keyBattles: ["Colress", "Shadow Triad", "Ghetsis", "Black/White Kyurem"], tips: ["Black Kyurem appears in Black 2; White Kyurem in White 2"] },
        { title: "Victory Road", summary: "Navigate Victory Road. Hugh joins you for some double battles along the way.", recommendedLevel: 53 },
        { title: "Elite Four: Shauntal (Ghost)", summary: "Shauntal uses Cofagrigus (Lv56), Golurk (Lv56), Chandelure (Lv58), and Drifblim (Lv56). Dark moves.", recommendedLevel: 56, keyBattles: ["Shauntal"] },
        { title: "Elite Four: Grimsley (Dark)", summary: "Grimsley uses Liepard (Lv56), Krookodile (Lv56), Scrafty (Lv56), and Bisharp (Lv58). Fighting and Bug.", recommendedLevel: 57, keyBattles: ["Grimsley"] },
        { title: "Elite Four: Caitlin (Psychic)", summary: "Caitlin uses Musharna (Lv56), Sigilyph (Lv56), Reuniclus (Lv56), and Gothitelle (Lv58). Dark and Bug.", recommendedLevel: 57, keyBattles: ["Caitlin"] },
        { title: "Elite Four: Marshal (Fighting)", summary: "Marshal uses Throh (Lv56), Sawk (Lv56), Mienshao (Lv56), and Conkeldurr (Lv58). Flying and Psychic.", recommendedLevel: 57, keyBattles: ["Marshal"] },
        { title: "Champion: Iris", summary: "Iris uses Hydreigon (Lv57), Druddigon (Lv57), Aggron (Lv57), Archeops (Lv57), Lapras (Lv57), and Haxorus (Lv59). Ice moves for Dragons.", recommendedLevel: 58, keyBattles: ["Champion Iris"], tips: ["Iris has the most diverse champion team; prepare type coverage for Dragon, Rock, Steel, and Water"] },
      ],
    },
  ],

  "game:omega-ruby-alpha-sapphire": [
    {
      title: "Hoenn Gym Challenge",
      steps: [
        { title: "Littleroot to Rustboro City", summary: "Choose your starter from Professor Birch. The DexNav feature lets you find Pokemon with egg moves and hidden abilities.", recommendedLevel: 14, keyBattles: ["Rival battle (Route 103)"] },
        { title: "Gym 1: Roxanne (Rock)", summary: "Rustboro City Gym. Roxanne uses Geodude (Lv12), Geodude (Lv12), and Nosepass (Lv14). Water and Grass.", recommendedLevel: 14, keyBattles: ["Roxanne (Stone Badge)"] },
        { title: "Gym 2: Brawly (Fighting)", summary: "Dewford Town Gym. Brawly uses Machop (Lv14), Meditite (Lv14), and Makuhita (Lv16). Flying and Psychic.", recommendedLevel: 16, keyBattles: ["Brawly (Knuckle Badge)"] },
        { title: "Gym 3: Wattson (Electric)", summary: "Mauville City Gym (now a shopping mall). Wattson uses Magnemite (Lv19), Voltorb (Lv19), and Magneton (Lv21). Ground.", recommendedLevel: 21, keyBattles: ["Wattson (Dynamo Badge)"] },
        { title: "Gym 4: Flannery (Fire)", summary: "Lavaridge Town Gym. Flannery uses Slugma (Lv26), Numel (Lv26), and Torkoal (Lv28). Water and Ground.", recommendedLevel: 28, keyBattles: ["Flannery (Heat Badge)"] },
        { title: "Gym 5: Norman (Normal)", summary: "Petalburg City Gym. Norman uses Spinda (Lv27), Vigoroth (Lv27), Linoone (Lv29), and Slaking (Lv31). Fighting.", recommendedLevel: 31, keyBattles: ["Norman (Balance Badge)"] },
        { title: "Gym 6: Winona (Flying)", summary: "Fortree City Gym. Winona uses Swellow (Lv33), Pelipper (Lv33), Skarmory (Lv33), and Altaria (Lv35). Electric and Ice.", recommendedLevel: 35, keyBattles: ["Winona (Feather Badge)"] },
        { title: "Primal Reversion Crisis", summary: "Team Aqua/Magma awakens Primal Kyogre/Groudon. The legendary undergoes Primal Reversion, threatening the region.", recommendedLevel: 42, keyBattles: ["Maxie/Archie", "Primal Groudon/Kyogre"], tips: ["You must catch or defeat the Primal legendary to proceed with the story"] },
        { title: "Gym 7: Tate & Liza (Psychic)", summary: "Mossdeep City Gym. Double battle with Solrock (Lv45) and Lunatone (Lv45). Dark and Water.", recommendedLevel: 45, keyBattles: ["Tate & Liza (Mind Badge)"] },
        { title: "Gym 8: Wallace (Water)", summary: "Sootopolis City Gym. Wallace uses Luvdisc (Lv44), Whiscash (Lv44), Sealeo (Lv44), Seaking (Lv44), and Milotic (Lv46). Electric and Grass.", recommendedLevel: 46, keyBattles: ["Wallace (Rain Badge)"] },
      ],
    },
    {
      title: "Pokemon League",
      steps: [
        { title: "Victory Road", summary: "Navigate Victory Road. Wally challenges you at the end.", recommendedLevel: 48, keyBattles: ["Wally (Victory Road)"] },
        { title: "Elite Four and Champion Steven", summary: "Face Sidney (Dark), Phoebe (Ghost), Glacia (Ice), Drake (Dragon), and Champion Steven with his Mega Metagross.", recommendedLevel: 58, keyBattles: ["Sidney", "Phoebe", "Glacia", "Drake", "Champion Steven"], tips: ["Steven's Mega Metagross is extremely powerful; bring Fire or Ground coverage"] },
        { title: "Delta Episode", summary: "A postgame story involving Zinnia, Rayquaza, and Mega Rayquaza. Travel to space to destroy a meteorite and battle Deoxys.", recommendedLevel: 60, keyBattles: ["Zinnia", "Deoxys"], tips: ["You can catch Rayquaza and teach it Dragon Ascent to Mega Evolve without a Mega Stone"] },
      ],
    },
  ],

  "game:sun-moon": [
    {
      title: "Island Challenge",
      steps: [
        { title: "Melemele Island", summary: "Receive your starter (Rowlet, Litten, or Popplio) from Professor Kukui. Alola replaces gyms with island trials and Totem Pokemon.", recommendedLevel: 12, keyBattles: ["Rival Hau battle"], tips: ["Totem Pokemon get stat boosts and can call allies; focus the Totem first"] },
        { title: "Trial 1: Ilima (Normal)", summary: "Verdant Cavern trial. Defeat Totem Gumshoos (Sun) or Raticate (Moon) at Lv12.", recommendedLevel: 12, keyBattles: ["Totem Gumshoos/Raticate"] },
        { title: "Grand Trial: Hala (Fighting)", summary: "Melemele Kahuna. Hala uses Machop (Lv15), Makuhita (Lv15), and Crabrawler (Lv16). Flying and Psychic.", recommendedLevel: 16, keyBattles: ["Kahuna Hala"] },
        { title: "Akala Island Trials", summary: "Complete Lana's Water trial (Totem Wishiwashi, Lv20), Kiawe's Fire trial (Totem Salazzle, Lv22), and Mallow's Grass trial (Totem Lurantis, Lv24).", recommendedLevel: 24, keyBattles: ["Totem Wishiwashi", "Totem Salazzle", "Totem Lurantis"] },
        { title: "Grand Trial: Olivia (Rock)", summary: "Akala Kahuna. Olivia uses Nosepass (Lv27), Boldore (Lv27), and Lycanroc (Lv28). Water and Grass.", recommendedLevel: 28, keyBattles: ["Kahuna Olivia"] },
        { title: "Ula'ula Island Trials", summary: "Complete Sophocles's Electric trial (Totem Vikavolt, Lv29) and Acerola's Ghost trial (Totem Mimikyu, Lv33).", recommendedLevel: 33, keyBattles: ["Totem Vikavolt", "Totem Mimikyu"], tips: ["Mimikyu's Disguise ability blocks the first hit; use a multi-hit move or break it first"] },
        { title: "Grand Trial: Nanu (Dark)", summary: "Ula'ula Kahuna. Nanu uses Sableye (Lv38), Krokorok (Lv38), and Persian (Lv39). Fighting and Bug.", recommendedLevel: 39, keyBattles: ["Kahuna Nanu"] },
        { title: "Poni Island and Vast Poni Canyon", summary: "Complete the final trial in Vast Poni Canyon. Battle Totem Kommo-o (Lv45).", recommendedLevel: 45, keyBattles: ["Totem Kommo-o"], tips: ["Fairy moves destroy Kommo-o thanks to its Dragon/Fighting typing"] },
        { title: "Grand Trial: Hapu (Ground)", summary: "Poni Kahuna. Hapu uses Dugtrio (Lv47), Gastrodon (Lv47), Flygon (Lv47), and Mudsdale (Lv48). Water and Grass.", recommendedLevel: 48, keyBattles: ["Kahuna Hapu"] },
      ],
    },
    {
      title: "Pokemon League",
      steps: [
        { title: "Mount Lanakila and Pokemon League", summary: "Climb Mount Lanakila. The Alola Pokemon League is newly established by Professor Kukui.", recommendedLevel: 50 },
        { title: "Elite Four and Champion Battle", summary: "Face Hala (Fighting), Olivia (Rock), Acerola (Ghost), and Kahili (Flying). Then defend your title against Professor Kukui.", recommendedLevel: 56, keyBattles: ["Hala", "Olivia", "Acerola", "Kahili", "Professor Kukui"], tips: ["You become the first-ever Alola Champion; the title defense format continues in postgame"] },
      ],
    },
  ],

  "game:ultra-sun-ultra-moon": [
    {
      title: "Island Challenge",
      steps: [
        { title: "Melemele Island", summary: "Same starter choices as Sun/Moon. USUM adds new Totem Pokemon and the Ultra Recon Squad storyline.", recommendedLevel: 12, keyBattles: ["Rival Hau battle"] },
        { title: "Trial 1: Ilima (Normal)", summary: "Verdant Cavern. Totem Gumshoos (US) or Raticate (UM) at Lv12.", recommendedLevel: 12, keyBattles: ["Totem Gumshoos/Raticate"] },
        { title: "Grand Trial: Hala (Fighting)", summary: "Hala uses Machop, Makuhita, and Crabrawler. Flying and Psychic.", recommendedLevel: 16, keyBattles: ["Kahuna Hala"] },
        { title: "Akala Island Trials", summary: "Lana's trial (Totem Araquanid, Lv20), Kiawe's trial (Totem Marowak, Lv22), Mallow's trial (Totem Lurantis, Lv24).", recommendedLevel: 24, keyBattles: ["Totem Araquanid", "Totem Marowak", "Totem Lurantis"], tips: ["USUM changes some Totem Pokemon from SM; Araquanid and Alolan Marowak are new"] },
        { title: "Grand Trial: Olivia (Rock)", summary: "Olivia uses Nosepass, Boldore, and Lycanroc Midnight Form.", recommendedLevel: 28, keyBattles: ["Kahuna Olivia"] },
        { title: "Ula'ula Island Trials", summary: "Sophocles's trial (Totem Togedemaru, Lv33) and Acerola's trial (Totem Mimikyu, Lv35).", recommendedLevel: 35, keyBattles: ["Totem Togedemaru", "Totem Mimikyu"] },
        { title: "Grand Trial: Nanu (Dark)", summary: "Nanu uses Sableye, Krokorok, and Alolan Persian.", recommendedLevel: 39, keyBattles: ["Kahuna Nanu"] },
        { title: "Poni Island and Ultra Necrozma", summary: "Ascend Megalo Tower and battle Ultra Necrozma (Lv60), the hardest mandatory battle in the game.", recommendedLevel: 50, keyBattles: ["Ultra Necrozma"], tips: ["Ultra Necrozma has a massive stat boost; Toxic stalling or a Zoroark with Illusion can cheese the fight"] },
        { title: "Grand Trial: Hapu (Ground)", summary: "Hapu uses Dugtrio, Gastrodon, Flygon, and Mudsdale.", recommendedLevel: 48, keyBattles: ["Kahuna Hapu"] },
      ],
    },
    {
      title: "Pokemon League",
      steps: [
        { title: "Mount Lanakila", summary: "Climb Mount Lanakila to reach the Pokemon League.", recommendedLevel: 52 },
        { title: "Elite Four and Champion", summary: "Face Molayne (Steel), Olivia (Rock), Acerola (Ghost), and Kahili (Flying). Defend your title against Hau.", recommendedLevel: 58, keyBattles: ["Molayne", "Olivia", "Acerola", "Kahili", "Hau"], tips: ["Molayne replaces Hala in the E4 for USUM; the postgame includes the Rainbow Rocket episode with all past villains"] },
      ],
    },
  ],

  "game:lets-go-pikachu-lets-go-eevee": [
    {
      title: "Kanto Gym Challenge",
      steps: [
        { title: "Pallet Town to Pewter City", summary: "Receive your partner Pikachu or Eevee. Wild Pokemon are visible and caught using a throwing mechanic inspired by Pokemon GO.", recommendedLevel: 12, keyBattles: ["Rival battle (Route 22)"], tips: ["Your partner Pokemon learns exclusive moves that cover most type matchups", "Catch combos raise shiny odds and give bonus XP"] },
        { title: "Gym 1: Brock (Rock)", summary: "Pewter City Gym. Requires a Grass or Water-type in party to enter. Brock uses Geodude (Lv11) and Onix (Lv12).", recommendedLevel: 12, keyBattles: ["Brock (Boulder Badge)"], tips: ["Partner Pikachu learns Zippy Zap (Electric); Partner Eevee learns Bouncy Bubble (Water)"] },
        { title: "Gym 2: Misty (Water)", summary: "Cerulean City Gym. Misty uses Psyduck (Lv18) and Starmie (Lv19). Electric and Grass.", recommendedLevel: 19, keyBattles: ["Misty (Cascade Badge)"] },
        { title: "Gym 3: Lt. Surge (Electric)", summary: "Vermilion City Gym. Lt. Surge uses Voltorb (Lv25), Magnemite (Lv25), and Raichu (Lv26). Ground.", recommendedLevel: 26, keyBattles: ["Lt. Surge (Thunder Badge)"] },
        { title: "Gym 4: Erika (Grass)", summary: "Celadon City Gym. Erika uses Tangela (Lv33), Weepinbell (Lv33), and Vileplume (Lv34). Fire and Flying.", recommendedLevel: 34, keyBattles: ["Erika (Rainbow Badge)"] },
        { title: "Gym 5: Koga (Poison)", summary: "Fuchsia City Gym. Koga uses Weezing (Lv43), Muk (Lv43), Golbat (Lv43), and Venomoth (Lv44). Psychic and Ground.", recommendedLevel: 44, keyBattles: ["Koga (Soul Badge)"] },
        { title: "Gym 6: Sabrina (Psychic)", summary: "Saffron City Gym. Sabrina uses Mr. Mime (Lv43), Slowbro (Lv43), Jynx (Lv43), and Alakazam (Lv44). Bug and Dark.", recommendedLevel: 44, keyBattles: ["Sabrina (Marsh Badge)"] },
        { title: "Gym 7: Blaine (Fire)", summary: "Cinnabar Island Gym. Blaine uses Magmar (Lv47), Rapidash (Lv47), and Arcanine (Lv48). Water and Ground.", recommendedLevel: 48, keyBattles: ["Blaine (Volcano Badge)"] },
        { title: "Gym 8: Giovanni (Ground)", summary: "Viridian City Gym. Giovanni uses Dugtrio (Lv49), Nidoqueen (Lv49), Nidoking (Lv49), and Rhydon (Lv50).", recommendedLevel: 50, keyBattles: ["Giovanni (Earth Badge)"] },
      ],
    },
    {
      title: "Pokemon League",
      steps: [
        { title: "Victory Road", summary: "Navigate Victory Road. Coach trainers along the way offer rare rewards.", recommendedLevel: 52 },
        { title: "Elite Four and Champion", summary: "Face Lorelei (Ice), Bruno (Fighting), Agatha (Ghost), Lance (Dragon), and Champion Rival. Teams are adjusted for LGPE mechanics.", recommendedLevel: 58, keyBattles: ["Lorelei", "Bruno", "Agatha", "Lance", "Champion"], tips: ["Postgame unlocks Master Trainers — one for each of the original 151 Pokemon — as a completionist challenge"] },
      ],
    },
  ],

  "game:brilliant-diamond-shining-pearl": [
    {
      title: "Sinnoh Gym Challenge",
      steps: [
        { title: "Twinleaf to Jubilife City", summary: "Choose Turtwig, Chimchar, or Piplup. BDSP faithfully remakes Diamond/Pearl with updated graphics.", recommendedLevel: 10, keyBattles: ["Rival battle (Route 203)"] },
        { title: "Gym 1: Roark (Rock)", summary: "Oreburgh City Gym. Roark uses Geodude (Lv12), Onix (Lv12), and Cranidos (Lv14). Water and Grass.", recommendedLevel: 14, keyBattles: ["Roark (Coal Badge)"] },
        { title: "Gym 2: Gardenia (Grass)", summary: "Eterna City Gym. Gardenia uses Cherubi (Lv19), Turtwig (Lv19), and Roserade (Lv22). Fire and Flying.", recommendedLevel: 22, keyBattles: ["Gardenia (Forest Badge)"] },
        { title: "Gym 3: Maylene (Fighting)", summary: "Veilstone City Gym. Maylene uses Meditite (Lv27), Machoke (Lv27), and Lucario (Lv30). Flying and Psychic.", recommendedLevel: 30, keyBattles: ["Maylene (Cobble Badge)"] },
        { title: "Gym 4: Crasher Wake (Water)", summary: "Pastoria City Gym. Wake uses Gyarados (Lv27), Quagsire (Lv27), and Floatzel (Lv30). Electric and Grass.", recommendedLevel: 30, keyBattles: ["Crasher Wake (Fen Badge)"] },
        { title: "Gym 5: Fantina (Ghost)", summary: "Hearthome City Gym. Fantina uses Duskull (Lv24), Haunter (Lv24), and Mismagius (Lv26). Dark.", recommendedLevel: 26, keyBattles: ["Fantina (Relic Badge)"], tips: ["BDSP keeps DP gym order; Fantina is the 5th gym but at lower levels than Platinum"] },
        { title: "Gym 6: Byron (Steel)", summary: "Canalave City Gym. Byron uses Bronzor (Lv36), Steelix (Lv36), and Bastiodon (Lv39). Fire and Fighting.", recommendedLevel: 39, keyBattles: ["Byron (Mine Badge)"] },
        { title: "Gym 7: Candice (Ice)", summary: "Snowpoint City Gym. Candice uses Snover (Lv38), Sneasel (Lv38), Medicham (Lv40), and Abomasnow (Lv42). Fire and Fighting.", recommendedLevel: 42, keyBattles: ["Candice (Icicle Badge)"] },
        { title: "Team Galactic Finale", summary: "Confront Cyrus at Spear Pillar. Dialga (BD) or Palkia (SP) appears. Catch or defeat the legendary to proceed.", recommendedLevel: 47, keyBattles: ["Cyrus (Spear Pillar)", "Dialga/Palkia"], tips: ["Save before the legendary encounter"] },
        { title: "Gym 8: Volkner (Electric)", summary: "Sunyshore City Gym. Volkner uses Raichu (Lv46), Ambipom (Lv47), Octillery (Lv47), and Luxray (Lv49). Ground.", recommendedLevel: 49, keyBattles: ["Volkner (Beacon Badge)"] },
      ],
    },
    {
      title: "Pokemon League",
      steps: [
        { title: "Victory Road", summary: "Navigate Victory Road to the Pokemon League.", recommendedLevel: 50 },
        { title: "Elite Four: Aaron (Bug)", summary: "Aaron uses Dustox (Lv53), Beautifly (Lv53), Vespiquen (Lv54), Heracross (Lv54), and Drapion (Lv57). Fire and Flying.", recommendedLevel: 55, keyBattles: ["Aaron"] },
        { title: "Elite Four: Bertha (Ground)", summary: "Bertha uses Quagsire (Lv55), Sudowoodo (Lv56), Golem (Lv56), Whiscash (Lv55), and Hippowdon (Lv59). Water and Grass.", recommendedLevel: 57, keyBattles: ["Bertha"] },
        { title: "Elite Four: Flint (Fire)", summary: "Flint uses Rapidash (Lv58), Steelix (Lv57), Drifblim (Lv58), Lopunny (Lv57), and Infernape (Lv61). Water and Ground.", recommendedLevel: 59, keyBattles: ["Flint"] },
        { title: "Elite Four: Lucian (Psychic)", summary: "Lucian uses Mr. Mime (Lv59), Girafarig (Lv59), Medicham (Lv60), Alakazam (Lv60), and Bronzong (Lv63). Dark and Bug.", recommendedLevel: 61, keyBattles: ["Lucian"] },
        { title: "Champion: Cynthia", summary: "Cynthia uses Spiritomb (Lv61), Roserade (Lv60), Gastrodon (Lv60), Lucario (Lv63), Milotic (Lv63), and Garchomp (Lv66). Ice for Garchomp.", recommendedLevel: 63, keyBattles: ["Champion Cynthia"], tips: ["BDSP Cynthia's rematch team in postgame is considered one of the hardest champion fights ever"] },
      ],
    },
  ],

  "game:legends-arceus": [
    {
      title: "Survey Missions",
      steps: [
        { title: "Obsidian Fieldlands", summary: "Arrive in ancient Hisui and join the Galaxy Expedition Team. Complete survey missions to fill the Pokedex. Catch and battle the Noble Kleavor.", recommendedLevel: 18, keyBattles: ["Noble Kleavor"], tips: ["Legends Arceus uses an action-RPG format; you throw Poke Balls in real-time and dodge attacks", "Complete Pokedex research tasks to increase your Star Rank"] },
        { title: "Crimson Mirelands", summary: "Travel to the Crimson Mirelands. Calm the frenzied Noble Lilligant.", recommendedLevel: 25, keyBattles: ["Noble Lilligant"] },
        { title: "Cobalt Coastlands", summary: "Explore the coastlands and calm Noble Arcanine. Ride Basculegion to traverse water.", recommendedLevel: 35, keyBattles: ["Noble Arcanine"] },
        { title: "Coronet Highlands", summary: "Scale the highlands and calm Noble Electrode. The story deepens around the space-time rift at Mt. Coronet.", recommendedLevel: 45, keyBattles: ["Noble Electrode"] },
        { title: "Alabaster Icelands", summary: "Brave the frozen north and calm Noble Avalugg.", recommendedLevel: 55, keyBattles: ["Noble Avalugg"] },
      ],
    },
    {
      title: "Climax and Postgame",
      steps: [
        { title: "Temple of Sinnoh", summary: "Confront the space-time rift at the Temple of Sinnoh. Battle and catch either Dialga or Palkia in their Origin Forme.", recommendedLevel: 65, keyBattles: ["Dialga/Palkia (Origin Forme)"], tips: ["The final boss uses a unique dodge-and-throw battle mechanic"] },
        { title: "Arceus Quest", summary: "Complete the Pokedex to Research Level 10 for every Pokemon (all 242). This unlocks the encounter with Arceus at the Temple of Sinnoh.", recommendedLevel: 75, keyBattles: ["Arceus"], tips: ["Arceus changes type during the fight; this is a multi-phase endurance battle"] },
      ],
    },
  ],
};
