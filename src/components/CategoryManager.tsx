import React, { useState } from 'react';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (category: Omit<Category, 'id'>) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAdd, onEdit, onDelete }) => {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#888888');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#888888');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd({ name: newName, color: newColor });
    setNewName('');
    setNewColor('#888888');
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const handleEdit = () => {
    if (!editName.trim() || editingId === null) return;
    onEdit({ id: editingId, name: editName, color: editColor });
    setEditingId(null);
    setEditName('');
    setEditColor('#888888');
  };

  return (
    <div className="bg-white rounded shadow p-4 mt-6">
      <h2 className="text-lg font-semibold mb-2">Manage Categories</h2>
      <div className="flex gap-2 mb-4">
        <input
          className="border px-2 py-1 rounded"
          placeholder="Category name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <input
          type="color"
          value={newColor}
          onChange={e => setNewColor(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={handleAdd}>
          Add
        </button>
      </div>
      <ul>
        {categories.map(cat => (
          <li key={cat.id} className="flex items-center gap-2 mb-2">
            {editingId === cat.id ? (
              <>
                <input
                  className="border px-2 py-1 rounded"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
                <input
                  type="color"
                  value={editColor}
                  onChange={e => setEditColor(e.target.value)}
                />
                <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={handleEdit}>
                  Save
                </button>
                <button className="bg-gray-400 text-white px-2 py-1 rounded" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="inline-block w-4 h-4 rounded-full" style={{ background: cat.color }} />
                <span>{cat.name}</span>
                <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => startEdit(cat)}>
                  Edit
                </button>
                <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => onDelete(cat.id)}>
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryManager;
