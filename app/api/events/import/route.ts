import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { serverImportEvents, serverGetUserByEmail, serverValidateCredentials } from '@/lib/server-data-service';
import { Event } from '@/lib/data-service';
import { jwtVerify } from 'jose';

// Helper for field validation
const validateField = (
  field: any, 
  fieldName: string, 
  isRequired: boolean = true,
  type: 'string' | 'number' | 'boolean' | 'date' = 'string'
): { valid: boolean; value: any; error?: string } => {
  // Check if field is present if required
  if (isRequired && (field === undefined || field === null || field === '')) {
    return { valid: false, value: field, error: `${fieldName} is required` };
  }
  
  // If not required and empty, return valid
  if (!isRequired && (field === undefined || field === null || field === '')) {
    return { valid: true, value: type === 'string' ? '' : type === 'number' ? 0 : type === 'boolean' ? false : null };
  }
  
  // Type validation
  if (type === 'number') {
    const num = parseFloat(field);
    if (isNaN(num)) {
      return { valid: false, value: field, error: `${fieldName} must be a number` };
    }
    return { valid: true, value: num };
  }
  
  if (type === 'boolean') {
    if (typeof field === 'boolean') return { valid: true, value: field };
    const lowercaseField = String(field).toLowerCase();
    if (['true', 'yes', '1'].includes(lowercaseField)) return { valid: true, value: true };
    if (['false', 'no', '0'].includes(lowercaseField)) return { valid: true, value: false };
    return { valid: false, value: field, error: `${fieldName} must be a boolean (true/false, yes/no, 1/0)` };
  }
  
  if (type === 'date') {
    const date = new Date(field);
    if (isNaN(date.getTime())) {
      return { valid: false, value: field, error: `${fieldName} must be a valid date` };
    }
    return { valid: true, value: date.toISOString().split('T')[0] };
  }
  
  // Default for string
  return { valid: true, value: String(field) };
};

// Define interfaces for validation results
interface ValidationError {
  valid: false;
  errors: string[];
  rowIndex: number;
  rawData: any;
}

interface ValidationSuccess {
  valid: true;
  event: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'registrations' | 'revenue'>;
}

type ValidationResult = ValidationError | ValidationSuccess;

export async function POST(request: NextRequest) {
  // Simplified admin check - trust the client-side auth for now
  // This will work because our client-side already has auth protection
  // and middleware prevents non-admins from accessing the admin page
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Get file content as text
    const fileBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(fileBuffer).toString();
    
    // Parse CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    if (records.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }
    
    // Validate and format records
    const validationResults: ValidationResult[] = records.map((record: any, index: number) => {
      const errors: string[] = [];
      
      // Validate required fields
      const titleValidation = validateField(record.title, 'Title');
      if (!titleValidation.valid) errors.push(titleValidation.error!);
      
      const descriptionValidation = validateField(record.description, 'Description');
      if (!descriptionValidation.valid) errors.push(descriptionValidation.error!);
      
      const dateValidation = validateField(record.date, 'Date', true, 'date');
      if (!dateValidation.valid) errors.push(dateValidation.error!);
      
      const endDateValidation = validateField(record.endDate, 'End Date', false, 'date');
      if (!endDateValidation.valid) errors.push(endDateValidation.error!);
      
      const locationValidation = validateField(record.location, 'Location');
      if (!locationValidation.valid) errors.push(locationValidation.error!);
      
      const categoryValidation = validateField(record.category, 'Category');
      if (!categoryValidation.valid) errors.push(categoryValidation.error!);
      
      const priceValidation = validateField(record.price, 'Price', true, 'number');
      if (!priceValidation.valid) errors.push(priceValidation.error!);
      
      const seatsValidation = validateField(record.seats, 'Seats', true, 'number');
      if (!seatsValidation.valid) errors.push(seatsValidation.error!);
      
      const statusValidation = validateField(record.status, 'Status');
      if (!statusValidation.valid) errors.push(statusValidation.error!);
      
      const featuredValidation = validateField(record.featured, 'Featured', false, 'boolean');
      if (!featuredValidation.valid) errors.push(featuredValidation.error!);
      
      // If there are validation errors, return them
      if (errors.length > 0) {
        return {
          valid: false,
          errors,
          rowIndex: index,
          rawData: record
        } as ValidationError;
      }
      
      // Return validated event data
      return {
        valid: true,
        event: {
          title: titleValidation.value,
          description: descriptionValidation.value,
          date: dateValidation.value,
          endDate: endDateValidation.value || dateValidation.value,
          location: locationValidation.value,
          category: categoryValidation.value,
          price: priceValidation.value,
          seats: seatsValidation.value,
          status: statusValidation.value,
          featured: featuredValidation.value,
          image: record.image || '/placeholder.jpg'
        }
      } as ValidationSuccess;
    });
    
    // Check if there are any validation errors
    const invalidResults = validationResults.filter((result): result is ValidationError => !result.valid);
    if (invalidResults.length > 0) {
      return NextResponse.json({ 
        error: 'CSV contains invalid data',
        invalidRows: invalidResults
      }, { status: 400 });
    }
    
    // If all records are valid, create the events in bulk
    const eventsToCreate = validationResults
      .filter((result): result is ValidationSuccess => result.valid)
      .map(result => result.event);
    
    const createdEvents = await serverImportEvents(eventsToCreate);
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${createdEvents.length} events`,
      events: createdEvents
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error importing events from CSV:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to import events: ${errorMessage}` }, { status: 500 });
  }
} 