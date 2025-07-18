import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Bot, User, Send, ArrowDown, Sparkles } from 'lucide-react';

// Sample predefined Q&A pairs for the AI advisor demo
const PREDEFINED_QA = [
  {
    question: "How can I reduce my monthly expenses?",
    answer: "Based on your spending patterns, I recommend: 1) Reviewing your subscription services - you're spending $45/month on services you rarely use, 2) Consider meal planning to reduce food delivery costs by 30%, 3) Your utility bills are 15% above average - a programmable thermostat could save you $20-30/month."
  },
  {
    question: "What's the best way to save for retirement?",
    answer: "For your situation, I recommend: 1) Maximize your 401(k) contributions to at least your employer match (currently 5%), 2) Consider opening a Roth IRA for tax-free growth, 3) Based on your age and risk tolerance, aim for 70% stocks and 30% bonds in your portfolio, adjusting as you approach retirement."
  },
  {
    question: "Should I pay off my debt or invest?",
    answer: "Looking at your finances: 1) Prioritize paying off your high-interest credit card debt (18.9% APR) before investing, 2) Continue making minimum payments on your low-interest student loan (3.5% APR), 3) Once high-interest debt is cleared, invest while maintaining student loan payments for optimal financial growth."
  },
  {
    question: "How much should I budget for groceries?",
    answer: "Based on your household size and location: 1) The average grocery spend for similar households is $450-550/month, 2) Your current spending is $650/month, suggesting potential savings, 3) I recommend a target budget of $500/month, which you can achieve by meal planning and buying staples in bulk."
  },
  {
    question: "Is now a good time to buy a house?",
    answer: "Analyzing your financial situation: 1) With your savings of $35,000 and income, you could afford a home in the $250,000-300,000 range, 2) Current interest rates are favorable compared to historical averages, 3) Your rent is increasing 5% annually, making homeownership potentially more economical long-term, 4) Consider starting with a mortgage pre-approval to understand your options better."
  }
];

// Message type definition
type Message = {
  id: number;
  type: 'user' | 'ai';
  content: string;
  isTyping?: boolean;
};

/**
 * AIAdvisorDemo Component
 * 
 * An interactive demonstration of the AI financial advisor feature
 * with simulated conversation and typing animation effects.
 */
const AIAdvisorDemo = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      type: 'ai', 
      content: "Hello! I'm your AI Financial Advisor. How can I help you with your finances today? You can ask me about budgeting, investments, debt management, or financial goals."
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentQAIndex, setCurrentQAIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing animation for AI responses
  const simulateTyping = (text: string) => {
    setIsTyping(true);
    
    // Add a temporary message with the typing indicator
    const typingMessageId = Date.now();
    setMessages(prev => [...prev, { id: typingMessageId, type: 'ai', content: '', isTyping: true }]);
    
    // Simulate typing delay based on message length
    const typingDelay = Math.min(1000, text.length * 20);
    
    setTimeout(() => {
      // Replace typing indicator with actual message
      setMessages(prev => prev.map(msg => 
        msg.id === typingMessageId 
          ? { id: msg.id, type: 'ai', content: text } 
          : msg
      ));
      setIsTyping(false);
    }, typingDelay);
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (inputValue.trim() === '' && !selectedQuestion) return;
    
    const question = selectedQuestion || inputValue;
    const questionId = Date.now();
    
    // Add user message
    setMessages(prev => [...prev, { id: questionId, type: 'user', content: question }]);
    
    // Clear input and selected question
    setInputValue('');
    setSelectedQuestion(null);
    
    // Get the corresponding answer or a default response
    const qaItem = PREDEFINED_QA.find(qa => qa.question === question);
    const answer = qaItem ? qaItem.answer : "That's a great question. Based on your financial profile, I'd need to analyze your specific situation to provide personalized advice. With SpendlyAI's premium features, I can offer detailed insights tailored to your financial data.";
    
    // Simulate AI typing response
    simulateTyping(answer);
  };

  // Handle selecting a predefined question
  const handleSelectQuestion = (question: string) => {
    setSelectedQuestion(question);
    setInputValue(question);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSelectedQuestion(null);
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isTyping) {
      handleSendMessage();
    }
  };

  // Cycle through example questions
  const handleNextExample = () => {
    setCurrentQAIndex((prevIndex) => (prevIndex + 1) % PREDEFINED_QA.length);
  };

  return (
    <Card className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium">AI Financial Advisor</h3>
            <p className="text-xs text-muted-foreground">Personalized financial guidance</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-xs text-primary font-medium">Premium</span>
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '350px', minHeight: '350px' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.type === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg p-3",
                message.type === 'user'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <div className="flex items-start gap-2">
                {message.type === 'ai' && (
                  <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                )}
                <div>
                  {message.isTyping ? (
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
                {message.type === 'user' && (
                  <User className="h-4 w-4 mt-1 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggested questions */}
      <div className="px-4 py-2 bg-muted/30 border-t">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Try asking about:</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs"
            onClick={handleNextExample}
          >
            More examples <ArrowDown className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => handleSelectQuestion(PREDEFINED_QA[currentQAIndex].question)}
          >
            {PREDEFINED_QA[currentQAIndex].question}
          </Button>
        </div>
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t flex items-center gap-2">
        <Input
          placeholder="Ask a financial question..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={isTyping}
          className="flex-1"
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={isTyping || (!inputValue.trim() && !selectedQuestion)}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default AIAdvisorDemo;