import { EventDetail } from './client';
import { use } from 'react';

export default function Page({ params }: { params: { id: string } }) {
  // Use the React.use() method to properly handle params
  const resolvedParams = use(params);
  return <EventDetail eventId={resolvedParams.id} />;
}
