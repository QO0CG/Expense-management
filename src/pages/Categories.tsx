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
import { 
  Plus, 
  Trash2, 
  Edit, 
  Tag, 
  ShoppingCart, 
  Home, 
  Car, 
  Utensils, 
  Heart, 
  Book, 
  Smartphone,
  Plane,
  Coffee,
  Gift,
  Music,
  Film,
  Gamepad2,
  Shirt,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Baby,
  PawPrint,
  Fuel,
  Lightbulb,
  Wifi,
  CreditCard,
  Banknote,
  PiggyBank,
  Receipt,
  ShoppingBag,
  Pizza,
  Wine,
  Pill,
  Stethoscope,
  Scissors,
  Wrench,
  Hammer,
  Bus,
  Train,
  Bike,
  type LucideIcon
} from 'lucide-react';
import { storage, type Category } from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const ICON_MAP: Record<string, LucideIcon> = {
  Tag,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Heart,
  Book,
  Smartphone,
  Plane,
  Coffee,
  Gift,
  Music,
  Film,
  Gamepad2,
  Shirt,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Baby,
  PawPrint,
  Fuel,
  Lightbulb,
  Wifi,
  CreditCard,
  Banknote,
  PiggyBank,
  Receipt,
  ShoppingBag,
  Pizza,
  Wine,
  Pill,
  Stethoscope,
  Scissors,
  Wrench,
  Hammer,
  Bus,
  Train,
  Bike,
};

const ICON_OPTIONS = Object.keys(ICON_MAP);
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

  const renderIcon = (iconName: string, color?: string, size: string = 'h-5 w-5') => {
    const IconComponent = ICON_MAP[iconName] || Tag;
    return <IconComponent className={size} style={color ? { color } : undefined} />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Categories</h1>
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
          <DialogContent className="max-w-md">
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
                <ScrollArea className="h-[200px] mt-2 rounded-lg border border-border p-2">
                  <div className="grid grid-cols-6 gap-2">
                    {ICON_OPTIONS.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: iconName })}
                        className={`p-2.5 rounded-lg border-2 transition-all flex items-center justify-center ${
                          formData.icon === iconName
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        title={iconName}
                      >
                        {renderIcon(iconName, formData.icon === iconName ? formData.color : undefined)}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-8 gap-2 mt-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`h-8 w-8 rounded-lg border-2 transition-all ${
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

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {categories.length > 0 ? (
          categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      {renderIcon(category.icon, category.color)}
                    </div>
                    <CardTitle className="text-lg truncate">{category.name}</CardTitle>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
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
