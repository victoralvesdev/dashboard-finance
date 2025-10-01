import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { unformatPhoneNumber } from '@/lib/phone-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone_number, password } = body;

    if (!phone_number || !password) {
      return NextResponse.json(
        { error: 'Número de telefone e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Normalize phone number (add 55 prefix)
    const normalizedPhone = unformatPhoneNumber(phone_number);

    // Find user by phone number
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', normalizedPhone)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Telefone ou senha incorretos' },
        { status: 401 }
      );
    }

    // Check if user has a password set
    if (!user.password) {
      return NextResponse.json(
        { error: 'Usuário não possui senha cadastrada. Faça o registro primeiro.' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Telefone ou senha incorretos' },
        { status: 401 }
      );
    }

    // Return user data (without password)
    const { password: _, ...userData } = user;

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: userData,
    });

    // Set cookie with user data
    response.cookies.set('user', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}
