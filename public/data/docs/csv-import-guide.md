# Event CSV Import Guide

## Overview

The CSV import feature allows administrators to bulk import multiple events into the system at once. This guide explains the required format and process for using this feature.

## CSV Format

Your CSV file must include the following headers:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | String | Yes | The title/name of the event |
| description | String | Yes | Detailed description of the event |
| date | Date | Yes | Start date of the event (YYYY-MM-DD) |
| endDate | Date | No | End date of the event (YYYY-MM-DD). If not specified, the start date will be used |
| location | String | Yes | City and state/region where the event will be held |
| category | String | Yes | Category of the event (Technology, Business, Design, Marketing, Health, Education, Entertainment) |
| price | Number | Yes | Ticket price in USD (no currency symbol) |
| seats | Number | Yes | Total number of available seats |
| status | String | Yes | Event status (Active, Draft, Upcoming, Completed, Cancelled) |
| featured | Boolean | No | Whether the event should be featured (true/false, yes/no, or 1/0) |
| image | String | No | URL to an image (can be relative path like /placeholder.jpg or absolute URL) |

## Sample Data

Here's a sample of properly formatted data:

```csv
title,description,date,endDate,location,category,price,seats,status,featured,image
Tech Conference 2026,A conference about the latest technology trends,2026-05-15,2026-05-17,San Francisco CA,Technology,299.99,500,Upcoming,true,/placeholder.jpg
Marketing Workshop,Learn the latest marketing strategies,2026-06-10,2026-06-10,New York NY,Marketing,149.99,100,Draft,false,
```

## CSV Import Process

1. Navigate to the Admin panel
2. Click on the "Import CSV" button in the Events tab
3. Download the template if needed
4. Prepare your CSV file following the required format
5. Upload your CSV file using the uploader
6. The system will validate your data and show any errors
7. If validation passes, your events will be imported and immediately appear in the events list

## Tips

- For text fields that contain commas, enclose the text in double quotes
- Dates must be in YYYY-MM-DD format
- Make sure all required fields are filled out
- For the image field, you can leave it blank to use the default placeholder
- The featured field accepts various formats: true/false, yes/no, or 1/0

## Validation

The system performs validation on all imported data. Common validation errors include:

- Missing required fields
- Invalid date formats
- Non-numeric values in price or seats fields
- Invalid status values

If validation errors occur, the system will display which rows have issues and what needs to be corrected. 