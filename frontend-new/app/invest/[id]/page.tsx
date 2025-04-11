'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import PropertyInvestment from '@/app/components/PropertyInvestment';
import { Property } from '@/app/types/property';

export default function PropertyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    async function fetchPropertyDetails() {
      try {
        console.log('Fetching property with ID:', params.id);
        const response = await fetch(`/api/properties`);
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        
        const properties = await response.json();
        console.log('All properties:', properties);
        
        const found = properties.find((p: Property) => p.id === params.id);
        
        if (found) {
          console.log('Property found:', found);
          setProperty(found);
        } else {
          console.error('Property not found with ID:', params.id);
          setError('Property not found');
          setTimeout(() => {
            router.push('/invest');
          }, 2000);
        }
      } catch (error) {
        console.error('Error loading property:', error);
        setError('Error loading property. Redirecting to investments page...');
        setTimeout(() => {
          router.push('/invest');
        }, 2000);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchPropertyDetails();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 p-4 rounded-md text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  return <PropertyInvestment property={property} />;
} 