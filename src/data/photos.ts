// Curated real photography (Unsplash CDN, all URLs HTTP-verified).
// Products rotate through their category pool; replace any image later
// from Admin → Media or the product editor (upload or paste a URL).
const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`;

export const CATEGORY_PHOTOS: Record<string, string[]> = {
  appliances: [U("1556911220-bff31c812dba"), U("1646592474094-342fbc28736c")],
  refrigerators: [U("1642466062960-309db8377da6"), U("1571175443880-49e1d25b2bc5"), U("1748274699808-50964cebce9c")],
  "washing-machines": [U("1626806787461-102c1bfaaea1"), U("1646592474094-342fbc28736c")],
  "clothes-dryers": [U("1646592474094-342fbc28736c"), U("1626806787461-102c1bfaaea1")],
  dishwashers: [U("1556911220-bff31c812dba"), U("1745846664210-756817e1b19c")],
  "air-conditioners": [U("1555041469-a586c61ea9bc"), U("1598928506311-c55ded91a20c")],
  kitchen: [U("1556911220-bff31c812dba"), U("1745846664210-756817e1b19c")],
  "air-fryers": [U("1745846664210-756817e1b19c"), U("1556911220-bff31c812dba")],
  "coffee-machines": [U("1495474472287-4d71bcdd2085"), U("1570222094114-d054a817e56b"), U("1517668808822-9ebb02f2a0e6")],
  microwaves: [U("1745846664210-756817e1b19c"), U("1556911220-bff31c812dba")],
  "kettles-toasters": [U("1495474472287-4d71bcdd2085"), U("1556911220-bff31c812dba")],
  "blenders-juicers": [U("1622818426197-d54f85b88690")],
  cookware: [U("1580929753603-10519c6e480a"), U("1631020280895-8449d8e1baaa"), U("1602143407151-7111542de6e8")],
  "tv-audio": [U("1598928506311-c55ded91a20c"), U("1593359677879-a4bb92f829d1")],
  "smart-tvs": [U("1593784991095-a205069470b6"), U("1593359677879-a4bb92f829d1"), U("1598928506311-c55ded91a20c")],
  "soundbars-speakers": [U("1608043152269-423dbba4e7e1"), U("1593359677879-a4bb92f829d1")],
  computers: [U("1496181133206-80ce9b88a853"), U("1593642632823-8f785ba67e45")],
  laptops: [U("1496181133206-80ce9b88a853"), U("1593642632823-8f785ba67e45"), U("1544244015-0df4b3ffc6b0")],
  monitors: [U("1527443224154-c4a3942d3acf"), U("1587829741301-dc798b83add3"), U("1593642632823-8f785ba67e45")],
  phones: [U("1511707171634-5f897ff02aa9")],
  smartphones: [U("1511707171634-5f897ff02aa9")],
  "audio-wearables": [U("1590658268037-6bf12165a8df"), U("1505740420928-5e560c06d30e"), U("1585771724684-38269d6639fd"), U("1523275335684-37898b6baf30")],
  gaming: [U("1592840496694-26d035b52b48"), U("1602610423018-9b72909e9f80"), U("1648597003966-f800d34bbfd9"), U("1590828211689-9b3474ef7fa3"), U("1592078615290-033ee584e267")],
  "smart-home": [U("1526170375885-4d8ecf77b99f"), U("1507473885765-e6ed057f782c"), U("1560518883-ce09059eeffa")],
  "home-living": [U("1555041469-a586c61ea9bc"), U("1586023492125-27b2c045efd7"), U("1507473885765-e6ed057f782c")],
  "vacuum-cleaners": [U("1558317374-067fb5f30001"), U("1555041469-a586c61ea9bc")],
  "personal-care": [U("1641130331708-dd0cc94ae8e5"), U("1553091844-4204b59e3661"), U("1674632655437-077f7edbe65c"), U("1522338242992-e1a54906a8da"), U("1541643600914-78b084683601")]
};

export function photosFor(slug: string): string[] {
  return CATEGORY_PHOTOS[slug] ?? CATEGORY_PHOTOS["home-living"];
}

export const HERO_PHOTOS = {
  livingRoom: U("1598928506311-c55ded91a20c"),
  kitchen: U("1556911220-bff31c812dba"),
  tvCloseup: U("1593784991095-a205069470b6"),
  coffee: U("1495474472287-4d71bcdd2085")
};
