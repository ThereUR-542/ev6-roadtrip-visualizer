import type { Hotel } from './types';

/**
 * Overnight + destination hotels (OQ-4), both driving modes. One overnight
 * each direction (the ~1,450 mi drive crosses the ~10-11 h/day limit near
 * Dayton OH), plus destination hotels near Calverton NY. Verified 2026-06-13
 * from >=2 independent sources each; trail in docs/verification.md. Nightly
 * rates are estimates observed on the cited booking sites that day (ACC-5).
 */
export const hotels: Hotel[] = [
  {
    id: 'hampton-inn-dayton-huber-heights',
    name: 'Hampton Inn Dayton/Huber Heights',
    brand: 'Hampton by Hilton',
    address: '5588 Merily Way, Huber Heights, OH 45424',
    city: 'Huber Heights',
    state: 'OH',
    role: 'outbound-overnight',
    nearHighway: 'I-70 exit 36 (OH-202), ~720-745 mi from Jenks — fits the ~10-11 h day-1 limit',
    evCharging: 'none verified',
    nearbyDcFastCharger: 'Electrify America at Walmart, 7680 Brandt Pike, Huber Heights OH (~2 mi)',
    approxNightlyRateUsd: 106,
    rateNote: 'estimate: "From $106" seen on HotelGuides.com on 2026-06-13',
    sources: [
      { org: 'HotelGuides.com', url: 'https://hotelguides.com/hotels/ohio/huber-heights/123429.html', confirms: 'address, I-70 exit 36, rate from $106, amenities' },
      { org: 'Reservations.com', url: 'https://www.reservations.com/hotel/hampton-inn-dayton-huber-heights', confirms: 'address 5588 Merily Way 45424, free parking' },
      { org: 'Hilton (brand)', url: 'https://www.hilton.com/en/hotels/dayhhhx-hampton-dayton-huber-heights/', confirms: 'hotel exists under Hilton brand (listing seen via search; direct fetch blocked)' },
    ],
    notes: 'Free hot breakfast, indoor pool. EV6 charges at the EA Walmart site ~2 mi away (evening or morning).',
    dateVerified: '2026-06-13',
  },
  {
    id: 'holiday-inn-express-dayton-huber-heights',
    name: 'Holiday Inn Express & Suites Dayton-Huber Heights',
    brand: 'Holiday Inn Express (IHG)',
    address: '5610 Merily Way, Huber Heights, OH 45424',
    city: 'Huber Heights',
    state: 'OH',
    role: 'return-overnight',
    nearHighway: 'I-70 exit 36 (OH-202), ~705-720 mi remaining to Jenks — fits the day-2 limit',
    evCharging: 'none verified',
    nearbyDcFastCharger: 'Electrify America at Walmart, 7680 Brandt Pike, Huber Heights OH (~2 mi)',
    approxNightlyRateUsd: 110,
    rateNote: 'estimate: from $110 on Trip.com on 2026-06-13 (HotelGuides showed from $120 same day)',
    sources: [
      { org: 'Trip.com', url: 'https://us.trip.com/hotels/huber-heights-hotel-detail-2118100/holiday-inn-express-suites-dayton-huber-heights/', confirms: 'address 5610 Merily Way, rate, 7.8/10 (97 reviews)' },
      { org: 'HotelGuides.com', url: 'https://hotelguides.com/interstate-hotels/i-70-exit-38-oh-hotels.html', confirms: 'I-70 exit 36 location, Merily Way address (shown as 5612), rate from $120' },
      { org: 'IHG (brand)', url: 'https://www.ihg.com/holidayinnexpress/hotels/us/en/huber-heights/huboh/hoteldetail', confirms: 'hotel exists under IHG brand (listing seen via search; direct fetch blocked)' },
    ],
    notes: 'Next door to the Hampton Inn. Minor address discrepancy across sources (5610 vs 5612 Merily Way) — same property.',
    dateVerified: '2026-06-13',
  },
  {
    id: 'hyatt-place-long-island-east-end',
    name: 'Hyatt Place Long Island/East End',
    brand: 'Hyatt Place',
    address: '451 East Main Street, Riverhead, NY 11901',
    city: 'Riverhead',
    state: 'NY',
    role: 'destination',
    nearHighway: '~4 mi from I-495 (LIE) exit 71/73; ~5 mi to 400 David Ct, Calverton',
    evCharging: 'on-site Level 2 (Tesla Wall Connectors + Universal Wall Connectors per Hyatt policies page, fee may apply; adjacent aquarium complex lists free L2 NACS + J1772 on ChargeHub)',
    nearbyDcFastCharger: 'Electrify America at 287 Wading River Rd, Manorville NY (~8 mi)',
    approxNightlyRateUsd: 123,
    rateNote: 'estimate: Kayak from $123/night on 2026-06-13; Trip.com showed from $296 for next-7-days stays — East End summer rates vary widely, verify for actual dates',
    sources: [
      { org: 'Kayak', url: 'https://www.kayak.com/Riverhead-Hotels-Hyatt-Place-Long-Island-East-End.406470.ksp', confirms: 'address, rate, 8.9/10 (804 reviews)' },
      { org: 'Trip.com', url: 'https://us.trip.com/hotels/riverhead-hotel-detail-2882513/hyatt-place-long-island-east-end/', confirms: 'address, 9.1/10 (102 reviews), rates' },
      { org: 'Hyatt (brand)', url: 'https://www.hyatt.com/hyatt-place/en-US/ispzr-hyatt-place-long-island-east-end/policies', confirms: 'EV charging: Tesla + Universal Wall Connectors, fees may apply' },
      { org: 'ChargeHub', url: 'https://chargehub.com/en/stations/ny/riverhead-/hyatt-place-tesla.html', confirms: 'Level 2 charging at the 431 E Main St complex: 4 NACS + 8 J1772 ports' },
    ],
    notes: 'Best EV fit at the destination — only Riverhead-area hotel with verifiable on-site L2 charging; supports OQ-9 default of ~100% return-departure SoC (assumption stays editable). Free breakfast and parking.',
    dateVerified: '2026-06-13',
  },
  {
    id: 'residence-inn-long-island-east-end',
    name: 'Residence Inn by Marriott Long Island East End',
    brand: 'Residence Inn (Marriott)',
    address: '2012 Old Country Road, Riverhead, NY 11901',
    city: 'Riverhead',
    state: 'NY',
    role: 'destination',
    nearHighway: 'Just off the I-495 (LIE) eastern terminus / NY-25 at Tanger Outlets; ~4 mi to 400 David Ct, Calverton',
    evCharging: 'none verified',
    nearbyDcFastCharger: 'Electrify America at 287 Wading River Rd, Manorville NY (~6-7 mi)',
    approxNightlyRateUsd: 225,
    rateNote: 'estimate: from $225+ in Kayak listing snippet on 2026-06-13',
    sources: [
      { org: 'I LOVE NY', url: 'https://www.iloveny.com/listing/residence-inn-long-island-east-end/131559/', confirms: 'address, all-suite with kitchens, pools, free breakfast' },
      { org: 'Yelp', url: 'https://www.yelp.com/biz/residence-inn-by-marriott-long-island-east-end-riverhead', confirms: 'name, address (64 reviews)' },
      { org: 'TripAdvisor', url: 'https://www.tripadvisor.com/Hotel_Review-g48502-d12451376-Reviews-Residence_Inn_by_Marriott_Long_Island_East_End-Riverhead_Long_Island_New_York.html', confirms: 'well-reviewed Riverhead property next to Tanger Outlets' },
    ],
    notes: 'All-suite alternative (good for the Sportage variant or longer stays); EV6 charging would rely on the Manorville EA station.',
    dateVerified: '2026-06-13',
  },
];
