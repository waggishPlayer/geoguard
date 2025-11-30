// Optional Next.js API route example
export async function GET(request) {
  return Response.json({ 
    message: 'Hello from Next.js API route',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request) {
  const body = await request.json()
  return Response.json({ 
    message: 'POST received',
    data: body,
    timestamp: new Date().toISOString()
  })
}

