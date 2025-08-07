import { supabase } from '../lib/supabase'

export interface Expense {
  id: string
  user_id: string
  name: string
  amount: number
  category: string
  frequency: 'monthly' | 'biweekly' | 'weekly' | 'daily'
  biweekly_timing?: 'first' | 'second' | 'both'
  created_at: string
  updated_at: string
}

export const expenseService = {
  async getExpenses(userId: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) return []
    return data || []
  },

  async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense | null> {
    const expenseData = {
      ...expense,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert(expenseData)
      .select()
      .single()

    if (error) {
      console.error('Error creating expense:', error)
      return null
    }
    return data
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense | null> {
    const { data, error } = await supabase
      .from('expenses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return null
    return data
  },

  async deleteExpense(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    return !error
  }
}