/* ============================================================
   Top 100 Golf Courses – Data & Functions
   Depends on globals: getCards(), getInitials(), getCurrentUser(),
   saveCurrentUser(), awardXP(), addFeedItem(), checkBadges(),
   showToast(), closeDetailModal(), setCardType(), renderPreviewCard(),
   getLevel()
   ============================================================ */

// ── 1. TOP_100_DATA ─────────────────────────────────────────
const TOP_100_DATA = {

  /* ---------- World ---------- */
  world: [
    {
      rank: 1,
      name: 'Pine Valley Golf Club',
      location: 'New Jersey',
      country: 'USA',
      type: 'Parkland',
      holes: 18,
      par: 70,
      yearBuilt: 1913,
      designer: 'George Crump & H.S. Colt',
      tags: ['parkland', 'championship'],
      description: 'Carved from the sandy pine forests of southern New Jersey, Pine Valley is a fearsome test of nerve where every shot demands precision over vast wastelands of sand and scrub. Widely regarded as the ultimate examination in golf.'
    },
    {
      rank: 2,
      name: 'Augusta National Golf Club',
      location: 'Georgia',
      country: 'USA',
      type: 'Parkland',
      holes: 18,
      par: 72,
      yearBuilt: 1933,
      designer: 'Alister MacKenzie & Bobby Jones',
      tags: ['parkland', 'championship'],
      description: 'Home of The Masters, Augusta National is a cathedral of azaleas and towering Georgia pines where Amen Corner has broken the hearts of the game\'s greatest champions. Its pristine conditioning sets the global standard.'
    },
    {
      rank: 3,
      name: 'Royal County Down',
      location: 'Newcastle',
      country: 'Northern Ireland',
      type: 'Links',
      holes: 18,
      par: 71,
      yearBuilt: 1889,
      designer: 'Old Tom Morris',
      tags: ['links', 'championship'],
      description: 'Set beneath the brooding Mountains of Mourne, Royal County Down weaves through towering dunes of gorse and heather in a landscape so wild and beautiful it borders on the spiritual. Its blind tee shots are among the most thrilling in golf.'
    },
    {
      rank: 4,
      name: 'Cypress Point Club',
      location: 'Pebble Beach, California',
      country: 'USA',
      type: 'Links',
      holes: 18,
      par: 72,
      yearBuilt: 1928,
      designer: 'Alister MacKenzie',
      tags: ['links', 'coastal'],
      description: 'A masterpiece that journeys from forest to dunes to jagged Pacific headlands, Cypress Point is pure theatre — culminating in the legendary par-3 16th across the crashing ocean. Golf\'s most exclusive and enchanting experience.'
    },
    {
      rank: 5,
      name: 'St Andrews Old Course',
      location: 'St Andrews',
      country: 'Scotland',
      type: 'Links',
      holes: 18,
      par: 72,
      yearBuilt: 1552,
      designer: 'Nature / Old Tom Morris',
      tags: ['links', 'championship'],
      description: 'The birthplace of golf, where the game has been played for over 600 years on a strip of rumpled links land beside the grey North Sea. Its massive double greens, hidden bunkers, and the iconic Swilcan Bridge make it a pilgrimage for every golfer.'
    },
    {
      rank: 6,
      name: 'Shinnecock Hills Golf Club',
      location: 'Southampton, New York',
      country: 'USA',
      type: 'Links',
      holes: 18,
      par: 70,
      yearBuilt: 1891,
      designer: 'William Flynn',
      tags: ['links', 'championship'],
      description: 'America\'s most authentic links experience sits atop windswept hills overlooking Peconic Bay, its fescue-lined fairways and deceptive greens demanding a ground-game rarely seen stateside. A five-time US Open venue of immense stature.'
    },
    {
      rank: 7,
      name: 'Royal Melbourne Golf Club (West)',
      location: 'Melbourne',
      country: 'Australia',
      type: 'Sandbelt',
      holes: 18,
      par: 71,
      yearBuilt: 1931,
      designer: 'Alister MacKenzie',
      tags: ['championship', 'heathland'],
      description: 'The crown jewel of Melbourne\'s famed Sandbelt, Royal Melbourne West features audaciously contoured greens and strategic bunkering that reward imagination over brute force. It is the southern hemisphere\'s undisputed masterwork.'
    },
    {
      rank: 8,
      name: 'Pebble Beach Golf Links',
      location: 'Pebble Beach, California',
      country: 'USA',
      type: 'Links',
      holes: 18,
      par: 72,
      yearBuilt: 1919,
      designer: 'Jack Neville & Douglas Grant',
      tags: ['links', 'coastal', 'championship'],
      description: 'Clinging to the rocky cliffs of the Monterey Peninsula, Pebble Beach offers the most dramatic ocean-side finish in golf — its final holes are etched into the collective memory of the game. One of the few major venues open to the public.'
    },
    {
      rank: 9,
      name: 'Muirfield',
      location: 'Gullane',
      country: 'Scotland',
      type: 'Links',
      holes: 18,
      par: 71,
      yearBuilt: 1891,
      designer: 'Old Tom Morris',
      tags: ['links', 'championship'],
      description: 'Home of The Honourable Company of Edinburgh Golfers — the oldest golf club in the world — Muirfield\'s two concentric loops ensure the wind attacks from every angle. Its honest, strategic design is the gold standard for championship links.'
    },
    {
      rank: 10,
      name: 'Royal Portrush Golf Club (Dunluce)',
      location: 'Portrush',
      country: 'Northern Ireland',
      type: 'Links',
      holes: 18,
      par: 72,
      yearBuilt: 1888,
      designer: 'H.S. Colt',
      tags: ['links', 'championship'],
      description: 'Perched on the rugged Antrim coast with views to the Scottish isles, Royal Portrush\'s Dunluce links is a white-knuckle ride through towering dunes and across deep valleys. Its triumphant return as an Open Championship venue confirmed its world-class pedigree.'
    },
    {
      rank: 11,
      name: 'Sand Hills Golf Club',
      location: 'Mullen, Nebraska',
      country: 'USA',
      type: 'Links',
      holes: 18,
      par: 71,
      yearBuilt: 1995,
      designer: 'Coore & Crenshaw',
      tags: ['links'],
      description: 'Rising from the vast grass-covered dunes of the Nebraska Sandhills, this remote gem feels as if the holes were discovered rather than built. Its minimalist routing through pristine prairie landscape is modern golf design at its philosophical peak.'
    },
    {
      rank: 12,
      name: 'National Golf Links of America',
      location: 'Southampton, New York',
      country: 'USA',
      type: 'Links',
      holes: 18,
      par: 71,
      yearBuilt: 1911,
      designer: 'Charles B. Macdonald',
      tags: ['links'],
      description: 'Charles Blair Macdonald\'s love letter to the great holes of Britain, transplanted onto the windswept shores of Peconic Bay. Its template holes — Redan, Biarritz, Cape — defined American golf architecture for a century.'
    }
  ],

  /* ---------- Africa ---------- */
  africa: [
    {
      rank: 1,
      name: 'Leopard Creek CC',
      location: 'Mpumalanga',
      country: 'South Africa',
      type: 'Parkland',
      holes: 18,
      par: 72,
      yearBuilt: 1996,
      designer: 'Gary Player',
      tags: ['parkland', 'championship'],
      description: 'Bordering the Kruger National Park, Leopard Creek delivers championship golf with the chance of spotting crocodiles, hippos, and elephants beyond the boundary fences. Gary Player called it his finest design on the African continent.'
    },
    {
      rank: 2,
      name: 'Fancourt Links',
      location: 'George',
      country: 'South Africa',
      type: 'Links',
      holes: 18,
      par: 73,
      yearBuilt: 2000,
      designer: 'Gary Player',
      tags: ['links', 'championship'],
      description: 'Built on a disused airstrip in the Garden Route, Fancourt Links is an audacious inland links creation with vast fescue dunes and deep pot bunkers that rival anything in the British Isles. It hosted the dramatic 2003 Presidents Cup.'
    },
    {
      rank: 3,
      name: 'Pearl Valley',
      location: 'Paarl',
      country: 'South Africa',
      type: 'Parkland',
      holes: 18,
      par: 72,
      yearBuilt: 2003,
      designer: 'Jack Nicklaus',
      tags: ['parkland'],
      description: 'Framed by the dramatic peaks of the Drakenstein mountains and surrounded by Cape Winelands vineyards, Pearl Valley is Nicklaus design at its most scenic. Immaculate conditioning and strategic water features make every round memorable.'
    },
    {
      rank: 4,
      name: 'Durban Country Club',
      location: 'Durban',
      country: 'South Africa',
      type: 'Links/Parkland',
      holes: 18,
      par: 72,
      yearBuilt: 1920,
      designer: 'George Waterman & Laurie Waters',
      tags: ['links', 'championship'],
      description: 'A unique hybrid of links and bush-veld golf set among towering dunes on the Indian Ocean coast, Durban Country Club has hosted more South African Opens than any other venue. Its 3rd hole is one of the great par 5s in world golf.'
    },
    {
      rank: 5,
      name: 'Royal Cape Golf Club',
      location: 'Cape Town',
      country: 'South Africa',
      type: 'Parkland',
      holes: 18,
      par: 72,
      yearBuilt: 1885,
      designer: 'Various',
      tags: ['parkland', 'championship'],
      description: 'The oldest golf club in Africa, Royal Cape lies in the shadow of Table Mountain and Devil\'s Peak with a rich history stretching back to the Victorian era. Its tree-lined fairways and subtle greens reward patience and precision.'
    },
    {
      rank: 6,
      name: 'The Links at Fancourt',
      location: 'George',
      country: 'South Africa',
      type: 'Links',
      holes: 18,
      par: 72,
      yearBuilt: 1997,
      designer: 'Gary Player',
      tags: ['links'],
      description: 'The original Fancourt links layout predating its more famous sibling, this course threads through natural fynbos and undulating terrain in the heart of the Garden Route. It offers a stern but fair test in a spectacular setting.'
    },
    {
      rank: 7,
      name: 'Pinnacle Point',
      location: 'Mossel Bay',
      country: 'South Africa',
      type: 'Clifftop',
      holes: 18,
      par: 72,
      yearBuilt: 2006,
      designer: 'Peter Matkovich',
      tags: ['coastal', 'championship'],
      description: 'Seven holes hug sheer ocean cliffs where ancient caves once sheltered early humans, making Pinnacle Point one of the most visually staggering courses on Earth. The carries over rocky gorges are not for the faint-hearted.'
    },
    {
      rank: 8,
      name: 'Sun City Gary Player CC',
      location: 'North West',
      country: 'South Africa',
      type: 'Parkland',
      holes: 18,
      par: 72,
      yearBuilt: 1979,
      designer: 'Gary Player',
      tags: ['parkland', 'championship'],
      description: 'Home of the Nedbank Golf Challenge — "Africa\'s Major" — this dramatic course winds through volcanic rock and bushveld in the Pilanesberg mountains. Its challenging layout has tested the world\'s best for over four decades.'
    },
    {
      rank: 9,
      name: 'Legend Golf & Safari',
      location: 'Limpopo',
      country: 'South Africa',
      type: 'Parkland',
      holes: 18,
      par: 72,
      yearBuilt: 2007,
      designer: '18 Different Designers',
      tags: ['parkland'],
      description: 'Each hole designed by a different golfing legend — from Player to Singh to Els — Legend is set within a Big Five game reserve in the Waterberg mountains. Its infamous Extreme 19th is played from a clifftop tee accessible only by helicopter.'
    },
    {
      rank: 10,
      name: 'Ile aux Cerfs GC',
      location: 'Mauritius',
      country: 'Mauritius',
      type: 'Island',
      holes: 18,
      par: 72,
      yearBuilt: 2003,
      designer: 'Bernhard Langer',
      tags: ['coastal'],
      description: 'Accessible only by boat, this island course off the east coast of Mauritius meanders through mangroves, volcanic rock outcrops, and pristine lagoons. Bernhard Langer crafted a tropical paradise where golf meets the Indian Ocean.'
    },
    {
      rank: 11,
      name: 'Arabella Golf Club',
      location: 'Kleinmond',
      country: 'South Africa',
      type: 'Parkland',
      holes: 18,
      par: 72,
      yearBuilt: 1999,
      designer: 'Peter Matkovich',
      tags: ['parkland'],
      description: 'Stretching along the Bot River Lagoon with the Kogelberg mountains as a backdrop, Arabella is a serene parkland experience in the Overberg region. Its water-laced back nine provides a dramatic crescendo to every round.'
    },
    {
      rank: 12,
      name: 'De Zalze Golf Club',
      location: 'Stellenbosch',
      country: 'South Africa',
      type: 'Parkland',
      holes: 18,
      par: 72,
      yearBuilt: 2002,
      designer: 'Peter Matkovich',
      tags: ['parkland'],
      description: 'Winding through ancient oak trees and working vineyards in the heart of Stellenbosch wine country, De Zalze is a beautiful fusion of golf and viticulture. Mountain views and meticulous design make it a Winelands gem.'
    }
  ],

  /* ---------- Europe ---------- */
  europe: [
    {
      rank: 1,
      name: 'Royal County Down',
      location: 'Newcastle',
      country: 'Northern Ireland',
      type: 'Links',
      holes: 18,
      par: 71,
      yearBuilt: 1889,
      designer: 'Old Tom Morris',
      tags: ['links', 'championship'],
      description: 'Set beneath the brooding Mountains of Mourne, Royal County Down weaves through towering dunes of gorse and heather in a landscape so wild and beautiful it borders on the spiritual. Its blind tee shots are among the most thrilling in golf.'
    },
    {
      rank: 2,
      name: 'Royal Portrush (Dunluce)',
      location: 'Portrush',
      country: 'Northern Ireland',
      type: 'Links',
      holes: 18,
      par: 72,
      yearBuilt: 1888,
      designer: 'H.S. Colt',
      tags: ['links', 'championship'],
      description: 'Perched on the rugged Antrim coast with views to the Scottish isles, the Dunluce links is a white-knuckle ride through towering dunes and deep valleys. Its return as an Open Championship venue cemented its place among Europe\'s finest.'
    },
    {
      rank: 3,
      name: 'Ballybunion (Old)',
      location: 'Ballybunion',
      country: 'Ireland',
      type: 'Links',
      holes: 18,
      par: 71,
      yearBuilt: 1893,
      designer: 'Various',
      tags: ['links'],
      description: 'Clinging to eroding cliffs on Ireland\'s wild Atlantic coast, Ballybunion Old is raw, dramatic links golf at its most elemental. Tom Watson once said it was a golf course he\'d choose for his last round on Earth.'
    },
    {
      rank: 4,
      name: 'Valderrama',
      location: 'Sotogrande',
      country: 'Spain',
      type: 'Parkland',
      holes: 18,
      par: 71,
      yearBuilt: 1974,
      designer: 'Robert Trent Jones Sr.',
      tags: ['parkland', 'championship'],
      description: 'The Augusta of Europe, Valderrama is a meticulously manicured masterpiece of cork oaks and tight fairways on Spain\'s Costa del Sol. It hosted the 1997 Ryder Cup and remains the continent\'s premier parkland championship venue.'
    },
    {
      rank: 5,
      name: 'Morfontaine',
      location: 'Senlis',
      country: 'France',
      type: 'Heathland',
      holes: 18,
      par: 70,
      yearBuilt: 1913,
      designer: 'Tom Simpson',
      tags: ['heathland'],
      description: 'Hidden in the forests north of Paris, Morfontaine is one of the most exclusive and secretive clubs in Europe. Tom Simpson\'s masterful routing through silver birch, heather, and sandy soil creates a golfing experience of rare elegance.'
    },
    {
      rank: 6,
      name: 'Marco Simone',
      location: 'Rome',
      country: 'Italy',
      type: 'Parkland',
      holes: 18,
      par: 71,
      yearBuilt: 1989,
      designer: 'Jim Fazio / European Golf Design',
      tags: ['parkland', 'championship'],
      description: 'Host of the 2023 Ryder Cup, Marco Simone was dramatically redesigned to create a modern championship test amid the rolling hills and ancient ruins of the Roman countryside. Its water-guarded greens provide a stern examination.'
    },
    {
      rank: 7,
      name: 'Kennemer G&CC',
      location: 'Zandvoort',
      country: 'Netherlands',
      type: 'Links',
      holes: 18,
      par: 72,
      yearBuilt: 1927,
      designer: 'H.S. Colt',
      tags: ['links'],
      description: 'H.S. Colt routed this classic links through the high dunes behind the Dutch North Sea coast, creating an ever-changing test of wind, strategy, and imagination. It remains the finest links course on the European continent.'
    },
    {
      rank: 8,
      name: 'PGA Catalunya (Stadium)',
      location: 'Girona',
      country: 'Spain',
      type: 'Parkland',
      holes: 18,
      par: 72,
      yearBuilt: 1999,
      designer: 'Neil Coles & Angel Gallardo',
      tags: ['parkland', 'championship'],
      description: 'Nestled in the foothills of the Pyrenees near the Costa Brava, PGA Catalunya\'s Stadium course combines Mediterranean pines, cork oaks, and sparkling lakes into Spain\'s top-ranked modern layout. A regular European Tour venue of real distinction.'
    }
  ],

  /* ---------- Americas ---------- */
  americas: [
    {
      rank: 1,
      name: 'Pine Valley',
      location: 'New Jersey',
      country: 'USA',
      type: 'Parkland',
      holes: 18,
      par: 70,
      yearBuilt: 1913,
      designer: 'George Crump & H.S. Colt',
      tags: ['parkland', 'championship'],
      description: 'Carved from the sandy pine forests of southern New Jersey, Pine Valley is a fearsome test of nerve where every shot demands precision over vast wastelands of sand and scrub. It has held the world\'s number one ranking for generations.'
    },
    {
      rank: 2,
      name: 'Augusta National',
      location: 'Georgia',
      country: 'USA',
      type: 'Parkland',
      holes: 18,
      par: 72,
      yearBuilt: 1933,
      designer: 'Alister MacKenzie & Bobby Jones',
      tags: ['parkland', 'championship'],
      description: 'Home of The Masters, Augusta National\'s blooming azaleas and lightning-fast greens create the most iconic stage in professional golf. Amen Corner remains the most famous stretch of holes in the game.'
    },
    {
      rank: 3,
      name: 'Cypress Point',
      location: 'Pebble Beach, California',
      country: 'USA',
      type: 'Links',
      holes: 18,
      par: 72,
      yearBuilt: 1928,
      designer: 'Alister MacKenzie',
      tags: ['links', 'coastal'],
      description: 'Alister MacKenzie\'s journey from forest to dunes to crashing Pacific headlands is pure theatre — the par-3 16th across the ocean is golf\'s most photographed hole. Exclusivity and natural beauty combine to create an unmatched experience.'
    },
    {
      rank: 4,
      name: 'Shinnecock Hills',
      location: 'Southampton, New York',
      country: 'USA',
      type: 'Links',
      holes: 18,
      par: 70,
      yearBuilt: 1891,
      designer: 'William Flynn',
      tags: ['links', 'championship'],
      description: 'America\'s most authentic links experience sits atop windswept hills overlooking Peconic Bay, its fescue-lined fairways demanding the ground game rarely seen stateside. One of the five founding member clubs of the USGA.'
    },
    {
      rank: 5,
      name: 'National Golf Links',
      location: 'Southampton, New York',
      country: 'USA',
      type: 'Links',
      holes: 18,
      par: 71,
      yearBuilt: 1911,
      designer: 'Charles B. Macdonald',
      tags: ['links'],
      description: 'Charles Blair Macdonald\'s love letter to the great holes of Britain, transplanted onto the windswept shores of Peconic Bay. Its template holes — Redan, Biarritz, Cape — shaped the trajectory of American golf course design.'
    },
    {
      rank: 6,
      name: 'Pebble Beach',
      location: 'Pebble Beach, California',
      country: 'USA',
      type: 'Links',
      holes: 18,
      par: 72,
      yearBuilt: 1919,
      designer: 'Jack Neville & Douglas Grant',
      tags: ['links', 'coastal', 'championship'],
      description: 'Clinging to the rocky cliffs of the Monterey Peninsula, Pebble Beach offers the most dramatic ocean-side finish in golf. One of the few public courses to host the US Open, its scenery is seared into the soul of every golfer who walks it.'
    },
    {
      rank: 7,
      name: 'Cabot Cliffs',
      location: 'Inverness, Nova Scotia',
      country: 'Canada',
      type: 'Links',
      holes: 18,
      par: 72,
      yearBuilt: 2015,
      designer: 'Coore & Crenshaw',
      tags: ['links', 'coastal'],
      description: 'The newest entry in the world\'s elite, Cabot Cliffs cascades down red sandstone cliffs to the Gulf of St Lawrence in Cape Breton. Its closing stretch is already spoken of in the same breath as Pebble Beach and Cypress Point.'
    },
    {
      rank: 8,
      name: 'Merion (East)',
      location: 'Ardmore, Pennsylvania',
      country: 'USA',
      type: 'Parkland',
      holes: 18,
      par: 70,
      yearBuilt: 1912,
      designer: 'Hugh Wilson',
      tags: ['parkland', 'championship'],
      description: 'Compact but ferocious, Merion East is the shortest course ever to host a modern US Open yet punches far above its yardage. Its wicker-basket flagsticks and Hogan\'s legendary 1-iron are woven into golf\'s fabric.'
    }
  ],

  /* ---------- Asia Pacific ---------- */
  asia: [
    {
      rank: 1,
      name: 'Royal Melbourne (West)',
      location: 'Melbourne',
      country: 'Australia',
      type: 'Sandbelt',
      holes: 18,
      par: 71,
      yearBuilt: 1931,
      designer: 'Alister MacKenzie',
      tags: ['heathland', 'championship'],
      description: 'The crown jewel of Melbourne\'s famed Sandbelt, Royal Melbourne West features audaciously contoured greens and strategic bunkering that reward imagination over brute force. It is the southern hemisphere\'s undisputed masterwork.'
    },
    {
      rank: 2,
      name: 'New South Wales GC',
      location: 'Sydney',
      country: 'Australia',
      type: 'Links',
      holes: 18,
      par: 72,
      yearBuilt: 1928,
      designer: 'Alister MacKenzie / Eric Apperly',
      tags: ['links', 'coastal'],
      description: 'Perched on the La Perouse headland overlooking Botany Bay, New South Wales GC boasts one of the most spectacular settings in world golf. Its clifftop holes rank among Australia\'s most photographed and feared.'
    },
    {
      rank: 3,
      name: 'Hirono Golf Club',
      location: 'Kobe',
      country: 'Japan',
      type: 'Parkland',
      holes: 18,
      par: 72,
      yearBuilt: 1932,
      designer: 'Charles Alison',
      tags: ['parkland'],
      description: 'Japan\'s most revered course, Hirono was Charles Alison\'s Eastern masterpiece — its deep cross-bunkers, ravine carries, and towering pines evoke the great heathland courses of England. It remains the standard by which all Japanese courses are measured.'
    },
    {
      rank: 4,
      name: 'Kingston Heath',
      location: 'Melbourne',
      country: 'Australia',
      type: 'Sandbelt',
      holes: 18,
      par: 72,
      yearBuilt: 1925,
      designer: 'Des Soutar / Alister MacKenzie',
      tags: ['heathland', 'championship'],
      description: 'MacKenzie\'s bunkering combined with Soutar\'s intelligent routing through tea-tree, banksia, and sandy heath creates one of Australia\'s tightest and most strategic tests. Its par 3s are considered among the best collection anywhere.'
    },
    {
      rank: 5,
      name: 'Barnbougle Dunes',
      location: 'Tasmania',
      country: 'Australia',
      type: 'Links',
      holes: 18,
      par: 71,
      yearBuilt: 2004,
      designer: 'Tom Doak / Michael Coore',
      tags: ['links', 'coastal'],
      description: 'Rising from a remote crescent of Tasmanian coastline, Barnbougle Dunes is raw, windswept links golf in its purest form — built on a former potato farm. Its wild dunes and firm turf have been called the closest thing to Scotland outside of Britain.'
    },
    {
      rank: 6,
      name: 'Cape Kidnappers',
      location: 'Hawke\'s Bay',
      country: 'New Zealand',
      type: 'Clifftop',
      holes: 18,
      par: 71,
      yearBuilt: 2004,
      designer: 'Tom Doak',
      tags: ['coastal', 'championship'],
      description: 'Set atop towering finger-like ridges that plunge 140 metres to the Pacific Ocean, Cape Kidnappers is vertigo-inducing golf on a geological canvas millions of years in the making. Tom Doak created something utterly unlike anything else in the game.'
    },
    {
      rank: 7,
      name: 'Shanqin Bay',
      location: 'Hainan Island',
      country: 'China',
      type: 'Links',
      holes: 18,
      par: 72,
      yearBuilt: 2011,
      designer: 'Bill Coore & Ben Crenshaw',
      tags: ['links', 'coastal'],
      description: 'Coore and Crenshaw brought their minimalist philosophy to the South China Sea, shaping sandy dunes and native grasses into Asia\'s finest modern links. The tropical setting and firm, fast conditions make it a destination unlike any other on the continent.'
    },
    {
      rank: 8,
      name: 'Kauri Cliffs',
      location: 'Bay of Islands',
      country: 'New Zealand',
      type: 'Clifftop',
      holes: 18,
      par: 72,
      yearBuilt: 2000,
      designer: 'David Harman',
      tags: ['coastal'],
      description: 'Six holes dance along cliff edges 130 metres above the Pacific on New Zealand\'s stunning Northland peninsula, with panoramic views across the Bay of Islands. Kauri Cliffs is a bucket-list course of breathtaking beauty and exhilarating golf.'
    }
  ],

  /* ---------- UK & Ireland ---------- */
  uk: [
    {
      rank: 1,
      name: 'St Andrews Old Course',
      location: 'St Andrews',
      country: 'Scotland',
      type: 'Links',
      holes: 18,
      par: 72,
      yearBuilt: 1552,
      designer: 'Nature / Old Tom Morris',
      tags: ['links', 'championship'],
      description: 'The Home of Golf, where the game has been played for over 600 years on a hallowed strip of links land beside the grey North Sea. Walking the Swilcan Bridge and standing on the 1st tee is every golfer\'s ultimate pilgrimage.'
    },
    {
      rank: 2,
      name: 'Muirfield',
      location: 'Gullane',
      country: 'Scotland',
      type: 'Links',
      holes: 18,
      par: 71,
      yearBuilt: 1891,
      designer: 'Old Tom Morris',
      tags: ['links', 'championship'],
      description: 'Home of the world\'s oldest golf club, Muirfield\'s elegant two-loop routing ensures you face the wind from every quarter. It is the fairest championship links in Scotland — no blind shots, no tricks, just pure strategic golf.'
    },
    {
      rank: 3,
      name: 'Royal Dornoch',
      location: 'Dornoch',
      country: 'Scotland',
      type: 'Links',
      holes: 18,
      par: 70,
      yearBuilt: 1886,
      designer: 'Old Tom Morris / John Sutherland',
      tags: ['links'],
      description: 'Tucked away in the Scottish Highlands above the Dornoch Firth, this remote links has inspired course designers the world over with its natural plateau greens and gorse-framed fairways. Tom Watson called it the most fun he ever had on a golf course.'
    },
    {
      rank: 4,
      name: 'Turnberry (Ailsa)',
      location: 'Ayrshire',
      country: 'Scotland',
      type: 'Links',
      holes: 18,
      par: 70,
      yearBuilt: 1946,
      designer: 'Philip Mackenzie Ross',
      tags: ['links', 'championship'],
      description: 'With the iconic lighthouse on the 9th tee and Ailsa Craig rising from the Firth of Clyde, Turnberry is Scotland\'s most scenic links. It witnessed the "Duel in the Sun" between Nicklaus and Watson — the greatest Open Championship ever played.'
    },
    {
      rank: 5,
      name: 'Royal Birkdale',
      location: 'Southport',
      country: 'England',
      type: 'Links',
      holes: 18,
      par: 70,
      yearBuilt: 1889,
      designer: 'George Low / F.W. Hawtree',
      tags: ['links', 'championship'],
      description: 'England\'s premier championship links, Royal Birkdale\'s fairways run through valleys between towering willow-scrub dunes, creating an amphitheatre effect for spectators. It is perhaps the fairest links on the Open rota.'
    },
    {
      rank: 6,
      name: 'Sunningdale (Old)',
      location: 'Surrey',
      country: 'England',
      type: 'Heathland',
      holes: 18,
      par: 70,
      yearBuilt: 1901,
      designer: 'Willie Park Jr.',
      tags: ['heathland'],
      description: 'The quintessential English heathland course, Sunningdale Old weaves through pine, birch, and purple heather on sandy soil that drains perfectly year-round. Bobby Jones played what he called the "perfect round" here in 1926.'
    },
    {
      rank: 7,
      name: 'Carnoustie',
      location: 'Carnoustie',
      country: 'Scotland',
      type: 'Links',
      holes: 18,
      par: 72,
      yearBuilt: 1842,
      designer: 'Allan Robertson / James Braid',
      tags: ['links', 'championship'],
      description: 'Known as "Car-nasty" for its brutal difficulty, Carnoustie\'s flat, wind-blasted links and the burn-crossed closing stretch have crushed the dreams of champions. It is the toughest test on the Open Championship rota.'
    },
    {
      rank: 8,
      name: 'Royal St George\'s',
      location: 'Sandwich',
      country: 'England',
      type: 'Links',
      holes: 18,
      par: 70,
      yearBuilt: 1887,
      designer: 'Laidlaw Purves',
      tags: ['links', 'championship'],
      description: 'The first English club to host The Open Championship, Royal St George\'s rolls through enormous sand dunes in the Kent marshlands. Its quirky bounces and unpredictable terrain make it one of the most characterful links in existence.'
    },
    {
      rank: 9,
      name: 'Woodhall Spa (Hotchkin)',
      location: 'Lincolnshire',
      country: 'England',
      type: 'Heathland',
      holes: 18,
      par: 73,
      yearBuilt: 1905,
      designer: 'S.V. Hotchkin',
      tags: ['heathland'],
      description: 'Home of England Golf, Woodhall Spa\'s Hotchkin course is famed for its cavernous bunkers — some so deep a ladder is needed to escape. Set among pine and birch woodland, it is the finest inland course in England.'
    },
    {
      rank: 10,
      name: 'Lahinch (Old)',
      location: 'Lahinch',
      country: 'Ireland',
      type: 'Links',
      holes: 18,
      par: 72,
      yearBuilt: 1892,
      designer: 'Old Tom Morris / Alister MacKenzie',
      tags: ['links'],
      description: 'Overlooking Liscannor Bay on Ireland\'s Atlantic coast, Lahinch is a beloved links where wild goats serve as living barometers and the Klondyke and Dell are two of golf\'s most famous blind holes. It is the soul of Irish links golf.'
    }
  ]
};


