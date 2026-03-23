import { supabase } from '@/lib/supabase';

export async function createNotification({
  userId,
  type,
  title,
  content,
  link
}: {
  userId: string;
  type: string;
  title: string;
  content: string;
  link?: string;
}) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      content,
      link
    });

  if (error) {
    console.error('Error creating notification:', error);
  }
}
