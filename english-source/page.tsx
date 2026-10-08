"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Language switching reloads the document to restore the root page language. */

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

type Place = "All" | "In transit" | "Tromsø" | "Svalbard" | "Oslo";
type Currency = "CNY" | "USD" | "NOK";

const days = [
  ["09.25", "Fri", "Oslo", "14:20 arrival in Oslo · Check-in", "Fly CZ307 via Amsterdam, connecting to KL1203. Arrive at OSL at 14:20 local Norwegian time; travel to Oslo S and check in at Comfort Hotel Grand Central (09.25→09.26).", "KL1203 14:20 OSL · Arrival-night hotel booked", "Tonight and tomorrow night are separate consecutive bookings. Ask reception whether the same room can be kept for 09.25→09.26 and 09.26→09.27. The arrival date is 09.25."],
  ["09.26", "Sat", "Oslo", "Full day in Oslo · City and waterfront", "Walk from Oslo S to Deichman Library, the Opera House roof and the Bjørvika waterfront. Visit MUNCH or the National Museum in the afternoon. Stay at Comfort Hotel Grand Central again (second booking: 09.26→09.27).", "Full day in the city · Second night booked", "Pack for the northbound journey in the evening. SK4492 departs at 10:20 on 09.27; arrive at OSL early for exit formalities."],
  ["09.27", "Sun", "Svalbard", "Fly to 78° north", "Check out of Comfort Hotel Grand Central and travel to OSL. Take SK4492 at 10:20 to Longyearbyen, arriving at 13:15, then check in at Svalbard Hotell | Polfareren.", "10:20 OSL → 13:15 LYR · Ticketed", "Svalbard is outside the Schengen Area. Allow time for exit formalities and check-in. The hotel has been paid for."],
  ["09.28", "Mon", "Svalbard", "Fjords, glaciers and wildlife cruise", "Meet at the Tourist Information Centre at 08:15. Board MS Bard, a hybrid catamaran, for Billefjorden and Nordenskiöldbreen. An onboard guide and lunch are included.", "08:15 meeting · MS Bard · Paid", "Sea conditions, drift ice and the operator's safety assessment may affect the route. Arrive early as instructed."],
  ["09.29", "Tue", "Svalbard", "Hike across Foxfonna", "Meet at the Tourist Information Centre at 10:00 for Green Dog Svalbard's Hike Across Foxfonna with packdog. The activity lasts about 6 hours and includes a light meal and hot drinks.", "10:00 meeting · About 6 hours · Paid", "Bring warm, windproof and waterproof layers for a full day outdoors. The guide and weather conditions determine the route and whether the activity proceeds."],
  ["09.30", "Wed", "Svalbard", "Weather reserve and indoor alternatives", "Give priority to rescheduling core activities cancelled on 09.28—09.29 because of sea conditions or weather. Otherwise, choose a mine tour, a museum visit or a walk in Longyearbyen.", "Flexible all day · Not booked", "Avoid adding non-cancellable bookings in advance. Decide the evening before based on the weather and energy levels."],
  ["10.01", "Thu", "Svalbard", "Dog sledding on wheels", "Meet at the Tourist Information Centre at 09:00 for Green Dog Svalbard's 4-hour Dog sledding on wheels tour. Return around 13:00. Outdoor clothing, rainwear, boots, gloves, hot drinks and waffles are provided.", "09:00—about 13:00 · Paid", "An experienced armed guide leads the activity. Confirm the final pickup time with the operator."],
  ["10.02", "Fri", "Tromsø", "Arrive in Tromsø · Northern lights tour", "Fly SK4425 from Longyearbyen to Tromsø and check in at Scandic Ishavshotel. Meet at Clarion The Edge Hotel at 19:00; the tour is expected to finish at 02:00 the following day.", "14:10 arrival at TOS · 19:00 northern lights tour", "Returning to mainland Norway requires a second Schengen entry. The planned interval between landing and the meeting time is about 4 hours 50 minutes."],
  ["10.03", "Sat", "Tromsø", "City walks and recovery day", "The northern lights tour is expected to finish at 02:00. Choose a harbour walk, indoor attractions or the cable car during the day, depending on sleep, weather and cloud cover.", "Light daytime activities · Not booked", "Prioritise sleep and recovery; avoid another overnight activity."],
  ["10.04", "Sun", "Tromsø", "Drive to Senja", "Collect a Toyota RAV4 or similar automatic vehicle at Tromsø Langnes Airport at 10:00. Drive to Senja's west coast and check in at Hamn i Senja.", "10:00 car pickup at TOS · Unlimited mileage", "Road conditions, wind, snow and a safe return the following day take priority."],
  ["10.05", "Mon", "Oslo", "Return to Oslo", "Return from Senja to Tromsø Langnes Airport, drop off the car at 16:00, then fly to Oslo and check in at Radisson Blu Airport Hotel.", "16:00 car return at TOS · TOS → OSL ticketed", "Airport hotel stay: 10.05→10.06. Your travel companion returns home the following day; you remain in Oslo."],
  ["10.06", "Tue", "Oslo", "Companion returns · Solo extension begins", "Your companion returns to Hong Kong on the original ticket. Travel to Oslo S and check in at Comfort Hotel Grand Central for a two-night solo stay in Oslo.", "Solo extension · 10.06→10.08 booked", "The extension is a Compact Double room with breakfast, non-refundable. Your departure date is 10.08, not 10.06."],
  ["10.07", "Wed", "Oslo", "Solo free day in Oslo", "Choose city walks, a museum or a climbing session based on energy and weather. Stay at Comfort Hotel Grand Central again.", "Solo free day · Second night of the extension", "The international return flight is the next day, 10.08. Avoid trips far from the city."],
  ["10.08", "Thu", "In transit", "Solo journey home begins", "Fly from Oslo to Hong Kong via Bangkok.", "TG955 · TG628 · Ticket change confirmed", "After checkout, travel to OSL and confirm check-in arrangements and through-checked baggage."],
  ["10.09", "Fri", "In transit", "Arrive in Hong Kong", "Arrive in Hong Kong at 14:20 as scheduled, ending the solo extension.", "15 days / 13 overnight stays", "Your companion returns earlier as originally planned. Keep receipts and insurance documents."],
] as const;

