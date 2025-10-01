import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logout realizado com sucesso',
  });

  // Clear user cookie
  response.cookies.delete('user');

  return response;
}
