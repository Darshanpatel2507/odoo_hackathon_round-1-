import { supabase } from './supabase';

export async function seedDashboardData(userId: string) {
  try {
    console.log('Starting seed process for new user...');
    
    // 1. Check if user already has trips
    const { data: existingTrips, error: checkError } = await supabase
      .from('trips')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (checkError) throw checkError;
    if (existingTrips && existingTrips.length > 0) {
      console.log('User already has trips, skipping seed.');
      return;
    }

    console.log('No trips found, seeding data...');

    // 2. Insert Trips
    const tripsToInsert = [
      {
        user_id: userId,
        title: 'Italy Adventure',
        location: 'Rome, Florence, Venice',
        date_range: 'Oct 12 - Oct 20, 2024',
        image_url: 'https://images.unsplash.com/photo-1515542622106-78b28afcb814?auto=format&fit=crop&q=80',
        status: 'ongoing'
      },
      {
        user_id: userId,
        title: 'Switzerland Adventure',
        location: 'Zurich, Lucerne, Interlaken',
        date_range: 'Dec 05 - Dec 15, 2024',
        image_url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80',
        status: 'upcoming'
      }
    ];

    const { data: insertedTrips, error: tripsError } = await supabase
      .from('trips')
      .insert(tripsToInsert)
      .select();

    if (tripsError || !insertedTrips) throw tripsError;
    
    const italy = insertedTrips.find(t => t.title === 'Italy Adventure');
    const switzerland = insertedTrips.find(t => t.title === 'Switzerland Adventure');

    if (!italy || !switzerland) throw new Error('Missing inserted trips');

    // 3. Insert Documents
    const docsToInsert = [
      {
        user_id: userId,
        trip_id: italy.id,
        name: 'Flight_Tickets_Rome.pdf',
        category: 'Tickets',
        file_type: 'PDF',
        file_size: '2.4 MB',
        notes: 'Outbound and return flights'
      },
      {
        user_id: userId,
        trip_id: italy.id,
        name: 'Hotel_Booking_Florence.pdf',
        category: 'Accommodations',
        file_type: 'PDF',
        file_size: '1.1 MB',
        notes: 'Confirmation for 3 nights'
      },
      {
        user_id: userId,
        trip_id: switzerland.id,
        name: 'Swiss_Travel_Pass.pdf',
        category: 'Tickets',
        file_type: 'PDF',
        file_size: '1.8 MB',
        notes: 'Valid for 8 days'
      }
    ];

    const { error: docsError } = await supabase.from('documents').insert(docsToInsert);
    if (docsError) throw docsError;

    // 4. Insert Destinations (Budget)
    const destinationsToInsert = [
      { user_id: userId, trip_id: italy.id, name: 'Rome', budget_limit: 50000 },
      { user_id: userId, trip_id: italy.id, name: 'Florence', budget_limit: 35000 },
      { user_id: userId, trip_id: italy.id, name: 'Venice', budget_limit: 45000 },
      { user_id: userId, trip_id: switzerland.id, name: 'Zurich', budget_limit: 80000 },
      { user_id: userId, trip_id: switzerland.id, name: 'Lucerne', budget_limit: 50000 }
    ];

    const { data: insertedDestinations, error: destError } = await supabase
      .from('destinations')
      .insert(destinationsToInsert)
      .select();

    if (destError || !insertedDestinations) throw destError;

    // 5. Insert Expenses
    const romeId = insertedDestinations.find(d => d.name === 'Rome')?.id;
    const florenceId = insertedDestinations.find(d => d.name === 'Florence')?.id;
    const veniceId = insertedDestinations.find(d => d.name === 'Venice')?.id;
    const zurichId = insertedDestinations.find(d => d.name === 'Zurich')?.id;

    if (romeId && florenceId && veniceId && zurichId) {
      const expensesToInsert = [
        { user_id: userId, destination_id: romeId, description: 'Colosseum Tour', category: 'Activities', amount: 4500 },
        { user_id: userId, destination_id: romeId, description: 'Pasta Dinner', category: 'Food', amount: 2500 },
        { user_id: userId, destination_id: romeId, description: 'Metro Tickets', category: 'Transport', amount: 500 },
        
        { user_id: userId, destination_id: florenceId, description: 'Uffizi Gallery', category: 'Activities', amount: 3000 },
        { user_id: userId, destination_id: florenceId, description: 'Gelato & Snacks', category: 'Food', amount: 800 },
        
        { user_id: userId, destination_id: veniceId, description: 'Gondola Ride', category: 'Activities', amount: 7500 },
        { user_id: userId, destination_id: veniceId, description: 'Water Taxi', category: 'Transport', amount: 1200 },

        { user_id: userId, destination_id: zurichId, description: 'Lake Cruise', category: 'Activities', amount: 5000 }
      ];

      const { error: expError } = await supabase.from('expenses').insert(expensesToInsert);
      if (expError) throw expError;
    }

    // 6. Insert Activities
    const activitiesToInsert = [
      {
        user_id: userId,
        trip_id: italy.id,
        day_badge: 'Day 1',
        days: 'Oct 12',
        city: 'Rome',
        title: 'Arrival & Historic Center',
        activities_list: ['Check-in to hotel', 'Visit the Colosseum', 'Dinner at Trastevere'],
        image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80',
        coord_x: 41.9028,
        coord_y: 12.4964
      },
      {
        user_id: userId,
        trip_id: italy.id,
        day_badge: 'Day 2',
        days: 'Oct 13',
        city: 'Rome',
        title: 'Vatican City',
        activities_list: ['Vatican Museums', 'St. Peter\'s Basilica', 'Piazza Navona'],
        image_url: 'https://images.unsplash.com/photo-1531572753322-ad0110ce36f1?auto=format&fit=crop&q=80',
        coord_x: 41.9029,
        coord_y: 12.4534
      },
      {
        user_id: userId,
        trip_id: switzerland.id,
        day_badge: 'Day 1',
        days: 'Dec 05',
        city: 'Zurich',
        title: 'Arrival & Old Town',
        activities_list: ['Check-in to hotel', 'Walk around Lake Zurich', 'Swiss Fondue Dinner'],
        image_url: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&q=80',
        coord_x: 47.3769,
        coord_y: 8.5417
      }
    ];

    const { error: actError } = await supabase.from('activities').insert(activitiesToInsert);
    if (actError) throw actError;
    
    console.log('Seed completed successfully!');

  } catch (error) {
    console.error('Error seeding data:', error);
  }
}