const activities = [
  {
    id: "oslo-day", date: "09.26", place: "Oslo", title: "Full day in Oslo · Architecture and waterfront",
    subtitle: "Oslo S → Bjørvika → MUNCH", operator: "Self-guided walk / Indoor alternatives",
    time: "10:00—19:00 (can be shortened)", duration: "About 4—7 hours, with breaks as needed", meeting: "Comfort Hotel Grand Central / Oslo S",
    plan: "Leave the hotel at 10:00 and walk to Deichman Library and the Opera House roof. After lunch, follow the Bjørvika waterfront to MUNCH and spend time in one museum. Choose the National Museum if you prefer traditional art; there is no need to fit both into one day.",
    includes: "Walking is free; museums and meals depend on choices on the day", price: "Tickets not purchased", status: "Self-guided", locked: false,
    note: "Avoid strenuous climbing after the long flight on 09.25; an early airport start is planned for 09.27. The original plan lists MUNCH's usual Saturday hours as 10:00—21:00; check the day's opening hours before visiting.", link: "https://www.munch.no/en/visit-us/opening-hours/",
    summary: "09.26: full day in Oslo; Oslo S—Deichman—Opera House roof—Bjørvika—MUNCH. Focus on indoor museums in poor weather. Tickets have not been purchased.",
  },
  {
    id: "svalbard-act", date: "09.28", place: "Svalbard", title: "Wildlife and Glacier",
    subtitle: "Hybrid Catamaran Tour · MS Bard", operator: "Hurtigruten Svalbard",
    time: "Meet at 08:15", duration: "Full day; subject to the operator's instructions", meeting: "Tourist Information Centre",
    plan: "Take a hybrid catamaran to Billefjorden and Nordenskiöldbreen to see fjords, glaciers and wildlife along the way.",
    includes: "Onboard guide and lunch", price: "NOK 5,990 / 2 people", status: "Paid", locked: true,
    note: "Sea conditions, drift ice and visibility may change the route or cause cancellation.", link: "https://hurtigrutensvalbard.com/",
    summary: "09.28 at 08:15; meet at the Tourist Information Centre. MS Bard visits Billefjorden and Nordenskiöldbreen, with a guide and lunch included. Total for 2 adults: NOK 5,990.",
  },
  {
    id: "foxfonna-hike", date: "09.29", place: "Svalbard", title: "Hike Across Foxfonna",
    subtitle: "with packdog", operator: "Green Dog Svalbard",
    time: "Meet at 10:00", duration: "About 6 hours", meeting: "Tourist Information Centre",
    plan: "Cross Foxfonna with a guide and a pack dog. Bring warm, windproof and waterproof layers for a full day outdoors.",
    includes: "Light meal and hot drinks", price: "NOK 3,380 / 2 people", status: "Paid", locked: true,
    note: "Participants should be in normal good health. Weather and the guide's judgement determine the route and whether the activity proceeds.", link: "https://greendog.no/",
    summary: "09.29 at 10:00; meet at the Tourist Information Centre. Green Dog Svalbard, about 6 hours, with a light meal and hot drinks. Total for 2 adults: NOK 3,380.",
  },
  {
    id: "svalbard-flex", date: "09.30", place: "Svalbard", title: "Weather reserve and indoor alternatives",
    subtitle: "Weather reserve day", operator: "To be decided based on the weather",
    time: "Flexible all day", duration: "Half day or full day", meeting: "Longyearbyen",
    plan: "First reschedule any activities cancelled by weather over the previous two days. Otherwise, choose a mine tour, museum visit or walk in Longyearbyen.",
    includes: "Depends on the final choice", price: "No costs incurred yet", status: "Not booked", locked: false,
    note: "Decide the evening before; avoid adding non-cancellable bookings.", link: "",
    summary: "09.30: flexible all day. Prioritise activities cancelled by weather; otherwise choose a mine tour, museum visit or walk in Longyearbyen. Decide the evening before based on the weather.",
  },
  {
    id: "dog-sledding", date: "10.01", place: "Svalbard", title: "Dog sledding on wheels",
    subtitle: "Dog sledding on wheels", operator: "Green Dog Svalbard",
    time: "09:00—about 13:00", duration: "4 hours", meeting: "Tourist Information Centre",
    plan: "Join a dog sledding tour on wheels led throughout by an experienced armed guide. Confirm the final pickup time as instructed.",
    includes: "Transfers, outdoor clothing, rainwear, boots, gloves, hot drinks and waffles", price: "NOK 3,780 / 2 people", status: "Paid", locked: true,
    note: "This seasonal activity uses wheels on snow-free ground rather than sled runners on snow.", link: "https://greendog.no/",
    summary: "10.01 from 09:00 to about 13:00; meet at the Tourist Information Centre. 4 hours, including transfers, equipment, hot drinks and waffles. Total for 2 adults: NOK 3,780.",
  },
  {
    id: "aurora", date: "10.02", place: "Tromsø", title: "Northern Lights Tour",
    subtitle: "Small Group", operator: "Small-group northern lights tour in Tromsø",
    time: "19:00—02:00 the following day", duration: "About 7 hours", meeting: "Clarion The Edge Hotel",
    plan: "Join a small-group northern lights tour after arriving in Tromsø and checking in. The planned interval between landing and the meeting time is about 4 hours 50 minutes.",
    includes: "As stated in the operator's confirmation", price: "NOK 4,017 / 2 people", status: "Booked", locked: true,
    note: "Northern lights sightings are not guaranteed. Plan only light activities the following day.", link: "https://www.visittromso.no/northern-lights-tour-small-group",
    summary: "10.02 from 19:00 to 02:00 the following day; meet at Clarion The Edge Hotel. 2 adults at NOK 1,950 each, plus a NOK 117 service fee. Total: NOK 4,017.",
  },
  {
    id: "tromso-flex", date: "10.03", place: "Tromsø", title: "City walks and recovery",
    subtitle: "Post-aurora recovery", operator: "Self-guided",
    time: "Daytime", duration: "Light activities, flexible duration", meeting: "Around Scandic Ishavshotel",
    plan: "Choose a harbour walk, indoor attractions or the cable car based on sleep, weather and cloud cover. Keep the schedule flexible.",
    includes: "Depends on choices on the day", price: "No costs incurred yet", status: "Not booked", locked: false,
    note: "The northern lights tour is expected to finish in the early morning; prioritise sleep.", link: "",
    summary: "10.03 during the day: recovery after the northern lights tour. Choose a harbour walk, indoor attractions or the cable car based on sleep and weather.",
  },
  {
    id: "senja-flex", date: "10.04", place: "Senja", title: "Flexible scenic stops on the drive to Senja",
    subtitle: "Tromsø → Hamn i Senja", operator: "Self-drive",
    time: "After car pickup at 10:00", duration: "Flexible, depending on road conditions", meeting: "Tromsø Langnes Airport",
    plan: "Drive to Hamn i Senja. Decide on scenic stops based on wind, snow, road conditions, visibility and remaining daylight.",
    includes: "Car booked; activities along the route not booked", price: "No separate activity costs incurred", status: "Not booked", locked: false,
    note: "Prioritise reaching the hotel and returning safely the next day rather than the number of scenic stops.", link: "",
    summary: "10.04 after car pickup: drive from Tromsø to Hamn i Senja. Choose scenic stops according to wind, snow, road conditions and visibility.",
  },
] as const;

