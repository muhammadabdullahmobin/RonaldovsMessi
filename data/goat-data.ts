export type PlayerKey = "messi" | "ronaldo";

export type Source = {
  id: string;
  name: string;
  url: string;
  credibility: "Official" | "Specialist database" | "Major reference" | "Primary reporting";
  note: string;
};

export type Metric = {
  label: string;
  scope: string;
  messi: string | number;
  ronaldo: string | number;
  unit?: string;
  sourceIds: string[];
  updated: string;
  caveat?: string;
};

export const lastUpdated = "4 July 2026";

export const sources: Source[] = [
  {
    id: "uefa-ucl",
    name: "UEFA Champions League history rankings",
    url: "https://www.uefa.com/uefachampionsleague/history/rankings/players/",
    credibility: "Official",
    note: "Official UEFA competition records for appearances, goals, wins, and all-time rankings."
  },
  {
    id: "fifa-profiles",
    name: "FIFA player and World Cup records",
    url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup",
    credibility: "Official",
    note: "Official FIFA World Cup competition context, records, and player tournament material."
  },
  {
    id: "fbref",
    name: "FBref / StatsBomb data",
    url: "https://fbref.com/",
    credibility: "Specialist database",
    note: "Advanced event metrics such as xG, xA, progressive carries, pressures, and shot-creating actions."
  },
  {
    id: "transfermarkt",
    name: "Transfermarkt player records",
    url: "https://www.transfermarkt.com/",
    credibility: "Specialist database",
    note: "Club, transfer, injury, market, appearance, goal, assist, and trophy records with provider-specific definitions."
  },
  {
    id: "statbunker",
    name: "StatBunker competition tables",
    url: "https://www.statbunker.com/",
    credibility: "Specialist database",
    note: "Competition-by-competition goals, assists, discipline, minutes, and tournament tables."
  },
  {
    id: "iffhs",
    name: "IFFHS records archive",
    url: "https://www.iffhs.com/",
    credibility: "Specialist database",
    note: "Recognized archive for global scoring records, annual awards, and historical football rankings."
  },
  {
    id: "argentina",
    name: "Argentine Football Association",
    url: "https://www.afa.com.ar/",
    credibility: "Official",
    note: "Official Argentina national-team context and honours."
  },
  {
    id: "portugal",
    name: "Portuguese Football Federation",
    url: "https://www.fpf.pt/",
    credibility: "Official",
    note: "Official Portugal national-team context and honours."
  },
  {
    id: "justice",
    name: "Court and prosecutor statements",
    url: "https://www.poderjudicial.es/",
    credibility: "Primary reporting",
    note: "Primary legal material is preferred for tax cases and legal outcomes."
  }
];

export const navItems = [
  ["home", "Home"],
  ["career", "Career Comparison"],
  ["statistics", "Statistics"],
  ["trophies", "Trophies"],
  ["records", "Records"],
  ["style", "Playing Style"],
  ["international", "International Career"],
  ["club", "Club Career"],
  ["big-games", "Big Game Performances"],
  ["world-cup", "World Cup"],
  ["champions-league", "Champions League"],
  ["head-to-head", "Head-to-Head"],
  ["awards", "Awards"],
  ["controversies", "Controversies"],
  ["timeline", "Timeline"],
  ["analysis", "GOAT Analysis"],
  ["sources", "Sources"],
  ["verdict", "Final Verdict"]
] as const;

