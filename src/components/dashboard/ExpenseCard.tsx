import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import type { Expense } from '../../services/expenseService'

interface ExpenseCardProps {
  expenses: Expense[]
  onAddExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => void
  onDeleteExpense: (id: string) => void
}

export function ExpenseCard({ expenses, onAddExpense, onDeleteExpense }: ExpenseCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'otros',
    frequency: 'monthly' as const,
    biweekly_timing: 'both' as const
  })

  const categoryOptions = [
    { value: 'alimentacion', label: 'Alimentación', icon: '🍽️' },
    { value: 'transporte', label: 'Transporte', icon: '🚗' },
    { value: 'servicios', label: 'Servicios', icon: '⚡' },
    { value: 'entretenimiento', label: 'Entretenimiento', icon: '🎬' },
    { value: 'salud', label: 'Salud', icon: '🏥' },
    { value: 'educacion', label: 'Educación', icon: '📚' },
    { value: 'otros', label: 'Otros', icon: '📋' }
  ]

  const frequencyOptions = [
    { value: 'monthly', label: 'Mensual' },
    { value: 'biweekly', label: 'Quincenal' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'daily', label: 'Diario' }
  ]

  const biweeklyTimingOptions = [
    { value: 'both', label: 'Se divide entre ambas quincenas' },
    { value: 'first', label: 'Solo primera quincena' },
    { value: 'second', label: 'Solo segunda quincena' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const amount = parseFloat(formData.amount)
      if (amount > 0 && formData.name.trim()) {
        const expenseData = {
          user_id: '',
          name: formData.name.trim(),
          amount,
          category: formData.category,
          frequency: formData.frequency,
          ...(formData.frequency === 'monthly' && { biweekly_timing: formData.biweekly_timing })
        }
        
        await onAddExpense(expenseData)
        setFormData({ 
          name: '', 
          amount: '', 
          category: 'otros', 
          frequency: 'monthly',
          biweekly_timing: 'both'
        })
        setShowModal(false)
      }
    } catch (error) {
      console.error('Error adding expense:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMonthlyTotal = () => {
    return expenses.reduce((total, expense) => {
      switch (expense.frequency) {
        case 'daily':
          return total + (expense.amount * 30)
        case 'weekly':
          return total + (expense.amount * 4)
        case 'biweekly':
          return total + (expense.amount * 2)
        case 'monthly':
        default:
          return total + expense.amount
      }
    }, 0)
  }

  const calculateBiweeklyTotal = (period?: 'first' | 'second') => {
    return expenses.reduce((total, expense) => {
      switch (expense.frequency) {
        case 'daily':
          return total + (expense.amount * 15)
        case 'weekly':
          return total + (expense.amount * 2)
        case 'biweekly':
          return total + expense.amount
        case 'monthly':
          if (!period) {
            return total + (expense.amount / 2)
          }
          if (!expense.biweekly_timing || expense.biweekly_timing === 'both') {
            return total + (expense.amount / 2)
          }
          if (expense.biweekly_timing === period) {
            return total + expense.amount
          }
          return total
        default:
          return total
      }
    }, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getCategoryIcon = (category: string) => {
    const option = categoryOptions.find(cat => cat.value === category)
    return option?.icon || '📋'
  }

  const getBiweeklyTimingBadge = (expense: Expense) => {
    if (expense.frequency !== 'monthly' || !expense.biweekly_timing) return null
    
    const badges = {
      first: { text: '1ra Q', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      second: { text: '2da Q', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
      both: { text: 'Ambas', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' }
    }
    
    const badge = badges[expense.biweekly_timing]
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gastos</h3>
          <Button onClick={() => setShowModal(true)} size="sm">
            + Agregar
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium mb-1">Total Mensual</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-700 dark:text-red-300 break-words">
              {formatCurrency(calculateMonthlyTotal())}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">1ra Quincena</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700 dark:text-blue-300 break-words">
              {formatCurrency(calculateBiweeklyTotal('first'))}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">2da Quincena</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-700 dark:text-purple-300 break-words">
              {formatCurrency(calculateBiweeklyTotal('second'))}
            </p>
          </div>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-xl sm:text-2xl flex-shrink-0">{getCategoryIcon(expense.category)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{expense.name}</p>
                    {getBiweeklyTimingBadge(expense)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(expense.amount)} - {expense.frequency}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDeleteExpense(expense.id)}
                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors flex-shrink-0 ml-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {expenses.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💸</div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No tienes gastos registrados
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Agrega tu primer gasto para empezar a controlar tus finanzas
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nuevo Gasto"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nombre del gasto"
            placeholder="Ej: Renta, Comida, Transporte..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
            required
          />

          <Input
            label="Monto"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Categoría"
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />

            <Select
              label="Frecuencia"
              options={frequencyOptions}
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
            />
          </div>
          
          {formData.frequency === 'monthly' && (
            <Select
              label="¿En qué quincena se paga?"
              options={biweeklyTimingOptions}
              value={formData.biweekly_timing}
              onChange={(e) => setFormData({ ...formData, biweekly_timing: e.target.value as any })}
            />
          )}
          
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              {loading ? 'Creando...' : 'Crear Gasto'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}