const bookings = [
  ["international", "Flights", "International flights and separate return dates", "09.25: CZ307 CAN→AMS and KL1203 AMS→OSL (arrival at 14:20 local time). Your companion returns on 10.06; your ticket has been changed to 10.08 OSL→BKK→HKG. Original tickets for both travellers: ¥22,856. The fare difference has not been recorded.", "", "Ticketed", "locked"],
  ["domestic", "Flights", "Three domestic flights in Norway", "SK4492 OSL→LYR · US$484.80; SK4425 LYR→TOS · US$519.80; SK4431 TOS→OSL · US$311.80.", "", "Paid", "locked"],
  ["lyr-stay", "Accommodation", "Svalbard Hotell | Polfareren", "Check in 09.27, check out 10.02; 5 nights. Total for both travellers: ¥11,092.73.", "https://www.booking.com/hotel/no/svalbard.html", "Paid", "locked"],
  ["tos-stay", "Accommodation", "Scandic Ishavshotel", "Check in 10.02, check out 10.04; 2 nights, twin room for 2 adults. Total: NOK 4,822.20, booked and awaiting payment.", "https://www.booking.com/hotel/no/scandic-ishavshotel.html", "Booked", "locked"],
  ["osl-arrival-stay", "Accommodation", "Comfort Hotel Grand Central · Arrival night", "Check in 09.25, check out 09.26; 1 night booked through Trip.com for ¥1,679.83, with payment authorised after checkout. This and the following night are separate bookings; ask reception whether a room change is needed.", "", "Booked; charge pending", "locked"],
  ["osl-central-stay", "Accommodation", "Comfort Hotel Grand Central · Second night", "Check in 09.26, check out 09.27; 1 night for 2 adults. Total: ¥1,853.46, confirmed.", "https://www.booking.com/hotel/no/comfort-grand-central.html", "Booked", "locked"],
  ["senja-stay", "Accommodation", "Hamn i Senja", "Check in 10.04, check out 10.05; 1 night. Address: Hamnveien 1145, 9385 Hamn i Senja. Paid: ¥1,024.94.", "", "Paid", "locked"],
  ["osl-airport-stay", "Accommodation", "Radisson Blu Airport Hotel, Oslo Gardermoen", "Check in 10.05, check out 10.06; 1 night for 2 adults. Total: ¥1,242.36, confirmed.", "https://www.booking.com/hotel/no/radisson-blu-airport-oslo.html", "Booked", "locked"],
  ["osl-solo-extension", "Accommodation", "Comfort Hotel Grand Central · Solo extension", "Check in 10.06, check out 10.08; 2 nights for 1 adult. Compact Double room, breakfast included, non-refundable. NOK 3,485.65 (booking displays approximately ¥2,475.36), confirmed.", "https://www.booking.com/hotel/no/comfort-grand-central.html", "Booked", "locked"],
  ...activities.map(activity => [activity.id, "Activities", activity.title, activity.summary, activity.link, activity.status, activity.locked ? "locked" : "pending"] as const),
  ["car", "Transport", "Tromsø—Senja rental car", "Toyota RAV4 or similar, automatic, unlimited mileage. Pick up at Tromsø Langnes Airport at 10:00 on 10.04; return to the same location at 16:00 on 10.05. Estimated total: NOK 4,217.29.", "", "Booked", "locked"],
  ["visa", "Documents and insurance", "Visa permitting two Schengen entries", "The visa has been issued. Svalbard is outside the Schengen Area; returning to Tromsø requires another entry.", "https://www.udi.no/en/word-definitions/svalbard/", "Issued", "locked"],
  ["insurance", "Documents and insurance", "Insurance covering Svalbard", "Confirm cover for polar travel, search and rescue, medical evacuation and trip cancellation.", "", "Essential", "pending"],
] as const;

