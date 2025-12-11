import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { Edit2, Plus, Trash2, Box, X, Save, AlertTriangle, Image as ImageIcon, Upload } from 'lucide-react';

interface Props {
  inventory: Product[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const Inventory: React.FC<Props> = ({ inventory, onUpdateProduct, onAddProduct, onDeleteProduct }) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsAdding(false);
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setFormData({
        name: '',
        costPrice: 0,
        sellingPrice: 0,
        stock: 0,
        category: '其他' as any,
        image: 'https://picsum.photos/200'
    });
    setIsAdding(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
        const newProduct: Product = {
            id: `inv-${Date.now()}`,
            name: formData.name || '未命名商品',
            costPrice: Number(formData.costPrice) || 0,
            sellingPrice: Number(formData.sellingPrice) || 0,
            stock: Number(formData.stock) || 0,
            category: (formData.category as any) || '其他',
            image: formData.image || 'https://picsum.photos/200',
            commissionRate: 0.05
        };
        onAddProduct(newProduct);
        setIsAdding(false);
    } else if (editingProduct && formData) {
        onUpdateProduct({ ...editingProduct, ...formData } as Product);
        setEditingProduct(null);
    }
  };

  const confirmDelete = () => {
      if (deleteConfirmId) {
          onDeleteProduct(deleteConfirmId);
          setEditingProduct(null);
          setDeleteConfirmId(null);
      }
  };

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-serif text-[#433A31]">库存管理</h2>
          <p className="text-[#8C8174] mt-1 font-serif italic text-xs md:text-sm">物资与零售商品</p>
        </div>
        <button onClick={handleAddClick} className="bg-[#433A31] text-[#F7F5F0] p-3 md:px-6 md:py-3 rounded-xl shadow-lg flex items-center gap-2 hover:bg-[#2C241B] transition-colors">
          <Plus size={20} /> <span className="hidden md:inline">添加商品</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
        {inventory.map(item => (
          <div key={item.id} className="bg-[#FFFDF9] rounded-2xl md:rounded-3xl border border-[#E0D6C2] shadow-sm overflow-hidden group flex flex-col cursor-pointer active:scale-[0.98] transition-transform" onClick={() => handleEditClick(item)}>
            <div className="relative h-32 md:h-56 bg-[#F2EFE9] overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold backdrop-blur-md rounded shadow-sm ${item.category === '水晶' ? 'bg-[#8B7355]/80 text-white' : 'bg-[#8F9E8B]/80 text-white'}`}>
                  {item.category}
                </span>
              </div>
              <div className="hidden md:flex absolute inset-0 bg-[#2C241B]/20 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-3 backdrop-blur-[2px]">
                  <div className="p-3 bg-[#FFFDF9] text-[#433A31] rounded-full hover:bg-[#F2EFE9] shadow-lg"><Edit2 size={18}/></div>
              </div>
            </div>
            
            <div className="p-3 md:p-5 flex-1 flex flex-col justify-between">
              <div>
                  <h3 className="font-bold text-[#433A31] truncate mb-1 text-xs md:text-base font-serif">{item.name}</h3>
                  <div className="text-[10px] text-[#8C8174] flex items-center gap-1 mb-2"><Box size={10}/> 库存: {item.stock}</div>
              </div>
              <div className="flex justify-between items-end border-t border-[#E0D6C2]/50 pt-2 md:pt-3">
                  <div className="text-sm md:text-lg font-bold text-[#8B7355] font-mono">¥{item.sellingPrice}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {(editingProduct || isAdding) && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-[#2C241B]/30 backdrop-blur-sm" onClick={() => { setEditingProduct(null); setIsAdding(false); }}></div>
          <div className="bg-[#FFFDF9] w-full md:max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-slide-up md:animate-scale-in border-t md:border border-[#E0D6C2] flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#E0D6C2] flex justify-between items-center bg-[#F7F5F0] flex-shrink-0">
              <h3 className="text-lg font-bold font-serif text-[#433A31]">{isAdding ? '添加库存' : '编辑商品'}</h3>
              <button onClick={() => { setEditingProduct(null); setIsAdding(false); }} className="p-2 rounded-full text-[#8C8174] hover:bg-[#EBE5D9]"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              
              {/* Image Upload */}
              <div className="flex justify-center mb-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-2xl bg-[#F2EFE9] border-2 border-dashed border-[#D6CDB8] flex flex-col items-center justify-center text-[#8C8174] cursor-pointer hover:border-[#8B7355] hover:text-[#8B7355] transition-all overflow-hidden relative group"
                  >
                      {formData.image ? (
                          <>
                            <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="text-white" size={24}/>
                            </div>
                          </>
                      ) : (
                          <>
                            <ImageIcon size={24} className="mb-2 opacity-50"/>
                            <span className="text-xs font-bold">上传图片</span>
                          </>
                      )}
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                      />
                  </div>
              </div>

              <div className="space-y-1">
                  <label className="text-xs font-bold text-[#8C8174] uppercase">名称</label>
                  <input required type="text" className="w-full p-3 bg-white border border-[#E0D6C2] rounded-xl outline-none focus:border-[#8B7355] transition-colors" 
                    value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-[#8C8174] uppercase">成本 (¥)</label>
                      <input required type="number" className="w-full p-3 bg-white border border-[#E0D6C2] rounded-xl outline-none focus:border-[#8B7355]" 
                        value={formData.costPrice || ''} onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-[#8C8174] uppercase">零售价 (¥)</label>
                      <input required type="number" className="w-full p-3 bg-white border border-[#E0D6C2] rounded-xl outline-none font-bold text-[#8B7355] focus:border-[#8B7355]" 
                        value={formData.sellingPrice || ''} onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})} />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-[#8C8174] uppercase">库存数量</label>
                      <input required type="number" className="w-full p-3 bg-white border border-[#E0D6C2] rounded-xl outline-none focus:border-[#8B7355]" 
                        value={formData.stock || ''} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-[#8C8174] uppercase">分类</label>
                      <select 
                        className="w-full p-3 bg-white border border-[#E0D6C2] rounded-xl outline-none focus:border-[#8B7355]"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value as any})}
                      >
                          <option value="水晶">水晶</option>
                          <option value="手护耗材">手护耗材</option>
                          <option value="其他">其他</option>
                      </select>
                  </div>
              </div>
              
              <div className="flex gap-3 pt-4 pb-safe">
                  {!isAdding && editingProduct && (
                      <button type="button" onClick={() => setDeleteConfirmId(editingProduct.id)} className="flex-1 bg-[#F2EFE9] text-[#C07765] py-4 rounded-xl font-bold hover:bg-[#E6D4D4] transition-colors flex items-center justify-center gap-2 active:bg-[#C07765] active:text-white">
                          <Trash2 size={18}/> 删除
                      </button>
                  )}
                  <button type="submit" className="flex-[2] bg-[#433A31] text-[#F7F5F0] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#2C241B] shadow-lg"><Save size={18}/> 保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirmId && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}></div>
              <div className="bg-[#FFFDF9] w-full max-w-sm rounded-2xl shadow-2xl relative z-10 p-6 text-center animate-scale-in border border-[#E0D6C2]">
                  <div className="w-12 h-12 bg-[#F2EFE9] rounded-full flex items-center justify-center mx-auto mb-4 text-[#C07765]">
                      <AlertTriangle size={24}/>
                  </div>
                  <h3 className="text-xl font-bold text-[#433A31] font-serif mb-2">确认删除?</h3>
                  <p className="text-[#8C8174] text-sm mb-6">库存记录将被永久删除。</p>
                  <div className="flex gap-3">
                      <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 rounded-xl border border-[#E0D6C2] text-[#5C4D3C] font-bold">取消</button>
                      <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-[#C07765] text-white font-bold shadow-lg">删除</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};