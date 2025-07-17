// Mock data for Indifly Ventures Legal Assistant

export const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  isLoggedIn: false
};

export const mockChats = [
  {
    id: '1',
    title: 'Contract Review Questions',
    timestamp: '2024-01-15T10:30:00Z',
    messages: [
      {
        id: '1',
        type: 'user',
        content: 'Can you help me review this employment contract?',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        type: 'bot',
        content: 'I\'d be happy to help you review your employment contract. Please upload the document and I\'ll analyze the key terms, potential concerns, and provide recommendations.',
        timestamp: '2024-01-15T10:31:00Z'
      },
      {
        id: '3',
        type: 'user',
        content: 'Here\'s the contract document.',
        timestamp: '2024-01-15T10:32:00Z',
        fileName: 'employment_contract.pdf'
      },
      {
        id: '4',
        type: 'bot',
        content: 'I\'ve analyzed your employment contract. Here are the key findings:\n\n1. **Compensation**: The salary and benefits appear standard for your role\n2. **Non-compete clause**: The 12-month restriction may be enforceable but seems reasonable\n3. **Termination**: Notice period is 30 days, which is standard\n4. **Intellectual property**: All work products belong to the company\n\nWould you like me to elaborate on any specific section?',
        timestamp: '2024-01-15T10:35:00Z'
      }
    ]
  },
  {
    id: '2',
    title: 'Business Formation Advice',
    timestamp: '2024-01-14T14:20:00Z',
    messages: [
      {
        id: '1',
        type: 'user',
        content: 'I\'m starting a tech company. Should I incorporate as LLC or Corporation?',
        timestamp: '2024-01-14T14:20:00Z'
      },
      {
        id: '2',
        type: 'bot',
        content: 'Great question! The choice between LLC and Corporation depends on several factors:\n\n**LLC Benefits:**\n- Pass-through taxation\n- Flexible management structure\n- Fewer formalities\n\n**Corporation Benefits:**\n- Better for raising capital\n- Stock options for employees\n- Potential tax advantages\n\nFor a tech startup planning to raise funding, I typically recommend a Delaware C-Corporation. Would you like me to explain why?',
        timestamp: '2024-01-14T14:22:00Z'
      }
    ]
  },
  {
    id: '3',
    title: 'Privacy Policy Review',
    timestamp: '2024-01-13T09:15:00Z',
    messages: [
      {
        id: '1',
        type: 'user',
        content: 'I need help updating our privacy policy for GDPR compliance.',
        timestamp: '2024-01-13T09:15:00Z'
      },
      {
        id: '2',
        type: 'bot',
        content: 'I can help you ensure your privacy policy is GDPR compliant. Key areas to address:\n\n1. **Legal basis for processing**\n2. **Data subject rights**\n3. **Data retention periods**\n4. **Third-party data sharing**\n5. **Contact information for DPO**\n\nCould you share your current privacy policy so I can provide specific recommendations?',
        timestamp: '2024-01-13T09:17:00Z'
      }
    ]
  }
];

export const mockBotResponses = [
  "I'm analyzing your request. Please give me a moment to provide a comprehensive legal analysis.",
  "Based on my review of relevant legal precedents and statutes, here's my assessment...",
  "Let me break down the key legal considerations for your situation...",
  "I'd be happy to help you with this legal matter. Here's what you should know...",
  "From a legal perspective, there are several important factors to consider..."
];

export const generateMockResponse = (userMessage) => {
  const responses = mockBotResponses;
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(randomResponse + "\n\nThis is a mock response. In the full version, I would provide detailed legal analysis based on your specific question: \"" + userMessage + "\"");
    }, 1500 + Math.random() * 1000);
  });
};

export const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const generateChatId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const generateMessageId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};