export const coreMetrics: Metric[] = [
  { label: "Senior career goals", scope: "Official senior club and national-team matches; provider totals vary as active seasons update", messi: "850+", ronaldo: "930+", sourceIds: ["iffhs", "transfermarkt", "statbunker"], updated: lastUpdated, caveat: "Use as a live-band figure because cup, friendly, and recent-match inclusion can differ by provider." },
  { label: "Senior assists", scope: "Official senior club and national-team assists where providers track assists", messi: "370+", ronaldo: "255+", sourceIds: ["transfermarkt", "statbunker"], updated: lastUpdated, caveat: "Historic assists are not uniformly recorded across all competitions." },
  { label: "UEFA Champions League goals", scope: "Group stage onward, excluding qualifying", messi: 129, ronaldo: 140, sourceIds: ["uefa-ucl"], updated: lastUpdated },
  { label: "UEFA Champions League appearances", scope: "Group stage onward, excluding qualifying", messi: 163, ronaldo: 183, sourceIds: ["uefa-ucl"], updated: lastUpdated },
  { label: "World Cup goals", scope: "FIFA World Cup finals through Qatar 2022 in stable official records", messi: 13, ronaldo: 8, sourceIds: ["fifa-profiles"], updated: lastUpdated },
  { label: "World Cup appearances", scope: "FIFA World Cup finals through Qatar 2022 in stable official records", messi: 26, ronaldo: 22, sourceIds: ["fifa-profiles"], updated: lastUpdated },
  { label: "Ballon d'Or awards", scope: "France Football men's Ballon d'Or", messi: 8, ronaldo: 5, sourceIds: ["transfermarkt"], updated: lastUpdated },
  { label: "European Golden Shoes", scope: "Top domestic league scorer in Europe", messi: 6, ronaldo: 4, sourceIds: ["transfermarkt"], updated: lastUpdated },
  { label: "International senior goals", scope: "Official senior national-team matches; live total changes with fixtures", messi: "110+", ronaldo: "130+", sourceIds: ["fifa-profiles", "portugal", "argentina"], updated: lastUpdated, caveat: "Marked as live-band because international fixtures continue and official feeds update at different times." },
  { label: "Hat-tricks", scope: "Official senior career, provider definitions vary", messi: "55+", ronaldo: "65+", sourceIds: ["transfermarkt", "statbunker"], updated: lastUpdated },
  { label: "Free-kick goals", scope: "Official senior career direct free kicks; database reconciliation required", messi: "65+", ronaldo: "60+", sourceIds: ["statbunker", "transfermarkt"], updated: lastUpdated },
  { label: "Red cards", scope: "Official senior career discipline", messi: "3", ronaldo: "12", sourceIds: ["statbunker", "transfermarkt"], updated: lastUpdated }
];

export const expandedMetrics: Metric[] = [
  "Non-penalty goals|All senior matches|Provider reconciliation required|Provider reconciliation required",
  "Goals per game|All senior matches|Computed from selected provider totals|Computed from selected provider totals",
  "Minutes per goal|All senior matches|Competition-filter dependent|Competition-filter dependent",
  "Minutes per goal contribution|All senior matches|Competition-filter dependent|Competition-filter dependent",
  "Expected goals|League and tracked competitions|FBref era only|FBref era only",
  "Expected assists|League and tracked competitions|FBref era only|FBref era only",
  "Big chances created|Tracked domestic and European datasets|Opta-provider dependent|Opta-provider dependent",
  "Club goals|Official club matches|Live-band total|Live-band total",
  "Knockout goals|Selected tournament knockout stages|Filter available|Filter available",
  "Final goals|Official finals|Provider reconciliation required|Provider reconciliation required",
  "Final assists|Official finals|Provider reconciliation required|Provider reconciliation required",
  "Goals vs Top 5 leagues|Opposition league filter|Database query required|Database query required",
  "Goals vs Top 10 FIFA nations|International opposition filter|Database query required|Database query required",
  "Goals after age 30|Age split|Database query required|Database query required",
  "Goals before age 30|Age split|Database query required|Database query required",
  "Left-foot goals|Shot-foot split|Tracked-provider dependent|Tracked-provider dependent",
  "Right-foot goals|Shot-foot split|Tracked-provider dependent|Tracked-provider dependent",
  "Header goals|Body-part split|Tracked-provider dependent|Tracked-provider dependent",
  "Outside-box goals|Shot-location split|Tracked-provider dependent|Tracked-provider dependent",
  "Inside-box goals|Shot-location split|Tracked-provider dependent|Tracked-provider dependent",
  "Successful dribbles|Event-data era|Elite all-time rate|High-volume winger/forward peak",
  "Key passes|Event-data era|Elite creator profile|Strong but lower creator profile",
  "Chances created|Event-data era|Elite creator profile|Strong but lower creator profile",
  "Progressive carries|FBref era|Elite ball progression|Role-dependent, lower than Messi peak",
  "Defensive actions|Event-data era|Role and team dependent|Role and team dependent",
  "Pressing|Event-data era|Lower late-career volume|Higher athletic peak, late-career decline",
  "Distance covered|Tracked competitions|Role-dependent|Role-dependent",
  "Minutes played|All senior matches|Provider reconciliation required|Provider reconciliation required",
  "Yellow cards|Official senior career|Provider reconciliation required|Provider reconciliation required",
  "Penalties scored|Official senior career|Provider reconciliation required|Provider reconciliation required",
  "Penalties missed|Official senior career|Provider reconciliation required|Provider reconciliation required",
  "Penalty conversion rate|Official senior career|Computed from provider totals|Computed from provider totals",
  "Free-kick conversion rate|Shot-level tracked matches|Computed from tracked attempts|Computed from tracked attempts"
].map((row) => {
  const [label, scope, messi, ronaldo] = row.split("|");
  return { label, scope, messi, ronaldo, sourceIds: ["fbref", "statbunker", "transfermarkt"], updated: lastUpdated };
});

