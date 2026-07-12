import { useState } from 'react';
import api from '../utils/api';
import { Bot, Send, Sparkles, FileText, Settings, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AIAssistant = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [contextType, setContextType] = useState('general');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'Hello! I am your EcoSphere AI Assistant powered by Gemini. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage = prompt;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setPrompt('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/ask', { prompt: userMessage, contextType });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Is the Gemini API Key configured in the backend?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await api.post('/ai/report');
      setReport(res.data.report);
    } catch (error) {
      alert('Failed to generate report. Ensure Gemini API key is configured.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
          <Bot className="text-emerald-500" size={32} />
          <span>Gemini AI Assistant</span>
        </h1>
        {user?.role === 'ADMIN' && (
          <button 
            onClick={generateReport}
            disabled={isGeneratingReport}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md disabled:opacity-50"
          >
            <Sparkles size={20} className={isGeneratingReport ? 'animate-spin' : ''} /> 
            <span>{isGeneratingReport ? 'Generating...' : 'Generate Monthly ESG Report'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Context Selector Sidebar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col space-y-2 shrink-0 h-fit">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">AI Persona</h3>
          
          <button onClick={() => setContextType('general')} className={`flex items-center space-x-3 p-3 rounded-xl transition-colors text-left ${contextType === 'general' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            <Bot size={20} />
            <div>
              <p className="font-semibold text-sm">General Assistant</p>
              <p className="text-xs opacity-80">General ESG guidance</p>
            </div>
          </button>
          
          <button onClick={() => setContextType('carbon')} className={`flex items-center space-x-3 p-3 rounded-xl transition-colors text-left ${contextType === 'carbon' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            <Leaf size={20} />
            <div>
              <p className="font-semibold text-sm">Carbon Advisor</p>
              <p className="text-xs opacity-80">Analyzes emission data</p>
            </div>
          </button>
          
          <button onClick={() => setContextType('policy')} className={`flex items-center space-x-3 p-3 rounded-xl transition-colors text-left ${contextType === 'policy' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            <FileText size={20} />
            <div>
              <p className="font-semibold text-sm">Policy Summarizer</p>
              <p className="text-xs opacity-80">Explains governance policies</p>
            </div>
          </button>
          
          {(user?.role === 'ADMIN' || user?.role === 'AUDITOR') && (
            <button onClick={() => setContextType('audit')} className={`flex items-center space-x-3 p-3 rounded-xl transition-colors text-left ${contextType === 'audit' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
              <Settings size={20} />
              <div>
                <p className="font-semibold text-sm">Audit Assistant</p>
                <p className="text-xs opacity-80">Analyzes audit risks</p>
              </div>
            </button>
          )}
        </div>

        {/* Chat Area */}
        <div className={`lg:col-span-3 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden ${report ? 'hidden' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none whitespace-pre-wrap'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-none p-4 flex space-x-2 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleAsk} className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex space-x-2 shrink-0">
            <input 
              type="text" 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={`Ask the ${contextType} assistant...`}
              className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
            <button type="submit" disabled={isLoading || !prompt.trim()} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl px-6 flex items-center justify-center transition-colors">
              <Send size={20} />
            </button>
          </form>
        </div>

        {/* Report View */}
        {report && (
          <div className="lg:col-span-3 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <FileText className="text-emerald-500" />
                <span>Generated AI Executive Report</span>
              </h2>
              <button onClick={() => setReport(null)} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">Close Report</button>
            </div>
            <div className="p-8 overflow-y-auto prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: report.replace(/\n/g, '<br/>') }} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AIAssistant;
