// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';
const App: React.FC = () => {
const [activeTab, setActiveTab] = useState("week");
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [editingCategory, setEditingCategory] = useState<any>(null);
const [editForm, setEditForm] = useState({
  name: '',
  budget: 0,
  icon: '',
  color: ''
});

const handleEditSubmit = () => {
  // Here you would typically update the category in your data store
  const updatedCategories = categories.map(cat => 
    cat.name === editingCategory.name ? { ...cat, ...editForm } : cat
  );
  // Update your state/data here
  setIsEditModalOpen(false);
  setEditingCategory(null);
};

useEffect(() => {
  if (editingCategory) {
    setEditForm({
      name: editingCategory.name,
      budget: editingCategory.budget,
      icon: editingCategory.icon,
      color: editingCategory.color
    });
  }
}, [editingCategory]);
const donutChartRef = useRef<HTMLDivElement>(null);
const barChartRef = useRef<HTMLDivElement>(null);
const trendChartRef = useRef<HTMLDivElement>(null);
// Categories with colors
const categories = [
{ name: "Food & Dining", color: "#4F46E5", spent: 450, budget: 600, icon: "fa-utensils" },
{ name: "Transport", color: "#10B981", spent: 220, budget: 300, icon: "fa-car" },
{ name: "Shopping", color: "#F59E0B", spent: 380, budget: 350, icon: "fa-shopping-bag" },
{ name: "Entertainment", color: "#EC4899", spent: 180, budget: 200, icon: "fa-film" },
{ name: "Housing", color: "#6366F1", spent: 1200, budget: 1500, icon: "fa-home" },
{ name: "Utilities", color: "#14B8A6", spent: 250, budget: 300, icon: "fa-bolt" },
];
const totalSpent = categories.reduce((acc, cat) => acc + cat.spent, 0);
const totalBudget = categories.reduce((acc, cat) => acc + cat.budget, 0);
// Daily spending data
const dailySpending = {
week: [120, 85, 190, 110, 150, 95, 130],
month: [420, 385, 490, 510, 450, 395, 430, 380, 420, 460, 390, 410, 440, 370, 420, 390, 450, 480, 410, 390, 420, 460, 430, 410, 380, 420, 450, 390],
year: [1200, 1350, 1450, 1300, 1500, 1250, 1400, 1350, 1500, 1600, 1450, 1550]
};
const timeLabels = {
week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
month: Array.from({ length: 28 }, (_, i) => `${i + 1}`),
year: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
};
useEffect(() => {
// Donut chart
if (donutChartRef.current) {
const donutChart = echarts.init(donutChartRef.current);
const option = {
animation: false,
tooltip: {
trigger: 'item',
formatter: '{a} <br/>{b}: ${c} ({d}%)'
},
legend: {
orient: 'vertical',
right: 10,
top: 'center',
data: categories.map(cat => cat.name)
},
series: [
{
name: 'Expense Distribution',
type: 'pie',
radius: ['50%', '70%'],
avoidLabelOverlap: false,
itemStyle: {
borderRadius: 10,
borderColor: '#fff',
borderWidth: 2
},
label: {
show: false,
position: 'center'
},
emphasis: {
label: {
show: true,
fontSize: '18',
fontWeight: 'bold'
}
},
labelLine: {
show: false
},
data: categories.map(cat => ({
value: cat.spent,
name: cat.name,
itemStyle: {
color: cat.color
}
}))
}
]
};
donutChart.setOption(option);
const handleResize = () => {
donutChart.resize();
};
window.addEventListener('resize', handleResize);
return () => {
window.removeEventListener('resize', handleResize);
donutChart.dispose();
};
}
}, []);
useEffect(() => {
// Bar chart
if (barChartRef.current) {
const barChart = echarts.init(barChartRef.current);
const option = {
animation: false,
tooltip: {
trigger: 'axis',
axisPointer: {
type: 'shadow'
},
formatter: function(params: any) {
return `${params[0].name}: $${params[0].value}`;
}
},
grid: {
left: '3%',
right: '4%',
bottom: '3%',
containLabel: true
},
xAxis: [
{
type: 'category',
data: timeLabels[activeTab as keyof typeof timeLabels],
axisTick: {
alignWithLabel: true
}
}
],
yAxis: [
{
type: 'value',
axisLabel: {
formatter: '${value}'
}
}
],
series: [
{
name: 'Spending',
type: 'bar',
barWidth: '60%',
data: dailySpending[activeTab as keyof typeof dailySpending],
itemStyle: {
color: '#4F46E5'
}
}
]
};
barChart.setOption(option);
const handleResize = () => {
barChart.resize();
};
window.addEventListener('resize', handleResize);
return () => {
window.removeEventListener('resize', handleResize);
barChart.dispose();
};
}
}, [activeTab]);
useEffect(() => {
// Mini trend chart
if (trendChartRef.current) {
const trendChart = echarts.init(trendChartRef.current);
const option = {
animation: false,
grid: {
top: 5,
right: 5,
bottom: 5,
left: 5
},
xAxis: {
type: 'category',
data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
show: false
},
yAxis: {
type: 'value',
show: false
},
series: [
{
data: [820, 932, 901, 934, 1290, 1330, 1320],
type: 'line',
smooth: true,
symbol: 'none',
lineStyle: {
color: '#10B981',
width: 3
},
areaStyle: {
color: {
type: 'linear',
x: 0,
y: 0,
x2: 0,
y2: 1,
colorStops: [
{
offset: 0,
color: 'rgba(16, 185, 129, 0.4)'
},
{
offset: 1,
color: 'rgba(16, 185, 129, 0.1)'
}
]
}
}
}
]
};
trendChart.setOption(option);
const handleResize = () => {
trendChart.resize();
};
window.addEventListener('resize', handleResize);
return () => {
window.removeEventListener('resize', handleResize);
trendChart.dispose();
};
}
}, []);
return (
<div className="min-h-screen bg-gray-50">
{/* Navigation Bar */}
<header className="bg-white border-b border-gray-200 sticky top-0 z-10">
<div className="container mx-auto px-4 py-3 flex items-center justify-between">
<div className="flex items-center">
<div className="text-2xl font-bold text-indigo-600 flex items-center">
<i className="fas fa-wallet mr-2"></i>
<span>BudgetTrack</span>
</div>
<nav className="hidden md:flex ml-10">
<a href="#" className="text-indigo-600 font-medium px-4 py-2 rounded-md bg-indigo-50">Dashboard</a>
<a href="#" className="text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-md hover:bg-gray-100">Transactions</a>
<a href="#" className="text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-md hover:bg-gray-100">Budgets</a>
<a href="#" className="text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-md hover:bg-gray-100">Reports</a>
</nav>
</div>
<div className="flex items-center">
<button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full cursor-pointer">
<i className="fas fa-bell"></i>
</button>
<Avatar className="ml-4 cursor-pointer">
<AvatarImage src="https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20a%20young%20person%20with%20a%20friendly%20smile%2C%20clean%20background%2C%20high%20quality%20professional%20headshot&width=100&height=100&seq=avatar1&orientation=squarish" />
<AvatarFallback>JP</AvatarFallback>
</Avatar>
</div>
</div>
</header>
<main className="container mx-auto px-4 py-6">
{/* Financial Overview Section */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
<Card className="col-span-1 lg:col-span-2">
<CardHeader className="pb-2">
<CardTitle className="text-xl text-gray-700">Financial Overview</CardTitle>
</CardHeader>
<CardContent>
<div className="flex flex-col md:flex-row justify-between">
<div>
<p className="text-sm text-gray-500 mb-1">Total Balance</p>
<h2 className="text-3xl font-bold text-gray-900">${(totalBudget - totalSpent).toLocaleString()}</h2>
<div className="flex items-center mt-2">
<Badge className="bg-green-100 text-green-800 hover:bg-green-100">
<i className="fas fa-arrow-up mr-1"></i> 12% from last month
</Badge>
</div>
</div>
<div className="mt-4 md:mt-0">
<div className="flex items-center mb-2">
<div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
<span className="text-sm text-gray-600">Income: </span>
<span className="text-sm font-medium ml-1">${totalBudget.toLocaleString()}</span>
</div>
<div className="flex items-center">
<div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
<span className="text-sm text-gray-600">Expenses: </span>
<span className="text-sm font-medium ml-1">${totalSpent.toLocaleString()}</span>
</div>
</div>
<div className="mt-4 md:mt-0 w-full md:w-1/3 h-20">
<div ref={trendChartRef} className="w-full h-full"></div>
</div>
</div>
<div className="flex mt-6 space-x-3">
<Button className="bg-indigo-600 hover:bg-indigo-700 !rounded-button whitespace-nowrap cursor-pointer">
<i className="fas fa-plus mr-2"></i> Add Transaction
</Button>
<Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 !rounded-button whitespace-nowrap cursor-pointer">
<i className="fas fa-file-export mr-2"></i> Export
</Button>
</div>
</CardContent>
</Card>
<Card>
<CardHeader className="pb-2">
<CardTitle className="text-xl text-gray-700">This Month</CardTitle>
</CardHeader>
<CardContent>
<div className="space-y-4">
<div>
<div className="flex justify-between mb-1">
<span className="text-sm text-gray-500">Budget Used</span>
<span className="text-sm font-medium">{Math.round((totalSpent / totalBudget) * 100)}%</span>
</div>
<Progress value={(totalSpent / totalBudget) * 100} className="h-2" />
</div>
<div>
<div className="flex justify-between mb-1">
<span className="text-sm text-gray-500">Top Spending</span>
<span className="text-sm font-medium text-indigo-600">Housing</span>
</div>
<div className="flex items-center">
<i className="fas fa-home text-indigo-600 mr-2"></i>
<Progress value={80} className="h-2 flex-grow" />
<span className="ml-2 text-sm font-medium">$1,200</span>
</div>
</div>
<div className="pt-2">
<div className="flex justify-between mb-1">
<span className="text-sm text-gray-500">Upcoming Bills</span>
<Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">3 due soon</Badge>
</div>
<div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
<div className="flex items-center">
<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
<i className="fas fa-bolt"></i>
</div>
<div className="ml-2">
<p className="text-sm font-medium">Electricity</p>
<p className="text-xs text-gray-500">Due in 3 days</p>
</div>
</div>
<span className="font-medium">$85</span>
</div>
</div>
</div>
</CardContent>
</Card>
</div>
{/* Expense Categories */}
<h2 className="text-xl font-semibold text-gray-800 mb-4">Expense Categories</h2>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
{categories.map((category, index) => (
<Card key={index} className="overflow-hidden">
<CardContent className="p-5">
<div className="flex items-start justify-between">
<div className="flex items-center">
<div
className="w-10 h-10 rounded-full flex items-center justify-center text-white"
style={{ backgroundColor: category.color }}
>
<i className={`fas ${category.icon}`}></i>
</div>
<div className="ml-3">
<h3 className="font-medium">{category.name}</h3>
<p className="text-sm text-gray-500">${category.spent} of ${category.budget}</p>
</div>
</div>
<Badge
className={`${
category.spent > category.budget
? 'bg-red-100 text-red-800'
: category.spent > category.budget * 0.8
? 'bg-amber-100 text-amber-800'
: 'bg-green-100 text-green-800'
} hover:bg-opacity-90`}
>
{Math.round((category.spent / category.budget) * 100)}%
</Badge>
</div>
<div className="mt-4">
<Progress
value={(category.spent / category.budget) * 100}
className="h-2"
style={{
backgroundColor: `${category.color}20`,
'--tw-progress-fill': category.color
} as React.CSSProperties}
/>
</div>
</CardContent>
</Card>
))}
</div>
{/* Spending Analytics */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
<Card>
<CardHeader>
<CardTitle className="text-xl text-gray-700">Expense Distribution</CardTitle>
</CardHeader>
<CardContent>
<div ref={donutChartRef} style={{ height: '300px' }}></div>
</CardContent>
</Card>
<Card>
<CardHeader className="flex flex-row items-center justify-between">
<CardTitle className="text-xl text-gray-700">Spending Trends</CardTitle>
<Tabs defaultValue="week" value={activeTab} onValueChange={setActiveTab}>
<TabsList>
<TabsTrigger value="week" className="!rounded-button whitespace-nowrap cursor-pointer">Week</TabsTrigger>
<TabsTrigger value="month" className="!rounded-button whitespace-nowrap cursor-pointer">Month</TabsTrigger>
<TabsTrigger value="year" className="!rounded-button whitespace-nowrap cursor-pointer">Year</TabsTrigger>
</TabsList>
</Tabs>
</CardHeader>
<CardContent>
<div ref={barChartRef} style={{ height: '300px' }}></div>
</CardContent>
</Card>
</div>
{/* Budget Status Cards */}
<h2 className="text-xl font-semibold text-gray-800 mb-4">Budget Status</h2>
<ScrollArea className="w-full whitespace-nowrap pb-4 mb-8">
<div className="flex space-x-4 pb-2">
{categories.map((category, index) => {
const isOverBudget = category.spent > category.budget;
const isNearLimit = category.spent > category.budget * 0.8;
return (
<Card key={index} className={`min-w-[250px] ${isOverBudget ? 'border-red-300' : ''}`}>
<CardContent className="p-5">
<div className="flex items-center justify-between mb-3">
<div className="flex items-center">
<div
className="w-8 h-8 rounded-full flex items-center justify-center text-white"
style={{ backgroundColor: category.color }}
>
<i className={`fas ${category.icon}`}></i>
</div>
<h3 className="font-medium ml-2">{category.name}</h3>
</div>
{isOverBudget && (
<Badge className="bg-red-100 text-red-800 hover:bg-red-100">
<i className="fas fa-exclamation-circle mr-1"></i> Over Budget
</Badge>
)}
</div>
<div className="mb-2">
<div className="flex justify-between text-sm mb-1">
<span>${category.spent}</span>
<span>${category.budget}</span>
</div>
<Progress
value={(category.spent / category.budget) * 100}
className="h-2"
style={{
backgroundColor: `${category.color}20`,
'--tw-progress-fill': isOverBudget ? '#EF4444' : isNearLimit ? '#F59E0B' : category.color
} as React.CSSProperties}
/>
</div>
<div className="flex justify-between items-center">
<span className="text-xs text-gray-500">
{isOverBudget
? `$${(category.spent - category.budget).toFixed(0)} over limit`
: `$${(category.budget - category.spent).toFixed(0)} remaining`}
</span>
<Button 
  variant="ghost" 
  size="sm" 
  className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1 h-auto !rounded-button whitespace-nowrap cursor-pointer"
  onClick={() => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  }}
>
  <i className="fas fa-pen text-xs"></i>
</Button>
</div>
</CardContent>
</Card>
);
})}
</div>
</ScrollArea>
{/* Recent Transactions */}
<div className="grid grid-cols-1 gap-6">
<Card>
<CardHeader className="flex flex-row items-center justify-between">
<CardTitle className="text-xl text-gray-700">Recent Transactions</CardTitle>
<Button variant="outline" size="sm" className="text-indigo-600 border-indigo-600 hover:bg-indigo-50 !rounded-button whitespace-nowrap cursor-pointer">
View All
</Button>
</CardHeader>
<CardContent>
<div className="space-y-4">
{[
{ name: "Grocery Store", category: "Food & Dining", amount: 78.35, date: "Today", icon: "fa-shopping-basket", color: "#4F46E5" },
{ name: "Netflix Subscription", category: "Entertainment", amount: 13.99, date: "Yesterday", icon: "fa-film", color: "#EC4899" },
{ name: "Gas Station", category: "Transport", amount: 45.50, date: "Apr 15", icon: "fa-gas-pump", color: "#10B981" },
{ name: "Coffee Shop", category: "Food & Dining", amount: 4.75, date: "Apr 15", icon: "fa-coffee", color: "#4F46E5" },
{ name: "Online Purchase", category: "Shopping", amount: 129.99, date: "Apr 14", icon: "fa-shopping-bag", color: "#F59E0B" }
].map((transaction, index) => (
<div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
<div className="flex items-center">
<div
className="w-10 h-10 rounded-full flex items-center justify-center text-white"
style={{ backgroundColor: transaction.color }}
>
<i className={`fas ${transaction.icon}`}></i>
</div>
<div className="ml-3">
<h4 className="font-medium">{transaction.name}</h4>
<p className="text-sm text-gray-500">{transaction.category} • {transaction.date}</p>
</div>
</div>
<span className="font-medium">-${transaction.amount.toFixed(2)}</span>
</div>
))}
</div>
</CardContent>
</Card>
</div>
</main>
{/* Floating Action Button */}
<div className="fixed bottom-6 right-6">
<div className="relative group">
<Button className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg flex items-center justify-center text-xl !rounded-button whitespace-nowrap cursor-pointer">
<i className="fas fa-plus"></i>
</Button>
<div className="absolute bottom-16 right-0 hidden group-hover:block">
<div className="bg-white rounded-lg shadow-lg p-2 flex flex-col items-end space-y-2">
<Button className="bg-indigo-600 hover:bg-indigo-700 !rounded-button whitespace-nowrap cursor-pointer">
<i className="fas fa-receipt mr-2"></i> New Expense
</Button>
<Button className="bg-green-600 hover:bg-green-700 !rounded-button whitespace-nowrap cursor-pointer">
<i className="fas fa-money-bill-wave mr-2"></i> New Income
</Button>
<Button className="bg-amber-500 hover:bg-amber-600 !rounded-button whitespace-nowrap cursor-pointer">
<i className="fas fa-sliders-h mr-2"></i> Set Budget
</Button>
</div>
</div>
</div>
</div>

{/* Edit Category Modal */}
{isEditModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Edit Category</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditModalOpen(false)}
          className="!rounded-button"
        >
          <i className="fas fa-times"></i>
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Name
          </label>
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget Amount
          </label>
          <input
            type="number"
            value={editForm.budget}
            onChange={(e) => setEditForm({...editForm, budget: Number(e.target.value)})}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <input
            type="color"
            value={editForm.color}
            onChange={(e) => setEditForm({...editForm, color: e.target.value})}
            className="w-full h-10 p-1 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Icon
          </label>
          <select
            value={editForm.icon}
            onChange={(e) => setEditForm({...editForm, icon: e.target.value})}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="fa-utensils">Food & Dining</option>
            <option value="fa-car">Transport</option>
            <option value="fa-shopping-bag">Shopping</option>
            <option value="fa-film">Entertainment</option>
            <option value="fa-home">Housing</option>
            <option value="fa-bolt">Utilities</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button
          variant="destructive"
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this category?')) {
              // Handle delete
              setIsEditModalOpen(false);
            }
          }}
          className="!rounded-button"
        >
          Delete
        </Button>
        
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(false)}
            className="!rounded-button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white !rounded-button"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  </div>
)}
</div>
);
}
export default App
