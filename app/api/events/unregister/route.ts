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
    
    // Check if user is registered for this event
    if (!user.events.includes(eventId)) {
      return NextResponse.json({ error: 'User is not registered for this event' }, { status: 400 });
    }
    
    // Update user's events array by removing the event
    const updatedUser = await serverUpdateUser(userId, {
      events: user.events.filter(id => id !== eventId)
    });
    
    // Update event registrations count and revenue
    const updatedEvent = await serverUpdateEvent(eventId, {
      registrations: Math.max(0, event.registrations - 1),
      // Optionally adjust revenue if you want to handle refunds
      revenue: Math.max(0, event.revenue - event.price)
    });
    
    if (!updatedUser || !updatedEvent) {
      return NextResponse.json({ error: 'Failed to unregister from event' }, { status: 500 });
    }
    
    // Return success
    return NextResponse.json({ 
      success: true,
      message: 'Successfully unregistered from event',
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
    console.error('Error unregistering from event:', error);
    return NextResponse.json({ error: 'Failed to unregister from event' }, { status: 500 });
  }
} 