export const trophies = [
  ["League titles", 12, 7, "Messi: La Liga/Ligue 1/MLS Supporters' Shield context; Ronaldo: Premier League/La Liga/Serie A."],
  ["Champions League", 4, 5, "Ronaldo leads in titles and is the competition's all-time top scorer."],
  ["Domestic cups", 8, 7, "Provider grouping differs for league cups and super cups."],
  ["Club World Cups", 3, 4, "Both won multiple global club titles during European peaks."],
  ["International senior trophies", 4, 2, "Messi: World Cup, Copa America titles, Finalissima. Ronaldo: Euro 2016, Nations League."],
  ["Olympic medals", 1, 0, "Messi won Olympic gold with Argentina in 2008."],
  ["Ballon d'Or", 8, 5, "Individual award voting rewards different seasons and narratives."],
  ["Golden Shoes", 6, 4, "Domestic league scoring award."],
  ["Best FIFA awards", 3, 2, "Modern FIFA award era."],
  ["Player of tournament awards", 6, 4, "Includes major international and continental tournament awards where applicable."]
];

export const timeline = [
  ["1985", "Cristiano Ronaldo born in Madeira, Portugal."],
  ["1987", "Lionel Messi born in Rosario, Argentina."],
  ["2002", "Ronaldo debuts for Sporting CP."],
  ["2003", "Ronaldo joins Manchester United and Portugal senior team."],
  ["2004", "Messi makes Barcelona senior debut."],
  ["2006", "Both play their first FIFA World Cup."],
  ["2008", "Ronaldo wins first Ballon d'Or; Messi wins Olympic gold."],
  ["2009", "Ronaldo joins Real Madrid; Messi wins first Ballon d'Or and Barcelona treble."],
  ["2011", "Messi's Guardiola-era peak reshapes attacking-playmaker expectations."],
  ["2014", "Ronaldo wins Champions League La Decima season; Messi reaches World Cup final."],
  ["2016", "Ronaldo wins Euro 2016 with Portugal."],
  ["2018", "Ronaldo moves to Juventus; Messi continues Barcelona record run."],
  ["2021", "Messi wins Copa America and later joins PSG."],
  ["2022", "Messi wins the FIFA World Cup; Ronaldo joins Al Nassr after Manchester United exit."],
  ["2023", "Messi joins Inter Miami and wins eighth Ballon d'Or."],
  ["2024", "Both remain active outside Europe's top five leagues, extending the debate into a new phase."]
];

export const controversies = [
  {
    player: "Messi",
    title: "Spanish tax fraud case",
    status: "Verified fact",
    summary: "Spanish courts convicted Lionel Messi and his father over image-rights tax arrangements. The prison sentence was later replaced by a fine under Spanish law.",
    balanced: "Supporters argue he delegated complex tax structures to advisers; critics argue elite athletes remain responsible for their finances.",
    misconception: "The case was not about football performance or match manipulation.",
    sources: ["justice", "transfermarkt"]
  },
  {
    player: "Messi",
    title: "Growth hormone treatment myths",
    status: "Verified fact plus misinformation",
    summary: "Messi received medically prescribed growth hormone treatment as a child before Barcelona supported his development.",
    balanced: "The treatment is commonly distorted online; reliable accounts describe a medical condition rather than illicit performance enhancement.",
    misconception: "It should not be presented as doping without evidence.",
    sources: ["fifa-profiles"]
  },
  {
    player: "Messi",
    title: "Ballon d'Or and World Cup officiating debates",
    status: "Opinion / disputed claim",
    summary: "Some fans dispute individual-award votes and refereeing calls in major tournaments.",
    balanced: "Award voting is subjective and transparent by ballot; officiating debates require incident-level review, not broad claims of favoritism.",
    misconception: "Disagreement with a vote or penalty call is not evidence of institutional corruption.",
    sources: ["fifa-profiles"]
  },
  {
    player: "Messi",
    title: "PSG criticism, walking, and late-career defensive work",
    status: "Verified performance trend and opinion",
    summary: "Messi's off-ball defensive volume declined with age, and PSG supporters criticized some Champions League exits.",
    balanced: "Critics emphasize pressing and accountability; defenders emphasize chance creation, role design, and late-career efficiency.",
    misconception: "Low pressing volume does not automatically mean low impact.",
    sources: ["fbref", "statbunker"]
  },
  {
    player: "Ronaldo",
    title: "Las Vegas legal case",
    status: "Allegation and legal outcome",
    summary: "A civil case connected to a 2009 allegation was dismissed in U.S. federal court in 2022. Ronaldo denied wrongdoing. Allegations must not be stated as proven facts.",
    balanced: "Neutral coverage distinguishes the allegation, denial, procedural rulings, and absence of a criminal conviction.",
    misconception: "Dismissal of a civil case is not the same thing as a trial finding on every factual claim.",
    sources: ["justice"]
  },
  {
    player: "Ronaldo",
    title: "Spanish tax case",
    status: "Verified fact",
    summary: "Ronaldo accepted a suspended prison sentence and fine in Spain related to tax offences.",
    balanced: "Supporters cite advice from representatives and settlement context; critics argue it remains a serious legal finding.",
    misconception: "The case should not be conflated with football records or on-field conduct.",
    sources: ["justice"]
  },
  {
    player: "Ronaldo",
    title: "Manchester United interview and exit",
    status: "Verified fact plus opinion",
    summary: "Ronaldo gave a critical televised interview in 2022 and left Manchester United by mutual agreement.",
    balanced: "One side sees an unacceptable breach of club discipline; the other sees a player publicly challenging sporting standards and management.",
    misconception: "The exit does not erase either his first United peak or the breakdown of the second spell.",
    sources: ["transfermarkt"]
  },
  {
    player: "Ronaldo",
    title: "Saudi League, penalties, offside, tempers, and World Cup debates",
    status: "Mixed verified events and opinion",
    summary: "Late-career debates include league strength, penalty volume, disputed offside calls, visible frustration, red cards, and Portugal selection debates.",
    balanced: "Critics question context and adaptation; supporters cite longevity, commercial impact, continued scoring, and Portugal's historic dependence on his goals.",
    misconception: "League-strength criticism should be separated from the factual record of goals scored there.",
    sources: ["statbunker", "portugal"]
  }
];

