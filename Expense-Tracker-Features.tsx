// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import * as echarts from 'echarts';

const App: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  React.useEffect(() => {
    // Initialize spending trends chart
    const spendingTrendsChart = echarts.init(document.getElementById('spending-trends-chart'));
    const spendingTrendsOption = {
      animation: false,
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['Expenses', 'Income'],
        right: 10,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Expenses',
          type: 'line',
          stack: 'Total',
          data: [1200, 1320, 1010, 1340, 900, 1230],
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255, 99, 132, 0.5)' },
                { offset: 1, color: 'rgba(255, 99, 132, 0.1)' }
              ]
            }
          },
          lineStyle: {
            color: 'rgba(255, 99, 132, 1)'
          },
          itemStyle: {
            color: 'rgba(255, 99, 132, 1)'
          },
          smooth: true
        },
        {
          name: 'Income',
          type: 'line',
          stack: 'Total',
          data: [2200, 1820, 1910, 2340, 2900, 3230],
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(54, 162, 235, 0.5)' },
                { offset: 1, color: 'rgba(54, 162, 235, 0.1)' }
              ]
            }
          },
          lineStyle: {
            color: 'rgba(54, 162, 235, 1)'
          },
          itemStyle: {
            color: 'rgba(54, 162, 235, 1)'
          },
          smooth: true
        }
      ]
    };
    spendingTrendsChart.setOption(spendingTrendsOption);

    // Initialize category breakdown chart
    const categoryChart = echarts.init(document.getElementById('category-breakdown-chart'));
    const categoryOption = {
      animation: false,
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: ${c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: ['Groceries', 'Rent', 'Entertainment', 'Transportation', 'Utilities']
      },
      series: [
        {
          name: 'Expenses',
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
              fontSize: '14',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 450, name: 'Groceries', itemStyle: { color: '#4CAF50' } },
            { value: 1200, name: 'Rent', itemStyle: { color: '#2196F3' } },
            { value: 300, name: 'Entertainment', itemStyle: { color: '#FF9800' } },
            { value: 200, name: 'Transportation', itemStyle: { color: '#9C27B0' } },
            { value: 150, name: 'Utilities', itemStyle: { color: '#F44336' } }
          ]
        }
      ]
    };
    categoryChart.setOption(categoryOption);

    // Handle resize
    const handleResize = () => {
      spendingTrendsChart.resize();
      categoryChart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      spendingTrendsChart.dispose();
      categoryChart.dispose();
    };
  }, []);

  const recentTransactions = [
    { id: 1, date: '2025-05-12', description: 'Whole Foods Market', category: 'Groceries', amount: 87.45, tags: ['Food', 'Organic'] },
    { id: 2, date: '2025-05-11', description: 'Netflix Subscription', category: 'Entertainment', amount: 15.99, tags: ['Subscription'] },
    { id: 3, date: '2025-05-10', description: 'Uber Ride', category: 'Transportation', amount: 24.50, tags: ['Travel'] },
    { id: 4, date: '2025-05-09', description: 'Starbucks Coffee', category: 'Food & Drink', amount: 5.75, tags: ['Coffee'] },
    { id: 5, date: '2025-05-08', description: 'Amazon Purchase', category: 'Shopping', amount: 67.32, tags: ['Online'] },
  ];

  const upcomingPayments = [
    { id: 1, date: '2025-05-15', description: 'Rent Payment', amount: 1200.00, recurring: 'Monthly' },
    { id: 2, date: '2025-05-18', description: 'Car Insurance', amount: 89.99, recurring: 'Monthly' },
    { id: 3, date: '2025-05-20', description: 'Gym Membership', amount: 49.99, recurring: 'Monthly' },
  ];

  const budgetCategories = [
    { id: 1, name: 'Groceries', spent: 450, budget: 500, percentage: 90 },
    { id: 2, name: 'Entertainment', spent: 300, budget: 400, percentage: 75 },
    { id: 3, name: 'Transportation', spent: 200, budget: 300, percentage: 67 },
    { id: 4, name: 'Dining Out', spent: 280, budget: 250, percentage: 112 },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <i className="fas fa-wallet"></i>
            </div>
            <h1 className="text-xl font-bold text-gray-900">ExpenseTracker</h1>
          </div>
        </div>
        
        <div className="p-4">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 !rounded-button whitespace-nowrap cursor-pointer"
            onClick={() => setIsExpenseDialogOpen(true)}
          >
            <i className="fas fa-plus mr-2"></i> Add Expense
          </Button>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            <li>
              <Button 
                variant={activeTab === "dashboard" ? "secondary" : "ghost"} 
                className="w-full justify-start !rounded-button whitespace-nowrap cursor-pointer"
                onClick={() => setActiveTab("dashboard")}
              >
                <i className="fas fa-chart-line mr-3"></i> Dashboard
              </Button>
            </li>
            <li>
              <Button 
                variant={activeTab === "expenses" ? "secondary" : "ghost"} 
                className="w-full justify-start !rounded-button whitespace-nowrap cursor-pointer"
                onClick={() => setActiveTab("expenses")}
              >
                <i className="fas fa-receipt mr-3"></i> Expenses
              </Button>
            </li>
            <li>
              <Button 
                variant={activeTab === "budgets" ? "secondary" : "ghost"} 
                className="w-full justify-start !rounded-button whitespace-nowrap cursor-pointer"
                onClick={() => setActiveTab("budgets")}
              >
                <i className="fas fa-piggy-bank mr-3"></i> Budgets
              </Button>
            </li>
            <li>
              <Button 
                variant={activeTab === "reports" ? "secondary" : "ghost"} 
                className="w-full justify-start !rounded-button whitespace-nowrap cursor-pointer"
                onClick={() => setActiveTab("reports")}
              >
                <i className="fas fa-chart-pie mr-3"></i> Reports
              </Button>
            </li>
            <li>
              <Button 
                variant={activeTab === "categories" ? "secondary" : "ghost"} 
                className="w-full justify-start !rounded-button whitespace-nowrap cursor-pointer"
                onClick={() => setActiveTab("categories")}
              >
                <i className="fas fa-tags mr-3"></i> Categories
              </Button>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="cursor-pointer">
              <AvatarImage src="https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20a%20young%20person%20with%20a%20friendly%20smile%2C%20high%20quality%2C%20professional%20lighting%2C%20neutral%20background%2C%20business%20casual%20attire&width=100&height=100&seq=1&orientation=squarish" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-500">john.doe@example.com</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input 
                  type="search" 
                  placeholder="Search expenses..." 
                  className="pl-10 pr-4 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
              <Button variant="outline" className="!rounded-button whitespace-nowrap cursor-pointer">
                <i className="fas fa-bell mr-2"></i> <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </Button>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          {/* Top Section - Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Monthly Spending</CardTitle>
                <CardDescription>May 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">$2,300</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <i className="fas fa-arrow-up text-red-500 mr-1"></i> 15% from last month
                    </p>
                  </div>
                  <div className="text-5xl text-blue-500">
                    <i className="fas fa-chart-line"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Monthly Budget</CardTitle>
                <CardDescription>May 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">$2,300 / $3,000</p>
                    <Progress value={76} className="h-2 mt-2" />
                    <p className="text-sm text-gray-500 mt-2">76% of budget used</p>
                  </div>
                  <div className="text-5xl text-green-500">
                    <i className="fas fa-piggy-bank"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Manage your expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center p-3 h-auto !rounded-button whitespace-nowrap cursor-pointer"
                    onClick={() => setIsExpenseDialogOpen(true)}
                  >
                    <i className="fas fa-plus text-blue-500 text-xl mb-1"></i>
                    <span className="text-xs">Add Expense</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center p-3 h-auto !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    <i className="fas fa-camera text-purple-500 text-xl mb-1"></i>
                    <span className="text-xs">Scan Receipt</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center p-3 h-auto !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    <i className="fas fa-file-upload text-green-500 text-xl mb-1"></i>
                    <span className="text-xs">Upload</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Middle Section - Charts and Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div id="spending-trends-chart" className="w-full h-80"></div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Current month</CardDescription>
              </CardHeader>
              <CardContent>
                <div id="category-breakdown-chart" className="w-full h-80"></div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest expenses</CardDescription>
                </div>
                <Button variant="outline" className="!rounded-button whitespace-nowrap cursor-pointer">View All</Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <i className={`fas fa-${
                              transaction.category === 'Groceries' ? 'shopping-basket' : 
                              transaction.category === 'Entertainment' ? 'film' :
                              transaction.category === 'Transportation' ? 'car' :
                              transaction.category === 'Food & Drink' ? 'utensils' :
                              'shopping-cart'
                            } text-blue-600`}></i>
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <span>{transaction.date}</span>
                              <span className="mx-2">•</span>
                              <span>{transaction.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${transaction.amount.toFixed(2)}</p>
                          <div className="flex space-x-1 mt-1 justify-end">
                            {transaction.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Payments</CardTitle>
                  <CardDescription>Scheduled expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[180px]">
                    <div className="space-y-3">
                      {upcomingPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium">{payment.description}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <span>{payment.date}</span>
                              <span className="mx-2">•</span>
                              <Badge variant="outline">{payment.recurring}</Badge>
                            </div>
                          </div>
                          <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Budget Status</CardTitle>
                  <CardDescription>Category limits</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[140px]">
                    <div className="space-y-4">
                      {budgetCategories.map((category) => (
                        <div key={category.id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{category.name}</p>
                            <p className="text-sm font-medium">${category.spent} / ${category.budget}</p>
                          </div>
                          <Progress 
                            value={category.percentage} 
                            className={`h-2 ${
                              category.percentage > 100 ? 'bg-red-200' : 
                              category.percentage > 80 ? 'bg-amber-200' : 
                              'bg-blue-200'
                            }`} 
                          />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Bottom Section - Tips */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Smart Money Tips</h3>
                  <p className="text-blue-700 max-w-2xl">Based on your spending habits, you could save up to $150 monthly by reducing coffee shop expenses. Try brewing at home a few days a week!</p>
                </div>
                <div className="hidden md:block">
                  <img 
                    src="https://readdy.ai/api/search-image?query=minimalist%20illustration%20of%20a%20piggy%20bank%20with%20coins%20and%20a%20coffee%20cup%2C%20clean%20design%2C%20soft%20colors%2C%20financial%20concept%2C%20savings%20visualization%2C%20modern%20flat%20design%20style%2C%20simple%20shapes&width=200&height=120&seq=2&orientation=landscape" 
                    alt="Money saving tip" 
                    className="h-24 object-contain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      
      {/* Add Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Enter the details of your expense below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input id="amount" type="number" placeholder="0.00" className="pl-8" />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal !rounded-button whitespace-nowrap cursor-pointer"
                    >
                      <i className="fas fa-calendar-alt mr-2"></i>
                      {date ? format(date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="groceries">Groceries</SelectItem>
                  <SelectItem value="dining">Dining Out</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input id="description" placeholder="What was this expense for?" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea id="notes" placeholder="Add any additional details..." className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">
                Tags
              </Label>
              <Input id="tags" placeholder="Add tags separated by commas" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Receipt
              </Label>
              <div className="col-span-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <i className="fas fa-upload text-gray-400 text-2xl mb-2"></i>
                  <p className="text-sm text-gray-500">Drag & drop a receipt image or <span className="text-blue-500">browse files</span></p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)} className="!rounded-button whitespace-nowrap cursor-pointer">Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 !rounded-button whitespace-nowrap cursor-pointer">Save Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default App;

