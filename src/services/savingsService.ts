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
    const remainingAmount = Math.max(0, goal.target_amount - goal.current_amount)
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


  calculateRequiredAmounts(targetAmount: number, currentAmount: number, targetMonths: number) {
    const remainingAmount = Math.max(0, targetAmount - currentAmount)
    
    if (remainingAmount <= 0) {
      return {
        monthly_required: 0,
        biweekly_required: 0
      }
    }
    
    const monthlyRequired = remainingAmount / targetMonths
    const biweeklyRequired = monthlyRequired / 2

    return {
      monthly_required: monthlyRequired,
      biweekly_required: biweeklyRequired
    }
  },

  async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal | null> {
    const { data: currentGoal } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('id', id)
      .single()

    if (!currentGoal) return null


    const targetAmount = updates.target_amount ?? currentGoal.target_amount
    const currentAmount = updates.current_amount ?? currentGoal.current_amount
    const targetMonths = updates.target_months ?? currentGoal.target_months
    

    const { monthly_required, biweekly_required } = this.calculateRequiredAmounts(
      targetAmount, 
      currentAmount, 
      targetMonths
    )


    const finalUpdates = {
      ...updates,
      monthly_required,
      biweekly_required,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('savings_goals')
      .update(finalUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating savings goal:', error)
      return null
    }
    
    return data
  },


  async debitFromSavingsGoal(id: string, debitAmount: number, description?: string): Promise<SavingsGoal | null> {
    const { data: currentGoal } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('id', id)
      .single()

    if (!currentGoal) return null

    const newCurrentAmount = Math.max(0, currentGoal.current_amount - debitAmount)

    const { monthly_required, biweekly_required } = this.calculateRequiredAmounts(
      currentGoal.target_amount,
      newCurrentAmount,
      currentGoal.target_months
    )

    const { data, error } = await supabase
      .from('savings_goals')
      .update({
        current_amount: newCurrentAmount,
        monthly_required,
        biweekly_required,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error processing debit:', error)
      return null
    }

  
    if (description) {
      console.log(`Débito procesado: ${description} - Monto: ${debitAmount} - Meta: ${currentGoal.name}`)
    }
    
    return data
  },


  async addToSavingsGoal(id: string, addAmount: number): Promise<SavingsGoal | null> {
    const { data: currentGoal } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('id', id)
      .single()

    if (!currentGoal) return null


    const newCurrentAmount = currentGoal.current_amount + addAmount
    

    const { monthly_required, biweekly_required } = this.calculateRequiredAmounts(
      currentGoal.target_amount,
      newCurrentAmount,
      currentGoal.target_months
    )

    const { data, error } = await supabase
      .from('savings_goals')
      .update({
        current_amount: newCurrentAmount,
        monthly_required,
        biweekly_required,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error adding to savings goal:', error)
      return null
    }
    
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