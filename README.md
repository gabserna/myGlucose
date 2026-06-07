# Glucose Tracker

A web application built with Vue.js and Vuetify to record, view, and manage blood glucose measurements. Data is stored in Supabase and can be accessed in real time through a history table.

## Features

* Blood glucose level recording.
* Input validation for accepted values (20 - 600).
* Automatic glucose status classification:

  * Low
  * Normal
  * Elevated
  * High
  * Very High
* History of records sorted by date.
* Color-coded indicators based on glucose status.
* Bulk deletion of records with confirmation dialog.
* Data persistence using Supabase.

## Technologies

* Vue.js
* Vuetify
* Supabase
* JavaScript

## Installation

```bash
npm install
npm run serve
```

## Data Structure

Each record contains:

```json
{
  "timestamp": "2026-06-07T12:00:00.000Z",
  "value": 110,
  "status": "Normal"
}
```

## Disclaimer

This application is intended for informational and personal tracking purposes only. It does not replace professional medical advice, diagnosis, or treatment.
