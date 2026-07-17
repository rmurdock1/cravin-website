'use server';

import { revalidatePath } from 'next/cache';
import { requireOwner } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';

type Role = 'owner' | 'hr_manager';
const asRole = (v: unknown): Role => (String(v) === 'owner' ? 'owner' : 'hr_manager');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logAudit(admin: any, actor: { id: string; email?: string }, action: string, entityId: string, metadata: Record<string, unknown>) {
  await admin.from('audit_log').insert({
    actor_id: actor.id,
    actor_email: actor.email ?? null,
    action,
    entity: 'user',
    entity_id: entityId,
    metadata,
  });
}

export type InviteState = { ok: boolean; message: string } | null;

export async function inviteUser(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const { user: actor } = await requireOwner();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const role = asRole(formData.get('role'));
  const full_name = String(formData.get('full_name') ?? '').trim() || null;
  if (!email) return { ok: false, message: 'Email is required.' };

  // Guard: never let an invite clobber an existing account's role — including your own.
  if (email === (actor.email ?? '').toLowerCase()) {
    return { ok: false, message: "That's your own account — you already have full Admin access." };
  }
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (existing) {
    return {
      ok: false,
      message: 'That email already has an account — manage their role and access in the People list below.',
    };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: full_name ? { full_name } : {},
  });
  if (error) return { ok: false, message: error.message };
  const userId = data?.user?.id;
  if (!userId) return { ok: false, message: 'Could not create the account.' };

  await admin.from('profiles').update({ role, is_active: true, full_name }).eq('id', userId);
  await logAudit(admin, actor, 'invite_user', userId, { email, role });
  revalidatePath('/admin/team');

  return {
    ok: true,
    message: `${email} can now sign in at /admin/login as ${role === 'owner' ? 'Admin' : 'HR Manager'}.`,
  };
}

export async function setUserActive(userId: string, active: boolean) {
  const { user: actor } = await requireOwner();
  if (userId === actor.id) return; // never lock yourself out
  const admin = createAdminClient();
  await admin.from('profiles').update({ is_active: active }).eq('id', userId);
  await logAudit(admin, actor, active ? 'activate_user' : 'deactivate_user', userId, {});
  revalidatePath('/admin/team');
}

export async function setUserRole(userId: string, role: string) {
  const { user: actor } = await requireOwner();
  if (userId === actor.id) return; // can't change your own role
  const admin = createAdminClient();
  await admin.from('profiles').update({ role: asRole(role) }).eq('id', userId);
  await logAudit(admin, actor, 'set_role', userId, { role: asRole(role) });
  revalidatePath('/admin/team');
}
