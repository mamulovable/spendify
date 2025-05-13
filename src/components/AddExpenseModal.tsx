import React, { useState } from 'react';

interface Category {
  id: string;
  name: string;
  color: string;
  user_id: string;
}

interface Expense {
  id?: string;
  user_id?: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  receipt?: string;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  categories: Category[];
  initialData?: Expense;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onSave, categories, initialData }) => {
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || (categories[0]?.name || ''));
  const [amount, setAmount] = useState(initialData?.amount ? initialData.amount.toString() : '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().slice(0, 10));
  const [receipt, setReceipt] = useState<string | undefined>(initialData?.receipt);
  const [id, setId] = useState<string | undefined>(initialData?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !category || !amount || !date) return;
    
    const expense: Expense = {
      description, 
      category, 
      amount: parseFloat(amount), 
      date, 
      receipt
    };
    
    // If editing an existing expense, include the ID
    if (id) {
      expense.id = id;
    }
    
    onSave(expense);
    setDescription('');
    setCategory(categories[0]?.name || '');
    setAmount('');
    setDate(new Date().toISOString().slice(0, 10));
    setReceipt(undefined);
    setId(undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border rounded p-2"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <select
            className="w-full border rounded p-2"
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <input
            className="w-full border rounded p-2"
            type="number"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
          <input
            className="w-full border rounded p-2"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
          <input
            className="w-full border rounded p-2"
            type="file"
            accept="image/*"
            onChange={e => setReceipt(e.target.files?.[0]?.name)}
          />
          <div className="flex justify-end space-x-2">
            <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
