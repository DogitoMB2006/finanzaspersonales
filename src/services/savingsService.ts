import { supabase } from '../lib/supabase'

export interface SavingsGoal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  target_months: number
  monthly_required: number
  biweekly_required: number
  created_at: string
  updated_at: string
}

export const savingsService = {
  async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) return []
    return data || []
  },

  async createSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at' | 'monthly_required' | 'biweekly_required'>): Promise<SavingsGoal | null> {
    const remainingAmount = goal.target_amount - goal.current_amount
    const monthlyRequired = remainingAmount / goal.target_months
    const biweeklyRequired = monthlyRequired / 2

    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        ...goal,
        monthly_required: monthlyRequired,
        biweekly_required: biweeklyRequired
      })
      .select()
      .single()

    if (error) return null
    return data
  },

  async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal | null> {
    let finalUpdates = { ...updates, updated_at: new Date().toISOString() }

    if (updates.target_amount || updates.target_months || updates.current_amount) {
      const { data: current } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('id', id)
        .single()

      if (current) {
        const targetAmount = updates.target_amount ?? current.target_amount
        const currentAmount = updates.current_amount ?? current.current_amount
        const targetMonths = updates.target_months ?? current.target_months
        
        const remainingAmount = targetAmount - currentAmount
        const monthlyRequired = remainingAmount / targetMonths
        const biweeklyRequired = monthlyRequired / 2

        finalUpdates.monthly_required = monthlyRequired
        finalUpdates.biweekly_required = biweeklyRequired
      }
    }

    const { data, error } = await supabase
      .from('savings_goals')
      .update(finalUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) return null
    return data
  },

  async deleteSavingsGoal(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)

    return !error
  }
}