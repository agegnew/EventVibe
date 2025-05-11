import { NextRequest, NextResponse } from 'next/server';
import { serverGetAllEvents } from '@/lib/server-data-service';
import { Event } from '@/lib/data-service';

// Format date to YYYY-MM-DD
const formatDate = (date: string): string => {
  return new Date(date).toISOString().split('T')[0];
};

// Helper function to format event dates for iCal
const formatICalDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

// Helper function to escape special characters in iCal values
const escapeICalText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

// Generate CSV content from events array
const generateCsv = (events: Event[]): string => {
  // Define CSV headers
  const headers = [
    'id',
    'title',
    'description',
    'date',
    'endDate',
    'location',
    'category',
    'price',
    'seats',
    'status',
    'featured',
    'registrations',
    'revenue'
  ];

  // Create CSV header row
  const headerRow = headers.join(',');

  // Create data rows
  const dataRows = events.map(event => {
    return headers.map(header => {
      const value = event[header as keyof Event];

      // Handle different value types
      if (value === null || value === undefined) {
        return '';
      }

      // Format date values to YYYY-MM-DD
      if (header === 'date' || header === 'endDate') {
        return formatDate(value as string);
      }

      // Escape strings containing commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${(value as string).replace(/"/g, '""')}"`;
      }

      return String(value);
    }).join(',');
  });

  // Combine header and data rows
  return [headerRow, ...dataRows].join('\n');
};

// Generate iCal content from events array
const generateICalendar = (events: Event[]): string => {
  // Start building the iCal content
  let iCalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventVibe//Events Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  // Add each event as a VEVENT entry
  events.forEach(event => {
    const startDate = formatICalDate(event.date);
    const endDate = event.endDate ? formatICalDate(event.endDate) : startDate;
    
    // Create a unique identifier for the event
    const uid = `${event.id}@eventvibe.com`;
    
    iCalContent = [
      ...iCalContent,
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatICalDate(new Date().toISOString())}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${escapeICalText(event.title)}`,
      `DESCRIPTION:${escapeICalText(event.description)}`,
      `LOCATION:${escapeICalText(event.location)}`,
      `CATEGORIES:${escapeICalText(event.category)}`,
      `STATUS:${event.status === 'Active' ? 'CONFIRMED' : event.status === 'Cancelled' ? 'CANCELLED' : 'TENTATIVE'}`,
      'END:VEVENT'
    ];
  });

  // Close the calendar
  iCalContent.push('END:VCALENDAR');

  // Return the complete iCal content
  return iCalContent.join('\r\n');
};

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv'; // Default to CSV
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    
    // Get all events
    const allEvents = await serverGetAllEvents();
    
    // Apply filters if provided
    let filteredEvents = [...allEvents];
    
    if (category && category !== 'all') {
      filteredEvents = filteredEvents.filter(
        event => event.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (status && status !== 'all') {
      filteredEvents = filteredEvents.filter(
        event => event.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    // Generate the appropriate format
    let fileContent: string;
    let fileName: string;
    let contentType: string;
    
    // Get current date for filename
    const today = new Date().toISOString().split('T')[0];
    
    if (format.toLowerCase() === 'ical' || format.toLowerCase() === 'ics') {
      fileContent = generateICalendar(filteredEvents);
      fileName = `eventvibe_events_${today}.ics`;
      contentType = 'text/calendar';
    } else {
      // Default to CSV
      fileContent = generateCsv(filteredEvents);
      fileName = `eventvibe_events_${today}.csv`;
      contentType = 'text/csv';
    }
    
    // Add filters to filename if used
    if (category && category !== 'all') {
      fileName = fileName.replace('.', `_${category}.`);
    }
    
    if (status && status !== 'all') {
      fileName = fileName.replace('.', `_${status}.`);
    }
    
    // Set response headers
    const headers = {
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type': contentType
    };
    
    // Return the file for download
    return new NextResponse(fileContent, { 
      status: 200,
      headers 
    });
  } catch (error) {
    console.error('Error exporting events:', error);
    return NextResponse.json({ 
      error: 'Failed to export events',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 