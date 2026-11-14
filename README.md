# GoodDeal

A lightweight, public shortlist of qualifying UAE vehicle listings. Hosted on GitHub Pages at https://jablowcapo.github.io/GoodDeal/.

The site reads `data/good-deals.json`; it never connects to a database. The authorized publisher replaces that file atomically after successful analysis. Failed publications retain the previous dataset. Snapshot 0 means no analysis has been published yet. A positive snapshot with zero listings is a successful empty analysis.

Listing links open the original marketplaces. Status icons show available L2, L3, age/mileage, urgency and price-drop evidence. These signals are informational, not a guarantee of vehicle condition or availability.

Serve this directory over HTTP for local preview. No build step, package installation or backend is required. GitHub Pages uses the `main` branch and repository root. Keep credentials, descriptions, contact information and internal analysis reports out of this repository.
