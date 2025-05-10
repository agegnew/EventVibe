import { NextRequest, NextResponse } from 'next/server';
import { serverGetUserById, serverGetEventById, serverUpdateUser, serverUpdateEvent } from '@/lib/server-data-service';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userId, eventId } = data;
    
    if (!userId || !eventId) {
      return NextResponse.json({ error: 'User ID and Event ID are required' }, { status: 400 });
    }
    
    // Get user and event to make sure they exist
    const user = await serverGetUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const event = await serverGetEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Check if user is already registered for this event
    if (user.events.includes(eventId)) {
      return NextResponse.json({ error: 'User is already registered for this event' }, { status: 400 });
    }
    
    // Check if there are seats available
    if (event.registrations >= event.seats) {
      return NextResponse.json({ error: 'No seats available for this event' }, { status: 400 });
    }
    
    // Update user's events array
    const updatedUser = await serverUpdateUser(userId, {
      events: [...user.events, eventId]
    });
    
    // Update event registrations count and revenue
    const updatedEvent = await serverUpdateEvent(eventId, {
      registrations: event.registrations + 1,
      revenue: event.revenue + event.price
    });
    
    if (!updatedUser || !updatedEvent) {
      return NextResponse.json({ error: 'Failed to register for event' }, { status: 500 });
    }
    
    // Return success
    return NextResponse.json({ 
      success: true,
      message: 'Successfully registered for event',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        events: updatedUser.events
      },
      event: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        date: updatedEvent.date,
        location: updatedEvent.location,
        registrations: updatedEvent.registrations
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json({ error: 'Failed to register for event' }, { status: 500 });
  }
} 