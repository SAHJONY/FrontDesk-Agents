import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const environment = process.env.SQUARE_ENVIRONMENT || 'sandbox'; // 'sandbox' or 'production'
  
  if (!accessToken) {
    // Return mock data if no key is present (for testing)
    return NextResponse.json({
      isMock: true,
      totalSales: 12450.75,
      transactions: [
        { id: 'mock-1', amount: 125.50, item: 'AI Consultation (Demo)', time: '2 min ago', status: 'success' },
        { id: 'mock-2', amount: 299.00, item: 'Legal Research Package (Demo)', time: '15 min ago', status: 'success' },
        { id: 'mock-3', amount: 49.99, item: 'Monthly Subscription (Demo)', time: '1 hour ago', status: 'success' },
      ]
    });
  }

  const baseUrl = environment === 'production' 
    ? 'https://squareup.com' 
    : 'https://sandbox.squareup.com';
    
  try {
    // Fetch recent transactions from Square
    const response = await fetch(`${baseUrl}/v2/transactions/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18',
      },
      body: JSON.stringify({
        location_id: 'YOUR_LOCATION_ID', // Can be fetched from Square API if needed
        query: {
          filter: {
            date_time_range: {
              start_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24h
            },
          },
        },
        sort: {
          sort_order: 'DESC',
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Square API request failed');
    }

    const data = await response.json();
    
    // Transform Square data to our format
    const transactions = data.transactions?.map((tx: any) => ({
      id: tx.id,
      amount: tx.tenders?.[0]?.amount_money?.amount / 100 || 0,
      item: 'Square Transaction',
      time: new Date(tx.created_at).toLocaleTimeString(),
      status: tx.tenders?.[0]?.status === 'COMPLETED' ? 'success' : 'pending'
    })) || [];

    const totalSales = transactions.reduce((acc: number, curr: any) => acc + curr.amount, 0);

    return NextResponse.json({
      isMock: false,
      totalSales,
      transactions
    });

  } catch (error) {
    console.error('Square API Error:', error);
    // Fallback to mock data on error
    return NextResponse.json({
      isMock: true,
      error: 'Failed to fetch from Square, using mock data',
      totalSales: 0,
      transactions: []
    });
  }
}
