# GoodDeal

A lightweight, public shortlist of qualifying UAE vehicle listings. Hosted on GitHub Pages at https://jablowcapo.github.io/GoodDeal/.

The site reads `data/good-deals.json`; it never connects to a database. The authorized publisher replaces that file atomically after successful analysis. Failed publications retain the previous dataset. Snapshot 0 means no analysis has been published yet. A positive snapshot with zero listings is a successful empty analysis.

Listing links open the original marketplaces. Status icons show available L2, L3, age/mileage, urgency and price-drop evidence. These signals are informational, not a guarantee of vehicle condition or availability.

The default sort shows supported price evidence first, followed by limited evidence, listings requiring review and older records awaiting assessment. Select a regional specification or evidence level to narrow the shortlist. Each assessment comes from the desktop analyzer. It uses regional median asking prices, comparable mileage, listing freshness and explicit conflicts. Asking prices reflect the vehicles and price range monitored. A listing's last sighting and the snapshot's completion time describe different events. The page flags snapshots older than 48 hours.

The optional fields `priceEvidence` and `lastSeenAt` extend schema version 1. Older datasets render with unassessed evidence. New snapshots can be deployed before or after the reader. Only the evidence level, regional label, regional median and enumerated reasons are public. The app retains the underlying observations, diagnostic counts and seller text privately.

Serve this directory over HTTP for local preview. No build step, package installation or backend is required. GitHub Pages uses the `main` branch and repository root. Keep credentials, descriptions, contact information and internal analysis reports out of this repository.
