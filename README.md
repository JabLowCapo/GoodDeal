# GoodDeal

A lightweight, public shortlist of qualifying UAE vehicle listings. Hosted on GitHub Pages at https://jablowcapo.github.io/GoodDeal/.

The site reads `data/good-deals.json`; it never connects to a database. The authorized publisher replaces that file atomically after successful analysis. Failed publications retain the previous dataset. Snapshot 0 means no analysis has been published yet. A positive snapshot with zero listings is a successful empty analysis.

Listing links open the original marketplaces. Status icons show available L2, L3, age/mileage, urgency and price-drop evidence. These signals are informational, not a guarantee of vehicle condition or availability.

The default sort shows supported price evidence first, followed by limited evidence, listings requiring review and older records awaiting assessment. Select a regional specification or evidence level to narrow the shortlist. Each assessment comes from the desktop analyzer. It uses regional median asking prices, comparable mileage, listing freshness and explicit conflicts. Asking prices reflect the vehicles and price range monitored. A listing's last sighting and the snapshot's completion time describe different events. The page flags snapshots older than 48 hours.

The optional fields `priceEvidence` and `lastSeenAt` extend schema version 1. Older datasets render with unassessed evidence. New snapshots can be deployed before or after the reader. Only the evidence level, regional label, regional median and enumerated reasons are public. The app retains the underlying observations, diagnostic counts and seller text privately.

Serve this directory over HTTP for local preview. No build step, package installation or backend is required. GitHub Pages uses the `main` branch and repository root. Keep credentials, descriptions, contact information and internal analysis reports out of this repository.

## Chinese car brand filter

**Exclude Chinese Car Brands** is checked on each page load. Uncheck it to see the full shortlist. The filter compares the listing’s make to a catalogue of reviewed English, Arabic and Chinese labels. It handles differences in case, spacing, hyphens and Arabic typography. Every model of a matching make is hidden. Listings with a missing or unrecognized make stay visible. [Make catalogue](./chinese-makes.mjs)

The catalogue covers marques, sub-brands and historical names used in the UAE, including MG under the existing GoodDeal rule. FAW Besturn and FAW Bestune both identify Bestune. Haval, Tank and Ora are separate GWM marques. The filter follows the identity of the marque shown in the listing. Volvo and Polestar stay visible. [Bestune](https://bestune.ly/about-us/), [GWM](https://www.gwm-global.com/aboutGWM/) and [UAE marketplace brand guide](https://www.dubicars.com/news/chinese-car-brands-in-uae.html).

Some labels need marketplace context. AutoTraders and OpenSooq use `Avatar` for Avatr, and CarSwitch lists `Galaxy` as a make. JMC and GMC have overlapping Arabic spellings. The shared spelling stays visible, while `JMC`, `Jiangling Motors` and `جاي ام سي` identify JMC. [AutoTraders example](https://uae.autotraders.ae/used-cars/avatar/11/no-trim/2025/avatar-11-2025-163752), [OpenSooq example](https://ae.opensooq.com/en/cars/cars-for-sale/Avatar/Model-11) and [CarSwitch Galaxy directory](https://carswitch.com/uae/used-cars/galaxy).

Run `node --test tests/brand-filter.test.mjs` to check aliases, similar-looking makes and every make in the current published snapshot. Set `GOODDEAL_AUDIT_SNAPSHOT` to a JSON file to check an incoming snapshot. The check names unfamiliar labels together with their marketplace so they can be reviewed in batches. When adding a label, confirm which make it identifies in that marketplace’s selector or listing, then add a regression example. [Filter tests](./tests/brand-filter.test.mjs)

The November 2026 regression sample records English and Arabic make labels from AutoTraders, CarSwitch, DubiCars, Dubizzle, OpenSooq and YallaMotor. The tests exercise these labels even when the current shortlist has no cars from those brands. [Marketplace sample](./tests/marketplace-aliases.json) and [YallaMotor Chinese car directory](https://uae.yallamotor.com/chinese-cars).
