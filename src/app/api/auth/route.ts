import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Store the hashed password securely on the server
const CORRECT_PASSWORD_HASH = 'a2056e15295061c00d2fc2ac183e98f74b0522854c0f440f6a5c29b741cd729e';

// Deployment reset key - change this when deploying to invalidate all sessions
const DEPLOYMENT_KEY = 'v1.0.0'; // Change this on each deployment to force logout

// Session expiration time (in seconds)
const SESSION_DURATION = 24 * 60 * 60; // 24 hours

// Generate a secure session token with deployment key and timestamp
function generateSessionToken(): string {
  const timestamp = Date.now();
  const sessionData = {
    token: crypto.randomBytes(32).toString('hex'),
    deploymentKey: DEPLOYMENT_KEY,
    createdAt: timestamp
  };
  return Buffer.from(JSON.stringify(sessionData)).toString('base64');
}

// Verify session token is valid and not expired
function verifySessionToken(token: string): boolean {
  try {
    const sessionData = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check if deployment key matches (invalidates old sessions on deployment)
    if (sessionData.deploymentKey !== DEPLOYMENT_KEY) {
      return false;
    }
    
    // Check if session is not expired
    const now = Date.now();
    const sessionAge = (now - sessionData.createdAt) / 1000; // Convert to seconds
    if (sessionAge > SESSION_DURATION) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

// Hash the provided password
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Hash the provided password and compare with stored hash
    const hashedPassword = hashPassword(password);
    
    if (hashedPassword === CORRECT_PASSWORD_HASH) {
      // Generate secure session token
      const sessionToken = generateSessionToken();
      
      // Create response with secure session cookie
      const response = NextResponse.json({ 
        success: true,
        message: 'Authentication successful' 
      });

      // Set secure HTTP-only cookie that expires in 24 hours
      response.cookies.set('auth-token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      });

      return response;
    } else {
      // Add delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');

    if (authToken && authToken.value && verifySessionToken(authToken.value)) {
      return NextResponse.json({ authenticated: true });
    } else {
      // If session is invalid/expired, clear the cookie
      const response = NextResponse.json({ authenticated: false });
      response.cookies.delete('auth-token');
      return response;
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ 
      success: true,
      message: 'Logged out successfully' 
    });

    // Clear the auth cookie
    response.cookies.delete('auth-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
