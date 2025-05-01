import React, { useEffect, useState } from 'react';
import { Card, Form, Input, InputNumber, DatePicker, Select, Button, List, Progress, Typography, message } from 'antd';
import { PlusOutlined, BulbOutlined } from '@ant-design/icons';
import { financialGoalsService } from '../services/financialGoalsService';
import { FinancialGoal } from '../types/financial';

const { Title, Text } = Typography;
const { Option } = Select;

const FinancialGoals: React.FC = () => {
  const [form] = Form.useForm();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [suggestions, setSuggestions] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGoals();
    fetchSuggestions();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await financialGoalsService.getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
      message.error('Failed to fetch goals');
    }
  };

  const fetchSuggestions = async () => {
    try {
      const data = await financialGoalsService.getSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      message.error('Failed to fetch suggestions');
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const newGoal: FinancialGoal = {
        name: values.name,
        target_amount: values.targetAmount,
        current_amount: values.currentAmount || 0,
        deadline: values.deadline.toISOString(),
        type: values.type,
        category: values.category,
        notes: values.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await financialGoalsService.addGoal(newGoal);
      message.success('Goal added successfully');
      form.resetFields();
      fetchGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
      message.error('Failed to add goal');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: FinancialGoal) => {
    form.setFieldsValue({
      name: suggestion.name,
      targetAmount: suggestion.target_amount,
      currentAmount: suggestion.current_amount,
      deadline: new Date(suggestion.deadline),
      type: suggestion.type,
      category: suggestion.category,
      notes: suggestion.notes
    });
  };

  return (
    <div className="p-6">
      <Title level={2}>Financial Goals</Title>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Add New Goal" className="shadow-md">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Goal Name"
              rules={[{ required: true, message: 'Please enter a goal name' }]}
            >
              <Input placeholder="e.g., Emergency Fund" />
            </Form.Item>

            <Form.Item
              name="targetAmount"
              label="Target Amount"
              rules={[{ required: true, message: 'Please enter a target amount' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                placeholder="Enter target amount"
              />
            </Form.Item>

            <Form.Item
              name="currentAmount"
              label="Current Amount"
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                placeholder="Enter current amount"
              />
            </Form.Item>

            <Form.Item
              name="deadline"
              label="Deadline"
              rules={[{ required: true, message: 'Please select a deadline' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="type"
              label="Goal Type"
              rules={[{ required: true, message: 'Please select a goal type' }]}
            >
              <Select placeholder="Select goal type">
                <Option value="savings">Savings</Option>
                <Option value="investment">Investment</Option>
                <Option value="debt">Debt Repayment</Option>
                <Option value="purchase">Major Purchase</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select placeholder="Select category">
                <Option value="emergency">Emergency Fund</Option>
                <Option value="retirement">Retirement</Option>
                <Option value="education">Education</Option>
                <Option value="home">Home</Option>
                <Option value="travel">Travel</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="notes"
              label="Notes"
            >
              <Input.TextArea rows={4} placeholder="Add any additional notes" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>
                Add Goal
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Goal Suggestions" className="shadow-md">
          <List
            dataSource={suggestions}
            renderItem={suggestion => (
              <List.Item
                className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <Text strong>{suggestion.name}</Text>
                    <Text type="secondary">{suggestion.type}</Text>
                  </div>
                  <Progress
                    percent={Math.round((suggestion.current_amount / suggestion.target_amount) * 100)}
                    status="active"
                  />
                  <Text type="secondary">
                    Target: ${suggestion.target_amount.toLocaleString()}
                  </Text>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </div>

      <Card title="Your Goals" className="mt-6 shadow-md">
        <List
          dataSource={goals}
          renderItem={goal => (
            <List.Item>
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <Text strong>{goal.name}</Text>
                  <Text type="secondary">{goal.type}</Text>
                </div>
                <Progress
                  percent={Math.round((goal.current_amount / goal.target_amount) * 100)}
                  status="active"
                />
                <div className="flex justify-between mt-2">
                  <Text type="secondary">
                    Current: ${goal.current_amount.toLocaleString()}
                  </Text>
                  <Text type="secondary">
                    Target: ${goal.target_amount.toLocaleString()}
                  </Text>
                </div>
                {goal.notes && (
                  <Text type="secondary" className="block mt-2">
                    {goal.notes}
                  </Text>
                )}
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default FinancialGoals; 