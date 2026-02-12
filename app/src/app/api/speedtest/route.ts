import { NextResponse } from 'next/server';


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Ping Test: Smallest possible response
    if (type === 'ping') {
        return new NextResponse('pong', { status: 200 });
    }

    // Download Test: Generate random data
    if (type === 'download') {
        const size = 2 * 1024 * 1024; // 2MB chunk
        // Validating size to prevent abuse
        const buffer = new Uint8Array(size); // Create zero-filled buffer (compressible but fast to gen)
        // To avoid compression affecting speed test too much, we could fill with semi-random, 
        // but for simple estimates, this is okay. 
        // Let's fill with some noise to avoid extreme compression.
        for (let i = 0; i < size; i += 1000) {
            buffer[i] = Math.random() * 255;
        }

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
        });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}

export async function POST(request: Request) {
    // Upload Test: Receive data and return immediately
    // Next.js automatically reads the body. We just acknowledge receipt.
    // The time taken to receive the POST request body is the upload time.
    return new NextResponse('received', { status: 200 });
}