const costs = [
  ["International return flights", 22866, 22866],
  ["Domestic flights in Norway", 5000, 9000],
  ["13 overnight stays (including solo extension)", 22000, 33000],
  ["Core activities", 16000, 24000],
  ["Meals (including solo extension)", 7500, 11000],
  ["Transport and rental car", 4500, 7000],
  ["Visa and insurance", 3000, 5000],
  ["Contingency reserve", 5000, 8000],
] as const;

const actualCosts = [
  ["2026.08.05", "International flights", "International return flights for two", 22856, "CNY", "Paid"],
  ["2026.08.07", "Norway flights", "OSL→LYR · SK4492", 484.80, "USD", "Paid"],
  ["2026.08.07", "Norway flights", "LYR→TOS · SK4425", 519.80, "USD", "Paid"],
  ["2026.08.07", "Norway flights", "TOS→OSL · SK4431", 311.80, "USD", "Paid"],
  ["2026.08.08", "Accommodation", "Svalbard Hotell | Polfareren · 5 nights", 11092.73, "CNY", "Paid"],
  ["2026.08.10", "Accommodation", "Scandic Ishavshotel · Twin room · 2 nights", 4822.20, "NOK", "Booked, awaiting payment"],
  ["2026.09.25", "Accommodation", "Comfort Hotel Grand Central · 09.25 arrival night", 1679.83, "CNY", "Authorised; charged after checkout"],
  ["2026.08.13", "Accommodation", "Comfort Hotel Grand Central · 1 night", 1853.46, "CNY", "Booked"],
  ["2026.08.13", "Accommodation", "Radisson Blu Airport Hotel · 1 night", 1242.36, "CNY", "Booked"],
  ["2026.09.05", "Accommodation", "Hamn i Senja · 1 night", 1024.94, "CNY", "Paid"],
  ["2026.09.22", "Accommodation", "Comfort Hotel Grand Central · Solo extension · 2 nights", 2475.36, "CNY", "Displayed booking price; unpaid"],
  ["2026.09.06", "Transport", "Toyota RAV4 or similar · Automatic · Unlimited mileage", 4217.29, "NOK", "Booked; estimated"],
  ["2026.09.06", "Activities", "Northern Lights Tour Small Group · 2 people", 4017, "NOK", "Booked"],
  ["2026.09.06", "Activities", "Wildlife and Glacier · MS Bard · 2 people", 5990, "NOK", "Paid"],
  ["2026.09.06", "Activities", "Hike Across Foxfonna with packdog · 2 people", 3380, "NOK", "Paid"],
  ["2026.09.06", "Activities", "Dog sledding on wheels · 2 people", 3780, "NOK", "Paid"],
] as const;

