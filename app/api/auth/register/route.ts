import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { unformatPhoneNumber, isValidPhoneNumber } from '@/lib/phone-utils';

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

    // Validate phone number format
    if (!isValidPhoneNumber(normalizedPhone)) {
      return NextResponse.json(
        { error: 'Número de telefone inválido' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', normalizedPhone)
      .single();

    if (existingUser) {
      // User exists, check if password is already set
      if (existingUser.password) {
        return NextResponse.json(
          { error: 'Usuário já possui senha cadastrada. Faça o login.' },
          { status: 409 }
        );
      }

      // User exists but no password, update with password
      const hashedPassword = await bcrypt.hash(password, 10);

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('Update user error:', updateError);
        return NextResponse.json(
          { error: 'Erro ao atualizar usuário' },
          { status: 500 }
        );
      }

      const { password: _, ...userData } = updatedUser;

      // Create response with user data
      const response = NextResponse.json({
        success: true,
        message: 'Senha cadastrada com sucesso! Você está vinculado às suas informações.',
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
    }

    // User doesn't exist - should not create new users, only link existing ones
    return NextResponse.json(
      { error: 'Número de telefone não autorizado. Entre em contato com o administrador.' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer registro' },
      { status: 500 }
    );
  }
}
