import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, Edit, Tag } from 'lucide-react';
import { storage, type Category } from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';

const ICON_OPTIONS = ['Tag', 'ShoppingCart', 'Home', 'Car', 'Utensils', 'Heart', 'Book', 'Smartphone'];
const COLOR_OPTIONS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>(storage.getCategories());
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    icon: 'Tag',
    color: '#3b82f6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }

    if (editingCategory) {
      storage.updateCategory(editingCategory.id, formData);
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    } else {
      storage.addCategory(formData);
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    }

    setCategories(storage.getCategories());
    setIsOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      icon: 'Tag',
      color: '#3b82f6',
    });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    storage.deleteCategory(id);
    setCategories(storage.getCategories());
    toast({
      title: "Success",
      description: "Category deleted successfully",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCategory(null);
              setFormData({
                name: '',
                icon: 'Tag',
                color: '#3b82f6',
              });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit' : 'Add'} Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Food, Transport"
                />
              </div>
              <div>
                <Label>Icon</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.icon === icon
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Tag className="h-5 w-5 mx-auto" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`h-10 rounded-lg border-2 transition-all ${
                        formData.color === color
                          ? 'border-foreground scale-110'
                          : 'border-border hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingCategory ? 'Update' : 'Add'} Category
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.length > 0 ? (
          categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <Tag className="h-5 w-5" style={{ color: category.color }} />
                    </div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="text-center py-12 text-muted-foreground">
              No categories yet. Click "Add Category" to get started!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