const fxSnapshot = {
  date: "2026.09.06",
  USD: 6.71057,
  NOK: 0.721253,
  CNY: 1,
} as const;

const kit = [
  ["Documents", "Passport, visa and paper copies"], ["Documents", "English insurance certificate and emergency contacts"],
  ["Clothing", "2 sets of wool base layers"], ["Clothing", "Fleece and lightweight down mid-layers"],
  ["Clothing", "Waterproof, windproof shell jacket and trousers"], ["Clothing", "Waterproof mid- or high-cut boots and portable traction spikes"],
  ["Clothing", "Warm hat, neck gaiter, gloves and wool socks"], ["Equipment", "Spare camera batteries and tripod"],
  ["Equipment", "Power bank, European plug adapter and spare cables"], ["Essentials", "Seasickness medication, usual medicines and lip balm"],
] as const;

const yuan = (n: number) => new Intl.NumberFormat("en-GB").format(Math.round(n));
const yuanExact = (n: number) => new Intl.NumberFormat("en-GB", {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(n);
const toCny = (amount: number, currency: Currency) => currency === "CNY" ? amount : amount * fxSnapshot[currency];

function useSaved(key: string) {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("storage", onChange);
    window.addEventListener("arctic-checklist-change", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("arctic-checklist-change", onChange);
    };
  }, []);
  const getSnapshot = useCallback(() => {
    try { return localStorage.getItem(key) || "[]"; } catch { return "[]"; }
  }, [key]);
  const saved = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  const value: string[] = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch { return []; }
  }, [saved]);
  const toggle = (id: string) => {
    const next = value.includes(id) ? value.filter(x => x !== id) : [...value, id];
    localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event("arctic-checklist-change"));
  };
  return { value, toggle };
}

const subscribeDate = () => () => {};
const departureCountdown = () => Math.max(0, Math.ceil((new Date("2026-09-25T00:00:00+08:00").getTime() - Date.now()) / 86400000));

function Map() {
  return (
    <div className="map">
      <svg viewBox="0 0 720 520" role="img" aria-label="Route map: Guangzhou, Amsterdam, Oslo, Longyearbyen, Tromsø, Bangkok and Hong Kong">
        <g className="grid">
          <path d="M80 0V520M200 0V520M320 0V520M440 0V520M560 0V520M680 0V520M0 70H720M0 180H720M0 290H720M0 400H720" />
          <circle cx="380" cy="220" r="80"/><circle cx="380" cy="220" r="155"/><circle cx="380" cy="220" r="225"/>
        </g>
        <path className="land" d="M68 470c57-72 94-64 130-127 31-54 41-84 90-109 49-25 63-87 111-103 38-13 70 4 94 32 23 27 12 56 44 72 48 25 82 17 115 62 31 42 38 91 68 126v47Z"/>
        <path className="fly international" d="M132 448C205 370 286 354 355 315"/>
        <path className="fly north" d="M355 315C409 244 434 164 472 103"/>
        <path className="fly return" d="M472 103C452 178 424 224 404 250M404 250C465 330 396 402 250 454M250 454L145 466"/>
        {[[132,448,"CAN","Guangzhou"],[319,329,"AMS","Amsterdam"],[355,315,"OSL","Oslo"],[472,103,"LYR · 78.2°N","Longyearbyen"],[404,250,"TOS · 69.6°N","Tromsø"],[250,454,"BKK","Bangkok"],[145,466,"HKG","Hong Kong"]].map(([x,y,a,b]) =>
          <g className="pin" key={String(a)}><circle cx={Number(x)} cy={Number(y)} r={a === "LYR · 78.2°N" ? 9 : 6}/><text x={Number(x)+17} y={Number(y)-3}>{a}</text><text className="sub" x={Number(x)+17} y={Number(y)+15}>{b}</text></g>
        )}
        <text className="ocean" x="495" y="45">ARCTIC OCEAN</text>
        <path className="north-arrow" d="M655 95V24m0 0-8 20m8-20 8 20"/><text className="n" x="649" y="17">N</text>
      </svg>
      <div className="legend"><span><i/>Northbound route</span><span><i/>Return journey</span></div>
    </div>
  );
}

