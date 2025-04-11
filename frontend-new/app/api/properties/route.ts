import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET properties with pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const offset = (page - 1) * limit;

    // Get total count and properties in parallel
    const [propertiesResult, countResult] = await Promise.all([
      query(
        'SELECT * FROM properties ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      query('SELECT COUNT(*) FROM properties')
    ]);

    const total = parseInt(countResult.rows[0].count);
    const properties = propertiesResult.rows;

    return NextResponse.json({
      properties,
      hasMore: offset + properties.length < total
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// CREATE a new property
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    const result = await query(
      `INSERT INTO properties (
        name, symbol, "propertyValue", "totalShares", "availableShares",
        "minInvestment", location, description, image, "riskLevel",
        "expectedReturn", "blockchainId", "isFundingComplete", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        data.name || "Luxury Villa in Miami",
        data.symbol || "MIAMI1",
        data.propertyValue || 100,
        data.totalShares || 1000,
        data.availableShares || 1000,
        data.minInvestment || 0.1,
        data.location || "Miami, Florida",
        data.description || "Luxurious beachfront villa with 5 bedrooms, private pool, and direct beach access.",
        data.image || "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
        data.riskLevel || "Medium",
        data.expectedReturn || "12%",
        data.blockchainId || "1",
        data.isFundingComplete || false
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
} 