export const goatCategories = [
  ["Longevity", 9.5, 10, "Both are outliers; Ronaldo's physical durability and volume edge this category."],
  ["Peak", 10, 9.5, "Messi's 2009-2012 creative-scoring peak is often treated as the highest all-around peak; Ronaldo's 2011-2018 scoring peak is comparable in output."],
  ["Playmaking", 10, 8, "Messi has the clearer creator profile by assists, key passes, carries, and chance creation."],
  ["Goalscoring", 9.5, 10, "Ronaldo leads all-time goal volume and Champions League goals; Messi has elite efficiency and non-penalty arguments."],
  ["Dribbling", 10, 8.5, "Messi's close control and progression are historically exceptional; Ronaldo's dribbling peak was explosive but evolved away from volume dribbling."],
  ["Creativity", 10, 8, "Messi more often functions as scorer, passer, and progression hub."],
  ["Leadership", 9, 9, "Different styles: Messi quieter and connective, Ronaldo vocal and demanding."],
  ["International success", 10, 9, "Messi owns the World Cup and Copa America arc; Ronaldo owns Portugal's first major senior trophy era."],
  ["Club success", 9.5, 10, "Ronaldo's multi-league and Champions League case is exceptional; Messi's Barcelona dominance is equally central."],
  ["Consistency", 10, 10, "Both sustained elite production for a historically long period."],
  ["Big-game performances", 9.5, 10, "Ronaldo's Champions League knockout catalogue is unmatched; Messi's finals and 2022 World Cup add major counterweight."],
  ["Adaptability", 9, 10, "Ronaldo transformed across leagues and roles; Messi transformed from winger to false nine to playmaker-forward."],
  ["Versatility", 10, 9, "Messi covers more playmaking zones; Ronaldo covers more forward profiles and aerial roles."],
  ["Awards", 10, 9, "Messi leads Ballon d'Ors; Ronaldo remains historically decorated."],
  ["Team impact", 10, 9.5, "Messi's on-ball gravity and creation slightly edge the holistic impact model."],
  ["Influence", 10, 10, "Both changed standards for training, production, branding, and youth-player imagination."],
  ["Popularity", 9.5, 10, "Ronaldo's global social reach is unmatched; Messi's cultural reach is similarly vast."],
  ["Cultural impact", 10, 10, "The rivalry itself is the cultural artifact."]
];

export const headToHead = [
  ["2008", "Barcelona vs Manchester United", "UCL semifinal", "Two tight legs; United advanced, Ronaldo missed a penalty in the first leg."],
  ["2009", "Barcelona vs Manchester United", "UCL final", "Messi scored; Barcelona won 2-0."],
  ["2011", "Barcelona vs Real Madrid", "UCL semifinal", "Messi's Bernabeu brace became one of the rivalry's defining performances."],
  ["2012", "Barcelona vs Real Madrid", "La Liga", "Ronaldo's Camp Nou winner helped Madrid toward the league title."],
  ["2017", "Real Madrid vs Barcelona", "La Liga", "Messi's stoppage-time winner and shirt celebration became iconic."],
  ["2020", "Barcelona vs Juventus", "UCL group", "Ronaldo scored two penalties in a Juventus win; Messi created heavily in defeat."]
];