// ── 2. Helper Functions ──────────────────────────────────────

/**
 * Count community cards where firstCourse or signatureCourse includes this course name.
 */
function getCommunityCountForCourse(courseName) {
  const cards = getCards();
  const lowerName = courseName.toLowerCase();
  let count = 0;
  cards.forEach(function (card) {
    const first = (card.firstCourse || '').toLowerCase();
    const sig = (card.signatureCourse || '').toLowerCase();
    if (first.includes(lowerName) || sig.includes(lowerName)) {
      count++;
    }
  });
  return count;
}

/**
 * Check if courseName matches any course across ALL lists (case-insensitive partial match).
 */
function isTop100Course(courseName) {
  if (!courseName) return false;
  const lowerName = courseName.toLowerCase();
  const lists = Object.keys(TOP_100_DATA);
  for (let i = 0; i < lists.length; i++) {
    const courses = TOP_100_DATA[lists[i]];
    for (let j = 0; j < courses.length; j++) {
      if (courses[j].name.toLowerCase().includes(lowerName) || lowerName.includes(courses[j].name.toLowerCase())) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Return a CSS class based on ranking tier.
 */
function getRankClass(rank) {
  if (rank >= 1 && rank <= 3) return 'rank-gold';
  if (rank >= 4 && rank <= 10) return 'rank-silver';
  if (rank >= 11 && rank <= 25) return 'rank-bronze';
  return 'rank-standard';
}

/**
 * Map a tag name to its CSS class.
 */
function getTagClass(tag) {
  const map = {
    links: 'course-tag-links',
    parkland: 'course-tag-parkland',
    desert: 'course-tag-desert',
    heathland: 'course-tag-heathland',
    coastal: 'course-tag-coastal',
    championship: 'course-tag-championship'
  };
  return map[tag] || '';
}


// ── 3. Tab / View / Search Control ──────────────────────────

function setTop100List(list) {
  currentTop100List = list;
  // Update tab active states
  var tabs = document.querySelectorAll('.top100-tab');
  tabs.forEach(function (tab) {
    tab.classList.remove('active');
    if (tab.getAttribute('data-list') === list) {
      tab.classList.add('active');
    }
  });
  renderTop100();
}

function setTop100View(view) {
  currentTop100View = view;
  // Update view button active states
  var btns = document.querySelectorAll('.top100-view-btn');
  btns.forEach(function (btn) {
    btn.classList.remove('active');
    if (btn.getAttribute('data-view') === view) {
      btn.classList.add('active');
    }
  });
  renderTop100();
}

function searchTop100(query) {
  currentTop100Search = query;
  renderTop100();
}


// ── 4. renderTop100() ────────────────────────────────────────

function renderTop100() {
  var gridEl = document.getElementById('top100Grid');
  var listEl = document.getElementById('top100ListView');
  if (!gridEl || !listEl) return;

  var courses = TOP_100_DATA[currentTop100List] || [];
  var query = currentTop100Search.toLowerCase().trim();

  if (query) {
    courses = courses.filter(function (c) {
      return c.name.toLowerCase().indexOf(query) >= 0 ||
        c.location.toLowerCase().indexOf(query) >= 0 ||
        c.country.toLowerCase().indexOf(query) >= 0 ||
        c.designer.toLowerCase().indexOf(query) >= 0 ||
        c.tags.some(function (t) { return t.toLowerCase().indexOf(query) >= 0; });
    });
  }

  window._top100Courses = courses;

  if (currentTop100View === 'grid') {
    gridEl.style.display = '';
    listEl.style.display = 'none';
    gridEl.innerHTML = courses.map(function (course, i) {
      var communityCount = getCommunityCountForCourse(course.name);
      var rankClass = getRankClass(course.rank);
      var tagsHTML = course.tags.map(function(t) {
        return '<span class="course-tag ' + getTagClass(t) + '">' + t.charAt(0).toUpperCase() + t.slice(1) + '</span>';
      }).join('');

      return '<div class="course-card card-enter" style="animation-delay:' + (i * 0.05) + 's" onclick="openCourseDetail(window._top100Courses[' + i + '])">' +
        '<div class="course-card-rank"><div class="rank-badge ' + rankClass + '">' + course.rank + '</div></div>' +
        '<div class="course-card-banner"><span class="course-card-banner-label">' + course.type + '</span></div>' +
        '<div class="course-card-body">' +
          '<div class="course-card-name">' + course.name + '</div>' +
          '<div class="course-card-location">' + course.location + ', ' + course.country + '</div>' +
          '<div class="course-card-stats">' +
            '<div class="course-card-stat"><span class="course-card-stat-value">' + course.yearBuilt + '</span><span class="course-card-stat-label">Built</span></div>' +
            '<div class="course-card-stat"><span class="course-card-stat-value">' + course.holes + '</span><span class="course-card-stat-label">Holes</span></div>' +
            '<div class="course-card-stat"><span class="course-card-stat-value">' + course.par + '</span><span class="course-card-stat-label">Par</span></div>' +
          '</div>' +
          '<div class="course-card-tags">' + tagsHTML + '</div>' +
        '</div>' +
        '<div class="course-card-footer">' +
          '<div class="course-card-community">' + (communityCount > 0 ? '<strong>' + communityCount + '</strong> started here' : 'No cards yet') + '</div>' +
          '<span class="top100-verified-badge">TOP 100</span>' +
        '</div>' +
      '</div>';
    }).join('');
  } else {
    gridEl.style.display = 'none';
    listEl.style.display = '';
    listEl.innerHTML =
      '<div class="top100-list-header"><span>#</span><span>Course</span><span>Location</span><span>Type</span><span>Community</span></div>' +
      courses.map(function (course, idx) {
        var communityCount = getCommunityCountForCourse(course.name);
        return '<div class="top100-list-row" onclick="openCourseDetail(window._top100Courses[' + idx + '])">' +
          '<span class="list-rank ' + (course.rank <= 3 ? 'rank-top3' : '') + '">' + course.rank + '</span>' +
          '<div><div class="list-course-name">' + course.name + '</div><div class="list-course-subtitle">' + course.designer + ' &bull; ' + course.yearBuilt + '</div></div>' +
          '<span class="list-location">' + course.location + ', ' + course.country + '</span>' +
          '<span class="list-type">' + course.type + '</span>' +
          '<span class="list-community-count">' + (communityCount > 0 ? communityCount + ' cards' : '&mdash;') + '</span>' +
        '</div>';
      }).join('');
  }
}


// ── 5. openCourseDetail(course) ──────────────────────────────

function openCourseDetail(course) {
  if (!course) return;

  var content = document.getElementById('detailContent');
  if (!content) return;

  var rankClass = getRankClass(course.rank);
  var communityCount = getCommunityCountForCourse(course.name);

  var tagsHtml = course.tags.map(function (tag) {
    return '<span class="course-tag ' + getTagClass(tag) + '">' + tag + '</span>';
  }).join('');

  // Find related community cards (people who started or play here)
  var relatedCards = getCards().filter(function (card) {
    var first = (card.firstCourse || '').toLowerCase();
    var sig = (card.signatureCourse || '').toLowerCase();
    var cName = course.name.toLowerCase();
    return first.includes(cName) || sig.includes(cName) || cName.includes(first) || cName.includes(sig);
  });

  var relatedHtml = '';
  if (relatedCards.length > 0) {
    relatedHtml += '<div class="course-detail-related">';
    relatedHtml += '<h4>Community Members</h4>';
    relatedHtml += '<div class="course-detail-related-cards">';
    relatedCards.forEach(function (card) {
      var initials = getInitials(card.name || 'NN');
      relatedHtml += '<div class="course-related-card">';
      relatedHtml += '  <div class="course-related-avatar">' + initials + '</div>';
      relatedHtml += '  <span>' + (card.name || 'Unknown') + '</span>';
      relatedHtml += '</div>';
    });
    relatedHtml += '</div></div>';
  } else {
    relatedHtml += '<div class="course-detail-related">';
    relatedHtml += '<p class="empty-hint">No community members have listed this course yet. Be the first!</p>';
    relatedHtml += '</div>';
  }

  // Action buttons
  var actionsHtml = '';
  actionsHtml += '<div class="course-detail-actions">';
  actionsHtml += '  <button class="btn btn-primary" onclick="closeDetailModal(); prefillCourse(\'' + course.name.replace(/'/g, "\\'") + '\'); showSection(\'submit\');">This Was My First Course</button>';

  var currentUser = getCurrentUser();
  if (currentUser) {
    actionsHtml += '  <button class="btn btn-secondary" onclick="markCoursePlayed(\'' + course.name.replace(/'/g, "\\'") + '\')">I\'ve Played This Course</button>';
  }
  actionsHtml += '</div>';

  var html = '';
  html += '<div class="course-detail">';
  html += '  <div class="course-detail-header">';
  html += '    <span class="top100-rank-badge ' + rankClass + ' large">#' + course.rank + '</span>';
  html += '    <div>';
  html += '      <h2>' + course.name + '</h2>';
  html += '      <p class="course-detail-location">' + course.location + ', ' + course.country + '</p>';
  html += '      <span class="course-detail-type">' + course.type + '</span>';
  html += '    </div>';
  html += '  </div>';
  html += '  <p class="course-detail-description">' + course.description + '</p>';
  html += '  <div class="course-detail-stats">';
  html += '    <div class="stat-item"><span class="stat-label">Year Built</span><span class="stat-value">' + course.yearBuilt + '</span></div>';
  html += '    <div class="stat-item"><span class="stat-label">Designer</span><span class="stat-value">' + course.designer + '</span></div>';
  html += '    <div class="stat-item"><span class="stat-label">Holes / Par</span><span class="stat-value">' + course.holes + ' / ' + course.par + '</span></div>';
  html += '    <div class="stat-item"><span class="stat-label">Community Cards</span><span class="stat-value">' + communityCount + '</span></div>';
  html += '  </div>';
  html += '  <div class="course-detail-tags">' + tagsHtml + '</div>';
  html += relatedHtml;
  html += actionsHtml;
  html += '</div>';

  content.innerHTML = html;
  document.getElementById('detailModal').style.display = 'flex';
}


// ── 6. markCoursePlayed(courseName) ──────────────────────────

async function markCoursePlayed(courseName) {
  var user = getCurrentUser();
  if (!user) { openAuth('signin'); return; }

  var played = user.playedCourses || user.played_courses || [];
  var alreadyPlayed = played.some(function(c) {
    return c.toLowerCase() === courseName.toLowerCase();
  });

  if (alreadyPlayed) {
    showToast('success', 'Already played', 'You\'ve already marked this course');
    return;
  }

  try {
    if (USE_API) {
      await API.markCoursePlayed(courseName);
      // User refreshed by API client
    } else {
      if (!user.playedCourses) user.playedCourses = [];
      user.playedCourses.push(courseName);
      saveCurrentUser(user);
      awardXP(50, 'Played ' + courseName);
      addFeedItem('course_played', { courseName: courseName });
    }
  } catch (err) {
    showToast('error', 'Failed', err.message || 'Please try again');
    return;
  }

  showToast('success', 'Course added!', courseName + ' added to your collection');
  checkBadges();

  var clubhouseSection = document.getElementById('section-clubhouse');
  if (clubhouseSection && clubhouseSection.style.display !== 'none') {
    if (typeof renderClubhouse === 'function') renderClubhouse();
  }
}


// ── 7. prefillCourse(courseName) ─────────────────────────────

function prefillCourse(courseName) {
  setCardType('player');
  var courseInput = document.querySelector('#playerForm input[name="firstCourse"]');
  if (courseInput) courseInput.value = courseName;
  renderPreviewCard();
}