export default function Home() {
  const [place, setPlace] = useState<Place>("All");
  const [perPerson, setPerPerson] = useState(false);
  const countdown = useSyncExternalStore(subscribeDate, departureCountdown, () => null);
  const done = useSaved("arctic-booking-v2");
  const packed = useSaved("arctic-kit-en-v1");
  useEffect(() => { document.documentElement.lang = "en"; }, []);
  const shown = useMemo(() => place === "All" ? days : days.filter(d => d[2] === place), [place]);
  const low = costs.reduce((s,c) => s + c[1], 0);
  const high = costs.reduce((s,c) => s + c[2], 0);
  const div = perPerson ? 2 : 1;
  const locked = bookings.filter(b => b[6] === "locked").length;
  const completed = new Set([...bookings.filter(b => b[6] === "locked").map(b => b[0]), ...done.value]);
  const totalCny = actualCosts.reduce((sum, item) => sum + toCny(item[3], item[4]), 0);
  const paidCny = actualCosts.filter(item => item[5] === "Paid").reduce((sum, item) => sum + toCny(item[3], item[4]), 0);
  const pendingCny = totalCny - paidCny;

  return (
    <main lang="en">
      <header>
        <a href="#top" className="brand"><span className="mountains"><i/><i/></span><b>78° North</b><small>ARCTIC FIELD LOG</small></a>
        <nav><a href="#plan">Itinerary</a><a href="#activities">Activities</a><a href="#book">Bookings</a><a href="#budget">Budget</a><a href="#kit">Kit</a></nav>
        <div className="header-tools"><a className="language-link" href="/" lang="zh-CN">中文</a><a href="#book" className="status"><i/>{locked}/{bookings.length} Booked</a></div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">EXPEDITION FILE / 2026—09</p>
          <h1>North<br/>78°</h1>
          <h2>Two travellers northbound · One solo extension</h2>
          <div className="orange"/>
          <p className="date">2026.09.25 — 10.09 · 15 days / 13 overnight stays</p>
          <p className="route">Guangzhou <b>→</b> Oslo <b>→</b> Svalbard <b>→</b> Tromsø／Senja <b>→</b> Oslo</p>
          <div className="actions"><a href="#plan">View daily itinerary ↘</a><a href="#book">View bookings ↗</a></div>
          <small className="count">{countdown === null ? "Checking itinerary dates…" : countdown === 0 ? "Trip in progress · All dates use local calendars" : `${countdown} days until departure`}</small>
        </div>
        <Map/>
      </section>

      <section className="stats">
        <div><span>Travellers</span><b>2 adults</b><small>Solo extension from 10.06</small></div>
        <div><span>Northernmost point</span><b>78.2° N</b><small>Longyearbyen</small></div>
        <div><span>Accommodation booked</span><b>13 nights</b><small>A room is booked for every night: 09.25—10.08</small></div>
        <div><span>Recorded costs in CNY</span><b>¥{yuan(totalCny)}</b><small>Paid ¥{yuanExact(paidCny)} · FX snapshot: 09.06</small></div>
        <div className="boundary"><span>Expedition limit / 90°N</span><p>Reaching the geographic North Pole is not a practical option in this season. This Arctic itinerary reaches Svalbard at 78° north.</p></div>
      </section>

      <section className="section" id="plan">
        <div className="section-head"><div><p className="eyebrow">01 / DAILY LOG</p><h2>Daily itinerary</h2></div><p>Flights, accommodation, the rental car, Svalbard cruise, hike and dog sledding on wheels, and the Tromsø northern lights tour are booked. Keep flexibility for the weather.</p></div>
        <div className="filters">
          {(["All","Tromsø","Svalbard","Oslo","In transit"] as Place[]).map(p => <button key={p} onClick={() => setPlace(p)} className={place === p ? "active" : ""} aria-pressed={place === p}>{p}<small>{p === "All" ? days.length : days.filter(d => d[2] === p).length}</small></button>)}
        </div>
        <div className="days">
          {shown.map((d) => {
            const number = days.indexOf(d) + 1;
            return <article key={d[0]}><div className="day"><b>{String(number).padStart(2,"0")}</b><strong>{d[0]}</strong><small>{d[1]}</small></div><span className={`place p-${d[2]}`}>{d[2]}</span><div className="task"><h3>{d[3]}</h3><p>{d[4]}</p><b>{d[5]}</b></div><div className="note"><small>NOTE</small><p>{d[6]}</p></div></article>;
          })}
        </div>
      </section>

      <section className="visa"><b>02×</b><div><p className="eyebrow">BORDER CONTROL / Read first</p><h2>A visa permitting two Schengen entries is required</h2><p>Svalbard is outside the Schengen Area. Flying from Oslo to Longyearbyen means leaving Schengen, and returning to Tromsø means entering again. The visa must permit a second entry.</p></div><a href="https://www.udi.no/en/word-definitions/svalbard/" target="_blank" rel="noreferrer">Norwegian immigration guidance ↗</a></section>

      <section className="section activity-section" id="activities">
        <div className="section-head"><div><p className="eyebrow">02 / ACTIVITY DOSSIER</p><h2>Activity details</h2></div><p>4 core activities are booked. The full day in Oslo and weather reserve days remain flexible according to energy levels. Activities without purchased tickets are not marked as booked.</p></div>
        <div className="activity-summary"><div><b>{activities.filter(activity => activity.locked).length}</b><span>Booked</span></div><div><b>{activities.filter(activity => !activity.locked).length}</b><span>Not booked</span></div><p>All activity prices are totals for two people. Booking references, ticket numbers, names and dates of birth are not displayed.</p></div>
        <div className="activity-grid">
          {activities.map((activity, index) => <article className={`activity-card ${activity.locked ? "activity-locked" : "activity-pending"}`} key={activity.id}>
            <div className="activity-top"><div className="activity-date"><small>ACT {String(index + 1).padStart(2,"0")}</small><b>{activity.date}</b><span>{activity.place}</span></div><em>{activity.status}</em></div>
            <h3>{activity.title}</h3><p className="activity-subtitle">{activity.subtitle}</p><p className="activity-plan">{activity.plan}</p>
            <dl><div><dt>Time</dt><dd>{activity.time}</dd></div><div><dt>Duration</dt><dd>{activity.duration}</dd></div><div><dt>Operator / Format</dt><dd>{activity.operator}</dd></div><div><dt>Meeting point / Start</dt><dd>{activity.meeting}</dd></div><div className="activity-includes"><dt>Included / Arrangements</dt><dd>{activity.includes}</dd></div></dl>
            <div className="activity-bottom"><div><small>Cost for two</small><strong>{activity.price}</strong></div>{activity.link ? <a href={activity.link} target="_blank" rel="noreferrer">Operator ↗</a> : <span>Flexible plan</span>}</div>
            <p className="activity-note">{activity.note}</p>
          </article>)}
        </div>
      </section>

      <section className="section" id="book">
        <div className="section-head"><div><p className="eyebrow">03 / BOOKING BOARD</p><h2>Booking board</h2></div><div className="progress"><b>{Math.round(completed.size/bookings.length*100)}%</b><span>Booked + completed on this device</span></div></div>
        <div className="progress-bar"><i style={{width:`${completed.size/bookings.length*100}%`}}/></div>
        <p className="fine">Only non-sensitive itinerary details and amounts are shown. Booking references, ticket numbers and identity document details are omitted.</p>
        {["Flights","Accommodation","Activities","Transport","Documents and insurance"].map((group,gi) => <div className="book-group" key={group}><div className="group-title"><small>0{gi+1}</small><h3>{group}</h3></div><div>{bookings.filter(b => b[1] === group).map(b => { const isLocked=b[6] === "locked", checked = isLocked || done.value.includes(b[0]); return <article className={checked ? "book-card checked" : "book-card"} key={b[0]}><button disabled={isLocked} onClick={() => !isLocked && done.toggle(b[0])} aria-pressed={checked} aria-label={`Mark ${b[2]}`}>{checked ? "✓" : ""}</button><div><h4>{b[2]} {b[5] && <em className={isLocked ? "locked" : ""}>{b[5]}</em>}</h4><p>{b[3]}</p></div>{b[4] ? <a href={b[4]} target="_blank" rel="noreferrer">Open ↗</a> : <span>{isLocked ? "Confirmed" : "Confirm manually"}</span>}</article>})}</div></div>)}
      </section>

      <section className="budget" id="budget"><div className="budget-inner">
        <div className="section-head"><div><p className="eyebrow">04 / COST RANGE · CNY</p><h2>Trip budget</h2></div><div className="switch"><button className={!perPerson ? "active":""} onClick={() => setPerPerson(false)}>Trip total</button><button className={perPerson ? "active":""} onClick={() => setPerPerson(true)}>Total ÷ 2 reference</button></div></div>
        <div className="total"><span>Estimated budget range</span><b>¥{yuan(low/div)} — {yuan(high/div)}</b><small>{perPerson ? "Total divided by 2 for reference only; 10.06—10.08 actually covers one person" : "Main trip for two plus solo extension; excludes unrecorded fare differences and shopping"}</small></div>
        <div className="costs">{costs.map((c,i) => <article key={c[0]}><div><i style={{background:i===3?"#e56a36":"#78aab5"}}/><b>{c[0]}</b></div><span><i style={{width:`${Math.max(10,c[2]/350)}%`,background:i===3?"#e56a36":"#78aab5"}}/></span><strong>¥{yuan(c[1]/div)}–{yuan(c[2]/div)}</strong></article>)}</div>
        <div className="ledger"><div className="ledger-head"><div><small>ACTUAL COST TRACKER</small><h3>Expense ledger</h3></div><b>¥{yuanExact(totalCny)} <small>Paid ¥{yuanExact(paidCny)} · Unpaid estimate ¥{yuanExact(pendingCny)}</small></b></div><div className="fx-note"><b>FIXED FX · {fxSnapshot.date}</b><span>1 USD = ¥{fxSnapshot.USD} · 1 NOK = ¥{fxSnapshot.NOK}</span><small>Paid foreign-currency items use this fixed snapshot. Booked but unpaid items are provisionally estimated at the same rates.</small></div>{actualCosts.map(item=><article key={item[0]+item[2]}><time>{item[0]}</time><span>{item[1]}</span><strong>{item[2]}</strong><b>{item[4] === "CNY" ? "¥" : item[4] === "USD" ? "US$" : "NOK "}{item[3].toLocaleString("en-GB", {minimumFractionDigits:2, maximumFractionDigits:2})}<small>{item[4] === "CNY" ? "= " : "≈ "}¥{yuanExact(toCny(item[3], item[4]))}</small></b><em>{item[5]}</em></article>)}</div>
        <div className="discipline"><b>Budget priorities</b><p>Use booking confirmations and the expense ledger for actual costs. If over budget, reduce optional activities first while preserving Svalbard weather reserves and safe return buffers.</p></div>
      </div></section>

      <section className="section" id="kit">
        <div className="section-head"><div><p className="eyebrow">05 / FIELD KIT</p><h2>Packing list</h2></div><p>Sea wind and damp cold matter more than the temperature alone: moisture-wicking base layer, warm mid-layer, and windproof, waterproof outer layer.</p></div>
        <div className="kit">{["Documents","Clothing","Equipment","Essentials"].map(g => <div key={g}><h3>{g}</h3>{kit.filter(x => x[0]===g).map(x => { const id=`${x[0]}-${x[1]}`, checked=packed.value.includes(id); return <button key={id} onClick={() => packed.toggle(id)} className={checked ? "checked":""} aria-pressed={checked}><i>{checked?"✓":""}</i>{x[1]}</button>})}</div>)}</div>
      </section>

      <section className="safety"><div><p className="eyebrow">06 / SAFETY PROTOCOL</p><h2>Use a guided tour outside Svalbard settlements</h2></div><div className="safety-cards"><article><b>01</b><h3>Go with a qualified guide</h3><p>Polar bear risk exists outside settlements. Use professional local operators for outdoor activities.</p></article><article><b>02</b><h3>Weather determines the route</h3><p>Sea conditions, wind and visibility may change routes or cause cancellations. Reserve days provide a safety margin.</p></article><article><b>03</b><h3>Confirm polar insurance cover</h3><p>Confirm that Svalbard, search and rescue, medical evacuation and trip cancellation are not excluded.</p></article></div><div className="official"><a href="https://en.visitsvalbard.com/visitor-information/safety-in-svalbard" target="_blank" rel="noreferrer">Visit Svalbard safety guidance ↗</a><a href="https://www.sysselmesteren.no/en/" target="_blank" rel="noreferrer">Governor of Svalbard ↗</a><a href="https://www.yr.no/en/forecast/daily-table/2-2729907/Norway/Svalbard/Longyearbyen" target="_blank" rel="noreferrer">Longyearbyen weather ↗</a></div></section>

      <footer><b>78°</b><div><strong>78° North · ARCTIC FIELD LOG</strong><p>Itinerary checked: 2026.09.25. Flights use local arrival dates; accommodation is matched to each overnight stay. Unrecorded fare-change costs are excluded from the ledger.</p></div><a href="#top">Back to map ↑</a></footer>
    </main>
  );
}
