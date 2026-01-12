// Supabase Edge Function for sending push notifications
// Deploy with: supabase functions deploy send-push-notification

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

interface PushMessage {
    to: string
    title: string
    body: string
    data?: Record<string, unknown>
    sound?: 'default' | null
    badge?: number
    channelId?: string
}

interface WebhookPayload {
    type: 'INSERT' | 'UPDATE' | 'DELETE'
    table: string
    record: Record<string, unknown>
    old_record: Record<string, unknown> | null
}

serve(async (req: Request) => {
    try {
        const payload = await req.json() as WebhookPayload

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        let notifications: PushMessage[] = []

        // Handle different table events
        if (payload.table === 'tasks') {
            notifications = await handleTaskEvent(supabase, payload)
        } else if (payload.table === 'household_members') {
            notifications = await handleMemberEvent(supabase, payload)
        }

        // Send notifications
        if (notifications.length > 0) {
            await sendPushNotifications(notifications)
        }

        return new Response(JSON.stringify({ success: true, sent: notifications.length }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('Push notification error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
})

async function handleTaskEvent(
    supabase: ReturnType<typeof createClient>,
    payload: WebhookPayload
): Promise<PushMessage[]> {
    const task = payload.record
    const oldTask = payload.old_record
    const notifications: PushMessage[] = []

    // Task assigned
    if (task.assigned_to && task.assigned_to !== oldTask?.assigned_to) {
        const token = await getUserPushToken(supabase, task.assigned_to as string)
        if (token) {
            notifications.push({
                to: token,
                title: 'Task Assigned to You',
                body: `You've been assigned: "${task.title}"`,
                data: { type: 'task_assigned', taskId: task.id },
                sound: 'default',
                channelId: 'tasks',
            })
        }
    }

    // Task claimed - notify creator if different from claimer
    if (task.claimed_by && !oldTask?.claimed_by && task.claimed_by !== task.created_by) {
        const token = await getUserPushToken(supabase, task.created_by as string)
        const claimerName = await getUserName(supabase, task.claimed_by as string)
        if (token) {
            notifications.push({
                to: token,
                title: 'Task Claimed',
                body: `${claimerName} claimed "${task.title}"`,
                data: { type: 'task_claimed', taskId: task.id },
                sound: 'default',
                channelId: 'tasks',
            })
        }
    }

    // Task completed - notify creator and assigner
    if (task.status === 'completed' && oldTask?.status !== 'completed') {
        const notifyUsers = new Set<string>()
        if (task.created_by !== task.claimed_by) notifyUsers.add(task.created_by as string)
        if (task.assigned_to && task.assigned_to !== task.claimed_by) notifyUsers.add(task.assigned_to as string)

        const completerName = await getUserName(supabase, task.claimed_by as string)

        for (const userId of notifyUsers) {
            const token = await getUserPushToken(supabase, userId)
            if (token) {
                notifications.push({
                    to: token,
                    title: 'Task Completed!',
                    body: `${completerName} completed "${task.title}"`,
                    data: { type: 'task_completed', taskId: task.id },
                    sound: 'default',
                    channelId: 'tasks',
                })
            }
        }
    }

    return notifications
}

async function handleMemberEvent(
    supabase: ReturnType<typeof createClient>,
    payload: WebhookPayload
): Promise<PushMessage[]> {
    const member = payload.record
    const notifications: PushMessage[] = []

    if (payload.type === 'INSERT') {
        // New member joined - notify household owner
        const { data: household } = await supabase
            .from('households')
            .select('name, created_by')
            .eq('id', member.household_id)
            .single()

        if (household && household.created_by !== member.user_id) {
            const token = await getUserPushToken(supabase, household.created_by)
            const newMemberName = await getUserName(supabase, member.user_id as string)

            if (token) {
                notifications.push({
                    to: token,
                    title: 'New Member Joined',
                    body: `${newMemberName} joined ${household.name}`,
                    data: { type: 'member_joined', householdId: member.household_id },
                    sound: 'default',
                })
            }
        }
    }

    return notifications
}

async function getUserPushToken(
    supabase: ReturnType<typeof createClient>,
    userId: string
): Promise<string | null> {
    const { data } = await supabase
        .from('profiles')
        .select('push_token')
        .eq('id', userId)
        .single()

    return data?.push_token || null
}

async function getUserName(
    supabase: ReturnType<typeof createClient>,
    userId: string
): Promise<string> {
    const { data } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single()

    return data?.full_name || data?.email?.split('@')[0] || 'Someone'
}

async function sendPushNotifications(messages: PushMessage[]): Promise<void> {
    const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to send push notifications: ${error}`)
    }
}
