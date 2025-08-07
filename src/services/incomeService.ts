import { supabase } from '../lib/supabase'

export interface Income {
  id: string
  user_id: string
  income_type: 'monthly' | 'biweekly'
  monthly_amount?: number
  first_biweekly_amount?: number
  second_biweekly_amount?: number
  calculated_monthly: number
  calculated_biweekly_avg: number
  created_at: string
  updated_at: string
}

export const incomeService = {
  async getIncome(userId: string): Promise<Income | null> {
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) return null
    return data
  },

  async upsertMonthlyIncome(userId: string, monthlyAmount: number): Promise<Income | null> {
    const biweeklyAvg = monthlyAmount / 2

    const { data, error } = await supabase
      .from('incomes')
      .upsert({
        user_id: userId,
        income_type: 'monthly',
        monthly_amount: monthlyAmount,
        first_biweekly_amount: null,
        second_biweekly_amount: null,
        calculated_monthly: monthlyAmount,
        calculated_biweekly_avg: biweeklyAvg,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) return null
    return data
  },

  async upsertBiweeklyIncome(userId: string, firstAmount: number, secondAmount: number): Promise<Income | null> {
    const monthlyTotal = firstAmount + secondAmount
    const biweeklyAvg = monthlyTotal / 2

    const { data, error } = await supabase
      .from('incomes')
      .upsert({
        user_id: userId,
        income_type: 'biweekly',
        monthly_amount: null,
        first_biweekly_amount: firstAmount,
        second_biweekly_amount: secondAmount,
        calculated_monthly: monthlyTotal,
        calculated_biweekly_avg: biweeklyAvg,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) return null
    return data
  }
}