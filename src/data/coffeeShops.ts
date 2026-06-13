import type { CoffeeShop } from './types';

/**
 * Sportage-Hybrid-view coffee stops (DR-2): Google Maps rating >=4.9 at
 * verification time (2026-06-13), per OQ-8. Source trail in
 * docs/verification.md.
 *
 * Coverage note (honest gap, ACC-3): no shop on the Columbus OH, Pittsburgh PA,
 * NJ, or Long Island NY stretches could be verified at >=4.9 — the best found
 * there were 4.7-4.8 and were EXCLUDED rather than invented (see
 * verification.md §Excluded). The dataset therefore has no qualifying coffee
 * stop east of Allentown, PA.
 */
export const coffeeShops: CoffeeShop[] = [
  {
    id: 'black-wall-street-liquid-lounge',
    name: 'Black Wall Street Liquid Lounge',
    address: '10 N Greenwood Ave Ste 101, Tulsa, OK 74120',
    city: 'Tulsa',
    state: 'OK',
    googleRating: 4.9,
    reviewCount: 164,
    ratingEvidence: 'Wanderlog "Best coffee shops in Tulsa" (mirrors Google Maps data), fetched 2026-06-13: 4.9 (164 Google reviews)',
    approxRouteArea: 'Tulsa, OK — Greenwood District, route start near I-244/I-44',
    hours: 'Mon-Sat 7:00 AM-5:00 PM, closed Sun',
    sources: [
      { org: 'Wanderlog (Google Maps data)', url: 'https://wanderlog.com/list/geoCategory/17964/best-coffee-shops-and-best-cafes-in-tulsa', confirms: '4.9 rating, 164 Google reviews' },
      { org: 'Yelp', url: 'https://www.yelp.com/biz/black-wall-street-liquid-lounge-tulsa-2', confirms: 'existence, address' },
      { org: 'Visit Tulsa', url: 'https://www.visittulsa.com/listing/black-wall-street-liquid-lounge/1637/', confirms: 'existence, address, hours' },
    ],
    dateVerified: '2026-06-13',
  },
  {
    id: 'el-cafecito-springfield-mo',
    name: 'El Cafecito - The Little Coffee Shop',
    address: '2462 S Campbell Ave, Springfield, MO 65807',
    city: 'Springfield',
    state: 'MO',
    googleRating: 4.9,
    reviewCount: 684,
    ratingEvidence: 'Wanderlog place page (mirrors Google Maps data), fetched and independently re-confirmed 2026-06-13: 4.9/5, 684 Google reviews',
    approxRouteArea: 'Springfield, MO — I-44, ~5 min off highway',
    hours: 'Mon-Fri 6AM-4PM, Sat 7AM-4PM, Sun 8AM-4PM',
    sources: [
      { org: 'Wanderlog (Google Maps data)', url: 'https://wanderlog.com/place/details/9416689/el-cafecito-the-little-coffee-shop', confirms: '4.9 rating, 684 Google reviews, address, hours' },
      { org: 'Yelp', url: 'https://www.yelp.com/biz/el-cafecito-springfield', confirms: 'existence, address' },
      { org: 'Official website', url: 'https://elcafecito417.com/', confirms: 'existence, Latin coffee shop in Springfield MO' },
    ],
    dateVerified: '2026-06-13',
  },
  {
    id: 'e61-cafe-st-louis',
    name: 'E61 Cafe',
    address: '307 Belt Ave, St. Louis, MO 63112',
    city: 'St. Louis',
    state: 'MO',
    googleRating: 4.9,
    reviewCount: 124,
    ratingEvidence: 'Wanderlog place page (Google Maps data) 4.9/5, 124 reviews; corroborated by a second aggregator (Wheree) also at 4.9 — both fetched 2026-06-13',
    approxRouteArea: 'St. Louis, MO — near Forest Park, ~5-10 min off the I-64/I-70 corridor',
    hours: 'Approx Mon-Fri 7AM-5PM, Sat-Sun 8AM-5PM (midweek variation reported — check before visiting)',
    sources: [
      { org: 'Wanderlog (Google Maps data)', url: 'https://wanderlog.com/place/details/14308350/e61-cafe', confirms: '4.9 rating, 124 Google reviews, address, hours' },
      { org: 'Yelp', url: 'https://www.yelp.com/biz/e61-cafe-saint-louis', confirms: 'existence, address' },
      { org: 'Official website', url: 'https://e61cafe.com/', confirms: 'existence (first Greek coffee shop in St. Louis)' },
    ],
    dateVerified: '2026-06-13',
  },
  {
    id: 'loose-goose-terre-haute-in',
    name: 'Loose Goose Coffee Company',
    address: '3020 S 7th St, Terre Haute, IN 47802',
    city: 'Terre Haute',
    state: 'IN',
    googleRating: 4.9,
    reviewCount: 302,
    ratingEvidence: 'Restaurant Guru platform breakdown fetched 2026-06-13: Google 4.9/5 (302 reviews), Facebook 5/5',
    approxRouteArea: 'Terre Haute, IN — I-70, ~5 min north on S 7th St (US-41)',
    hours: 'Mon-Fri 6AM-6PM, Sat 7AM-4PM, Sun 8AM-3PM',
    sources: [
      { org: 'Restaurant Guru', url: 'https://restaurantguru.com/Loose-Goose-Coffee-Company-Terre-Haute', confirms: 'Google rating 4.9, 302 reviews, address, hours' },
      { org: 'Yelp', url: 'https://www.yelp.com/biz/loose-goose-coffee-company-terre-haute', confirms: 'existence, address' },
      { org: 'Terre Haute tourism directory', url: 'https://www.terrehaute.com/listing/loose-goose-coffee-company/114/', confirms: 'existence, local listing' },
    ],
    dateVerified: '2026-06-13',
  },
  {
    id: 'claypot-coffee-house-indianapolis',
    name: 'Claypot Coffee House',
    address: '1551 E Stop 12 Rd, Indianapolis, IN 46227',
    city: 'Indianapolis',
    state: 'IN',
    googleRating: 4.9,
    reviewCount: 323,
    ratingEvidence: 'Matcha Spot Indianapolis directory (Google-sourced ratings) fetched 2026-06-13: 4.9, 323 reviews; a second independent search result also reported 4.9',
    approxRouteArea: 'Indianapolis, IN — south side, ~10-12 min off the I-465/I-70 loop',
    hours: 'Mon-Sat 8AM-9PM, closed Sun',
    sources: [
      { org: 'Matcha Spot (Google-sourced ratings)', url: 'https://www.matcha-spot.com/cities/indianapolis/', confirms: '4.9 rating, 323 reviews, address' },
      { org: 'Yelp', url: 'https://www.yelp.com/biz/claypot-coffee-house-indianapolis', confirms: 'existence, address' },
      { org: 'Indianapolis Monthly', url: 'https://www.indianapolismonthly.com/food-and-drinks/drinks/cheers-claypot-coffee-house/', confirms: 'existence (Southeast Asian claypot-brew coffee house)' },
    ],
    dateVerified: '2026-06-13',
  },
  {
    id: 'tiger-eye-coffee-harrisburg-pa',
    name: 'The Tiger Eye Coffee Shop',
    address: '3418 Derry St, Harrisburg, PA 17111',
    city: 'Harrisburg',
    state: 'PA',
    googleRating: 4.9,
    reviewCount: 283,
    ratingEvidence: 'Restaurant Guru fetched 2026-06-13: "Google Rating: 4.9/5, 283 reviews"; a second aggregator showed 4.9 (298 reviews)',
    approxRouteArea: 'Harrisburg, PA — just off I-283 / PA Turnpike Harrisburg East interchange',
    hours: 'Wed-Sat 8AM-7PM, Sun 9AM-5PM, closed Mon-Tue',
    sources: [
      { org: 'Restaurant Guru', url: 'https://restaurantguru.com/The-Tiger-Eye-Coffee-Shop-Harrisburg', confirms: 'Google rating 4.9, 283 reviews, address, hours' },
      { org: 'Yelp', url: 'https://www.yelp.com/biz/the-tiger-eye-harrisburg', confirms: 'existence, address' },
      { org: 'localcoffeeshops.org', url: 'https://www.localcoffeeshops.org/shop/pennsylvania/harrisburg/the-tiger-eye-coffee-shop', confirms: 'existence, coffee shop listing' },
    ],
    dateVerified: '2026-06-13',
  },
  {
    id: 'nowhere-coffee-roastery-allentown-pa',
    name: 'Nowhere Coffee Co. - The Roastery',
    address: '17 S 9th St, Allentown, PA 18102',
    city: 'Allentown',
    state: 'PA',
    googleRating: 4.9,
    reviewCount: 64,
    ratingEvidence: 'joe.coffee location page (displays Google Places rating), confirmed via two independent retrievals 2026-06-13, both 4.9 (64 reviews). The W Tilghman St "West End" location rates lower and is NOT included.',
    approxRouteArea: 'Allentown, PA — I-78, center city ~5 min off highway',
    hours: 'Mon 7:30AM-1PM, Tue-Thu 7:30AM-3PM, Fri 7:30AM-1PM, closed Sat-Sun',
    sources: [
      { org: 'joe coffee (Google Places data)', url: 'https://joe.coffee/locations/pa/allentown/nowhere-coffee-co-the-roastery-allentown/', confirms: '4.9 rating, 64 reviews, address, hours' },
      { org: 'LehighValleyNews.com', url: 'https://www.lehighvalleynews.com/allentown/cool-beans-nowhere-coffee-co-brings-fresh-roasts-to-allentown', confirms: 'existence, local press coverage' },
      { org: 'Official website', url: 'https://www.nowherecoffeeco.com/', confirms: 'existence, 17 S 9th St location' },
    ],
    dateVerified: '2026-06-13',
  },
];
